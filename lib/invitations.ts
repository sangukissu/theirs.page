import crypto from "crypto"
import { getRequiredSecret } from "@/lib/security/secrets"

function getInviteSecret(): string {
  return getRequiredSecret(
    ["INVITATION_SIGNING_SECRET", "SUPABASE_SECRET_KEY"],
    "Invitation signing"
  )
}

export interface InvitationPayload {
  collaboratorId: string
  memorialId: string
  email: string
  role: "co_admin" | "contributor"
  exp: number // Unix timestamp ms
}

/**
 * Creates an HMAC-SHA256 signed invitation token (valid for 14 days)
 */
export function createInvitationToken(data: {
  collaboratorId: string
  memorialId: string
  email: string
  role: "co_admin" | "contributor"
}): string {
  const payload: InvitationPayload = {
    ...data,
    exp: Date.now() + 14 * 24 * 60 * 60 * 1000, // 14 days
  }

  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url")
  const signature = crypto
    .createHmac("sha256", getInviteSecret())
    .update(encodedPayload)
    .digest("base64url")

  return `${encodedPayload}.${signature}`
}

/**
 * Verifies and decodes an invitation token
 */
export function verifyInvitationToken(token: string): {
  valid: boolean
  payload?: InvitationPayload
  error?: string
} {
  if (!token || typeof token !== "string" || !token.includes(".")) {
    return { valid: false, error: "Malformed invitation token" }
  }

  const [encodedPayload, receivedSignature] = token.split(".")
  if (!encodedPayload || !receivedSignature) {
    return { valid: false, error: "Invalid token structure" }
  }

  const expectedSignature = crypto
    .createHmac("sha256", getInviteSecret())
    .update(encodedPayload)
    .digest("base64url")

  if (
    receivedSignature.length !== expectedSignature.length ||
    !crypto.timingSafeEqual(Buffer.from(receivedSignature), Buffer.from(expectedSignature))
  ) {
    return { valid: false, error: "Invalid signature" }
  }

  try {
    const jsonStr = Buffer.from(encodedPayload, "base64url").toString("utf8")
    const payload = JSON.parse(jsonStr) as InvitationPayload

    if (Date.now() > payload.exp) {
      return { valid: false, error: "Invitation has expired" }
    }

    return { valid: true, payload }
  } catch {
    return { valid: false, error: "Failed to parse token payload" }
  }
}
