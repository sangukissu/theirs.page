import { NextRequest, NextResponse } from "next/server"
import { downloadZip } from "client-zip"
import { createClient } from "@/utils/supabase/server"
import { getSupabaseAdminSafe } from "@/utils/supabase/admin"
import { assertMemorialAdmin } from "@/lib/memorial-auth"
import { canAccessFeature } from "@/lib/paywall"
import { extractManagedR2Key, getR2ObjectWebStream } from "@/lib/r2"
import { archivalHeicKeyForDisplay } from "@/lib/memorial-image-promotion"

interface RouteContext {
  params: Promise<{ id: string }>
}

function getMediaExtension(url: string, defaultExt: string): string {
  try {
    const cleanUrl = url.split("?")[0]
    const ext = cleanUrl.split(".").pop()?.toLowerCase() || ""
    if (["jpg", "jpeg", "png", "webp", "gif", "heic", "heif", "mp3", "wav", "m4a", "ogg", "mp4", "webm", "mov"].includes(ext)) {
      return ext === "jpeg" ? "jpg" : ext
    }
  } catch {
    // fallback to default
  }
  return defaultExt
}

async function fetchMediaStream(url: string): Promise<{
  stream: ReadableStream<Uint8Array>
  contentLength?: number
  lastModified?: Date
} | null> {
  try {
    const r2Key = extractManagedR2Key(url)
    if (r2Key) {
      const r2Obj = await getR2ObjectWebStream(r2Key)
      if (r2Obj) {
        return {
          stream: r2Obj.stream,
          contentLength: r2Obj.contentLength,
          lastModified: r2Obj.lastModified,
        }
      }
    }

    if (url.startsWith("http://") || url.startsWith("https://")) {
      const res = await fetch(url, { signal: AbortSignal.timeout(15000) })
      if (res.ok && res.body) {
        const cl = Number(res.headers.get("content-length"))
        const lm = res.headers.get("last-modified")
        return {
          stream: res.body as ReadableStream<Uint8Array>,
          contentLength: Number.isSafeInteger(cl) && cl > 0 ? cl : undefined,
          lastModified: lm ? new Date(lm) : undefined,
        }
      }
    }

    return null
  } catch (err) {
    console.warn(`Could not fetch media stream for export from "${url}":`, err)
    return null
  }
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

    const authCheck = await assertMemorialAdmin(id, user.id)
    if (!authCheck.authorized || !authCheck.memorial) {
      return NextResponse.json({ error: authCheck.error || "Forbidden" }, { status: 403 })
    }

    const memorial = authCheck.memorial

    // Paywall check: Full archive export requires Pro Plan
    const featureCheck = canAccessFeature(memorial, "export")
    if (!featureCheck.allowed) {
      return NextResponse.json(
        { error: featureCheck.error },
        { status: featureCheck.status || 402 }
      )
    }

    const db = getSupabaseAdminSafe() || supabase

    // Fetch all memorial data collections in parallel
    const [mediaRes, timelineRes, memoriesRes, collabsRes] =
      await Promise.all([
        db
          .from("media_items")
          .select("*")
          .eq("memorial_id", memorial.id)
          .order("order_index", { ascending: true }),
        db
          .from("timeline_events")
          .select("*")
          .eq("memorial_id", memorial.id)
          .order("year", { ascending: true }),
        db
          .from("memories")
          .select("*")
          .eq("memorial_id", memorial.id)
          .eq("status", "approved")
          .order("created_at", { ascending: false }),
        db
          .from("collaborators")
          .select("id, email, role, invitation_accepted, created_at")
          .eq("memorial_id", memorial.id),
      ])

    const exportTimestamp = new Date().toISOString()
    const dateStamp = exportTimestamp.split("T")[0]

    // 1. Structured Manifest
    const archiveManifest = {
      archive_format: "theirs_family_archive_v2",
      exported_at: exportTimestamp,
      memorial_identity: {
        id: memorial.id,
        slug: memorial.slug,
        full_name: memorial.full_name,
        preferred_name: memorial.preferred_name || null,
        birth_year: memorial.birth_year || null,
        death_year: memorial.death_year || null,
        location: memorial.location || null,
        headline: memorial.headline || null,
        biography: memorial.biography || null,
        portrait_photo_url: memorial.portrait_photo_url || null,
        status: memorial.status,
        privacy: memorial.privacy,
        is_paid_complete: Boolean(memorial.is_paid),
        successor_name: memorial.successor_name || null,
        successor_email: memorial.successor_email || null,
        created_at: memorial.created_at,
      },
      life_timeline: (timelineRes.data || []).map((t) => ({
        year: t.year,
        month: t.month,
        day: t.day,
        title: t.title,
        description: t.description,
        photo_url: t.photo_url,
      })),
      family_memories: (memoriesRes.data || []).map((m) => ({
        author_name: m.author_name,
        author_relationship: m.author_relationship,
        story: m.story,
        approx_year: m.approx_year,
        location: m.location,
        photo_url: m.photo_url,
        contributed_at: m.created_at,
      })),
      media_catalog: (mediaRes.data || []).map((media) => ({
        id: media.id,
        media_type: media.media_type,
        caption: media.caption,
        approx_year: media.approx_year,
        location: media.location,
        url: media.url,
        uploaded_at: media.created_at,
      })),
      caretakers: (collabsRes.data || []).map((c) => ({
        email: c.email,
        role: c.role,
        invitation_accepted: c.invitation_accepted,
        created_at: c.created_at,
      })),
    }

    // 2. Plain-Text Preservation Guide (README.txt)
    const readmeText = `================================================================================
THEIRS (theirs.page) — FAMILY ARCHIVE PRESERVATION PACKAGE
================================================================================

Memorial:   ${memorial.full_name}
Exported:   ${exportTimestamp}
Web Slug:   ${memorial.slug}

This archive is a complete, standalone snapshot of your family's memorial.
There is zero vendor lock-in. You own every story, tribute, and photograph.

PACKAGE CONTENTS:
-----------------
1. archive-manifest.json
   Contains the complete structured life story, biography, timeline events,
   family memories and tributes.

2. /photos/ & /photos/timeline/
   Original high-resolution photographs, portraits, and milestone photos
   preserved untouched in their native formats.

3. /audio/
   Voice notes and audio memos shared by family and friends.

4. /documents/ & /video/
   Any additional media or video clips associated with the memorial.

PRESERVATION ADVICE:
--------------------
We recommend saving a copy of this ZIP bundle to:
- A personal computer or home backup hard drive.
- A physical USB drive kept in a safe family location.
- Your personal cloud storage (Google Drive, iCloud, OneDrive, Dropbox).

Thank you for trusting Theirs to help preserve ${memorial.full_name}'s memory.
================================================================================
`

    const mediaItems = mediaRes.data || []

    // Build lookup map from community display keys to untouched high-res original keys
    const displayToOriginalKeyMap = new Map<string, string>()
    for (const memory of memoriesRes.data || []) {
      const records = Array.isArray((memory as any).safety_details?.media)
        ? ((memory as any).safety_details.media as Array<{ display_key?: string; original_key?: string }>)
        : []
      for (const rec of records) {
        if (rec.display_key && rec.original_key) {
          const cleanDisplay = extractManagedR2Key(rec.display_key) || rec.display_key
          const cleanOriginal = extractManagedR2Key(rec.original_key) || rec.original_key
          displayToOriginalKeyMap.set(cleanDisplay, cleanOriginal)
        }
      }
    }

    // 3. Web Streams sequential generator (STORE/uncompressed for fast streaming & low memory)
    async function* generateArchiveEntries() {
      // Add manifest and README
      yield {
        name: "archive-manifest.json",
        input: JSON.stringify(archiveManifest, null, 2),
        lastModified: new Date(),
      }

      yield {
        name: "README.txt",
        input: readmeText,
        lastModified: new Date(),
      }

      // Portrait photo if configured
      if (memorial.portrait_photo_url) {
        const portraitKey = extractManagedR2Key(memorial.portrait_photo_url) || memorial.portrait_photo_url
        const portraitOriginal = archivalHeicKeyForDisplay(portraitKey)
        const portraitMedia = portraitOriginal
          ? await fetchMediaStream(portraitOriginal) || await fetchMediaStream(memorial.portrait_photo_url)
          : await fetchMediaStream(memorial.portrait_photo_url)
        if (portraitMedia) {
          const ext = getMediaExtension(portraitOriginal || memorial.portrait_photo_url, "jpg")
          yield {
            name: `photos/000_portrait_photo.${ext}`,
            input: portraitMedia.stream,
            size: portraitMedia.contentLength,
            lastModified: portraitMedia.lastModified || new Date(),
          }
        }
      }

      // Sequentially stream media files directly from R2 without accumulating in RAM
      for (let i = 0; i < mediaItems.length; i++) {
        const item = mediaItems[i]
        if (!item.url) continue

        const itemKey = extractManagedR2Key(item.url) || item.url
        // If this item was contributed by community and has an untouched high-res original in originals/, prefer it
        const originalKey = displayToOriginalKeyMap.get(itemKey) || archivalHeicKeyForDisplay(itemKey)
        const targetSource = originalKey || item.url

        let media = await fetchMediaStream(targetSource)
        if (!media && originalKey) {
          // Fallback to display derivative if original stream was not found
          media = await fetchMediaStream(item.url)
        }
        if (!media) continue

        const cleanCaption = (item.caption || "media")
          .replace(/[^a-zA-Z0-9_-]/g, "_")
          .substring(0, 30)
        const defaultExt = item.media_type === "video" ? "mp4" : item.media_type === "audio" ? "mp3" : "jpg"
        const ext = getMediaExtension(targetSource, defaultExt)
        const filename = `${String(i + 1).padStart(3, "0")}_${cleanCaption}.${ext}`

        let folder = "photos"
        if (item.media_type === "audio") folder = "audio"
        else if (item.media_type === "video") folder = "video"

        yield {
          name: `${folder}/${filename}`,
          input: media.stream,
          size: media.contentLength,
          lastModified: media.lastModified || new Date(),
        }
      }

      // Sequentially stream timeline milestone photographs
      const timelineEvents = timelineRes.data || []
      const streamedTimelineKeys = new Set<string>()
      let timelinePhotoIndex = 0

      for (const event of timelineEvents) {
        if (!event.photo_url) continue
        const rawKey = extractManagedR2Key(event.photo_url) || event.photo_url
        if (streamedTimelineKeys.has(rawKey)) continue
        streamedTimelineKeys.add(rawKey)

        const originalKey = archivalHeicKeyForDisplay(rawKey)
        const media = originalKey
          ? await fetchMediaStream(originalKey) || await fetchMediaStream(event.photo_url)
          : await fetchMediaStream(event.photo_url)
        if (!media) continue

        timelinePhotoIndex++
        const cleanTitle = (event.title || "milestone")
          .replace(/[^a-zA-Z0-9_-]/g, "_")
          .substring(0, 30)
        const ext = getMediaExtension(originalKey || event.photo_url, "jpg")
        const filename = `${String(timelinePhotoIndex).padStart(2, "0")}_${event.year}_${cleanTitle}.${ext}`

        yield {
          name: `photos/timeline/${filename}`,
          input: media.stream,
          size: media.contentLength,
          lastModified: media.lastModified || new Date(),
        }
      }
    }

    const zipFilename = `${memorial.slug || "memorial"}-family-archive-${dateStamp}.zip`
    const zipStreamResponse = downloadZip(generateArchiveEntries())

    return new Response(zipStreamResponse.body, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${zipFilename}"`,
        "Cache-Control": "private, no-store",
      },
    })
  } catch (err: any) {
    console.error("Archive export error:", err)
    return NextResponse.json(
      { error: "Failed to generate family archive package. Please try again." },
      { status: 500 }
    )
  }
}
