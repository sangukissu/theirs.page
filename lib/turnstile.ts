/**
 * lib/turnstile.ts — Cloudflare Turnstile Verification & Contribution Rate Limiting
 */

export async function verifyTurnstileToken(
  token?: string | null,
  clientIp?: string | null
): Promise<boolean> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY

  // If Turnstile is not configured in the environment, bypass check gracefully (e.g. local dev)
  if (!secretKey) {
    return true
  }

  // If configured, token must be provided
  if (!token || typeof token !== "string" || !token.trim()) {
    return false
  }

  try {
    const formData = new URLSearchParams({
      secret: secretKey,
      response: token.trim(),
    })

    if (clientIp) {
      formData.set("remoteip", clientIp)
    }

    const res = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        body: formData,
        signal: AbortSignal.timeout(8000),
      }
    )

    if (!res.ok) {
      console.error("Turnstile API error response:", res.status)
      return false
    }

    const data = (await res.json()) as { success?: boolean }
    return Boolean(data.success)
  } catch (err) {
    console.error("Turnstile verification network error:", err)
    // On unexpected timeout or failure, allow if not strictly broken
    return false
  }
}

// In-memory rate limiting for contributions (10 contributions per 10 minutes per IP)
interface ContributionRecord {
  count: number
  resetAt: number
}

const contributionTracker = new Map<string, ContributionRecord>()

export function checkContributionRateLimit(ip: string): { allowed: boolean; remainingSeconds?: number } {
  const now = Date.now()
  const record = contributionTracker.get(ip)

  if (!record || record.resetAt <= now) {
    contributionTracker.set(ip, {
      count: 1,
      resetAt: now + 10 * 60 * 1000, // 10 minutes
    })
    return { allowed: true }
  }

  if (record.count >= 10) {
    return {
      allowed: false,
      remainingSeconds: Math.ceil((record.resetAt - now) / 1000),
    }
  }

  record.count += 1
  return { allowed: true }
}
