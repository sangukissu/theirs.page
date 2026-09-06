import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdminSafe } from "@/utils/supabase/admin"
import { createClient } from "@/utils/supabase/server"
import crypto from "crypto"
import { verifyTurnstileToken, checkDurableRateLimit } from "@/lib/turnstile"
import {
  signUploadIntent,
  getUploadClientBinding,
  getGuestMediaRule,
  normalizeGuestMime,
  type GuestContributionType,
} from "@/lib/upload-intent"
import { getMemorialPinCookieName, verifyPinAccessToken } from "@/lib/security/pin"
import type { ContributionSettings } from "@/types/theirs"
import { getR2PresignedUploadUrl } from "@/lib/r2"
import { isStorageQuotaError, releaseMemorialStorage, reserveMemorialStorage } from "@/lib/storage-quota"
import { getMemorialAccess } from "@/lib/memorial-auth"

interface RouteContext {
  params: Promise<{ id: string }>
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function extensionForMime(mime: string): string {
  if (mime === "audio/mpeg") return "mp3"
  if (mime === "audio/wav") return "wav"
  if (mime === "audio/ogg") return "ogg"
  if (mime === "audio/m4a") return "m4a"
  if (mime === "video/webm") return "webm"
  if (mime === "video/quicktime") return "mov"
  return "mp4"
}

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("cf-connecting-ip") ||
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "127.0.0.1"
  )
}

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const body = await req.json().catch(() => ({}))
    const mime_type = body.mime_type || body.fileType || body.type
    const file_size = Number(body.file_size ?? body.fileSize ?? body.size)
    const turnstile_token = body.turnstile_token || body.turnstileToken
    const contributionType = body.contribution_type as GuestContributionType

    const clientIp = getClientIp(req)

    // 1. A valid challenge is mandatory before storage is allocated.
    const isValidCaptcha = await verifyTurnstileToken(turnstile_token, clientIp, "contribution")
    if (!isValidCaptcha) {
      return NextResponse.json(
        { error: "Security check expired or failed. Please try the upload again." },
        { status: 400 }
      )
    }

    // 2. Durable Edge Rate Limiting (30 upload intents per 10 minutes per IP)
    const rateCheck = await checkDurableRateLimit("upload_intent", clientIp, 30, 600)
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: `Upload intent rate limit reached. Please wait ${rateCheck.remainingSeconds || 60} seconds before uploading another file.`,
        },
        { status: 429 }
      )
    }

    // 3. MIME Type & File Size Validation
    const normalizedMime = typeof mime_type === "string" ? normalizeGuestMime(mime_type) : ""
    if (!["photo", "memory", "voice", "video"].includes(contributionType)) {
      return NextResponse.json({ error: "Invalid media contribution type." }, { status: 400 })
    }
    const mediaRule = getGuestMediaRule(contributionType)
    if (!mediaRule.allowedMimeTypes.has(normalizedMime)) {
      return NextResponse.json(
        {
          error: contributionType === "voice"
            ? "Please choose an MP3, WAV, OGG, or M4A recording."
            : contributionType === "video"
              ? "Please choose an MP4, WebM, or MOV video."
              : "Please choose a JPEG, PNG, or WebP photograph.",
        },
        { status: 400 }
      )
    }

    if (!Number.isSafeInteger(file_size) || file_size < 1 || file_size > mediaRule.maxBytes) {
      return NextResponse.json(
        { error: `${mediaRule.label[0].toUpperCase()}${mediaRule.label.slice(1)} files must be ${Math.floor(mediaRule.maxBytes / 1024 / 1024)}MB or smaller.` },
        { status: 400 }
      )
    }

    // 4. Resolve Memorial
    const adminClient = getSupabaseAdminSafe()
    const serverClient = await createClient()
    const db = adminClient || serverClient

    const isUuid = UUID_REGEX.test(id)
    let query = db.from("memorials").select("id, slug, status, privacy, is_paid, owner_id, access_pin_hash, contribution_settings")
    query = isUuid ? query.eq("id", id) : query.eq("slug", id)
    const { data: memorial } = await query.maybeSingle()

    if (!memorial) {
      return NextResponse.json({ error: "Memorial not found." }, { status: 404 })
    }

    if (memorial.status !== "published") {
      return NextResponse.json(
        { error: "This memorial is not currently open for contributions." },
        { status: 403 }
      )
    }

    const contributionSettings = (memorial.contribution_settings || {}) as ContributionSettings
    if (
      contributionSettings.accept_contributions === false ||
      contributionSettings[mediaRule.setting] === false ||
      (contributionType === "memory" && contributionSettings.photos === false)
    ) {
      return NextResponse.json(
        { error: `The family is not currently accepting ${mediaRule.label} contributions.` },
        { status: 403 }
      )
    }

    // 5. Enforce Tier Restrictions for Guest Contributions
    const isPaid = Boolean(memorial.is_paid)
    if (!isPaid && (contributionType === "voice" || contributionType === "video")) {
      return NextResponse.json(
        { error: "Voice notes and video clips require the Pro Plan." },
        { status: 403 }
      )
    }
    if (!isPaid) {
      // Check 5-photo limit on free tier
      if (normalizedMime.startsWith("image/")) {
        const { count, error: countErr } = await db
          .from("media_items")
          .select("id", { count: "exact", head: true })
          .eq("memorial_id", memorial.id)

        const currentPhotos = !countErr && typeof count === "number" ? count : 0
        if (currentPhotos >= 5) {
          return NextResponse.json(
            { error: "This memorial has reached its photograph limit (5 photos) on the free tier." },
            { status: 403 }
          )
        }
      }
    }

    // 6. Enforce Private Memorial PIN Gate
    if (memorial.privacy === "private") {
      const cookieKey = memorial.slug || memorial.id
      const isUnlocked = verifyPinAccessToken(
        req.cookies.get(getMemorialPinCookieName(cookieKey))?.value,
        memorial.id,
        memorial.access_pin_hash
      )

      if (!isUnlocked) {
        // Check if current user is memorial admin
        const {
          data: { user },
        } = await serverClient.auth.getUser()

        const access = user?.id
          ? await getMemorialAccess(memorial.id, user.id)
          : null

        if (!access?.canContribute) {
          return NextResponse.json(
            { error: "This memorial is private. Please enter the family PIN before uploading." },
            { status: 403 }
          )
        }
      }
    }

    // 6. Generate Short-Lived HMAC Upload Intent Token (10 minutes)
    const nonce = crypto.randomBytes(16).toString("hex")
    const usesDirectR2 = contributionType === "voice" || contributionType === "video"
    const directUploadKey = usesDirectR2
      ? `contribution-staging/${memorial.id}/${nonce}/original/${crypto.randomUUID()}.${extensionForMime(normalizedMime)}`
      : undefined
    let directUploadUrl: string | undefined

    if (directUploadKey) {
      if (!adminClient) {
        return NextResponse.json({ error: "Media uploads are temporarily unavailable." }, { status: 503 })
      }
      try {
        await reserveMemorialStorage(adminClient, memorial.id, directUploadKey, file_size)
        directUploadUrl = await getR2PresignedUploadUrl(directUploadKey, normalizedMime, 600, file_size)
      } catch (error) {
        await releaseMemorialStorage(adminClient, memorial.id, directUploadKey).catch(() => {})
        if (isStorageQuotaError(error)) {
          return NextResponse.json({ error: "This memorial has reached its 10 GB original-media limit." }, { status: 413 })
        }
        throw error
      }
    }

    const uploadIntentToken = signUploadIntent({
      memorialId: memorial.id,
      allowedMime: mediaRule.allowedMime,
      maxBytes: mediaRule.maxBytes,
      contributionType,
      clientBinding: getUploadClientBinding(clientIp),
      nonce,
      ...(directUploadKey ? {
        directUploadKey,
        fileSize: file_size,
        contentType: normalizedMime,
      } : {}),
    })

    return NextResponse.json({
      success: true,
      uploadIntentToken,
      memorialId: memorial.id,
      expiresIn: 600,
      ...(directUploadUrl ? {
        directUpload: {
          uploadUrl: directUploadUrl,
          key: directUploadKey,
          contentType: normalizedMime,
        },
      } : {}),
    })
  } catch (err: any) {
    console.error("Upload intent error:", err)
    return NextResponse.json(
      { error: "Failed to generate upload authorization. Please try again." },
      { status: 500 }
    )
  }
}
