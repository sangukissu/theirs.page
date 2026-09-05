import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdminSafe } from "@/utils/supabase/admin"
import {
  createPinAccessToken,
  getMemorialPinCookieName,
  hashPin,
  isLegacyPlaintextPin,
  verifyPin,
} from "@/lib/security/pin"
import { checkDurableRateLimit, clearDurableRateLimit } from "@/lib/turnstile"

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
    if (Number(req.headers.get("content-length") || 0) > 4096) {
      return NextResponse.json({ error: "Invalid request." }, { status: 413 })
    }
    const body = await req.json().catch(() => ({}))
    const { pin } = body

    if (typeof pin !== "string" || !/^\d{4}$/.test(pin)) {
      return NextResponse.json({ error: "Enter the four-digit PIN." }, { status: 400 })
    }

    const isUuid = UUID_REGEX.test(id)
    const admin = getSupabaseAdminSafe()
    if (!admin) {
      return NextResponse.json(
        { error: "Private memorial access is temporarily unavailable." },
        { status: 503 }
      )
    }
    let query = admin.from("memorials").select("id, slug, access_pin_hash, privacy")
    query = isUuid ? query.eq("id", id) : query.eq("slug", id)
    const { data: memorial } = await query.maybeSingle()

    if (!memorial) {
      return NextResponse.json({ error: "Memorial not found" }, { status: 404 })
    }

    if (memorial.privacy !== "private") {
      return NextResponse.json({ success: true, message: "Memorial is not private" })
    }

    const clientIp = getClientIp(req)
    const rateLimitKey = `${clientIp}:${memorial.id}`

    // Check brute-force lock
    const rateCheck = await checkDurableRateLimit("pin_attempt", rateLimitKey, 5, 900)
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: `Too many failed attempts. Please wait ${rateCheck.remainingSeconds || 900} seconds before trying again.`,
        },
        { status: 429 }
      )
    }

    // Verify PIN match (constant-time check with salt)
    const isMatch = verifyPin(pin, memorial.access_pin_hash || "")

    if (!isMatch) {
      return NextResponse.json(
        { error: "Incorrect PIN code. Please check it and try again." },
        { status: 401 }
      )
    }

    // PIN is correct - clear failed attempt tracker
    await clearDurableRateLimit("pin_attempt", rateLimitKey)

    let effectivePinHash = memorial.access_pin_hash as string
    if (isLegacyPlaintextPin(effectivePinHash)) {
      if (!admin) {
        return NextResponse.json(
          { error: "This private memorial needs its access PIN refreshed by the owner." },
          { status: 503 }
        )
      }
      effectivePinHash = hashPin(pin)
      const { error: migrationError } = await admin
        .from("memorials")
        .update({ access_pin_hash: effectivePinHash })
        .eq("id", memorial.id)
      if (migrationError) {
        console.error("Failed to migrate legacy memorial PIN:", migrationError)
        return NextResponse.json({ error: "Unable to finish unlocking this memorial." }, { status: 500 })
      }
    }

    // Set a signed, memorial-bound unlock cookie for 30 days.
    const cookieKey = memorial.slug || memorial.id
    const response = NextResponse.json({ success: true })
    response.cookies.set(
      getMemorialPinCookieName(cookieKey),
      createPinAccessToken(memorial.id, effectivePinHash),
      {
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      }
    )

    return response
  } catch (err: any) {
    console.error("PIN verification error:", err)
    return NextResponse.json({ error: "Unable to verify PIN. Please try again." }, { status: 500 })
  }
}
