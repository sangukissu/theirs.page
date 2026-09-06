import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { getSupabaseAdminSafe } from "@/utils/supabase/admin"

function cleanProfileName(value: unknown): string {
  if (typeof value !== "string") return ""
  const name = value.trim().replace(/\s+/g, " ").slice(0, 100)
  return /[\u0000-\u001f\u007f]/.test(name) ? "" : name
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json().catch(() => null)
  const fullName = cleanProfileName(body?.full_name)
  if (fullName.length < 2) {
    return NextResponse.json({ error: "Please enter your real name." }, { status: 400 })
  }

  const db = getSupabaseAdminSafe() || supabase
  const { data: profile, error } = await db
    .from("user_profiles")
    .update({
      full_name: fullName,
      email: user.email || null,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", user.id)
    .select("full_name")
    .maybeSingle()

  if (error || !profile) {
    console.error("Profile onboarding update failed:", error)
    return NextResponse.json({ error: "Your name could not be saved. Please try again." }, { status: 500 })
  }

  return NextResponse.json({ success: true, profile })
}
