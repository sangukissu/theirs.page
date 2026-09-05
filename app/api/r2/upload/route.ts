import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { getSupabaseAdminSafe } from "@/utils/supabase/admin"
import { putR2Object } from "@/lib/r2"
import { assertMemorialAdmin } from "@/lib/memorial-auth"
import { assertMediaQuota } from "@/lib/paywall"
import {
  verifyUploadIntent,
  ALLOWED_GUEST_MIME_TYPES,
  MAX_GUEST_UPLOAD_BYTES,
} from "@/lib/upload-intent"
import { validateMagicBytes, stripExifAndGps } from "@/lib/safety/moderation"

const R2_PUBLIC_ENDPOINT =
  process.env.R2_MEDIA_ENDPOINT || "https://pub-3511ae96b3594eecbde1632d4cca06b6.r2.dev"

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

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
  if (lower.endsWith(".mp3")) return "audio/mpeg"
  if (lower.endsWith(".wav")) return "audio/wav"
  if (lower.endsWith(".m4a")) return "audio/m4a"
  if (lower.endsWith(".ogg") || lower.endsWith(".oga")) return "audio/ogg"
  if (lower.endsWith(".mp4")) return "video/mp4"
  if (lower.endsWith(".webm")) return "video/webm"
  if (lower.endsWith(".mov")) return "video/quicktime"
  return "application/octet-stream"
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const formData = await req.formData()
    const file = formData.get("file") as File | null
    const folder = (formData.get("folder") as string) || "gallery"
    const memorialIdOrSlug = formData.get("memorialId") as string | null
    const uploadIntentToken = formData.get("uploadIntentToken") as string | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const mediaType = detectMediaType(file.name, file.type)
    const contentType = resolveContentType(file.name, file.type)
    let resolvedMemorialId: string | null = null

    // 1. Contribution Upload (Guest or Logged-in Contributor with signed intent) vs. Admin Dashboard Upload
    const isContribution = Boolean(uploadIntentToken) || folder === "contributions"

    if (isContribution) {
      if (!uploadIntentToken) {
        return NextResponse.json(
          { error: "Upload authorization required for contributions." },
          { status: 401 }
        )
      }

      const verifiedIntent = verifyUploadIntent(uploadIntentToken)
      if (!verifiedIntent) {
        return NextResponse.json(
          { error: "Upload authorization expired or invalid. Please refresh and try again." },
          { status: 403 }
        )
      }

      // Guest / contributor file must be within 15MB
      if (file.size > MAX_GUEST_UPLOAD_BYTES || file.size > verifiedIntent.maxBytes) {
        return NextResponse.json(
          { error: "Contribution files must be under 15MB." },
          { status: 400 }
        )
      }

      // Contribution only permits whitelisted image & audio MIME types
      if (!ALLOWED_GUEST_MIME_TYPES.has(contentType) && !ALLOWED_GUEST_MIME_TYPES.has(file.type)) {
        return NextResponse.json(
          { error: "Contribution uploads only accept photo and audio files." },
          { status: 400 }
        )
      }

      // Verify memorial exists and matches intent
      const admin = getSupabaseAdminSafe() || supabase
      const isUuid = UUID_REGEX.test(verifiedIntent.memorialId)
      let query = admin.from("memorials").select("id, slug, status, privacy, is_paid")
      query = isUuid ? query.eq("id", verifiedIntent.memorialId) : query.eq("slug", verifiedIntent.memorialId)
      const { data: memorial } = await query.maybeSingle()

      if (!memorial) {
        return NextResponse.json({ error: "Memorial not found" }, { status: 404 })
      }

      if (memorial.id !== verifiedIntent.memorialId) {
        return NextResponse.json(
          { error: "Upload authorization does not match the target memorial." },
          { status: 403 }
        )
      }

      if (memorial.status !== "published") {
        return NextResponse.json(
          { error: "This memorial is not currently accepting uploads" },
          { status: 403 }
        )
      }

      if (memorial.privacy === "private") {
        const cookieKey = memorial.slug || memorial.id
        const isUnlocked = req.cookies.get(`theirs_pin_${cookieKey}`)?.value === "unlocked"
        if (!isUnlocked) {
          return NextResponse.json(
            { error: "This memorial is private. Please enter the family PIN before uploading." },
            { status: 403 }
          )
        }
      }

      // Tier check for contributions
      const isPaid = Boolean(memorial.is_paid)
      if (!isPaid) {
        if (mediaType === "audio" || mediaType === "video") {
          return NextResponse.json(
            { error: "Voice notes and video clips require Pro Plan." },
            { status: 403 }
          )
        }

        const { count, error: countErr } = await admin
          .from("media_items")
          .select("id", { count: "exact", head: true })
          .eq("memorial_id", memorial.id)

        const currentCount = !countErr && typeof count === "number" ? count : 0
        if (currentCount >= 5) {
          return NextResponse.json(
            { error: "This memorial has reached its photograph limit on the free tier." },
            { status: 403 }
          )
        }
      } else {
        if (mediaType === "video") {
          return NextResponse.json(
            { error: "Video uploads are reserved for memorial caretakers in the dashboard." },
            { status: 400 }
          )
        }
      }

      resolvedMemorialId = memorial.id
    } else {
      // Admin Dashboard Upload Flow
      if (!user) {
        return NextResponse.json({ error: "Authentication required" }, { status: 401 })
      }

      if (memorialIdOrSlug) {
        const authCheck = await assertMemorialAdmin(memorialIdOrSlug, user.id)
        if (!authCheck.authorized || !authCheck.memorial) {
          return NextResponse.json(
            { error: authCheck.error || "You do not have permission to upload to this memorial" },
            { status: 403 }
          )
        }

        resolvedMemorialId = authCheck.memorial.id

        // Check storage quota & format restrictions via paywall rules
        const { count, error: countErr } = await supabase
          .from("media_items")
          .select("id", { count: "exact", head: true })
          .eq("memorial_id", resolvedMemorialId)

        const currentCount = !countErr && typeof count === "number" ? count : 0
        const quotaCheck = assertMediaQuota(authCheck.memorial, currentCount, mediaType)
        if (!quotaCheck.allowed) {
          return NextResponse.json({ error: quotaCheck.error }, { status: quotaCheck.status || 403 })
        }
      }

      // Max 50MB for authenticated admin uploads
      const MAX_ADMIN_SIZE = 50 * 1024 * 1024
      if (file.size > MAX_ADMIN_SIZE) {
        return NextResponse.json({ error: "File size exceeds 50MB limit." }, { status: 400 })
      }
    }

    // 2. Read file into buffer
    const arrayBuffer = await file.arrayBuffer()
    let buffer: Buffer = Buffer.from(arrayBuffer)

    // 3. Magic bytes validation
    const validation = validateMagicBytes(buffer, file.name, contentType)
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error || "File validation failed. Please upload a valid media file." },
        { status: 400 }
      )
    }

    // 4. Privacy & Safety: Strip EXIF and GPS coordinates for image contributions
    if (isContribution && validation.mediaType === "image") {
      buffer = Buffer.from(stripExifAndGps(buffer, validation.detectedMime))
    }

    // 5. Generate clean storage key
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(2, 9)
    const cleanFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, "_")
    const safeFolder = folder.replace(/[^a-zA-Z0-9_-]/g, "")

    // Contributions are placed in private quarantine prefix until caretaker approval
    let key: string
    if (isContribution && resolvedMemorialId) {
      key = `quarantine/${resolvedMemorialId}/${safeFolder}/${timestamp}_${randomId}_${cleanFilename}`
    } else if (resolvedMemorialId) {
      key = `memorials/${resolvedMemorialId}/${safeFolder}/${timestamp}_${randomId}_${cleanFilename}`
    } else {
      key = `uploads/${user?.id || "guest"}/${safeFolder}/${timestamp}_${randomId}_${cleanFilename}`
    }

    // 6. Upload to Cloudflare R2
    await putR2Object(key, buffer, validation.detectedMime || contentType, "public, max-age=31536000, immutable")

    const publicUrl = `${R2_PUBLIC_ENDPOINT.replace(/\/$/, "")}/${key}`

    return NextResponse.json({
      success: true,
      key,
      publicUrl,
      mediaType: validation.mediaType,
      filename: file.name,
      contentType: validation.detectedMime || contentType,
      size: buffer.length,
      isQuarantined: isContribution,
    })
  } catch (err: any) {
    console.error("Server upload error:", err)
    return NextResponse.json(
      { error: "Failed to upload file to storage. Please try again in a moment." },
      { status: 500 }
    )
  }
}
