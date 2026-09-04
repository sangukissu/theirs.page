import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdminSafe } from "@/utils/supabase/admin"
import { createClient } from "@/utils/supabase/server"
import crypto from "crypto"
import { verifyTurnstileToken, checkDurableRateLimit } from "@/lib/turnstile"
import {
  signUploadIntent,
  ALLOWED_GUEST_MIME_TYPES,
  MAX_GUEST_UPLOAD_BYTES,
} from "@/lib/upload-intent"

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
    const { turnstile_token, mime_type, file_size } = body

    const clientIp = getClientIp(req)

    // 1. Turnstile Verification (Fail-closed in production)
    const isValidCaptcha = await verifyTurnstileToken(turnstile_token, clientIp)
    if (!isValidCaptcha) {
      return NextResponse.json(
        { error: "Security check failed. Please refresh the page and try again." },
        { status: 400 }
      )
    }

    // 2. Durable Edge Rate Limiting (15 upload intents per 10 minutes per IP)
    const rateCheck = await checkDurableRateLimit("upload_intent", clientIp, 15, 600)
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: `Upload intent rate limit reached. Please wait ${rateCheck.remainingSeconds || 60} seconds before uploading another file.`,
        },
        { status: 429 }
      )
    }

    // 3. MIME Type & File Size Validation
    if (!mime_type || typeof mime_type !== "string") {
      return NextResponse.json({ error: "MIME type is required." }, { status: 400 })
    }

    const normalizedMime = mime_type.toLowerCase().trim()
    if (!ALLOWED_GUEST_MIME_TYPES.has(normalizedMime)) {
      return NextResponse.json(
        {
          error:
            "Unsupported file format. Guest contributions only accept photos (JPEG, PNG, WebP, HEIC) or audio voice memos.",
        },
        { status: 400 }
      )
    }

    if (typeof file_size === "number" && file_size > MAX_GUEST_UPLOAD_BYTES) {
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
    let query = db.from("memorials").select("id, slug, status, privacy")
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

    // 5. Enforce Private Memorial PIN Gate
    if (memorial.privacy === "private") {
      const cookieKey = memorial.slug || memorial.id
      const isUnlocked = req.cookies.get(`theirs_pin_${cookieKey}`)?.value === "unlocked"

      if (!isUnlocked) {
        // Check if current user is memorial admin
        const {
          data: { user },
        } = await serverClient.auth.getUser()

        let isOwnerOrAdmin = false
        if (user) {
          const { data: memOwner } = await db
            .from("memorials")
            .select("user_id")
            .eq("id", memorial.id)
            .single()
          if (memOwner?.user_id === user.id) {
            isOwnerOrAdmin = true
          } else {
            const { data: collab } = await db
              .from("collaborators")
              .select("id")
              .eq("memorial_id", memorial.id)
              .eq("user_id", user.id)
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
      allowedMime: normalizedMime,
      maxBytes: MAX_GUEST_UPLOAD_BYTES,
      nonce: crypto.randomBytes(16).toString("hex"),
      exp: Date.now() + 10 * 60 * 1000,
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
