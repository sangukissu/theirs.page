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
    const { name, relationship, photo_url, note } = body

    if (!name || !relationship) {
      return NextResponse.json({ error: "Name and relationship are required" }, { status: 400 })
    }

    const { data: person, error } = await supabaseAdmin
      .from("people_in_life")
      .insert({
        memorial_id: memorialId,
        name: name.trim(),
        relationship: relationship.trim(),
        photo_url: photo_url || null,
        note: note?.trim() || null,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, person })
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
    const personId = url.searchParams.get("personId")

    if (!personId) {
      return NextResponse.json({ error: "personId query param required" }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from("people_in_life")
      .delete()
      .eq("id", personId)
      .eq("memorial_id", memorialId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 500 })
  }
}
