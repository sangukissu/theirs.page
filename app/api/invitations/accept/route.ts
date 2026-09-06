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

    const admin = getSupabaseAdminSafe() || supabase
    const { data: invitation, error: invitationError } = await admin
      .from("collaborators")
      .select("id, memorial_id, user_id, email, role, is_trusted, invitation_accepted")
      .eq("id", payload.collaboratorId)
      .eq("memorial_id", payload.memorialId)
      .maybeSingle()

    if (invitationError) {
      console.error("Failed to load invitation on accept:", invitationError)
      return NextResponse.json(
        { error: "Failed to verify invitation. Please try again in a moment." },
        { status: 500 }
      )
    }

    if (!invitation || invitation.email.toLowerCase().trim() !== payload.email.toLowerCase().trim()) {
      return NextResponse.json(
        { error: "This invitation has been revoked or replaced." },
        { status: 410 }
      )
    }

    // 2. Strict Account-Bound Identity Verification against the live record.
    const loggedInEmail = user.email.toLowerCase().trim()
    const invitedEmail = invitation.email.toLowerCase().trim()

    if (loggedInEmail !== invitedEmail) {
      return NextResponse.json(
        {
          error: `This invitation was issued for ${invitation.email}. You are currently signed in as ${user.email}. Please switch accounts to accept.`,
        },
        { status: 403 }
      )
    }

    if (
      invitation.invitation_accepted &&
      invitation.user_id &&
      invitation.user_id !== user.id
    ) {
      return NextResponse.json(
        { error: "This invitation has already been accepted by another account." },
        { status: 409 }
      )
    }

    // 3. Bind the live collaborator record. The database role and trust flag,
    // not the older token payload, remain authoritative.
    const { data: acceptedInvitation, error: updateErr } = await admin
      .from("collaborators")
      .update({
        user_id: user.id,
        invitation_accepted: true,
      })
      .eq("id", payload.collaboratorId)
      .eq("memorial_id", payload.memorialId)
      .eq("email", invitation.email)
      .select("id, role, is_trusted")
      .maybeSingle()

    if (updateErr) {
      console.error("Failed to update collaborator on accept:", updateErr)
      return NextResponse.json(
        { error: "Failed to accept invitation. Please try again in a moment." },
        { status: 500 }
      )
    }

    if (!acceptedInvitation) {
      return NextResponse.json(
        { error: "This invitation has been revoked." },
        { status: 410 }
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
      accessRole:
        acceptedInvitation.role === "co_admin"
          ? "co_admin"
          : acceptedInvitation.is_trusted
            ? "trusted"
            : "contributor",
    })
  } catch (err: any) {
    console.error("Invitation acceptance error:", err)
    return NextResponse.json(
      { error: "An unexpected error occurred while accepting the invitation." },
      { status: 500 }
    )
  }
}
