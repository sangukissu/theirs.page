import "server-only"

import sanitizeHtml from "sanitize-html"

const ALLOWED_TAGS = [
  "p",
  "h2",
  "h3",
  "strong",
  "em",
  "blockquote",
  "ul",
  "ol",
  "li",
  "br",
  "hr",
  "a",
]

export function sanitizeContributionHtml(value: string): string {
  return sanitizeHtml(value, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: {
      a: ["href", "target", "rel"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    allowedSchemesByTag: { a: ["http", "https", "mailto"] },
    allowProtocolRelative: false,
    disallowedTagsMode: "discard",
    transformTags: {
      a: (_tagName, attribs) => ({
        tagName: "a",
        attribs: {
          href: attribs.href || "",
          target: "_blank",
          rel: "noopener noreferrer nofollow",
        },
      }),
    },
  }).trim()
}

export function contributionPlainText(value: string): string {
  return sanitizeHtml(value, { allowedTags: [], allowedAttributes: {} })
    .replace(/\s+/g, " ")
    .trim()
}
