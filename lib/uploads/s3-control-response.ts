/**
 * Return S3-compatible XML. Uppy's S3 client intentionally requires the
 * content type to equal `application/xml` before it extracts an error Code.
 */
export function s3XmlResponse(value: string, status = 200) {
  return new Response(value, {
    status,
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "no-store",
    },
  })
}

export function escapeS3Xml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}
