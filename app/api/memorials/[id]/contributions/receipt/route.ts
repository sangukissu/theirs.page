import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdminSafe } from "@/utils/supabase/admin"
import { createClient } from "@/utils/supabase/server"

interface RouteContext {
  params: Promise<{ id: string }>
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const token = req.nextUrl.searchParams.get("token")

    if (!token || typeof token !== "string" || !token.startsWith("cr_")) {
      return NextResponse.json({ error: "Invalid receipt token." }, { status: 400 })
    }

    const adminClient = getSupabaseAdminSafe()
    const serverClient = await createClient()
    const db = adminClient || serverClient

    // Find the memory by receipt token
    const { data: memory, error } = await db
      .from("memories")
      .select("id, memorial_id, status, created_at, approved_at")
      .eq("receipt_token", token)
      .maybeSingle()

    if (error || !memory) {
      return NextResponse.json(
        {
          status: "not_published",
          published: false,
        },
        { status: 404 }
      )
    }

    // Map memory status to receipt public status
    let publicStatus: "sent_to_family" | "published" | "not_published" = "sent_to_family"

    if (memory.status === "approved") {
      publicStatus = "published"
    } else if (memory.status === "rejected" || memory.status === "blocked") {
      publicStatus = "not_published"
    } else {
      publicStatus = "sent_to_family"
    }

    return NextResponse.json({
      success: true,
      contribution_id: memory.id,
      status: publicStatus,
      published: memory.status === "approved",
    })
  } catch (err) {
    console.error("Receipt status lookup error:", err)
    return NextResponse.json(
      { error: "Unable to verify receipt status." },
      { status: 500 }
    )
  }
}
