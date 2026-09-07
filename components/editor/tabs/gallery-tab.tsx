"use client"

import { useState, useRef, useMemo } from "react"
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
  MapPin,
  Calendar,
} from "lucide-react"
import { UpgradeBanner } from "../upgrade-banner"
import { ConfirmDeleteModal } from "../confirm-delete-modal"
import { TEXT_LIMITS } from "@/lib/validation/text-limits"
import { useEditorAuthorization } from "../use-editor-authorization"
import { useResumableMediaUpload } from "@/hooks/use-resumable-media-upload"
import { MediaUploadList } from "@/components/uploads/media-upload-list"
import type { MemorialAccessRole } from "@/lib/memorial-auth"
import { isMediaAllowed, resolveMediaCapabilities } from "@/lib/uploads/capabilities"
import { detectMediaType, MEDIA_ACCEPT_ATTRIBUTE, resolveMediaMime } from "@/lib/uploads/constants"

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
  currentUserId: string
  accessRole: MemorialAccessRole
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

export function GalleryTab({
  memorialId,
  fullName,
  mediaItems,
  isPaid = false,
  currentUserId,
  accessRole,
  onUpgrade,
  onAddMedia,
  onRemoveMedia,
  onUpdateMedia,
  onReorderMedia,
}: GalleryTabProps) {
  const handleAuthorizationFailure = useEditorAuthorization(memorialId)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [selectedAlbumFilter, setSelectedAlbumFilter] = useState<string>("all")
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const uploads = useResumableMediaUpload({
    memorialId,
    userId: currentUserId,
    purpose: "studio_gallery",
    defaultAlbum: selectedAlbumFilter !== "all" && selectedAlbumFilter !== "__no_album__"
      ? selectedAlbumFilter
      : null,
    onStudioComplete: (mediaItem) => onAddMedia(mediaItem as unknown as EditorMediaItem),
  })

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

  const photoCount = mediaItems.filter((m) => m.media_type === "image" || !m.media_type).length
  const mediaCapabilities = useMemo(() => resolveMediaCapabilities({
    context: "studio",
    isPaid,
    accessRole,
    existingMediaCounts: { image: photoCount },
  }), [accessRole, isPaid, photoCount])
  const isPhotoQuotaReached = mediaCapabilities.imageQuotaReached

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploadError(null)

    const fileList = Array.from(files)
    const disallowedFile = fileList.find((file) => {
      const mediaType = detectMediaType(resolveMediaMime(file.type, file.name))
      return !mediaType || !isMediaAllowed(mediaCapabilities, mediaType)
    })
    if (disallowedFile) {
      const mediaType = detectMediaType(resolveMediaMime(disallowedFile.type, disallowedFile.name))
      setUploadError(
        !isPaid && (mediaType === "audio" || mediaType === "video")
          ? "Audio voice notes and video clips are available on Pro Plan. Upgrade to preserve these recordings."
          : mediaType === "image" && mediaCapabilities.imageQuotaReached
            ? `Free memorials are limited to ${mediaCapabilities.maxImageItems} photos. The Complete plan includes up to 10 GB of original media.`
            : "One or more selected files use a format that this gallery cannot verify."
      )
      if (e.target) e.target.value = ""
      return
    }

    // Check quota limits on free plan
    let allowedFiles = fileList
    if (mediaCapabilities.remainingImageItems !== null) {
      const remainingSlots = mediaCapabilities.remainingImageItems
      if (remainingSlots === 0) {
        setUploadError(
          "Free memorials are limited to 5 photos. The Complete plan includes up to 10 GB of original media."
        )
        if (e.target) e.target.value = ""
        return
      }

      if (fileList.length > remainingSlots) {
        allowedFiles = fileList.slice(0, remainingSlots)
        setUploadError(
          `Free plan limit: Uploading the first ${remainingSlots} photo${remainingSlots > 1 ? "s" : ""}. The Complete plan includes up to 10 GB of original media.`
        )
      }
    }

    if (e.target) e.target.value = ""
    await uploads.addFiles(allowedFiles)
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
      if (handleAuthorizationFailure(res)) return
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


        {/* Quota & Feature Indicator Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 rounded-2xl bg-white p-3.5 sm:p-4.5 border border-black/[0.06] shadow-2xs">
          {/* Top row on mobile: Header label + Quota badge */}
          <div className="flex items-center justify-between sm:justify-start gap-2">
            <span className="text-xs font-medium text-[#181925] shrink-0">Accepted Media</span>

            {/* Mobile Quota Badge */}
            <div className="sm:hidden">
              {isPaid ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-medium border border-emerald-200">
                  <Sparkles className="size-2.5" /> Complete · 10 GB archive
                </span>
              ) : (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-medium border ${isPhotoQuotaReached
                    ? "bg-rose-50 text-rose-700 border-rose-200"
                    : "bg-neutral-100 text-[#555] border-black/[0.06]"
                    }`}
                >
                   {photoCount} / {mediaCapabilities.maxImageItems} Photos Used
                </span>
              )}
            </div>
          </div>

          {/* Formats Pills Row */}
          <div className="flex items-center justify-between sm:justify-end gap-2 flex-wrap sm:flex-nowrap pt-1 sm:pt-0 border-t border-black/[0.04] sm:border-t-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 sm:py-1 rounded-full bg-neutral-100/90 text-[#444] border border-black/[0.05] font-medium">
                <ImageIcon className="size-3 text-[#666]" /> Photos
              </span>
              <span
                className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 sm:py-1 rounded-full border font-medium ${isPaid
                  ? "bg-neutral-100/90 text-[#444] border-black/[0.05]"
                  : "bg-amber-50/70 text-amber-900 border-amber-200/90"
                  }`}
              >
                <Volume2 className="size-3 text-primary" /> Audio Notes{" "}
                {!mediaCapabilities.nativeAudio && <Lock className="size-2.5 text-amber-700" />}
              </span>
              <span
                className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 sm:py-1 rounded-full border font-medium ${isPaid
                  ? "bg-neutral-100/90 text-[#444] border-black/[0.04]"
                  : "bg-amber-50/70 text-amber-900 border-amber-200/90"
                  }`}
              >
                <Video className="size-3 text-primary" /> Video Clips{" "}
                {!mediaCapabilities.nativeVideo && <Lock className="size-2.5 text-amber-700" />}
              </span>
            </div>

            {/* Desktop Quota Badge */}
            <div className="hidden sm:block shrink-0">
              {isPaid ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-200">
                   <Sparkles className="size-3" /> Complete · 10 GB archive
                </span>
              ) : (
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-mono font-medium border ${isPhotoQuotaReached
                    ? "bg-rose-50 text-rose-700 border-rose-200"
                    : "bg-neutral-100 text-[#555] border-black/[0.06]"
                    }`}
                >
                   {photoCount} / {mediaCapabilities.maxImageItems} Free Photos Used
                </span>
              )}
            </div>
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
              {uploads.isUploading
                ? "Uploading securely — each file shows its own progress below"
                : isPhotoQuotaReached
                  ? "Free 5-photo limit reached · Drop more files after upgrading"
                  : "Drop photographs, voice notes, or home videos here"}
            </span>
            <span className="text-[11px] text-[#888]">
              Select multiple files at once (JPG, PNG, MP4, MP3, M4A, OGG) · Original quality preserved
            </span>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={MEDIA_ACCEPT_ATTRIBUTE}
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>

        <MediaUploadList
          items={uploads.items}
          online={uploads.isOnline}
          onRetry={(id) => void uploads.retry(id)}
          onCancel={(id) => void uploads.cancel(id)}
          onChooseFiles={(files) => void uploads.addFiles(files)}
        />

        {/* Uploaded Media Grid & Album Filter Bar */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1 text-xs text-[#71717a]">
            <span>
              {mediaItems.length} media item{mediaItems.length === 1 ? "" : "s"} preserved
              {uploads.items.some((item) => item.status !== "complete") && ` · ${uploads.items.filter((item) => item.status !== "complete").length} in upload queue`}
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
                className={`text-xs px-3 py-1 rounded-full font-medium transition-all cursor-pointer shrink-0 ${selectedAlbumFilter === "all"
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
                    className={`text-xs px-3 py-1 rounded-full font-medium transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${selectedAlbumFilter === alb
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
                  className={`text-xs px-3 py-1 rounded-full font-medium transition-all cursor-pointer shrink-0 ${selectedAlbumFilter === "__no_album__"
                    ? "bg-neutral-800 text-white shadow-2xs"
                    : "bg-[#f4f4f6] text-[#888] hover:text-[#181925]"
                    }`}
                >
                  Untagged ({mediaItems.filter((m) => !m.album?.trim()).length})
                </button>
              )}
            </div>
          )}

          {displayedMediaItems.length === 0 ? (
            <div className="p-8 rounded-2xl bg-white border border-black/[0.05] text-center text-xs text-[#888]">
              {selectedAlbumFilter !== "all"
                ? `No media in "${selectedAlbumFilter === "__no_album__" ? "Untagged" : selectedAlbumFilter}". Drop files above to add to this album.`
                : "No media uploaded yet. Drag and drop photos, voice memos, or vintage home videos above."}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      maxLength={TEXT_LIMITS.photoCaption}
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
                        maxLength={TEXT_LIMITS.albumName}
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
                          maxLength={TEXT_LIMITS.location}
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
