import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdminSafe } from "@/utils/supabase/admin"
import { createClient } from "@/utils/supabase/server"

interface RouteContext {
  params: Promise<{ id: string }>
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const body = await req.json()
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

    // Verify PIN match (trimmed comparison)
    const expectedPin = memorial.access_pin_hash?.trim()
    const enteredPin = pin.trim()

    if (!expectedPin || enteredPin !== expectedPin) {
      return NextResponse.json({ error: "Incorrect PIN code" }, { status: 401 })
    }

    // PIN is correct - set unlock cookie for 30 days
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
