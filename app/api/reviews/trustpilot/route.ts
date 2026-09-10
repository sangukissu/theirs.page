import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdminSafe } from "@/utils/supabase/admin"
import { getTheirsAppUrl } from "@/lib/email/caretaker-notifications"
import { getTrustpilotReviewUrl, verifyReviewToken } from "@/lib/reviews/trustpilot"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const memorialId = searchParams.get("id") || ""
  const token = searchParams.get("token") || ""

  const destination = getTrustpilotReviewUrl() || getTheirsAppUrl()

  if (!memorialId || !token || !verifyReviewToken(memorialId, token)) {
    return NextResponse.redirect(destination, 302)
  }

  // Record review_invite_clicked_at if not already recorded
  const db = getSupabaseAdminSafe()
  if (db) {
    try {
      await db
        .from("memorials")
        .update({
          review_invite_clicked_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", memorialId)
        .is("review_invite_clicked_at", null)
    } catch (err) {
      console.warn("[trustpilot-redirect click update failed]", err)
    }
  }

  return NextResponse.redirect(destination, 302)
}
