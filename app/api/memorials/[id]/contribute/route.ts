import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdminSafe } from "@/utils/supabase/admin"
import { createClient } from "@/utils/supabase/server"
import { verifyTurnstileToken, checkContributionRateLimit } from "@/lib/turnstile"

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
      type, // "memory" | "guestbook" | "photo" | "moment"
      author_name,
      author_relationship,
      content,
      approx_year,
      location,
      photo_url,
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
    let memorial: { id: string; slug: string; status: string; privacy: string } | null = null

    try {
      let query = db.from("memorials").select("id, slug, status, privacy")
      query = isUuid ? query.eq("id", id) : query.eq("slug", id)
      const res = await query.maybeSingle()
      if (res.data) memorial = res.data
    } catch (lookupErr) {
      console.error("Memorial lookup error:", lookupErr)
    }

    if (!memorial && adminClient) {
      try {
        let query = serverClient.from("memorials").select("id, slug, status, privacy")
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

    // 7. Insert into appropriate table with status: pending_approval
    if (type === "guestbook") {
      const { error } = await db
        .from("guestbook_entries")
        .insert({
          memorial_id: memorial.id,
          author_name: author_name.trim(),
          message: content.trim(),
          status: "pending_approval",
        })

      if (error) {
        console.error("Guestbook submission error:", error)
        return NextResponse.json(
          { error: "Unable to submit your message right now. Please try again in a moment." },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: "Your message of remembrance has been submitted to the family for approval.",
      })
    }

    // Determine tribute type: flower, note, photo, or candle
    const safeTributeType = photo_url
      ? "photo"
      : ["flower", "note", "photo", "candle"].includes(tribute_type)
      ? tribute_type
      : "note"

    // Otherwise, treat as a memory contribution (stories, photos, moments)
    const { error } = await db
      .from("memories")
      .insert({
        memorial_id: memorial.id,
        author_name: author_name.trim(),
        author_relationship: author_relationship?.trim() || null,
        story: effectiveContent,
        approx_year: approx_year ? Number(approx_year) : null,
        location: location?.trim() || null,
        photo_url: photo_url || null,
        tribute_type: safeTributeType,
        status: "pending_approval",
        visibility: "everyone",
      })

    if (error) {
      console.error("Memory submission error:", error)
      return NextResponse.json(
        { error: "Unable to submit your memory right now. Please try again in a moment." },
        { status: 500 }
      )
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
