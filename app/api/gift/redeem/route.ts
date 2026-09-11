import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { createClient } from "@/utils/supabase/server"
import { getSupabaseAdminSafe } from "@/utils/supabase/admin"
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

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: "You must be signed in to claim this memorial gift." },
        { status: 401 }
      )
    }

    const body = await req.json().catch(() => null)
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid request payload." }, { status: 400 })
    }

    const token = typeof body.token === "string" ? body.token.trim() : ""
    const mode = body.mode === "existing_memorial" ? "existing_memorial" : "new_memorial"

    if (!token || token.length < 32) {
      return NextResponse.json({ error: "Invalid claim link token." }, { status: 400 })
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex")
    const db = getSupabaseAdminSafe() || supabase

    // 1. Verify gift status in database
    const { data: gift, error: giftError } = await db
      .from("memorial_gifts")
      .select("id, status, buyer_name, recipient_name, recipient_email")
      .eq("claim_token_hash", tokenHash)
      .maybeSingle()

    if (giftError || !gift) {
      return NextResponse.json({ error: "Memorial gift not found or invalid link." }, { status: 404 })
    }

    if (gift.status === "redeemed") {
      return NextResponse.json(
        { error: "This gift memorial has already been claimed." },
        { status: 409 }
      )
    }

    if (gift.status === "refunded") {
      return NextResponse.json(
        { error: "This gift has been refunded." },
        { status: 410 }
      )
    }

    if (gift.status !== "available") {
      return NextResponse.json(
        { error: "This gift is pending payment activation." },
        { status: 400 }
      )
    }

    // MODE A: Apply to an existing memorial owned by user
    if (mode === "existing_memorial") {
      const rawMemorialId = body.memorialId ?? body.memorial_id
      const memorialId = typeof rawMemorialId === "string" ? rawMemorialId.trim() : ""
      if (!memorialId) {
        return NextResponse.json({ error: "Target memorial is required." }, { status: 400 })
      }

      // Verify user owns or co-admins memorial
      const { data: memorial, error: memErr } = await db
        .from("memorials")
        .select("id, owner_id, slug, is_paid")
        .eq("id", memorialId)
        .maybeSingle()

      if (memErr || !memorial) {
        return NextResponse.json({ error: "Selected memorial not found." }, { status: 404 })
      }

      if (memorial.owner_id !== user.id) {
        const { data: col } = await db
          .from("collaborators")
          .select("id")
          .eq("memorial_id", memorialId)
          .eq("user_id", user.id)
          .eq("role", "co_admin")
          .eq("invitation_accepted", true)
          .maybeSingle()

        if (!col) {
          return NextResponse.json(
            { error: "You do not have permission to upgrade this memorial." },
            { status: 403 }
          )
        }
      }

      // Run atomic redemption RPC
      const { data: rpcResult, error: rpcError } = await db.rpc("redeem_memorial_gift", {
        p_claim_token_hash: tokenHash,
        p_user_id: user.id,
        p_target_memorial_id: memorialId,
      })

      if (rpcError) {
        console.error("RPC redeem_memorial_gift error:", rpcError)
        return NextResponse.json(
          { error: "Failed to redeem gift. Please try again or contact support." },
          { status: 500 }
        )
      }

      if (rpcResult && !rpcResult.success) {
        return NextResponse.json(
          { error: rpcResult.error || "Unable to redeem gift." },
          { status: 400 }
        )
      }

      return NextResponse.json({
        success: true,
        memorialId,
        redirectUrl: `/dashboard/memorials/${memorialId}/editor?gift_applied=true`,
      })
    }

    // MODE B: Create brand-new prepaid Complete memorial
    const rawFullName = body.fullName ?? body.full_name
    const fullName = cleanDisplayName(rawFullName, TEXT_LIMITS.personFullName)

    if (fullName.length < 2) {
      return NextResponse.json(
        { error: "A name for your loved one is required (at least 2 characters)." },
        { status: 400 }
      )
    }

    // Caretaker profile check
    const { data: profile } = await db
      .from("user_profiles")
      .select("full_name")
      .eq("user_id", user.id)
      .maybeSingle()

    const rawCreatorName = body.creatorName ?? body.creator_name
    let caretakerName = cleanDisplayName(profile?.full_name, 100)
    if (caretakerName.length < 2 && typeof rawCreatorName === "string" && rawCreatorName.trim().length >= 2) {
      const cleanCreator = cleanDisplayName(rawCreatorName, 100)
      const { error: profUpdateErr } = await db
        .from("user_profiles")
        .update({ full_name: cleanCreator, updated_at: new Date().toISOString() })
        .eq("user_id", user.id)
      if (!profUpdateErr) {
        caretakerName = cleanCreator
      }
    }

    if (caretakerName.length < 2) {
      caretakerName = cleanDisplayName(gift.recipient_name, 100) || "Caretaker"
    }

    const rawRelationship = body.creatorRelationship ?? body.creator_relationship
    const creatorRelationship = typeof rawRelationship === "string"
      ? cleanDisplayName(rawRelationship, 80)
      : null

    // Determine unique slug
    const rawDesiredSlug = body.desiredSlug ?? body.desired_slug
    const desiredSlug = typeof rawDesiredSlug === "string" ? rawDesiredSlug : ""
    const rawRequested = desiredSlug.trim() ? desiredSlug : fullName
    let normalized = normalizeMemorialSlug(rawRequested)
    if (normalized.length < 3) {
      normalized = normalizeMemorialSlug(`memorial-${normalized}`)
    }

    let finalSlug = normalized
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

    const memorialLanguage =
      typeof body.language === "string" && body.language.trim()
        ? body.language.trim().toLowerCase().slice(0, 10)
        : "en"

    // Create memorial with is_paid = true
    const insertPayload: Record<string, any> = {
      owner_id: user.id,
      slug: finalSlug,
      full_name: fullName,
      status: "draft",
      privacy: "unlisted",
      language: memorialLanguage,
      is_paid: true,
      paid_at: new Date().toISOString(),
    }
    if (creatorRelationship) {
      insertPayload.creator_relationship = creatorRelationship
    }

    const { data: newMemorial, error: insertError } = await db
      .from("memorials")
      .insert(insertPayload)
      .select()
      .single()

    if (insertError) {
      console.error("Error creating gift memorial:", insertError)
      return NextResponse.json(
        { error: "Could not create memorial. Please try again." },
        { status: 500 }
      )
    }

    // Call atomic redemption RPC to bind the gift to this new memorial
    const { data: rpcResult, error: rpcError } = await db.rpc("redeem_memorial_gift", {
      p_claim_token_hash: tokenHash,
      p_user_id: user.id,
      p_target_memorial_id: newMemorial.id,
    })

    if (rpcError || (rpcResult && !rpcResult.success)) {
      console.error("Redemption RPC error after creating memorial:", rpcError || rpcResult)
      // Even if RPC had an issue, fallback to updating gift directly
      await db
        .from("memorial_gifts")
        .update({
          status: "redeemed",
          redeemed_by_user_id: user.id,
          redeemed_memorial_id: newMemorial.id,
          redeemed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("claim_token_hash", tokenHash)
    }

    // Send welcome email
    try {
      await sendMemorialCreatedEmail({
        email: user.email,
        caretakerName,
        memorialId: newMemorial.id,
        memorialName: newMemorial.full_name,
      })
    } catch (emailErr) {
      console.error("Non-fatal email error after gift claim:", emailErr)
    }

    return NextResponse.json({
      success: true,
      memorialId: newMemorial.id,
      slug: newMemorial.slug,
      redirectUrl: `/dashboard/memorials/${newMemorial.id}/editor?gift_applied=true`,
    })
  } catch (err: any) {
    console.error("Gift redeem error:", err)
    return NextResponse.json({ error: "Internal server error." }, { status: 500 })
  }
}
