import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { getSupabaseAdminSafe } from "@/utils/supabase/admin"
import { assertMemorialAdmin } from "@/lib/memorial-auth"

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

    const authCheck = await assertMemorialAdmin(id, user.id)
    if (!authCheck.authorized || !authCheck.memorial) {
      return NextResponse.json({ error: authCheck.error || "Forbidden" }, { status: 403 })
    }

    const memorial = authCheck.memorial
    const db = getSupabaseAdminSafe() || supabase

    // Fetch all collections in parallel
    const [mediaRes, timelineRes, peopleRes, memoriesRes, guestbookRes, collabsRes] =
      await Promise.all([
        db
          .from("media_items")
          .select("*")
          .eq("memorial_id", memorial.id)
          .order("order_index", { ascending: true }),
        db
          .from("timeline_events")
          .select("*")
          .eq("memorial_id", memorial.id)
          .order("year", { ascending: true }),
        db
          .from("people_in_life")
          .select("*")
          .eq("memorial_id", memorial.id)
          .order("order_index", { ascending: true }),
        db
          .from("memories")
          .select("*")
          .eq("memorial_id", memorial.id)
          .eq("status", "approved")
          .order("created_at", { ascending: false }),
        db
          .from("guestbook_entries")
          .select("*")
          .eq("memorial_id", memorial.id)
          .eq("status", "approved")
          .order("created_at", { ascending: false }),
        db
          .from("collaborators")
          .select("id, email, role, invitation_accepted, created_at")
          .eq("memorial_id", memorial.id),
      ])

    // Structured Preservation Package (Theirs Open Family Archive Standard)
    const archiveData = {
      archive_format: "theirs_family_archive_v2",
      preservation_guarantee:
        "All memories, timeline milestones, stories, and original media assets are preserved in this open JSON structure. Original media files remain downloadable via direct URLs without platform lock-in.",
      exported_at: new Date().toISOString(),
      memorial_identity: {
        id: memorial.id,
        slug: memorial.slug,
        full_name: memorial.full_name,
        preferred_name: memorial.preferred_name || null,
        birth_year: memorial.birth_year || null,
        death_year: memorial.death_year || null,
        location: memorial.location || null,
        headline: memorial.headline || null,
        biography: memorial.biography || null,
        portrait_photo_url: memorial.portrait_photo_url || null,
        cover_photo_url: memorial.cover_photo_url || null,
        status: memorial.status,
        privacy: memorial.privacy,
        is_paid_complete: Boolean(memorial.is_paid),
        successor_name: memorial.successor_name || null,
        successor_email: memorial.successor_email || null,
        created_at: memorial.created_at,
      },
      life_timeline: (timelineRes.data || []).map((t) => ({
        year: t.year,
        month: t.month,
        day: t.day,
        title: t.title,
        description: t.description,
        photo_url: t.photo_url,
      })),
      family_memories_and_stories: (memoriesRes.data || []).map((m) => ({
        author_name: m.author_name,
        author_relationship: m.author_relationship,
        story: m.story,
        approx_year: m.approx_year,
        location: m.location,
        photo_url: m.photo_url,
        contributed_at: m.created_at,
      })),
      people_in_life: (peopleRes.data || []).map((p) => ({
        name: p.name,
        relationship: p.relationship,
        photo_url: p.photo_url,
        note: p.note,
      })),
      guestbook_messages: (guestbookRes.data || []).map((g) => ({
        author_name: g.author_name,
        message: g.message,
        date: g.created_at,
      })),
      media_preservation_manifest: (mediaRes.data || []).map((media) => ({
        media_type: media.media_type,
        url: media.url,
        original_url: media.original_url || media.url,
        caption: media.caption,
        approx_year: media.approx_year,
        location: media.location,
        tagged_people: media.tagged_people,
        uploaded_at: media.created_at,
      })),
      caretakers: (collabsRes.data || []).map((c) => ({
        email: c.email,
        role: c.role,
        invitation_accepted: c.invitation_accepted,
        created_at: c.created_at,
      })),
    }

    const jsonString = JSON.stringify(archiveData, null, 2)
    const dateStamp = new Date().toISOString().split("T")[0]
    const filename = `${memorial.slug || "memorial"}-family-archive-${dateStamp}.json`

    return new NextResponse(jsonString, {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    })
  } catch (err: any) {
    console.error("Export error:", err)
    return NextResponse.json(
      { error: "Failed to export archive. Please try again." },
      { status: 500 }
    )
  }
}
