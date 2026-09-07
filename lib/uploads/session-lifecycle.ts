export type UploadSessionLifecycleStatus =
  | "created"
  | "uploading"
  | "uploaded"
  | "verifying"
  | "finalizing"
  | "complete"
  | "failed"
  | "aborted"
  | "expired"

export const ACTIVE_MULTIPART_SESSION_STATUSES = ["created", "uploading"] as const
export const COMPLETED_UPLOAD_SESSION_STATUSES = ["uploaded", "verifying", "finalizing", "complete"] as const

export function canStartOrSignMultipart(status: string): boolean {
  return (ACTIVE_MULTIPART_SESSION_STATUSES as readonly string[]).includes(status)
}

export function hasCompletedMultipartLifecycle(status: string): boolean {
  return (COMPLETED_UPLOAD_SESSION_STATUSES as readonly string[]).includes(status)
}

export function isNoSuchUploadError(error: { code?: string; name?: string; message?: string } | null | undefined): boolean {
  return error?.code === "NoSuchUpload" ||
    error?.name === "NoSuchUpload" ||
    /NoSuchUpload/i.test(error?.message || "")
}
