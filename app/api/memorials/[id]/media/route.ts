import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { getSupabaseAdminSafe } from "@/utils/supabase/admin"
import { assertMemorialAdmin } from "@/lib/memorial-auth"
import { assertMediaQuota } from "@/lib/paywall"
import { deleteR2Object, extractManagedR2Key } from "@/lib/r2"

interface RouteContext {
  params: Promise<{ id: string }>
}

function extractR2KeyFromUrl(url: string): string | null {
  if (!url) return null
  if (url.startsWith("memorials/")) return url
  const match = url.match(/memorials\/[^\s"')]+/)
  return match ? match[0] : null
}

export async function POST(req: NextRequest, context: RouteContext) {
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

    const body = await req.json()
    const { url, media_type, caption, approx_year, location, album, is_pinned, order_index } = body

    if (typeof url !== "string" || !url) {
      return NextResponse.json({ error: "Media URL is required" }, { status: 400 })
    }
    const storageKey = extractManagedR2Key(url)
    if (!storageKey?.startsWith(`memorials/${authCheck.memorial.id}/`)) {
      return NextResponse.json({ error: "Media does not belong to this memorial." }, { status: 400 })
    }

    const db = getSupabaseAdminSafe() || supabase

    // Paywall Check: Enforce free tier 5-photo limit and audio/video restriction
    const { count } = await db
      .from("media_items")
      .select("id", { count: "exact", head: true })
      .eq("memorial_id", memorialId)

    const quotaCheck = assertMediaQuota(
      authCheck.memorial,
      count || 0,
      media_type || "image"
    )

    if (!quotaCheck.allowed) {
      return NextResponse.json(
        { error: quotaCheck.error },
        { status: quotaCheck.status || 402 }
      )
    }

    const { data: mediaItem, error } = await db
      .from("media_items")
      .insert({
        memorial_id: memorialId,
        url: storageKey,
        media_type: media_type || "image",
        caption: caption?.trim() || null,
        approx_year: approx_year ? Number(approx_year) : null,
        location: location?.trim() || null,
        album: album?.trim() || null,
        is_pinned: Boolean(is_pinned),
        order_index: order_index !== undefined ? Number(order_index) : 0,
      })
      .select()
      .single()

    if (error) {
      console.error("Media insert error:", error)
      return NextResponse.json({ error: "Failed to save media item." }, { status: 500 })
    }

    return NextResponse.json({ success: true, mediaItem })
  } catch (err: any) {
    console.error("Media POST error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, context: RouteContext) {
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

    const body = await req.json()
    const { mediaId, caption, approx_year, location, album, is_pinned, order_index } = body

    if (!mediaId) {
      return NextResponse.json({ error: "mediaId is required" }, { status: 400 })
    }

    const updates: Record<string, any> = {}
    if (caption !== undefined) updates.caption = caption?.trim() || null
    if (approx_year !== undefined) updates.approx_year = approx_year ? Number(approx_year) : null
    if (location !== undefined) updates.location = location?.trim() || null
    if (album !== undefined) updates.album = album?.trim() || null
    if (is_pinned !== undefined) updates.is_pinned = Boolean(is_pinned)
    if (order_index !== undefined) updates.order_index = Number(order_index)

    const db = getSupabaseAdminSafe() || supabase
    const { data: updated, error } = await db
      .from("media_items")
      .update(updates)
      .eq("id", mediaId)
      .eq("memorial_id", memorialId)
      .select()
      .single()

    if (error) {
      console.error("Media update error:", error)
      return NextResponse.json({ error: "Failed to update media item." }, { status: 500 })
    }

    return NextResponse.json({ success: true, mediaItem: updated })
  } catch (err: any) {
    console.error("Media PATCH error:", err)
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

    const url = new URL(req.url)
    const mediaId = url.searchParams.get("mediaId")

    if (!mediaId) {
      return NextResponse.json({ error: "mediaId is required" }, { status: 400 })
    }

    const db = getSupabaseAdminSafe() || supabase

    // 1. Fetch media item to extract R2 storage key before deleting row
    const { data: item } = await db
      .from("media_items")
      .select("id, url")
      .eq("id", mediaId)
      .eq("memorial_id", memorialId)
      .maybeSingle()

    if (item?.url) {
      const key = extractR2KeyFromUrl(item.url)
      if (key) {
        try {
          await deleteR2Object(key)
        } catch (cleanupErr) {
          console.warn(`Failed to delete R2 object ${key}:`, cleanupErr)
        }
      }
    }

    // 2. Delete row from database
    const { error } = await db
      .from("media_items")
      .delete()
      .eq("id", mediaId)
      .eq("memorial_id", memorialId)

    if (error) {
      console.error("Media delete error:", error)
      return NextResponse.json({ error: "Failed to delete media item." }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error("Media DELETE error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
