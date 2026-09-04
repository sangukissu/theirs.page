import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/utils/supabase/admin"
import { createClient } from "@/utils/supabase/server"

interface RouteContext {
  params: Promise<{ slug: string }>
}

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const { slug } = await context.params
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
      return NextResponse.json({ error: "Author name is required" }, { status: 400 })
    }

    if (!content || !content.trim()) {
      return NextResponse.json({ error: "Message or story content is required" }, { status: 400 })
    }

    // 1. Resolve memorial ID from slug
    let memorialId: string | null = null
    try {
      const { data } = await supabaseAdmin
        .from("memorials")
        .select("id, status")
        .eq("slug", slug)
        .maybeSingle()
      if (data) memorialId = data.id
    } catch {
      const supabase = await createClient()
      const { data } = await supabase
        .from("memorials")
        .select("id, status")
        .eq("slug", slug)
        .maybeSingle()
      if (data) memorialId = data.id
    }

    if (!memorialId) {
      return NextResponse.json({ error: "Memorial not found" }, { status: 404 })
    }

    // 2. Insert into appropriate table with status: pending_approval
    if (type === "guestbook") {
      const { data: entry, error } = await supabaseAdmin
        .from("guestbook_entries")
        .insert({
          memorial_id: memorialId,
          author_name: author_name.trim(),
          message: content.trim(),
          status: "pending_approval",
        })
        .select()
        .single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        entry,
        message: "Your message of remembrance has been submitted to the family for approval.",
      })
    }

    // Otherwise, treat as a memory contribution (stories, photos, moments)
    const { data: mem, error } = await supabaseAdmin
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
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      memory: mem,
      message: "Your memory has been lovingly received and sent to the family for approval.",
    })
  } catch (err: any) {
    console.error("Contribution submission error:", err)
    return NextResponse.json({ error: err.message || "Failed to submit contribution" }, { status: 500 })
  }
}
