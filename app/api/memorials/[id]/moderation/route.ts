import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { getSupabaseAdminSafe } from "@/utils/supabase/admin"
import { assertMemorialAdmin } from "@/lib/memorial-auth"

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

    const { errorResponse } = await assertMemorialAdmin(memorialId, user.id)
    if (errorResponse) return errorResponse

    const db = getSupabaseAdminSafe() || supabase

    const body = await req.json()
    const { target, targetId, action } = body

    if (!target || !targetId || !action) {
      return NextResponse.json({ error: "target, targetId, and action are required" }, { status: 400 })
    }

    if (!['memory', 'caretaker_message'].includes(target)) {
      return NextResponse.json({ error: "Invalid moderation target." }, { status: 400 })
    }

    if (target === "caretaker_message" && !['read', 'archive', 'delete'].includes(action)) {
      return NextResponse.json({ error: "Invalid message action." }, { status: 400 })
    }

    if (target === "memory" && !['approve', 'reject', 'delete'].includes(action)) {
      return NextResponse.json({ error: "Invalid contribution action." }, { status: 400 })
    }

    const tableName = target === "caretaker_message" ? "caretaker_messages" : "memories"
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

    const updatePayload: Record<string, any> = target === "caretaker_message"
      ? { status: action === "archive" ? "archived" : "read", read_at: new Date().toISOString() }
      : { status: newStatus }
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

    return NextResponse.json({ success: true, status: updatePayload.status })
  } catch (err: any) {
    console.error("Moderation PATCH error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
