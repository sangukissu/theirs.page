import "server-only"

import crypto from "crypto"
import type { SupabaseClient } from "@supabase/supabase-js"
import { resend } from "@/lib/resend"

export const THEIRS_NOTIFICATION_SENDER = "Theirs <notifications@mail.theirs.page>"
export const THEIRS_INVITATION_SENDER = "Theirs <invites@mail.theirs.page>"
export const THEIRS_SUPPORT_ADDRESS = "support@theirs.page"

export function escapeEmailHtml(value: string): string {
  return value.replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;",
  })[character] || character)
}

export function getTheirsAppUrl(): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL
  return configured?.replace(/\/$/, "") || "https://theirs.page"
}

function emailDeliveryConfigured(): boolean {
  const key = process.env.RESEND_API_KEY
  return Boolean(key && key !== "re_placeholder_for_build")
}

function deliveryKey(eventKey: string, recipient: string): string {
  const recipientHash = crypto.createHash("sha256").update(recipient).digest("hex").slice(0, 16)
  return `theirs/${eventKey}/${recipientHash}`.slice(0, 256)
}

export async function sendTheirsEmail(input: {
  to: string
  subject: string
  html: string
  eventKey: string
  from?: string
  replyTo?: string
}): Promise<boolean> {
  if (!emailDeliveryConfigured()) return false

  try {
    const { error } = await resend.emails.send({
      from: input.from || THEIRS_NOTIFICATION_SENDER,
      to: input.to,
      replyTo: input.replyTo || THEIRS_SUPPORT_ADDRESS,
      subject: input.subject.replace(/[\r\n]/g, " ").slice(0, 180),
      html: input.html,
    }, {
      idempotencyKey: deliveryKey(input.eventKey, input.to),
    })
    if (error) {
      console.warn("Theirs email delivery was rejected:", error.name)
      return false
    }
    return true
  } catch (error) {
    console.warn(
      "Theirs email delivery failed:",
      error instanceof Error ? error.name : "Unknown delivery error"
    )
    return false
  }
}

export async function getCaretakerEmails(
  db: SupabaseClient,
  memorialId: string,
  ownerId: string | null | undefined
): Promise<string[]> {
  const recipients = new Set<string>()

  if (ownerId) {
    const { data: ownerProfile } = await db
      .from("user_profiles")
      .select("email")
      .eq("user_id", ownerId)
      .maybeSingle()
    if (typeof ownerProfile?.email === "string" && ownerProfile.email) {
      recipients.add(ownerProfile.email.toLowerCase())
    } else {
      const { data: authOwner } = await db.auth.admin.getUserById(ownerId)
      if (authOwner.user?.email) recipients.add(authOwner.user.email.toLowerCase())
    }
  }

  const { data: coAdmins, error } = await db
    .from("collaborators")
    .select("email")
    .eq("memorial_id", memorialId)
    .eq("role", "co_admin")
    .eq("invitation_accepted", true)
  if (error) {
    console.warn("Could not resolve co-admin notification recipients:", error.code)
  } else {
    for (const collaborator of coAdmins || []) {
      if (typeof collaborator.email === "string" && collaborator.email) {
        recipients.add(collaborator.email.toLowerCase())
      }
    }
  }

  return [...recipients]
}

export async function notifyCaretakers(input: {
  db: SupabaseClient
  memorialId: string
  ownerId?: string | null
  subject: string
  html: string
  eventKey: string
  replyTo?: string
}): Promise<void> {
  const recipients = await getCaretakerEmails(input.db, input.memorialId, input.ownerId)
  await Promise.all(recipients.map((to) => sendTheirsEmail({
    to,
    subject: input.subject,
    html: input.html,
    eventKey: input.eventKey,
    replyTo: input.replyTo,
  })))
}
