import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { getSupabaseAdminSafe } from "@/utils/supabase/admin"
import {
  escapeEmailHtml,
  sendTheirsEmail,
  THEIRS_SUPPORT_ADDRESS,
} from "@/lib/email/caretaker-notifications"
import { renderTheirsEmail, emailNotice } from "@/lib/email/templates"
import { SupportCategory } from "@/types/theirs"

const VALID_CATEGORIES: ReadonlySet<SupportCategory> = new Set([
  "General",
  "Billing",
  "Memorial",
  "Technical",
])

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user || !user.email) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))

    const category = body.category as SupportCategory
    if (!category || !VALID_CATEGORIES.has(category)) {
      return NextResponse.json(
        { error: "Please select a valid support category (General, Billing, Memorial, or Technical)." },
        { status: 400 }
      )
    }

    const subject = typeof body.subject === "string" ? body.subject.trim().slice(0, 200) : ""
    if (!subject || subject.length < 3) {
      return NextResponse.json(
        { error: "Please enter a subject of at least 3 characters." },
        { status: 400 }
      )
    }

    const message = typeof body.message === "string" ? body.message.trim().slice(0, 4000) : ""
    if (!message || message.length < 10) {
      return NextResponse.json(
        { error: "Please describe your question or issue with at least 10 characters." },
        { status: 400 }
      )
    }

    // Optional context: memorial_id and page_path
    const rawMemorialId = typeof body.memorial_id === "string" ? body.memorial_id.trim() : null
    const memorialId = rawMemorialId && UUID_REGEX.test(rawMemorialId) ? rawMemorialId : null
    const pagePath = typeof body.page_path === "string" ? body.page_path.trim().slice(0, 500) : null

    const db = getSupabaseAdminSafe() || supabase

    // 1. Store the support request in Supabase
    const { data: requestRecord, error: insertError } = await db
      .from("support_requests")
      .insert({
        user_id: user.id,
        email: user.email,
        memorial_id: memorialId,
        category,
        subject,
        message,
        page_path: pagePath,
      })
      .select("id, created_at")
      .single()

    if (insertError) {
      console.error("[support POST error]", insertError)
      return NextResponse.json({ error: "Failed to submit support request." }, { status: 500 })
    }

    // 2. Fetch memorial details if memorialId was provided
    let memorialSlug: string | null = null
    let memorialName: string | null = null
    if (memorialId) {
      const { data: memorial } = await db
        .from("memorials")
        .select("slug, full_name")
        .eq("id", memorialId)
        .maybeSingle()
      if (memorial) {
        memorialSlug = memorial.slug
        memorialName = memorial.full_name
      }
    }

    // 3. Dispatch notification email to support@theirs.page
    const formattedMessageHtml = message
      .split("\n")
      .map((line: string) => escapeEmailHtml(line))
      .join("<br>")

    const emailHtml = renderTheirsEmail({
      preheader: `[Support: ${category}] ${subject}`,
      eyebrow: `Support Request • ${category}`,
      title: subject,
      bodyHtml: `
        <div style="background:#f8f9fa;border:1px solid #e9ecef;border-radius:12px;padding:16px 20px;margin:0 0 20px">
          <p style="margin:0 0 8px;font-size:13px;color:#6c757d">
            <strong style="color:#212529">From:</strong> ${escapeEmailHtml(user.email)} (${user.id})
          </p>
          ${memorialId ? `<p style="margin:0 0 8px;font-size:13px;color:#6c757d"><strong style="color:#212529">Memorial:</strong> ${escapeEmailHtml(memorialName || memorialId)} (${memorialSlug ? `<a href="https://theirs.page/${memorialSlug}">/${memorialSlug}</a>` : memorialId})</p>` : ""}
          ${pagePath ? `<p style="margin:0;font-size:13px;color:#6c757d"><strong style="color:#212529">Page:</strong> ${escapeEmailHtml(pagePath)}</p>` : ""}
        </div>
        <div style="font-size:15px;line-height:1.6;color:#181925;margin:0 0 20px">
          ${formattedMessageHtml}
        </div>
      `,
      bodyHtmlAfterHero: emailNotice("Reply directly to this email to respond to the user."),
    })

    await sendTheirsEmail({
      to: THEIRS_SUPPORT_ADDRESS,
      replyTo: user.email,
      subject: `[Support - ${category}] ${subject}`,
      html: emailHtml,
      eventKey: `support/${requestRecord.id}`,
    })

    return NextResponse.json({ success: true, id: requestRecord.id })
  } catch (err) {
    console.error("[support POST fatal]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
