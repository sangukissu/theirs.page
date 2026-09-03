import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { supabaseAdmin } from "@/utils/supabase/admin"

interface RouteContext {
  params: Promise<{ id: string }>
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

    // Verify ownership
    const { data: memorial } = await supabaseAdmin
      .from("memorials")
      .select("owner_id")
      .eq("id", memorialId)
      .single()

    if (!memorial || memorial.owner_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await req.json()
    const { target, targetId, action } = body // target: "memory" | "guestbook", action: "approve" | "reject" | "delete"

    if (!target || !targetId || !action) {
      return NextResponse.json({ error: "target, targetId, and action are required" }, { status: 400 })
    }

    const tableName = target === "guestbook" ? "guestbook_entries" : "memories"
    const newStatus = action === "approve" ? "approved" : "rejected"

    if (action === "delete") {
      const { error } = await supabaseAdmin
        .from(tableName)
        .delete()
        .eq("id", targetId)
        .eq("memorial_id", memorialId)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
      return NextResponse.json({ success: true, action: "deleted" })
    }

    const updatePayload: Record<string, any> = {
      status: newStatus,
    }
    if (target === "memory" && newStatus === "approved") {
      updatePayload.approved_at = new Date().toISOString()
    }

    const { error } = await supabaseAdmin
      .from(tableName)
      .update(updatePayload)
      .eq("id", targetId)
      .eq("memorial_id", memorialId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, status: newStatus })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 500 })
  }
}
