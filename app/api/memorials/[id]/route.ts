import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { getSupabaseAdminSafe } from "@/utils/supabase/admin"
import { assertMemorialAdmin, assertMemorialOwner } from "@/lib/memorial-auth"
import { canAccessFeature } from "@/lib/paywall"
import {
  deleteR2Object,
  deleteR2MemorialFolder,
  extractManagedR2Key,
  resolveMediaUrl,
} from "@/lib/r2"
import {
  normalizeMemorialSlug,
  memorialSlugSchema,
  RESERVED_MEMORIAL_SLUGS,
} from "@/lib/memorial-slug"
import { hashPin } from "@/lib/security/pin"
import { sendMemorialDeletedEmail, sendMemorialPublishedEmail } from "@/lib/email/lifecycle-emails"
import { finalizeMemorialStorage, releaseMemorialStorage } from "@/lib/storage-quota"
import { TEXT_LIMITS } from "@/lib/validation/text-limits"
import { isValidEmail, sanitizeAndValidateRichText, validateTextFields } from "@/lib/validation/server-text"
import { archivalHeicKeyForDisplay, promoteStagedMemorialImage } from "@/lib/memorial-image-promotion"

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

    const { errorResponse } = await assertMemorialAdmin(id, user.id)
    if (errorResponse) return errorResponse

    const db = getSupabaseAdminSafe() || supabase

    // 1. Fetch Memorial
    const { data: memorial, error } = await db
      .from("memorials")
      .select("*")
      .eq("id", id)
      .maybeSingle()

    if (error || !memorial) {
      return NextResponse.json({ error: "Memorial not found" }, { status: 404 })
    }

    // 2. Fetch all relational sub-collections in parallel
    const [mediaRes, timelineRes, memoriesRes] = await Promise.all([
      db.from("media_items").select("*").eq("memorial_id", id).order("order_index", { ascending: true }),
      db.from("timeline_events").select("*").eq("memorial_id", id).order("year", { ascending: true }),
      db.from("memories").select("*").eq("memorial_id", id).order("created_at", { ascending: false }),
    ])

    const { access_pin_hash: accessPinHash, ...safeMemorial } = memorial
    return NextResponse.json({
      memorial: { ...safeMemorial, has_access_pin: Boolean(accessPinHash) },
      mediaItems: mediaRes.data || [],
      timelineEvents: timelineRes.data || [],
      memories: memoriesRes.data || [],
    })
  } catch (err: any) {
    console.error("Memorial detail error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const authCheck = await assertMemorialAdmin(id, user.id)
    if (!authCheck.authorized || !authCheck.memorial) {
      return authCheck.errorResponse || NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const db = getSupabaseAdminSafe() || supabase
    const body = await req.json().catch(() => ({}))

    const textError = validateTextFields(body, {
      full_name: TEXT_LIMITS.personFullName,
      preferred_name: TEXT_LIMITS.preferredName,
      location: TEXT_LIMITS.location,
      headline: TEXT_LIMITS.headline,
      successor_name: TEXT_LIMITS.successorName,
      successor_email: TEXT_LIMITS.email,
    })
    if (textError) return NextResponse.json({ error: textError }, { status: 400 })
    if (typeof body.location === "string" && body.location.trim()) {
      const locationWords = body.location.trim().split(/\s+/).filter(Boolean)
      if (locationWords.length > TEXT_LIMITS.locationMaxWords) {
        return NextResponse.json(
          { error: `Location must be ${TEXT_LIMITS.locationMaxWords} words or fewer (e.g. City, Country or State).` },
          { status: 400 }
        )
      }
    }
    if (typeof body.successor_email === "string" && body.successor_email.trim() && !isValidEmail(body.successor_email.trim())) {
      return NextResponse.json({ error: "Please enter a valid successor email address." }, { status: 400 })
    }
    if (body.biography !== undefined) {
      const biography = sanitizeAndValidateRichText(body.biography, TEXT_LIMITS.biography)
      if (biography.error) return NextResponse.json({ error: biography.error }, { status: 400 })
      body.biography = biography.html
    }

    if (body.status !== undefined && !["draft", "published", "archived"].includes(body.status)) {
      return NextResponse.json({ error: "Invalid publication status." }, { status: 400 })
    }
    if (body.privacy !== undefined && !["public", "unlisted", "private"].includes(body.privacy)) {
      return NextResponse.json({ error: "Invalid privacy level." }, { status: 400 })
    }
    if (body.theme !== undefined && !["quiet", "warm", "garden", "classic", "dusk", "light"].includes(body.theme)) {
      return NextResponse.json({ error: "Invalid appearance atmosphere theme." }, { status: 400 })
    }
    if (body.cover_settings !== undefined && body.cover_settings !== null) {
      if (typeof body.cover_settings !== "object") {
        return NextResponse.json({ error: "Invalid memorial cover settings." }, { status: 400 })
      }
      if (body.cover_settings.type && !["clean", "pattern", "their_world"].includes(body.cover_settings.type)) {
        return NextResponse.json({ error: "Invalid memorial cover type." }, { status: 400 })
      }
    }

    // 1. Permissions Split: Owner-Only Settings vs Co-Admin Editorial Content
    const ownerOnlyFields = [
      "slug",
      "status",
      "privacy",
      "pin",
      "access_pin_hash",
      "successor_name",
      "successor_email",
      "contribution_settings",
    ]

    const attemptedOwnerField = ownerOnlyFields.find((f) => body[f] !== undefined)
    if (attemptedOwnerField && !authCheck.isOwner) {
      return NextResponse.json(
        {
          error:
            "Forbidden: Only the primary memorial steward (creator/owner) can modify address, privacy, access PIN, status, or successor settings.",
        },
        { status: 403 }
      )
    }

    // 2. Paywall Check: Private mode requires Pro Plan ($179)
    if (body.privacy === "private" || (body.pin && body.privacy !== "public")) {
      const paywallCheck = canAccessFeature(authCheck.memorial, "private_mode")
      if (!paywallCheck.allowed) {
        // Prevent free memorials from activating private PIN mode without blocking saving of editorial fields
        body.privacy = authCheck.memorial.privacy === "private" ? "unlisted" : (authCheck.memorial.privacy || "unlisted")
        body.pin = null
      }
    }

    // 3. Whitelist updatable fields
    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    }

    const editorialFields = [
      "full_name",
      "preferred_name",
      "creator_relationship",
      "birth_year",
      "birth_month",
      "birth_day",
      "death_year",
      "death_month",
      "death_day",
      "location",
      "headline",
      "biography",
      "section_settings",
      "contribution_settings",
      "theme",
      "language",
    ]

    for (const f of editorialFields) {
      if (body[f] !== undefined) {
        if (f === "language") {
          updates[f] = typeof body[f] === "string" && body[f].trim()
            ? body[f].trim().toLowerCase().slice(0, 10)
            : "en"
        } else {
          updates[f] = body[f]
        }
      }
    }

    let stagedPortraitToDelete: string | null = null
    let newlyPromotedPortraitKey: string | null = null
    let newlyPromotedPortraitOriginalKey: string | null = null
    const oldPortraitKey = authCheck.memorial.portrait_photo_url
      ? extractManagedR2Key(authCheck.memorial.portrait_photo_url)
      : null

    if (body.portrait_photo_url !== undefined) {
      if (!body.portrait_photo_url) {
        updates.portrait_photo_url = null
      } else {
        const portraitKey = typeof body.portrait_photo_url === "string"
          ? extractManagedR2Key(body.portrait_photo_url)
          : null
        if (!portraitKey) {
          return NextResponse.json(
            { error: "Portrait photograph does not belong to this memorial." },
            { status: 400 }
          )
        }

        if (portraitKey.startsWith(`dashboard-staging/${authCheck.memorial.id}/`)) {
          const promoted = await promoteStagedMemorialImage(
            portraitKey,
            authCheck.memorial.id,
            "portraits",
          )
          newlyPromotedPortraitKey = promoted.displayKey
          newlyPromotedPortraitOriginalKey = promoted.originalKey
          stagedPortraitToDelete = portraitKey
          updates.portrait_photo_url = promoted.displayKey
        } else if (portraitKey.startsWith(`memorials/${authCheck.memorial.id}/`)) {
          updates.portrait_photo_url = portraitKey
        } else {
          return NextResponse.json(
            { error: "Portrait photograph does not belong to this memorial." },
            { status: 400 }
          )
        }
      }
    }

    let stagedCoverToDelete: string | null = null
    let newlyPromotedCoverKey: string | null = null
    let newlyPromotedCoverOriginalKey: string | null = null
    const oldCoverUrl = authCheck.memorial.cover_settings?.cover_url
    const oldCoverKey = oldCoverUrl ? extractManagedR2Key(oldCoverUrl) : null

    if (body.cover_settings !== undefined) {
      if (!body.cover_settings) {
        updates.cover_settings = { type: "clean" }
      } else if (typeof body.cover_settings === "object") {
        const nextCover = { ...body.cover_settings }
        if (nextCover.cover_url && typeof nextCover.cover_url === "string") {
          const coverKey = extractManagedR2Key(nextCover.cover_url)
          if (coverKey && coverKey.startsWith(`dashboard-staging/${authCheck.memorial.id}/`)) {
            const promoted = await promoteStagedMemorialImage(
              coverKey,
              authCheck.memorial.id,
              "covers",
            )
            newlyPromotedCoverKey = promoted.displayKey
            newlyPromotedCoverOriginalKey = promoted.originalKey
            stagedCoverToDelete = coverKey
            nextCover.cover_url = promoted.displayKey
          }
        }
        updates.cover_settings = nextCover
      }
    }

    if (authCheck.isOwner) {
      if (body.status !== undefined) {
        updates.status = body.status
        if (body.status === "published" && !authCheck.memorial.published_at) {
          updates.published_at = new Date().toISOString()
        }
      }
      if (body.privacy !== undefined) updates.privacy = body.privacy
      if (body.successor_name !== undefined) updates.successor_name = body.successor_name
      if (body.successor_email !== undefined) updates.successor_email = body.successor_email

      if (body.pin !== undefined) {
        const nextPin = String(body.pin).trim()
        if (!/^\d{4}$/.test(nextPin)) {
          return NextResponse.json({ error: "PIN must contain exactly four digits." }, { status: 400 })
        }
        updates.access_pin_hash = hashPin(nextPin)
      }

      if (body.privacy === "private" && body.pin === undefined) {
        const { data: pinState } = await db.from("memorials")
          .select("access_pin_hash")
          .eq("id", id)
          .maybeSingle()
        if (!pinState?.access_pin_hash) {
          return NextResponse.json(
            { error: "Set a four-digit PIN before making this memorial private." },
            { status: 400 }
          )
        }
      }

      // If slug update requested, validate and ensure uniqueness
      if (body.slug) {
        const cleanSlug = normalizeMemorialSlug(body.slug)
        const parsed = memorialSlugSchema.safeParse(cleanSlug)

        if (!parsed.success) {
          return NextResponse.json(
            { error: parsed.error.issues[0]?.message || "Invalid address" },
            { status: 400 }
          )
        }

        if (RESERVED_MEMORIAL_SLUGS.has(cleanSlug)) {
          return NextResponse.json(
            { error: "That address is reserved for system use" },
            { status: 400 }
          )
        }

        const { data: slugCheck } = await db
          .from("memorials")
          .select("id")
          .eq("slug", cleanSlug)
          .neq("id", id)
          .maybeSingle()

        if (slugCheck) {
          return NextResponse.json(
            { error: "That address is already taken. Please choose another." },
            { status: 409 }
          )
        }

        updates.slug = cleanSlug
      }
    }

    const { data: updated, error: updateError } = await db
      .from("memorials")
      .update(updates)
      .eq("id", id)
      .select()
      .single()

    if (updateError) {
      if (newlyPromotedPortraitKey) {
        await deleteR2Object(newlyPromotedPortraitKey).catch(() => {})
      }
      if (newlyPromotedPortraitOriginalKey && newlyPromotedPortraitOriginalKey !== newlyPromotedPortraitKey) {
        await deleteR2Object(newlyPromotedPortraitOriginalKey).catch(() => {})
      }
      if (stagedPortraitToDelete) {
        await releaseMemorialStorage(db, id, stagedPortraitToDelete).catch(() => {})
      }
      if (newlyPromotedCoverKey) {
        await deleteR2Object(newlyPromotedCoverKey).catch(() => {})
      }
      if (newlyPromotedCoverOriginalKey && newlyPromotedCoverOriginalKey !== newlyPromotedCoverKey) {
        await deleteR2Object(newlyPromotedCoverOriginalKey).catch(() => {})
      }
      if (stagedCoverToDelete) {
        await releaseMemorialStorage(db, id, stagedCoverToDelete).catch(() => {})
      }
      console.error("Memorial update error:", updateError)
      return NextResponse.json({ error: "Failed to update memorial" }, { status: 500 })
    }

    if (stagedPortraitToDelete && newlyPromotedPortraitKey) {
      try {
        await finalizeMemorialStorage(
          db,
          id,
          stagedPortraitToDelete,
          newlyPromotedPortraitOriginalKey || newlyPromotedPortraitKey,
        )
      } catch (quotaError) {
        await db.from("memorials").update({ portrait_photo_url: oldPortraitKey }).eq("id", id)
        await deleteR2Object(newlyPromotedPortraitKey).catch(() => {})
        if (newlyPromotedPortraitOriginalKey && newlyPromotedPortraitOriginalKey !== newlyPromotedPortraitKey) {
          await deleteR2Object(newlyPromotedPortraitOriginalKey).catch(() => {})
        }
        await releaseMemorialStorage(db, id, stagedPortraitToDelete).catch(() => {})
        console.error("Portrait storage finalization error:", quotaError)
        return NextResponse.json({ error: "Failed to finalize portrait storage." }, { status: 500 })
      }
    }

    if (stagedCoverToDelete && newlyPromotedCoverKey) {
      try {
        await finalizeMemorialStorage(
          db,
          id,
          stagedCoverToDelete,
          newlyPromotedCoverOriginalKey || newlyPromotedCoverKey,
        )
      } catch (quotaError) {
        await db.from("memorials").update({ cover_settings: authCheck.memorial.cover_settings }).eq("id", id)
        await deleteR2Object(newlyPromotedCoverKey).catch(() => {})
        if (newlyPromotedCoverOriginalKey && newlyPromotedCoverOriginalKey !== newlyPromotedCoverKey) {
          await deleteR2Object(newlyPromotedCoverOriginalKey).catch(() => {})
        }
        await releaseMemorialStorage(db, id, stagedCoverToDelete).catch(() => {})
        console.error("Cover storage finalization error:", quotaError)
        return NextResponse.json({ error: "Failed to finalize cover storage." }, { status: 500 })
      }
    }

    // DB update succeeded: Clean up staging file and old portrait/cover files
    if (stagedPortraitToDelete) {
      await deleteR2Object(stagedPortraitToDelete).catch(() => {})
    }
    if (
      body.portrait_photo_url !== undefined &&
      oldPortraitKey &&
      oldPortraitKey !== updates.portrait_photo_url &&
      oldPortraitKey.startsWith(`memorials/${authCheck.memorial.id}/`)
    ) {
      await deleteR2Object(oldPortraitKey).catch(() => {})
      await releaseMemorialStorage(db, id, oldPortraitKey).catch(() => {})
      const oldOriginalKey = archivalHeicKeyForDisplay(oldPortraitKey)
      if (oldOriginalKey) {
        await deleteR2Object(oldOriginalKey).catch(() => {})
        await releaseMemorialStorage(db, id, oldOriginalKey).catch(() => {})
      }
    }

    if (stagedCoverToDelete) {
      await deleteR2Object(stagedCoverToDelete).catch(() => {})
    }
    if (
      body.cover_settings !== undefined &&
      oldCoverKey &&
      oldCoverKey !== updates.cover_settings?.cover_url &&
      oldCoverKey.startsWith(`memorials/${authCheck.memorial.id}/`)
    ) {
      await deleteR2Object(oldCoverKey).catch(() => {})
      await releaseMemorialStorage(db, id, oldCoverKey).catch(() => {})
      const oldOriginalCoverKey = archivalHeicKeyForDisplay(oldCoverKey)
      if (oldOriginalCoverKey) {
        await deleteR2Object(oldOriginalCoverKey).catch(() => {})
        await releaseMemorialStorage(db, id, oldOriginalCoverKey).catch(() => {})
      }
    }

    if (authCheck.memorial.status !== "published" && updated.status === "published") {
      const { data: profile } = await db
        .from("user_profiles")
        .select("full_name")
        .eq("user_id", user.id)
        .maybeSingle()
      await sendMemorialPublishedEmail({
        email: user.email,
        caretakerName: profile?.full_name,
        memorialId: updated.id,
        memorialName: updated.full_name,
        slug: updated.slug,
      })
    }

    return NextResponse.json({
      success: true,
      memorial: {
        ...updated,
        portrait_photo_url: resolveMediaUrl(updated.portrait_photo_url),
        cover_settings: updated.cover_settings
          ? {
              ...updated.cover_settings,
              cover_url: resolveMediaUrl(updated.cover_settings.cover_url),
            }
          : null,
      },
    })
  } catch (err: any) {
    console.error("Memorial PATCH error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
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

    // Only the primary owner can permanently delete a memorial
    const authCheck = await assertMemorialOwner(id, user.id)
    if (!authCheck.authorized || !authCheck.memorial) {
      return authCheck.errorResponse || NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const db = getSupabaseAdminSafe() || supabase
    const { data: profile } = await db
      .from("user_profiles")
      .select("full_name")
      .eq("user_id", user.id)
      .maybeSingle()

    // 1. Storage Cleanup: Delete all physical R2 media files for this memorial
    try {
      await deleteR2MemorialFolder(id)
    } catch (storageErr) {
      console.error("Failed to delete R2 memorial folder:", storageErr)
    }

    // 2. Delete memorial row from database (cascades to child tables)
    const { error } = await db
      .from("memorials")
      .delete()
      .eq("id", id)

    if (error) {
      console.error("Memorial delete error:", error)
      return NextResponse.json({ error: "Failed to delete memorial." }, { status: 500 })
    }

    // 3. Send email confirmation (non-blocking so it never fails the deletion)
    try {
      await sendMemorialDeletedEmail({
        email: user.email,
        caretakerName: profile?.full_name,
        memorialId: authCheck.memorial.id,
        memorialName: authCheck.memorial.full_name || authCheck.memorial.slug || "Memorial",
      })
    } catch (emailErr) {
      console.error("Failed to send memorial deleted email:", emailErr)
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error("Memorial delete error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
