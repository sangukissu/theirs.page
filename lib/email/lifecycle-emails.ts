import "server-only"

import type { User } from "@supabase/supabase-js"
import {
  escapeEmailHtml,
  getTheirsAppUrl,
  sendTheirsEmail,
} from "@/lib/email/caretaker-notifications"
import { emailChecklist, emailNotice, renderTheirsEmail } from "@/lib/email/templates"

const NEW_ACCOUNT_WINDOW_MS = 60 * 60 * 1000


function greeting(displayName?: string | null): string {
  const name = displayName?.trim()
  return name ? `Dear ${escapeEmailHtml(name)},` : "Dear friend,"
}

export async function sendWelcomeEmailForNewUser(user: User): Promise<void> {
  if (!user.email || !user.created_at) return

  const createdAt = Date.parse(user.created_at)
  if (!Number.isFinite(createdAt) || Math.abs(Date.now() - createdAt) > NEW_ACCOUNT_WINDOW_MS) {
    return
  }

  const displayName =
    typeof user.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name
      : typeof user.user_metadata?.name === "string"
        ? user.user_metadata.name
        : null
  const dashboardUrl = `${getTheirsAppUrl()}/dashboard`

  await sendTheirsEmail({
    to: user.email,
    eventKey: `welcome/${user.id}`,
    subject: "Welcome to Theirs",
    html: renderTheirsEmail({
      preheader: "Create an online memorial for someone you love.",
      eyebrow: "Online Memorials",
      title: "Create a memorial for someone you love",
      bodyHtml: `<p style="margin:0 0 16px">${greeting(displayName)}</p><p style="margin:0 0 16px">Welcome to Theirs. We built this platform so families can create a beautiful online memorial for someone they love—bringing together their photos, stories, and tributes in one quiet, lasting place.</p><p style="margin:0 0 6px">You can start whenever you feel ready by simply entering their name. Every memorial begins as a private draft that only you can see, so you can take all the time you need.</p>`,
      heroAction: { label: "Go to your dashboard", url: dashboardUrl },
      bodyHtmlAfterHero: emailNotice("Every new memorial begins as a private draft. Nothing is visible to the public or shared with anyone until you choose to publish it."),
    }),
  })
}

export async function sendMemorialCreatedEmail(input: {
  email?: string | null
  caretakerName: string
  memorialId: string
  memorialName?: string | null
}): Promise<void> {
  if (!input.email) return

  const memorialName = input.memorialName?.trim() || "Memorial"
  const editorUrl = `${getTheirsAppUrl()}/dashboard/memorials/${input.memorialId}/editor`
  await sendTheirsEmail({
    to: input.email,
    eventKey: `memorial-created/${input.memorialId}`,
    subject: `Your draft for ${memorialName} is ready`,
    html: renderTheirsEmail({
      preheader: `Your private memorial draft for ${memorialName} is saved.`,
      eyebrow: "Private Memorial Draft",
      title: `${memorialName}’s memorial is ready for you`,
      bodyHtml: `<p style="margin:0 0 16px">${greeting(input.caretakerName)}</p><p style="margin:0 0 8px">Your draft for <strong style="color:#181925">${escapeEmailHtml(memorialName)}</strong> is safely saved. There is no rush—a meaningful memorial is assembled gradually, piece by piece.</p>`,
      heroAction: { label: `Open ${memorialName}’s memorial`, url: editorUrl },
      bodyHtmlAfterHero: `<p style="margin:24px 0 12px;font-weight:600;color:#181925">A few gentle ways to begin:</p>${emailChecklist([
        { title: "Add their portrait and dates", description: "Choose a warm, memorable photo and add their birth and passing years." },
        { title: "Share key memories and life stories", description: "Write a few sentences about what made them special, or add milestones to their timeline." },
        { title: "Invite family to contribute", description: "You don’t have to do it alone. Invite family and friends to upload their favorite photos and stories." },
        { title: "Publish whenever you are ready", description: "Your memorial stays completely private until you decide to share it with others." },
      ])}<p style="margin:20px 0 0;font-size:13px;color:#71717a">Take all the time you need. Your progress is saved automatically.</p>`,
    }),
  })
}

