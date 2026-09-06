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
      preheader: "Your quiet place to gather a life is ready.",
      eyebrow: "Welcome to Theirs",
      title: "A place dedicated to a human life",
      bodyHtml: `<p style="margin:0 0 16px">${greeting(displayName)}</p><p style="margin:0 0 16px">You now have a quiet, dedicated place on the internet to bring together the stories, photographs, and small details that made someone unmistakably themselves.</p><p style="margin:0 0 6px">There is no pressure to finish everything today. Start with what feels easiest; you can return whenever you are ready.</p>`,
      heroAction: { label: "Continue to your dashboard", url: dashboardUrl },
      bodyHtmlAfterHero: emailNotice("Every new memorial begins as a private draft. Nothing is shared with anyone else until you choose to publish it."),
    }),
  })
}

export async function sendMemorialCreatedEmail(input: {
  email?: string | null
  caretakerName: string
  memorialId: string
  memorialName: string
}): Promise<void> {
  if (!input.email) return

  const editorUrl = `${getTheirsAppUrl()}/dashboard/memorials/${input.memorialId}/editor`
  await sendTheirsEmail({
    to: input.email,
    eventKey: `memorial-created/${input.memorialId}`,
    subject: `Your draft for ${input.memorialName} is ready`,
    html: renderTheirsEmail({
      preheader: `Your private draft for ${input.memorialName} is ready.`,
      eyebrow: "Private draft ready",
      title: `${input.memorialName}’s memorial is ready for you`,
      bodyHtml: `<p style="margin:0 0 16px">${greeting(input.caretakerName)}</p><p style="margin:0 0 8px">Your draft for <strong style="color:#181925">${escapeEmailHtml(input.memorialName)}</strong> is safely saved as a private draft. A thoughtful page does not need to be completed all at once—take your time.</p>`,
      heroAction: { label: `Continue ${input.memorialName}’s memorial`, url: editorUrl },
      bodyHtmlAfterHero: `<p style="margin:26px 0 12px;font-weight:600;color:#181925">Here are three gentle steps to begin:</p>${emailChecklist([
        { title: "Choose a portrait photo", description: "Use a warm, memorable image that immediately feels like them." },
        { title: "Write the opening of their story", description: "A few honest sentences are enough to begin." },
        { title: "Preview and publish when ready", description: "The page remains completely private until you choose to publish it." },
      ])}<p style="margin:20px 0 0;font-size:13px;color:#71737a">Take all the time you need. We are here whenever you wish to return.</p>`,
    }),
  })
}

export async function sendMemorialPublishedEmail(input: {
  email?: string | null
  caretakerName?: string | null
  memorialId: string
  memorialName: string
  slug: string
}): Promise<void> {
  if (!input.email) return
  const memorialUrl = `${getTheirsAppUrl()}/${input.slug}`
  await sendTheirsEmail({
    to: input.email,
    eventKey: `memorial-published/${input.memorialId}`,
    subject: `${input.memorialName}’s memorial is now live`,
    html: renderTheirsEmail({
      preheader: `${input.memorialName}’s memorial is live and ready to share.`,
      eyebrow: "Memorial is live",
      title: `${input.memorialName}’s memorial is now live`,
      bodyHtml: `<p style="margin:0 0 16px">${greeting(input.caretakerName)}</p><p style="margin:0 0 8px"><strong style="color:#181925">${escapeEmailHtml(input.memorialName)}</strong>’s memorial website is now live and can be accessed here:</p>`,
      heroAction: { label: `Visit ${input.memorialName}’s memorial`, url: memorialUrl },
      heroSubAction: { label: "Click here to get the link you can share with others", url: memorialUrl },
      bodyHtmlAfterHero: `<p style="margin:26px 0 16px">We hope this website becomes a comforting space to honor ${escapeEmailHtml(input.memorialName)}, share special memories, and support one another.</p><p style="margin:0 0 12px;font-weight:600;color:#181925">Here are some suggestions to help you get started:</p>${emailChecklist([
        { title: "Add a cover photo", description: `Choose a memorable photo that helps visitors feel connected to ${escapeEmailHtml(input.memorialName)}.` },
        { title: "Leave a tribute", description: `Share a short message in ${escapeEmailHtml(input.memorialName)}’s memory or a few words of support for those close to them.` },
        { title: "Invite others", description: `Your online memorial will be most meaningful if created together. Share it now with those who knew ${escapeEmailHtml(input.memorialName)} so they can add their own memories and photos.` },
      ])}<p style="margin:24px 0 0;font-size:13px;color:#71737a">Thank you for choosing Theirs to remember your loved one.</p>`,
    }),
  })
}

export async function sendMemorialDeletedEmail(input: {
  email?: string | null
  caretakerName?: string | null
  memorialId: string
  memorialName: string
}): Promise<void> {
  if (!input.email) return
  await sendTheirsEmail({
    to: input.email,
    eventKey: `memorial-deleted/${input.memorialId}`,
    subject: "Memorial deletion confirmation",
    html: renderTheirsEmail({
      preheader: `This email confirms that the memorial for ${input.memorialName} has been deleted.`,
      eyebrow: "Memorial deletion confirmation",
      title: "Memorial deletion confirmation",
      bodyHtml: `<p style="margin:0 0 16px">${greeting(input.caretakerName)}</p><p style="margin:0 0 16px">This email confirms that the memorial for <strong style="color:#181925">${escapeEmailHtml(input.memorialName)}</strong> has been deleted from our platform. We understand there are many reasons why you may need to do this, and we respect your decision.</p><p style="margin:0">If you ever choose to create a new tribute on Theirs in the future, we are here to support you.</p>`,
    }),
  })
}

