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
    const { name, relationship, photo_url, note } = body

    if (!name || !relationship) {
      return NextResponse.json({ error: "Name and relationship are required" }, { status: 400 })
    }

    const db = getSupabaseAdminSafe() || supabase
    const { data: person, error } = await db
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
      console.error("People insert error:", error)
      return NextResponse.json({ error: "Failed to add person." }, { status: 500 })
    }

    return NextResponse.json({ success: true, person })
  } catch (err: any) {
    console.error("People POST error:", err)
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
    const personId = url.searchParams.get("personId")

    if (!personId) {
      return NextResponse.json({ error: "personId query param required" }, { status: 400 })
    }

    const db = getSupabaseAdminSafe() || supabase
    const { error } = await db
      .from("people_in_life")
      .delete()
      .eq("id", personId)
      .eq("memorial_id", memorialId)

    if (error) {
      console.error("People delete error:", error)
      return NextResponse.json({ error: "Failed to delete person." }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error("People DELETE error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
