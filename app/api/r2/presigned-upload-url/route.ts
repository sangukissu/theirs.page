import crypto from "crypto"
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { getSupabaseAdminSafe } from "@/utils/supabase/admin"
import { getR2PresignedUploadUrl } from "@/lib/r2"
import { assertMemorialAdmin } from "@/lib/memorial-auth"
import { assertMediaQuota } from "@/lib/paywall"
import { checkDurableRateLimit } from "@/lib/turnstile"
import { isStorageQuotaError, releaseMemorialStorage, reserveMemorialStorage } from "@/lib/storage-quota"

const TRANSIENT_ALLOWED_CONTENT_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]

const MEMORIAL_ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
  "image/heif",
])

const MEMORIAL_ALLOWED_AUDIO_TYPES = new Set([
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/x-wav",
  "audio/ogg",
  "audio/m4a",
  "audio/x-m4a",
  "audio/aac",
  "audio/flac",
  "audio/opus",
  "audio/mp4",
])

const MEMORIAL_ALLOWED_VIDEO_TYPES = new Set([
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-matroska",
  "video/ogg",
])

const MAX_TRANSIENT_UPLOAD_BYTES = 15 * 1024 * 1024
const MAX_MEMORIAL_PORTRAIT_BYTES = 15 * 1024 * 1024
const MAX_MEMORIAL_IMAGE_BYTES = 15 * 1024 * 1024
const MAX_MEMORIAL_AUDIO_BYTES = 50 * 1024 * 1024
const MAX_MEMORIAL_VIDEO_BYTES = 100 * 1024 * 1024

function extensionForContentType(contentType: string): string {
  if (contentType === "image/heic") return "heic"
  if (contentType === "image/heif") return "heif"
  if (contentType === "image/png") return "png"
  if (contentType === "image/webp") return "webp"
  return "jpg"
}

function detectMediaType(filename: string, mime: string): "image" | "audio" | "video" {
  const lower = filename.toLowerCase()
  if (
    mime.startsWith("video/") ||
    lower.endsWith(".mp4") ||
    lower.endsWith(".webm") ||
    lower.endsWith(".mov") ||
    lower.endsWith(".mkv") ||
    lower.endsWith(".ogv")
  ) {
    return "video"
  }

  if (
    mime.startsWith("audio/") ||
    lower.endsWith(".mp3") ||
    lower.endsWith(".wav") ||
    lower.endsWith(".m4a") ||
    lower.endsWith(".aac") ||
    lower.endsWith(".ogg") ||
    lower.endsWith(".oga") ||
    lower.endsWith(".opus") ||
    lower.endsWith(".flac")
  ) {
    return "audio"
  }

  return "image"
}

