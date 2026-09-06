import "server-only"

import { contributionPlainText, sanitizeContributionHtml } from "@/lib/safety/contribution-html"
import { MAX_RICH_TEXT_HTML_BYTES, utf8ByteLength } from "@/lib/validation/text-limits"

export function validateTextFields(
  input: Record<string, unknown>,
  limits: Record<string, number>,
): string | null {
  for (const [field, limit] of Object.entries(limits)) {
    const value = input[field]
    if (value === undefined || value === null) continue
    if (typeof value !== "string") return `${field} must be text.`
    if (value.trim().length > limit) {
      return `${field} must be ${limit.toLocaleString()} characters or fewer.`
    }
  }
  return null
}

export function sanitizeAndValidateRichText(
  value: unknown,
  visibleLimit: number,
): { html: string; plainText: string; error: string | null } {
  if (value === undefined || value === null || value === "") {
    return { html: "", plainText: "", error: null }
  }
  if (typeof value !== "string") {
    return { html: "", plainText: "", error: "Rich text must be a string." }
  }
  const html = sanitizeContributionHtml(value)
  const plainText = contributionPlainText(html)
  if (plainText.length > visibleLimit) {
    return {
      html,
      plainText,
      error: `Writing must be ${visibleLimit.toLocaleString()} visible characters or fewer.`,
    }
  }
  if (utf8ByteLength(html) > MAX_RICH_TEXT_HTML_BYTES) {
    return {
      html,
      plainText,
      error: "This writing contains too much formatting. Please simplify it and try again.",
    }
  }
  return { html, plainText, error: null }
}

export function isValidEmail(value: string): boolean {
  return value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}
