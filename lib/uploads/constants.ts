import type { MediaType } from "@/types/theirs"

export const MIB = 1024 * 1024
export const AUTHENTICATED_MEDIA_LIMITS = {
  image: 15 * MIB,
  audio: 50 * MIB,
  video: 100 * MIB,
} satisfies Record<MediaType, number>

export const GUEST_AUDIO_LIMIT_BYTES = 25 * MIB
export const MULTIPART_THRESHOLD_BYTES = 5 * MIB
export const MULTIPART_IMAGE_THRESHOLD_BYTES = 10 * MIB
export const MULTIPART_CHUNK_BYTES = 8 * MIB
export const UPLOAD_SESSION_TTL_MS = 6 * 60 * 60 * 1000
export const FREE_PHOTO_LIMIT = 5

export const MEDIA_MIME_TYPES = {
  image: new Set([
    "image/jpeg", "image/png", "image/webp", "image/gif", "image/heic", "image/heif",
  ]),
  audio: new Set([
    "audio/mpeg", "audio/wav", "audio/ogg", "audio/m4a", "audio/aac", "audio/flac", "audio/opus", "audio/mp4",
  ]),
  video: new Set([
    "video/mp4", "video/webm", "video/quicktime", "video/x-matroska", "video/ogg",
  ]),
} satisfies Record<MediaType, Set<string>>

const MIME_ALIASES: Record<string, string> = {
  "image/jpg": "image/jpeg",
  "image/pjpeg": "image/jpeg",
  "image/x-png": "image/png",
  "audio/mp3": "audio/mpeg",
  "audio/x-wav": "audio/wav",
  "audio/vnd.wave": "audio/wav",
  "audio/x-m4a": "audio/m4a",
  "audio/x-aac": "audio/aac",
  "audio/x-flac": "audio/flac",
  "video/matroska": "video/x-matroska",
}

const MIME_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif",
  "image/heic": "heic", "image/heif": "heif", "audio/mpeg": "mp3", "audio/wav": "wav",
  "audio/ogg": "ogg", "audio/m4a": "m4a", "audio/mp4": "m4a", "audio/aac": "aac",
  "audio/flac": "flac", "audio/opus": "opus", "video/mp4": "mp4", "video/webm": "webm",
  "video/quicktime": "mov", "video/x-matroska": "mkv", "video/ogg": "ogv",
}

const EXTENSION_MIMES = Object.fromEntries(
  Object.entries(MIME_EXTENSIONS).map(([mime, extension]) => [extension, mime]),
) as Record<string, string>

export function mediaAcceptAttribute(mediaType?: MediaType): string {
  const types = mediaType ? [...MEDIA_MIME_TYPES[mediaType]] : Object.values(MEDIA_MIME_TYPES).flatMap((value) => [...value])
  const extensions = types.map((mime) => `.${MIME_EXTENSIONS[mime]}`).filter((value) => value !== ".undefined")
  return [...new Set([...types, ...extensions])].join(",")
}

export const MEDIA_ACCEPT_ATTRIBUTE = mediaAcceptAttribute()

export function normalizeMediaMime(mime: string): string {
  const normalized = mime.split(";", 1)[0].trim().toLowerCase()
  return MIME_ALIASES[normalized] || normalized
}

export function detectMediaType(mime: string): MediaType | null {
  const normalized = normalizeMediaMime(mime)
  if (MEDIA_MIME_TYPES.image.has(normalized)) return "image"
  if (MEDIA_MIME_TYPES.audio.has(normalized)) return "audio"
  if (MEDIA_MIME_TYPES.video.has(normalized)) return "video"
  return null
}

export function resolveMediaMime(mime: string, filename: string): string {
  const normalized = normalizeMediaMime(mime)
  if (detectMediaType(normalized)) return normalized
  const extension = filename.trim().toLowerCase().match(/\.([a-z0-9]+)$/)?.[1]
  return extension ? EXTENSION_MIMES[extension] || normalized : normalized
}

export function isDetectedMediaMimeCompatible(expected: string, detected: string): boolean {
  const normalizedExpected = normalizeMediaMime(expected)
  const normalizedDetected = normalizeMediaMime(detected)
  if (normalizedExpected === normalizedDetected) return true
  if (["audio/mp4", "audio/aac"].includes(normalizedExpected) && normalizedDetected === "audio/m4a") {
    return true
  }
  return normalizedExpected === "audio/ogg" && ["audio/opus", "audio/flac"].includes(normalizedDetected)
}

export function shouldUseMultipart(mediaType: MediaType, size: number): boolean {
  if (size <= MULTIPART_THRESHOLD_BYTES) return false
  if (mediaType === "audio" || mediaType === "video") return true
  return size > MULTIPART_IMAGE_THRESHOLD_BYTES
}

export function extensionForMime(mime: string): string {
  const normalized = normalizeMediaMime(mime)
  return MIME_EXTENSIONS[normalized] || "bin"
}

export function isManagedMediaFilename(filename: string): boolean {
  return /^[a-f0-9-]+\.(?:jpg|png|webp|gif|heic|heif|mp3|wav|ogg|m4a|aac|flac|opus|mp4|webm|mov|mkv|ogv)$/i
    .test(filename)
}
