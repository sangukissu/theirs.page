import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdminSafe } from "@/utils/supabase/admin"
import { createClient } from "@/utils/supabase/server"
import { checkDurableRateLimit, verifyTurnstileToken } from "@/lib/turnstile"
import { getMemorialPinCookieName, verifyPinAccessToken } from "@/lib/security/pin"
import {
  escapeEmailHtml,
  getTheirsAppUrl,
  notifyCaretakers,
} from "@/lib/email/caretaker-notifications"
import { emailNotice, emailQuoteCard, renderTheirsEmail } from "@/lib/email/templates"

interface RouteContext {
  params: Promise<{ id: string }>
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function clientIp(request: NextRequest) {
  return request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "127.0.0.1"
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const body = await request.json().catch(() => ({}))
    const senderName = typeof body.sender_name === "string" ? body.sender_name.trim() : ""
    const senderEmail = typeof body.sender_email === "string" ? body.sender_email.trim().toLowerCase() : ""
    const message = typeof body.message === "string" ? body.message.trim() : ""

    if (!senderName || senderName.length > 100) return NextResponse.json({ error: "Please enter your name." }, { status: 400 })
    if (!EMAIL_REGEX.test(senderEmail) || senderEmail.length > 254) return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 })
    if (message.length < 10 || message.length > 4000) return NextResponse.json({ error: "Please write a message between 10 and 4,000 characters." }, { status: 400 })

    const ip = clientIp(request)
    const rateLimit = await checkDurableRateLimit("caretaker-message", ip, 5, 600)
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: `Please wait ${rateLimit.remainingSeconds || 60} seconds before sending another message.` }, { status: 429 })
    }

    if (!(await verifyTurnstileToken(body.turnstile_token, ip, "caretaker_message"))) {
      return NextResponse.json({ error: "Security check failed. Please refresh and try again." }, { status: 400 })
    }

    const db = getSupabaseAdminSafe()
    if (!db) return NextResponse.json({ error: "Private messaging is temporarily unavailable." }, { status: 503 })

    let memorialQuery = db.from("memorials").select("id, slug, full_name, owner_id, status, privacy, access_pin_hash")
    memorialQuery = UUID_REGEX.test(id) ? memorialQuery.eq("id", id) : memorialQuery.eq("slug", id)
    const { data: memorial } = await memorialQuery.maybeSingle()
    if (!memorial) return NextResponse.json({ error: "Memorial not found." }, { status: 404 })
    if (memorial.status !== "published") return NextResponse.json({ error: "This memorial is not accepting messages." }, { status: 403 })
    const serverClient = await createClient()
    const { data: { user } } = await serverClient.auth.getUser()
    const isOwner = Boolean(user?.id && user.id === memorial.owner_id)
    const hasPinAccess = verifyPinAccessToken(
      request.cookies.get(getMemorialPinCookieName(memorial.slug))?.value,
      memorial.id,
      memorial.access_pin_hash
    )
    if (memorial.privacy === "private" && !isOwner && !hasPinAccess) {
      return NextResponse.json({ error: "Please unlock this private memorial before sending a message." }, { status: 403 })
    }

    const { data: inserted, error: insertError } = await db.from("caretaker_messages").insert({
      memorial_id: memorial.id,
      sender_name: senderName,
      sender_email: senderEmail,
      message,
      status: "unread",
    }).select("id").single()

    if (insertError) {
      console.error("Caretaker message insert error:", insertError)
      return NextResponse.json({ error: "Your message could not be saved. Please try again." }, { status: 500 })
    }

    const inboxUrl = `${getTheirsAppUrl()}/dashboard/memorials/${memorial.id}/editor?tab=moderation&view=messages`
    await notifyCaretakers({
      db,
      memorialId: memorial.id,
      ownerId: memorial.owner_id,
      eventKey: `caretaker-message/${inserted.id}`,
      replyTo: senderEmail,
      subject: `${senderName} sent a private message about ${memorial.full_name}`,
      html: renderTheirsEmail({
        preheader: `${senderName} sent a private message about ${memorial.full_name}.`,
        eyebrow: "Private caretaker message",
        title: `A visitor wrote about ${memorial.full_name}`,
        bodyHtml: `<p style="margin:0">From <strong style="color:#181925">${escapeEmailHtml(senderName)}</strong><br><span style="color:#74767c">${escapeEmailHtml(senderEmail)}</span></p>${emailQuoteCard(message)}${emailNotice(`Reply to this email to answer ${senderName} directly.`)}`,
        primaryAction: { label: "Open private message", url: inboxUrl },
      }),
    })

    return NextResponse.json({ success: true, id: inserted.id })
  } catch (error) {
    console.error("Caretaker message route error:", error)
    return NextResponse.json({ error: "Your message could not be sent right now." }, { status: 500 })
  }
}
