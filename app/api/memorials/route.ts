import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { supabaseAdmin } from "@/utils/supabase/admin"
import {
  normalizeMemorialSlug,
  memorialSlugSchema,
  RESERVED_MEMORIAL_SLUGS,
  createMemorialSlugCandidates,
} from "@/lib/memorial-slug"

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch memorials owned by user using admin client
    const { data: memorials, error } = await supabaseAdmin
      .from("memorials")
      .select(`
        id,
        slug,
        full_name,
        preferred_name,
        birth_year,
        death_year,
        headline,
        portrait_photo_url,
        status,
        privacy,
        is_paid,
        created_at,
        updated_at
      `)
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching memorials:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ memorials })
  } catch (err: any) {
    console.error("Memorials GET error:", err)
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { full_name, desired_slug } = body

    if (!full_name || !full_name.trim()) {
      return NextResponse.json({ error: "Full name is required" }, { status: 400 })
    }

    // Normalize and validate candidate slug
    const rawRequested = desired_slug?.trim() ? desired_slug : full_name
    let normalized = normalizeMemorialSlug(rawRequested)
    if (normalized.length < 3) {
      normalized = normalizeMemorialSlug(`memorial-${normalized}`)
    }

    let finalSlug = normalized

    // 1. Check if reserved or already taken
    const isReserved = RESERVED_MEMORIAL_SLUGS.has(finalSlug)
    let isTaken = isReserved

    if (!isReserved) {
      const { data: existing } = await supabaseAdmin
        .from("memorials")
        .select("id")
        .eq("slug", finalSlug)
        .maybeSingle()

      if (existing) isTaken = true
    }

    // 2. If collision, try smart candidates
    if (isTaken) {
      const candidates = createMemorialSlugCandidates(full_name)
      let foundAvailable = false

      for (const candidate of candidates) {
        if (candidate === finalSlug || RESERVED_MEMORIAL_SLUGS.has(candidate)) continue
        const { data: check } = await supabaseAdmin
          .from("memorials")
          .select("id")
          .eq("slug", candidate)
          .maybeSingle()

        if (!check) {
          finalSlug = candidate
          foundAvailable = true
          break
        }
      }

      if (!foundAvailable) {
        const randomNum = Math.floor(1000 + Math.random() * 9000)
        finalSlug = `${normalized.slice(0, 50)}-${randomNum}`
      }
    }

    // 3. Create the memorial record using supabaseAdmin (bypassing PostgREST RLS token mismatch)
    const { data: newMemorial, error } = await supabaseAdmin
      .from("memorials")
      .insert({
        owner_id: user.id,
        slug: finalSlug,
        full_name: full_name.trim(),
        status: "published",
        privacy: "public",
      })
      .select()
      .single()

    if (error?.code === "23505") {
      // Catch concurrent unique collision
      const suffix = Math.floor(10000 + Math.random() * 90000)
      const fallbackSlug = `${normalized.slice(0, 48)}-${suffix}`
      const retry = await supabaseAdmin
        .from("memorials")
        .insert({
          owner_id: user.id,
          slug: fallbackSlug,
          full_name: full_name.trim(),
          status: "published",
          privacy: "public",
        })
        .select()
        .single()

      if (retry.error) {
        return NextResponse.json({ error: "Could not create memorial address. Please try again." }, { status: 409 })
      }
      return NextResponse.json({ success: true, memorial: retry.data })
    }

    if (error) {
      console.error("Error creating memorial:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, memorial: newMemorial })
  } catch (err: any) {
    console.error("Memorials POST error:", err)
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 500 })
  }
}
