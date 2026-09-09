import React from "react"

/**
 * Safely serializes arbitrary structured data for embedding inside an HTML <script> tag.
 *
 * Prevents HTML/script breakout attacks (e.g. `</script><script>alert(1)</script>`)
 * by escaping `<` to `\u003c`, `>` to `\u003e`, and `&` to `\u0026`.
 * Also escapes Unicode line separators U+2028 and U+2029 which can break JavaScript parser evaluation.
 */
export function safeJsonLdReplacer(data: unknown): string {
  if (data === undefined || data === null) {
    return "{}"
  }

  const jsonString = typeof data === "string" ? data : JSON.stringify(data)

  return jsonString
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029")
}

export interface JsonLdProps {
  schema: Record<string, unknown> | Array<Record<string, unknown>>
  id?: string
}

/**
 * Renders a secure, sanitized application/ld+json script block.
 */
export function JsonLd({ schema, id }: JsonLdProps) {
  if (!schema || (Array.isArray(schema) && schema.length === 0)) {
    return null
  }

  const safeContent = safeJsonLdReplacer(schema)

  return (
    <script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeContent }}
    />
  )
}
