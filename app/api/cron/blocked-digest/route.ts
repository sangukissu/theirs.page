import { NextResponse } from "next/server"
import { getSupabaseAdminSafe } from "@/utils/supabase/admin"
import { isAuthorizedCronRequest } from "@/lib/security/cron"
import {
  escapeEmailHtml,
  getTheirsAppUrl,
  notifyCaretakers,
} from "@/lib/email/caretaker-notifications"

export const dynamic = "force-dynamic"
export const maxDuration = 60

interface BlockedSubmission {
  id: string
  memorial_id: string
  safety_details: Record<string, unknown> | null
}

function completedWeeklyWindow(now = new Date()): { start: Date; end: Date } {
  const end = new Date(now)
  const daysSinceMonday = (end.getUTCDay() + 6) % 7
  end.setUTCDate(end.getUTCDate() - daysSinceMonday)
  end.setUTCHours(3, 30, 0, 0)
  if (end.getTime() > now.getTime()) end.setUTCDate(end.getUTCDate() - 7)
  const start = new Date(end)
  start.setUTCDate(start.getUTCDate() - 7)
  return { start, end }
}

function categorySummary(submissions: BlockedSubmission[]): string {
  const labels: Array<[string, string]> = [
    ["spam", "spam"],
    ["scam", "scam"],
    ["threat", "threats"],
    ["harassment", "harassment"],
    ["hate", "hate content"],
    ["sexual", "sexual content"],
    ["garbage", "automated/bot text"],
  ]
  const counts = labels.flatMap(([key, label]) => {
    const count = submissions.filter((item) => item.safety_details?.[key] === true).length
    return count ? [`${count} ${label}`] : []
  })
  return counts.length ? counts.join(", ") : "automated safety rules"
}

export async function GET(request: Request) {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const db = getSupabaseAdminSafe()
  if (!db) {
    return NextResponse.json({ error: "Digest service is not configured." }, { status: 503 })
  }

  const { start, end } = completedWeeklyWindow()
  const { data, error } = await db
    .from("memories")
    .select("id, memorial_id, safety_details")
    .eq("status", "blocked")
    .gte("created_at", start.toISOString())
    .lt("created_at", end.toISOString())
    .limit(10_000)

  if (error) {
    console.error("Blocked contribution digest query failed:", error.code)
    return NextResponse.json({ error: "Could not build digest." }, { status: 500 })
  }

  const grouped = new Map<string, BlockedSubmission[]>()
  for (const row of (data || []) as BlockedSubmission[]) {
    grouped.set(row.memorial_id, [...(grouped.get(row.memorial_id) || []), row])
  }
  if (grouped.size === 0) {
    return NextResponse.json({ ok: true, memorialsNotified: 0, blockedSubmissions: 0 })
  }

  const memorialIds = [...grouped.keys()]
  const { data: memorials, error: memorialError } = await db
    .from("memorials")
    .select("id, full_name, owner_id")
    .in("id", memorialIds)
  if (memorialError) {
    console.error("Blocked digest memorial query failed:", memorialError.code)
    return NextResponse.json({ error: "Could not resolve digest recipients." }, { status: 500 })
  }

  for (const memorial of memorials || []) {
    const submissions = grouped.get(memorial.id) || []
    if (!submissions.length) continue
    const dashboardUrl = `${getTheirsAppUrl()}/dashboard/memorials/${memorial.id}/editor?tab=moderation`
    const countLabel = `${submissions.length} blocked submission${submissions.length === 1 ? "" : "s"}`
    await notifyCaretakers({
      db,
      memorialId: memorial.id,
      ownerId: memorial.owner_id,
      eventKey: `blocked-digest/${end.toISOString().slice(0, 10)}/${memorial.id}`,
      subject: `Weekly safety digest for ${memorial.full_name}: ${countLabel}`,
      html: `<div style="font-family:Georgia,serif;max-width:520px;margin:0 auto;padding:40px 20px;color:#181925;line-height:1.6"><h2 style="font-size:20px;font-weight:normal">Weekly blocked-submission digest</h2><p>Theirs blocked <strong>${submissions.length}</strong> visitor submission${submissions.length === 1 ? "" : "s"} for <strong>${escapeEmailHtml(memorial.full_name)}</strong> before publication.</p><p style="font:13px sans-serif;color:#666">Categories: ${escapeEmailHtml(categorySummary(submissions))}. Harmful submission text is intentionally omitted from email.</p><a href="${escapeEmailHtml(dashboardUrl)}" style="background:#181925;color:#fff;padding:11px 22px;border-radius:22px;text-decoration:none;font:500 13px sans-serif;display:inline-block">Open protected moderation</a></div>`,
    })
  }

  return NextResponse.json({
    ok: true,
    windowStart: start.toISOString(),
    windowEnd: end.toISOString(),
    memorialsNotified: memorials?.length || 0,
    blockedSubmissions: data?.length || 0,
  })
}
