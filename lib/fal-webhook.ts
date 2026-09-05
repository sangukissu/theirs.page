import "server-only"

import crypto from "crypto"
import sodium from "libsodium-wrappers"

const FAL_JWKS_URL = "https://rest.fal.ai/.well-known/jwks.json"
const JWKS_CACHE_MS = 12 * 60 * 60 * 1000
const MAX_CLOCK_SKEW_SECONDS = 5 * 60

interface FalJwk {
  x?: string
}

let jwksCache: { keys: FalJwk[]; expiresAt: number } | null = null

async function getFalPublicKeys(): Promise<FalJwk[]> {
  if (jwksCache && jwksCache.expiresAt > Date.now()) return jwksCache.keys

  const response = await fetch(FAL_JWKS_URL, {
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  })
  if (!response.ok) throw new Error(`FAL JWKS request failed (${response.status})`)
  const data = await response.json() as { keys?: unknown }
  const keys = Array.isArray(data.keys)
    ? data.keys.filter((key): key is FalJwk => Boolean(key && typeof key === "object"))
    : []
  if (keys.length === 0) throw new Error("FAL JWKS contained no public keys")

  jwksCache = { keys, expiresAt: Date.now() + JWKS_CACHE_MS }
  return keys
}

export async function verifyFalWebhook(
  request: Request,
  rawBody: Buffer
): Promise<{ valid: boolean; requestId?: string }> {
  const requestId = request.headers.get("x-fal-webhook-request-id")
  const userId = request.headers.get("x-fal-webhook-user-id")
  const timestamp = request.headers.get("x-fal-webhook-timestamp")
  const signatureHex = request.headers.get("x-fal-webhook-signature")

  if (
    !requestId || requestId.length > 200 ||
    !userId || userId.length > 200 ||
    !timestamp || !/^\d{10}$/.test(timestamp) ||
    !signatureHex || !/^[a-f0-9]{128}$/i.test(signatureHex)
  ) return { valid: false }

  const timestampSeconds = Number(timestamp)
  if (
    !Number.isSafeInteger(timestampSeconds) ||
    Math.abs(Math.floor(Date.now() / 1000) - timestampSeconds) > MAX_CLOCK_SKEW_SECONDS
  ) return { valid: false }

  try {
    const bodyHash = crypto.createHash("sha256").update(rawBody).digest("hex")
    const message = Buffer.from(
      [requestId, userId, timestamp, bodyHash].join("\n"),
      "utf8"
    )
    const signature = Buffer.from(signatureHex, "hex")
    const publicKeys = await getFalPublicKeys()
    await sodium.ready

    const valid = publicKeys.some((key) => {
      if (typeof key.x !== "string" || !/^[A-Za-z0-9_-]{43}$/.test(key.x)) return false
      try {
        return sodium.crypto_sign_verify_detached(
          signature,
          message,
          Buffer.from(key.x, "base64url")
        )
      } catch {
        return false
      }
    })
    return { valid, requestId: valid ? requestId : undefined }
  } catch (error) {
    console.error("FAL webhook verification failed:", error)
    return { valid: false }
  }
}
