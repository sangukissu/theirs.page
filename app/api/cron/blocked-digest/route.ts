import { NextResponse } from "next/server"
import { getSupabaseAdminSafe } from "@/utils/supabase/admin"
import { isAuthorizedCronRequest } from "@/lib/security/cron"
import {
  getTheirsAppUrl,
  notifyCaretakers,
} from "@/lib/email/caretaker-notifications"
import { emailNotice, renderTheirsEmail } from "@/lib/email/templates"

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
      html: renderTheirsEmail({
        preheader: `${countLabel} were stopped before reaching ${memorial.full_name}’s page.`,
        eyebrow: "Weekly safety summary",
        title: `Theirs protected ${memorial.full_name}’s memorial`,
        bodyHtml: `<p style="margin:0"><strong style="color:#181925">${submissions.length}</strong> visitor submission${submissions.length === 1 ? " was" : "s were"} blocked before publication.</p>${emailNotice(`Categories: ${categorySummary(submissions)}. Harmful text is intentionally never copied into email.`)}`,
        primaryAction: { label: "Open protected moderation", url: dashboardUrl },
      }),
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
