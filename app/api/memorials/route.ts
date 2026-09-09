import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { getSupabaseAdminSafe } from "@/utils/supabase/admin"
import { resolveMediaUrl } from "@/lib/r2"
import {
  normalizeMemorialSlug,
  RESERVED_MEMORIAL_SLUGS,
  createMemorialSlugCandidates,
} from "@/lib/memorial-slug"
import { sendMemorialCreatedEmail } from "@/lib/email/lifecycle-emails"
import { TEXT_LIMITS } from "@/lib/validation/text-limits"

function cleanDisplayName(value: unknown, maxLength: number): string {
  if (typeof value !== "string") return ""
  const normalized = value.trim().replace(/\s+/g, " ")
  if (/[\u0000-\u001f\u007f]/.test(normalized)) return ""
  return normalized.slice(0, maxLength)
}

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = getSupabaseAdminSafe() || supabase

    // Fetch memorials owned by user
    const { data: memorials, error } = await db
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
        language,
        created_at,
        updated_at
      `)
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching memorials:", error)
      return NextResponse.json({ error: "Failed to load memorials." }, { status: 500 })
    }

    const resolvedMemorials = (memorials || []).map((m) => ({
      ...m,
      portrait_photo_url: resolveMediaUrl(m.portrait_photo_url),
    }))

    return NextResponse.json({ memorials: resolvedMemorials })
  } catch (err: any) {
    console.error("Memorials GET error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
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

    const body = await req.json().catch(() => null)
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 })
    }
    if (typeof body.full_name !== "string" || body.full_name.trim().length > TEXT_LIMITS.personFullName) {
      return NextResponse.json({ error: `Full name must be ${TEXT_LIMITS.personFullName} characters or fewer.` }, { status: 400 })
    }
    const fullName = cleanDisplayName(body.full_name, TEXT_LIMITS.personFullName)
    const desiredSlug = typeof body.desired_slug === "string" ? body.desired_slug : ""

    if (fullName.length < 2) {
      return NextResponse.json({ error: "Full name is required" }, { status: 400 })
    }
    const db = getSupabaseAdminSafe() || supabase

    const { data: profile, error: profileError } = await db
      .from("user_profiles")
      .select("full_name")
      .eq("user_id", user.id)
      .maybeSingle()

    let caretakerName = cleanDisplayName(profile?.full_name, 100)
    if (caretakerName.length < 2 && typeof body.creator_name === "string" && body.creator_name.trim().length >= 2) {
      const cleanCreator = cleanDisplayName(body.creator_name, 100)
      const { error: profUpdateErr } = await db
        .from("user_profiles")
        .update({ full_name: cleanCreator, updated_at: new Date().toISOString() })
        .eq("user_id", user.id)
      if (!profUpdateErr) {
        caretakerName = cleanCreator
      }
    }

    if (caretakerName.length < 2) {
      return NextResponse.json({ error: "Your name is required to care for this memorial." }, { status: 400 })
    }

    const creatorRelationship = typeof body.creator_relationship === "string"
      ? cleanDisplayName(body.creator_relationship, 80)
      : null

    // Normalize and validate candidate slug
    const rawRequested = desiredSlug.trim() ? desiredSlug : fullName
    let normalized = normalizeMemorialSlug(rawRequested)
    if (normalized.length < 3) {
      normalized = normalizeMemorialSlug(`memorial-${normalized}`)
    }

    let finalSlug = normalized

    // 1. Check if reserved or already taken
    const isReserved = RESERVED_MEMORIAL_SLUGS.has(finalSlug)
    let isTaken = isReserved

    if (!isReserved) {
      const { data: existing } = await db
        .from("memorials")
        .select("id")
        .eq("slug", finalSlug)
        .maybeSingle()

      if (existing) isTaken = true
    }

    // 2. If collision, try smart candidates
    if (isTaken) {
      const candidates = createMemorialSlugCandidates(fullName)
      let foundAvailable = false

      for (const candidate of candidates) {
        if (candidate === finalSlug || RESERVED_MEMORIAL_SLUGS.has(candidate)) continue
        const { data: check } = await db
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

    // 3. Create the memorial record
    const memorialLanguage =
      typeof body.language === "string" && body.language.trim()
        ? body.language.trim().toLowerCase().slice(0, 10)
        : "en"

    const insertPayload: Record<string, any> = {
      owner_id: user.id,
      slug: finalSlug,
      full_name: fullName,
      status: "draft",
      privacy: "unlisted",
      language: memorialLanguage,
    }
    if (creatorRelationship) {
      insertPayload.creator_relationship = creatorRelationship
    }

    const { data: newMemorial, error } = await db
      .from("memorials")
      .insert(insertPayload)
      .select()
      .single()

    if (error?.code === "23505") {
      // Catch concurrent unique collision
      const suffix = Math.floor(10000 + Math.random() * 90000)
      const fallbackSlug = `${normalized.slice(0, 48)}-${suffix}`
      const retryPayload: Record<string, any> = {
        owner_id: user.id,
        slug: fallbackSlug,
        full_name: fullName,
        status: "draft",
        privacy: "unlisted",
        language: memorialLanguage,
      }
      if (creatorRelationship) {
        retryPayload.creator_relationship = creatorRelationship
      }
      const retry = await db
        .from("memorials")
        .insert(retryPayload)
        .select()
        .single()

      if (retry.error) {
        return NextResponse.json({ error: "Could not create memorial address. Please try another name." }, { status: 409 })
      }
      await sendMemorialCreatedEmail({
        email: user.email,
        caretakerName,
        memorialId: retry.data.id,
        memorialName: retry.data.full_name,
      })
      return NextResponse.json({ success: true, memorial: retry.data })
    }

    if (error) {
      console.error("Error creating memorial:", error)
      return NextResponse.json({ error: "Failed to create memorial." }, { status: 500 })
    }

    await sendMemorialCreatedEmail({
      email: user.email,
      caretakerName,
      memorialId: newMemorial.id,
      memorialName: newMemorial.full_name,
    })
    return NextResponse.json({ success: true, memorial: newMemorial })
  } catch (err: any) {
    console.error("Memorials POST error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
