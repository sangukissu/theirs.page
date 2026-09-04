import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdminSafe } from "@/utils/supabase/admin"
import { createClient } from "@/utils/supabase/server"

interface RouteContext {
  params: Promise<{ id: string }>
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const body = await req.json()
    const {
      type, // "memory" | "guestbook" | "photo" | "moment"
      author_name,
      author_relationship,
      content,
      approx_year,
      location,
      photo_url,
    } = body

    if (!author_name || !author_name.trim()) {
      return NextResponse.json({ error: "Your name is required." }, { status: 400 })
    }

    if (!content || !content.trim()) {
      return NextResponse.json({ error: "Please write a memory or message to share." }, { status: 400 })
    }

    // 1. Resolve memorial using admin client if available, or SSR public client
    const adminClient = getSupabaseAdminSafe()
    const serverClient = await createClient()
    const db = adminClient || serverClient

    const isUuid = UUID_REGEX.test(id)
    let memorialId: string | null = null

    try {
      let query = db.from("memorials").select("id, status")
      query = isUuid ? query.eq("id", id) : query.eq("slug", id)
      const { data } = await query.maybeSingle()
      if (data) memorialId = data.id
    } catch (lookupErr) {
      console.error("Memorial lookup error:", lookupErr)
    }

    // Fallback lookup using server client if admin failed
    if (!memorialId && adminClient) {
      try {
        let query = serverClient.from("memorials").select("id, status")
        query = isUuid ? query.eq("id", id) : query.eq("slug", id)
        const { data } = await query.maybeSingle()
        if (data) memorialId = data.id
      } catch (fallbackErr) {
        console.error("Server client lookup error:", fallbackErr)
      }
    }

    if (!memorialId) {
      return NextResponse.json({ error: "Memorial not found." }, { status: 404 })
    }

    // 2. Insert into appropriate table with status: pending_approval
    if (type === "guestbook") {
      const { error } = await db
        .from("guestbook_entries")
        .insert({
          memorial_id: memorialId,
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

    // Otherwise, treat as a memory contribution (stories, photos, moments)
    const { error } = await db
      .from("memories")
      .insert({
        memorial_id: memorialId,
        author_name: author_name.trim(),
        author_relationship: author_relationship?.trim() || null,
        story: content.trim(),
        approx_year: approx_year ? Number(approx_year) : null,
        location: location?.trim() || null,
        photo_url: photo_url || null,
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
