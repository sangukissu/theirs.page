import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { getSupabaseAdminSafe } from "@/utils/supabase/admin"
import { assertMemorialAdmin } from "@/lib/memorial-auth"
import { createInvitationToken } from "@/lib/invitations"
import { resend } from "@/lib/resend"

interface RouteContext {
  params: Promise<{ id: string }>
}

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

    const authCheck = await assertMemorialAdmin(id, user.id)
    if (!authCheck.authorized || !authCheck.memorial) {
      return NextResponse.json({ error: authCheck.error || "Forbidden" }, { status: 403 })
    }

    const db = getSupabaseAdminSafe() || supabase
    const { data: collabs, error } = await db
      .from("collaborators")
      .select("id, email, role, invitation_accepted, created_at")
      .eq("memorial_id", id)
      .order("created_at", { ascending: true })

    if (error) {
      console.error("Collaborators fetch error:", error)
      return NextResponse.json({ error: "Failed to fetch caretakers." }, { status: 500 })
    }

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      "https://theirs.page"

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

    const authCheck = await assertMemorialAdmin(id, user.id)
    if (!authCheck.authorized || !authCheck.memorial) {
      return NextResponse.json({ error: authCheck.error || "Forbidden" }, { status: 403 })
    }

    const body = await req.json().catch(() => ({}))
    const { email, role } = body

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email address is required" }, { status: 400 })
    }

    const cleanEmail = email.trim().toLowerCase()
    const assignedRole = role === "co_admin" ? "co_admin" : "contributor"

    const db = getSupabaseAdminSafe() || supabase

    // 1. Check existing collaborator record
    const { data: existing } = await db
      .from("collaborators")
      .select("id, invitation_accepted, role")
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
      if (existing.role !== assignedRole) {
        await db
          .from("collaborators")
          .update({ role: assignedRole })
          .eq("id", existing.id)
      }
    } else {
      // Create new pending invitation
      const { data: newCollab, error: insertErr } = await db
        .from("collaborators")
        .insert({
          memorial_id: id,
          email: cleanEmail,
          role: assignedRole,
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
    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      "https://theirs.page"

    const token = createInvitationToken({
      collaboratorId: targetCollab.id,
      memorialId: id,
      email: cleanEmail,
      role: assignedRole,
    })

    const inviteLink = `${appUrl}/invitation/accept?token=${token}`

    // 3. Send email notification via Resend if configured
    if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== "re_placeholder_for_build") {
      try {
        await resend.emails.send({
          from: "Theirs <invites@theirs.page>",
          to: cleanEmail,
          subject: `Invitation to care for ${authCheck.memorial.full_name}'s memorial`,
          html: `
            <div style="font-family: serif; max-width: 520px; margin: 0 auto; padding: 40px 20px; color: #181925; line-height: 1.6;">
              <h2 style="font-size: 22px; font-weight: normal; margin-bottom: 16px;">Family Caretaker Invitation</h2>
              <p style="font-size: 15px; color: #444;">
                You have been invited to help care for the memory and life story of <strong>${authCheck.memorial.full_name}</strong> on Theirs.
              </p>
              <p style="font-size: 14px; color: #666; margin: 24px 0;">
                As a ${assignedRole === "co_admin" ? "co-admin" : "collaborator"}, you can approve contributed memories, write stories, and upload original photos.
              </p>
              <div style="margin: 32px 0;">
                <a href="${inviteLink}" style="background-color: #181925; color: #ffffff; padding: 12px 24px; border-radius: 24px; text-decoration: none; font-size: 13px; font-family: sans-serif; font-weight: 500; display: inline-block;">
                  Accept Invitation
                </a>
              </div>
              <p style="font-size: 12px; color: #888; margin-top: 32px; border-top: 1px solid #eaeaea; padding-top: 16px;">
                Direct link: <a href="${inviteLink}" style="color: #444;">${inviteLink}</a>
              </p>
            </div>
          `,
        })
      } catch (emailErr) {
        console.warn("Resend email delivery notice:", emailErr)
      }
    }

    return NextResponse.json({
      success: true,
      collaborator: {
        ...targetCollab,
        email: cleanEmail,
        role: assignedRole,
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

    const authCheck = await assertMemorialAdmin(id, user.id)
    if (!authCheck.authorized || !authCheck.memorial) {
      return NextResponse.json({ error: authCheck.error || "Forbidden" }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const collaboratorId = searchParams.get("collaboratorId")

    if (!collaboratorId) {
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
