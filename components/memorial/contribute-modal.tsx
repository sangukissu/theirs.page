"use client"

import { useState, useEffect, useRef } from "react"
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
  Calendar,
} from "lucide-react"
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile"
import {
  BotanicalFlowerEmblem,
  CandleFlameEmblem,
  QuillFeatherEmblem,
} from "./tribute-emblems"
import { saveLocalReceipt } from "@/lib/memorial/optimistic-receipts"
import type { ContributionSettings } from "@/types/theirs"

export type ContributionType = "tribute" | "memory" | "photo" | "moment" | "voice" | "video" | "message"
export type TributeRitual = "flower" | "candle" | "note"

interface ContributeModalProps {
  isOpen: boolean
  onClose: () => void
  memorialName: string
  slug: string
  memorialId?: string
  isPaid?: boolean
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
  photoCount = 0,
  contributionSettings,
  initialType = null,
  initialPhotoUrl = null,
  initialPhotoTitle = null,
  initialMediaId = null,
  onSubmitted,
}: ContributeModalProps) {
  const [selectedType, setSelectedType] = useState<ContributionType | null>(initialType)
  const [tributeRitual, setTributeRitual] = useState<TributeRitual>("flower")
  const [authorName, setAuthorName] = useState("")
  const [relationship, setRelationship] = useState("")
  const [content, setContent] = useState("")
  const [extraField, setExtraField] = useState("") // approx year
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
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
  const [memoryPhotos, setMemoryPhotos] = useState<{ url: string; name: string; mediaRef?: string }[]>([])
  const [selectedExistingMediaId, setSelectedExistingMediaId] = useState<string | null>(null)
  const [uploadAuthorization, setUploadAuthorization] = useState<string | null>(null)
  const [isUploadingMedia, setIsUploadingMedia] = useState(false)
  const [mediaUploadError, setMediaUploadError] = useState<string | null>(null)

  const isPhotosFull = !isPaid && (photoCount ?? 0) >= 5
  const firstName = memorialName.split(" ")[0] || memorialName

  const allContributionsDisabled = contributionSettings?.accept_contributions === false

  const allContributionOptions = [
    {
      type: "tribute" as const,
      icon: Heart,
      title: "Leave a Tribute",
      desc: "Lay a flower, light a candle, or leave a quiet note of remembrance.",
      color: "text-primary bg-primary/5",
      available: !allContributionsDisabled && contributionSettings?.tributes !== false,
    },
    {
      type: "memory" as const,
      icon: BookOpen,
      title: "Share a memory",
      desc: `An anecdote, a shared story, or a reflection about ${firstName}.`,
      color: "text-primary bg-primary/5",
      available: !allContributionsDisabled && contributionSettings?.memories !== false,
    },
    {
      type: "photo" as const,
      icon: Camera,
      title: "Share a photograph",
      desc: "Photographs the family and friends may cherish.",
      color: "text-primary bg-primary/5",
      available: !allContributionsDisabled && !isPhotosFull && contributionSettings?.photos !== false,
    },
    {
      type: "moment" as const,
      icon: Calendar,
      title: "Suggest a life moment",
      desc: `Help the family place an important chapter of ${firstName}'s life in time.`,
      color: "text-primary bg-primary/5",
      available: !allContributionsDisabled && contributionSettings?.moments !== false,
    },
    {
      type: "voice" as const,
      icon: Mic,
      title: "Share a voice note",
      desc: "A voicemail or spoken story worth keeping forever.",
      color: "text-primary bg-primary/5",
      available: false,
    },
    {
      type: "video" as const,
      icon: Film,
      title: "Share a video clip",
      desc: "Home movies, celebrations, or recorded messages.",
      color: "text-primary bg-primary/5",
      available: false,
    },
  ]

  const contributionOptions = allContributionOptions.filter((opt) => opt.available)

  // Reset or initialize state whenever modal opens or initialType changes
  useEffect(() => {
    if (isOpen) {
      if (initialType) {
        const resolvedType = initialType === "message" ? "tribute" : initialType
        setSelectedType(resolvedType)
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
      setIsSubmitted(false)
      setError(null)
      setMediaUploadError(null)
    }
  }, [isOpen, initialType, initialPhotoUrl, initialPhotoTitle, initialMediaId, isPaid, photoCount])

  const getUploadAuthorization = async (file: File): Promise<string> => {
    if (uploadAuthorization) return uploadAuthorization
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
          contribution_type: selectedType === "photo" ? "photo" : "memory",
        }),
      })
      const intentData = await intentRes.json().catch(() => ({}))
      if (!intentRes.ok) throw new Error(intentData.error || "Failed to authorize file upload")

      setUploadAuthorization(intentData.uploadIntentToken)
      return intentData.uploadIntentToken as string
    } finally {
      resetTurnstile()
    }
  }

  const uploadContributionFile = async (file: File) => {
    const authorization = await getUploadAuthorization(file)
    const formData = new FormData()
    formData.append("file", file)
    formData.append("folder", "contributions")
    formData.append("memorialId", memorialId || slug)
    formData.append("uploadIntentToken", authorization)

    const response = await fetch("/api/r2/upload", { method: "POST", body: formData })
    const data = await response.json()
    if (!response.ok) {
      if (response.status === 403) setUploadAuthorization(null)
      throw new Error(data.error || "Failed to upload photograph")
    }
    return data as { previewUrl: string; mediaRef: string }
  }

  const handleFileSelect = async (file: File) => {
    if (!file) return
    setIsUploadingMedia(true)
    setMediaUploadError(null)

    try {
      const data = await uploadContributionFile(file)
      setUploadedFileUrl(data.previewUrl)
      setUploadedMediaRef(data.mediaRef)
      setUploadedFileName(file.name)
    } catch (err: any) {
      console.error("Media upload error:", err)
      setMediaUploadError(err.message || "Failed to upload file. Please try again.")
    } finally {
      setIsUploadingMedia(false)
    }
  }

  const handleMemoryPhotoSelect = async (file: File) => {
    if (!file) return
    if (memoryPhotos.length >= 3) {
      setMediaUploadError("You can attach up to 3 photographs to a story.")
      return
    }

    setIsUploadingMedia(true)
    setMediaUploadError(null)

    try {
      const data = await uploadContributionFile(file)
      setMemoryPhotos((prev) => [
        ...prev,
        { url: data.previewUrl, name: file.name, mediaRef: data.mediaRef },
      ])
    } catch (err: any) {
      console.error("Photo upload error:", err)
      setMediaUploadError(err.message || "Failed to upload photo. Please try again.")
    } finally {
      setIsUploadingMedia(false)
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
      } else if (selectedType === "video" && uploadedFileUrl) {
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

      const res = await fetch(`/api/memorials/${targetIdentifier}/contribute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: selectedType === "message" ? "tribute" : selectedType,
          author_name: authorName.trim(),
          author_relationship: relationship.trim() || null,
          content: effectiveContent,
          approx_year: isNaN(approxYearNum as number) ? null : approxYearNum,
          media_refs: mediaRefs,
          existing_media_id: selectedExistingMediaId,
          upload_authorization: uploadAuthorization,
          tribute_type: safeTributeType,
          turnstile_token: turnstileToken,
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
          status: data.item.status,
          created_at: data.item.created_at || new Date().toISOString(),
        })
      }

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
    setSelectedType(null)
    setTributeRitual("flower")
    setAuthorName("")
    setRelationship("")
    setContent("")
    setExtraField("")
    setUploadedFileUrl(null)
    setUploadedMediaRef(null)
    setUploadedFileName(null)
    setMemoryPhotos([])
    setSelectedExistingMediaId(null)
    setUploadAuthorization(null)
    setIsUploadingMedia(false)
    setMediaUploadError(null)
    setError(null)
    resetTurnstile()
    onClose()
  }

  const isMedia = selectedType === "photo" || selectedType === "voice" || selectedType === "video"
  const hasSecurityProof = Boolean(siteKey && (turnstileToken || uploadAuthorization))

  // Determine if form is ready to submit
  const canSubmit =
    !isSubmitting &&
    !isUploadingMedia &&
    hasSecurityProof &&
    Boolean(authorName.trim()) &&
    (isTributeMode
      ? tributeRitual !== "note" || Boolean(content.trim())
      : selectedType === "memory"
        ? Boolean(content.trim())
        : isMedia
          ? Boolean(uploadedMediaRef)
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
            <div className="flex items-center justify-between pb-3">
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
                <div className="inline-flex items-center gap-1.5 text-xs text-primary font-medium">
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
                      Added. Thank you for remembering {firstName}.
                    </h3>
                    <p className="text-xs sm:text-sm text-[#666] max-w-sm leading-relaxed">
                      Your remembrance has been added to your view and sent to {firstName}&apos;s family.
                    </p>
                    <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 text-[11px] text-[#71717a] font-medium mx-auto">
                      <span className="size-1.5 rounded-full bg-emerald-500" />
                      <span>Sent to {firstName}&apos;s family</span>
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
                          onClick={() => setSelectedType(opt.type)}
                          className="flex items-center gap-4 p-3.5 rounded-2xl border border-black/[0.06] bg-[#f9f9fa] hover:bg-neutral-100 hover:border-black/[0.12] transition-all text-left cursor-pointer group"
                        >
                          <div
                            className={`size-10 rounded-xl flex items-center justify-center shrink-0 ${opt.color} transition-transform group-hover:scale-105`}
                          >
                            {opt.type === "tribute" ? (
                              <BotanicalFlowerEmblem size={22} className="text-primary" />
                            ) : (
                              <Icon className="size-5" />
                            )}
                          </div>
                          <div className="flex flex-col gap-0.5 min-w-0">
                            <span className="text-sm font-medium text-[#181925] group-hover:text-primary transition-colors">
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
                      {selectedType === "moment" && `Suggest a timeline milestone`}
                    </h3>
                    <p className="text-xs text-[#71717a]">
                      {isTributeMode && "Choose a gesture and leave your words of remembrance."}
                      {selectedType === "memory" && "Tell an anecdote, a story, or a quiet reflection."}
                      {selectedType === "photo" && "Upload original photographs to preserve in the family archive."}
                      {selectedType === "voice" && "Upload an audio file or voice memo from your phone."}
                      {selectedType === "video" && "Upload a video clip or home movie to preserve in the archive."}
                      {selectedType === "moment" && "Help record when important milestones took place."}
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
                              ? "bg-primary/5 border-primary text-primary ring-1 ring-primary/30 shadow-2xs"
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
                              ? "bg-primary/5 border-primary text-primary ring-1 ring-primary/30 shadow-2xs"
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
                              ? "bg-primary/5 border-primary text-primary ring-1 ring-primary/30 shadow-2xs"
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
                        maxLength={100}
                        placeholder="e.g. David Miller"
                        className="w-full px-3 py-2 rounded-xl bg-[#f7f7f8] border border-black/[0.08] text-sm text-[#181925] placeholder:text-[#aaa] outline-none focus:border-primary/50 transition-colors"
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
                        maxLength={80}
                        placeholder="e.g. Daughter, Old neighbour, Colleague"
                        className="w-full px-3 py-2 rounded-xl bg-[#f7f7f8] border border-black/[0.08] text-sm text-[#181925] placeholder:text-[#aaa] outline-none focus:border-primary/50 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Optional Year for Memories, Photos, or Milestones */}
                  {(selectedType === "memory" || selectedType === "photo" || selectedType === "moment") && (
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
                          className="w-full px-3 py-2 rounded-xl bg-[#f7f7f8] border border-black/[0.08] text-sm text-[#181925] placeholder:text-[#aaa] outline-none focus:border-primary/50 transition-colors"
                        />
                      </div>
                    </div>
                  )}

                  {/* ========================================================= */}
                  {/* 2. MEDIA DROPZONE FOR PHOTO, VOICE, OR VIDEO              */}
                  {/* ========================================================= */}
                  {(selectedType === "photo" || selectedType === "voice" || selectedType === "video") && (
                    <div className="flex flex-col gap-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept={selectedType === "video" ? "video/*" : selectedType === "voice" ? "audio/*" : "image/*"}
                        className="hidden"
                        disabled={isUploadingMedia}
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
                            <div className="size-16 rounded-xl overflow-hidden bg-black/90 shrink-0 border border-black/[0.08] relative flex items-center justify-center">
                              <video src={uploadedFileUrl} className="size-full object-cover" muted />
                              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                <Film className="size-5 text-white" />
                              </div>
                            </div>
                          ) : (
                            <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                              <Mic className="size-6" />
                            </div>
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
                        <div className="border-2 border-dashed border-primary/40 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 bg-primary/5 text-center">
                          <Loader2 className="size-6 animate-spin text-primary" />
                          <span className="text-xs font-medium text-[#181925]">Uploading original file...</span>
                          <span className="text-[10px] text-[#71717a]">Preserving untouched archival quality</span>
                        </div>
                      ) : (
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={handleDrop}
                          className="border-2 border-dashed border-black/[0.08] hover:border-primary/40 rounded-2xl p-5 flex flex-col items-center justify-center gap-2 bg-[#faf9f8] cursor-pointer transition-colors text-center group"
                        >
                          <div className="size-10 rounded-full bg-white flex items-center justify-center shadow-xs border border-black/[0.06] group-hover:scale-105 transition-transform">
                            {selectedType === "photo" ? (
                              <Camera className="size-4 text-primary" />
                            ) : selectedType === "video" ? (
                              <Film className="size-4 text-primary" />
                            ) : (
                              <Mic className="size-4 text-primary" />
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-[#181925] group-hover:text-primary transition-colors">
                              {selectedType === "photo"
                                ? "Choose or drop a photograph"
                                : selectedType === "video"
                                  ? "Choose or drop a video clip"
                                  : "Choose or drop an audio file"}
                            </span>
                            <span className="text-[10px] text-[#71717a]">
                              Original high-resolution preserved untouched
                            </span>
                          </div>
                        </div>
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
                                : "Milestone story *"}
                    </label>
                    <textarea
                      required={
                        selectedType === "memory" ||
                        selectedType === "moment" ||
                        (isTributeMode && tributeRitual === "note")
                      }
                      rows={isTributeMode || selectedType === "memory" ? 4 : 3}
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      maxLength={4000}
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
                      className="w-full px-3 py-2.5 rounded-xl bg-[#f7f7f8] border border-black/[0.08] text-sm text-[#181925] placeholder:text-[#aaa] outline-none focus:border-primary/50 transition-colors resize-none leading-relaxed"
                    />
                  </div>

                  {/* ========================================================= */}
                  {/* 4. OPTIONAL PHOTO ATTACHMENTS (UP TO 3) FOR MEMORY / STORY */}
                  {/* ========================================================= */}
                  {selectedType === "memory" && (
                    <div className="flex flex-col gap-2 pt-0.5">
                      <input
                        ref={memoryPhotoInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={isUploadingMedia}
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            handleMemoryPhotoSelect(e.target.files[0])
                          }
                          e.target.value = ""
                        }}
                      />

                      {memoryPhotos.length > 0 ? (
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-mono uppercase text-[#71717a]">
                              Attached Photos ({memoryPhotos.length}/3)
                            </span>
                            {memoryPhotos.length < 3 && (
                              <button
                                type="button"
                                disabled={isUploadingMedia}
                                onClick={() => memoryPhotoInputRef.current?.click()}
                                className="text-xs text-primary font-medium hover:underline cursor-pointer disabled:opacity-50"
                              >
                                + Add another photo
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-3 gap-2">
                            {memoryPhotos.map((p, idx) => (
                              <div
                                key={idx}
                                className="relative rounded-xl overflow-hidden aspect-4/3 bg-neutral-100 border border-black/[0.08] group"
                              >
                                <img src={p.url} alt="Attached photo" className="size-full object-cover" />
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (!p.mediaRef) setSelectedExistingMediaId(null)
                                    setMemoryPhotos(memoryPhotos.filter((_, i) => i !== idx))
                                  }}
                                  className="absolute top-1 right-1 size-6 rounded-full bg-black/60 hover:bg-rose-600 text-white flex items-center justify-center transition-colors cursor-pointer shadow-xs"
                                  title="Remove photo"
                                >
                                  <X className="size-3" />
                                </button>
                              </div>
                            ))}
                            {memoryPhotos.length < 3 && (
                              <button
                                type="button"
                                disabled={isUploadingMedia}
                                onClick={() => memoryPhotoInputRef.current?.click()}
                                className="rounded-xl border border-dashed border-black/[0.15] hover:border-primary/50 aspect-4/3 flex flex-col items-center justify-center gap-1 bg-[#fafafb] hover:bg-white text-[#71717a] hover:text-primary transition-all cursor-pointer text-center p-2"
                              >
                                <Camera className="size-4 text-primary" />
                                <span className="text-[10px] font-medium">+ Add photo</span>
                              </button>
                            )}
                          </div>
                        </div>
                      ) : isUploadingMedia ? (
                        <div className="border border-dashed border-primary/40 rounded-2xl p-3 flex items-center justify-center gap-2 bg-primary/5 text-center">
                          <Loader2 className="size-4 animate-spin text-primary" />
                          <span className="text-xs font-medium text-[#181925]">Uploading photograph...</span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => memoryPhotoInputRef.current?.click()}
                          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-dashed border-black/[0.12] bg-[#f7f7f8] hover:bg-neutral-100 hover:border-black/[0.2] text-xs font-medium text-[#666] hover:text-[#181925] transition-all cursor-pointer self-start"
                        >
                          <Camera className="size-3.5 text-primary" />
                          <span>Attach photographs (up to 3 photos)</span>
                        </button>
                      )}

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

                  {siteKey ? (
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
                      className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap !rounded-full font-medium transition-all cursor-pointer border border-[color-mix(in_srgb,var(--primary)_80%,#3a3480)] bg-[color-mix(in_srgb,var(--primary)_90%,#3a3480)] text-primary-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.22),inset_0_-1px_0_rgba(58,52,128,0.30)] transform-gpu hover:bg-primary active:scale-[0.98] h-9 px-5 text-xs select-none disabled:opacity-50 disabled:cursor-not-allowed"
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
                      ) : selectedType === "moment" ? (
                        <span>Send life moment</span>
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
