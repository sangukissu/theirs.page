import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { getSupabaseAdminSafe } from "@/utils/supabase/admin"

interface RouteContext {
  params: Promise<{ id: string }>
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

    const body = await req.json()
    const { url, media_type, caption, approx_year, location } = body

    if (!url) {
      return NextResponse.json({ error: "Media URL is required" }, { status: 400 })
    }

    const db = getSupabaseAdminSafe() || supabase
    const { data: mediaItem, error } = await db
      .from("media_items")
      .insert({
        memorial_id: memorialId,
        url,
        media_type: media_type || "image",
        caption: caption?.trim() || null,
        approx_year: approx_year ? Number(approx_year) : null,
        location: location?.trim() || null,
        uploaded_by: user.id,
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

    const body = await req.json()
    const { mediaId, caption, approx_year } = body

    if (!mediaId) {
      return NextResponse.json({ error: "mediaId is required" }, { status: 400 })
    }

    const updates: Record<string, any> = {}
    if (caption !== undefined) updates.caption = caption?.trim() || null
    if (approx_year !== undefined) updates.approx_year = approx_year ? Number(approx_year) : null

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

    const url = new URL(req.url)
    const mediaId = url.searchParams.get("mediaId")

    if (!mediaId) {
      return NextResponse.json({ error: "mediaId is required" }, { status: 400 })
    }

    const db = getSupabaseAdminSafe() || supabase
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
