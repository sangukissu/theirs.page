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

// In-memory sliding window rate-limiter for PIN attempts
interface AttemptRecord {
  attempts: number
  lockedUntil: number
}

const pinAttempts = new Map<string, AttemptRecord>()

/**
 * Check if the current IP/memorial is locked due to excessive failed attempts
 */
export function checkPinRateLimit(key: string): { allowed: boolean; remainingSeconds?: number } {
  const now = Date.now()
  const record = pinAttempts.get(key)
  if (!record) return { allowed: true }

  if (record.lockedUntil > now) {
    return {
      allowed: false,
      remainingSeconds: Math.ceil((record.lockedUntil - now) / 1000),
    }
  }

  return { allowed: true }
}

/**
 * Record a failed attempt. Locks for 15 minutes after 5 failures.
 */
export function recordFailedPinAttempt(key: string): { locked: boolean; attemptsLeft: number } {
  const now = Date.now()
  const record = pinAttempts.get(key) || { attempts: 0, lockedUntil: 0 }

  if (record.lockedUntil > 0 && record.lockedUntil <= now) {
    record.attempts = 0
    record.lockedUntil = 0
  }

  record.attempts += 1

  if (record.attempts >= 5) {
    record.lockedUntil = now + 15 * 60 * 1000 // 15-minute lock
    pinAttempts.set(key, record)
    return { locked: true, attemptsLeft: 0 }
  }

  pinAttempts.set(key, record)
  return { locked: false, attemptsLeft: Math.max(0, 5 - record.attempts) }
}

/**
 * Reset failed attempts upon successful PIN entry
 */
export function clearPinAttempts(key: string): void {
  pinAttempts.delete(key)
}
