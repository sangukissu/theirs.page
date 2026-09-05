import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { getSupabaseAdminSafe } from "@/utils/supabase/admin"
import { deleteR2Object, getR2SignedUrl, putR2Object } from "@/lib/r2"
import { assertMemorialAdmin } from "@/lib/memorial-auth"
import { assertMediaQuota } from "@/lib/paywall"
import {
  verifyUploadIntent,
  signUploadedMediaReference,
  type UploadIntentPayload,
  ALLOWED_GUEST_MIME_TYPES,
  MAX_GUEST_UPLOAD_BYTES,
  getUploadClientBinding,
} from "@/lib/upload-intent"
import {
  getImageDimensions,
  screenImageWithGemini,
  stripExifAndGps,
  validateMagicBytes,
} from "@/lib/safety/moderation"
import { getMemorialPinCookieName, verifyPinAccessToken } from "@/lib/security/pin"
import { checkDurableRateLimit } from "@/lib/turnstile"
import type { ContributionSettings } from "@/types/theirs"

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const MAX_IMAGE_EDGE = 12_000
const MAX_IMAGE_PIXELS = 40_000_000
const MAX_UPLOAD_REQUEST_BYTES = 55 * 1024 * 1024

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("cf-connecting-ip") ||
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "127.0.0.1"
  )
}

