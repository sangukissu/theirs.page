import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { getSupabaseAdminSafe } from "@/utils/supabase/admin"
import { assertMemorialAdmin } from "@/lib/memorial-auth"
import {
  normalizeMemorialSlug,
  memorialSlugSchema,
  RESERVED_MEMORIAL_SLUGS,
} from "@/lib/memorial-slug"
import { hashPin } from "@/lib/security/pin"

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

    const { errorResponse } = await assertMemorialAdmin(id, user.id)
    if (errorResponse) return errorResponse

    const db = getSupabaseAdminSafe() || supabase

    // 1. Fetch Memorial
    const { data: memorial, error: memorialError } = await db
      .from("memorials")
      .select("*")
      .eq("id", id)
      .maybeSingle()

    if (memorialError || !memorial) {
      return NextResponse.json({ error: "Memorial not found" }, { status: 404 })
    }

    // 2. Fetch associated relations in parallel
    const [mediaRes, timelineRes, peopleRes, memoriesRes, guestbookRes] = await Promise.all([
      db.from("media_items").select("*").eq("memorial_id", id).order("order_index", { ascending: true }),
      db.from("timeline_events").select("*").eq("memorial_id", id).order("year", { ascending: true }),
      db.from("people_in_life").select("*").eq("memorial_id", id).order("order_index", { ascending: true }),
      db.from("memories").select("*").eq("memorial_id", id).order("created_at", { ascending: false }),
      db.from("guestbook_entries").select("*").eq("memorial_id", id).order("created_at", { ascending: false }),
    ])

    return NextResponse.json({
      memorial,
      mediaItems: mediaRes.data || [],
      timelineEvents: timelineRes.data || [],
      peopleInLife: peopleRes.data || [],
      memories: memoriesRes.data || [],
      guestbookEntries: guestbookRes.data || [],
    })
  } catch (err: any) {
    console.error("Memorial detail error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { errorResponse } = await assertMemorialAdmin(id, user.id)
    if (errorResponse) return errorResponse

    const db = getSupabaseAdminSafe() || supabase

    const body = await req.json()
    
    // Whitelist updatable fields
    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    }

    const fields = [
      "full_name",
      "preferred_name",
      "birth_year",
      "death_year",
      "location",
      "headline",
      "biography",
      "portrait_photo_url",
      "cover_photo_url",
      "status",
      "privacy",
      "access_pin_hash",
      "successor_name",
      "successor_email",
    ]

    for (const f of fields) {
      if (body[f] !== undefined) {
        updates[f] = body[f]
      }
    }

    if (body.pin !== undefined) {
      updates.access_pin_hash = body.pin ? hashPin(String(body.pin).trim()) : null
    }

    // If slug update requested, validate and ensure uniqueness
    if (body.slug) {
      const cleanSlug = normalizeMemorialSlug(body.slug)
      const parsed = memorialSlugSchema.safeParse(cleanSlug)

      if (!parsed.success) {
        return NextResponse.json(
          { error: parsed.error.issues[0]?.message || "Invalid address" },
          { status: 400 }
        )
      }

      if (RESERVED_MEMORIAL_SLUGS.has(cleanSlug)) {
        return NextResponse.json(
          { error: "That address is reserved for system use" },
          { status: 400 }
        )
      }

      const { data: slugCheck } = await db
        .from("memorials")
        .select("id")
        .eq("slug", cleanSlug)
        .neq("id", id)
        .maybeSingle()

      if (slugCheck) {
        return NextResponse.json({ error: "This URL web address is already taken" }, { status: 400 })
      }
      updates.slug = cleanSlug
    }

    const { data: updated, error } = await db
      .from("memorials")
      .update(updates)
      .eq("id", id)
      .select()
      .single()

    if (error?.code === "23505") {
      return NextResponse.json(
        { error: "That address was just taken. Please try another one." },
        { status: 409 }
      )
    }

    if (error) {
      console.error("Memorial update error:", error)
      return NextResponse.json({ error: "Failed to update memorial settings." }, { status: 500 })
    }

    return NextResponse.json({ success: true, memorial: updated })
  } catch (err: any) {
    console.error("Memorial update error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = getSupabaseAdminSafe() || supabase

    // Verify ownership
    const { data: memorial } = await db
      .from("memorials")
      .select("owner_id")
      .eq("id", id)
      .maybeSingle()

    if (!memorial || memorial.owner_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Delete memorial (cascades to all child relations)
    const { error } = await db
      .from("memorials")
      .delete()
      .eq("id", id)

    if (error) {
      console.error("Memorial delete error:", error)
      return NextResponse.json({ error: "Failed to delete memorial." }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error("Memorial delete error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
