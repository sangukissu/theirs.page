export type UploadRecoveryAction =
  | "show_complete"
  | "finish"
  | "needs_file"
  | "preserve_error"
  | "resume"
  | "wait"

export function resolveUploadRecoveryAction(input: {
  serverStatus: string
  hasUsableFile: boolean
  uploadComplete: boolean
  recoveryBlocked: boolean
  online: boolean
}): UploadRecoveryAction {
  if (input.serverStatus === "complete") return "show_complete"
  if (["uploaded", "verifying", "finalizing"].includes(input.serverStatus)) return "finish"
  if (!input.hasUsableFile) return "needs_file"
  if (input.recoveryBlocked) return "preserve_error"
  if (input.uploadComplete) return "finish"
  return input.online ? "resume" : "wait"
}
