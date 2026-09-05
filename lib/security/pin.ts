import crypto from "crypto"
import { getRequiredSecret } from "@/lib/security/secrets"

const PIN_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000

function getPinHashSecret(): string {
  return getRequiredSecret(
    ["PIN_HASH_SECRET", "SUPABASE_SECRET_KEY"],
    "Memorial PIN hashing"
  )
}

function getPinSigningSecret(): string {
  return getRequiredSecret(
    ["PIN_SIGNING_SECRET", "SUPABASE_SECRET_KEY"],
    "Memorial PIN access signing"
  )
}

/**
 * Generates a secure HMAC-SHA256 hash for a memorial access PIN
 */
export function hashPin(pin: string): string {
  const trimmed = pin.trim()
  return crypto
    .createHmac("sha256", getPinHashSecret())
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

  // One-time compatibility for old rows. The verification route immediately
  // replaces a matching plaintext value with a keyed hash.
  if (isLegacyPlaintextPin(trimmedStored)) {
    const pinBytes = Buffer.from(trimmedPin)
    const storedBytes = Buffer.from(trimmedStored)
    if (
      pinBytes.length === storedBytes.length &&
      crypto.timingSafeEqual(pinBytes, storedBytes)
    ) return true
  }

  return false
}

export function isLegacyPlaintextPin(value: string): boolean {
  return !/^[a-f0-9]{64}$/i.test(value.trim())
}

export function getMemorialPinCookieName(slugOrId: string): string {
  const safeId = slugOrId.toLowerCase().replace(/[^a-z0-9_-]/g, "_")
  return `theirs_pin_${safeId}`
}

interface PinAccessPayload {
  memorialId: string
  pinVersion: string
  exp: number
}

function getPinVersion(accessPinHash: string): string {
  return crypto.createHash("sha256").update(accessPinHash).digest("base64url").slice(0, 16)
}

export function createPinAccessToken(memorialId: string, accessPinHash: string): string {
  if (!memorialId || !accessPinHash) throw new Error("Cannot grant PIN access without a memorial and PIN")

  const payload: PinAccessPayload = {
    memorialId,
    pinVersion: getPinVersion(accessPinHash),
    exp: Date.now() + PIN_TOKEN_TTL_MS,
  }
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url")
  const signature = crypto
    .createHmac("sha256", getPinSigningSecret())
    .update(encoded)
    .digest("base64url")
  return `${encoded}.${signature}`
}

export function verifyPinAccessToken(
  token: string | null | undefined,
  memorialId: string,
  accessPinHash: string | null | undefined
): boolean {
  if (!token || !memorialId || !accessPinHash) return false
  const parts = token.split(".")
  if (parts.length !== 2) return false
  const [encoded, receivedSignature] = parts

  try {
    const expectedSignature = crypto
      .createHmac("sha256", getPinSigningSecret())
      .update(encoded)
      .digest("base64url")
    const received = Buffer.from(receivedSignature)
    const expected = Buffer.from(expectedSignature)
    if (received.length !== expected.length || !crypto.timingSafeEqual(received, expected)) {
      return false
    }

    const payload = JSON.parse(
      Buffer.from(encoded, "base64url").toString("utf8")
    ) as Partial<PinAccessPayload>
    return (
      payload.memorialId === memorialId &&
      payload.pinVersion === getPinVersion(accessPinHash) &&
      typeof payload.exp === "number" &&
      payload.exp > Date.now()
    )
  } catch {
    return false
  }
}
