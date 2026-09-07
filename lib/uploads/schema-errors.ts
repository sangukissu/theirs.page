export function isUploadSessionSchemaError(error: unknown): boolean {
  const candidate = error as { code?: string; message?: string; details?: string; hint?: string }
  const text = [candidate?.message, candidate?.details, candidate?.hint].filter(Boolean).join(" ")
  return candidate?.code === "PGRST202" || candidate?.code === "42883" ||
    /reserve_media_upload_session_storage|extend_media_upload_session/i.test(text)
}
