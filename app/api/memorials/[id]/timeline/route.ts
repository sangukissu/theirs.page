import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { getSupabaseAdminSafe } from "@/utils/supabase/admin"
import { assertMemorialAdmin } from "@/lib/memorial-auth"
import { canAccessFeature } from "@/lib/paywall"
import {
  deleteR2Object,
  extractManagedR2Key,
  resolveMediaUrl,
} from "@/lib/r2"
import { finalizeMemorialStorage, releaseMemorialStorage } from "@/lib/storage-quota"
import { TEXT_LIMITS } from "@/lib/validation/text-limits"
import { validateTextFields } from "@/lib/validation/server-text"
import { archivalHeicKeyForDisplay, promoteStagedMemorialImage } from "@/lib/memorial-image-promotion"

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const { id: memorialId } = await context.params
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const authCheck = await assertMemorialAdmin(memorialId, user.id)
    if (!authCheck.authorized || !authCheck.memorial) {
      return authCheck.errorResponse || NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Paywall Check: Life Story timeline requires Pro Plan ($179)
    const featureCheck = canAccessFeature(authCheck.memorial, "timeline")
    if (!featureCheck.allowed) {
      return NextResponse.json(
        { error: featureCheck.error },
        { status: featureCheck.status || 402 }
      )
    }

    const body = await req.json()
    const textError = validateTextFields(body, {
      title: TEXT_LIMITS.timelineTitle,
      description: TEXT_LIMITS.timelineDescription,
      location: TEXT_LIMITS.location,
    })
    if (textError) return NextResponse.json({ error: textError }, { status: 400 })
    const { year, title, description, photo_url, location } = body

    if (!year || !title) {
      return NextResponse.json({ error: "Year and title are required" }, { status: 400 })
    }

    let finalPhotoKey: string | null = null
    let finalOriginalPhotoKey: string | null = null
    let stagingKeyToDelete: string | null = null

    if (photo_url) {
      const photoKey = extractManagedR2Key(photo_url)
      if (!photoKey) {
        return NextResponse.json({ error: "Invalid timeline photo URL." }, { status: 400 })
      }

      if (photoKey.startsWith(`dashboard-staging/${authCheck.memorial.id}/`)) {
        const promoted = await promoteStagedMemorialImage(
          photoKey,
          authCheck.memorial.id,
          "timeline",
        )
        finalPhotoKey = promoted.displayKey
        finalOriginalPhotoKey = promoted.originalKey
        stagingKeyToDelete = photoKey
      } else if (photoKey.startsWith(`memorials/${authCheck.memorial.id}/`)) {
        finalPhotoKey = photoKey
      } else {
        return NextResponse.json({ error: "Timeline photograph does not belong to this memorial." }, { status: 400 })
      }
    }

    const db = getSupabaseAdminSafe() || supabase
    const { data: event, error } = await db
      .from("timeline_events")
      .insert({
        memorial_id: memorialId,
        year: Number(year),
        title: title.trim(),
        description: description?.trim() || null,
        location: location?.trim() || null,
        photo_url: finalPhotoKey,
      })
      .select()
      .single()

    if (error) {
      if (stagingKeyToDelete && finalPhotoKey) {
        await deleteR2Object(finalPhotoKey).catch(() => {})
        if (finalOriginalPhotoKey && finalOriginalPhotoKey !== finalPhotoKey) {
          await deleteR2Object(finalOriginalPhotoKey).catch(() => {})
        }
        await releaseMemorialStorage(db, memorialId, stagingKeyToDelete).catch(() => {})
      }
      console.error("Timeline insert error:", error)
      return NextResponse.json({ error: "Failed to add timeline event." }, { status: 500 })
    }

    if (stagingKeyToDelete && finalPhotoKey) {
      try {
        await finalizeMemorialStorage(db, memorialId, stagingKeyToDelete, finalOriginalPhotoKey || finalPhotoKey)
      } catch (quotaError) {
        await db.from("timeline_events").delete().eq("id", event.id)
        await deleteR2Object(finalPhotoKey).catch(() => {})
        if (finalOriginalPhotoKey && finalOriginalPhotoKey !== finalPhotoKey) {
          await deleteR2Object(finalOriginalPhotoKey).catch(() => {})
        }
        await releaseMemorialStorage(db, memorialId, stagingKeyToDelete).catch(() => {})
        console.error("Timeline storage finalization error:", quotaError)
        return NextResponse.json({ error: "Failed to finalize timeline photograph." }, { status: 500 })
      }
    }

    // Insert succeeded: Remove the temporary staging object
    if (stagingKeyToDelete) {
      await deleteR2Object(stagingKeyToDelete).catch(() => {})
    }

    return NextResponse.json({
      success: true,
      event: {
        ...event,
        photo_url: resolveMediaUrl(finalPhotoKey),
      },
    })
  } catch (err: any) {
    console.error("Timeline POST error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
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

    const url = new URL(req.url)
    const eventId = url.searchParams.get("eventId")

    if (!eventId) {
      return NextResponse.json({ error: "eventId query param required" }, { status: 400 })
    }

    const db = getSupabaseAdminSafe() || supabase

    // 1. Check for associated photo to clean up from R2
    const { data: existingEvent } = await db
      .from("timeline_events")
      .select("photo_url")
      .eq("id", eventId)
      .eq("memorial_id", memorialId)
      .maybeSingle()

    // 2. Delete row from database first
    const { error } = await db
      .from("timeline_events")
      .delete()
      .eq("id", eventId)
      .eq("memorial_id", memorialId)

    if (error) {
      console.error("Timeline delete error:", error)
      return NextResponse.json({ error: "Failed to delete timeline event." }, { status: 500 })
    }

    // 3. Only after DB deletion succeeds: clean up R2 file
    if (existingEvent?.photo_url) {
      const key = extractManagedR2Key(existingEvent.photo_url)
      if (key?.startsWith(`memorials/${memorialId}/`)) {
        await deleteR2Object(key).catch((cleanupErr) => {
          console.warn(`Failed to clean up timeline R2 photo ${key}:`, cleanupErr)
        })
        await releaseMemorialStorage(db, memorialId, key).catch(() => {})
        const originalKey = archivalHeicKeyForDisplay(key)
        if (originalKey) {
          await deleteR2Object(originalKey).catch(() => {})
          await releaseMemorialStorage(db, memorialId, originalKey).catch(() => {})
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error("Timeline DELETE error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
