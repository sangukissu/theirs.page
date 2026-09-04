import { NextRequest, NextResponse } from "next/server"
import JSZip from "jszip"
import { createClient } from "@/utils/supabase/server"
import { getSupabaseAdminSafe } from "@/utils/supabase/admin"
import { assertMemorialAdmin } from "@/lib/memorial-auth"
import { canAccessFeature } from "@/lib/paywall"
import { getR2ObjectBuffer } from "@/lib/r2"

interface RouteContext {
  params: Promise<{ id: string }>
}

function extractR2Key(url: string): string | null {
  if (!url) return null
  const match = url.match(/(memorials\/[^\s?#]+)/)
  return match ? match[1] : null
}

async function fetchMediaBuffer(url: string): Promise<Buffer | null> {
  try {
    const r2Key = extractR2Key(url)
    if (r2Key) {
      const r2Obj = await getR2ObjectBuffer(r2Key)
      if (r2Obj?.body) return r2Obj.body
    }

    if (url.startsWith("http://") || url.startsWith("https://")) {
      const res = await fetch(url, { signal: AbortSignal.timeout(10000) })
      if (res.ok) {
        const ab = await res.arrayBuffer()
        return Buffer.from(ab)
      }
    }

    return null
  } catch (err) {
    console.warn(`Could not fetch media binary for export from "${url}":`, err)
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

    // Paywall check: Full archive export requires Theirs Complete
    const featureCheck = canAccessFeature(memorial, "export")
    if (!featureCheck.allowed) {
      return NextResponse.json(
        { error: featureCheck.error },
        { status: featureCheck.status || 402 }
      )
    }

    const db = getSupabaseAdminSafe() || supabase

    // Fetch all memorial data collections in parallel
    const [mediaRes, timelineRes, peopleRes, memoriesRes, guestbookRes, collabsRes] =
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
          .from("people_in_life")
          .select("*")
          .eq("memorial_id", memorial.id)
          .order("order_index", { ascending: true }),
        db
          .from("memories")
          .select("*")
          .eq("memorial_id", memorial.id)
          .eq("status", "approved")
          .order("created_at", { ascending: false }),
        db
          .from("guestbook_entries")
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
        cover_photo_url: memorial.cover_photo_url || null,
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
      people_in_life: (peopleRes.data || []).map((p) => ({
        name: p.name,
        relationship: p.relationship,
        photo_url: p.photo_url,
        note: p.note,
      })),
      guestbook_messages: (guestbookRes.data || []).map((g) => ({
        author_name: g.author_name,
        message: g.message,
        date: g.created_at,
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
   family memories, condolences guestbook, and people in their life.

2. /photos/
   Original high-resolution photographs preserved untouched in their native
   formats.

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

    // 3. Assemble JSZip archive
    const zip = new JSZip()

    // Add manifest and README
    zip.file("archive-manifest.json", JSON.stringify(archiveManifest, null, 2))
    zip.file("README.txt", readmeText)

    // Folders
    const photosFolder = zip.folder("photos")
    const audioFolder = zip.folder("audio")
    const videoFolder = zip.folder("video")

    // Download and bundle all media items
    const mediaItems = mediaRes.data || []
    for (let i = 0; i < mediaItems.length; i++) {
      const item = mediaItems[i]
      if (!item.url) continue

      const buffer = await fetchMediaBuffer(item.url)
      if (!buffer) continue

      const cleanCaption = (item.caption || "media")
        .replace(/[^a-zA-Z0-9_-]/g, "_")
        .substring(0, 30)
      const urlExt = item.url.split("?")[0].split(".").pop()?.toLowerCase() || ""
      const isExtValid = ["jpg", "jpeg", "png", "webp", "gif", "mp3", "wav", "m4a", "mp4", "mov"].includes(urlExt)

      if (item.media_type === "image" && photosFolder) {
        const ext = isExtValid ? urlExt : "jpg"
        const filename = `${String(i + 1).padStart(3, "0")}_${cleanCaption}.${ext}`
        photosFolder.file(filename, buffer)
      } else if (item.media_type === "audio" && audioFolder) {
        const ext = isExtValid ? urlExt : "mp3"
        const filename = `${String(i + 1).padStart(3, "0")}_${cleanCaption}.${ext}`
        audioFolder.file(filename, buffer)
      } else if (item.media_type === "video" && videoFolder) {
        const ext = isExtValid ? urlExt : "mp4"
        const filename = `${String(i + 1).padStart(3, "0")}_${cleanCaption}.${ext}`
        videoFolder.file(filename, buffer)
      }
    }

    // Also download portrait and cover photo if available
    if (memorial.portrait_photo_url && photosFolder) {
      const portraitBuffer = await fetchMediaBuffer(memorial.portrait_photo_url)
      if (portraitBuffer) {
        photosFolder.file("000_portrait_photo.jpg", portraitBuffer)
      }
    }

    if (memorial.cover_photo_url && photosFolder) {
      const coverBuffer = await fetchMediaBuffer(memorial.cover_photo_url)
      if (coverBuffer) {
        photosFolder.file("000_cover_photo.jpg", coverBuffer)
      }
    }

    // 4. Generate the ZIP file binary
    const zipBuffer = await zip.generateAsync({
      type: "nodebuffer",
      compression: "DEFLATE",
      compressionOptions: { level: 6 },
    })

    const zipFilename = `${memorial.slug || "memorial"}-family-archive-${dateStamp}.zip`

    return new Response(zipBuffer as any, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${zipFilename}"`,
        "Content-Length": String(zipBuffer.length),
        "Cache-Control": "no-store",
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
