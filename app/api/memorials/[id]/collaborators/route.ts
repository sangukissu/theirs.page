import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { getSupabaseAdminSafe } from "@/utils/supabase/admin"
import { assertMemorialOwner } from "@/lib/memorial-auth"
import { canAccessFeature } from "@/lib/paywall"
import { createInvitationToken } from "@/lib/invitations"
import {
  escapeEmailHtml,
  getTheirsAppUrl,
  sendTheirsEmail,
  THEIRS_INVITATION_SENDER,
} from "@/lib/email/caretaker-notifications"
import { emailNotice, renderTheirsEmail } from "@/lib/email/templates"

interface RouteContext {
  params: Promise<{ id: string }>
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const authCheck = await assertMemorialOwner(id, user.id)
    if (!authCheck.authorized || !authCheck.memorial) {
      return authCheck.errorResponse || NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const db = getSupabaseAdminSafe() || supabase
    const { data: collabs, error } = await db
      .from("collaborators")
      .select("id, email, role, invitation_accepted, is_trusted, created_at")
      .eq("memorial_id", id)
      .order("created_at", { ascending: true })

    if (error) {
      console.error("Collaborators fetch error:", error)
      return NextResponse.json({ error: "Failed to fetch caretakers." }, { status: 500 })
    }

    const appUrl = getTheirsAppUrl()

    // Attach current inviteLink for any pending invites so creator can copy again
    const enrichedCollabs = (collabs || []).map((c) => {
      if (!c.invitation_accepted) {
        const token = createInvitationToken({
          collaboratorId: c.id,
          memorialId: id,
          email: c.email,
          role: c.role,
        })
        return {
          ...c,
          inviteLink: `${appUrl}/invitation/accept?token=${token}`,
        }
      }
      return c
    })

    return NextResponse.json({ collaborators: enrichedCollabs })
  } catch (err: any) {
    console.error("Collaborators GET error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
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

    const authCheck = await assertMemorialOwner(id, user.id)
    if (!authCheck.authorized || !authCheck.memorial) {
      return authCheck.errorResponse || NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Paywall Check: Caretakers and collaborators require Pro Plan ($179)
    const paywallCheck = canAccessFeature(authCheck.memorial, "collaborators")
    if (!paywallCheck.allowed) {
      return NextResponse.json(
        { error: paywallCheck.error },
        { status: paywallCheck.status || 402 }
      )
    }

    const body = await req.json().catch(() => ({}))
    const { email, role } = body

    if (typeof email !== "string" || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return NextResponse.json({ error: "Valid email address is required" }, { status: 400 })
    }

    const cleanEmail = email.trim().toLowerCase()
    const assignedRole = role === "co_admin" ? "co_admin" : "contributor"
    const isTrustedInvite = role === "trusted"

    const db = getSupabaseAdminSafe() || supabase

    // 1. Check existing collaborator record
    const { data: existing } = await db
      .from("collaborators")
      .select("id, invitation_accepted, role, is_trusted")
      .eq("memorial_id", id)
      .eq("email", cleanEmail)
      .maybeSingle()

    let targetCollab = existing

    if (existing) {
      if (existing.invitation_accepted) {
        return NextResponse.json(
          { error: "This person has already accepted their caretaker invitation." },
          { status: 409 }
        )
      }
      // Update role if changed
      if (existing.role !== assignedRole || Boolean(existing.is_trusted) !== isTrustedInvite) {
        const { error: updateError } = await db
          .from("collaborators")
          .update({ role: assignedRole, is_trusted: isTrustedInvite })
          .eq("id", existing.id)
        if (updateError) {
          console.error("Collaborator invitation update error:", updateError.code)
          return NextResponse.json({ error: "Failed to update invitation." }, { status: 500 })
        }
        targetCollab = {
          ...existing,
          role: assignedRole,
          is_trusted: isTrustedInvite,
        }
      }
    } else {
      // Create new pending invitation
      const { data: newCollab, error: insertErr } = await db
        .from("collaborators")
        .insert({
          memorial_id: id,
          email: cleanEmail,
          role: assignedRole,
          is_trusted: isTrustedInvite,
          invitation_accepted: false,
        })
        .select()
        .single()

      if (insertErr) {
        console.error("Collaborator insert error:", insertErr)
        return NextResponse.json({ error: "Failed to create invitation." }, { status: 500 })
      }
      targetCollab = newCollab
    }

    if (!targetCollab) {
      return NextResponse.json({ error: "Failed to create invitation." }, { status: 500 })
    }

    // 2. Generate secure HMAC-signed invitation token and link
    const appUrl = getTheirsAppUrl()

    const token = createInvitationToken({
      collaboratorId: targetCollab.id,
      memorialId: id,
      email: cleanEmail,
      role: assignedRole,
    })

    const inviteLink = `${appUrl}/invitation/accept?token=${token}`

    const roleLabel = assignedRole === "co_admin"
      ? "co-admin"
      : isTrustedInvite
        ? "trusted contributor"
        : "contributor"
    const roleExplanation = assignedRole === "co_admin"
      ? "You can manage the memorial, review visitor submissions, write stories, and upload media."
      : isTrustedInvite
        ? "After you accept, your text and photograph contributions can publish without waiting for family approval when automated safety checks pass. Audio and video still require caretaker review."
        : "You can contribute stories and media; a caretaker will approve them before publication."

    await sendTheirsEmail({
      from: THEIRS_INVITATION_SENDER,
      to: cleanEmail,
      eventKey: `collaborator-invite/${targetCollab.id}`,
      subject: `Invitation to care for ${String(authCheck.memorial.full_name).replace(/[\r\n]/g, " ")}'s memorial`,
      html: renderTheirsEmail({
        preheader: `You have been invited to help care for ${authCheck.memorial.full_name}’s memorial.`,
        eyebrow: "Family invitation",
        title: `Help gather ${authCheck.memorial.full_name}’s life`,
        bodyHtml: `<p style="margin:0 0 16px">Someone caring for <strong style="color:#181925">${escapeEmailHtml(String(authCheck.memorial.full_name))}</strong> has invited you to join their memorial on Theirs.</p><p style="margin:0">As a <strong style="color:#181925">${escapeEmailHtml(roleLabel)}</strong>, ${escapeEmailHtml(roleExplanation)}</p>${emailNotice("This invitation is personal. Only accept it if you recognise the memorial and expected to receive it.")}`,
        primaryAction: { label: "Accept invitation", url: inviteLink },
        secondaryAction: { label: "Open the invitation link", url: inviteLink },
      }),
    })

    return NextResponse.json({
      success: true,
      collaborator: {
        ...targetCollab,
        email: cleanEmail,
        role: assignedRole,
        is_trusted: isTrustedInvite,
        invitation_accepted: false,
        inviteLink,
      },
      inviteLink,
    })
  } catch (err: any) {
    console.error("Collaborators POST error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const authCheck = await assertMemorialOwner(id, user.id)
    if (!authCheck.authorized || !authCheck.memorial) {
      return authCheck.errorResponse || NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const collaboratorId = searchParams.get("collaboratorId")

    if (typeof collaboratorId !== "string" || !UUID_REGEX.test(collaboratorId)) {
      return NextResponse.json({ error: "collaboratorId is required" }, { status: 400 })
    }

    const db = getSupabaseAdminSafe() || supabase
    const { error } = await db
      .from("collaborators")
      .delete()
      .eq("id", collaboratorId)
      .eq("memorial_id", id)

    if (error) {
      console.error("Collaborator remove error:", error)
      return NextResponse.json({ error: "Failed to remove caretaker." }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error("Collaborators DELETE error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const authCheck = await assertMemorialOwner(id, user.id)
    if (!authCheck.authorized || !authCheck.memorial) {
      return authCheck.errorResponse || NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await req.json().catch(() => ({}))
    const { collaboratorId, is_trusted, role } = body

    if (typeof collaboratorId !== "string" || !UUID_REGEX.test(collaboratorId)) {
      return NextResponse.json({ error: "collaboratorId is required" }, { status: 400 })
    }

    const db = getSupabaseAdminSafe() || supabase
    const updatePayload: Record<string, boolean | string> = {}
    if (typeof is_trusted === "boolean") {
      if (is_trusted) {
        const { data: accepted } = await db.from("collaborators")
          .select("id")
          .eq("id", collaboratorId)
          .eq("memorial_id", id)
          .eq("invitation_accepted", true)
          .maybeSingle()
        if (!accepted) {
          return NextResponse.json(
            { error: "Trust can be enabled after the invitation is accepted." },
            { status: 409 }
          )
        }
      }
      updatePayload.is_trusted = is_trusted
    }
    if (role && ["co_admin", "contributor"].includes(role)) {
      updatePayload.role = role
    }
    if (Object.keys(updatePayload).length === 0) {
      return NextResponse.json({ error: "No valid collaborator change was provided." }, { status: 400 })
    }

    const { error } = await db
      .from("collaborators")
      .update(updatePayload)
      .eq("id", collaboratorId)
      .eq("memorial_id", id)

    if (error) {
      console.error("Collaborator PATCH error:", error)
      return NextResponse.json({ error: "Failed to update collaborator." }, { status: 500 })
    }

    return NextResponse.json({ success: true, updated: updatePayload })
  } catch (err: any) {
    console.error("Collaborator PATCH error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
