export function createUploadFingerprint(
  file: Pick<File, "name" | "size" | "type" | "lastModified">,
  memorialId: string,
  userId: string,
  purpose: string,
): string {
  return [
    "v2",
    encodeURIComponent(memorialId),
    encodeURIComponent(userId),
    encodeURIComponent(purpose),
    encodeURIComponent(file.name),
    file.size,
    file.lastModified,
    encodeURIComponent(file.type || "application/octet-stream"),
  ].join(":")
}

export function clientUploadIdForFingerprint(fingerprint: string): string {
  let hash = 2166136261
  for (let index = 0; index < fingerprint.length; index += 1) {
    hash ^= fingerprint.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return `uppy-${(hash >>> 0).toString(36)}-${fingerprint.length.toString(36)}`
}
