import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdminSafe } from "@/utils/supabase/admin"
import { createClient } from "@/utils/supabase/server"
import {
  normalizeMemorialSlug,
  memorialSlugSchema,
  RESERVED_MEMORIAL_SLUGS,
  createMemorialSlugCandidates,
} from "@/lib/memorial-slug"

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const rawSlug = url.searchParams.get("slug")
    const excludeMemorialId = url.searchParams.get("excludeId")
    const fullName = url.searchParams.get("fullName") || ""

    if (!rawSlug) {
      return NextResponse.json({ error: "slug query parameter is required" }, { status: 400 })
    }

    const slug = normalizeMemorialSlug(rawSlug)
    const parsed = memorialSlugSchema.safeParse(slug)

    if (!parsed.success) {
      return NextResponse.json({
        slug,
        valid: false,
        available: false,
        message: parsed.error.issues[0]?.message || "Invalid address format",
        suggestions: [],
      })
    }

    // Reserved check
    if (RESERVED_MEMORIAL_SLUGS.has(slug)) {
      return NextResponse.json({
        slug,
        valid: false,
        available: false,
        message: "That address is reserved for system pages",
        suggestions: createMemorialSlugCandidates(fullName || slug).slice(1, 4),
      })
    }

    // Check database availability
    const db = getSupabaseAdminSafe() || (await createClient())
    let query = db.from("memorials").select("id").eq("slug", slug)
    if (excludeMemorialId) {
      query = query.neq("id", excludeMemorialId)
    }

    const { data: existing } = await query.maybeSingle()

    if (existing) {
      // Find available alternatives
      const candidates = createMemorialSlugCandidates(fullName || slug)
      const suggestions: string[] = []

      for (const candidate of candidates) {
        if (candidate === slug) continue
        const { data: check } = await db
          .from("memorials")
          .select("id")
          .eq("slug", candidate)
          .maybeSingle()

        if (!check && !RESERVED_MEMORIAL_SLUGS.has(candidate)) {
          suggestions.push(candidate)
          if (suggestions.length >= 3) break
        }
      }

      if (suggestions.length === 0) {
        const randomNum = Math.floor(100 + Math.random() * 900)
        suggestions.push(`${slug}-${randomNum}`)
      }

      return NextResponse.json({
        slug,
        valid: true,
        available: false,
        message: "That address is already in use",
        suggestions,
      })
    }

    return NextResponse.json({
      slug,
      valid: true,
      available: true,
      message: null,
      suggestions: [],
    })
  } catch (err: any) {
    console.error("Check slug error:", err)
    return NextResponse.json({ error: "Unable to check address availability." }, { status: 500 })
  }
}
