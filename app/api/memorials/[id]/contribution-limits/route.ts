import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { getSupabaseAdminSafe } from "@/utils/supabase/admin"

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const { id: memorialId } = await context.params
    const supabase = await createClient()
    const db = getSupabaseAdminSafe() || supabase

    // Support lookup by UUID or slug
    let memorialQuery = db
      .from("memorials")
      .select("id, is_paid, contribution_settings")
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(memorialId)) {
      memorialQuery = memorialQuery.eq("id", memorialId)
    } else {
      memorialQuery = memorialQuery.eq("slug", memorialId)
    }

    const { data: memorial, error: memErr } = await memorialQuery.maybeSingle()
    if (memErr || !memorial) {
      return NextResponse.json({ error: "Memorial not found" }, { status: 404 })
    }

    const { count, error: countErr } = await db
      .from("media_items")
      .select("id", { count: "exact", head: true })
      .eq("memorial_id", memorial.id)
      .eq("media_type", "image")

    const isPaid = Boolean(memorial.is_paid)
    const photoCount = !countErr && typeof count === "number" ? count : 0
    const canAddPhoto = isPaid || photoCount < 5
    const remainingPhotoSlots = isPaid ? 3 : Math.max(0, 5 - photoCount)

    const settings = (memorial.contribution_settings as Record<string, boolean> | null) || {}
    const voiceEnabled = isPaid && Boolean(settings.voice)
    const videoEnabled = isPaid && Boolean(settings.videos)

    return NextResponse.json(
      {
        is_paid: isPaid,
        photo_count: photoCount,
        can_add_photo: canAddPhoto,
        remaining_photo_slots: remainingPhotoSlots,
        voice_enabled: voiceEnabled,
        video_enabled: videoEnabled,
      },
      {
        headers: {
          "Cache-Control": "private, no-cache, no-store, max-age=0, must-revalidate",
        },
      }
    )
  } catch (err: any) {
    console.error("Contribution limits error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
