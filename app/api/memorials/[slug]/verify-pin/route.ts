import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/utils/supabase/admin"
import { createClient } from "@/utils/supabase/server"

interface RouteContext {
  params: Promise<{ slug: string }>
}

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const { slug } = await context.params
    const body = await req.json()
    const { pin } = body

    if (!pin || typeof pin !== "string") {
      return NextResponse.json({ error: "PIN is required" }, { status: 400 })
    }

    // Try admin fetch first, fallback to server client
    let memorial: any = null
    try {
      const res = await supabaseAdmin
        .from("memorials")
        .select("id, access_pin_hash, privacy")
        .eq("slug", slug)
        .maybeSingle()
      memorial = res.data
    } catch {
      const supabase = await createClient()
      const res = await supabase
        .from("memorials")
        .select("id, access_pin_hash, privacy")
        .eq("slug", slug)
        .maybeSingle()
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
    const response = NextResponse.json({ success: true })
    response.cookies.set(`theirs_pin_${slug}`, "unlocked", {
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    })

    return response
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to verify PIN" }, { status: 500 })
  }
}
