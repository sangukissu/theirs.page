import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { assertMemorialAdmin } from "@/lib/memorial-auth"
import { extractManagedR2Key, getR2ObjectStream } from "@/lib/r2"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 })
  }

  const { data: restoration, error: restorationError } = await supabase
    .from("image_restorations")
    .select("id, user_id, memorial_id, restored_image_url")
    .eq("id", id)
    .single()

  if (restorationError || !restoration || !restoration.restored_image_url) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  // Authorization check: User must be creator or caretaker/editor of the memorial
  if (restoration.user_id !== user.id) {
    if (restoration.memorial_id) {
      const authCheck = await assertMemorialAdmin(restoration.memorial_id, user.id)
      if (!authCheck.authorized) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
    } else {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
  }

  const key = extractManagedR2Key(restoration.restored_image_url) || restoration.restored_image_url

  if (key && !key.startsWith("http://") && !key.startsWith("https://")) {
    try {
      const { body, contentType } = await getR2ObjectStream(key)
      return new Response(body as any, {
        status: 200,
        headers: {
          "Content-Type": contentType || "image/png",
          "Content-Disposition": `attachment; filename="theirs-restored-${id}.png"`,
          "Cache-Control": "private, max-age=0, must-revalidate",
        },
      })
    } catch (streamErr) {
      console.error("[download R2 error]", streamErr)
      return NextResponse.json({ error: "Failed to download image from storage" }, { status: 500 })
    }
  }

  // Legacy fallback for raw http URLs
  try {
    const response = await fetch(restoration.restored_image_url)
    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch image" }, { status: 500 })
    }

    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const contentType = response.headers.get("content-type") || "image/png"

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="theirs-restored-${id}.png"`,
        "Cache-Control": "private, max-age=0, must-revalidate",
      },
    })
  } catch {
    return NextResponse.json({ error: "Failed to download image" }, { status: 500 })
  }
}
