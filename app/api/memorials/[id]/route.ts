import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { getSupabaseAdminSafe } from "@/utils/supabase/admin"
import { assertMemorialAdmin, assertMemorialOwner } from "@/lib/memorial-auth"
import { canAccessFeature } from "@/lib/paywall"
import { deleteR2MemorialFolder } from "@/lib/r2"
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
    const { data: memorial, error } = await db
      .from("memorials")
      .select("*")
      .eq("id", id)
      .maybeSingle()

    if (error || !memorial) {
      return NextResponse.json({ error: "Memorial not found" }, { status: 404 })
    }

    // 2. Fetch all relational sub-collections in parallel
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

    const authCheck = await assertMemorialAdmin(id, user.id)
    if (!authCheck.authorized || !authCheck.memorial) {
      return authCheck.errorResponse || NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const db = getSupabaseAdminSafe() || supabase
    const body = await req.json().catch(() => ({}))

    // 1. Permissions Split: Owner-Only Settings vs Co-Admin Editorial Content
    const ownerOnlyFields = [
      "slug",
      "status",
      "privacy",
      "pin",
      "access_pin_hash",
      "successor_name",
      "successor_email",
    ]

    const attemptedOwnerField = ownerOnlyFields.find((f) => body[f] !== undefined)
    if (attemptedOwnerField && !authCheck.isOwner) {
      return NextResponse.json(
        {
          error:
            "Forbidden: Only the primary memorial steward (creator/owner) can modify address, privacy, access PIN, status, or successor settings.",
        },
        { status: 403 }
      )
    }

    // 2. Paywall Check: Private mode requires Pro Plan ($179)
    if (body.privacy === "private" || (body.pin && body.privacy !== "public")) {
      const paywallCheck = canAccessFeature(authCheck.memorial, "private_mode")
      if (!paywallCheck.allowed) {
        // Prevent free memorials from activating private PIN mode without blocking saving of editorial fields
        body.privacy = authCheck.memorial.privacy === "private" ? "public" : (authCheck.memorial.privacy || "public")
        body.pin = null
      }
    }

    // 3. Whitelist updatable fields
    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    }

    const editorialFields = [
      "full_name",
      "preferred_name",
      "birth_year",
      "death_year",
      "location",
      "headline",
      "biography",
      "portrait_photo_url",
      "cover_photo_url",
    ]

    for (const f of editorialFields) {
      if (body[f] !== undefined) {
        updates[f] = body[f]
      }
    }

    if (authCheck.isOwner) {
      if (body.status !== undefined) updates.status = body.status
      if (body.privacy !== undefined) updates.privacy = body.privacy
      if (body.successor_name !== undefined) updates.successor_name = body.successor_name
      if (body.successor_email !== undefined) updates.successor_email = body.successor_email

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
          return NextResponse.json(
            { error: "That address is already taken. Please choose another." },
            { status: 409 }
          )
        }

        updates.slug = cleanSlug
      }
    }

    const { data: updated, error: updateError } = await db
      .from("memorials")
      .update(updates)
      .eq("id", id)
      .select()
      .single()

    if (updateError) {
      console.error("Memorial update error:", updateError)
      return NextResponse.json({ error: "Failed to update memorial" }, { status: 500 })
    }

    return NextResponse.json({ success: true, memorial: updated })
  } catch (err: any) {
    console.error("Memorial PATCH error:", err)
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

    // Only the primary owner can permanently delete a memorial
    const authCheck = await assertMemorialOwner(id, user.id)
    if (!authCheck.authorized || !authCheck.memorial) {
      return authCheck.errorResponse || NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const db = getSupabaseAdminSafe() || supabase

    // 1. Storage Cleanup: Delete all physical R2 media files for this memorial
    await deleteR2MemorialFolder(id)

    // 2. Delete memorial row from database (cascades to child tables)
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
