"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  X,
  Check,
  Loader2,
  MessageSquare,
  LifeBuoy,
  Star,
  AlertCircle,
  Mail,
} from "lucide-react"
import { SupportCategory } from "@/types/theirs"

interface HelpFeedbackModalProps {
  isOpen: boolean
  onClose: () => void
  userEmail: string
  userId?: string
  memorialId?: string
}

type ModalTab = "feedback" | "support"

const RATING_LABELS: Record<number, string> = {
  1: "Needs work",
  2: "Fair",
  3: "Good",
  4: "Great",
  5: "Wonderful",
}

export function HelpFeedbackModal({
  isOpen,
  onClose,
  userEmail,
  memorialId,
}: HelpFeedbackModalProps) {
  const [activeTab, setActiveTab] = useState<ModalTab>("feedback")

  // Feedback State
  const [workingWell, setWorkingWell] = useState("")
  const [couldBeBetter, setCouldBeBetter] = useState("")
  const [rating, setRating] = useState<number | null>(null)
  const [hoverRating, setHoverRating] = useState<number | null>(null)
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false)
  const [feedbackSuccess, setFeedbackSuccess] = useState(false)
  const [feedbackError, setFeedbackError] = useState<string | null>(null)

  // Support State
  const [category, setCategory] = useState<SupportCategory>("General")
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [isSubmittingSupport, setIsSubmittingSupport] = useState(false)
  const [supportSuccess, setSupportSuccess] = useState(false)
  const [supportError, setSupportError] = useState<string | null>(null)

  // Reset when opening
  useEffect(() => {
    if (isOpen) {
      setWorkingWell("")
      setCouldBeBetter("")
      setRating(null)
      setHoverRating(null)
      setFeedbackSuccess(false)
      setFeedbackError(null)

      setCategory("General")
      setSubject("")
      setMessage("")
      setSupportSuccess(false)
      setSupportError(null)
    }
  }, [isOpen])

  // Manage body scroll lock
  useEffect(() => {
    if (!isOpen) return
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isSubmittingFeedback && !isSubmittingSupport) {
        onClose()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => {
      document.body.style.overflow = originalOverflow
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen, isSubmittingFeedback, isSubmittingSupport, onClose])

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!workingWell.trim() && !couldBeBetter.trim() && rating === null) {
      setFeedbackError("Please share a thought or an experience rating.")
      return
    }

    setIsSubmittingFeedback(true)
    setFeedbackError(null)

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          working_well: workingWell.trim() || undefined,
          could_be_better: couldBeBetter.trim() || undefined,
          rating: rating ?? undefined,
          memorial_id: memorialId,
          page_path: typeof window !== "undefined" ? window.location.pathname : undefined,
        }),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit feedback.")
      }

      setFeedbackSuccess(true)
    } catch (err: any) {
      setFeedbackError(err.message || "Failed to submit feedback. Please try again.")
    } finally {
      setIsSubmittingFeedback(false)
    }
  }

  const handleSupportSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!subject.trim()) {
      setSupportError("Please enter a subject.")
      return
    }
    if (message.trim().length < 10) {
      setSupportError("Please enter a message with at least 10 characters.")
      return
    }

    setIsSubmittingSupport(true)
    setSupportError(null)

    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          subject: subject.trim(),
          message: message.trim(),
          memorial_id: memorialId,
          page_path: typeof window !== "undefined" ? window.location.pathname : undefined,
        }),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.error || "Failed to send support request.")
      }

      setSupportSuccess(true)
    } catch (err: any) {
      setSupportError(err.message || "Failed to send support request. Please try again.")
    } finally {
      setIsSubmittingSupport(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 font-sans"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !isSubmittingFeedback && !isSubmittingSupport) {
              onClose()
            }
          }}
        >
          {/* Dark backdrop without blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 bg-black/40 cursor-pointer"
          />

          {/* Compact Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            role="dialog"
            aria-modal="true"
            className="relative w-full max-w-[430px] sm:max-w-[450px] rounded-2xl bg-white border border-black/[0.12] shadow-sm z-10 flex flex-col overflow-hidden"
          >
            {/* Top Close Button */}
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmittingFeedback || isSubmittingSupport}
              className="absolute right-3 top-3 size-7 rounded-full flex items-center justify-center text-[#888] hover:bg-[#f4f4f6] hover:text-[#181925] transition-colors cursor-pointer disabled:opacity-50 z-20"
              aria-label="Close"
            >
              <X className="size-4" />
            </button>

            {/* Compact Header */}
            <div className="px-5 pt-4 pb-3 border-b border-black/[0.05] bg-[#fafafb]">
              <div className="flex items-center gap-2 mb-1">
                <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  {activeTab === "feedback" ? (
                    <MessageSquare className="size-3.5" />
                  ) : (
                    <LifeBuoy className="size-3.5" />
                  )}
                </span>
                <h2 className="text-base font-semibold text-[#181925] tracking-tight">
                  {activeTab === "feedback" ? "Help us improve Theirs" : "Contact support"}
                </h2>
              </div>

              <p className="text-[12px] text-[#71717a] leading-normal">
                {activeTab === "feedback"
                  ? "Your candid thoughts help us build a quiet, beautiful space."
                  : "Have a question about your memorial, billing, or technical details?"}
              </p>

              {/* Segmented Switcher Pill */}
              <div className="mt-3 grid grid-cols-2 p-0.5 bg-black/[0.04] rounded-xl border border-black/[0.04]">
                <button
                  type="button"
                  onClick={() => setActiveTab("feedback")}
                  className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    activeTab === "feedback"
                      ? "bg-white text-[#181925] shadow-xs font-semibold"
                      : "text-[#71717a] hover:text-[#181925]"
                  }`}
                >
                  <MessageSquare className="size-3" />
                  <span>Send feedback</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("support")}
                  className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    activeTab === "support"
                      ? "bg-white text-[#181925] shadow-xs font-semibold"
                      : "text-[#71717a] hover:text-[#181925]"
                  }`}
                >
                  <LifeBuoy className="size-3.5" />
                  <span>Contact support</span>
                </button>
              </div>
            </div>

            {/* Form Body (compact, fits on screen) */}
            <div className="p-5">
              {activeTab === "feedback" ? (
                feedbackSuccess ? (
                  <div className="py-6 text-center flex flex-col items-center">
                    <div className="size-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 mb-3">
                      <Check className="size-5" />
                    </div>
                    <h3 className="text-base font-semibold text-[#181925] mb-1">
                      Thank you for your thoughts
                    </h3>
                    <p className="text-xs text-[#71717a] max-w-xs leading-relaxed mb-5">
                      Every note is read with care. Your feedback directly shapes Theirs.
                    </p>
                    <button
                      type="button"
                      onClick={onClose}
                      className="min-h-9 rounded-full bg-[#181925] hover:bg-black px-6 text-xs font-medium text-white transition-all shadow-xs cursor-pointer"
                    >
                      Done
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleFeedbackSubmit} className="space-y-3">
                    {feedbackError && (
                      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-50 border border-rose-100 text-rose-700 text-xs">
                        <AlertCircle className="size-3.5 shrink-0" />
                        <span>{feedbackError}</span>
                      </div>
                    )}

                    {/* Compact Experience Rating */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-medium text-[#55585c]">
                          Experience so far <span className="text-[#888] font-normal">(optional)</span>
                        </label>
                        {(rating !== null || hoverRating !== null) && (
                          <span className="text-[11px] text-primary font-medium animate-in fade-in">
                            {RATING_LABELS[hoverRating || rating || 0]}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 p-1.5 rounded-xl border border-black/[0.07] bg-[#fbfbfa]">
                        {[1, 2, 3, 4, 5].map((val) => {
                          const isHovered = hoverRating !== null && val <= hoverRating
                          const isSelected = rating !== null && val <= rating
                          const active = hoverRating !== null ? isHovered : isSelected
                          return (
                            <button
                              key={val}
                              type="button"
                              onClick={() => setRating(rating === val ? null : val)}
                              onMouseEnter={() => setHoverRating(val)}
                              onMouseLeave={() => setHoverRating(null)}
                              className={`flex-1 py-1 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                                active
                                  ? "bg-amber-50 text-amber-500 scale-105"
                                  : "text-[#aaa] hover:text-[#181925] hover:bg-black/[0.03]"
                              }`}
                              title={`Rate ${val} of 5 (${RATING_LABELS[val]})`}
                            >
                              <Star className={`size-3.5 ${active ? "fill-amber-400" : ""}`} />
                            </button>
                          )
                        })}
                        {rating !== null && (
                          <button
                            type="button"
                            onClick={() => setRating(null)}
                            className="text-[10px] text-[#888] hover:text-[#181925] px-1.5 py-0.5 rounded hover:bg-black/[0.04] transition-colors"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                    </div>

                    {/* What's working well? */}
                    <div>
                      <label htmlFor="modal-working-well" className="block text-[11px] font-medium text-[#55585c] mb-1">
                        What’s working well?
                      </label>
                      <textarea
                        id="modal-working-well"
                        rows={2}
                        value={workingWell}
                        onChange={(e) => setWorkingWell(e.target.value)}
                        placeholder="Tell us what felt comforting, easy, or meaningful..."
                        className="w-full rounded-xl border border-black/[0.08] bg-[#fbfbfa] p-2.5 text-xs text-[#181925] placeholder:text-[#999] focus:bg-white focus:border-[#181925] focus:ring-1 focus:ring-[#181925]/15 leading-relaxed outline-none transition-all resize-none"
                        maxLength={3000}
                      />
                    </div>

                    {/* What could be better? */}
                    <div>
                      <label htmlFor="modal-could-be-better" className="block text-[11px] font-medium text-[#55585c] mb-1">
                        What could be better?
                      </label>
                      <textarea
                        id="modal-could-be-better"
                        rows={2}
                        value={couldBeBetter}
                        onChange={(e) => setCouldBeBetter(e.target.value)}
                        placeholder="What felt confusing, frustrating, or missing?..."
                        className="w-full rounded-xl border border-black/[0.08] bg-[#fbfbfa] p-2.5 text-xs text-[#181925] placeholder:text-[#999] focus:bg-white focus:border-[#181925] focus:ring-1 focus:ring-[#181925]/15 leading-relaxed outline-none transition-all resize-none"
                        maxLength={3000}
                      />
                    </div>

                    {/* Action Bar */}
                    <div className="pt-1 flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={onClose}
                        className="px-3 py-1.5 text-xs text-[#71717a] hover:text-[#181925] transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmittingFeedback}
                        className="min-h-9 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground px-5 text-xs font-medium transition-colors disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        {isSubmittingFeedback ? (
                          <>
                            <Loader2 className="size-3.5 animate-spin" />
                            <span>Sending...</span>
                          </>
                        ) : (
                          <span>Send feedback</span>
                        )}
                      </button>
                    </div>
                  </form>
                )
              ) : (
                supportSuccess ? (
                  <div className="py-6 text-center flex flex-col items-center">
                    <div className="size-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 mb-3">
                      <Check className="size-5" />
                    </div>
                    <h3 className="text-base font-semibold text-[#181925] mb-1">
                      Message received
                    </h3>
                    <p className="text-xs text-[#71717a] max-w-xs leading-relaxed mb-5">
                      We’ve received your request and will reply to <strong className="font-medium text-[#181925]">{userEmail}</strong> shortly.
                    </p>
                    <button
                      type="button"
                      onClick={onClose}
                      className="min-h-9 rounded-full bg-[#181925] hover:bg-black px-6 text-xs font-medium text-white transition-all shadow-xs cursor-pointer"
                    >
                      Done
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSupportSubmit} className="space-y-3">
                    {supportError && (
                      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-50 border border-rose-100 text-rose-700 text-xs">
                        <AlertCircle className="size-3.5 shrink-0" />
                        <span>{supportError}</span>
                      </div>
                    )}

                    {/* Category Selection */}
                    <div>
                      <label className="block text-[11px] font-medium text-[#55585c] mb-1">
                        Category
                      </label>
                      <div className="grid grid-cols-4 gap-1.5">
                        {(["General", "Billing", "Memorial", "Technical"] as const).map((cat) => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setCategory(cat)}
                            className={`py-1.5 px-1 rounded-lg text-xs font-medium border text-center transition-all cursor-pointer ${
                              category === cat
                                ? "bg-[#181925] text-white border-[#181925] shadow-xs"
                                : "bg-[#fbfbfa] text-[#666] border-black/[0.08] hover:border-black/20 hover:text-[#181925]"
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Subject */}
                    <div>
                      <label htmlFor="modal-support-subject" className="block text-[11px] font-medium text-[#55585c] mb-1">
                        Subject
                      </label>
                      <input
                        id="modal-support-subject"
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="Brief summary..."
                        className="w-full min-h-9 rounded-xl border border-black/[0.08] bg-[#fbfbfa] px-3 text-xs text-[#181925] placeholder:text-[#999] focus:bg-white focus:border-[#181925] focus:ring-1 focus:ring-[#181925]/15 outline-none transition-all"
                        maxLength={200}
                        required
                      />
                    </div>

                    {/* Message */}
                    <div>
                      <label htmlFor="modal-support-message" className="block text-[11px] font-medium text-[#55585c] mb-1">
                        How can we help?
                      </label>
                      <textarea
                        id="modal-support-message"
                        rows={3}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Please share details so we can assist you..."
                        className="w-full rounded-xl border border-black/[0.08] bg-[#fbfbfa] p-2.5 text-xs text-[#181925] placeholder:text-[#999] focus:bg-white focus:border-[#181925] focus:ring-1 focus:ring-[#181925]/15 leading-relaxed outline-none transition-all resize-none"
                        maxLength={4000}
                        required
                      />
                    </div>

                    {/* Context info banner */}
                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-black/[0.02] border border-black/[0.04] text-[11px] text-[#71717a]">
                      <Mail className="size-3 text-[#888] shrink-0" />
                      <span>Replying to <strong className="text-[#181925] font-medium">{userEmail}</strong></span>
                    </div>

                    {/* Action Bar */}
                    <div className="pt-1 flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={onClose}
                        className="px-3 py-1.5 text-xs text-[#71717a] hover:text-[#181925] transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmittingSupport}
                        className="min-h-9 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground px-5 text-xs font-medium transition-colors disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        {isSubmittingSupport ? (
                          <>
                            <Loader2 className="size-3.5 animate-spin" />
                            <span>Sending...</span>
                          </>
                        ) : (
                          <span>Send message</span>
                        )}
                      </button>
                    </div>
                  </form>
                )
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
