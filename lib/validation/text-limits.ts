export const TEXT_LIMITS = {
  personFullName: 120,
  preferredName: 60,
  contributorName: 100,
  relationship: 80,
  location: 120,
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

export function isWithinTextLimit(value: unknown, max: number): boolean {
  return typeof value !== "string" || value.trim().length <= max
}
