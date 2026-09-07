import "server-only"

import { transformImage } from "@/lib/cloudflare-images"
import {
  copyR2Object,
  getR2ObjectBuffer,
  putR2Object,
} from "@/lib/r2"
import {
  getImageDimensions,
  requireHumanMediaReview,
  screenImageWithGemini,
  stripExifAndGps,
  type SafetyScreeningResult,
} from "@/lib/safety/moderation"
import { extensionForMime } from "./constants"
import type { MediaUploadSession } from "./upload-session"

const MAX_IMAGE_EDGE = 12_000
const MAX_IMAGE_PIXELS = 40_000_000

export interface PreparedContributionMedia {
  session_id: string
  source_key: string
  original_key: string
  display_key: string
  mime: string
  media_type: "image" | "audio" | "video"
  safety: SafetyScreeningResult
  temporary_keys: string[]
}

export async function prepareMemberContributionMedia(
  session: MediaUploadSession,
): Promise<PreparedContributionMedia> {
  if (session.media_type !== "image") {
    return {
      session_id: session.id,
      source_key: session.r2_key,
      original_key: session.r2_key,
      display_key: session.r2_key,
      mime: session.mime_type,
      media_type: session.media_type,
      safety: requireHumanMediaReview(
        "Audio or video is held for caretaker approval; automated media analysis was not run.",
      ),
      temporary_keys: [],
    }
  }

  const original = await getR2ObjectBuffer(session.r2_key)
  const isHeic = session.mime_type === "image/heic" || session.mime_type === "image/heif"
  let display: Buffer
  let displayMime: string
  try {
    display = isHeic
      ? await transformImage(original.body, { format: "image/webp", quality: 85 })
      : Buffer.from(stripExifAndGps(original.body, session.mime_type))
    displayMime = isHeic ? "image/webp" : session.mime_type
  } catch {
    throw new Error("IMAGE_SANITIZATION_FAILED")
  }

  const dimensions = getImageDimensions(display, displayMime)
  if (
    !dimensions || dimensions.width < 1 || dimensions.height < 1 ||
    dimensions.width > MAX_IMAGE_EDGE || dimensions.height > MAX_IMAGE_EDGE ||
    dimensions.width * dimensions.height > MAX_IMAGE_PIXELS
  ) throw new Error("INVALID_IMAGE_DIMENSIONS")

  const displayKey = `quarantine/${session.memorial_id}/display/${session.id}.${extensionForMime(displayMime)}`
  await putR2Object(displayKey, display, displayMime, "private, no-store")
  return {
    session_id: session.id,
    source_key: session.r2_key,
    original_key: session.r2_key,
    display_key: displayKey,
    mime: session.mime_type,
    media_type: "image",
    safety: await screenImageWithGemini(display, displayMime),
    temporary_keys: [displayKey],
  }
}

export async function promotePreparedMemberMedia(
  record: PreparedContributionMedia,
  memorialId: string,
): Promise<PreparedContributionMedia> {
  const displayExtension = record.display_key.split(".").pop() || extensionForMime(record.mime)
  const originalExtension = record.original_key.split(".").pop() || extensionForMime(record.mime)
  const displayKey = `memorials/${memorialId}/community/${record.session_id}.${displayExtension}`
  const originalKey = record.display_key === record.original_key
    ? displayKey
    : `originals/${memorialId}/community/${record.session_id}.${originalExtension}`

  await copyR2Object(record.display_key, displayKey)
  if (originalKey !== displayKey) await copyR2Object(record.original_key, originalKey)
  return {
    ...record,
    display_key: displayKey,
    original_key: originalKey,
    temporary_keys: [...new Set([...record.temporary_keys, record.source_key])],
  }
}

