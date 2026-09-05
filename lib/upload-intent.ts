import "server-only"

import crypto from "crypto"
import type { SafetyScreeningResult } from "@/lib/safety/moderation"
import { getRequiredSecret } from "@/lib/security/secrets"

const TOKEN_VERSION = 1
const UPLOAD_INTENT_MAX_AGE_MS = 10 * 60 * 1000
const MEDIA_REFERENCE_MAX_AGE_MS = 24 * 60 * 60 * 1000

function getSigningSecret(): string {
  return getRequiredSecret(
    ["CONTRIBUTION_SIGNING_SECRET", "SUPABASE_SECRET_KEY"],
    "Contribution token signing"
  )
}

export interface UploadIntentPayload {
  v: 1
  memorialId: string
  allowedMime: string
  maxBytes: number
  contributionType: "photo" | "memory"
  clientBinding: string
  nonce: string
  exp: number
}

export interface UploadedMediaReferencePayload {
  v: 1
  memorialId: string
  originalKey: string
  displayKey: string
  detectedMime: string
  mediaType: "image"
  contributionType: "photo" | "memory"
  intentNonce: string
  safety: SafetyScreeningResult
  exp: number
}

export const ALLOWED_GUEST_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
])

export const MAX_GUEST_UPLOAD_BYTES = 15 * 1024 * 1024

export function getUploadClientBinding(clientIp: string): string {
  return crypto
    .createHmac("sha256", getSigningSecret())
    .update(`upload-client:${clientIp}`)
    .digest("base64url")
}

function signPayload(payload: object): string {
  const encoded = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url")
  const signature = crypto
    .createHmac("sha256", getSigningSecret())
    .update(encoded)
    .digest("base64url")
  return `${encoded}.${signature}`
}

function verifyAndDecode(token: string): Record<string, unknown> | null {
  if (!token || typeof token !== "string" || token.length > 16_384) return null
  const parts = token.split(".")
  if (parts.length !== 2) return null
  const [encoded, receivedSignature] = parts

  try {
    const expectedSignature = crypto
      .createHmac("sha256", getSigningSecret())
      .update(encoded)
      .digest("base64url")
    const received = Buffer.from(receivedSignature)
    const expected = Buffer.from(expectedSignature)
    if (received.length !== expected.length || !crypto.timingSafeEqual(received, expected)) {
      return null
    }

    const parsed = JSON.parse(
      Buffer.from(encoded, "base64url").toString("utf8")
    ) as Record<string, unknown>
    return parsed && typeof parsed === "object" ? parsed : null
  } catch {
    return null
  }
}

export function signUploadIntent(
  data: Omit<UploadIntentPayload, "v" | "exp">
): string {
  return signPayload({
    ...data,
    v: TOKEN_VERSION,
    exp: Date.now() + UPLOAD_INTENT_MAX_AGE_MS,
  } satisfies UploadIntentPayload)
}

export function verifyUploadIntent(token: string): UploadIntentPayload | null {
  const payload = verifyAndDecode(token)
  if (!payload) return null

  const now = Date.now()
  if (
    payload.v !== TOKEN_VERSION ||
    typeof payload.memorialId !== "string" ||
    typeof payload.allowedMime !== "string" ||
    payload.allowedMime !== "image/*" ||
    typeof payload.maxBytes !== "number" ||
    payload.maxBytes < 1 ||
    payload.maxBytes > MAX_GUEST_UPLOAD_BYTES ||
    !["photo", "memory"].includes(String(payload.contributionType)) ||
    typeof payload.clientBinding !== "string" ||
    !/^[A-Za-z0-9_-]{43}$/.test(payload.clientBinding) ||
    typeof payload.nonce !== "string" ||
    !/^[a-f0-9]{32}$/i.test(payload.nonce) ||
    typeof payload.exp !== "number" ||
    payload.exp <= now ||
    payload.exp > now + UPLOAD_INTENT_MAX_AGE_MS + 60_000
  ) return null

  return payload as unknown as UploadIntentPayload
}

export function signUploadedMediaReference(
  data: Omit<UploadedMediaReferencePayload, "v" | "exp">
): string {
  return signPayload({
    ...data,
    v: TOKEN_VERSION,
    exp: Date.now() + MEDIA_REFERENCE_MAX_AGE_MS,
  } satisfies UploadedMediaReferencePayload)
}

export function verifyUploadedMediaReference(
  token: string
): UploadedMediaReferencePayload | null {
  const payload = verifyAndDecode(token)
  if (!payload) return null

  const now = Date.now()
  if (
    payload.v !== TOKEN_VERSION ||
    typeof payload.memorialId !== "string" ||
    typeof payload.originalKey !== "string" ||
    typeof payload.displayKey !== "string" ||
    typeof payload.detectedMime !== "string" ||
    !ALLOWED_GUEST_MIME_TYPES.has(payload.detectedMime) ||
    payload.mediaType !== "image" ||
    !["photo", "memory"].includes(String(payload.contributionType)) ||
    typeof payload.intentNonce !== "string" ||
    !/^[a-f0-9]{32}$/i.test(payload.intentNonce) ||
    !payload.safety ||
    typeof payload.safety !== "object" ||
    typeof payload.exp !== "number" ||
    payload.exp <= now ||
    payload.exp > now + MEDIA_REFERENCE_MAX_AGE_MS + 60_000
  ) return null

  const expectedOriginalPrefix = `contribution-staging/${payload.memorialId}/${payload.intentNonce}/original/`
  const expectedDisplayPrefix = `contribution-staging/${payload.memorialId}/${payload.intentNonce}/display/`
  if (
    !payload.originalKey.startsWith(expectedOriginalPrefix) ||
    !payload.displayKey.startsWith(expectedDisplayPrefix) ||
    payload.originalKey.includes("..") ||
    payload.displayKey.includes("..")
  ) return null

  return payload as unknown as UploadedMediaReferencePayload
}
