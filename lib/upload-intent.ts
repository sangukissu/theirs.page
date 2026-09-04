import crypto from "crypto"

const INTENT_SECRET = process.env.SUPABASE_SECRET_KEY || "theirs-upload-intent-secret"

export interface UploadIntentPayload {
  memorialId: string
  allowedMime: string
  maxBytes: number
  nonce: string
  exp: number
}

export const ALLOWED_GUEST_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
  "audio/mpeg",
  "audio/wav",
  "audio/m4a",
  "audio/ogg",
  "audio/aac",
  "audio/flac",
])

export const MAX_GUEST_UPLOAD_BYTES = 15 * 1024 * 1024 // 15MB

/**
 * Creates an HMAC-SHA256 signed upload intent token valid for 10 minutes
 */
export function signUploadIntent(payload: UploadIntentPayload): string {
  const jsonStr = JSON.stringify(payload)
  const b64 = Buffer.from(jsonStr, "utf8").toString("base64url")
  const sig = crypto.createHmac("sha256", INTENT_SECRET).update(b64).digest("hex")
  return `${b64}.${sig}`
}

/**
 * Verifies and decodes an HMAC-SHA256 signed upload intent token
 */
export function verifyUploadIntent(token: string): UploadIntentPayload | null {
  if (!token || typeof token !== "string") return null
  const parts = token.split(".")
  if (parts.length !== 2) return null

  const [b64, sig] = parts
  const expectedSig = crypto.createHmac("sha256", INTENT_SECRET).update(b64).digest("hex")

  if (sig.length !== expectedSig.length) return null

  try {
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))) {
      return null
    }
  } catch {
    return null
  }

  try {
    const jsonStr = Buffer.from(b64, "base64url").toString("utf8")
    const payload = JSON.parse(jsonStr) as UploadIntentPayload

    if (!payload.exp || payload.exp < Date.now()) {
      return null
    }

    if (!payload.memorialId || !payload.allowedMime || !payload.maxBytes) {
      return null
    }

    return payload
  } catch {
    return null
  }
}
