import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { supabaseAdmin } from "@/utils/supabase/admin"

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

    const { data: mediaItem, error } = await supabaseAdmin
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
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, mediaItem })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 500 })
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

    const { data: updated, error } = await supabaseAdmin
      .from("media_items")
      .update(updates)
      .eq("id", mediaId)
      .eq("memorial_id", memorialId)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, mediaItem: updated })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 500 })
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

    const { error } = await supabaseAdmin
      .from("media_items")
      .delete()
      .eq("id", mediaId)
      .eq("memorial_id", memorialId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 500 })
  }
}
