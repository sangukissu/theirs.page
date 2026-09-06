import { NextResponse } from "next/server"
import { deleteR2PrefixOlderThan } from "@/lib/r2"
import { isAuthorizedCronRequest } from "@/lib/security/cron"
import { getSupabaseAdminSafe } from "@/utils/supabase/admin"

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

  for (const prefix of TEMP_PREFIXES) {
    try {
      const result = await deleteR2PrefixOlderThan(prefix, RETENTION_MS)
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

  const admin = getSupabaseAdminSafe()
  if (admin) {
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
    prefixes: TEMP_PREFIXES,
    ...totals,
  })
}
