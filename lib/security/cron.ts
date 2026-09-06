import "server-only"

import crypto from "crypto"

export function isAuthorizedCronRequest(request: Request): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return false

  const authorization = request.headers.get("authorization") || ""
  const candidate = authorization.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length)
    : request.headers.get("x-cron-secret") || ""
  const expected = Buffer.from(secret)
  const received = Buffer.from(candidate)
  return received.length === expected.length && crypto.timingSafeEqual(received, expected)
}