function resolveContentType(filename: string, mime: string): string {
  if (mime && mime !== "application/octet-stream") return mime
  const lower = filename.toLowerCase()
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg"
  if (lower.endsWith(".png")) return "image/png"
  if (lower.endsWith(".webp")) return "image/webp"
  if (lower.endsWith(".gif")) return "image/gif"
  if (lower.endsWith(".heic")) return "image/heic"
  if (lower.endsWith(".heif")) return "image/heif"
  if (lower.endsWith(".mp3")) return "audio/mpeg"
  if (lower.endsWith(".wav")) return "audio/wav"
  if (lower.endsWith(".m4a")) return "audio/m4a"
  if (lower.endsWith(".ogg") || lower.endsWith(".oga")) return "audio/ogg"
  if (lower.endsWith(".mp4")) return "video/mp4"
  if (lower.endsWith(".webm")) return "video/webm"
  if (lower.endsWith(".mov")) return "video/quicktime"
  return mime || "application/octet-stream"
}

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("cf-connecting-ip") ||
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "127.0.0.1"
  )
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const body = await req.json().catch(() => ({}))
    const filename = body.filename
    const rawContentType = body.contentType
    const folder = body.folder
    const fileSize = Number(body.fileSize ?? body.file_size)

    if (
      typeof filename !== "string" ||
      typeof rawContentType !== "string" ||
      typeof folder !== "string" ||
      !Number.isSafeInteger(fileSize)
    ) {
      return NextResponse.json(
        { error: "filename, contentType, folder, and fileSize are required" },
        { status: 400 }
      )
    }

    // 1. Authenticated Caretaker Memorial Upload Flow (Gallery, Portraits, Timeline)
    if (body.memorialId) {
      const memorialId = String(body.memorialId)
      const authCheck = await assertMemorialAdmin(memorialId, user.id)
      if (!authCheck.authorized || !authCheck.memorial) {
        return authCheck.errorResponse || NextResponse.json(
          { error: "You do not have permission to upload to this memorial" },
          { status: 403 }
        )
      }

      const safeFolder = folder.toLowerCase().trim()
      if (!["gallery", "portraits", "timeline", "covers"].includes(safeFolder)) {
        return NextResponse.json({ error: "Invalid upload destination folder." }, { status: 400 })
      }

      const contentType = resolveContentType(filename, rawContentType)
      const mediaType = detectMediaType(filename, contentType)

      if (safeFolder === "portraits" || safeFolder === "timeline" || safeFolder === "covers") {
        if (!MEMORIAL_ALLOWED_IMAGE_TYPES.has(contentType)) {
          return NextResponse.json({ error: "Only supported image files (JPEG, PNG, WebP, GIF, HEIC, or HEIF) are accepted here." }, { status: 400 })
        }
        if (fileSize < 1 || fileSize > MAX_MEMORIAL_PORTRAIT_BYTES) {
          return NextResponse.json({ error: "Image file must be under 15MB." }, { status: 400 })
        }
      } else {
        // Gallery media validation: Strict allowlists only (no startsWith wildcard)
        const isAllowedMedia =
          MEMORIAL_ALLOWED_IMAGE_TYPES.has(contentType) ||
          MEMORIAL_ALLOWED_AUDIO_TYPES.has(contentType) ||
          MEMORIAL_ALLOWED_VIDEO_TYPES.has(contentType)

        if (!isAllowedMedia) {
          return NextResponse.json({ error: "Unsupported media format. Please upload standard photos, audio notes, or videos." }, { status: 400 })
        }
        const maxBytes = mediaType === "video"
          ? MAX_MEMORIAL_VIDEO_BYTES
          : mediaType === "audio"
            ? MAX_MEMORIAL_AUDIO_BYTES
            : MAX_MEMORIAL_IMAGE_BYTES
        if (fileSize < 1 || fileSize > maxBytes) {
          return NextResponse.json({ error: `File size exceeds the ${maxBytes / 1024 / 1024}MB limit for this media type.` }, { status: 400 })
        }

        // Quota & tier enforcement via paywall rules
        const db = getSupabaseAdminSafe() || supabase
        const { count, error: countErr } = await db
          .from("media_items")
          .select("id", { count: "exact", head: true })
          .eq("memorial_id", authCheck.memorial.id)

        const currentCount = !countErr && typeof count === "number" ? count : 0
        const quotaCheck = assertMediaQuota(authCheck.memorial, currentCount, mediaType)
        if (!quotaCheck.allowed) {
          return NextResponse.json({ error: quotaCheck.error }, { status: quotaCheck.status || 402 })
        }
      }

      const rateLimit = await checkDurableRateLimit(
        "dashboard_upload",
        `${user.id}:${authCheck.memorial.id}`,
        120,
        3600
      )
      if (!rateLimit.allowed) {
        return NextResponse.json(
          { error: "Too many uploads were attempted. Please wait before trying again." },
          { status: 429 }
        )
      }

      const randomId = crypto.randomUUID()
      const cleanFilename = filename.replace(/[^a-zA-Z0-9.-]/g, "_").slice(-180)
      // Upload directly into private dashboard-staging/ prefix.
      // Promoted into permanent memorials/ storage only upon successful DB record creation.
      const stagingKey = `dashboard-staging/${authCheck.memorial.id}/${randomId}/${cleanFilename}`
      const quotaDb = getSupabaseAdminSafe()
      if (!quotaDb) {
        return NextResponse.json({ error: "Media uploads are temporarily unavailable." }, { status: 503 })
      }
      let uploadUrl: string
      try {
        await reserveMemorialStorage(quotaDb, authCheck.memorial.id, stagingKey, fileSize)
        uploadUrl = await getR2PresignedUploadUrl(stagingKey, contentType, 600, fileSize)
      } catch (error) {
        await releaseMemorialStorage(quotaDb, authCheck.memorial.id, stagingKey).catch(() => {})
        if (isStorageQuotaError(error)) {
          return NextResponse.json({ error: "This memorial has reached its 10 GB original-media limit." }, { status: 413 })
        }
        throw error
      }

      return NextResponse.json({
        success: true,
        uploadUrl,
        key: stagingKey,
        stagingKey,
        contentType,
        mediaType,
      })
    }

    // 2. Transient Photo Restoration Upload Flow
    if (!TRANSIENT_ALLOWED_CONTENT_TYPES.includes(rawContentType)) {
      return NextResponse.json({ error: "Only supported image files may be uploaded." }, { status: 400 })
    }
    if (folder !== "restorations") {
      return NextResponse.json({ error: "Invalid transient upload purpose." }, { status: 400 })
    }
    if (fileSize < 1 || fileSize > MAX_TRANSIENT_UPLOAD_BYTES) {
      return NextResponse.json({ error: "Upload must be 15MB or smaller." }, { status: 400 })
    }

    const rateLimit = await checkDurableRateLimit(
      "presigned_upload",
      `${user.id}:${getClientIp(req)}`,
      10,
      3600
    )
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many uploads. Please wait before trying again." },
        { status: 429 }
      )
    }

    const key = `temp/${folder}/${user.id}/${crypto.randomUUID()}.${extensionForContentType(rawContentType)}`
    const uploadUrl = await getR2PresignedUploadUrl(key, rawContentType, 300, fileSize)

    return NextResponse.json({ success: true, uploadUrl, key, contentType: rawContentType })
  } catch (error) {
    console.error("Presigned URL generation error:", error)
    return NextResponse.json({ error: "Unable to prepare upload." }, { status: 500 })
  }
}
