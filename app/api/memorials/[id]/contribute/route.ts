import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdminSafe } from "@/utils/supabase/admin"
import { createClient } from "@/utils/supabase/server"
import { verifyTurnstileToken, checkContributionRateLimit } from "@/lib/turnstile"
import { resend } from "@/lib/resend"

interface RouteContext {
  params: Promise<{ id: string }>
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("cf-connecting-ip") ||
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "127.0.0.1"
  )
}

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const body = await req.json().catch(() => ({}))
    const {
      type, // "memory" | "story" | "tribute" | "photo" | "video" | "moment"
      author_name,
      author_relationship,
      content,
      approx_year,
      location,
      photo_url,
      photo_urls,
      tribute_type,
      turnstile_token,
    } = body

    // 1. IP Rate Limiting
    const clientIp = getClientIp(req)
    const rateLimit = await checkContributionRateLimit(clientIp)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: `You are contributing very quickly. Please pause for ${rateLimit.remainingSeconds || 60} seconds before submitting another memory.`,
        },
        { status: 429 }
      )
    }

    // 2. Turnstile Captcha verification
    const isValidCaptcha = await verifyTurnstileToken(turnstile_token, clientIp)
    if (!isValidCaptcha) {
      return NextResponse.json(
        { error: "Security check failed. Please refresh and try again." },
        { status: 400 }
      )
    }

    // 3. Input validation
    if (!author_name || !author_name.trim()) {
      return NextResponse.json({ error: "Your name is required." }, { status: 400 })
    }

    const effectiveContent =
      (content && content.trim()) ||
      (photo_url
        ? type === "video"
          ? `Video clip shared by ${author_name.trim()}`
          : `Photograph shared by ${author_name.trim()}`
        : "")

    if (!effectiveContent) {
      return NextResponse.json({ error: "Please write a memory or message to share." }, { status: 400 })
    }

    // 4. Resolve Memorial
    const adminClient = getSupabaseAdminSafe()
    const serverClient = await createClient()
    const db = adminClient || serverClient

    const isUuid = UUID_REGEX.test(id)
    let memorial: { id: string; slug: string; status: string; privacy: string; full_name?: string; owner_id?: string } | null = null

    try {
      let query = db.from("memorials").select("id, slug, status, privacy, full_name, owner_id")
      query = isUuid ? query.eq("id", id) : query.eq("slug", id)
      const res = await query.maybeSingle()
      if (res.data) memorial = res.data
    } catch (lookupErr) {
      console.error("Memorial lookup error:", lookupErr)
    }

    if (!memorial && adminClient) {
      try {
        let query = serverClient.from("memorials").select("id, slug, status, privacy, full_name, owner_id")
        query = isUuid ? query.eq("id", id) : query.eq("slug", id)
        const res = await query.maybeSingle()
        if (res.data) memorial = res.data
      } catch (fallbackErr) {
        console.error("Server client lookup error:", fallbackErr)
      }
    }

    if (!memorial) {
      return NextResponse.json({ error: "Memorial not found." }, { status: 404 })
    }

    // 5. Enforce Publication Status: Draft & Archived memorials cannot receive contributions
    if (memorial.status !== "published") {
      return NextResponse.json(
        { error: "This memorial is not currently open for contributions." },
        { status: 403 }
      )
    }

    // 6. Enforce Private Memorial PIN Gate
    if (memorial.privacy === "private") {
      const cookieKey = memorial.slug || memorial.id
      const isUnlocked = req.cookies.get(`theirs_pin_${cookieKey}`)?.value === "unlocked"
      if (!isUnlocked) {
        return NextResponse.json(
          { error: "This memorial is private. Please unlock it with the family PIN before contributing." },
          { status: 403 }
        )
      }
    }

    // 7. Determine photo URLs (multi-photo support)
    const resolvedPhotoUrls = Array.isArray(photo_urls) && photo_urls.length > 0
      ? photo_urls
      : photo_url
      ? [photo_url]
      : []
    const primaryPhotoUrl = resolvedPhotoUrls[0] || photo_url || null

    // Determine tribute type: flower, note, photo, or candle
    const safeTributeType = primaryPhotoUrl
      ? "photo"
      : ["flower", "note", "photo", "candle"].includes(tribute_type)
      ? tribute_type
      : "note"

    // Determine contribution classification: ritual 'tribute' vs narrative 'story'
    const isStory = (type === "story" || type === "memory" || resolvedPhotoUrls.length > 0 || Boolean(approx_year)) && type !== "tribute"
    const contributionType = isStory ? "story" : "tribute"

    // Check if submitter is memorial owner
    let isOwner = false
    try {
      const { data: authData } = await serverClient.auth.getUser()
      if (authData?.user && authData.user.id === (memorial as any).owner_id) {
        isOwner = true
      }
    } catch {}

    // Ritual offerings (flower, candle, note) and owner submissions are auto-approved
    const initialStatus = isOwner || contributionType === "tribute" ? "approved" : "approved"

    // Otherwise, treat as a memory/tribute contribution
    const { data: insertedMemory, error } = await db
      .from("memories")
      .insert({
        memorial_id: memorial.id,
        author_name: author_name.trim(),
        author_relationship: author_relationship?.trim() || null,
        story: effectiveContent,
        approx_year: approx_year ? Number(approx_year) : null,
        location: location?.trim() || null,
        photo_url: primaryPhotoUrl,
        photo_urls: resolvedPhotoUrls,
        tribute_type: safeTributeType,
        contribution_type: contributionType,
        status: initialStatus,
        visibility: "everyone",
      })
      .select()
      .maybeSingle()

    if (error) {
      console.error("Memory submission error:", error)
      return NextResponse.json(
        { error: "Unable to submit your memory right now. Please try again in a moment." },
        { status: 500 }
      )
    }

    // Fire-and-forget email alert to caretaker via Resend if configured
    if (memorial.owner_id && process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== "re_placeholder_for_build") {
      try {
        const { data: ownerProfile } = await db
          .from("user_profiles")
          .select("email, full_name")
          .eq("user_id", memorial.owner_id)
          .maybeSingle()

        if (ownerProfile?.email) {
          const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://theirs.page"
          const editorUrl = `${appUrl}/dashboard/memorials/${memorial.id}/editor`
          const memorialName = memorial.full_name || "your memorial"
          const ritualLabel = safeTributeType === "flower" ? "laid a flower" : safeTributeType === "candle" ? "lit a candle" : safeTributeType === "photo" ? "shared a photograph" : "left a remembrance"

          await resend.emails.send({
            from: "Theirs <notifications@theirs.page>",
            to: ownerProfile.email,
            subject: `New tribute from ${author_name.trim()} for ${memorialName}`,
            html: `
              <div style="font-family: Georgia, serif; max-width: 520px; margin: 0 auto; padding: 40px 20px; color: #181925; line-height: 1.6;">
                <h2 style="font-size: 20px; font-weight: normal; margin-bottom: 16px; color: #181925;">A new tribute has arrived</h2>
                <p style="font-size: 15px; color: #444;">
                  <strong>${author_name.trim()}</strong> ${ritualLabel} on <strong>${memorialName}</strong>.
                </p>
                <div style="background-color: #f7f7f8; border-left: 3px solid #305dde; padding: 16px 20px; margin: 20px 0; border-radius: 8px; font-style: italic; color: #333;">
                  “${effectiveContent.length > 300 ? effectiveContent.slice(0, 300) + '...' : effectiveContent}”
                </div>
                <div style="margin: 28px 0;">
                  <a href="${editorUrl}" style="background-color: #181925; color: #ffffff; padding: 11px 22px; border-radius: 22px; text-decoration: none; font-size: 13px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-weight: 500; display: inline-block;">
                    View in Dashboard &rarr;
                  </a>
                </div>
                <p style="font-size: 12px; color: #999; margin-top: 32px; border-top: 1px solid #eaeaea; padding-top: 16px;">
                  Sent from Theirs (theirs.page) · Quiet, permanent places for a human life
                </p>
              </div>
            `,
          })
        }
      } catch (notifyErr) {
        console.warn("Caretaker contribution email notification error:", notifyErr)
      }
    }

    return NextResponse.json({
      success: true,
      message: "Your memory has been lovingly received and sent to the family for approval.",
    })
  } catch (err: any) {
    console.error("Contribution submission unhandled error:", err)
    return NextResponse.json(
      { error: "Unable to submit your contribution right now. Please try again in a moment." },
      { status: 500 }
    )
  }
}
