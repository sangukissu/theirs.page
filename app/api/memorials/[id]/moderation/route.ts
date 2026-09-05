import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { getSupabaseAdminSafe } from "@/utils/supabase/admin"
import { assertMemorialAdmin } from "@/lib/memorial-auth"
import { promoteQuarantinedMedia } from "@/lib/r2"

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
      return NextResponse.json(
        { error: "target, targetId, and action are required" },
        { status: 400 }
      )
    }

    if (!["memory", "caretaker_message"].includes(target)) {
      return NextResponse.json({ error: "Invalid moderation target." }, { status: 400 })
    }

    if (target === "caretaker_message" && !["read", "archive", "delete"].includes(action)) {
      return NextResponse.json({ error: "Invalid message action." }, { status: 400 })
    }

    if (target === "memory" && !["approve", "reject", "unpublish", "delete"].includes(action)) {
      return NextResponse.json({ error: "Invalid contribution action." }, { status: 400 })
    }

    const tableName = target === "caretaker_message" ? "caretaker_messages" : "memories"

    // 1. Delete Action
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

    // 2. Private Messages Updates
    if (target === "caretaker_message") {
      const updatePayload = {
        status: action === "archive" ? "archived" : "read",
        read_at: new Date().toISOString(),
      }

      const { error } = await db
        .from(tableName)
        .update(updatePayload)
        .eq("id", targetId)
        .eq("memorial_id", memorialId)

      if (error) {
        console.error("Message update error:", error)
        return NextResponse.json({ error: "Failed to update message status." }, { status: 500 })
      }

      return NextResponse.json({ success: true, status: updatePayload.status })
    }

    // 3. Memory Moderation
    if (action === "approve") {
      // Fetch current memory to check quarantined media
      const { data: mem, error: fetchErr } = await db
        .from("memories")
        .select("*")
        .eq("id", targetId)
        .eq("memorial_id", memorialId)
        .maybeSingle()

      if (fetchErr || !mem) {
        return NextResponse.json({ error: "Memory not found." }, { status: 404 })
      }

      let updatedPhotoUrl = mem.photo_url
      let updatedPhotoUrls = mem.photo_urls

      // Promote primary photo from quarantine to public memorial folder
      if (mem.photo_url && mem.photo_url.includes("/quarantine/")) {
        try {
          const urlObj = new URL(mem.photo_url)
          const oldKey = urlObj.pathname.replace(/^\/+/, "")
          const newKey = oldKey.replace(/^quarantine\//, "memorials/")
          updatedPhotoUrl = await promoteQuarantinedMedia(oldKey, newKey)
        } catch (promoteErr) {
          console.warn("Could not promote primary photo_url:", promoteErr)
        }
      }

      // Promote array of photo urls
      if (Array.isArray(mem.photo_urls) && mem.photo_urls.length > 0) {
        updatedPhotoUrls = await Promise.all(
          mem.photo_urls.map(async (url: string) => {
            if (url.includes("/quarantine/")) {
              try {
                const urlObj = new URL(url)
                const oldKey = urlObj.pathname.replace(/^\/+/, "")
                const newKey = oldKey.replace(/^quarantine\//, "memorials/")
                return await promoteQuarantinedMedia(oldKey, newKey)
              } catch {
                return url
              }
            }
            return url
          })
        )
      }

      const updatePayload: Record<string, any> = {
        status: "approved",
        approved_at: new Date().toISOString(),
        is_quarantined: false,
        photo_url: updatedPhotoUrl,
        photo_urls: updatedPhotoUrls,
      }

      const { error: updateErr } = await db
        .from("memories")
        .update(updatePayload)
        .eq("id", targetId)
        .eq("memorial_id", memorialId)

      if (updateErr) {
        console.error("Moderation approve error:", updateErr)
        return NextResponse.json({ error: "Failed to approve contribution." }, { status: 500 })
      }

      // Also create a media item in gallery for approved photos if requested
      if (updatedPhotoUrl) {
        try {
          await db.from("media_items").insert({
            memorial_id: memorialId,
            media_type: "image",
            url: updatedPhotoUrl,
            caption: mem.story ? `Shared by ${mem.author_name}` : null,
            approx_year: mem.approx_year || null,
            album: "Community Memories",
          })
        } catch (mediaErr) {
          console.warn("Media item creation non-fatal error:", mediaErr)
        }
      }

      return NextResponse.json({
        success: true,
        status: "approved",
        photo_url: updatedPhotoUrl,
        photo_urls: updatedPhotoUrls,
      })
    }

    if (action === "unpublish") {
      const { error } = await db
        .from("memories")
        .update({ status: "pending_approval", approved_at: null })
        .eq("id", targetId)
        .eq("memorial_id", memorialId)

      if (error) {
        return NextResponse.json({ error: "Failed to unpublish contribution." }, { status: 500 })
      }
      return NextResponse.json({ success: true, status: "pending_approval" })
    }

    if (action === "reject") {
      const { error } = await db
        .from("memories")
        .update({ status: "rejected" })
        .eq("id", targetId)
        .eq("memorial_id", memorialId)

      if (error) {
        return NextResponse.json({ error: "Failed to reject contribution." }, { status: 500 })
      }
      return NextResponse.json({ success: true, status: "rejected" })
    }

    return NextResponse.json({ error: "Unhandled moderation action." }, { status: 400 })
  } catch (err: any) {
    console.error("Moderation PATCH error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
