import type { ContributionSettings, MediaType } from "@/types/theirs"
import type { MemorialAccessRole } from "@/lib/memorial-auth"
import { AUTHENTICATED_MEDIA_LIMITS, FREE_PHOTO_LIMIT, GUEST_AUDIO_LIMIT_BYTES } from "./constants"

export type MediaContext = "studio" | "member_contribution" | "guest_contribution"
export type UploadPurpose = "studio_gallery" | "member_contribution"

export interface MediaCapabilities {
  nativePhoto: boolean
  nativeAudio: boolean
  nativeVideo: boolean
  youtubeVideo: boolean
  resumableUpload: boolean
  requiresModeration: boolean
  maxImageBytes: number
  maxAudioBytes: number
  maxVideoBytes: number | null
  existingImageCount: number | null
  maxImageItems: number | null
  remainingImageItems: number | null
  imageQuotaKnown: boolean
  imageQuotaReached: boolean
}

export interface MediaCountState {
  image: number | null
  audio?: number | null
  video?: number | null
}

interface CapabilityInput {
  context: MediaContext
  isPaid: boolean
  accessRole?: MemorialAccessRole | null
  contributionSettings?: ContributionSettings | null
  existingMediaCounts: MediaCountState
}

export function resolveMediaCapabilities(input: CapabilityInput): MediaCapabilities {
  const settings = input.contributionSettings || {}
  const contributionsOpen = settings.accept_contributions !== false
  const acceptedMember = Boolean(input.accessRole)
  const studioAdmin = input.accessRole === "owner" || input.accessRole === "co_admin"
  const existingImageCount = Number.isSafeInteger(input.existingMediaCounts.image) &&
    Number(input.existingMediaCounts.image) >= 0
    ? Number(input.existingMediaCounts.image)
    : null
  const maxImageItems = input.isPaid ? null : FREE_PHOTO_LIMIT
  const imageQuotaKnown = input.isPaid || existingImageCount !== null
  const remainingImageItems = maxImageItems === null
    ? null
    : existingImageCount === null
      ? null
      : Math.max(0, maxImageItems - existingImageCount)
  const imageQuotaReached = maxImageItems !== null && remainingImageItems === 0
  const photoEntitled = maxImageItems === null || (remainingImageItems !== null && remainingImageItems > 0)
  const quota = {
    existingImageCount,
    maxImageItems,
    remainingImageItems,
    imageQuotaKnown,
    imageQuotaReached,
  }

  if (input.context === "studio") {
    return {
      nativePhoto: studioAdmin && photoEntitled,
      nativeAudio: studioAdmin && input.isPaid,
      nativeVideo: studioAdmin && input.isPaid,
      youtubeVideo: studioAdmin,
      resumableUpload: studioAdmin,
      requiresModeration: false,
      maxImageBytes: AUTHENTICATED_MEDIA_LIMITS.image,
      maxAudioBytes: AUTHENTICATED_MEDIA_LIMITS.audio,
      maxVideoBytes: AUTHENTICATED_MEDIA_LIMITS.video,
      ...quota,
    }
  }

  if (input.context === "member_contribution") {
    return {
      nativePhoto: acceptedMember && contributionsOpen && settings.photos !== false && photoEntitled,
      nativeAudio: acceptedMember && contributionsOpen && input.isPaid && settings.voice === true,
      nativeVideo: acceptedMember && contributionsOpen && input.isPaid && settings.videos === true,
      youtubeVideo: acceptedMember && contributionsOpen && settings.videos !== false,
      resumableUpload: acceptedMember,
      requiresModeration: true,
      maxImageBytes: AUTHENTICATED_MEDIA_LIMITS.image,
      maxAudioBytes: AUTHENTICATED_MEDIA_LIMITS.audio,
      maxVideoBytes: AUTHENTICATED_MEDIA_LIMITS.video,
      ...quota,
    }
  }

  return {
    nativePhoto: contributionsOpen && settings.photos !== false && photoEntitled,
    nativeAudio: contributionsOpen && input.isPaid && settings.voice === true,
    nativeVideo: false,
    youtubeVideo: contributionsOpen && settings.videos !== false,
    resumableUpload: false,
    requiresModeration: true,
    maxImageBytes: AUTHENTICATED_MEDIA_LIMITS.image,
    maxAudioBytes: GUEST_AUDIO_LIMIT_BYTES,
    maxVideoBytes: null,
    ...quota,
  }
}

export function isMediaAllowed(capabilities: MediaCapabilities, mediaType: MediaType): boolean {
  if (mediaType === "image") return capabilities.nativePhoto
  if (mediaType === "audio") return capabilities.nativeAudio
  return capabilities.nativeVideo
}

export function mediaLimit(capabilities: MediaCapabilities, mediaType: MediaType): number | null {
  if (mediaType === "image") return capabilities.maxImageBytes
  if (mediaType === "audio") return capabilities.maxAudioBytes
  return capabilities.maxVideoBytes
}
