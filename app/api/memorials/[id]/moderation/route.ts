import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { getSupabaseAdminSafe } from "@/utils/supabase/admin"
import { assertMemorialAdmin } from "@/lib/memorial-auth"
import {
  copyR2Object,
  deleteR2Object,
  extractManagedR2Key,
} from "@/lib/r2"

interface RouteContext {
  params: Promise<{ id: string }>
}

interface ContributionMediaRecord {
  original_key: string
  display_key: string
  mime?: string
}

function mediaRecords(details: unknown, memorialId: string): ContributionMediaRecord[] {
  if (!details || typeof details !== "object") return []
  const media = (details as { media?: unknown }).media
  if (!Array.isArray(media)) return []
  const records: ContributionMediaRecord[] = []
  for (const item of media) {
    if (!item || typeof item !== "object") continue
    const candidate = item as ContributionMediaRecord
    if (
      typeof candidate.original_key !== "string" ||
      typeof candidate.display_key !== "string"
    ) continue
    const originalKey = extractManagedR2Key(candidate.original_key) || candidate.original_key
    const displayKey = extractManagedR2Key(candidate.display_key) || candidate.display_key
    const validOriginal =
      originalKey.startsWith(`quarantine/${memorialId}/original/`) ||
      originalKey.startsWith(`originals/${memorialId}/community/`)
    const validDisplay =
      displayKey.startsWith(`quarantine/${memorialId}/display/`) ||
      displayKey.startsWith(`memorials/${memorialId}/community/`)
    if (validOriginal && validDisplay) {
      records.push({ ...candidate, original_key: originalKey, display_key: displayKey })
    }
  }
  return records
}

function filenameFromKey(key: string): string {
  const filename = key.split("/").pop() || ""
  if (!/^[a-f0-9-]+\.(?:jpg|png|webp)$/i.test(filename)) {
    throw new Error("Invalid contribution media key")
  }
  return filename
}

function replaceMediaUrls(
  urls: unknown,
  replacements: Map<string, string>
): string[] {
  if (!Array.isArray(urls)) return []
  return urls.map((url) => {
    if (typeof url !== "string") return ""
    const key = extractManagedR2Key(url) || url
    return replacements.get(key) || url
  }).filter(Boolean)
}

