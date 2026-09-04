"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  X,
  CheckCircle2,
  Heart,
  Upload,
  Sparkles,
  Loader2,
  BookOpen,
  Camera,
  Clock,
  Mic,
  MessageSquare,
  ArrowLeft,
  Calendar,
  MapPin,
  User,
  Trash2,
  ImageIcon,
  AlertCircle,
} from "lucide-react"
import { Turnstile } from "@marsidev/react-turnstile"

export type ContributionType = "memory" | "photo" | "moment" | "voice" | "message"

interface ContributeModalProps {
  isOpen: boolean
  onClose: () => void
  memorialName: string
  slug: string
  initialType?: ContributionType | null
}

export function ContributeModal({
  isOpen,
  onClose,
  memorialName,
  slug,
  initialType = null,
}: ContributeModalProps) {
  const [selectedType, setSelectedType] = useState<ContributionType | null>(initialType)
  const [authorName, setAuthorName] = useState("")
  const [relationship, setRelationship] = useState("")
  const [content, setContent] = useState("")
  const [extraField, setExtraField] = useState("") // year / album / location / caption
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  // Cloudflare Turnstile state
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ""
  const [turnstileToken, setTurnstileToken] = useState("")

  // Media upload state
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null)
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null)
  const [isUploadingMedia, setIsUploadingMedia] = useState(false)
  const [mediaUploadError, setMediaUploadError] = useState<string | null>(null)

  // Reset or initialize state whenever modal opens or initialType changes
  useEffect(() => {
    if (isOpen) {
      setSelectedType(initialType)
      setIsSubmitted(false)
    }
  }, [isOpen, initialType])

  const firstName = memorialName.split(" ")[0] || memorialName

  const [error, setError] = useState<string | null>(null)

  const handleFileSelect = async (file: File) => {
    if (!file) return
    setIsUploadingMedia(true)
    setMediaUploadError(null)

    try {
      // 1. Request signed Upload Intent token
      const intentRes = await fetch(`/api/memorials/${slug}/upload-intent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          turnstile_token: turnstileToken,
          mime_type: file.type || "application/octet-stream",
          file_size: file.size,
          file_name: file.name,
        }),
      })

      const intentData = await intentRes.json()
      if (!intentRes.ok) {
        throw new Error(intentData.error || "Failed to authorize file upload")
      }

      // 2. Upload file directly to R2 with upload intent token
      const formData = new FormData()
      formData.append("file", file)
      formData.append("folder", "contributions")
      formData.append("memorialId", slug)
      formData.append("uploadIntentToken", intentData.uploadIntentToken)

      const res = await fetch("/api/r2/upload", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Failed to upload file")
      }

      setUploadedFileUrl(data.publicUrl)
      setUploadedFileName(file.name)
    } catch (err: any) {
      console.error("Media upload error:", err)
      setMediaUploadError(err.message || "Failed to upload file. Please try again.")
    } finally {
      setIsUploadingMedia(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!authorName.trim()) return

    // If photo is uploaded, story is optional (fallback to caption or default note)
    const effectiveContent = content.trim() || (uploadedFileUrl ? `Photograph shared by ${authorName.trim()}` : "")
    if (!effectiveContent) return

    setIsSubmitting(true)
    setError(null)

    try {
      const approxYearNum = extraField ? parseInt(extraField.replace(/\D/g, ""), 10) : null
      const res = await fetch(`/api/memorials/${slug}/contribute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: selectedType === "message" ? "guestbook" : "memory",
          author_name: authorName.trim(),
          author_relationship: relationship.trim() || null,
          content: effectiveContent,
          approx_year: isNaN(approxYearNum as number) ? null : approxYearNum,
          photo_url: uploadedFileUrl || null,
          turnstile_token: turnstileToken,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit contribution")
      }

      setIsSubmitted(true)
    } catch (err: any) {
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
    setAuthorName("")
    setRelationship("")
    setContent("")
    setExtraField("")
    setUploadedFileUrl(null)
    setUploadedFileName(null)
    setIsUploadingMedia(false)
    setMediaUploadError(null)
    setError(null)
    onClose()
  }

  const contributionOptions = [
    {
      type: "memory" as const,
      icon: BookOpen,
      title: "Tell a memory",
      desc: `Something you remember about ${firstName}.`,
      color: "text-rose-600 bg-rose-50",
    },
    {
      type: "photo" as const,
      icon: Camera,
      title: "Add photos",
      desc: "Share photographs the family may not have seen.",
      color: "text-amber-600 bg-amber-50",
    },
    {
      type: "moment" as const,
      icon: Clock,
      title: "Add a life moment",
      desc: `Help complete ${firstName}'s life timeline.`,
      color: "text-emerald-600 bg-emerald-50",
    },
    {
      type: "voice" as const,
      icon: Mic,
      title: "Share voice or video",
      desc: "A voicemail or clip worth keeping forever.",
      color: "text-primary bg-primary/10",
    },
    {
      type: "message" as const,
      icon: MessageSquare,
      title: "Leave a message",
      desc: "A warm note or condolence for the family.",
      color: "text-indigo-600 bg-indigo-50",
    },
  ]

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
            className="relative w-full max-w-lg rounded-3xl bg-white border border-black/[0.08] p-6 sm:p-8 overflow-hidden shadow-2xl z-10 select-none max-h-[90vh] flex flex-col"
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
                      Thank you for remembering
                    </h3>
                    <p className="text-xs sm:text-sm text-[#666] max-w-sm leading-relaxed">
                      Your contribution has been safely received for {memorialName}&apos;s family archive. It will appear on the memorial once the caretaker reviews it.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleReset}
                    className="mt-4 px-6 py-2.5 rounded-full bg-neutral-100 hover:bg-neutral-200 text-xs font-medium text-[#181925] transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              ) : !selectedType ? (
                /* STEP 1: CHOICE SHEET */
                <div className="flex flex-col gap-5 py-2">
                  <div className="flex flex-col gap-1">
                    <h3 className="text-xl sm:text-2xl font-medium tracking-tight text-[#181925]">
                      Add to {memorialName}&apos;s memorial
                    </h3>
                    <p className="text-xs text-[#71717a]">
                      Choose what you would like to share with the family.
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
                            <Icon className="size-5" />
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
                /* STEP 2: FOCUSED CONTRIBUTION FORM */
                <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-2">
                  <div className="flex flex-col gap-1">
                    <h3 className="text-lg sm:text-xl font-medium tracking-tight text-[#181925]">
                      {selectedType === "memory" && `Share a memory of ${firstName}`}
                      {selectedType === "photo" && `Add photographs of ${firstName}`}
                      {selectedType === "moment" && `Suggest a timeline moment`}
                      {selectedType === "voice" && `Share a voice or video recording`}
                      {selectedType === "message" && `Leave a message for the family`}
                    </h3>
                    <p className="text-xs text-[#71717a]">
                      {selectedType === "memory" && "Tell an anecdote, a story, or a quiet moment."}
                      {selectedType === "photo" && "Upload original photographs to preserve in the archive."}
                      {selectedType === "moment" && "Help record when important milestones took place."}
                      {selectedType === "voice" && "Upload an audio file or voice memo from your phone."}
                      {selectedType === "message" && "Short condolences or notes of love for the guestbook."}
                    </p>
                  </div>

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
                        placeholder="e.g. Daughter, Old neighbour, Colleague"
                        className="w-full px-3 py-2 rounded-xl bg-[#f7f7f8] border border-black/[0.08] text-sm text-[#181925] placeholder:text-[#aaa] outline-none focus:border-primary/50 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Contextual Extra Field */}
                  {selectedType === "moment" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div className="flex flex-col gap-1">
                        <label className="text-[11px] font-mono text-[#71717a] uppercase tracking-wider">
                          Year / Approx Date
                        </label>
                        <input
                          type="text"
                          value={extraField}
                          onChange={(e) => setExtraField(e.target.value)}
                          placeholder="e.g. 1974 or Summer 1985"
                          className="w-full px-3 py-2 rounded-xl bg-[#f7f7f8] border border-black/[0.08] text-sm text-[#181925] placeholder:text-[#aaa] outline-none focus:border-primary/50 transition-colors"
                        />
                      </div>
                    </div>
                  )}

                  {/* Upload Dropzone Preview for Photos or Audio */}
                  {(selectedType === "photo" || selectedType === "voice") && (
                    <div className="flex flex-col gap-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept={selectedType === "voice" ? "audio/*,video/*" : "image/*"}
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
                          ) : (
                            <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                              <Mic className="size-6" />
                            </div>
                          )}
                          <div className="flex flex-col min-w-0 flex-1">
                            <span className="text-xs font-medium text-[#181925] truncate">
                              {uploadedFileName || "Uploaded attachment"}
                            </span>
                            <span className="text-[11px] text-emerald-600 font-medium inline-flex items-center gap-1">
                              <CheckCircle2 className="size-3" /> Ready to submit with memory
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setUploadedFileUrl(null)
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
                            ) : (
                              <Mic className="size-4 text-primary" />
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-[#181925] group-hover:text-primary transition-colors">
                              {selectedType === "photo" ? "Choose or drop a photograph" : "Choose or drop an audio file"}
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

                  {/* Main Content Area */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-mono text-[#71717a] uppercase tracking-wider">
                      {selectedType === "message" ? "Your message *" : selectedType === "photo" && uploadedFileUrl ? "Caption or story behind this photo" : "The story or details *"}
                    </label>
                    <textarea
                      required={!uploadedFileUrl}
                      rows={4}
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder={
                        selectedType === "message"
                          ? "Write a short note of support or condolence..."
                          : selectedType === "photo"
                          ? "Add a caption or tell the story behind this photo..."
                          : selectedType === "moment"
                          ? "What happened during this milestone in their life?..."
                          : selectedType === "voice"
                          ? "Tell us when or where this was recorded..."
                          : "“I remember when Dad spent half of Christmas Day fixing the neighbour’s washer...”"
                      }
                      className="w-full px-3 py-2.5 rounded-xl bg-[#f7f7f8] border border-black/[0.08] text-sm text-[#181925] placeholder:text-[#aaa] outline-none focus:border-primary/50 transition-colors resize-none leading-relaxed"
                    />
                  </div>

                  {error && (
                    <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium flex items-center gap-2">
                      <AlertCircle className="size-3.5 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  {siteKey ? (
                    <div className="flex justify-center py-1">
                      <Turnstile
                        siteKey={siteKey}
                        onSuccess={setTurnstileToken}
                        onExpire={() => setTurnstileToken("")}
                        onError={() => setTurnstileToken("")}
                      />
                    </div>
                  ) : null}

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
                      disabled={isSubmitting || isUploadingMedia || !authorName.trim() || (!content.trim() && !uploadedFileUrl)}
                      className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap !rounded-full font-medium transition-all cursor-pointer border border-[color-mix(in_srgb,var(--primary)_80%,#3a3480)] bg-[color-mix(in_srgb,var(--primary)_90%,#3a3480)] text-primary-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.22),inset_0_-1px_0_rgba(58,52,128,0.30)] transform-gpu hover:bg-primary active:scale-[0.98] h-9 px-5 text-xs select-none disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="size-3.5 animate-spin" />
                          <span>Sending...</span>
                        </>
                      ) : (
                        <span>Send to Family Archive</span>
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
