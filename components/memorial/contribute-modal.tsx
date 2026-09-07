"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  X,
  CheckCircle2,
  Heart,
  Loader2,
  BookOpen,
  Camera,
  Mic,
  ArrowLeft,
  Trash2,
  AlertCircle,
  Sparkles,
  Film,
} from "lucide-react"
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile"
import {
  BotanicalFlowerEmblem,
  CandleFlameEmblem,
  QuillFeatherEmblem,
} from "./tribute-emblems"
import { saveLocalReceipt } from "@/lib/memorial/optimistic-receipts"
import type { ContributionSettings } from "@/types/theirs"
import { useContributionDraft } from "@/hooks/use-contribution-draft"
import { TEXT_LIMITS } from "@/lib/validation/text-limits"
import type { MemorialAccessRole } from "@/lib/memorial-auth"
import { useResumableMediaUpload } from "@/hooks/use-resumable-media-upload"
import { MediaUploadList } from "@/components/uploads/media-upload-list"
import { parseYouTubeUrl } from "@/lib/uploads/youtube"
import { resolveMediaCapabilities } from "@/lib/uploads/capabilities"
import { detectMediaType, mediaAcceptAttribute, resolveMediaMime } from "@/lib/uploads/constants"

export type ContributionType = "tribute" | "memory" | "photo" | "voice" | "video" | "message"
export type TributeRitual = "flower" | "candle" | "note"

type SubmissionResult = {
  status: "approved" | "pending_approval"
}

interface ContributeModalProps {
  isOpen: boolean
  onClose: () => void
  memorialName: string
  slug: string
  memorialId?: string
  isPaid?: boolean
  accessRole?: MemorialAccessRole | null
  currentUserId?: string | null
  photoCount?: number
  contributionSettings?: ContributionSettings | null
  initialType?: ContributionType | null
  initialPhotoUrl?: string | null
  initialPhotoTitle?: string | null
  initialMediaId?: string | null
  onSubmitted?: () => void
}

