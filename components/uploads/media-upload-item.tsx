"use client"

import { AlertCircle, CheckCircle2, Loader2, Pause, RotateCcw, X } from "lucide-react"
import type { ResumableUploadItem } from "@/hooks/use-resumable-media-upload"
import { MediaUploadProgress } from "./media-upload-progress"

function statusLabel(item: ResumableUploadItem, online: boolean) {
  if (!online && ["uploading", "paused"].includes(item.status)) return "Connection lost — upload paused"
  if (item.status === "preparing") return "Preparing secure upload…"
  if (item.status === "uploading") return `Uploading · ${item.percentage}%`
  if (item.status === "paused") return `Upload paused at ${item.percentage}%`
  if (item.status === "verifying") return "Verifying upload…"
  if (item.status === "finalizing") return "Adding to the memorial…"
  if (item.status === "complete") return "Uploaded"
  return "Needs attention"
}

export function MediaUploadItem({
  item, online, onRetry, onCancel, onChooseSameFile,
}: {
  item: ResumableUploadItem
  online: boolean
  onRetry: () => void
  onCancel: () => void
  onChooseSameFile?: () => void
}) {
  const active = ["preparing", "uploading", "paused"].includes(item.status)
  const canCancel = ["preparing", "uploading", "paused", "verifying", "error"].includes(item.status)
  return (
    <div className="rounded-2xl border border-black/[0.08] bg-white p-3.5 shadow-xs">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 text-primary">
          {item.status === "complete" ? <CheckCircle2 className="size-4.5 text-emerald-600" />
            : item.status === "error" ? <AlertCircle className="size-4.5 text-rose-600" />
              : item.status === "paused" ? <Pause className="size-4.5" />
                : <Loader2 className="size-4.5 animate-spin" />}
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <div>
            <p className="truncate text-sm font-medium text-[#181925]">{item.filename}</p>
            <p className="text-xs text-[#71717a]">{statusLabel(item, online)}</p>
          </div>
          {active && item.totalBytes > 0 && (
            <MediaUploadProgress
              percentage={item.percentage}
              bytesUploaded={item.bytesUploaded}
              totalBytes={item.totalBytes}
              bytesPerSecond={item.bytesPerSecond}
              etaSeconds={item.etaSeconds}
            />
          )}
          {item.error && <p className="text-xs leading-relaxed text-rose-700">{item.error}</p>}
          {item.needsFile && (
            <button type="button" onClick={onChooseSameFile} className="text-xs font-semibold text-primary hover:underline">
              Choose the same file to continue
            </button>
          )}
          {item.status === "error" && !item.needsFile && item.canRetry !== false && (
            <button type="button" onClick={onRetry} className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
              <RotateCcw className="size-3" /> Resume
            </button>
          )}
        </div>
        {canCancel && (
          <button type="button" onClick={onCancel} className="rounded-full p-1 text-[#888] hover:bg-neutral-100 hover:text-[#181925]" aria-label={`Cancel ${item.filename}`}>
            <X className="size-4" />
          </button>
        )}
      </div>
    </div>
  )
}
