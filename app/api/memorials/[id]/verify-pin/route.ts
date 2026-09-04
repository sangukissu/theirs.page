import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdminSafe } from "@/utils/supabase/admin"
import { createClient } from "@/utils/supabase/server"
import {
  verifyPin,
  checkPinRateLimit,
  recordFailedPinAttempt,
  clearPinAttempts,
} from "@/lib/security/pin"

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
    const { pin } = body

    if (!pin || typeof pin !== "string") {
      return NextResponse.json({ error: "PIN is required" }, { status: 400 })
    }

    const isUuid = UUID_REGEX.test(id)
    let memorial: any = null

    const admin = getSupabaseAdminSafe()
    if (admin) {
      try {
        let query = admin
          .from("memorials")
          .select("id, slug, access_pin_hash, privacy")
        query = isUuid ? query.eq("id", id) : query.eq("slug", id)
        const res = await query.maybeSingle()
        memorial = res.data
      } catch (adminErr) {
        console.error("Admin pin query error:", adminErr)
      }
    }

    if (!memorial) {
      const supabase = await createClient()
      let query = supabase
        .from("memorials")
        .select("id, slug, access_pin_hash, privacy")
      query = isUuid ? query.eq("id", id) : query.eq("slug", id)
      const res = await query.maybeSingle()
      memorial = res.data
    }

    if (!memorial) {
      return NextResponse.json({ error: "Memorial not found" }, { status: 404 })
    }

    if (memorial.privacy !== "private") {
      return NextResponse.json({ success: true, message: "Memorial is not private" })
    }

    const clientIp = getClientIp(req)
    const rateLimitKey = `${clientIp}:${memorial.id}`

    // Check brute-force lock
    const rateCheck = await checkPinRateLimit(rateLimitKey)
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
      const attemptResult = await recordFailedPinAttempt(rateLimitKey)
      if (attemptResult.locked) {
        return NextResponse.json(
          { error: "Too many failed attempts. Access locked for 15 minutes." },
          { status: 429 }
        )
      }

      return NextResponse.json(
        {
          error: `Incorrect PIN code. ${attemptResult.attemptsLeft} attempt${attemptResult.attemptsLeft === 1 ? "" : "s"} remaining.`,
        },
        { status: 401 }
      )
    }

    // PIN is correct - clear failed attempt tracker
    await clearPinAttempts(rateLimitKey)

    // Set unlock cookie for 30 days
    const cookieKey = memorial.slug || id
    const response = NextResponse.json({ success: true })
    response.cookies.set(`theirs_pin_${cookieKey}`, "unlocked", {
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    })

    return response
  } catch (err: any) {
    console.error("PIN verification error:", err)
    return NextResponse.json({ error: "Unable to verify PIN. Please try again." }, { status: 500 })
  }
}
