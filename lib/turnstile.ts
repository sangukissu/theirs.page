/**
 * lib/turnstile.ts — Cloudflare Turnstile Verification & Durable Rate Limiting
 */

import { getSupabaseAdminSafe } from "@/utils/supabase/admin"

export async function verifyTurnstileToken(
  token?: string | null,
  clientIp?: string | null
): Promise<boolean> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY

  // In production, Turnstile must FAIL CLOSED if key is unconfigured
  if (!secretKey) {
    if (process.env.NODE_ENV === "production") {
      console.error("SECURITY ALERT: TURNSTILE_SECRET_KEY is missing in production. Failing closed.")
      return false
    }
    // Allow local development without Turnstile key
    return true
  }

  // Token must be provided
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
    return false
  }
}

// In-memory fallback tracking in case DB is momentarily unreachable
interface MemoryRecord {
  count: number
  resetAt: number
}
const memoryTracker = new Map<string, MemoryRecord>()

function checkMemoryRateLimit(
  key: string,
  maxAttempts: number,
  windowSeconds: number
): { allowed: boolean; remainingSeconds?: number } {
  const now = Date.now()
  const record = memoryTracker.get(key)

  if (!record || record.resetAt <= now) {
    memoryTracker.set(key, {
      count: 1,
      resetAt: now + windowSeconds * 1000,
    })
    return { allowed: true }
  }

  if (record.count >= maxAttempts) {
    return {
      allowed: false,
      remainingSeconds: Math.max(1, Math.ceil((record.resetAt - now) / 1000)),
    }
  }

  record.count += 1
  return { allowed: true }
}

/**
 * Durable edge rate limiter backed by Postgres public.rate_limit_events
 */
export async function checkDurableRateLimit(
  action: string,
  identifier: string,
  maxAttempts: number,
  windowSeconds: number
): Promise<{ allowed: boolean; remainingSeconds?: number }> {
  const admin = getSupabaseAdminSafe()
  const compositeKey = `${action}:${identifier}`

  if (!admin) {
    return checkMemoryRateLimit(compositeKey, maxAttempts, windowSeconds)
  }

  try {
    const windowStart = new Date(Date.now() - windowSeconds * 1000).toISOString()

    const { data, count, error } = await admin
      .from("rate_limit_events")
      .select("created_at", { count: "exact" })
      .eq("action", action)
      .eq("identifier", identifier)
      .gte("created_at", windowStart)
      .order("created_at", { ascending: true })

    if (error) {
      console.error("Durable rate limit lookup failed, falling back to memory:", error.message)
      return checkMemoryRateLimit(compositeKey, maxAttempts, windowSeconds)
    }

    const total = typeof count === "number" ? count : data?.length || 0

    if (total >= maxAttempts) {
      const oldestIso = data && data[0]?.created_at
      const oldestMs = oldestIso ? new Date(oldestIso).getTime() : Date.now() - windowSeconds * 1000
      const expiresAt = oldestMs + windowSeconds * 1000
      const remainingSeconds = Math.max(1, Math.ceil((expiresAt - Date.now()) / 1000))

      return { allowed: false, remainingSeconds }
    }

    // Record the current event
    await admin.from("rate_limit_events").insert({
      action,
      identifier,
    })

    return { allowed: true }
  } catch (err: any) {
    console.error("Rate limiting exception, falling back to memory:", err)
    return checkMemoryRateLimit(compositeKey, maxAttempts, windowSeconds)
  }
}

/**
 * IP rate limiter for public memorial contributions (10 per 10 minutes)
 */
export async function checkContributionRateLimit(
  ip: string
): Promise<{ allowed: boolean; remainingSeconds?: number }> {
  return checkDurableRateLimit("contribution", ip, 10, 600)
}
