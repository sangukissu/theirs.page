"use client"

import { useState } from "react"
import {
  Upload,
  Image as ImageIcon,
  Video,
  Volume2,
  Trash2,
  Film,
  Plus,
  AlertCircle,
  Check,
  Lock,
  Sparkles,
} from "lucide-react"
import { UpgradeBanner } from "../upgrade-banner"

export interface EditorMediaItem {
  id: string
  url: string
  media_type: "image" | "audio" | "video"
  caption?: string | null
  approx_year?: number | null
  location?: string | null
}

interface GalleryTabProps {
  memorialId: string
  fullName: string
  mediaItems: EditorMediaItem[]
  isPaid?: boolean
  onUpgrade?: () => void
  onAddMedia: (item: EditorMediaItem) => void
  onRemoveMedia: (id: string) => void
  onUpdateMedia: (id: string, field: "caption" | "approx_year", value: any) => void
}

export function GalleryTab({
  memorialId,
  fullName,
  mediaItems,
  isPaid = false,
  onUpgrade,
  onAddMedia,
  onRemoveMedia,
  onUpdateMedia,
}: GalleryTabProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const photoCount = mediaItems.filter((m) => m.media_type === "image" || !m.media_type).length
  const isPhotoQuotaReached = !isPaid && photoCount >= 5

  // Multi-file drag and drop upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)
    setUploadError(null)

    let currentPhotoCount = photoCount

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const isAudio = file.type.startsWith("audio/")
      const isVideo = file.type.startsWith("video/")

      if (!isPaid && (isAudio || isVideo)) {
        setUploadError(
          `Audio voice notes and video clips are available on Theirs Complete. Upgrade to preserve ${file.name}.`
        )
        setIsUploading(false)
        setUploadProgress(null)
        return
      }

      if (!isPaid && !isAudio && !isVideo && currentPhotoCount >= 5) {
        setUploadError(
          "Free memorials are limited to 5 photos. Upgrade to Theirs Complete for unlimited photos and media."
        )
        setIsUploading(false)
        setUploadProgress(null)
        return
      }

      setUploadProgress(`Uploading ${i + 1} of ${files.length}: ${file.name}`)

      try {
        // 1. Upload to Cloudflare R2 via server endpoint (bypasses browser CORS completely)
        const formData = new FormData()
        formData.append("file", file)
        formData.append("folder", "gallery")
        formData.append("memorialId", memorialId)

        const uploadRes = await fetch("/api/r2/upload", {
          method: "POST",
          body: formData,
        })

        const uploadData = await uploadRes.json()
        if (!uploadRes.ok) {
          throw new Error(uploadData.error || `Failed to upload ${file.name}`)
        }

        // 2. Save record to Supabase media_items with public CDN URL
        const dbRes = await fetch(`/api/memorials/${memorialId}/media`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: uploadData.publicUrl,
            media_type: uploadData.mediaType,
            caption: null,
            approx_year: null,
          }),
        })

        const dbData = await dbRes.json()
        if (dbRes.ok && dbData.mediaItem) {
          onAddMedia(dbData.mediaItem)
          if (uploadData.mediaType === "image") {
            currentPhotoCount++
          }
        }
      } catch (err: any) {
        console.error("Upload error for file", file.name, err)
        setUploadError(`Error uploading ${file.name}: ${err.message}`)
      }
    }

    setIsUploading(false)
    setUploadProgress(null)
  }

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/memorials/${memorialId}/media?mediaId=${id}`, {
        method: "DELETE",
      })
      onRemoveMedia(id)
    } catch (err) {
      console.error("Failed to delete media:", err)
    }
  }

  return (
    <div className="flex flex-col gap-8 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col gap-1 border-b border-black/[0.06] pb-4">
        <h2 className="text-lg sm:text-xl font-medium text-[#181925]">
          Photographs, Audio & Video Gallery
        </h2>
        <p className="text-xs sm:text-sm text-[#71717a]">
          Bulk upload family memories. Zero mandatory forms—drop photos, saved voicemails, or vintage video clips. Captions and years are completely optional.
        </p>
      </div>

      {/* Complete Plan Upgrade Banner */}
      {!isPaid && (
        <UpgradeBanner
          compact
          memorialId={memorialId}
          featureTitle="Unlimited Photos, Voicemails & Videos"
          description="Free memorials include up to 5 photos. Complete unlocks unlimited high-resolution photos, original audio recordings, and video clips."
          onUpgrade={onUpgrade}
        />
      )}

      {/* Quota & Feature Indicator Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-black/[0.06] shadow-2xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-medium text-[#181925]">Formats:</span>
          <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full bg-neutral-100 text-[#444] border border-black/[0.04]">
            <ImageIcon className="size-3 text-[#666]" /> Photos
          </span>
          <span
            className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full border ${
              isPaid
                ? "bg-neutral-100 text-[#444] border-black/[0.04]"
                : "bg-amber-50/70 text-amber-800 border-amber-200"
            }`}
          >
            <Volume2 className="size-3 text-primary" /> Audio Notes{" "}
            {!isPaid && <Lock className="size-2.5 text-amber-700" />}
          </span>
          <span
            className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full border ${
              isPaid
                ? "bg-neutral-100 text-[#444] border-black/[0.04]"
                : "bg-amber-50/70 text-amber-800 border-amber-200"
            }`}
          >
            <Video className="size-3 text-primary" /> Video Clips{" "}
            {!isPaid && <Lock className="size-2.5 text-amber-700" />}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isPaid ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-200">
              <Sparkles className="size-3" /> Complete · Unlimited
            </span>
          ) : (
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-mono font-medium border ${
                isPhotoQuotaReached
                  ? "bg-rose-50 text-rose-700 border-rose-200"
                  : "bg-neutral-100 text-[#555] border-black/[0.06]"
              }`}
            >
              {photoCount} / 5 Free Photos Used
            </span>
          )}
        </div>
      </div>

      {uploadError && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="size-4 shrink-0" />
            <span>{uploadError}</span>
          </div>
          {!isPaid && (
            <button
              type="button"
              onClick={onUpgrade}
              className="text-xs font-semibold text-rose-800 underline hover:no-underline cursor-pointer shrink-0"
            >
              Upgrade to Complete
            </button>
          )}
        </div>
      )}

      {/* Low-Friction Bulk Upload Area */}
      <label
        className={`p-8 sm:p-10 rounded-3xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-3 cursor-pointer text-center group ${
          isPhotoQuotaReached
            ? "border-amber-300 bg-amber-50/20 hover:bg-amber-50/40"
            : "border-black/[0.12] hover:border-primary/50 bg-white hover:bg-neutral-50/50"
        }`}
      >
        <div className="size-12 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
          {isPhotoQuotaReached ? <Lock className="size-6 text-amber-700" /> : <Upload className="size-6" />}
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-xs sm:text-sm font-medium text-[#181925]">
            {isUploading
              ? uploadProgress || "Uploading files..."
              : isPhotoQuotaReached
              ? "Free 5-photo limit reached · Drop more files after upgrading"
              : "Drop photographs, voice notes, or home videos here"}
          </span>
          <span className="text-[11px] text-[#888]">
            Select multiple files at once (JPG, PNG, MP4, MP3, M4A, OGG) · Original quality preserved
          </span>
        </div>

        <input
          type="file"
          multiple
          accept="image/*,video/*,audio/*"
          disabled={isUploading}
          onChange={handleFileUpload}
          className="hidden"
        />
      </label>

      {/* Uploaded Media Grid */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs text-[#71717a] px-1">
          <span>{mediaItems.length} media items preserved</span>
        </div>

        {mediaItems.length === 0 ? (
          <div className="p-8 rounded-2xl bg-white border border-black/[0.05] text-center text-xs text-[#888]">
            No media uploaded yet. Drag and drop photos, voice memos, or vintage home videos above.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {mediaItems.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-2xl bg-white border border-black/[0.07] flex flex-col gap-2.5 shadow-2xs group relative"
              >
                <div className="aspect-4/3 rounded-xl overflow-hidden bg-neutral-100 relative">
                  {item.media_type === "video" ? (
                    <div className="size-full bg-neutral-900 flex items-center justify-center text-white">
                      <Film className="size-8 opacity-80" />
                      <span className="absolute bottom-2 right-2 text-[10px] font-mono bg-black/70 px-1.5 py-0.5 rounded text-white">
                        Video
                      </span>
                    </div>
                  ) : item.media_type === "audio" ? (
                    <div className="size-full bg-primary/10 flex items-center justify-center text-primary">
                      <Volume2 className="size-8" />
                      <span className="absolute bottom-2 right-2 text-[10px] font-mono bg-primary/20 px-1.5 py-0.5 rounded text-primary">
                        Audio
                      </span>
                    </div>
                  ) : (
                    <img
                      src={item.url}
                      alt={item.caption || "Gallery item"}
                      className="size-full object-cover grayscale contrast-105"
                    />
                  )}

                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    className="absolute top-2 right-2 size-7 rounded-full bg-black/60 hover:bg-rose-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer shadow-sm"
                    title="Remove from gallery"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>

                {/* Optional Inline Metadata */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    defaultValue={item.caption || ""}
                    onBlur={(e) => onUpdateMedia(item.id, "caption", e.target.value)}
                    placeholder="Add caption (optional)"
                    className="flex-1 px-2.5 py-1.5 rounded-lg bg-[#fafafb] border border-black/[0.06] text-xs text-[#181925] placeholder:text-[#aaa] outline-none focus:border-primary/50"
                  />

                  <input
                    type="number"
                    defaultValue={item.approx_year || ""}
                    onBlur={(e) => onUpdateMedia(item.id, "approx_year", e.target.value ? Number(e.target.value) : null)}
                    placeholder="Year"
                    className="w-18 px-2 py-1.5 rounded-lg bg-[#fafafb] border border-black/[0.06] text-xs text-[#181925] font-mono placeholder:text-[#aaa] outline-none focus:border-primary/50 text-center"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
