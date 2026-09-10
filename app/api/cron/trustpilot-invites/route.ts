import { NextResponse } from "next/server"
import { getSupabaseAdminSafe } from "@/utils/supabase/admin"
import { isAuthorizedCronRequest } from "@/lib/security/cron"
import {
  getTrustpilotReviewUrl,
  buildReviewTrackingUrl,
} from "@/lib/reviews/trustpilot"
import {
  sendTrustpilotInviteEmail,
  sendTrustpilotReminderEmail,
} from "@/lib/email/lifecycle-emails"

export const dynamic = "force-dynamic"
export const maxDuration = 60

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000

export async function GET(request: Request) {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // 1. Safe configuration check: If Trustpilot URL is not configured, skip safely
  const reviewUrlConfigured = getTrustpilotReviewUrl()
  if (!reviewUrlConfigured) {
    return NextResponse.json({
      skipped: true,
      reason: "TRUSTPILOT_REVIEW_URL is not configured",
    })
  }

  const db = getSupabaseAdminSafe()
  if (!db) {
    return NextResponse.json({ error: "Database service is not configured." }, { status: 503 })
  }

  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - SEVEN_DAYS_MS).toISOString()

  let invitesSent = 0
  let remindersSent = 0

  try {
    // 2. Scan for initial review invitations
    // Eligibility: Complete memorial (is_paid = true), published (status = 'published'),
    // at least 7 days since publication, no previous invite sent.
    // NOTE: Internal feedback rating NEVER controls eligibility (anti-gating rule).
    const { data: eligibleForInvite, error: inviteErr } = await db
      .from("memorials")
      .select(`
        id,
        owner_id,
        full_name,
        slug,
        is_paid,
        status,
        published_at,
        created_at,
        review_eligible_at,
        review_invite_sent_at
      `)
      .eq("is_paid", true)
      .eq("status", "published")
      .is("review_invite_sent_at", null)
      .or(`published_at.lte.${sevenDaysAgo},and(published_at.is.null,created_at.lte.${sevenDaysAgo})`)
      .limit(50)

    if (inviteErr) {
      console.error("[trustpilot cron invite query error]", inviteErr)
    }

    if (eligibleForInvite && eligibleForInvite.length > 0) {
      for (const memorial of eligibleForInvite) {
        // Fetch owner user profile to get email and name
        const { data: ownerProfile } = await db
          .from("user_profiles")
          .select("email, full_name")
          .eq("user_id", memorial.owner_id)
          .maybeSingle()

        if (!ownerProfile?.email) continue

        const trackingUrl = buildReviewTrackingUrl(memorial.id)
        const sent = await sendTrustpilotInviteEmail({
          email: ownerProfile.email,
          caretakerName: ownerProfile.full_name,
          memorialId: memorial.id,
          memorialName: memorial.full_name,
          reviewUrl: trackingUrl,
        })

        if (sent) {
          invitesSent++
          await db
            .from("memorials")
            .update({
              review_eligible_at: memorial.review_eligible_at || now.toISOString(),
              review_invite_sent_at: now.toISOString(),
              updated_at: now.toISOString(),
            })
            .eq("id", memorial.id)
        }
      }
    }

    // 3. Scan for single reminder invitations
    // Eligibility: Complete memorial (is_paid = true), published (status = 'published'),
    // invite was sent at least 7 days ago, NOT clicked, NO reminder sent yet.
    const { data: eligibleForReminder, error: reminderErr } = await db
      .from("memorials")
      .select(`
        id,
        owner_id,
        full_name,
        slug,
        review_invite_sent_at,
        review_invite_clicked_at,
        review_reminder_sent_at
      `)
      .eq("is_paid", true)
      .eq("status", "published")
      .not("review_invite_sent_at", "is", null)
      .lte("review_invite_sent_at", sevenDaysAgo)
      .is("review_invite_clicked_at", null)
      .is("review_reminder_sent_at", null)
      .limit(50)

    if (reminderErr) {
      console.error("[trustpilot cron reminder query error]", reminderErr)
    }

    if (eligibleForReminder && eligibleForReminder.length > 0) {
      for (const memorial of eligibleForReminder) {
        const { data: ownerProfile } = await db
          .from("user_profiles")
          .select("email, full_name")
          .eq("user_id", memorial.owner_id)
          .maybeSingle()

        if (!ownerProfile?.email) continue

        const trackingUrl = buildReviewTrackingUrl(memorial.id)
        const sent = await sendTrustpilotReminderEmail({
          email: ownerProfile.email,
          caretakerName: ownerProfile.full_name,
          memorialId: memorial.id,
          memorialName: memorial.full_name,
          reviewUrl: trackingUrl,
        })

        if (sent) {
          remindersSent++
          await db
            .from("memorials")
            .update({
              review_reminder_sent_at: now.toISOString(),
              updated_at: now.toISOString(),
            })
            .eq("id", memorial.id)
        }
      }
    }

    return NextResponse.json({
      success: true,
      invitesSent,
      remindersSent,
    })
  } catch (err) {
    console.error("[trustpilot cron fatal]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
