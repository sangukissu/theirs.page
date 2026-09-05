import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdminSafe } from "@/utils/supabase/admin"
import { createClient } from "@/utils/supabase/server"
import crypto from "crypto"
import { verifyTurnstileToken, checkDurableRateLimit } from "@/lib/turnstile"
import {
  signUploadIntent,
  ALLOWED_GUEST_MIME_TYPES,
  MAX_GUEST_UPLOAD_BYTES,
  getUploadClientBinding,
} from "@/lib/upload-intent"
import { getMemorialPinCookieName, verifyPinAccessToken } from "@/lib/security/pin"
import type { ContributionSettings } from "@/types/theirs"

interface RouteContext {
  params: Promise<{ id: string }>
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

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
    const contributionType = body.contribution_type

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
    const normalizedMime = typeof mime_type === "string" ? mime_type.toLowerCase().trim() : ""
    if (contributionType !== "photo" && contributionType !== "memory") {
      return NextResponse.json({ error: "Invalid photograph contribution type." }, { status: 400 })
    }
    if (!ALLOWED_GUEST_MIME_TYPES.has(normalizedMime)) {
      return NextResponse.json(
        {
          error:
            "Please choose a JPEG, PNG, or WebP photograph.",
        },
        { status: 400 }
      )
    }

    if (!Number.isSafeInteger(file_size) || file_size < 1 || file_size > MAX_GUEST_UPLOAD_BYTES) {
      return NextResponse.json(
        { error: "Guest contribution files must be under 15MB." },
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
      contributionSettings.photos === false ||
      (contributionType === "memory" && contributionSettings.memories === false)
    ) {
      return NextResponse.json(
        { error: "The family is not currently accepting photograph contributions." },
        { status: 403 }
      )
    }

    // 5. Enforce Tier Restrictions for Guest Contributions
    const isPaid = Boolean(memorial.is_paid)
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

        let isOwnerOrAdmin = false
        if (user) {
          if (memorial.owner_id === user.id) {
            isOwnerOrAdmin = true
          } else {
            const { data: collab } = await db
              .from("collaborators")
              .select("id")
              .eq("memorial_id", memorial.id)
              .eq("user_id", user.id)
              .eq("invitation_accepted", true)
              .maybeSingle()
            if (collab) isOwnerOrAdmin = true
          }
        }

        if (!isOwnerOrAdmin) {
          return NextResponse.json(
            { error: "This memorial is private. Please enter the family PIN before uploading." },
            { status: 403 }
          )
        }
      }
    }

    // 6. Generate Short-Lived HMAC Upload Intent Token (10 minutes)
    const uploadIntentToken = signUploadIntent({
      memorialId: memorial.id,
      allowedMime: "image/*",
      maxBytes: MAX_GUEST_UPLOAD_BYTES,
      contributionType,
      clientBinding: getUploadClientBinding(clientIp),
      nonce: crypto.randomBytes(16).toString("hex"),
    })

    return NextResponse.json({
      success: true,
      uploadIntentToken,
      memorialId: memorial.id,
      expiresIn: 600,
    })
  } catch (err: any) {
    console.error("Upload intent error:", err)
    return NextResponse.json(
      { error: "Failed to generate upload authorization. Please try again." },
      { status: 500 }
    )
  }
}
