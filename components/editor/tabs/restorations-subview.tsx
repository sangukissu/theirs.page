"use client"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import {
  Sparkles,
  Upload,
  Download,
  Trash2,
  Loader2,
  Check,
  Lock,
  AlertCircle,
  Eye,
  SlidersHorizontal,
  X,
  Shield,
  ArrowRight,
} from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import ImageComparison from "@/components/image-comparison"
import { ConfirmDeleteModal } from "../confirm-delete-modal"
import type { EditorMediaItem } from "./gallery-tab"
import { useToast } from "@/hooks/use-toast"

interface RestorationItem {
  id: string
  status: "pending" | "processing" | "completed" | "failed"
  original_image_url: string | null
  restored_image_url: string | null
  originalUrl?: string
  restoredUrl?: string
  error_message?: string | null
  created_at: string
  in_gallery?: boolean
  gallery_media_id?: string | null
  localPreviewUrl?: string
}

interface RestorationsSubviewProps {
  memorialId: string
  fullName: string
  isPaid?: boolean
  mediaItems: EditorMediaItem[]
  onUpgrade?: () => void
  onAddMedia: (item: EditorMediaItem) => void
  onSwitchToGallery: () => void
}

const MAX_RESTORATIONS_LIMIT = 5
const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024

export function RestorationsSubview({
  memorialId,
  fullName,
  isPaid = false,
  mediaItems,
  onUpgrade,
  onAddMedia,
  onSwitchToGallery,
}: RestorationsSubviewProps) {
  const { toast } = useToast()
  const [restorations, setRestorations] = useState<RestorationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [preserveOriginalColors, setPreserveOriginalColors] = useState(false)
  const [activeComparison, setActiveComparison] = useState<RestorationItem | null>(null)
  const [itemToDelete, setItemToDelete] = useState<RestorationItem | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [addingToGalleryId, setAddingToGalleryId] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Map of restoration ID -> media_item ID derived from mediaItems prop
  const galleryMap = useMemo(() => {
    const map = new Map<string, string>()
    for (const item of mediaItems) {
      if (item.source_restoration_id) {
        map.set(item.source_restoration_id, item.id)
      }
    }
    return map
  }, [mediaItems])

  // Count completed restorations
  const completedCount = useMemo(() => {
    return restorations.filter((r) => r.status === "completed").length
  }, [restorations])

  const processingCount = useMemo(() => {
    return restorations.filter((r) => r.status === "processing" || r.status === "pending").length
  }, [restorations])

  const isQuotaReached = completedCount >= MAX_RESTORATIONS_LIMIT

  // Fetch restorations on mount if paid
  const fetchRestorations = useCallback(async () => {
    if (!isPaid) {
      setLoading(false)
      return
    }
    try {
      const res = await fetch(`/api/memorials/${memorialId}/restorations`)
      if (res.ok) {
        const data = await res.json()
        setRestorations(data.restorations || [])
      }
    } catch (err) {
      console.error("Failed to load restorations:", err)
    } finally {
      setLoading(false)
    }
  }, [isPaid, memorialId])

  useEffect(() => {
    void fetchRestorations()
  }, [fetchRestorations])

  // Realtime subscription for live status changes
  useEffect(() => {
    if (!isPaid) return

    const supabase = createClient()
    const channel = supabase.channel(`memorial-restorations-${memorialId}`)

    channel
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "image_restorations",
          filter: `memorial_id=eq.${memorialId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const newRecord = payload.new as any
            setRestorations((prev) => {
              if (prev.some((r) => r.id === newRecord.id)) return prev
              return [
                {
                  id: newRecord.id,
                  status: newRecord.status,
                  original_image_url: newRecord.original_image_url,
                  restored_image_url: newRecord.restored_image_url,
                  originalUrl: newRecord.original_image_url
                    ? `/api/media?key=${encodeURIComponent(newRecord.original_image_url)}`
                    : undefined,
                  restoredUrl: newRecord.restored_image_url
                    ? `/api/media?key=${encodeURIComponent(newRecord.restored_image_url)}`
                    : undefined,
                  error_message: newRecord.error_message,
                  created_at: newRecord.created_at,
                },
                ...prev,
              ]
            })
          } else if (payload.eventType === "UPDATE") {
            const updated = payload.new as any
            setRestorations((prev) =>
              prev.map((r) => {
                if (r.id !== updated.id) return r
                const restoredUrl = updated.restored_image_url
                  ? `/api/media?key=${encodeURIComponent(updated.restored_image_url)}`
                  : r.restoredUrl
                const originalUrl = updated.original_image_url
                  ? `/api/media?key=${encodeURIComponent(updated.original_image_url)}`
                  : r.originalUrl
                return {
                  ...r,
                  status: updated.status,
                  restored_image_url: updated.restored_image_url,
                  original_image_url: updated.original_image_url,
                  restoredUrl,
                  originalUrl,
                  error_message: updated.error_message,
                }
              })
            )

            if (updated.status === "completed") {
              toast.success("Photograph restored successfully")
            } else if (updated.status === "failed") {
              toast.error(updated.error_message || "Photograph restoration failed. Your slot was not used.")
            }
          } else if (payload.eventType === "DELETE") {
            const oldRecord = payload.old as any
            if (oldRecord?.id) {
              setRestorations((prev) => prev.filter((r) => r.id !== oldRecord.id))
            }
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [isPaid, memorialId, toast])

  // Escape key and body scroll lock for active comparison modal
  useEffect(() => {
    if (!activeComparison) return
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveComparison(null)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => {
      document.body.style.overflow = originalOverflow
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [activeComparison])

  // Periodic reconcile polling while jobs are in processing state
  useEffect(() => {
    if (!isPaid) return
    const inFlight = restorations.filter((r) => r.status === "processing" || r.status === "pending")
    if (inFlight.length === 0) return

    const interval = setInterval(async () => {
      try {
        const ids = inFlight.map((r) => r.id)
        const res = await fetch("/api/restore/reconcile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ memorial_id: memorialId, ids }),
        })
        if (res.ok) {
          const data = await res.json()
          if (Array.isArray(data.restorations)) {
            setRestorations((prev) =>
              prev.map((item) => {
                const updated = data.restorations.find((r: any) => r.id === item.id)
                if (!updated) return item
                return {
                  ...item,
                  status: updated.status,
                  restored_image_url: updated.restored_image_url,
                  original_image_url: updated.original_image_url,
                  restoredUrl: updated.restoredImageUrl || item.restoredUrl,
                  originalUrl: updated.originalImageUrl || item.originalUrl,
                  error_message: updated.error_message,
                }
              })
            )
          }
        }
      } catch (err) {
        console.error("Reconcile polling error:", err)
      }
    }, 6000)

    return () => clearInterval(interval)
  }, [isPaid, memorialId, restorations])

  // Handle single or multi-file upload
  const handleUploadFiles = async (files: FileList | File[]) => {
    if (!isPaid) {
      if (onUpgrade) onUpgrade()
      return
    }

    setErrorMessage(null)
    const fileList = Array.from(files)
    if (fileList.length === 0) return

    const slotsRemaining = MAX_RESTORATIONS_LIMIT - completedCount - processingCount
    if (slotsRemaining <= 0) {
      setErrorMessage("All 5 included restorations for this memorial have been used or are in progress.")
      return
    }

    const filesToUpload = fileList.slice(0, slotsRemaining)
    if (fileList.length > slotsRemaining) {
      toast.info(`Restoring the first ${slotsRemaining} photo${slotsRemaining > 1 ? "s" : ""}. Limit is 5 per memorial.`)
    }

    setUploading(true)

    for (const file of filesToUpload) {
      if (!["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(file.type)) {
        toast.error(`${file.name}: Only JPG, PNG, and WebP formats are supported.`)
        continue
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        toast.error(`${file.name}: File exceeds 15MB limit.`)
        continue
      }

      const localPreviewUrl = URL.createObjectURL(file)
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

      // Optimistically add to UI list
      setRestorations((prev) => [
        {
          id: tempId,
          status: "processing",
          original_image_url: null,
          restored_image_url: null,
          localPreviewUrl,
          created_at: new Date().toISOString(),
        },
        ...prev,
      ])

      try {
        // 1. Get presigned upload URL
        const presignRes = await fetch("/api/r2/presigned-upload-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            memorialId,
            filename: file.name,
            contentType: file.type,
            fileSize: file.size,
            folder: "restorations",
          }),
        })

        if (!presignRes.ok) {
          const errData = await presignRes.json().catch(() => ({}))
          throw new Error(errData?.error || "Failed to prepare storage slot")
        }

        const { uploadUrl, key } = await presignRes.json()

        // 2. Direct upload to R2
        const uploadRes = await fetch(uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": file.type },
          body: file,
        })

        if (!uploadRes.ok) {
          throw new Error("Failed to upload image to storage")
        }

        // 3. Trigger restoration job
        const restoreRes = await fetch("/api/restore", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            memorial_id: memorialId,
            key,
            filename: file.name,
            preserveOriginalColors,
          }),
        })

        const restoreData = await restoreRes.json()
        if (!restoreRes.ok || !restoreData.success) {
          throw new Error(restoreData?.error || "Failed to start photo restoration")
        }

        // Replace temp item with real restoration item
        setRestorations((prev) =>
          prev.map((r) =>
            r.id === tempId
              ? {
                ...r,
                id: restoreData.restorationId,
                original_image_url: key,
                originalUrl: restoreData.originalImageUrl || localPreviewUrl,
                status: "processing",
              }
              : r
          )
        )
      } catch (uploadErr: any) {
        console.error("Restoration submission failed:", uploadErr)
        toast.error(uploadErr.message || "Failed to submit photo for restoration")
        setRestorations((prev) => prev.filter((r) => r.id !== tempId))
      }
    }

    setUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  // Add restored photo directly to memorial gallery
  const handleAddToGallery = async (item: RestorationItem) => {
    if (!item.restored_image_url) return
    setAddingToGalleryId(item.id)

    try {
      const res = await fetch(`/api/memorials/${memorialId}/media`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source_restoration_id: item.id,
          media_type: "image",
          caption: "Restored photograph",
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Failed to add photo to gallery")
      }

      // Notify parent gallery state
      onAddMedia(data.mediaItem as unknown as EditorMediaItem)
      toast.success("Restored photograph added to gallery")
    } catch (err: any) {
      toast.error(err.message || "Could not add to gallery")
    } finally {
      setAddingToGalleryId(null)
    }
  }

  // Delete restoration
  const handleDeleteRestoration = async () => {
    if (!itemToDelete) return
    setDeletingId(itemToDelete.id)

    try {
      const res = await fetch(`/api/memorials/${memorialId}/restorations?restorationId=${itemToDelete.id}`, {
        method: "DELETE",
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete restoration")
      }

      setRestorations((prev) => prev.filter((r) => r.id !== itemToDelete.id))
      toast.success("Restoration deleted")
    } catch (err: any) {
      toast.error(err.message || "Failed to delete restoration")
    } finally {
      setDeletingId(null)
      setItemToDelete(null)
    }
  }

  // Download full-resolution restored photo
  const handleDownload = (restorationId: string) => {
    window.open(`/api/restorations/${restorationId}/download`, "_blank")
  }

  // ---------------------------------------------------------------------------
  // 1. FREE TIER LOCKED VIEW
  // ---------------------------------------------------------------------------
  if (!isPaid) {
    return (
      <div className="flex flex-col gap-6 max-w-3xl">
        <div>
          <h2 className="text-lg sm:text-xl font-medium text-[#181925]">
            Restore old photos
          </h2>
          <p className="text-xs sm:text-sm text-[#71717a] mt-1">
            Repair faded, scratched or damaged photographs before adding them to the memorial.
          </p>
        </div>

        {/* Editorial Locked Card */}
        <div className="rounded-2xl border border-black/[0.08] bg-white p-6 sm:p-8 flex flex-col gap-6 font-sans">
          <div className="flex items-center justify-between gap-4 border-b border-black/[0.06] pb-4">
            <div className="flex items-center gap-2.5">
              <div className="size-8 rounded-full bg-[#305dde]/10 flex items-center justify-center text-[#305dde]">
                <Sparkles className="size-4" />
              </div>
              <span className="text-xs font-mono uppercase tracking-wider text-[#305dde] font-semibold">
                Theirs Complete
              </span>
            </div>
            <span className="text-xs text-[#71717a] font-mono">5 restorations included</span>
          </div>

          <div className="space-y-2">
            <h3 className="text-base sm:text-lg font-semibold text-[#181925] tracking-tight">
              Restore faded, scratched or damaged family photographs.
            </h3>
            <p className="text-xs sm:text-sm text-[#71717a] leading-relaxed max-w-xl">
              Bring historical, sepia, or damaged family photographs back to lifelike clarity.
              Every Theirs Complete memorial includes 5 full-resolution photograph restorations with
              before-and-after comparison and direct gallery integration.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-black/[0.05]">
            <div className="flex items-center gap-2 text-xs text-[#888]">
              <Shield className="size-3.5 text-emerald-600 shrink-0" />
              <span>Preserves high-resolution originals · Zero credit packs or subscription lock-in</span>
            </div>
            <button
              type="button"
              onClick={onUpgrade}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#305dde] hover:bg-[#254cb8] text-white text-xs font-medium transition-colors shadow-xs cursor-pointer shrink-0"
            >
              <span>Upgrade to Theirs Complete ($179)</span>
              <ArrowRight className="size-3.5" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ---------------------------------------------------------------------------
  // 2. COMPLETE TIER ACTIVE RESTORATION STUDIO
  // ---------------------------------------------------------------------------
  const completedRestorations = restorations.filter((r) => r.status === "completed")
  const processingRestorations = restorations.filter((r) => r.status === "processing" || r.status === "pending")
  const failedRestorations = restorations.filter((r) => r.status === "failed")

  return (
    <div className="flex flex-col gap-6">
      {/* Header & Quota Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h2 className="text-lg sm:text-xl font-medium text-[#181925]">
            Restore old photos
          </h2>
          <p className="text-xs sm:text-sm text-[#71717a] mt-0.5">
            Repair faded, scratched or damaged photographs before adding them to the memorial.
          </p>
        </div>

        {/* Quota Badge */}
        <div className="shrink-0">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${isQuotaReached
              ? "bg-rose-50 text-rose-800 border-rose-200"
              : "bg-emerald-50 text-emerald-800 border-emerald-200"
              }`}
          >
            <Sparkles className="size-3" />
            <span>{completedCount} of {MAX_RESTORATIONS_LIMIT} restorations used</span>
          </span>
        </div>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-rose-50 text-rose-800 text-xs border border-rose-200">
          <AlertCircle className="size-4 shrink-0 text-rose-600" />
          <span className="flex-1">{errorMessage}</span>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-rose-600 hover:text-rose-800 cursor-pointer"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}

      {/* Upload Dropzone (if quota not exhausted) */}
      {!isQuotaReached ? (
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setDragActive(true)
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragActive(false)
            if (e.dataTransfer.files) void handleUploadFiles(e.dataTransfer.files)
          }}
          className={`relative rounded-3xl border-2 border-dashed p-6 sm:p-8 flex flex-col items-center justify-center text-center transition-all ${dragActive
            ? "border-primary bg-primary/[0.04]"
            : "border-black/[0.12] bg-neutral-50/60 hover:bg-neutral-50"
            }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files) void handleUploadFiles(e.target.files)
            }}
          />

          <div className="size-12 rounded-full bg-black/[0.04] flex items-center justify-center text-[#181925] mb-3">
            {uploading ? (
              <Loader2 className="size-6 animate-spin text-primary" />
            ) : (
              <Upload className="size-6 text-[#71717a]" />
            )}
          </div>

          <h3 className="text-sm font-medium text-[#181925]">
            {uploading ? "Preparing restoration..." : "Drop damaged or vintage photographs here"}
          </h3>
          <p className="text-xs text-[#71717a] mt-1 max-w-sm">
            Drag and drop JPEG, PNG, or WebP files up to 15MB, or browse from your computer.
          </p>

          <div className="flex items-center gap-4 mt-4 flex-wrap justify-center">
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 rounded-full bg-[#181925] hover:bg-black text-white text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
            >
              Choose photograph
            </button>

            {/* Preserve original colors toggle */}
            <label className="flex items-center gap-2 text-xs text-[#71717a] cursor-pointer select-none">
              <input
                type="checkbox"
                checked={preserveOriginalColors}
                onChange={(e) => setPreserveOriginalColors(e.target.checked)}
                className="rounded border-black/20 text-[#181925] focus:ring-black/10 cursor-pointer"
              />
              <span>Preserve original black & white / sepia tones</span>
            </label>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-neutral-100/80 border border-black/[0.06] text-xs text-[#71717a] flex items-center gap-2.5">
          <Check className="size-4 text-emerald-600 shrink-0" />
          <span>All 5 photo restorations included with Theirs Complete have been used for this memorial.</span>
        </div>
      )}

      {/* Active Processing Jobs */}
      {processingRestorations.length > 0 && (
        <div className="flex flex-col gap-3">
          <h3 className="text-xs font-mono uppercase tracking-wider text-[#71717a] font-semibold">
            In Progress ({processingRestorations.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {processingRestorations.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3.5 p-3.5 rounded-2xl border border-black/[0.06] bg-white shadow-xs"
              >
                <div className="relative size-14 rounded-xl overflow-hidden bg-neutral-100 shrink-0 border border-black/[0.05]">
                  {(item.originalUrl || item.localPreviewUrl) && (
                    <img
                      src={item.originalUrl || item.localPreviewUrl}
                      alt="Restoring"
                      className="size-full object-cover"
                    />
                  )}
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <Loader2 className="size-5 text-white animate-spin" />
                  </div>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-medium text-[#181925] truncate">
                    Restoring photograph...
                  </span>
                  <span className="text-[11px] text-[#71717a] mt-0.5">
                    Faithfully repairing details (~20s)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Failed Jobs Notice (if any) */}
      {failedRestorations.length > 0 && (
        <div className="flex flex-col gap-2">
          {failedRestorations.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-amber-50 text-amber-900 text-xs border border-amber-200"
            >
              <div className="flex items-center gap-2 min-w-0">
                <AlertCircle className="size-4 text-amber-700 shrink-0" />
                <span className="truncate">
                  {item.error_message || "A photograph could not be restored. Your restoration slot was not consumed."}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setRestorations((prev) => prev.filter((r) => r.id !== item.id))}
                className="text-amber-700 hover:text-amber-900 text-xs font-medium cursor-pointer shrink-0"
              >
                Dismiss
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Completed Restoration Library */}
      <div className="flex flex-col gap-3 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono uppercase tracking-wider text-[#71717a] font-semibold">
            Restored Photographs ({completedRestorations.length})
          </h3>
        </div>

        {loading ? (
          <div className="py-12 flex items-center justify-center text-neutral-400 text-xs gap-2">
            <Loader2 className="size-4 animate-spin" />
            <span>Loading restorations...</span>
          </div>
        ) : completedRestorations.length === 0 ? (
          <div className="py-12 text-center rounded-2xl border border-dashed border-black/[0.08] text-xs text-[#71717a]">
            No photographs restored yet. Drop a vintage or faded photo above to begin.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {completedRestorations.map((item) => {
              const isInGallery = galleryMap.has(item.id)
              const displayUrl = item.restoredUrl || (item.restored_image_url ? `/api/media?key=${encodeURIComponent(item.restored_image_url)}` : "")
              const originalDisplayUrl = item.originalUrl || (item.original_image_url ? `/api/media?key=${encodeURIComponent(item.original_image_url)}` : "")

              return (
                <div
                  key={item.id}
                  className="group flex flex-col rounded-2xl border border-black/[0.06] bg-white overflow-hidden shadow-xs hover:shadow-sm transition-all"
                >
                  {/* Photo Thumbnail Container */}
                  <div className="relative aspect-4/3 bg-neutral-100 overflow-hidden">
                    {displayUrl ? (
                      <img
                        src={displayUrl}
                        alt="Restored photo"
                        className="size-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                      />
                    ) : (
                      <div className="size-full flex items-center justify-center text-neutral-400 text-xs">
                        Photo preview
                      </div>
                    )}

                    {/* Status Pill Badge */}
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                      {isInGallery ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-600/90 text-white text-[11px] font-medium backdrop-blur-sm shadow-xs">
                          <Check className="size-3" /> In gallery
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/60 text-white text-[11px] font-medium backdrop-blur-sm shadow-xs">
                          Restored
                        </span>
                      )}
                    </div>

                    {/* Quick Compare Trigger on Image Hover */}
                    {originalDisplayUrl && displayUrl && (
                      <button
                        type="button"
                        onClick={() => setActiveComparison(item)}
                        className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer text-white text-xs font-medium gap-1.5"
                      >
                        <span className="px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-sm flex items-center gap-1.5">
                          <SlidersHorizontal className="size-3.5" />
                          Compare before & after
                        </span>
                      </button>
                    )}
                  </div>

                  {/* Actions Footer */}
                  <div className="p-3.5 flex flex-col gap-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[11px] text-[#71717a] font-mono">
                        {new Date(item.created_at).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>

                      {/* Delete Action (blocked if in gallery) */}
                      <button
                        type="button"
                        onClick={() => {
                          if (isInGallery) {
                            toast.error("Remove this photo from the gallery first.")
                          } else {
                            setItemToDelete(item)
                          }
                        }}
                        className="p-1 rounded-md text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title={isInGallery ? "Remove this photo from the gallery first." : "Delete restoration"}
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>

                    {/* Button Row */}
                    <div className="flex items-center gap-2 pt-1 border-t border-black/[0.04]">
                      {isInGallery ? (
                        <button
                          type="button"
                          onClick={onSwitchToGallery}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-[#181925] text-xs font-medium transition-colors cursor-pointer"
                        >
                          <Eye className="size-3 text-[#71717a]" />
                          <span>View in gallery</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={addingToGalleryId === item.id}
                          onClick={() => handleAddToGallery(item)}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#181925] hover:bg-black text-white text-xs font-medium transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
                        >
                          {addingToGalleryId === item.id ? (
                            <Loader2 className="size-3 animate-spin" />
                          ) : (
                            <Check className="size-3" />
                          )}
                          <span>Add to gallery</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleDownload(item.id)}
                        className="px-2.5 py-1.5 rounded-xl border border-black/[0.08] hover:bg-black/[0.03] text-[#181925] text-xs font-medium transition-colors cursor-pointer shrink-0"
                        title="Download full-resolution restored PNG"
                      >
                        <Download className="size-3.5" />
                      </button>

                      {originalDisplayUrl && displayUrl && (
                        <button
                          type="button"
                          onClick={() => setActiveComparison(item)}
                          className="px-2.5 py-1.5 rounded-xl border border-black/[0.08] hover:bg-black/[0.03] text-[#181925] text-xs font-medium transition-colors cursor-pointer shrink-0"
                          title="Compare before & after"
                        >
                          <SlidersHorizontal className="size-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Comparison Modal */}
      {activeComparison && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 font-sans"
          onClick={() => setActiveComparison(null)}
        >
          {/* Flat dark backdrop */}
          <div className="fixed inset-0 bg-black/40 cursor-pointer" />

          {/* Modal Container */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-4xl rounded-2xl bg-white border border-black/[0.12] shadow-sm z-10 flex flex-col overflow-hidden"
          >
            {/* Top Close Button */}
            <button
              type="button"
              onClick={() => setActiveComparison(null)}
              className="absolute right-3.5 top-3.5 size-7 rounded-full flex items-center justify-center text-[#888] hover:bg-[#f4f4f6] hover:text-[#181925] transition-colors cursor-pointer z-20"
              aria-label="Close"
            >
              <X className="size-4" />
            </button>

            {/* Modal Header */}
            <div className="px-5 pt-4 pb-3 border-b border-black/[0.05] bg-[#fafafb]">
              <div className="flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-lg bg-[#305dde]/10 text-[#305dde]">
                  <Sparkles className="size-3.5" />
                </span>
                <h2 className="text-base font-semibold text-[#181925] tracking-tight">
                  Before & after comparison
                </h2>
              </div>
              <p className="text-[12px] text-[#71717a] mt-0.5">
                Drag the center slider to inspect restored photograph detail.
              </p>
            </div>

            {/* Seamless Slider comparison component */}
            <div className="p-4 sm:p-5 bg-white flex justify-center">
              <ImageComparison
                originalUrl={
                  activeComparison.originalUrl ||
                  (activeComparison.original_image_url
                    ? `/api/media?key=${encodeURIComponent(activeComparison.original_image_url)}`
                    : "")
                }
                restoredUrl={
                  activeComparison.restoredUrl ||
                  (activeComparison.restored_image_url
                    ? `/api/media?key=${encodeURIComponent(activeComparison.restored_image_url)}`
                    : "")
                }
                showStartOver={false}
                beforeLabel="Original"
                afterLabel="Restored"
                hideControls={true}
                hideCard={true}
                onStartOver={() => setActiveComparison(null)}
                onDownload={() => handleDownload(activeComparison.id)}
              />
            </div>

            {/* Modal Actions */}
            <div className="px-5 py-3 border-t border-black/[0.06] bg-[#fafafb] flex items-center justify-between text-xs">
              <span className="text-[11px] text-[#71717a] hidden sm:inline">
                Original full-resolution photograph preserved
              </span>
              <div className="flex items-center gap-2 ml-auto">
                {!galleryMap.has(activeComparison.id) && (
                  <button
                    type="button"
                    disabled={addingToGalleryId === activeComparison.id}
                    onClick={async () => {
                      await handleAddToGallery(activeComparison)
                    }}
                    className="px-4 py-2 rounded-full border border-black/[0.08] bg-white hover:bg-neutral-50 text-[#181925] text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {addingToGalleryId === activeComparison.id ? "Adding to gallery..." : "Add to gallery"}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleDownload(activeComparison.id)}
                  className="inline-flex items-center gap-1.5 px-4.5 py-2 rounded-full bg-[#305dde] hover:bg-[#254cb8] text-white text-xs font-medium transition-colors cursor-pointer shadow-xs"
                >
                  <Download className="size-3.5" />
                  <span>Download photo</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Deletion Modal */}
      {itemToDelete && (
        <ConfirmDeleteModal
          isOpen={true}
          title="Delete photograph restoration?"
          description="This will permanently delete the restored photograph and its original upload from storage. This action cannot be undone."
          confirmLabel={deletingId ? "Deleting..." : "Delete restoration"}
          isDeleting={Boolean(deletingId)}
          onConfirm={handleDeleteRestoration}
          onClose={() => setItemToDelete(null)}
        />
      )}
    </div>
  )
}
