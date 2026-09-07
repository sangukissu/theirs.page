"use client"

import { useRef } from "react"
import type { ResumableUploadItem } from "@/hooks/use-resumable-media-upload"
import { dedupeUploadItems } from "@/lib/uploads/client-scope"
import { MediaUploadItem } from "./media-upload-item"

export function MediaUploadList({
  items, online, onRetry, onCancel, onChooseFiles,
}: {
  items: ResumableUploadItem[]
  online: boolean
  onRetry: (id: string) => void
  onCancel: (id: string) => void
  onChooseFiles: (files: File[]) => void
}) {
  const recoveryInput = useRef<HTMLInputElement | null>(null)
  const uniqueItems = dedupeUploadItems(items)
  if (uniqueItems.length === 0) return null
  return (
    <div className="space-y-2.5">
      {!online && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          Connection lost — uploads are paused. We&apos;ll continue when you&apos;re back online.
        </p>
      )}
      <input
        ref={recoveryInput}
        type="file"
        className="hidden"
        onChange={(event) => {
          const files = Array.from(event.target.files || [])
          if (files.length) onChooseFiles(files)
          event.currentTarget.value = ""
        }}
      />
      {uniqueItems.map((item) => (
        <MediaUploadItem
          key={item.id}
          item={item}
          online={online}
          onRetry={() => onRetry(item.id)}
          onCancel={() => onCancel(item.id)}
          onChooseSameFile={() => recoveryInput.current?.click()}
        />
      ))}
      <p className="text-[11px] leading-relaxed text-[#888]">
        You can come back later. We&apos;ll keep your upload progress and resume where possible.
      </p>
    </div>
  )
}
