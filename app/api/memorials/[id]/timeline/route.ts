import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { getSupabaseAdminSafe } from "@/utils/supabase/admin"
import { assertMemorialAdmin } from "@/lib/memorial-auth"
import { canAccessFeature } from "@/lib/paywall"

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

    const authCheck = await assertMemorialAdmin(memorialId, user.id)
    if (!authCheck.authorized || !authCheck.memorial) {
      return authCheck.errorResponse || NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Paywall Check: Life Story timeline requires Theirs Complete ($179)
    const featureCheck = canAccessFeature(authCheck.memorial, "timeline")
    if (!featureCheck.allowed) {
      return NextResponse.json(
        { error: featureCheck.error },
        { status: featureCheck.status || 402 }
      )
    }

    const body = await req.json()
    const { year, title, description, photo_url } = body

    if (!year || !title) {
      return NextResponse.json({ error: "Year and title are required" }, { status: 400 })
    }

    const db = getSupabaseAdminSafe() || supabase
    const { data: event, error } = await db
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
      console.error("Timeline insert error:", error)
      return NextResponse.json({ error: "Failed to add timeline event." }, { status: 500 })
    }

    return NextResponse.json({ success: true, event })
  } catch (err: any) {
    console.error("Timeline POST error:", err)
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

    const { errorResponse } = await assertMemorialAdmin(memorialId, user.id)
    if (errorResponse) return errorResponse

    const url = new URL(req.url)
    const eventId = url.searchParams.get("eventId")

    if (!eventId) {
      return NextResponse.json({ error: "eventId query param required" }, { status: 400 })
    }

    const db = getSupabaseAdminSafe() || supabase
    const { error } = await db
      .from("timeline_events")
      .delete()
      .eq("id", eventId)
      .eq("memorial_id", memorialId)

    if (error) {
      console.error("Timeline delete error:", error)
      return NextResponse.json({ error: "Failed to delete timeline event." }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error("Timeline DELETE error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
