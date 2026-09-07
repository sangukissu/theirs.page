import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { getSupabaseAdminSafe } from "@/utils/supabase/admin"
import { resolveMediaCapabilities } from "@/lib/uploads/capabilities"
import type { ContributionSettings } from "@/types/theirs"

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

    if (countErr || typeof count !== "number") {
      return NextResponse.json({ error: "Media quota is temporarily unavailable." }, { status: 503 })
    }
    const isPaid = Boolean(memorial.is_paid)
    const photoCount = count
    const capabilities = resolveMediaCapabilities({
      context: "guest_contribution",
      isPaid,
      contributionSettings: memorial.contribution_settings as ContributionSettings | null,
      existingMediaCounts: { image: photoCount },
    })

    return NextResponse.json(
      {
        is_paid: isPaid,
        photo_count: photoCount,
        can_add_photo: capabilities.nativePhoto,
        remaining_photo_slots: Math.min(3, capabilities.remainingImageItems ?? 3),
        voice_enabled: capabilities.nativeAudio,
        video_enabled: capabilities.youtubeVideo,
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
