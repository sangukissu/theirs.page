"use client"

import { useState, useRef, useEffect, useMemo } from "react"
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
  Pin,
  ArrowUp,
  ArrowDown,
  Folder,
  Loader2,
  MapPin,
  Calendar,
} from "lucide-react"
import { UpgradeBanner } from "../upgrade-banner"
import { ConfirmDeleteModal } from "../confirm-delete-modal"

export interface EditorMediaItem {
  id: string
  url: string
  media_type: "image" | "audio" | "video"
  caption?: string | null
  approx_year?: number | null
  location?: string | null
  album?: string | null
  is_pinned?: boolean
  order_index?: number
}

interface GalleryTabProps {
  memorialId: string
  fullName: string
  mediaItems: EditorMediaItem[]
  isPaid?: boolean
  onUpgrade?: () => void
  onAddMedia: (item: EditorMediaItem) => void
  onRemoveMedia: (id: string) => void
  onUpdateMedia: (
    id: string,
    field: "caption" | "approx_year" | "location" | "album" | "is_pinned" | "order_index",
    value: any
  ) => void
  onReorderMedia?: (reordered: EditorMediaItem[]) => void
}

export interface UploadingFileItem {
  id: string
  file: File
  name: string
  previewUrl: string
  mediaType: "image" | "audio" | "video"
  status: "uploading" | "error"
  error?: string
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
  onReorderMedia,
}: GalleryTabProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadingItems, setUploadingItems] = useState<UploadingFileItem[]>([])
  const [selectedAlbumFilter, setSelectedAlbumFilter] = useState<string>("all")

  // Dynamically derive all albums present across media items
  const existingAlbums = useMemo(() => {
    return Array.from(
      new Set(mediaItems.map((m) => m.album?.trim()).filter(Boolean))
    ) as string[]
  }, [mediaItems])

  // Filter media items by selected album
  const displayedMediaItems = useMemo(() => {
    return mediaItems.filter((item) => {
      if (selectedAlbumFilter === "all") return true
      if (selectedAlbumFilter === "__no_album__") return !item.album?.trim()
      return item.album?.trim() === selectedAlbumFilter
    })
  }, [mediaItems, selectedAlbumFilter])

  const uploadingItemsRef = useRef<UploadingFileItem[]>([])
  uploadingItemsRef.current = uploadingItems

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      uploadingItemsRef.current.forEach((item) => {
        try {
          URL.revokeObjectURL(item.previewUrl)
        } catch { }
      })
    }
  }, [])

  const photoCount = mediaItems.filter((m) => m.media_type === "image" || !m.media_type).length
  const isPhotoQuotaReached = !isPaid && photoCount >= 5

  // Multi-file drag and drop upload with instant local preview and incremental load
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploadError(null)

    const fileList = Array.from(files)
    const currentCount = photoCount

    // Check media type permissions on free plan
    const hasProMedia = fileList.some(
      (f) => f.type.startsWith("audio/") || f.type.startsWith("video/")
    )
    if (!isPaid && hasProMedia) {
      setUploadError(
        "Audio voice notes and video clips are available on Pro Plan. Upgrade to preserve these recordings."
      )
      if (e.target) e.target.value = ""
      return
    }

    // Check quota limits on free plan
    let allowedFiles = fileList
    if (!isPaid) {
      const remainingSlots = Math.max(0, 5 - currentCount)
      if (remainingSlots === 0) {
        setUploadError(
          "Free memorials are limited to 5 photos. Upgrade to Pro Plan for unlimited photos and media."
        )
        if (e.target) e.target.value = ""
        return
      }

      if (fileList.length > remainingSlots) {
        allowedFiles = fileList.slice(0, remainingSlots)
        setUploadError(
          `Free plan limit: Uploading the first ${remainingSlots} photo${remainingSlots > 1 ? "s" : ""}. Upgrade to Pro for unlimited media.`
        )
      }
    }

    // Generate immediate optimistic preview cards
    const newItems: UploadingFileItem[] = allowedFiles.map((file, idx) => {
      const mediaType: "image" | "audio" | "video" = file.type.startsWith("video/")
        ? "video"
        : file.type.startsWith("audio/")
          ? "audio"
          : "image"
      return {
        id: `upload-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 7)}`,
        file,
        name: file.name,
        previewUrl: URL.createObjectURL(file),
        mediaType,
        status: "uploading",
      }
    })

    // Prepend new uploading cards so user sees them right away
    setUploadingItems((prev) => [...newItems, ...prev])
    setIsUploading(true)

    // Reset input value so same files can be chosen again if needed
    if (e.target) e.target.value = ""

    let completedCount = 0
    setUploadProgress(`Uploading 1 of ${newItems.length}...`)

    // Single file upload worker
    const uploadSingle = async (item: UploadingFileItem) => {
      try {
        // 1. Upload to Cloudflare R2
        const formData = new FormData()
        formData.append("file", item.file)
        formData.append("folder", "gallery")
        formData.append("memorialId", memorialId)

        const uploadRes = await fetch("/api/r2/upload", {
          method: "POST",
          body: formData,
        })
        const uploadData = await uploadRes.json()
        if (!uploadRes.ok) {
          throw new Error(uploadData.error || `Failed to upload ${item.name}`)
        }

        // 2. Save record to Supabase
        const dbRes = await fetch(`/api/memorials/${memorialId}/media`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: uploadData.publicUrl,
            media_type: uploadData.mediaType,
            caption: null,
            approx_year: null,
            album:
              selectedAlbumFilter !== "all" && selectedAlbumFilter !== "__no_album__"
                ? selectedAlbumFilter
                : null,
          }),
        })

        const dbData = await dbRes.json()
        if (!dbRes.ok || !dbData.mediaItem) {
          throw new Error(dbData.error || `Failed to save ${item.name}`)
        }

        // 3. Immediately load into dashboard UI!
        onAddMedia({
          ...dbData.mediaItem,
          url: uploadData.publicUrl,
        })

        // Clean up preview object URL
        try {
          URL.revokeObjectURL(item.previewUrl)
        } catch { }

        // Remove from uploading placeholders
        setUploadingItems((prev) => prev.filter((i) => i.id !== item.id))

        completedCount++
        if (completedCount < newItems.length) {
          setUploadProgress(`Uploading ${completedCount + 1} of ${newItems.length}...`)
        }
      } catch (err: any) {
        console.error("Upload error for file", item.name, err)
        setUploadingItems((prev) =>
          prev.map((i) =>
            i.id === item.id
              ? { ...i, status: "error", error: err.message || "Upload failed" }
              : i
          )
        )
      }
    }

    // Process uploads with concurrency limit of 2 for fast, smooth incremental UI updates
    const executing: Promise<void>[] = []
    for (const item of newItems) {
      const p = uploadSingle(item).then(() => {
        const idx = executing.indexOf(p)
        if (idx !== -1) executing.splice(idx, 1)
      })
      executing.push(p)
      if (executing.length >= 2) {
        await Promise.race(executing)
      }
    }
    await Promise.all(executing)

    setIsUploading(false)
    setUploadProgress(null)
  }

  const [itemToDelete, setItemToDelete] = useState<EditorMediaItem | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/memorials/${memorialId}/media?mediaId=${itemToDelete.id}`, {
        method: "DELETE",
      })
      if (res.ok) {
        onRemoveMedia(itemToDelete.id)
        setItemToDelete(null)
      } else {
        const data = await res.json().catch(() => ({}))
        console.error("Failed to delete media:", data.error)
      }
    } catch (err) {
      console.error("Failed to delete media:", err)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      {/* Header with Small Toggle */}
      <div className="flex flex-col gap-1 border-b border-black/[0.06] pb-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg sm:text-xl font-medium text-[#181925]">
            Photographs, Audio & Video Gallery
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-[#71717a]">
          Bulk upload family memories. Zero mandatory forms—drop photos, saved voicemails, or vintage video clips. Captions and years are completely optional.
        </p>
      </div>

      <div className="flex flex-col gap-8">

      {/* Complete Plan Upgrade Banner */}
      {!isPaid && (
        <UpgradeBanner
          compact
          memorialId={memorialId}
          featureTitle="Unlimited Photos, Voicemails & Videos"
          description="Free memorials include up to 5 photos. Pro Plan unlocks unlimited high-resolution photos, original audio recordings, and video clips."
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
            className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full border ${isPaid
              ? "bg-neutral-100 text-[#444] border-black/[0.04]"
              : "bg-amber-50/70 text-amber-800 border-amber-200"
              }`}
          >
            <Volume2 className="size-3 text-primary" /> Audio Notes{" "}
            {!isPaid && <Lock className="size-2.5 text-amber-700" />}
          </span>
          <span
            className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full border ${isPaid
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
              className={`px-2.5 py-1 rounded-full text-xs font-mono font-medium border ${isPhotoQuotaReached
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
              Upgrade to Pro
            </button>
          )}
        </div>
      )}

      {/* Low-Friction Bulk Upload Area */}
      <label
        className={`p-8 sm:p-10 rounded-3xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-3 cursor-pointer text-center group ${isPhotoQuotaReached
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

      {/* Uploaded Media Grid & Album Filter Bar */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1 text-xs text-[#71717a]">
          <span>
            {mediaItems.length} media item{mediaItems.length === 1 ? "" : "s"} preserved
            {uploadingItems.length > 0 && ` · ${uploadingItems.length} uploading...`}
          </span>

          {selectedAlbumFilter !== "all" && (
            <button
              type="button"
              onClick={() => setSelectedAlbumFilter("all")}
              className="text-primary hover:underline text-xs font-medium cursor-pointer self-start sm:self-auto"
            >
              Show all ({mediaItems.length}) · filtered by &ldquo;{selectedAlbumFilter === "__no_album__" ? "Untagged" : selectedAlbumFilter}&rdquo;
            </button>
          )}
        </div>

        {/* Album Filter Chips in Editor */}
        {existingAlbums.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 select-none">
            <span className="text-xs font-medium text-[#181925] shrink-0 mr-1 flex items-center gap-1">
              <Folder className="size-3.5 text-primary" />
              <span>Albums:</span>
            </span>

            <button
              type="button"
              onClick={() => setSelectedAlbumFilter("all")}
              className={`text-xs px-3 py-1 rounded-full font-medium transition-all cursor-pointer shrink-0 ${
                selectedAlbumFilter === "all"
                  ? "bg-primary text-primary-foreground shadow-2xs"
                  : "bg-[#f4f4f6] text-[#666] hover:text-[#181925]"
              }`}
            >
              All ({mediaItems.length})
            </button>

            {existingAlbums.map((alb) => {
              const count = mediaItems.filter((m) => m.album?.trim() === alb).length
              return (
                <button
                  key={alb}
                  type="button"
                  onClick={() => setSelectedAlbumFilter(alb)}
                  className={`text-xs px-3 py-1 rounded-full font-medium transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                    selectedAlbumFilter === alb
                      ? "bg-primary text-primary-foreground shadow-2xs"
                      : "bg-[#f4f4f6] text-[#666] hover:text-[#181925]"
                  }`}
                >
                  <Folder className="size-3 shrink-0" />
                  <span>{alb}</span>
                  <span className="text-[10px] opacity-75 font-mono">({count})</span>
                </button>
              )
            })}

            {mediaItems.some((m) => !m.album?.trim()) && (
              <button
                type="button"
                onClick={() => setSelectedAlbumFilter("__no_album__")}
                className={`text-xs px-3 py-1 rounded-full font-medium transition-all cursor-pointer shrink-0 ${
                  selectedAlbumFilter === "__no_album__"
                    ? "bg-neutral-800 text-white shadow-2xs"
                    : "bg-[#f4f4f6] text-[#888] hover:text-[#181925]"
                }`}
              >
                Untagged ({mediaItems.filter((m) => !m.album?.trim()).length})
              </button>
            )}
          </div>
        )}

        {displayedMediaItems.length === 0 && uploadingItems.length === 0 ? (
          <div className="p-8 rounded-2xl bg-white border border-black/[0.05] text-center text-xs text-[#888]">
            {selectedAlbumFilter !== "all"
              ? `No media in "${selectedAlbumFilter === "__no_album__" ? "Untagged" : selectedAlbumFilter}". Drop files above to add to this album.`
              : "No media uploaded yet. Drag and drop photos, voice memos, or vintage home videos above."}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Optimistic Uploading Cards (Live thumbnail + Preserving status) */}
            {uploadingItems.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-2xl bg-white border border-primary/30 flex flex-col gap-2.5 shadow-2xs relative overflow-hidden"
              >
                <div className="aspect-4/3 rounded-xl overflow-hidden bg-neutral-100 relative">
                  {item.mediaType === "video" ? (
                    <div className="size-full bg-neutral-900 flex items-center justify-center text-white">
                      <Film className="size-8 opacity-80" />
                    </div>
                  ) : item.mediaType === "audio" ? (
                    <div className="size-full bg-primary/10 flex items-center justify-center text-primary">
                      <Volume2 className="size-8" />
                    </div>
                  ) : (
                    <img
                      src={item.previewUrl}
                      alt={item.name}
                      className="size-full object-cover"
                    />
                  )}

                  {/* Frosted Status Overlay */}
                  <div
                    className={`absolute inset-0 flex flex-col items-center justify-center gap-1.5 p-3 text-center ${item.status === "error"
                      ? "bg-rose-950/85 text-white"
                      : "bg-black/50 backdrop-blur-[2px] text-white"
                      }`}
                  >
                    {item.status === "error" ? (
                      <>
                        <AlertCircle className="size-5 text-rose-300" />
                        <span className="text-[11px] font-medium text-rose-200 line-clamp-2">
                          {item.error || "Upload failed"}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            try {
                              URL.revokeObjectURL(item.previewUrl)
                            } catch { }
                            setUploadingItems((prev) => prev.filter((i) => i.id !== item.id))
                          }}
                          className="mt-1 px-2.5 py-0.5 rounded-full bg-white/20 hover:bg-white/30 text-[10px] text-white transition-colors cursor-pointer"
                        >
                          Dismiss
                        </button>
                      </>
                    ) : (
                      <>
                        <Loader2 className="size-5 animate-spin text-white" />
                        <span className="text-xs font-medium tracking-tight">Preserving...</span>
                        <span className="text-[10px] text-white/70 truncate max-w-full px-2 font-mono">
                          {item.name}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Subtle Skeleton placeholders for metadata fields */}
                <div className="flex flex-col gap-2 opacity-40 pointer-events-none">
                  <div className="h-7 rounded-lg bg-neutral-100 animate-pulse" />
                  <div className="h-7 rounded-lg bg-neutral-100 animate-pulse" />
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-7 rounded-lg bg-neutral-100 animate-pulse" />
                    <div className="w-24 h-7 rounded-lg bg-neutral-100 animate-pulse" />
                  </div>
                </div>
              </div>
            ))}

            {/* Permanent Media Items */}
            {displayedMediaItems.map((item, index) => (
              <div
                key={item.id}
                className={`p-3 rounded-2xl bg-white border flex flex-col gap-2.5 shadow-2xs group relative transition-all ${item.is_pinned ? "border-[#8b5a45]/40 bg-[#faf8f5]/40" : "border-black/[0.07]"
                  }`}
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
                      className="size-full object-cover"
                    />
                  )}

                  {/* Pin to Top Button (Top Left) */}
                  <button
                    type="button"
                    onClick={() => onUpdateMedia(item.id, "is_pinned", !item.is_pinned)}
                    className={`absolute top-2 left-2 size-7 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-xs ${item.is_pinned
                      ? "bg-[#8b5a45] text-white opacity-100"
                      : "bg-black/60 hover:bg-black/80 text-white opacity-0 group-hover:opacity-100"
                      }`}
                    title={item.is_pinned ? "Unpin from top" : "Pin to top as featured"}
                  >
                    <Pin className={`size-3.5 ${item.is_pinned ? "fill-white" : ""}`} />
                  </button>

                  {item.is_pinned && (
                    <span className="absolute top-2 left-10 text-[9px] font-mono uppercase tracking-wider bg-[#8b5a45] text-white px-2 py-0.5 rounded-full shadow-xs">
                      Pinned
                    </span>
                  )}

                  {/* Delete Button (Top Right) */}
                  <button
                    type="button"
                    onClick={() => setItemToDelete(item)}
                    className="absolute top-2 right-2 size-7 rounded-full bg-black/60 hover:bg-rose-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer shadow-sm"
                    title="Remove from gallery"
                  >
                    <Trash2 className="size-3.5" />
                  </button>

                  {/* Move Earlier / Move Later Controls (Bottom Left inside overlay) */}
                  <div className="absolute bottom-2 left-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => {
                        if (index > 0 && onReorderMedia) {
                          const next = [...mediaItems]
                          const temp = next[index]
                          next[index] = next[index - 1]
                          next[index - 1] = temp
                          onReorderMedia(next)
                        }
                      }}
                      className="size-6 rounded-md bg-black/70 hover:bg-black/90 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center text-white cursor-pointer"
                      title="Move earlier"
                    >
                      <ArrowUp className="size-3" />
                    </button>
                    <button
                      type="button"
                      disabled={index === mediaItems.length - 1}
                      onClick={() => {
                        if (index < mediaItems.length - 1 && onReorderMedia) {
                          const next = [...mediaItems]
                          const temp = next[index]
                          next[index] = next[index + 1]
                          next[index + 1] = temp
                          onReorderMedia(next)
                        }
                      }}
                      className="size-6 rounded-md bg-black/70 hover:bg-black/90 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center text-white cursor-pointer"
                      title="Move later"
                    >
                      <ArrowDown className="size-3" />
                    </button>
                  </div>
                </div>

                {/* Inline Metadata Form */}
                <div className="flex flex-col gap-2">
                  {/* Row 1: Caption */}
                  <input
                    type="text"
                    defaultValue={item.caption || ""}
                    onBlur={(e) => onUpdateMedia(item.id, "caption", e.target.value)}
                    placeholder="Add caption (optional)"
                    className="w-full px-3 py-1.5 rounded-lg bg-[#fafafb] border border-black/[0.06] text-xs text-[#181925] placeholder:text-[#aaa] outline-none focus:border-primary/50"
                  />

                  {/* Row 2: Album (With Folder Icon + Datalist Suggestions) */}
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#fafafb] border border-black/[0.06] focus-within:border-primary/50 transition-colors">
                    <Folder className="size-3.5 text-primary/70 shrink-0" />
                    <input
                      type="text"
                      list={`album-list-${item.id}`}
                      defaultValue={item.album || ""}
                      onBlur={(e) => onUpdateMedia(item.id, "album", e.target.value)}
                      placeholder="Album (e.g. Family, Travels, Leh)"
                      className="w-full min-w-0 bg-transparent text-xs text-[#181925] placeholder:text-[#aaa] outline-none"
                    />
                    <datalist id={`album-list-${item.id}`}>
                      {existingAlbums.map((alb) => (
                        <option key={alb} value={alb} />
                      ))}
                    </datalist>
                  </div>

                  {/* Row 3: Location and Year */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 min-w-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#fafafb] border border-black/[0.06] focus-within:border-primary/50 transition-colors">
                      <MapPin className="size-3 text-[#888] shrink-0" />
                      <input
                        type="text"
                        defaultValue={item.location || ""}
                        onBlur={(e) => onUpdateMedia(item.id, "location", e.target.value)}
                        placeholder="Location"
                        className="w-full min-w-0 bg-transparent text-xs text-[#181925] placeholder:text-[#aaa] outline-none"
                      />
                    </div>

                    <div className="w-24 shrink-0 flex items-center gap-1 px-2 py-1.5 rounded-lg bg-[#fafafb] border border-black/[0.06] focus-within:border-primary/50 transition-colors">
                      <Calendar className="size-3 text-[#888] shrink-0" />
                      <input
                        type="number"
                        defaultValue={item.approx_year || ""}
                        onBlur={(e) => onUpdateMedia(item.id, "approx_year", e.target.value ? Number(e.target.value) : null)}
                        placeholder="Year"
                        className="w-full min-w-0 bg-transparent text-xs text-[#181925] font-mono text-center placeholder:text-[#aaa] outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      </div>

      <ConfirmDeleteModal
        isOpen={!!itemToDelete}
        title={
          itemToDelete?.media_type === "video"
            ? "Delete this video clip?"
            : itemToDelete?.media_type === "audio"
              ? "Delete this voice recording?"
              : "Delete this photograph?"
        }
        description="This item will be permanently removed from this memorial's gallery. This action cannot be undone."
        itemPreview={
          itemToDelete?.caption ||
          (itemToDelete?.media_type === "video"
            ? "Video clip"
            : itemToDelete?.media_type === "audio"
              ? "Audio recording"
              : "Photograph")
        }
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onClose={() => !isDeleting && setItemToDelete(null)}
      />
    </div>
  )
}
