import { z } from "zod"

// Reserved slugs that cannot be claimed for a memorial
export const RESERVED_MEMORIAL_SLUGS = new Set([
  "admin",
  "api",
  "app",
  "auth",
  "dashboard",
  "editor",
  "error",
  "family-memory-book",
  "help",
  "login",
  "logout",
  "m",
  "memorial",
  "memorials",
  "new",
  "pricing",
  "privacy",
  "register",
  "robots.txt",
  "settings",
  "share",
  "signin",
  "signout",
  "signup",
  "sitemap.xml",
  "status",
  "support",
  "terms",
  "theirs",
  "welcome",
])

export const memorialSlugSchema = z
  .string()
  .trim()
  .min(3, "Address must be at least 3 characters")
  .max(60, "Address must be no more than 60 characters")
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Use lowercase letters, numbers, and single hyphens"
  )
  .refine((value) => !RESERVED_MEMORIAL_SLUGS.has(value), {
    message: "That address is reserved for system use",
  })

/**
 * Cleanly normalizes any human name or text into a valid URL slug:
 * - Strips accents/diacritics (e.g. "François" -> "francois")
 * - Converts to lowercase
 * - Replaces non-alphanumeric chars with hyphens
 * - Removes leading, trailing, and duplicate hyphens
 * - Enforces max length 60
 */
export function normalizeMemorialSlug(value: string): string {
  if (!value) return ""
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, 60)
    .replace(/-+$/g, "")
}

/**
 * Creates smart, elegant alternative candidate slugs if the primary is taken:
 * e.g. "robert-carter" -> ["robert-carter", "robert-edward-carter", "robert-carter-memorial", "robert-carter-life", "robert-carter-1948"]
 */
export function createMemorialSlugCandidates(
  fullName: string,
  preferredName = "",
  birthYear?: number | null
): string[] {
  const base = normalizeMemorialSlug(fullName)
  if (!base || base.length < 3) return ["memorial-page"]

  const candidates: string[] = [base]

  if (preferredName) {
    const prefSlug = normalizeMemorialSlug(preferredName)
    if (prefSlug) {
      candidates.push(normalizeMemorialSlug(`${base}-${prefSlug}`))
    }
  }

  if (birthYear) {
    candidates.push(normalizeMemorialSlug(`${base}-${birthYear}`))
  }

  candidates.push(normalizeMemorialSlug(`${base}-memorial`))
  candidates.push(normalizeMemorialSlug(`${base}-life`))
  candidates.push(normalizeMemorialSlug(`${base}-remembrance`))

  return Array.from(
    new Set(
      candidates.filter(
        (c) => c.length >= 3 && !RESERVED_MEMORIAL_SLUGS.has(c)
      )
    )
  )
}
