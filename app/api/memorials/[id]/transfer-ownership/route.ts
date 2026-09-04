import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { supabaseAdmin } from "@/utils/supabase/admin"

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: memorial } = await supabaseAdmin
      .from("memorials")
      .select("owner_id, slug")
      .eq("id", id)
      .single()

    if (!memorial || memorial.owner_id !== user.id) {
      return NextResponse.json({ error: "Forbidden: Only the owner can transfer ownership." }, { status: 403 })
    }

    const body = await req.json()
    const { targetEmail, targetName } = body

    if (!targetEmail || !targetEmail.includes("@")) {
      return NextResponse.json({ error: "Valid recipient email is required" }, { status: 400 })
    }

    const cleanEmail = targetEmail.trim().toLowerCase()

    // 1. Check if recipient exists in user_profiles
    const { data: targetProfile } = await supabaseAdmin
      .from("user_profiles")
      .select("user_id, email")
      .eq("email", cleanEmail)
      .maybeSingle()

    if (targetProfile?.user_id) {
      // Direct transfer of ownership to registered user
      const { error: transferError } = await supabaseAdmin
        .from("memorials")
        .update({
          owner_id: targetProfile.user_id,
          successor_email: cleanEmail,
          successor_name: targetName?.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)

      if (transferError) {
        return NextResponse.json({ error: transferError.message }, { status: 500 })
      }

      // Keep previous owner as a co-admin collaborator so they aren't completely removed
      await supabaseAdmin
        .from("collaborators")
        .upsert({
          memorial_id: id,
          user_id: user.id,
          email: user.email || "",
          role: "co_admin",
          invitation_accepted: true,
        }, { onConflict: "memorial_id,email" })

      return NextResponse.json({
        success: true,
        transferredDirectly: true,
        message: `Ownership successfully transferred to ${cleanEmail}. You remain a co-admin.`,
      })
    }

    // 2. If target is not yet registered, designate as designated successor
    const { error: designateError } = await supabaseAdmin
      .from("memorials")
      .update({
        successor_email: cleanEmail,
        successor_name: targetName?.trim() || cleanEmail,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)

    if (designateError) {
      return NextResponse.json({ error: designateError.message }, { status: 500 })
    }

    // Also invite them as co_admin collaborator
    await supabaseAdmin
      .from("collaborators")
      .upsert({
        memorial_id: id,
        email: cleanEmail,
        role: "co_admin",
        invitation_accepted: false,
      }, { onConflict: "memorial_id,email" })

    return NextResponse.json({
      success: true,
      transferredDirectly: false,
      message: `${cleanEmail} has been designated as the successor caretaker and invited as co-admin.`,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to transfer ownership" }, { status: 500 })
  }
}
