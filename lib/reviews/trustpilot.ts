import crypto from "crypto"

/**
 * Trustpilot Configuration & Token Generator
 */

export function getTrustpilotReviewUrl(): string | null {
  const url = process.env.TRUSTPILOT_REVIEW_URL?.trim()
  return url && url.length > 0 ? url : null
}

function getAppUrl(): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL
  return configured?.replace(/\/$/, "") || "https://theirs.page"
}

function getReviewSigningSecret(): string {
  return (
    process.env.SUPABASE_SECRET_KEY ||
    process.env.CRON_SECRET ||
    "theirs_trustpilot_review_secret"
  )
}

export function generateReviewToken(memorialId: string): string {
  const secret = getReviewSigningSecret()
  return crypto
    .createHmac("sha256", secret)
    .update(`review-invite:${memorialId}`)
    .digest("hex")
    .slice(0, 32)
}

export function verifyReviewToken(memorialId: string, token: string): boolean {
  if (!memorialId || !token) return false
  const expected = generateReviewToken(memorialId)
  const expectedBuf = Buffer.from(expected)
  const candidateBuf = Buffer.from(token)
  return expectedBuf.length === candidateBuf.length && crypto.timingSafeEqual(expectedBuf, candidateBuf)
}

export function buildReviewTrackingUrl(memorialId: string): string {
  const token = generateReviewToken(memorialId)
  return `${getAppUrl()}/api/reviews/trustpilot?id=${encodeURIComponent(memorialId)}&token=${encodeURIComponent(token)}`
}