async function removeManagedContributionMedia(
  db: NonNullable<ReturnType<typeof getSupabaseAdminSafe>>,
  memorialId: string,
  details: unknown,
  photoUrls: unknown
) {
  const records = mediaRecords(details, memorialId)
  const legacyQuarantineKeys = Array.isArray(photoUrls)
    ? photoUrls.flatMap((url) => {
        const key = extractManagedR2Key(typeof url === "string" ? url : null)
        return key?.startsWith(`quarantine/${memorialId}/`) ? [key] : []
      })
    : []
  const keys = [...records.flatMap((item) => [item.original_key, item.display_key]), ...legacyQuarantineKeys]
  await Promise.allSettled(keys.map(deleteR2Object))
  const publicKeys = records
    .map((item) => item.display_key)
    .filter((key) => key.startsWith(`memorials/${memorialId}/community/`))
  if (publicKeys.length > 0) {
    await db.from("media_items")
      .delete()
      .eq("memorial_id", memorialId)
      .in("url", publicKeys)
  }
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const { id: memorialId } = await context.params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { errorResponse } = await assertMemorialAdmin(memorialId, user.id)
    if (errorResponse) return errorResponse

    const db = getSupabaseAdminSafe()
    if (!db) return NextResponse.json({ error: "Moderation is temporarily unavailable." }, { status: 503 })

    const body = await req.json().catch(() => ({}))
    const { target, targetId, action } = body
    if (typeof targetId !== "string" || !/^[0-9a-f-]{36}$/i.test(targetId)) {
      return NextResponse.json({ error: "Invalid moderation target." }, { status: 400 })
    }
    if (!['memory', 'caretaker_message'].includes(target)) {
      return NextResponse.json({ error: "Invalid moderation target." }, { status: 400 })
    }

    const allowedActions = target === "memory"
      ? ["approve", "reject", "unpublish", "delete"]
      : ["read", "archive", "delete"]
    if (!allowedActions.includes(action)) {
      return NextResponse.json({ error: "Invalid moderation action." }, { status: 400 })
    }

    if (target === "caretaker_message") {
      if (action === "delete") {
        const { error } = await db.from("caretaker_messages")
          .delete().eq("id", targetId).eq("memorial_id", memorialId)
        if (error) return NextResponse.json({ error: "Failed to delete message." }, { status: 500 })
        return NextResponse.json({ success: true, action: "deleted" })
      }
      const status = action === "archive" ? "archived" : "read"
      const { error } = await db.from("caretaker_messages")
        .update({ status, read_at: new Date().toISOString() })
        .eq("id", targetId).eq("memorial_id", memorialId)
      if (error) return NextResponse.json({ error: "Failed to update message." }, { status: 500 })
      return NextResponse.json({ success: true, status })
    }

    const { data: memory, error: fetchError } = await db.from("memories")
      .select("*").eq("id", targetId).eq("memorial_id", memorialId).maybeSingle()
    if (fetchError || !memory) {
      return NextResponse.json({ error: "Contribution not found." }, { status: 404 })
    }

    if (
      (memory.status === "blocked" || memory.safety_decision === "blocked") &&
      action !== "delete"
    ) {
      return NextResponse.json(
        { error: "Platform-blocked content can only be permanently deleted." },
        { status: 409 }
      )
    }

    if (action === "delete") {
      const { error } = await db.from("memories")
        .delete().eq("id", targetId).eq("memorial_id", memorialId)
      if (error) return NextResponse.json({ error: "Failed to delete contribution." }, { status: 500 })
      await removeManagedContributionMedia(
        db,
        memorialId,
        memory.safety_details,
        [...(Array.isArray(memory.photo_urls) ? memory.photo_urls : []), memory.photo_url].filter(Boolean)
      )
      return NextResponse.json({ success: true, action: "deleted" })
    }

    if (action === "reject") {
      const { error } = await db.from("memories")
        .update({
          status: "rejected",
          approved_at: null,
          is_quarantined: false,
          photo_url: null,
          photo_urls: [],
          safety_details: { ...(memory.safety_details || {}), media: [] },
        })
        .eq("id", targetId).eq("memorial_id", memorialId)
      if (error) return NextResponse.json({ error: "Failed to decline contribution." }, { status: 500 })
      await removeManagedContributionMedia(
        db,
        memorialId,
        memory.safety_details,
        [...(Array.isArray(memory.photo_urls) ? memory.photo_urls : []), memory.photo_url].filter(Boolean)
      )
      return NextResponse.json({ success: true, status: "rejected" })
    }

    if (action === "approve") {
      const records = mediaRecords(memory.safety_details, memorialId)
      const photoUrls = [
        ...(Array.isArray(memory.photo_urls) ? memory.photo_urls : []),
        ...(memory.photo_url ? [memory.photo_url] : []),
      ]
      const verifiedDisplayKeys = new Set(records.map((record) => record.display_key))
      const hasUnverifiedQuarantinedMedia = photoUrls.some((url) => {
        const key = extractManagedR2Key(typeof url === "string" ? url : null)
        return Boolean(
          key &&
          key.startsWith(`quarantine/${memorialId}/`) &&
          !verifiedDisplayKeys.has(key)
        )
      })
      if (hasUnverifiedQuarantinedMedia) {
        return NextResponse.json(
          {
            error:
              "This photograph predates verified image screening. Delete this submission and ask the contributor to upload it again.",
          },
          { status: 409 }
        )
      }
      const replacements = new Map<string, string>()
      const updatedRecords: ContributionMediaRecord[] = []
      const copiedSources: string[] = []

      try {
        for (const record of records) {
          const displaySource = extractManagedR2Key(record.display_key) || record.display_key
          const originalSource = extractManagedR2Key(record.original_key) || record.original_key
          const displayDestination = `memorials/${memorialId}/community/${filenameFromKey(displaySource)}`
          const originalDestination = `originals/${memorialId}/community/${filenameFromKey(originalSource)}`

          if (displaySource !== displayDestination) {
            await copyR2Object(displaySource, displayDestination)
            copiedSources.push(displaySource)
          }
          if (originalSource !== originalDestination) {
            await copyR2Object(originalSource, originalDestination)
            copiedSources.push(originalSource)
          }
          replacements.set(displaySource, displayDestination)
          updatedRecords.push({
            ...record,
            display_key: displayDestination,
            original_key: originalDestination,
          })
        }
      } catch (error) {
        console.error("Contribution media copy failed:", error)
        return NextResponse.json(
          { error: "The contribution is safe, but its photographs could not be published. Please try again." },
          { status: 503 }
        )
      }

      const updatedUrls = replaceMediaUrls(memory.photo_urls, replacements)
      const details = {
        ...(memory.safety_details || {}),
        media: updatedRecords,
      }
      const { error } = await db.from("memories").update({
        status: "approved",
        approved_at: new Date().toISOString(),
        is_quarantined: false,
        photo_url: memory.photo_url
          ? replacements.get(extractManagedR2Key(memory.photo_url) || memory.photo_url) || memory.photo_url
          : null,
        photo_urls: updatedUrls,
        safety_details: details,
      }).eq("id", targetId).eq("memorial_id", memorialId)

      if (error) {
        console.error("Contribution approval update failed:", error)
        return NextResponse.json({ error: "Failed to approve contribution." }, { status: 500 })
      }

      await Promise.allSettled(copiedSources.map(deleteR2Object))
      for (const record of updatedRecords) {
        const { data: existing } = await db.from("media_items")
          .select("id").eq("memorial_id", memorialId).eq("url", record.display_key).maybeSingle()
        if (!existing) {
          await db.from("media_items").insert({
            memorial_id: memorialId,
            media_type: "image",
            url: record.display_key,
            caption: `Shared by ${memory.author_name}`,
            approx_year: memory.approx_year || null,
            album: "Community Memories",
          })
        }
      }

      return NextResponse.json({ success: true, status: "approved" })
    }

    if (action === "unpublish") {
      const records = mediaRecords(memory.safety_details, memorialId)
      const replacements = new Map<string, string>()
      const updatedRecords: ContributionMediaRecord[] = []
      const publicSources: string[] = []

      try {
        for (const record of records) {
          const displaySource = extractManagedR2Key(record.display_key) || record.display_key
          const destination = `quarantine/${memorialId}/display/${filenameFromKey(displaySource)}`
          if (displaySource !== destination) {
            await copyR2Object(displaySource, destination)
            publicSources.push(displaySource)
          }
          replacements.set(displaySource, destination)
          updatedRecords.push({ ...record, display_key: destination })
        }
      } catch (error) {
        console.error("Contribution media quarantine copy failed:", error)
        return NextResponse.json({ error: "Failed to unpublish contribution media." }, { status: 503 })
      }

      const { error } = await db.from("memories").update({
        status: "pending_approval",
        approved_at: null,
        is_quarantined: records.length > 0,
        photo_url: memory.photo_url
          ? replacements.get(extractManagedR2Key(memory.photo_url) || memory.photo_url) || memory.photo_url
          : null,
        photo_urls: replaceMediaUrls(memory.photo_urls, replacements),
        safety_details: { ...(memory.safety_details || {}), media: updatedRecords },
      }).eq("id", targetId).eq("memorial_id", memorialId)
      if (error) return NextResponse.json({ error: "Failed to unpublish contribution." }, { status: 500 })

      if (publicSources.length > 0) {
        await db.from("media_items").delete()
          .eq("memorial_id", memorialId).in("url", publicSources)
        await Promise.allSettled(publicSources.map(deleteR2Object))
      }
      return NextResponse.json({ success: true, status: "pending_approval" })
    }

    return NextResponse.json({ error: "Unhandled moderation action." }, { status: 400 })
  } catch (error) {
    console.error("Moderation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
