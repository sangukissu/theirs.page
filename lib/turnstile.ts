/**
 * lib/turnstile.ts — Cloudflare Turnstile Verification & Durable Rate Limiting
 */

import { getSupabaseAdminSafe } from "@/utils/supabase/admin"
import crypto from "crypto"
import { getOptionalSecret, getRequiredSecret } from "@/lib/security/secrets"

export async function verifyTurnstileToken(
  token?: string | null,
  clientIp?: string | null,
  expectedAction?: string
): Promise<boolean> {
  if (!token || typeof token !== "string" || !token.trim() || token.length > 2048) {
    console.warn("Turnstile verification rejected: token missing or malformed")
    return false
  }

  const secretKey = getOptionalSecret(["TURNSTILE_SECRET_KEY"])
  if (!secretKey) {
    console.error("Turnstile verification rejected: TURNSTILE_SECRET_KEY is not configured")
    return false
  }

  try {
    const formData = new URLSearchParams({
      secret: secretKey,
      response: token.trim(),
      idempotency_key: crypto.randomUUID(),
    })
    if (clientIp) formData.set("remoteip", clientIp)

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

    const data = (await res.json()) as {
      success?: boolean
      action?: string
      hostname?: string
      "error-codes"?: string[]
    }

    if (!data.success) {
      console.warn("Turnstile verification failed:", data["error-codes"] || [])
      return false
    }

    if (expectedAction && data.action !== expectedAction) {
      console.warn("Turnstile verification rejected: action mismatch")
      return false
    }

    const expectedHostnames = (process.env.TURNSTILE_EXPECTED_HOSTNAMES || "")
      .split(",")
      .map((hostname) => hostname.trim().toLowerCase())
      .filter(Boolean)
    if (process.env.NODE_ENV === "production" && expectedHostnames.length === 0) {
      console.error("Turnstile verification rejected: TURNSTILE_EXPECTED_HOSTNAMES is not configured")
      return false
    }
    if (
      expectedHostnames.length > 0 &&
      (!data.hostname || !expectedHostnames.includes(data.hostname.toLowerCase()))
    ) {
      console.warn("Turnstile verification rejected: hostname mismatch")
      return false
    }

    return true
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
  const rateLimitSecret = getRequiredSecret(
    ["RATE_LIMIT_HASH_SECRET", "SUPABASE_SECRET_KEY"],
    "Rate-limit identifier hashing"
  )
  const protectedIdentifier = crypto
    .createHmac("sha256", rateLimitSecret)
    .update(identifier)
    .digest("base64url")
  const compositeKey = `${action}:${protectedIdentifier}`

  if (!admin) {
    return checkMemoryRateLimit(compositeKey, maxAttempts, windowSeconds)
  }

  try {
    const { data, error } = await admin.rpc("consume_rate_limit", {
      p_action: action,
      p_identifier: protectedIdentifier,
      p_max_attempts: maxAttempts,
      p_window_seconds: windowSeconds,
    })

    if (error || !data) {
      console.error("Durable rate limit RPC failed, falling back to memory:", error?.message)
      return checkMemoryRateLimit(compositeKey, maxAttempts, windowSeconds)
    }

    const result = Array.isArray(data) ? data[0] : data
    return {
      allowed: Boolean(result?.allowed),
      remainingSeconds:
        typeof result?.remaining_seconds === "number"
          ? result.remaining_seconds
          : undefined,
    }
  } catch (err: any) {
    console.error("Rate limiting exception, falling back to memory:", err)
    return checkMemoryRateLimit(compositeKey, maxAttempts, windowSeconds)
  }
}

export async function clearDurableRateLimit(
  action: string,
  identifier: string
): Promise<void> {
  const rateLimitSecret = getRequiredSecret(
    ["RATE_LIMIT_HASH_SECRET", "SUPABASE_SECRET_KEY"],
    "Rate-limit identifier hashing"
  )
  const protectedIdentifier = crypto
    .createHmac("sha256", rateLimitSecret)
    .update(identifier)
    .digest("base64url")
  memoryTracker.delete(`${action}:${protectedIdentifier}`)

  const admin = getSupabaseAdminSafe()
  if (!admin) return
  const { error } = await admin.from("rate_limit_events")
    .delete()
    .eq("action", action)
    .eq("identifier", protectedIdentifier)
  if (error) console.error("Failed to clear rate limit:", error.message)
}

/**
 * IP rate limiter for public memorial contributions (10 per 10 minutes)
 */
export async function checkContributionRateLimit(
  ip: string,
  memorialScope = "global"
): Promise<{ allowed: boolean; remainingSeconds?: number }> {
  return checkDurableRateLimit("contribution", `${ip}:${memorialScope}`, 10, 600)
}
