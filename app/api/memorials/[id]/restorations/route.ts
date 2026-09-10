import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { getSupabaseAdminSafe } from "@/utils/supabase/admin"
import { assertMemorialAdmin } from "@/lib/memorial-auth"
import { deleteR2Object, resolveMediaUrl } from "@/lib/r2"
import { releaseMemorialStorage } from "@/lib/storage-quota"

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const { id: memorialId } = await context.params
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const authCheck = await assertMemorialAdmin(memorialId, user.id)
    if (!authCheck.authorized || !authCheck.memorial) {
      return authCheck.errorResponse || NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const db = getSupabaseAdminSafe() || supabase

    // 1. Fetch restorations for this memorial
    const { data: restorations, error: restErr } = await db
      .from("image_restorations")
      .select("id, status, original_image_url, restored_image_url, error_message, fal_request_id, created_at, updated_at")
      .eq("memorial_id", memorialId)
      .order("created_at", { ascending: false })

    if (restErr) {
      console.error("[restorations GET error]", restErr)
      return NextResponse.json({ error: "Failed to load restorations" }, { status: 500 })
    }

    // 2. Fetch media_items referencing restorations to compute gallery linkage
    const { data: galleryItems } = await db
      .from("media_items")
      .select("id, source_restoration_id")
      .eq("memorial_id", memorialId)
      .not("source_restoration_id", "is", null)

    const galleryMap = new Map<string, string>()
    if (galleryItems) {
      for (const item of galleryItems) {
        if (item.source_restoration_id) {
          galleryMap.set(item.source_restoration_id, item.id)
        }
      }
    }

    const items = (restorations || []).map((r) => ({
      id: r.id,
      status: r.status,
      original_image_url: r.original_image_url,
      restored_image_url: r.restored_image_url,
      originalUrl: r.original_image_url ? resolveMediaUrl(r.original_image_url) : undefined,
      restoredUrl: r.restored_image_url ? resolveMediaUrl(r.restored_image_url) : undefined,
      error_message: r.error_message,
      created_at: r.created_at,
      in_gallery: galleryMap.has(r.id),
      gallery_media_id: galleryMap.get(r.id) || null,
    }))

    const completedCount = items.filter((r) => r.status === "completed").length

    return NextResponse.json({
      restorations: items,
      completedCount,
      maxRestorations: 5,
      isPaid: Boolean(authCheck.memorial.is_paid),
    })
  } catch (err) {
    console.error("[restorations GET fatal]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const { id: memorialId } = await context.params
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const authCheck = await assertMemorialAdmin(memorialId, user.id)
    if (!authCheck.authorized || !authCheck.memorial) {
      return authCheck.errorResponse || NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const restorationId = searchParams.get("restorationId")
    if (!restorationId) {
      return NextResponse.json({ error: "restorationId is required" }, { status: 400 })
    }

    const db = getSupabaseAdminSafe() || supabase

    // 1. Deletion protection: Check if restoration is currently referenced in gallery
    const { data: galleryRef } = await db
      .from("media_items")
      .select("id")
      .eq("memorial_id", memorialId)
      .eq("source_restoration_id", restorationId)
      .limit(1)
      .maybeSingle()

    if (galleryRef) {
      return NextResponse.json(
        { error: "Remove this photo from the gallery first." },
        { status: 400 }
      )
    }

    // 2. Fetch restoration to get R2 keys for cleanup
    const { data: restoration, error: fetchErr } = await db
      .from("image_restorations")
      .select("id, original_image_url, restored_image_url")
      .eq("id", restorationId)
      .eq("memorial_id", memorialId)
      .maybeSingle()

    if (fetchErr || !restoration) {
      return NextResponse.json({ error: "Restoration not found" }, { status: 404 })
    }

    // 3. Delete database record
    const { error: delErr } = await db
      .from("image_restorations")
      .delete()
      .eq("id", restorationId)
      .eq("memorial_id", memorialId)

    if (delErr) {
      console.error("[restoration DELETE error]", delErr)
      return NextResponse.json({ error: "Failed to delete restoration record" }, { status: 500 })
    }

    // 4. Clean up R2 storage assets & release ledger quotas
    if (restoration.original_image_url) {
      await deleteR2Object(restoration.original_image_url).catch(() => {})
      await releaseMemorialStorage(db, memorialId, restoration.original_image_url).catch(() => {})
    }
    if (restoration.restored_image_url) {
      await deleteR2Object(restoration.restored_image_url).catch(() => {})
      await releaseMemorialStorage(db, memorialId, restoration.restored_image_url).catch(() => {})
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[restoration DELETE fatal]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
