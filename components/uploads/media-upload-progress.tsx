"use client"

import { Progress } from "@/components/ui/progress"

function formatBytes(value: number) {
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`
  return `${(value / 1024 / 1024).toFixed(1)} MB`
}

export function MediaUploadProgress(props: {
  percentage: number
  bytesUploaded: number
  totalBytes: number
  bytesPerSecond: number
  etaSeconds: number | null
}) {
  return (
    <div className="space-y-1.5">
      <Progress value={props.percentage} className="h-1.5" />
      <p className="text-[11px] text-[#71717a] tabular-nums">
        {formatBytes(props.bytesUploaded)} of {formatBytes(props.totalBytes)}
        {props.bytesPerSecond > 0 ? ` · ${formatBytes(props.bytesPerSecond)}/s` : ""}
        {props.etaSeconds !== null && props.etaSeconds > 0 ? ` · about ${props.etaSeconds} sec left` : ""}
      </p>
    </div>
  )
}

