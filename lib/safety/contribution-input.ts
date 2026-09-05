import { z } from "zod"

export const CONTRIBUTION_TYPES = [
  "tribute",
  "message",
  "memory",
  "story",
  "photo",
  "moment",
  "voice",
  "video",
] as const

const optionalTrimmed = (max: number) =>
  z.union([z.string().trim().max(max), z.null(), z.undefined()])
    .transform((value) => value || null)

export const contributionInputSchema = z.object({
  type: z.enum(CONTRIBUTION_TYPES),
  author_name: z.string().trim().min(1).max(100),
  author_relationship: optionalTrimmed(80),
  content: z.string().trim().max(4_000).optional().default(""),
  approx_year: z.union([z.number(), z.string(), z.null(), z.undefined()]),
  location: optionalTrimmed(120),
  tribute_type: z.enum(["flower", "note", "candle"]).optional().default("note"),
  media_refs: z.array(z.string().min(40).max(16_384)).max(3).optional().default([]),
  existing_media_id: z.string().uuid().nullable().optional(),
  turnstile_token: z.string().max(2_048).nullable().optional(),
  upload_authorization: z.string().max(8_192).nullable().optional(),
}).strict()

export type ContributionInput = z.infer<typeof contributionInputSchema>

export function parseApproxYear(value: ContributionInput["approx_year"]): number | null {
  if (value === null || value === undefined || value === "") return null
  const year = typeof value === "number" ? value : Number(value)
  const maxYear = new Date().getUTCFullYear() + 1
  if (!Number.isSafeInteger(year) || year < 1000 || year > maxYear) return null
  return year
}
