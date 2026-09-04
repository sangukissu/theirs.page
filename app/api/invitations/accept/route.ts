import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { getSupabaseAdminSafe } from "@/utils/supabase/admin"
import { verifyInvitationToken } from "@/lib/invitations"

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user || !user.email) {
      return NextResponse.json(
        { error: "You must be signed in to accept an invitation." },
        { status: 401 }
      )
    }

    const body = await req.json().catch(() => ({}))
    const { token } = body

    if (!token || typeof token !== "string") {
      return NextResponse.json({ error: "Missing invitation token." }, { status: 400 })
    }

    // 1. Verify invitation signature and expiration
    const verification = verifyInvitationToken(token)
    if (!verification.valid || !verification.payload) {
      return NextResponse.json(
        { error: verification.error || "This invitation link is invalid or has expired." },
        { status: 400 }
      )
    }

    const payload = verification.payload

    // 2. Strict Account-Bound Identity Verification
    const loggedInEmail = user.email.toLowerCase().trim()
    const invitedEmail = payload.email.toLowerCase().trim()

    if (loggedInEmail !== invitedEmail) {
      return NextResponse.json(
        {
          error: `This invitation was issued for ${payload.email}. You are currently signed in as ${user.email}. Please switch accounts to accept.`,
        },
        { status: 403 }
      )
    }

    // 3. Update Collaborator Record
    const admin = getSupabaseAdminSafe() || supabase
    const { error: updateErr } = await admin
      .from("collaborators")
      .update({
        user_id: user.id,
        invitation_accepted: true,
      })
      .eq("id", payload.collaboratorId)
      .eq("memorial_id", payload.memorialId)

    if (updateErr) {
      console.error("Failed to update collaborator on accept:", updateErr)
      return NextResponse.json(
        { error: "Failed to accept invitation. Please try again in a moment." },
        { status: 500 }
      )
    }

    // 4. Fetch memorial slug for redirect
    const { data: memorial } = await admin
      .from("memorials")
      .select("id, slug")
      .eq("id", payload.memorialId)
      .single()

    return NextResponse.json({
      success: true,
      memorialId: payload.memorialId,
      slug: memorial?.slug || payload.memorialId,
    })
  } catch (err: any) {
    console.error("Invitation acceptance error:", err)
    return NextResponse.json(
      { error: "An unexpected error occurred while accepting the invitation." },
      { status: 500 }
    )
  }
}
