import "server-only"

import crypto from "crypto"
import type { SafetyScreeningResult } from "@/lib/safety/moderation"
import { getRequiredSecret } from "@/lib/security/secrets"

const TOKEN_VERSION = 1
const UPLOAD_INTENT_MAX_AGE_MS = 10 * 60 * 1000
const MEDIA_REFERENCE_MAX_AGE_MS = 24 * 60 * 60 * 1000

function getSigningSecret(): string {
  return getRequiredSecret(
    ["CONTRIBUTION_SIGNING_SECRET"],
    "Contribution token signing"
  )
}

export interface UploadIntentPayload {
  v: 1
  memorialId: string
  allowedMime: string
  maxBytes: number
  contributionType: GuestContributionType
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
  mediaType: "image" | "audio" | "video"
  contributionType: GuestContributionType
  intentNonce: string
  safety: SafetyScreeningResult
  exp: number
}

export type GuestContributionType = "photo" | "memory" | "voice" | "video"

export const ALLOWED_GUEST_IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
])

export const ALLOWED_GUEST_AUDIO_MIME_TYPES = new Set([
  "audio/mpeg",
  "audio/wav",
  "audio/ogg",
  "audio/m4a",
])

export const ALLOWED_GUEST_VIDEO_MIME_TYPES = new Set([
  "video/mp4",
  "video/webm",
  "video/quicktime",
])

export const ALLOWED_GUEST_MIME_TYPES = new Set([
  ...ALLOWED_GUEST_IMAGE_MIME_TYPES,
  ...ALLOWED_GUEST_AUDIO_MIME_TYPES,
  ...ALLOWED_GUEST_VIDEO_MIME_TYPES,
])

export const MAX_GUEST_IMAGE_BYTES = 15 * 1024 * 1024
export const MAX_GUEST_AUDIO_BYTES = 25 * 1024 * 1024
export const MAX_GUEST_VIDEO_BYTES = 50 * 1024 * 1024
export const MAX_GUEST_UPLOAD_BYTES = MAX_GUEST_VIDEO_BYTES

export interface GuestMediaRule {
  allowedMime: "image/*" | "audio/*" | "video/*"
  allowedMimeTypes: Set<string>
  maxBytes: number
  mediaType: "image" | "audio" | "video"
  setting: "photos" | "memories" | "voice" | "videos"
  label: string
}

export function normalizeGuestMime(mime: string): string {
  const normalized = mime.toLowerCase().trim()
  if (normalized === "audio/mp4" || normalized === "audio/x-m4a") return "audio/m4a"
  if (normalized === "audio/x-wav") return "audio/wav"
  return normalized
}

export function getGuestMediaRule(type: GuestContributionType): GuestMediaRule {
  if (type === "voice") {
    return {
      allowedMime: "audio/*",
      allowedMimeTypes: ALLOWED_GUEST_AUDIO_MIME_TYPES,
      maxBytes: MAX_GUEST_AUDIO_BYTES,
      mediaType: "audio",
      setting: "voice",
      label: "voice recording",
    }
  }
  if (type === "video") {
    return {
      allowedMime: "video/*",
      allowedMimeTypes: ALLOWED_GUEST_VIDEO_MIME_TYPES,
      maxBytes: MAX_GUEST_VIDEO_BYTES,
      mediaType: "video",
      setting: "videos",
      label: "video clip",
    }
  }
  return {
    allowedMime: "image/*",
    allowedMimeTypes: ALLOWED_GUEST_IMAGE_MIME_TYPES,
    maxBytes: MAX_GUEST_IMAGE_BYTES,
    mediaType: "image",
    setting: type === "memory" ? "memories" : "photos",
    label: "photograph",
  }
}

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
  const contributionType = String(payload.contributionType) as GuestContributionType
  if (!["photo", "memory", "voice", "video"].includes(contributionType)) return null
  const rule = getGuestMediaRule(contributionType)
  if (
    payload.v !== TOKEN_VERSION ||
    typeof payload.memorialId !== "string" ||
    typeof payload.allowedMime !== "string" ||
    payload.allowedMime !== rule.allowedMime ||
    typeof payload.maxBytes !== "number" ||
    payload.maxBytes < 1 ||
    payload.maxBytes > rule.maxBytes ||
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
  const contributionType = String(payload.contributionType) as GuestContributionType
  if (!["photo", "memory", "voice", "video"].includes(contributionType)) return null
  const rule = getGuestMediaRule(contributionType)
  if (
    payload.v !== TOKEN_VERSION ||
    typeof payload.memorialId !== "string" ||
    typeof payload.originalKey !== "string" ||
    typeof payload.displayKey !== "string" ||
    typeof payload.detectedMime !== "string" ||
    !rule.allowedMimeTypes.has(payload.detectedMime) ||
    payload.mediaType !== rule.mediaType ||
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
