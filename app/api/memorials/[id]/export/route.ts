import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { supabaseAdmin } from "@/utils/supabase/admin"

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // 1. Fetch Memorial
    const { data: memorial, error: memorialError } = await supabaseAdmin
      .from("memorials")
      .select("*")
      .eq("id", id)
      .single()

    if (memorialError || !memorial) {
      return NextResponse.json({ error: "Memorial not found" }, { status: 404 })
    }

    // Verify ownership or collaboration
    if (memorial.owner_id !== user.id) {
      const { data: collab } = await supabaseAdmin
        .from("collaborators")
        .select("id")
        .eq("memorial_id", id)
        .eq("user_id", user.id)
        .maybeSingle()

      if (!collab) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
    }

    // 2. Fetch all collections in parallel
    const [mediaRes, timelineRes, peopleRes, memoriesRes, guestbookRes, collabsRes] =
      await Promise.all([
        supabaseAdmin.from("media_items").select("*").eq("memorial_id", id).order("order_index", { ascending: true }),
        supabaseAdmin.from("timeline_events").select("*").eq("memorial_id", id).order("year", { ascending: true }),
        supabaseAdmin.from("people_in_life").select("*").eq("memorial_id", id).order("order_index", { ascending: true }),
        supabaseAdmin.from("memories").select("*").eq("memorial_id", id).order("created_at", { ascending: false }),
        supabaseAdmin.from("guestbook_entries").select("*").eq("memorial_id", id).order("created_at", { ascending: false }),
        supabaseAdmin.from("collaborators").select("id, email, role, created_at").eq("memorial_id", id),
      ])

    const archiveData = {
      theirs_export_version: "1.0",
      exported_at: new Date().toISOString(),
      memorial: {
        id: memorial.id,
        slug: memorial.slug,
        full_name: memorial.full_name,
        preferred_name: memorial.preferred_name,
        birth_year: memorial.birth_year,
        death_year: memorial.death_year,
        location: memorial.location,
        headline: memorial.headline,
        biography: memorial.biography,
        portrait_photo_url: memorial.portrait_photo_url,
        cover_photo_url: memorial.cover_photo_url,
        privacy: memorial.privacy,
        successor_name: memorial.successor_name,
        successor_email: memorial.successor_email,
        created_at: memorial.created_at,
      },
      media_items: mediaRes.data || [],
      timeline_events: timelineRes.data || [],
      people_in_life: peopleRes.data || [],
      memories: memoriesRes.data || [],
      guestbook_entries: guestbookRes.data || [],
      collaborators: collabsRes.data || [],
    }

    const jsonString = JSON.stringify(archiveData, null, 2)
    const filename = `${memorial.slug || "memorial"}-family-archive-${new Date().toISOString().split("T")[0]}.json`

    return new NextResponse(jsonString, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    })
  } catch (err: any) {
    console.error("Export error:", err)
    return NextResponse.json({ error: err.message || "Failed to export archive" }, { status: 500 })
  }
}
