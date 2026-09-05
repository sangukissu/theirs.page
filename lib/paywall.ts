/**
 * lib/paywall.ts — Centralized Server-Side Paywall for Theirs (theirs.page)
 *
 * Tier Policies:
 * - Free: Up to 5 photos, life story biography, tributes, shared web address.
 * - Theirs Complete ($179 One-Time): Family photo albums, audio notes & video clips,
 *   Life Story timeline, private PIN protection, family caretakers & co-admins,
 *   and complete archive ZIP export.
 */

export type MemorialFeature =
  | "timeline"
  | "video_audio"
  | "private_mode"
  | "collaborators"
  | "export"
  | "media_upload"

export const FREE_PHOTO_LIMIT = 5

export interface FeatureAccessResult {
  allowed: boolean
  error?: string
  status?: number
}

/**
 * Validates feature access against memorial tier.
 */
export function canAccessFeature(
  memorial: { is_paid?: boolean | null },
  feature: MemorialFeature
): FeatureAccessResult {
  const isPaid = Boolean(memorial?.is_paid)

  // Paid / Complete memorials have access to all features
  if (isPaid) {
    return { allowed: true }
  }

  // Enforce tier restrictions for Free memorials
  switch (feature) {
    case "timeline":
      return {
        allowed: false,
        status: 402,
        error:
          "Life Story Timeline is a feature of Pro Plan ($179). Upgrade to document milestone life events.",
      }
    case "video_audio":
      return {
        allowed: false,
        status: 402,
        error:
          "Audio notes and video recordings are features of Pro Plan ($179). Free memorials support up to 5 photographs.",
      }
    case "private_mode":
      return {
        allowed: false,
        status: 402,
        error:
          "Private, PIN-protected memorials are a feature of Pro Plan ($179). Free memorials can be published publicly or unlisted.",
      }
    case "collaborators":
      return {
        allowed: false,
        status: 402,
        error:
          "Inviting family caretakers and co-admins is a feature of Pro Plan ($179).",
      }
    case "export":
      return {
        allowed: false,
        status: 402,
        error:
          "Full family archive export with original media binaries is a feature of Pro Plan ($179).",
      }
    case "media_upload":
      return { allowed: true }
    default:
      return { allowed: true }
  }
}

/**
 * Validates media upload quotas and allowed media types.
 */
export function assertMediaQuota(
  memorial: { is_paid?: boolean | null },
  currentPhotoCount: number,
  mediaType: "image" | "audio" | "video"
): FeatureAccessResult {
  const isPaid = Boolean(memorial?.is_paid)

  if (isPaid) {
    return { allowed: true }
  }

  // Free tier only permits photos (images)
  if (mediaType === "audio" || mediaType === "video") {
    return {
      allowed: false,
      status: 402,
      error:
        "Audio recordings and video clips require Pro Plan ($179). Upgrade to preserve voice notes and videos.",
    }
  }

  // Free tier photo quota: exactly 5 photos
  if (currentPhotoCount >= FREE_PHOTO_LIMIT) {
    return {
      allowed: false,
      status: 402,
      error: `Free memorials include up to ${FREE_PHOTO_LIMIT} photographs. Upgrade to Pro Plan ($179) for family photo albums and audio notes.`,
    }
  }

  return { allowed: true }
}
