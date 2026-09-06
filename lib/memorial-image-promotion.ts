import "server-only"

import { transformImage } from "@/lib/cloudflare-images"
import {
  copyR2Object,
  deleteR2Object,
  getR2ObjectPrefixBuffer,
  getR2ObjectWebStream,
  inspectR2Object,
  putR2Object,
} from "@/lib/r2"
import { validateMagicBytes } from "@/lib/safety/moderation"

const MAX_MEMORIAL_IMAGE_BYTES = 15 * 1024 * 1024
type MemorialImageFolder = "portraits" | "gallery" | "timeline"

function extensionForImageMime(mime: string): string {
  if (mime === "image/png") return "png"
  if (mime === "image/webp") return "webp"
  if (mime === "image/gif") return "gif"
  return "jpg"
}

export function archivalHeicKeyForDisplay(displayKey: string): string | null {
  const match = displayKey.match(/^memorials\/([^/]+)\/(portraits|gallery|timeline|community)\/([^/]+)\.webp$/i)
  return match ? `originals/${match[1]}/${match[2]}/${match[3]}.heic` : null
}

/**
 * Validates a direct-R2 caretaker image before making it public. HEIC/HEIF is
 * retained unchanged under originals/ and transcoded through the Images
 * binding; ordinary web-native images keep a single canonical object.
 */
export async function promoteStagedMemorialImage(
  stagingKey: string,
  memorialId: string,
  folder: MemorialImageFolder,
): Promise<{ displayKey: string; originalKey: string; isDerivative: boolean }> {
  if (!stagingKey.startsWith(`dashboard-staging/${memorialId}/`)) {
    throw new Error("Invalid staged memorial image")
  }

  const object = await inspectR2Object(stagingKey)
  if (object.contentLength < 1 || object.contentLength > MAX_MEMORIAL_IMAGE_BYTES) {
    throw new Error("Invalid memorial image size")
  }
  const prefix = await getR2ObjectPrefixBuffer(stagingKey, 8192)
  const validation = validateMagicBytes(prefix, stagingKey, object.contentType)
  if (!validation.valid || validation.mediaType !== "image") {
    throw new Error("Uploaded object is not a supported image")
  }

  const assetId = crypto.randomUUID()
  const isHeic = validation.detectedMime === "image/heic" || validation.detectedMime === "image/heif"
  if (!isHeic) {
    const displayKey = `memorials/${memorialId}/${folder}/${assetId}.${extensionForImageMime(validation.detectedMime)}`
    await copyR2Object(stagingKey, displayKey, validation.detectedMime)
    return { displayKey, originalKey: displayKey, isDerivative: false }
  }

  const originalKey = `originals/${memorialId}/${folder}/${assetId}.heic`
  const displayKey = `memorials/${memorialId}/${folder}/${assetId}.webp`
  await copyR2Object(stagingKey, originalKey, object.contentType)
  try {
    const source = await getR2ObjectWebStream(stagingKey)
    if (!source?.stream) throw new Error("HEIC source could not be read")
    const display = await transformImage(source.stream, { format: "image/webp", quality: 85 })
    await putR2Object(displayKey, display, "image/webp", "public, max-age=31536000, immutable")
  } catch (error) {
    await Promise.allSettled([deleteR2Object(originalKey), deleteR2Object(displayKey)])
    throw error
  }

  return { displayKey, originalKey, isDerivative: true }
}