export async function sendMemorialPublishedEmail(input: {
  email?: string | null
  caretakerName?: string | null
  memorialId: string
  memorialName?: string | null
  slug: string
}): Promise<void> {
  if (!input.email) return
  const memorialName = input.memorialName?.trim() || "Memorial"
  const memorialUrl = `${getTheirsAppUrl()}/${input.slug}`
  const editorUrl = `${getTheirsAppUrl()}/dashboard/memorials/${input.memorialId}/editor`

  await sendTheirsEmail({
    to: input.email,
    eventKey: `memorial-published/${input.memorialId}`,
    subject: `${memorialName}’s memorial is now live`,
    html: renderTheirsEmail({
      preheader: `${memorialName}’s memorial is published and ready to share.`,
      eyebrow: "Memorial is Live",
      title: `${memorialName}’s memorial is now live`,
      bodyHtml: `<p style="margin:0 0 16px">${greeting(input.caretakerName)}</p><p style="margin:0 0 8px"><strong style="color:#181925">${escapeEmailHtml(memorialName)}</strong>’s memorial website is now published and accessible online:</p>`,
      heroAction: { label: `View ${memorialName}’s memorial`, url: memorialUrl },
      bodyHtmlAfterHero: `<p style="margin:24px 0 16px">This page is now ready for family, relatives, and friends to visit, remember, and celebrate ${escapeEmailHtml(memorialName)}’s life.</p><p style="margin:0 0 12px;font-weight:600;color:#181925">What you can do next:</p>${emailChecklist([
        { title: "Share the link with family and friends", description: `Send the memorial link to loved ones so they can visit and celebrate ${escapeEmailHtml(memorialName)} together.` },
        { title: "Visitors can contribute without an account", description: "Anyone with the link can leave tributes, write memories, and upload photos directly from their phone or computer." },
        { title: "You stay in full control", description: "As the memorial caretaker, you can review contributions, edit details, or update settings at any time from your dashboard." },
      ])}<p style="margin:24px 0 0;font-size:13px;color:#71717a">Thank you for creating a dedicated space to honor ${escapeEmailHtml(memorialName)}.</p>`,
      primaryAction: { label: "Open caretaker dashboard", url: editorUrl },
    }),
  })
}

export async function sendMemorialDeletedEmail(input: {
  email?: string | null
  caretakerName?: string | null
  memorialId: string
  memorialName?: string | null
}): Promise<void> {
  if (!input.email) return
  const memorialName = input.memorialName?.trim() || "Memorial"
  await sendTheirsEmail({
    to: input.email,
    eventKey: `memorial-deleted/${input.memorialId}`,
    subject: "Memorial deletion confirmation",
    html: renderTheirsEmail({
      preheader: `This email confirms that the memorial for ${memorialName} has been deleted.`,
      eyebrow: "Memorial Confirmation",
      title: "Memorial deletion confirmation",
      bodyHtml: `<p style="margin:0 0 16px">${greeting(input.caretakerName)}</p><p style="margin:0 0 16px">This email confirms that the memorial for <strong style="color:#181925">${escapeEmailHtml(memorialName)}</strong> has been permanently deleted from our platform per your request.</p><p style="margin:0">If you ever need to create a memorial on Theirs in the future, we are always here to support you.</p>`,
    }),
  })
}

export async function sendTrustpilotInviteEmail(input: {
  email: string
  caretakerName?: string | null
  memorialId: string
  memorialName?: string | null
  reviewUrl: string
}): Promise<boolean> {
  const memorialName = input.memorialName?.trim() || "your loved one"
  return sendTheirsEmail({
    to: input.email,
    eventKey: `trustpilot-invite/${input.memorialId}`,
    subject: "How has Theirs been for your family?",
    html: renderTheirsEmail({
      preheader: "We'd be grateful if you shared an honest review of your experience with Theirs.",
      eyebrow: "Your Experience",
      title: "How has Theirs been for your family?",
      bodyHtml: `
        <p style="margin:0 0 16px">${greeting(input.caretakerName)}</p>
        <p style="margin:0 0 16px">If you've had time to use the memorial for <strong style="color:#181925">${escapeEmailHtml(memorialName)}</strong>, we'd be grateful if you shared an honest review.</p>
        <p style="margin:0 0 6px">It helps other families decide whether Theirs is right for them.</p>
      `,
      heroAction: {
        label: "Share your experience",
        url: input.reviewUrl,
      },
      bodyHtmlAfterHero: `<p style="margin:24px 0 0;font-size:13px;color:#71717a">Thank you for taking the time to share your honest thoughts with others.</p>`,
    }),
  })
}

export async function sendTrustpilotReminderEmail(input: {
  email: string
  caretakerName?: string | null
  memorialId: string
  memorialName?: string | null
  reviewUrl: string
}): Promise<boolean> {
  const memorialName = input.memorialName?.trim() || "your loved one"
  return sendTheirsEmail({
    to: input.email,
    eventKey: `trustpilot-reminder/${input.memorialId}`,
    subject: "How has Theirs been for your family?",
    html: renderTheirsEmail({
      preheader: "A gentle follow-up regarding your experience with Theirs.",
      eyebrow: "Gentle Follow-Up",
      title: "How has Theirs been for your family?",
      bodyHtml: `
        <p style="margin:0 0 16px">${greeting(input.caretakerName)}</p>
        <p style="margin:0 0 16px">A gentle follow-up regarding the memorial for <strong style="color:#181925">${escapeEmailHtml(memorialName)}</strong>. If you've had a few moments, we'd still be deeply grateful if you shared an honest review of your experience.</p>
        <p style="margin:0 0 6px">It helps other families decide whether Theirs is right for them.</p>
      `,
      heroAction: {
        label: "Share your experience",
        url: input.reviewUrl,
      },
      bodyHtmlAfterHero: `<p style="margin:24px 0 0;font-size:13px;color:#71717a">We will not contact you again regarding reviews. Thank you for being part of Theirs.</p>`,
    }),
  })
}