export function ContributeModal({
  isOpen,
  onClose,
  memorialName,
  slug,
  memorialId,
  isPaid = false,
  accessRole = null,
  currentUserId = null,
  photoCount,
  contributionSettings,
  initialType = null,
  initialPhotoUrl = null,
  initialPhotoTitle = null,
  initialMediaId = null,
  onSubmitted,
}: ContributeModalProps) {
  const isAuthenticatedMember = Boolean(accessRole && currentUserId)
  const [selectedType, setSelectedType] = useState<ContributionType | null>(initialType)
  const [tributeRitual, setTributeRitual] = useState<TributeRitual>("flower")
  const [authorName, setAuthorName] = useState("")
  const [relationship, setRelationship] = useState("")
  const [content, setContent] = useState("")
  const [extraField, setExtraField] = useState("") // approx year
  const [location, setLocation] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submissionResult, setSubmissionResult] = useState<SubmissionResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Cloudflare Turnstile state
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ""
  const [turnstileToken, setTurnstileToken] = useState("")
  const turnstileRef = useRef<TurnstileInstance>(null)

  const resetTurnstile = () => {
    setTurnstileToken("")
    turnstileRef.current?.reset()
  }

  // Media upload state
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const memoryPhotoInputRef = useRef<HTMLInputElement | null>(null)
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null)
  const [uploadedMediaRef, setUploadedMediaRef] = useState<string | null>(null)
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null)
  const [memoryPhotos, setMemoryPhotos] = useState<{ url: string; name: string; mediaRef?: string; uploadItemId?: string }[]>([])
  const [selectedExistingMediaId, setSelectedExistingMediaId] = useState<string | null>(null)
  const [uploadAuthorization, setUploadAuthorization] = useState<string | null>(null)
  const [isUploadingMedia, setIsUploadingMedia] = useState(false)
  const [mediaUploadError, setMediaUploadError] = useState<string | null>(null)
  const [youtubeUrl, setYoutubeUrl] = useState("")
  const [selectedUploadItemIds, setSelectedUploadItemIds] = useState<string[]>([])
  const memberUploads = useResumableMediaUpload({
    memorialId: memorialId || "",
    userId: currentUserId || undefined,
    purpose: "member_contribution",
    enabled: isAuthenticatedMember && Boolean(memorialId) && Boolean(currentUserId),
  })
  const selectedMemberUploads = useMemo(
    () => memberUploads.items.filter((item) =>
      selectedUploadItemIds.includes(item.id) || item.status === "preparing"
    ),
    [memberUploads.items, selectedUploadItemIds],
  )
  const selectedSessionIds = selectedMemberUploads
    .filter((item) => item.status === "complete" && item.sessionId)
    .map((item) => item.sessionId)
  const isMemberUploadBusy = selectedMemberUploads.some((item) =>
    ["preparing", "queued", "recovering", "uploading", "paused", "verifying", "finalizing"].includes(item.status)
  )
  const restoredMemoryDraftRef = useRef(false)
  const memoryDraftValue = useMemo(() => ({
    name: authorName,
    relationship,
    content,
    year: extraField,
    location,
  }), [authorName, relationship, content, extraField, location])
  const { restoredDraft: restoredMemoryDraft, clearDraft: clearMemoryDraft } = useContributionDraft({
    memorialId: memorialId || slug,
    type: "memory",
    value: memoryDraftValue,
    enabled: isOpen && selectedType === "memory" && !isSubmitted,
  })

  useEffect(() => {
    if (!restoredMemoryDraft || restoredMemoryDraftRef.current || selectedType !== "memory") return
    restoredMemoryDraftRef.current = true
    setAuthorName(restoredMemoryDraft.name || "")
    setRelationship(restoredMemoryDraft.relationship || "")
    setContent(restoredMemoryDraft.content || "")
    setExtraField(restoredMemoryDraft.year || "")
    setLocation(restoredMemoryDraft.location || "")
  }, [restoredMemoryDraft, selectedType])

  useEffect(() => {
    const completed = selectedMemberUploads.filter((item) => item.status === "complete")
    if (selectedType === "memory") {
      setMemoryPhotos((current) => [
        ...current.filter((photo) => !photo.uploadItemId),
        ...completed.map((item) => ({
          url: item.previewUrl || "",
          name: item.filename,
          uploadItemId: item.id,
        })),
      ])
      return
    }
    const first = completed[0]
    if (first) {
      setUploadedFileUrl(first.previewUrl || null)
      setUploadedFileName(first.filename)
    }
  }, [selectedMemberUploads, selectedType])

  useEffect(() => {
    if (!isOpen || !isAuthenticatedMember || !selectedType || isSubmitted) return
    const expectedMediaType = selectedType === "voice"
      ? "audio"
      : selectedType === "video"
        ? "video"
        : selectedType === "photo" || selectedType === "memory"
          ? "image"
          : null
    if (!expectedMediaType) return
    const recoverableIds = memberUploads.items
      .filter((item) => item.sessionId && item.mediaType === expectedMediaType)
      .slice(0, selectedType === "memory" ? 3 : 1)
      .map((item) => item.id)
    if (recoverableIds.length === 0) return
    setSelectedUploadItemIds((current) => selectedType === "memory"
      ? [...new Set([...current, ...recoverableIds])].slice(0, 3)
      : current.length > 0 ? current : recoverableIds)
  }, [isAuthenticatedMember, isOpen, isSubmitted, memberUploads.items, selectedType])

  const [lazyLimits, setLazyLimits] = useState<{
    photoCount: number
    canAddPhoto: boolean
    remainingPhotoSlots: number
  } | null>(null)

  useEffect(() => {
    if (!isOpen) return
    if (!isPaid && photoCount === undefined && (memorialId || slug)) {
      let isMounted = true
      fetch(`/api/memorials/${memorialId || slug}/contribution-limits`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (isMounted && data && typeof data.photo_count === "number") {
            setLazyLimits({
              photoCount: data.photo_count,
              canAddPhoto: data.can_add_photo,
              remainingPhotoSlots: data.remaining_photo_slots,
            })
          }
        })
        .catch(() => { })
      return () => {
        isMounted = false
      }
    }
  }, [isOpen, isPaid, photoCount, memorialId, slug])

  const effectivePhotoCount = lazyLimits ? lazyLimits.photoCount : photoCount
  const mediaCapabilities = useMemo(() => resolveMediaCapabilities({
    context: isAuthenticatedMember ? "member_contribution" : "guest_contribution",
    isPaid,
    accessRole,
    contributionSettings,
    existingMediaCounts: { image: effectivePhotoCount ?? null },
  }), [accessRole, contributionSettings, effectivePhotoCount, isAuthenticatedMember, isPaid])
  // Unknown Free-tier counts fail closed until contribution-limits resolves.
  const isPhotosFull = mediaCapabilities.imageQuotaReached
  const remainingNewPhotoSlots = Math.min(
    3,
    mediaCapabilities.remainingImageItems ?? (isPaid ? 3 : 0),
  )
  const newMemoryPhotoCount = memoryPhotos.filter((photo) => Boolean(photo.mediaRef)).length
  const canAddMemoryPhoto = memoryPhotos.length < 3 && newMemoryPhotoCount < remainingNewPhotoSlots
  const firstName = memorialName.split(" ")[0] || memorialName

  const allContributionsDisabled = contributionSettings?.accept_contributions === false

  const allContributionOptions = [
    {
      type: "tribute" as const,
      icon: Heart,
      title: "Leave a Tribute",
      desc: "Lay a flower, light a candle, or leave a quiet note of remembrance.",
      color: "text-[var(--theme-accent)] bg-[var(--theme-accent)]/8",
      available: !allContributionsDisabled && contributionSettings?.tributes !== false,
    },
    {
      type: "memory" as const,
      icon: BookOpen,
      title: "Share a memory",
      desc: `An anecdote, a shared story, or a reflection about ${firstName}.`,
      color: "text-[var(--theme-accent)] bg-[var(--theme-accent)]/8",
      available: !allContributionsDisabled && contributionSettings?.memories !== false,
    },
    {
      type: "photo" as const,
      icon: Camera,
      title: "Share a photograph",
      desc: "Photographs the family and friends may cherish.",
      color: "text-[var(--theme-accent)] bg-[var(--theme-accent)]/8",
      available: !allContributionsDisabled && !isPhotosFull && mediaCapabilities.nativePhoto,
    },
    {
      type: "voice" as const,
      icon: Mic,
      title: "Share a voice note",
      desc: "A voicemail or spoken story worth keeping forever.",
      color: "text-[var(--theme-accent)] bg-[var(--theme-accent)]/8",
      available: !allContributionsDisabled && mediaCapabilities.nativeAudio,
    },
    {
      type: "video" as const,
      icon: Film,
      title: "Share a video",
      desc: mediaCapabilities.nativeVideo
        ? "Paste a YouTube link, or preserve the original file from your family workspace."
        : "Paste a YouTube link to share a video with the family.",
      color: "text-[var(--theme-accent)] bg-[var(--theme-accent)]/8",
      available: !allContributionsDisabled && mediaCapabilities.youtubeVideo,
    },
  ]

  const contributionOptions = allContributionOptions.filter((opt) => opt.available)

  // Reset or initialize state whenever modal opens or initialType changes
  useEffect(() => {
    if (isOpen) {
      if (initialType) {
        const resolvedType = initialType === "message" ? "tribute" : initialType
        if (resolvedType === "photo" && isPhotosFull) {
          setSelectedType(null)
          setError("This memorial has reached its 5-photograph limit on the free plan.")
        } else {
          setSelectedType(resolvedType)
        }
      } else {
        setSelectedType(null)
      }

      if (initialPhotoUrl) {
        setMemoryPhotos([{ url: initialPhotoUrl, name: initialPhotoTitle || "Selected Photograph" }])
        setUploadedFileUrl(initialPhotoUrl)
        setUploadedMediaRef(null)
        setUploadedFileName(initialPhotoTitle || "Selected Photograph")
        setSelectedExistingMediaId(initialMediaId)
      } else {
        setMemoryPhotos([])
        setUploadedFileUrl(null)
        setUploadedMediaRef(null)
        setUploadedFileName(null)
        setSelectedExistingMediaId(null)
      }

      setUploadAuthorization(null)
      setYoutubeUrl("")
      setSelectedUploadItemIds([])
      setIsSubmitted(false)
      setSubmissionResult(null)
      setError(null)
      setMediaUploadError(null)
    }
  }, [isOpen, initialType, initialPhotoUrl, initialPhotoTitle, initialMediaId, isPaid, photoCount, isPhotosFull])

  const getUploadAuthorization = async (file: File): Promise<{
    token: string
    directUpload?: { uploadUrl: string; key: string; contentType: string }
  }> => {
    if (uploadAuthorization && selectedType !== "voice") {
      return { token: uploadAuthorization }
    }
    if (siteKey && !turnstileToken) {
      throw new Error("The security check is still loading. Please wait a moment and try again.")
    }

    const targetIdentifier = slug || memorialId
    try {
      const intentRes = await fetch(`/api/memorials/${targetIdentifier}/upload-intent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          turnstile_token: turnstileToken,
          mime_type: file.type || "application/octet-stream",
          file_size: file.size,
          contribution_type:
            selectedType === "photo" || selectedType === "voice"
              ? selectedType
              : "memory",
        }),
      })
      const intentData = await intentRes.json().catch(() => ({}))
      if (!intentRes.ok) throw new Error(intentData.error || "Failed to authorize file upload")

      setUploadAuthorization(intentData.uploadIntentToken)
      return {
        token: intentData.uploadIntentToken as string,
        directUpload: intentData.directUpload,
      }
    } finally {
      resetTurnstile()
    }
  }

  const uploadContributionFile = async (file: File) => {
    if (isAuthenticatedMember) {
      const ids = await memberUploads.addFiles([file])
      if (selectedType === "memory") setSelectedUploadItemIds((current) => [...current, ...ids])
      else setSelectedUploadItemIds(ids)
      return { previewUrl: "", mediaRef: "" }
    }
    const authorization = await getUploadAuthorization(file)
    if (authorization.directUpload) {
      const directResponse = await fetch(authorization.directUpload.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": authorization.directUpload.contentType },
        body: file,
      })
      if (!directResponse.ok) throw new Error("The direct media upload failed. Please try again.")
      const completionResponse = await fetch("/api/r2/complete-contribution-upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uploadIntentToken: authorization.token,
          key: authorization.directUpload.key,
        }),
      })
      const completionData = await completionResponse.json().catch(() => ({}))
      if (!completionResponse.ok) throw new Error(completionData.error || "The uploaded media could not be verified.")
      return completionData as { previewUrl: string; mediaRef: string }
    }
    const formData = new FormData()
    formData.append("file", file)
    formData.append("folder", "contributions")
    formData.append("memorialId", memorialId || slug)
    formData.append("uploadIntentToken", authorization.token)

    const response = await fetch("/api/r2/upload", { method: "POST", body: formData })
    const data = await response.json()
    if (!response.ok) {
      if (response.status === 403) setUploadAuthorization(null)
      throw new Error(data.error || "Failed to upload media")
    }
    return data as { previewUrl: string; mediaRef: string }
  }

  const handleFileSelect = async (file: File) => {
    if (!file) return
    const expectedMediaType = selectedType === "video" ? "video" : selectedType === "voice" ? "audio" : "image"
    if (detectMediaType(resolveMediaMime(file.type, file.name)) !== expectedMediaType) {
      setMediaUploadError(`Choose a supported ${expectedMediaType === "image" ? "photograph" : expectedMediaType} file.`)
      return
    }
    const maximumBytes = selectedType === "video"
      ? mediaCapabilities.maxVideoBytes || 0
      : selectedType === "voice"
        ? mediaCapabilities.maxAudioBytes
        : mediaCapabilities.maxImageBytes
    if (file.size < 1 || file.size > maximumBytes) {
      setMediaUploadError(`This ${selectedType === "video" ? "video" : selectedType === "voice" ? "audio file" : "photograph"} must be ${maximumBytes / 1024 / 1024}MB or smaller.`)
      return
    }
    if (selectedType === "photo" && isPhotosFull) {
      setMediaUploadError("This memorial has reached its 5-photograph limit on the free plan.")
      return
    }
    if (selectedType === "video" && !mediaCapabilities.nativeVideo) {
      setMediaUploadError("Public video contributions use a YouTube link. Raw video uploads are available only to accepted family members.")
      return
    }
    setIsUploadingMedia(!isAuthenticatedMember)
    setMediaUploadError(null)

    try {
      const data = await uploadContributionFile(file)
      if (!isAuthenticatedMember) {
        setUploadedFileUrl(data.previewUrl)
        setUploadedMediaRef(data.mediaRef)
      }
      setUploadedFileName(file.name)
    } catch (err: any) {
      console.error("Media upload error:", err)
      setMediaUploadError(err.message || "Failed to upload file. Please try again.")
    } finally {
      if (!isAuthenticatedMember) setIsUploadingMedia(false)
    }
  }

  const handleMemoryPhotoSelect = async (file: File) => {
    if (!file) return
    if (detectMediaType(resolveMediaMime(file.type, file.name)) !== "image") {
      setMediaUploadError("Choose a supported photograph file.")
      return
    }
    if (!canAddMemoryPhoto) {
      setMediaUploadError("This memorial has no remaining photograph space for this story.")
      return
    }

    setIsUploadingMedia(!isAuthenticatedMember)
    setMediaUploadError(null)

    try {
      const data = await uploadContributionFile(file)
      if (!isAuthenticatedMember) {
        setMemoryPhotos((prev) => [
          ...prev,
          { url: data.previewUrl, name: file.name, mediaRef: data.mediaRef },
        ])
      }
    } catch (err: any) {
      console.error("Photo upload error:", err)
      setMediaUploadError(err.message || "Failed to upload photo. Please try again.")
    } finally {
      if (!isAuthenticatedMember) setIsUploadingMedia(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      if (selectedType === "memory") {
        handleMemoryPhotoSelect(e.dataTransfer.files[0])
      } else {
        handleFileSelect(e.dataTransfer.files[0])
      }
    }
  }

  const isTributeMode = selectedType === "tribute" || selectedType === "message"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!authorName.trim()) return

    // For photo, voice, or video mode, if story/caption is empty, fallback to clean attribution
    let effectiveContent = content.trim()
    if (!effectiveContent) {
      if (selectedType === "photo" && uploadedFileUrl) {
        effectiveContent = `Photograph shared by ${authorName.trim()}`
      } else if (selectedType === "voice" && uploadedFileUrl) {
        effectiveContent = `Voice recording shared by ${authorName.trim()}`
      } else if (selectedType === "video" && (uploadedFileUrl || parseYouTubeUrl(youtubeUrl))) {
        effectiveContent = `Video clip shared by ${authorName.trim()}`
      }
    }

    if (!effectiveContent && (!isTributeMode || tributeRitual === "note")) return

    setIsSubmitting(true)
    setError(null)

    try {
      const targetIdentifier = memorialId || slug
      const approxYearNum = extraField ? parseInt(extraField.replace(/\D/g, ""), 10) : null

      const mediaRefs = isMedia
        ? (uploadedMediaRef ? [uploadedMediaRef] : [])
        : memoryPhotos.flatMap((photo) => photo.mediaRef ? [photo.mediaRef] : [])

      let safeTributeType: "flower" | "candle" | "note" = "note"
      if (isTributeMode) {
        safeTributeType = tributeRitual
      }

      const usesMemberUpload = isAuthenticatedMember && selectedSessionIds.length > 0
      const res = usesMemberUpload
        ? await fetch(`/api/memorials/${targetIdentifier}/uploads/sessions/${selectedSessionIds[0]}/finalize`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionIds: selectedSessionIds,
            authorName: authorName.trim(),
            authorRelationship: relationship.trim() || null,
            content: effectiveContent,
            approxYear: isNaN(approxYearNum as number) ? null : approxYearNum,
            location: location.trim() || null,
          }),
        })
        : await fetch(`/api/memorials/${targetIdentifier}/contribute`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: selectedType === "message" ? "tribute" : selectedType,
            author_name: authorName.trim(),
            author_relationship: relationship.trim() || null,
            content: effectiveContent,
            approx_year: isNaN(approxYearNum as number) ? null : approxYearNum,
            location: location.trim() || null,
            media_refs: mediaRefs,
            existing_media_id: selectedExistingMediaId,
            upload_authorization: uploadAuthorization,
            tribute_type: safeTributeType,
            turnstile_token: turnstileToken,
            external_url: selectedType === "video" ? youtubeUrl.trim() : null,
          }),
        })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        if (!uploadAuthorization) {
          resetTurnstile()
        } else if (res.status === 403) {
          setUploadAuthorization(null)
          resetTurnstile()
        }
        throw new Error(data.error || "Failed to submit contribution")
      }

      if (data.item && data.receipt_token) {
        saveLocalReceipt(slug || memorialId || "", {
          id: data.item.id,
          receipt_token: data.receipt_token,
          memorial_slug: slug,
          memorial_id: memorialId,
          author_name: data.item.author_name,
          author_relationship: data.item.author_relationship,
          story: data.item.story,
          approx_year: data.item.approx_year,
          location: data.item.location,
          photo_url: data.item.photo_url,
          photo_urls: data.item.photo_urls,
          tribute_type: data.item.tribute_type,
          contribution_type: data.item.contribution_type,
          external_provider: data.item.external_provider,
          external_id: data.item.external_id,
          external_url: data.item.external_url,
          status: data.item.status,
          created_at: data.item.created_at || new Date().toISOString(),
        })
      }

      if (usesMemberUpload) {
        await Promise.all(selectedUploadItemIds.map((id) => memberUploads.cancel(id)))
        setSelectedUploadItemIds([])
      }

      setSubmissionResult({
        status: data.status === "approved" ? "approved" : "pending_approval",
      })
      if (selectedType === "memory") clearMemoryDraft()
      setIsSubmitted(true)
      onSubmitted?.()
    } catch (err: any) {
      if (!uploadAuthorization) {
        resetTurnstile()
      }
      const userMessage =
        err.message?.includes("fetch") || err.message?.includes("Network")
          ? "Could not submit contribution. Please check your connection and try again."
          : err.message || "Could not submit contribution. Please try again."
      setError(userMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReset = () => {
    setIsSubmitted(false)
    setSubmissionResult(null)
    setSelectedType(null)
    setTributeRitual("flower")
    setAuthorName("")
    setRelationship("")
    setContent("")
    setExtraField("")
    setLocation("")
    setUploadedFileUrl(null)
    setUploadedMediaRef(null)
    setUploadedFileName(null)
    setMemoryPhotos([])
    setSelectedExistingMediaId(null)
    setUploadAuthorization(null)
    setYoutubeUrl("")
    setSelectedUploadItemIds([])
    setIsUploadingMedia(false)
    setMediaUploadError(null)
    setError(null)
    resetTurnstile()
    onClose()
  }

  const isMedia = selectedType === "photo" || selectedType === "voice" || selectedType === "video"
  const hasSecurityProof = isAuthenticatedMember || Boolean(siteKey && (turnstileToken || uploadAuthorization))
  const hasMemberMedia = selectedSessionIds.length > 0
  const hasYouTubeVideo = selectedType === "video" && Boolean(parseYouTubeUrl(youtubeUrl))

  // Determine if form is ready to submit
  const canSubmit =
    !isSubmitting &&
    !isUploadingMedia &&
    !isMemberUploadBusy &&
    hasSecurityProof &&
    Boolean(authorName.trim()) &&
    (isTributeMode
      ? tributeRitual !== "note" || Boolean(content.trim())
      : selectedType === "memory"
        ? Boolean(content.trim())
        : isMedia
          ? selectedType === "video"
            ? Boolean(uploadedMediaRef) || hasMemberMedia || hasYouTubeVideo
            : Boolean(uploadedMediaRef) || hasMemberMedia
          : Boolean(content.trim()))

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleReset}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs cursor-pointer"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-lg rounded-3xl bg-white border border-black/[0.08] p-4 sm:p-6 overflow-hidden shadow-2xl z-10 select-none max-h-[90vh] flex flex-col"
          >
            {/* Close / Back Button Bar */}
            <div className="flex items-center justify-between">
              {selectedType && !isSubmitted ? (
                <button
                  type="button"
                  onClick={() => setSelectedType(null)}
                  className="inline-flex items-center gap-1.5 text-xs text-[#71717a] hover:text-[#181925] transition-colors cursor-pointer"
                >
                  <ArrowLeft className="size-3.5" />
                  <span>Choose another</span>
                </button>
              ) : (
                <div className="inline-flex items-center gap-1.5 text-xs text-[var(--theme-accent)] font-medium">
                  <Sparkles className="size-3" />
                  <span>No account needed</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleReset}
                className="size-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-[#666] flex items-center justify-center transition-colors cursor-pointer ml-auto"
                aria-label="Close modal"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 pr-1 -mr-1">
              {/* SUCCESS CONFIRMATION */}
              {isSubmitted ? (
                <div className="py-8 flex flex-col items-center text-center gap-4">
                  <div className="size-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                    <CheckCircle2 className="size-7" />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <h3 className="text-xl font-medium text-[#181925]">
                      {submissionResult?.status === "approved"
                        ? "Your remembrance is now live."
                        : `Sent to ${firstName}’s family.`}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#666] max-w-sm leading-relaxed">
                      {submissionResult?.status === "approved"
                        ? `It has been published on ${firstName}’s memorial.`
                        : "A caretaker will review it before it appears publicly."}
                    </p>
                    <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 text-[11px] text-[#71717a] font-medium mx-auto">
                      <span className={`size-1.5 rounded-full ${submissionResult?.status === "approved" ? "bg-emerald-500" : "bg-amber-500"}`} />
                      <span>{submissionResult?.status === "approved" ? "Published" : "Waiting for approval"}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleReset}
                    className="mt-4 px-6 py-2.5 rounded-full bg-[#181925] hover:bg-black text-xs font-medium text-white transition-colors cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              ) : allContributionsDisabled ? (
                /* CONTRIBUTIONS DISABLED STATE */
                <div className="py-12 flex flex-col items-center text-center gap-3">
                  <div className="size-12 rounded-full bg-neutral-100 text-neutral-500 flex items-center justify-center">
                    <Heart className="size-5" />
                  </div>
                  <h3 className="text-lg font-medium text-[#181925]">Contributions are paused</h3>
                  <p className="text-xs text-[#666] max-w-xs leading-relaxed">
                    The family is not currently accepting public tributes or memories for {firstName}&apos;s memorial.
                  </p>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="mt-4 px-5 py-2 rounded-full bg-neutral-100 hover:bg-neutral-200 text-xs font-medium text-[#181925] transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              ) : !selectedType ? (
                /* STEP 1: CHOICE SHEET */
                <div className="flex flex-col gap-5 py-2">
                  <div className="flex flex-col gap-1">
                    <h3 className="text-xl sm:text-2xl font-medium tracking-tight text-[#181925]">
                      Remember {firstName}
                    </h3>
                    <p className="text-xs text-[#71717a]">
                      Choose how you would like to remember {firstName} with the family.
                    </p>
                  </div>

                  <div className="grid gap-2.5 pt-1">
                    {contributionOptions.map((opt) => {
                      const Icon = opt.icon
                      return (
                        <button
                          key={opt.type}
                          type="button"
                          onClick={() => {
                            if (opt.type === "memory") {
                              onClose()
                              window.location.assign(`/${slug}/memories#share-memory`)
                              return
                            }
                            setSelectedType(opt.type)
                            setUploadAuthorization(null)
                            setUploadedFileUrl(null)
                            setUploadedMediaRef(null)
                            setUploadedFileName(null)
                          }}
                          className="flex items-center gap-4 p-3.5 rounded-2xl border border-black/[0.06] bg-[#f9f9fa] hover:bg-neutral-100 hover:border-black/[0.12] transition-all text-left cursor-pointer group"
                        >
                          <div
                            className={`size-10 rounded-xl flex items-center justify-center shrink-0 ${opt.color} transition-transform group-hover:scale-105`}
                          >
                            {opt.type === "tribute" ? (
                              <BotanicalFlowerEmblem size={22} className="text-[var(--theme-accent)]" />
                            ) : (
                              <Icon className="size-5" />
                            )}
                          </div>
                          <div className="flex flex-col gap-0.5 min-w-0">
                            <span className="text-sm font-medium text-[#181925] group-hover:text-[var(--theme-accent)] transition-colors">
                              {opt.title}
                            </span>
                            <span className="text-xs text-[#71717a] leading-relaxed">
                              {opt.desc}
                            </span>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ) : (
                /* STEP 2: FOCUSED CONTRIBUTION FORMS */
                <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-2">
                  {/* Header Titles */}
                  <div className="flex flex-col gap-1">
                    <h3 className="text-lg sm:text-xl font-medium tracking-tight text-[#181925]">
                      {isTributeMode && `Leave a tribute for ${firstName}`}
                      {selectedType === "memory" && `Share a memory of ${firstName}`}
                      {selectedType === "photo" && `Share a photograph of ${firstName}`}
                      {selectedType === "voice" && `Share a voice recording of ${firstName}`}
                      {selectedType === "video" && `Share a video clip of ${firstName}`}
                    </h3>
                    <p className="text-xs text-[#71717a]">
                      {isTributeMode && "Choose a gesture and leave your words of remembrance."}
                      {selectedType === "memory" && "Tell an anecdote, a story, or a quiet reflection."}
                      {selectedType === "photo" && "Upload original photographs to preserve in the family archive."}
                      {selectedType === "voice" && "Upload an audio file or voice memo from your phone."}
                      {selectedType === "video" && (mediaCapabilities.nativeVideo
                        ? "Share a YouTube link, or upload an original family video from your workspace."
                        : "Paste a YouTube link to share a video with the family.")}
                    </p>
                  </div>

                  {/* ========================================================= */}
                  {/* 1. TRIBUTE MODE: Linocut Ritual Emblems (Pure ritual offering) */}
                  {/* ========================================================= */}
                  {isTributeMode && (
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-mono text-[#71717a] uppercase tracking-wider">
                        Choose a gesture
                      </label>
                      <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
                        <button
                          type="button"
                          onClick={() => setTributeRitual("flower")}
                          className={`flex flex-col items-center justify-center py-3 px-2 rounded-2xl border transition-all cursor-pointer text-center ${tributeRitual === "flower"
                            ? "bg-[var(--theme-accent)]/8 border-[var(--theme-accent)] text-[var(--theme-accent)] ring-1 ring-[var(--theme-accent)]/30 shadow-2xs"
                            : "bg-[#f7f7f8] border-black/[0.06] text-[#666] hover:bg-neutral-100 hover:text-[#181925]"
                            }`}
                        >
                          <BotanicalFlowerEmblem size={26} className="shrink-0 mb-1" />
                          <span className="text-xs font-medium">Lay a Flower</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setTributeRitual("candle")}
                          className={`flex flex-col items-center justify-center py-3 px-2 rounded-2xl border transition-all cursor-pointer text-center ${tributeRitual === "candle"
                            ? "bg-[var(--theme-accent)]/8 border-[var(--theme-accent)] text-[var(--theme-accent)] ring-1 ring-[var(--theme-accent)]/30 shadow-2xs"
                            : "bg-[#f7f7f8] border-black/[0.06] text-[#666] hover:bg-neutral-100 hover:text-[#181925]"
                            }`}
                        >
                          <CandleFlameEmblem size={26} className="shrink-0 mb-1" />
                          <span className="text-xs font-medium">Light a Candle</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setTributeRitual("note")}
                          className={`flex flex-col items-center justify-center py-3 px-2 rounded-2xl border transition-all cursor-pointer text-center ${tributeRitual === "note"
                            ? "bg-[var(--theme-accent)]/8 border-[var(--theme-accent)] text-[var(--theme-accent)] ring-1 ring-[var(--theme-accent)]/30 shadow-2xs"
                            : "bg-[#f7f7f8] border-black/[0.06] text-[#666] hover:bg-neutral-100 hover:text-[#181925]"
                            }`}
                        >
                          <QuillFeatherEmblem size={26} className="shrink-0 mb-1" />
                          <span className="text-xs font-medium">Leave a Note</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Author Name & Relationship */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-mono text-[#71717a] uppercase tracking-wider">
                        Your name *
                      </label>
                      <input
                        type="text"
                        required
                        value={authorName}
                        onChange={(e) => setAuthorName(e.target.value)}
                        maxLength={TEXT_LIMITS.contributorName}
                        placeholder="e.g. David Miller"
                        className="w-full px-3 py-2 rounded-xl bg-[#f7f7f8] border border-black/[0.08] text-sm text-[#181925] placeholder:text-[#aaa] outline-none focus:border-[var(--theme-accent)]/60 focus:ring-1 focus:ring-[var(--theme-accent)]/20 transition-colors"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-mono text-[#71717a] uppercase tracking-wider">
                        Relationship to {firstName}
                      </label>
                      <input
                        type="text"
                        value={relationship}
                        onChange={(e) => setRelationship(e.target.value)}
                        maxLength={TEXT_LIMITS.relationship}
                        placeholder="e.g. Daughter, Old neighbour, Colleague"
                        className="w-full px-3 py-2 rounded-xl bg-[#f7f7f8] border border-black/[0.08] text-sm text-[#181925] placeholder:text-[#aaa] outline-none focus:border-[var(--theme-accent)]/60 focus:ring-1 focus:ring-[var(--theme-accent)]/20 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Optional year for memories and photographs. */}
                  {(selectedType === "memory" || selectedType === "photo") && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div className="flex flex-col gap-1">
                        <label className="text-[11px] font-mono text-[#71717a] uppercase tracking-wider">
                          Year / Approx Date (optional)
                        </label>
                        <input
                          type="text"
                          value={extraField}
                          onChange={(e) => setExtraField(e.target.value)}
                          maxLength={20}
                          placeholder="e.g. 1984 or Summer 1992"
                          className="w-full px-3 py-2 rounded-xl bg-[#f7f7f8] border border-black/[0.08] text-sm text-[#181925] placeholder:text-[#aaa] outline-none focus:border-[var(--theme-accent)]/60 focus:ring-1 focus:ring-[var(--theme-accent)]/20 transition-colors"
                        />
                      </div>
                      {selectedType === "memory" && (
                        <div className="flex flex-col gap-1">
                          <label className="text-[11px] font-mono text-[#71717a] uppercase tracking-wider">
                            Location (optional)
                          </label>
                          <input
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            maxLength={TEXT_LIMITS.location}
                            placeholder="e.g. Grandma’s kitchen"
                            className="w-full px-3 py-2 rounded-xl bg-[#f7f7f8] border border-black/[0.08] text-sm text-[#181925] placeholder:text-[#aaa] outline-none focus:border-[var(--theme-accent)]/60 focus:ring-1 focus:ring-[var(--theme-accent)]/20 transition-colors"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* ========================================================= */}
                  {/* 2. MEDIA DROPZONE FOR PHOTO, VOICE, OR VIDEO              */}
                  {/* ========================================================= */}
                  {(selectedType === "photo" || selectedType === "voice" || selectedType === "video") && (
                    <div className="flex flex-col gap-2">
                      {selectedType === "video" && (
                        <div className="flex flex-col gap-1.5 rounded-2xl border border-black/[0.08] bg-[#faf9f8] p-3.5">
                          <label className="text-[11px] font-mono uppercase tracking-wider text-[#71717a]">
                            YouTube link
                          </label>
                          <input
                            type="url"
                            value={youtubeUrl}
                            onChange={(event) => setYoutubeUrl(event.target.value)}
                            placeholder="https://youtube.com/watch?v=..."
                            className="w-full rounded-xl border border-black/[0.08] bg-white px-3 py-2 text-sm text-[#181925] outline-none placeholder:text-[#aaa] focus:border-[var(--theme-accent)]/60 focus:ring-1 focus:ring-[var(--theme-accent)]/20 transition-colors"
                          />
                          <span className="text-[10px] leading-relaxed text-[#71717a]">
                            Paste a YouTube link to share a video with the family. The video remains hosted by YouTube.
                          </span>
                        </div>
                      )}

                      {(selectedType !== "video" || mediaCapabilities.nativeVideo) && <>
                        {selectedType === "video" && (
                          <div className="flex items-center gap-2 py-1 text-[11px] font-medium text-[#71717a] before:h-px before:flex-1 before:bg-black/[0.08] after:h-px after:flex-1 after:bg-black/[0.08]">
                            Have the original file?
                          </div>
                        )}
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept={
                            isAuthenticatedMember && selectedType === "video"
                              ? mediaAcceptAttribute("video")
                              : isAuthenticatedMember && selectedType === "voice"
                                ? mediaAcceptAttribute("audio")
                                : isAuthenticatedMember
                                  ? mediaAcceptAttribute("image")
                                  : selectedType === "video"
                                    ? "video/mp4,video/webm,video/quicktime,.mov"
                                    : selectedType === "voice"
                                      ? "audio/mpeg,audio/wav,audio/ogg,audio/mp4,audio/m4a,.mp3,.wav,.ogg,.m4a"
                                      : "image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif"
                          }
                          className="hidden"
                          disabled={isUploadingMedia || isMemberUploadBusy}
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              handleFileSelect(e.target.files[0])
                            }
                          }}
                        />

                        {uploadedFileUrl ? (
                          <div className="relative rounded-2xl border border-black/[0.1] bg-[#fafafb] p-3 flex items-center gap-3">
                            {selectedType === "photo" ? (
                              <div className="size-16 rounded-xl overflow-hidden bg-neutral-100 shrink-0 border border-black/[0.08]">
                                <img src={uploadedFileUrl} alt="Preview" className="size-full object-cover" />
                              </div>
                            ) : selectedType === "video" ? (
                              <video
                                src={uploadedFileUrl}
                                controls
                                preload="metadata"
                                className="h-20 w-32 rounded-xl bg-black object-contain shrink-0 border border-black/[0.08]"
                              />
                            ) : (
                              <audio src={uploadedFileUrl} controls preload="metadata" className="h-10 max-w-52 shrink-0" />
                            )}
                            <div className="flex flex-col min-w-0 flex-1">
                              <span className="text-xs font-medium text-[#181925] truncate">
                                {uploadedFileName || "Uploaded file"}
                              </span>
                              <span className="text-[11px] text-emerald-600 font-medium inline-flex items-center gap-1">
                                <CheckCircle2 className="size-3" /> Ready to submit
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                selectedUploadItemIds.forEach((id) => void memberUploads.cancel(id))
                                setSelectedUploadItemIds([])
                                setUploadedFileUrl(null)
                                setUploadedMediaRef(null)
                                setUploadedFileName(null)
                                if (fileInputRef.current) fileInputRef.current.value = ""
                              }}
                              className="size-8 rounded-full hover:bg-rose-50 text-neutral-400 hover:text-rose-600 flex items-center justify-center transition-colors cursor-pointer"
                              title="Remove attachment"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </div>
                        ) : isUploadingMedia ? (
                          <div className="border-2 border-dashed border-[var(--theme-accent)]/40 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 bg-[var(--theme-accent)]/5 text-center">
                            <Loader2 className="size-6 animate-spin text-[var(--theme-accent)]" />
                            <span className="text-xs font-medium text-[#181925]">Uploading original file...</span>
                            <span className="text-[10px] text-[#71717a]">Preserving untouched archival quality</span>
                          </div>
                        ) : (
                          <div
                            onClick={() => fileInputRef.current?.click()}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={handleDrop}
                            className="border-2 border-dashed border-black/[0.08] hover:border-[var(--theme-accent)]/40 rounded-2xl p-5 flex flex-col items-center justify-center gap-2 bg-[#faf9f8] cursor-pointer transition-colors text-center group"
                          >
                            <div className="size-10 rounded-full bg-white flex items-center justify-center shadow-xs border border-black/[0.06] group-hover:scale-105 transition-transform">
                              {selectedType === "photo" ? (
                                <Camera className="size-4 text-[var(--theme-accent)]" />
                              ) : selectedType === "video" ? (
                                <Film className="size-4 text-[var(--theme-accent)]" />
                              ) : (
                                <Mic className="size-4 text-[var(--theme-accent)]" />
                              )}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-medium text-[#181925] group-hover:text-[var(--theme-accent)] transition-colors">
                                {selectedType === "photo"
                                  ? "Choose or drop a photograph"
                                  : selectedType === "video"
                                    ? "Choose or drop a video clip"
                                    : "Choose or drop an audio file"}
                              </span>
                              <span className="text-[10px] text-[#71717a]">
                                {selectedType === "photo"
                                  ? "JPEG, PNG, WebP, or HEIC · up to 15MB"
                                  : selectedType === "video"
                                    ? "MP4, WebM, or MOV · up to 100MB"
                                    : `MP3, WAV, OGG, or M4A · up to ${Math.floor(mediaCapabilities.maxAudioBytes / 1024 / 1024)}MB`}
                              </span>
                            </div>
                          </div>
                        )}
                      </>}

                      {isAuthenticatedMember && selectedMemberUploads.length > 0 && (
                        <MediaUploadList
                          items={selectedMemberUploads}
                          online={memberUploads.isOnline}
                          onRetry={(id) => void memberUploads.retry(id)}
                          onCancel={(id) => {
                            void memberUploads.cancel(id)
                            setSelectedUploadItemIds((current) => current.filter((value) => value !== id))
                          }}
                          onChooseFiles={(files) => void memberUploads.addFiles(files).then(setSelectedUploadItemIds)}
                        />
                      )}

                      {mediaUploadError && (
                        <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                          <AlertCircle className="size-3.5 shrink-0" />
                          <span>{mediaUploadError}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ========================================================= */}
                  {/* 3. MAIN CONTENT TEXTAREA                                  */}
                  {/* ========================================================= */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-mono text-[#71717a] uppercase tracking-wider">
                      {isTributeMode
                        ? tributeRitual === "flower"
                          ? "Words to accompany your flower *"
                          : tributeRitual === "candle"
                            ? "Words to accompany your candle *"
                            : "Words of remembrance *"
                        : selectedType === "memory"
                          ? "The story or reflection *"
                          : selectedType === "photo"
                            ? "Caption or story behind this photo (optional)"
                            : selectedType === "voice"
                              ? "Note or context (optional)"
                              : selectedType === "video"
                                ? "Caption or story behind this video (optional)"
                                : "Words of remembrance *"}
                    </label>
                    <textarea
                      required={
                        selectedType === "memory" ||
                        (isTributeMode && tributeRitual === "note")
                      }
                      rows={isTributeMode || selectedType === "memory" ? 4 : 3}
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      maxLength={
                        selectedType === "memory"
                          ? TEXT_LIMITS.memory
                          : isTributeMode
                            ? TEXT_LIMITS.tribute
                            : TEXT_LIMITS.photoCaption
                      }
                      placeholder={
                        isTributeMode
                          ? tributeRitual === "flower"
                            ? `“A flower in memory of ${firstName}, remembered with love and peace.”`
                            : tributeRitual === "candle"
                              ? `“A candle lit for ${firstName}, whose light will never go out.”`
                              : `“A quiet note of remembrance, prayer, or thoughts for the family...”`
                          : selectedType === "photo"
                            ? "Where was this taken? Tell us what was happening in this moment (optional)..."
                            : selectedType === "voice"
                              ? "Tell us when or where this was recorded (optional)..."
                              : selectedType === "video"
                                ? "Where was this recorded? Tell us what was happening in this moment (optional)..."
                                : `“I remember when ${firstName} spent half of Christmas Day fixing the neighbour’s washer...”`
                      }
                      className="w-full px-3 py-2.5 rounded-xl bg-[#f7f7f8] border border-black/[0.08] text-sm text-[#181925] placeholder:text-[#aaa] outline-none focus:border-[var(--theme-accent)]/60 focus:ring-1 focus:ring-[var(--theme-accent)]/20 transition-colors resize-none leading-relaxed"
                    />
                  </div>

                  {/* ========================================================= */}
                  {/* 4. OPTIONAL PHOTO ATTACHMENTS (UP TO 3) FOR MEMORY / STORY */}
                  {/* ========================================================= */}
                  {selectedType === "memory" && (!isPhotosFull || memoryPhotos.length > 0) && (
                    <div className="flex flex-col gap-2 pt-0.5">
                      <input
                        ref={memoryPhotoInputRef}
                        type="file"
                        accept={isAuthenticatedMember
                          ? mediaAcceptAttribute("image")
                          : "image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif"}
                        className="hidden"
                        disabled={isUploadingMedia}
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            handleMemoryPhotoSelect(e.target.files[0])
                          }
                          e.target.value = ""
                        }}
                      />

                      {isAuthenticatedMember && selectedMemberUploads.some((item) => item.status !== "complete") && (
                        <MediaUploadList
                          items={selectedMemberUploads.filter((item) => item.status !== "complete")}
                          online={memberUploads.isOnline}
                          onRetry={(id) => void memberUploads.retry(id)}
                          onCancel={(id) => {
                            void memberUploads.cancel(id)
                            setSelectedUploadItemIds((current) => current.filter((value) => value !== id))
                          }}
                          onChooseFiles={(files) => void memberUploads.addFiles(files).then((ids) => {
                            setSelectedUploadItemIds((current) => [...new Set([...current, ...ids])])
                          })}
                        />
                      )}

                      {memoryPhotos.length > 0 ? (
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-mono uppercase text-[#71717a]">
                              Attached Photos ({memoryPhotos.length}/3)
                            </span>
                            {canAddMemoryPhoto && (
                              <button
                                type="button"
                                disabled={isUploadingMedia}
                                onClick={() => memoryPhotoInputRef.current?.click()}
                                className="text-xs text-[var(--theme-accent)] font-medium hover:underline cursor-pointer disabled:opacity-50"
                              >
                                + Add another photo
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-3 gap-2">
                            {memoryPhotos.map((p, idx) => (
                              <div
                                key={p.uploadItemId || p.mediaRef || `${p.name}-${idx}`}
                                className="relative rounded-xl overflow-hidden aspect-4/3 bg-neutral-100 border border-black/[0.08] group"
                              >
                                <img src={p.url} alt="Attached photo" className="size-full object-cover" />
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (p.uploadItemId) {
                                      void memberUploads.cancel(p.uploadItemId)
                                      setSelectedUploadItemIds((current) => current.filter((id) => id !== p.uploadItemId))
                                    } else if (!p.mediaRef) {
                                      setSelectedExistingMediaId(null)
                                    }
                                    setMemoryPhotos(memoryPhotos.filter((_, i) => i !== idx))
                                  }}
                                  className="absolute top-1 right-1 size-6 rounded-full bg-black/60 hover:bg-rose-600 text-white flex items-center justify-center transition-colors cursor-pointer shadow-xs"
                                  title="Remove photo"
                                >
                                  <X className="size-3" />
                                </button>
                              </div>
                            ))}
                            {canAddMemoryPhoto && (
                              <button
                                type="button"
                                disabled={isUploadingMedia}
                                onClick={() => memoryPhotoInputRef.current?.click()}
                                className="rounded-xl border border-dashed border-black/[0.15] hover:border-[var(--theme-accent)]/50 aspect-4/3 flex flex-col items-center justify-center gap-1 bg-[#fafafb] hover:bg-white text-[#71717a] hover:text-[var(--theme-accent)] transition-all cursor-pointer text-center p-2"
                              >
                                <Camera className="size-4 text-[var(--theme-accent)]" />
                                <span className="text-[10px] font-medium">+ Add photo</span>
                              </button>
                            )}
                          </div>
                        </div>
                      ) : isUploadingMedia ? (
                        <div className="border border-dashed border-[var(--theme-accent)]/40 rounded-2xl p-3 flex items-center justify-center gap-2 bg-[var(--theme-accent)]/5 text-center">
                          <Loader2 className="size-4 animate-spin text-[var(--theme-accent)]" />
                          <span className="text-xs font-medium text-[#181925]">Uploading photograph...</span>
                        </div>
                      ) : !isPhotosFull ? (
                        <button
                          type="button"
                          onClick={() => memoryPhotoInputRef.current?.click()}
                          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-dashed border-black/[0.12] bg-[#f7f7f8] hover:bg-neutral-100 hover:border-black/[0.2] text-xs font-medium text-[#666] hover:text-[#181925] transition-all cursor-pointer self-start"
                        >
                          <Camera className="size-3.5 text-[var(--theme-accent)]" />
                          <span>
                            {remainingNewPhotoSlots === 1
                              ? "Attach a photograph"
                              : `Attach photographs (up to ${Math.min(3, remainingNewPhotoSlots)} photos)`}
                          </span>
                        </button>
                      ) : null}

                      {mediaUploadError && (
                        <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                          <AlertCircle className="size-3.5 shrink-0" />
                          <span>{mediaUploadError}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {error && (
                    <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium flex items-center gap-2">
                      <AlertCircle className="size-3.5 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  {isAuthenticatedMember ? (
                    <p className="p-1.5 text-xs text-emerald-800">
                      * Signed in as an family member.
                    </p>
                  ) : siteKey ? (
                    <div className="flex justify-center empty:hidden">
                      <Turnstile
                        ref={turnstileRef}
                        siteKey={siteKey}
                        options={{
                          appearance: "interaction-only",
                          refreshExpired: "auto",
                          action: "contribution",
                        }}
                        onSuccess={setTurnstileToken}
                        onExpire={resetTurnstile}
                        onError={() => setTurnstileToken("")}
                      />
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
                      Contributions are temporarily unavailable while the security check is being configured.
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="pt-2 flex items-center justify-end gap-2.5">
                    <button
                      type="button"
                      onClick={() => setSelectedType(null)}
                      className="px-4 py-2 rounded-full text-xs font-medium text-[#666] hover:bg-neutral-100 transition-colors cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={!canSubmit}
                      className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap !rounded-full font-medium transition-all cursor-pointer bg-[var(--theme-accent)] text-[var(--theme-accent-foreground)] shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_4px_16px_rgba(0,0,0,0.1)] transform-gpu hover:brightness-105 active:scale-[0.98] h-9 px-5 text-xs select-none disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="size-3.5 animate-spin" />
                          <span>Sending...</span>
                        </>
                      ) : isTributeMode ? (
                        <span>
                          {tributeRitual === "flower"
                            ? "Lay flower"
                            : tributeRitual === "candle"
                              ? "Light candle"
                              : "Send tribute"}
                        </span>
                      ) : selectedType === "memory" ? (
                        <span>Share memory</span>
                      ) : selectedType === "photo" ? (
                        <span>Share photograph</span>
                      ) : selectedType === "voice" ? (
                        <span>Share recording</span>
                      ) : selectedType === "video" ? (
                        <span>Share video</span>
                      ) : (
                        <span>Send</span>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
