import { NextResponse } from "next/server"
import { abortR2MultipartUpload, deleteR2Object, deleteR2PrefixOlderThan } from "@/lib/r2"
import { isAuthorizedCronRequest } from "@/lib/security/cron"
import { getSupabaseAdminSafe } from "@/utils/supabase/admin"
import { releaseMemorialStorage } from "@/lib/storage-quota"
import { uploadReservationKey } from "@/lib/uploads/upload-session"
import { extensionForMime } from "@/lib/uploads/constants"

// Cron jobs must never be cached or statically rendered.
export const dynamic = "force-dynamic"
// R2 list + batch delete can take a while on large buckets; allow up to 60s.
export const maxDuration = 60

// Temp staging prefixes that hold one-shot uploads (presigned-upload-url writes
// under these). They are safe to sweep once older than the retention window.
const TEMP_PREFIXES = [
  "temp/restorations/",
  "contribution-staging/",
  "dashboard-staging/",
]

// Keep temp objects for this long before deleting, so in-flight uploads and
// retries have a comfortable window. Temp files are consumed within seconds of
// upload, so 6h is a generous safety margin.
const RETENTION_MS = 6 * 60 * 60 * 1000

/**
 * Sweep stale temp staging objects from R2.
 *
 * Call this from the production scheduler with CRON_SECRET. The 6h retention
 * is enforced inside the handler, so a missed run never deletes objects early.
 */
export async function GET(request: Request) {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const startedAt = new Date().toISOString()
  const totals = { scanned: 0, deleted: 0, skipped: 0, errors: [] as string[] }
  let expiredSessions = 0
  const admin = getSupabaseAdminSafe()
  const protectedSessionKeys = new Set<string>()
  let dashboardSessionLookupComplete = false
  if (admin) {
    let offset = 0
    while (true) {
      const active = await admin.from("media_upload_sessions")
        .select("r2_key")
        .in("status", ["created", "uploading", "uploaded", "verifying", "finalizing"])
        .gt("expires_at", new Date().toISOString())
        .like("r2_key", "dashboard-staging/%")
        .range(offset, offset + 999)
      if (active.error) break
      for (const session of active.data || []) protectedSessionKeys.add(session.r2_key)
      if ((active.data || []).length < 1000) {
        dashboardSessionLookupComplete = true
        break
      }
      offset += 1000
    }
  }

  for (const prefix of TEMP_PREFIXES) {
    if (prefix === "dashboard-staging/" && !dashboardSessionLookupComplete) {
      totals.errors.push("Dashboard staging sweep skipped because active upload sessions could not be resolved safely.")
      continue
    }
    try {
      const result = await deleteR2PrefixOlderThan(prefix, RETENTION_MS, protectedSessionKeys)
      totals.scanned += result.scanned
      totals.deleted += result.deleted
      totals.skipped += result.skipped
      totals.errors.push(...result.errors)
    } catch (err) {
      totals.errors.push(
        `Sweep failed for prefix "${prefix}": ${
          err instanceof Error ? err.message : String(err)
        }`
      )
    }
  }

  if (admin) {
    const expired = await admin.from("media_upload_sessions")
      .select("id, memorial_id, r2_key, multipart_upload_id, status, media_type, mime_type")
      .in("status", ["created", "uploading", "uploaded", "verifying", "finalizing", "failed", "aborted"])
      .lt("expires_at", new Date().toISOString())
      .order("expires_at", { ascending: true })
      .limit(100)
    if (expired.error) {
      totals.errors.push(`Upload session lookup failed: ${expired.error.message}`)
    } else {
      for (const session of expired.data || []) {
        try {
          if (session.multipart_upload_id) {
            await abortR2MultipartUpload(session.r2_key, session.multipart_upload_id).catch(() => {})
          }
          const sourceExtension = extensionForMime(session.mime_type)
          const displayExtension = session.media_type === "image" && ["image/heic", "image/heif"].includes(session.mime_type)
            ? "webp"
            : sourceExtension
          const possibleOrphans = [
            session.r2_key,
            `quarantine/${session.memorial_id}/display/${session.id}.${displayExtension}`,
            `memorials/${session.memorial_id}/community/${session.id}.${displayExtension}`,
            `originals/${session.memorial_id}/community/${session.id}.${sourceExtension}`,
            `memorials/${session.memorial_id}/gallery/${session.id}.${displayExtension}`,
            `originals/${session.memorial_id}/gallery/${session.id}.${sourceExtension}`,
          ]
          await Promise.allSettled([...new Set(possibleOrphans)].map(deleteR2Object))
          await releaseMemorialStorage(admin, session.memorial_id, uploadReservationKey(session.id))
          const update = await admin.from("media_upload_sessions").update({
            status: "expired",
            error_code: "session_expired",
          }).eq("id", session.id).neq("status", "complete")
          if (update.error) throw update.error
          expiredSessions += 1
          console.info("[media-upload] upload_expired", { session_id: session.id })
        } catch (error) {
          totals.errors.push(`Upload session ${session.id} cleanup failed: ${error instanceof Error ? error.message : String(error)}`)
        }
      }
    }

    const { error } = await admin
      .from("memorial_storage_ledger")
      .delete()
      .eq("status", "reserved")
      .lt("expires_at", new Date().toISOString())
    if (error) totals.errors.push(`Storage reservation cleanup failed: ${error.message}`)
  }

  if (totals.errors.length > 0) {
    console.warn("[cleanup-temp] completed with errors:", totals.errors)
  }

  return NextResponse.json({
    ok: true,
    startedAt,
    finishedAt: new Date().toISOString(),
    retentionHours: RETENTION_MS / (60 * 60 * 1000),
    expiredSessions,
    prefixes: TEMP_PREFIXES,
    ...totals,
  })
}
