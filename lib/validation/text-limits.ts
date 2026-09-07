export const TEXT_LIMITS = {
  personFullName: 40,
  preferredName: 30,
  contributorName: 100,
  relationship: 80,
  location: 60,
  locationMaxWords: 5,
  galleryLocationMaxWords: 3,
  galleryAlbumMaxWords: 4,
  galleryCaptionMaxWords: 15,
  approxYearDigits: 4,
  headline: 240,
  tribute: 3_000,
  memory: 30_000,
  biography: 30_000,
  timelineTitle: 140,
  timelineDescription: 3_000,
  photoCaption: 1_000,
  albumName: 80,
  successorName: 100,
  email: 254,
} as const

// Rich text has two independent limits: what a reader can see and the markup
// needed to represent it. The request envelope is slightly larger so the
// surrounding contribution metadata still fits.
export const MAX_RICH_TEXT_HTML_BYTES = 96 * 1024
export const MAX_CONTRIBUTION_BODY_BYTES = 128 * 1024

export function utf8ByteLength(value: string): number {
  return new TextEncoder().encode(value).byteLength
}

export function countWords(text: string): number {
  if (!text) return 0
  const matches = text.trim().match(/\S+/g)
  return matches ? matches.length : 0
}

export function clampWords(text: string, maxWords: number): string {
  if (!text || maxWords <= 0) return ""
  const matches = Array.from(text.matchAll(/\S+/g))
  if (matches.length <= maxWords) return text
  const lastMatch = matches[maxWords - 1]
  const endIndex = (lastMatch.index ?? 0) + lastMatch[0].length
  return text.slice(0, endIndex)
}

export function isWithinTextLimit(value: unknown, max: number): boolean {
  return typeof value !== "string" || value.trim().length <= max
}

/**
 * Formats a location string for concise display on the memorial header capsule.
 * Displays up to `maxWords` (default 2), counting alphanumeric words and excluding
 * punctuation like commas from the word count.
 *
 * Examples:
 *   "Devon, Delhi" -> "Devon, Delhi" (2 words)
 *   "Devon Jinga, Delhi" -> "Devon Jinga" (stops after 2 words, strips trailing comma)
 *   "St. Ives, Cornwall, England" -> "St. Ives"
 *   "Kyoto, Japan" -> "Kyoto, Japan"
 */
export function formatMemorialLocation(raw: string | null | undefined, maxWords = 2): string {
  if (!raw || typeof raw !== "string") return ""
  const trimmed = raw.trim()
  if (!trimmed) return ""

  // Ensure consistent spacing after commas so "Devon,Delhi" splits cleanly
  const normalized = trimmed.replace(/,/g, ", ")
  const tokens = normalized.split(/\s+/).filter(Boolean)
  const resultTokens: string[] = []
  let wordsCounted = 0

  for (const token of tokens) {
    const isWord = /[a-zA-Z0-9\p{L}]/u.test(token)
    if (isWord) {
      if (wordsCounted >= maxWords) {
        break
      }
      wordsCounted++
    }
    resultTokens.push(token)
  }

  return resultTokens
    .join(" ")
    .replace(/[,;.\s\-–—]+$/, "")
    .replace(/\s+,/g, ",")
}
