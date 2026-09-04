import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { getSupabaseAdminSafe } from "@/utils/supabase/admin"

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

    const db = getSupabaseAdminSafe() || supabase

    // Verify ownership
    const { data: memorial } = await db
      .from("memorials")
      .select("owner_id")
      .eq("id", memorialId)
      .maybeSingle()

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
      const { error } = await db
        .from(tableName)
        .delete()
        .eq("id", targetId)
        .eq("memorial_id", memorialId)

      if (error) {
        console.error("Moderation delete error:", error)
        return NextResponse.json({ error: "Failed to delete item." }, { status: 500 })
      }
      return NextResponse.json({ success: true, action: "deleted" })
    }

    const updatePayload: Record<string, any> = {
      status: newStatus,
    }
    if (target === "memory" && newStatus === "approved") {
      updatePayload.approved_at = new Date().toISOString()
    }

    const { error } = await db
      .from(tableName)
      .update(updatePayload)
      .eq("id", targetId)
      .eq("memorial_id", memorialId)

    if (error) {
      console.error("Moderation update error:", error)
      return NextResponse.json({ error: "Failed to update item status." }, { status: 500 })
    }

    return NextResponse.json({ success: true, status: newStatus })
  } catch (err: any) {
    console.error("Moderation PATCH error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
