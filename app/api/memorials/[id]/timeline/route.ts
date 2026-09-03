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
    const { year, title, description, photo_url } = body

    if (!year || !title) {
      return NextResponse.json({ error: "Year and title are required" }, { status: 400 })
    }

    const { data: event, error } = await supabaseAdmin
      .from("timeline_events")
      .insert({
        memorial_id: memorialId,
        year: Number(year),
        title: title.trim(),
        description: description?.trim() || null,
        photo_url: photo_url || null,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, event })
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
    const eventId = url.searchParams.get("eventId")

    if (!eventId) {
      return NextResponse.json({ error: "eventId query param required" }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from("timeline_events")
      .delete()
      .eq("id", eventId)
      .eq("memorial_id", memorialId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 500 })
  }
}
