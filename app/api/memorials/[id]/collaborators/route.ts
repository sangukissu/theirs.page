import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { supabaseAdmin } from "@/utils/supabase/admin"

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: memorial } = await supabaseAdmin
      .from("memorials")
      .select("owner_id")
      .eq("id", id)
      .single()

    if (!memorial || memorial.owner_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { data: collabs, error } = await supabaseAdmin
      .from("collaborators")
      .select("id, email, role, invitation_accepted, created_at")
      .eq("memorial_id", id)
      .order("created_at", { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ collaborators: collabs || [] })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch collaborators" }, { status: 500 })
  }
}

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: memorial } = await supabaseAdmin
      .from("memorials")
      .select("owner_id")
      .eq("id", id)
      .single()

    if (!memorial || memorial.owner_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await req.json()
    const { email, role } = body

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email address is required" }, { status: 400 })
    }

    const cleanEmail = email.trim().toLowerCase()
    const assignedRole = role === "co_admin" ? "co_admin" : "contributor"

    const { data: newCollab, error } = await supabaseAdmin
      .from("collaborators")
      .insert({
        memorial_id: id,
        email: cleanEmail,
        role: assignedRole,
        invitation_accepted: true,
      })
      .select()
      .single()

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: "This person is already invited as a caretaker." }, { status: 409 })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, collaborator: newCollab })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to add caretaker" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: memorial } = await supabaseAdmin
      .from("memorials")
      .select("owner_id")
      .eq("id", id)
      .single()

    if (!memorial || memorial.owner_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const collaboratorId = searchParams.get("collaboratorId")

    if (!collaboratorId) {
      return NextResponse.json({ error: "collaboratorId is required" }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from("collaborators")
      .delete()
      .eq("id", collaboratorId)
      .eq("memorial_id", id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to remove caretaker" }, { status: 500 })
  }
}
