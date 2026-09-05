import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdminSafe } from "@/utils/supabase/admin"
import { createClient } from "@/utils/supabase/server"
import { checkDurableRateLimit, verifyTurnstileToken } from "@/lib/turnstile"
import { resend } from "@/lib/resend"
import { getMemorialPinCookieName, verifyPinAccessToken } from "@/lib/security/pin"

interface RouteContext {
  params: Promise<{ id: string }>
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function clientIp(request: NextRequest) {
  return request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "127.0.0.1"
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character] || character)
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

    if (memorial.owner_id && process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== "re_placeholder_for_build") {
      try {
        const { data: owner } = await db.from("user_profiles").select("email, full_name").eq("user_id", memorial.owner_id).maybeSingle()
        let recipientEmail = owner?.email || null
        if (!recipientEmail) {
          const { data: authOwner } = await db.auth.admin.getUserById(memorial.owner_id)
          recipientEmail = authOwner.user?.email || null
        }
        if (recipientEmail) {
          const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://theirs.page"
          const inboxUrl = `${appUrl}/dashboard/memorials/${memorial.id}/editor?tab=moderation&view=messages`
          await resend.emails.send({
            from: "Theirs <notifications@theirs.page>",
            to: recipientEmail,
            replyTo: senderEmail,
            subject: `${senderName} sent a private message about ${memorial.full_name}`,
            html: `
              <div style="background:#f5f6f8;padding:36px 16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#181925">
                <div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #e3e4e7;border-radius:20px;overflow:hidden">
                  <div style="height:5px;background:#305dde"></div>
                  <div style="padding:30px">
                    <p style="margin:0 0 8px;color:#305dde;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase">Private caretaker message</p>
                    <h1 style="margin:0 0 18px;font-family:Georgia,serif;font-size:25px;font-weight:400">A visitor wrote about ${escapeHtml(memorial.full_name)}</h1>
                    <p style="margin:0 0 18px;font-size:14px;color:#666970">From <strong style="color:#303136">${escapeHtml(senderName)}</strong> · ${escapeHtml(senderEmail)}</p>
                    <div style="border-left:3px solid #305dde;background:#f7f8fc;border-radius:0 12px 12px 0;padding:18px 20px;white-space:pre-wrap;font-family:Georgia,serif;font-size:16px;line-height:1.65;color:#303136">${escapeHtml(message)}</div>
                    <div style="margin-top:26px">
                      <a href="${inboxUrl}" style="display:inline-block;border-radius:999px;background:#305dde;color:#fff;padding:12px 20px;text-decoration:none;font-size:13px;font-weight:700">Open message in dashboard</a>
                    </div>
                    <p style="margin:24px 0 0;border-top:1px solid #ececef;padding-top:16px;color:#8a8c92;font-size:12px">Replying to this email will reply directly to ${escapeHtml(senderName)}.</p>
                  </div>
                </div>
              </div>`,
          })
        }
      } catch (emailError) {
        console.warn("Caretaker message email error:", emailError)
      }
    }

    return NextResponse.json({ success: true, id: inserted.id })
  } catch (error) {
    console.error("Caretaker message route error:", error)
    return NextResponse.json({ error: "Your message could not be sent right now." }, { status: 500 })
  }
}
