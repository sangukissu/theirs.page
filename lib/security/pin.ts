import crypto from "crypto"

const PIN_SALT = process.env.SUPABASE_SECRET_KEY || "theirs-pin-security-salt"

/**
 * Generates a secure HMAC-SHA256 hash for a memorial access PIN
 */
export function hashPin(pin: string): string {
  const trimmed = pin.trim()
  return crypto
    .createHmac("sha256", PIN_SALT)
    .update(`theirs_pin_${trimmed}`)
    .digest("hex")
}

/**
 * Verifies an entered PIN against stored hash (with legacy plaintext fallback)
 */
export function verifyPin(pin: string, storedHashOrPlain: string): boolean {
  if (!pin || !storedHashOrPlain) return false
  const trimmedPin = pin.trim()
  const trimmedStored = storedHashOrPlain.trim()

  // 1. Verify against modern HMAC-SHA256 hash
  const computedHash = hashPin(trimmedPin)
  if (computedHash.length === trimmedStored.length) {
    try {
      if (crypto.timingSafeEqual(Buffer.from(computedHash), Buffer.from(trimmedStored))) {
        return true
      }
    } catch {
      // Fall through if length mismatch
    }
  }

  // 2. Backward compatibility: if existing record had plaintext PIN
  if (trimmedPin === trimmedStored) {
    return true
  }

  return false
}

import { getSupabaseAdminSafe } from "@/utils/supabase/admin"

// In-memory fallback sliding window rate-limiter for PIN attempts
interface AttemptRecord {
  attempts: number
  lockedUntil: number
}

const memoryPinAttempts = new Map<string, AttemptRecord>()
const PIN_LOCK_WINDOW_SECONDS = 15 * 60 // 15 minutes
const MAX_PIN_ATTEMPTS = 5

/**
 * Check if the current IP/memorial is locked due to excessive failed attempts
 */
export async function checkPinRateLimit(key: string): Promise<{ allowed: boolean; remainingSeconds?: number }> {
  const admin = getSupabaseAdminSafe()

  if (!admin) {
    const now = Date.now()
    const record = memoryPinAttempts.get(key)
    if (!record) return { allowed: true }

    if (record.lockedUntil > now) {
      return {
        allowed: false,
        remainingSeconds: Math.ceil((record.lockedUntil - now) / 1000),
      }
    }
    return { allowed: true }
  }

  try {
    const windowStart = new Date(Date.now() - PIN_LOCK_WINDOW_SECONDS * 1000).toISOString()
    const { data, count, error } = await admin
      .from("rate_limit_events")
      .select("created_at", { count: "exact" })
      .eq("action", "pin_attempt")
      .eq("identifier", key)
      .gte("created_at", windowStart)
      .order("created_at", { ascending: true })

    if (error) {
      console.error("Durable PIN rate limit check error:", error.message)
      return { allowed: true }
    }

    const total = typeof count === "number" ? count : data?.length || 0

    if (total >= MAX_PIN_ATTEMPTS) {
      const oldestIso = data && data[0]?.created_at
      const oldestMs = oldestIso ? new Date(oldestIso).getTime() : Date.now() - PIN_LOCK_WINDOW_SECONDS * 1000
      const expiresAt = oldestMs + PIN_LOCK_WINDOW_SECONDS * 1000
      const remainingSeconds = Math.max(1, Math.ceil((expiresAt - Date.now()) / 1000))

      return { allowed: false, remainingSeconds }
    }

    return { allowed: true }
  } catch (err) {
    console.error("Durable PIN rate limit exception:", err)
    return { allowed: true }
  }
}

/**
 * Record a failed attempt. Locks for 15 minutes after 5 failures.
 */
export async function recordFailedPinAttempt(key: string): Promise<{ locked: boolean; attemptsLeft: number }> {
  const admin = getSupabaseAdminSafe()

  // Always update memory fallback
  const now = Date.now()
  const memRecord = memoryPinAttempts.get(key) || { attempts: 0, lockedUntil: 0 }
  if (memRecord.lockedUntil > 0 && memRecord.lockedUntil <= now) {
    memRecord.attempts = 0
    memRecord.lockedUntil = 0
  }
  memRecord.attempts += 1
  if (memRecord.attempts >= MAX_PIN_ATTEMPTS) {
    memRecord.lockedUntil = now + PIN_LOCK_WINDOW_SECONDS * 1000
  }
  memoryPinAttempts.set(key, memRecord)

  if (!admin) {
    const locked = memRecord.attempts >= MAX_PIN_ATTEMPTS
    return { locked, attemptsLeft: Math.max(0, MAX_PIN_ATTEMPTS - memRecord.attempts) }
  }

  try {
    // Insert failed attempt event
    await admin.from("rate_limit_events").insert({
      action: "pin_attempt",
      identifier: key,
    })

    const windowStart = new Date(Date.now() - PIN_LOCK_WINDOW_SECONDS * 1000).toISOString()
    const { count, error } = await admin
      .from("rate_limit_events")
      .select("id", { count: "exact", head: true })
      .eq("action", "pin_attempt")
      .eq("identifier", key)
      .gte("created_at", windowStart)

    const total = error || typeof count !== "number" ? memRecord.attempts : count
    const locked = total >= MAX_PIN_ATTEMPTS

    return { locked, attemptsLeft: Math.max(0, MAX_PIN_ATTEMPTS - total) }
  } catch (err) {
    console.error("Durable PIN recording exception:", err)
    const locked = memRecord.attempts >= MAX_PIN_ATTEMPTS
    return { locked, attemptsLeft: Math.max(0, MAX_PIN_ATTEMPTS - memRecord.attempts) }
  }
}

/**
 * Reset failed attempts upon successful PIN entry
 */
export async function clearPinAttempts(key: string): Promise<void> {
  memoryPinAttempts.delete(key)

  const admin = getSupabaseAdminSafe()
  if (!admin) return

  try {
    await admin
      .from("rate_limit_events")
      .delete()
      .eq("action", "pin_attempt")
      .eq("identifier", key)
  } catch (err) {
    console.error("Failed to clear durable PIN attempts:", err)
  }
}