function extensionForMime(mime: string): string {
  if (mime === "image/png") return "png"
  if (mime === "image/webp") return "webp"
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
    const declaredLength = Number(req.headers.get("content-length") || 0)
    if (declaredLength > MAX_UPLOAD_REQUEST_BYTES) {
      return NextResponse.json({ error: "Upload exceeds the 50MB limit." }, { status: 413 })
    }

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
    let contributionIntent: UploadIntentPayload | null = null

    // 1. Contribution Upload (Guest or Logged-in Contributor with signed intent) vs. Admin Dashboard Upload
    const isContribution = Boolean(uploadIntentToken) || folder === "contributions"

    if (isContribution) {
      if (!uploadIntentToken) {
        return NextResponse.json(
          { error: "Upload authorization required for contributions." },
          { status: 401 }
        )
      }

      contributionIntent = verifyUploadIntent(uploadIntentToken)
      if (!contributionIntent) {
        return NextResponse.json(
          { error: "Upload authorization expired or invalid. Please refresh and try again." },
          { status: 403 }
        )
      }

      if (contributionIntent.clientBinding !== getUploadClientBinding(getClientIp(req))) {
        return NextResponse.json(
          { error: "This upload authorization belongs to a different browser session." },
          { status: 403 }
        )
      }

      // Guest / contributor file must be within 15MB
      if (file.size < 1 || file.size > MAX_GUEST_UPLOAD_BYTES || file.size > contributionIntent.maxBytes) {
        return NextResponse.json(
          { error: "Contribution files must be under 15MB." },
          { status: 400 }
        )
      }

      // Contributions currently permit only the signed photograph allowlist.
      if (!ALLOWED_GUEST_MIME_TYPES.has(contentType) || contributionIntent.allowedMime !== "image/*") {
        return NextResponse.json(
          { error: "The selected file does not match the authorized photograph type." },
          { status: 400 }
        )
      }

      // Verify memorial exists and matches intent
      const admin = getSupabaseAdminSafe() || supabase
      const isUuid = UUID_REGEX.test(contributionIntent.memorialId)
      let query = admin.from("memorials").select("id, slug, status, privacy, is_paid, owner_id, access_pin_hash, contribution_settings")
      query = isUuid ? query.eq("id", contributionIntent.memorialId) : query.eq("slug", contributionIntent.memorialId)
      const { data: memorial } = await query.maybeSingle()

      if (!memorial) {
        return NextResponse.json({ error: "Memorial not found" }, { status: 404 })
      }

      if (memorial.id !== contributionIntent.memorialId) {
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

      const contributionSettings = (memorial.contribution_settings || {}) as ContributionSettings
      if (
        contributionSettings.accept_contributions === false ||
        contributionSettings.photos === false
      ) {
        return NextResponse.json(
          { error: "The family is not currently accepting photograph contributions." },
          { status: 403 }
        )
      }

      const uploadRateLimit = await checkDurableRateLimit(
        "contribution_upload",
        getClientIp(req),
        12,
        600
      )
      if (!uploadRateLimit.allowed) {
        return NextResponse.json(
          { error: "Too many uploads were attempted. Please wait a few minutes and try again." },
          { status: 429 }
        )
      }
      const sessionRateLimit = await checkDurableRateLimit(
        "contribution_upload_session",
        contributionIntent.nonce,
        3,
        600
      )
      if (!sessionRateLimit.allowed) {
        return NextResponse.json(
          { error: "This contribution already has the maximum of three photographs." },
          { status: 429 }
        )
      }

      if (memorial.privacy === "private") {
        const cookieKey = memorial.slug || memorial.id
        const isUnlocked = verifyPinAccessToken(
          req.cookies.get(getMemorialPinCookieName(cookieKey))?.value,
          memorial.id,
          memorial.access_pin_hash
        )
        if (!isUnlocked) {
          const isOwner = user?.id === memorial.owner_id
          let isAcceptedCollaborator = false
          if (user && !isOwner) {
            const { data: collaborator } = await admin
              .from("collaborators")
              .select("id")
              .eq("memorial_id", memorial.id)
              .eq("user_id", user.id)
              .eq("invitation_accepted", true)
              .maybeSingle()
            isAcceptedCollaborator = Boolean(collaborator)
          }
          if (!isOwner && !isAcceptedCollaborator) {
            return NextResponse.json(
              { error: "This memorial is private. Please enter the family PIN before uploading." },
              { status: 403 }
            )
          }
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

      if (!memorialIdOrSlug) {
        return NextResponse.json({ error: "A memorial is required for dashboard uploads." }, { status: 400 })
      }
      const authCheck = await assertMemorialAdmin(memorialIdOrSlug, user.id)
      if (!authCheck.authorized || !authCheck.memorial) {
        return NextResponse.json(
          { error: authCheck.error || "You do not have permission to upload to this memorial" },
          { status: 403 }
        )
      }

      resolvedMemorialId = authCheck.memorial.id
      const adminUploadLimit = await checkDurableRateLimit(
        "dashboard_upload",
        `${user.id}:${resolvedMemorialId}`,
        120,
        3600
      )
      if (!adminUploadLimit.allowed) {
        return NextResponse.json(
          { error: "Too many uploads were attempted. Please wait before trying again." },
          { status: 429 }
        )
      }

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
    if (!isContribution && validation.mediaType !== mediaType) {
      return NextResponse.json(
        { error: "The uploaded bytes do not match the selected media type." },
        { status: 400 }
      )
    }

    if (isContribution) {
      if (
        !contributionIntent ||
        !resolvedMemorialId ||
        validation.mediaType !== "image" ||
        validation.detectedMime !== contentType ||
        !ALLOWED_GUEST_MIME_TYPES.has(validation.detectedMime)
      ) {
        return NextResponse.json(
          { error: "The uploaded bytes do not match the authorized photograph type." },
          { status: 400 }
        )
      }

      const dimensions = getImageDimensions(buffer, validation.detectedMime)
      if (
        !dimensions ||
        dimensions.width < 1 ||
        dimensions.height < 1 ||
        dimensions.width > MAX_IMAGE_EDGE ||
        dimensions.height > MAX_IMAGE_EDGE ||
        dimensions.width * dimensions.height > MAX_IMAGE_PIXELS
      ) {
        return NextResponse.json(
          { error: "This photograph is damaged or has unusually large dimensions." },
          { status: 400 }
        )
      }

      let displayBuffer: Buffer
      try {
        displayBuffer = Buffer.from(stripExifAndGps(buffer, validation.detectedMime))
      } catch (sanitizationError) {
        console.warn("Contribution image sanitization rejected:", sanitizationError)
        return NextResponse.json(
          { error: "We could not safely prepare this photograph. Please export it as a new JPEG and try again." },
          { status: 400 }
        )
      }

      const safety = await screenImageWithGemini(displayBuffer, validation.detectedMime)
      const objectId = crypto.randomUUID()
      const extension = extensionForMime(validation.detectedMime)
      const stagingPrefix = `contribution-staging/${resolvedMemorialId}/${contributionIntent.nonce}`
      const originalKey = `${stagingPrefix}/original/${objectId}.${extension}`
      const displayKey = `${stagingPrefix}/display/${objectId}.${extension}`

      try {
        await putR2Object(originalKey, buffer, validation.detectedMime, "private, no-store")
        await putR2Object(displayKey, displayBuffer, validation.detectedMime, "private, no-store")
      } catch (storageError) {
        await Promise.allSettled([
          deleteR2Object(originalKey),
          deleteR2Object(displayKey),
        ])
        throw storageError
      }

      const mediaReference = signUploadedMediaReference({
        memorialId: resolvedMemorialId,
        originalKey,
        displayKey,
        detectedMime: validation.detectedMime,
        mediaType: "image",
        contributionType: contributionIntent.contributionType,
        intentNonce: contributionIntent.nonce,
        safety,
      })
      const previewUrl = await getR2SignedUrl(displayKey, 15 * 60)

      return NextResponse.json({
        success: true,
        mediaRef: mediaReference,
        previewUrl,
        mediaType: "image",
        filename: file.name.slice(0, 200),
        contentType: validation.detectedMime,
        size: buffer.length,
        width: dimensions.width,
        height: dimensions.height,
        isQuarantined: true,
      })
    }

    // 4. Authenticated caretaker upload
    const timestamp = Date.now()
    const randomId = crypto.randomUUID()
    const cleanFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, "_").slice(-180)
    const safeFolder = folder.replace(/[^a-zA-Z0-9_-]/g, "")

    let key: string
    if (resolvedMemorialId) {
      key = `memorials/${resolvedMemorialId}/${safeFolder}/${timestamp}_${randomId}_${cleanFilename}`
    } else {
      key = `uploads/${user?.id || "guest"}/${safeFolder}/${timestamp}_${randomId}_${cleanFilename}`
    }

    // 6. Upload to Cloudflare R2
    await putR2Object(key, buffer, validation.detectedMime || contentType, "public, max-age=31536000, immutable")

    return NextResponse.json({
      success: true,
      key,
      publicUrl: `/api/media?key=${encodeURIComponent(key)}`,
      mediaType: validation.mediaType,
      filename: file.name,
      contentType: validation.detectedMime || contentType,
      size: buffer.length,
      isQuarantined: false,
    })
  } catch (err: any) {
    console.error("Server upload error:", err)
    return NextResponse.json(
      { error: "Failed to upload file to storage. Please try again in a moment." },
      { status: 500 }
    )
  }
}
