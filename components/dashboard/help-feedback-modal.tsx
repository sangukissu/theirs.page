"use client"

import React, { useState, useEffect } from "react"
import { X, Check, Loader2, MessageSquare, LifeBuoy, Star } from "lucide-react"
import { SupportCategory } from "@/types/theirs"

interface HelpFeedbackModalProps {
  isOpen: boolean
  onClose: () => void
  userEmail: string
  userId?: string
  memorialId?: string
}

type ModalTab = "feedback" | "support"

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
      setFeedbackSuccess(false)
      setFeedbackError(null)

      setCategory("General")
      setSubject("")
      setMessage("")
      setSupportSuccess(false)
      setSupportError(null)
    }
  }, [isOpen])

  // Handle ESC key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        onClose()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!workingWell.trim() && !couldBeBetter.trim() && rating === null) {
      setFeedbackError("Please share some feedback or an optional experience rating.")
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
      setSupportError("Please enter a subject for your request.")
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in-50">
      <div
        className="bg-white rounded-3xl border border-black/[0.08] shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="help-feedback-title"
      >
        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-black/[0.06] flex items-center justify-between">
          {/* Subview switcher tabs */}
          <div className="flex items-center gap-1 p-1 bg-black/[0.03] rounded-full border border-black/[0.04]">
            <button
              type="button"
              onClick={() => setActiveTab("feedback")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                activeTab === "feedback"
                  ? "bg-white text-[#181925] shadow-sm shadow-black/5"
                  : "text-[#71717a] hover:text-[#181925]"
              }`}
            >
              <MessageSquare className="size-3.5" />
              <span>Send feedback</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("support")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                activeTab === "support"
                  ? "bg-white text-[#181925] shadow-sm shadow-black/5"
                  : "text-[#71717a] hover:text-[#181925]"
              }`}
            >
              <LifeBuoy className="size-3.5" />
              <span>Contact support</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="size-8 rounded-full flex items-center justify-center text-[#71717a] hover:text-[#181925] hover:bg-black/[0.05] transition-colors"
            aria-label="Close dialog"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto">
          {activeTab === "feedback" ? (
            feedbackSuccess ? (
              <div className="py-8 text-center flex flex-col items-center">
                <div className="size-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                  <Check className="size-6" />
                </div>
                <h3 className="font-serif text-xl font-normal text-[#181925] mb-2">
                  Thank you for your feedback
                </h3>
                <p className="text-sm text-[#71717a] max-w-sm mb-6">
                  We read every response and deeply appreciate you taking the time to help us improve Theirs.
                </p>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-full bg-[#181925] text-white text-xs font-medium hover:bg-black transition-colors"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                <div>
                  <h3 id="help-feedback-title" className="font-serif text-xl font-normal text-[#181925]">
                    Help us improve Theirs
                  </h3>
                  <p className="text-xs text-[#71717a] mt-1">
                    Your thoughts help us build a more thoughtful space for remembering loved ones.
                  </p>
                </div>

                {feedbackError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-700 text-xs">
                    {feedbackError}
                  </div>
                )}

                {/* Experience rating (optional) */}
                <div>
                  <label className="block text-xs font-medium text-[#181925] mb-1.5">
                    How has your experience been so far? <span className="text-[#888] font-normal">(Optional)</span>
                  </label>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((val) => {
                      const isSelected = rating !== null && val <= rating
                      return (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setRating(rating === val ? null : val)}
                          className={`flex items-center justify-center size-9 rounded-xl border transition-all ${
                            isSelected
                              ? "bg-amber-50 border-amber-300 text-amber-500"
                              : "bg-white border-black/[0.08] text-[#888] hover:border-black/20 hover:text-[#181925]"
                          }`}
                          title={`Rating ${val} of 5`}
                        >
                          <Star className={`size-4 ${isSelected ? "fill-amber-400" : ""}`} />
                        </button>
                      )
                    })}
                    {rating !== null && (
                      <button
                        type="button"
                        onClick={() => setRating(null)}
                        className="text-[11px] text-[#888] hover:text-[#181925] ml-2 underline underline-offset-2"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                {/* What's working well? */}
                <div>
                  <label htmlFor="working-well" className="block text-xs font-medium text-[#181925] mb-1">
                    What’s working well?
                  </label>
                  <textarea
                    id="working-well"
                    rows={3}
                    value={workingWell}
                    onChange={(e) => setWorkingWell(e.target.value)}
                    placeholder="Tell us what you've enjoyed or found comforting..."
                    className="w-full text-xs p-3 rounded-xl border border-black/[0.1] focus:border-[#305dde] focus:ring-1 focus:ring-[#305dde] outline-none transition-all placeholder:text-[#999] resize-none"
                    maxLength={3000}
                  />
                </div>

                {/* What could be better? */}
                <div>
                  <label htmlFor="could-be-better" className="block text-xs font-medium text-[#181925] mb-1">
                    What could be better?
                  </label>
                  <textarea
                    id="could-be-better"
                    rows={3}
                    value={couldBeBetter}
                    onChange={(e) => setCouldBeBetter(e.target.value)}
                    placeholder="What felt confusing, missing, or in need of polish?..."
                    className="w-full text-xs p-3 rounded-xl border border-black/[0.1] focus:border-[#305dde] focus:ring-1 focus:ring-[#305dde] outline-none transition-all placeholder:text-[#999] resize-none"
                    maxLength={3000}
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-full text-xs font-medium text-[#71717a] hover:text-[#181925] hover:bg-black/[0.03] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingFeedback}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#305dde] hover:bg-[#274ebd] text-white text-xs font-medium transition-colors disabled:opacity-50"
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
              <div className="py-8 text-center flex flex-col items-center">
                <div className="size-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                  <Check className="size-6" />
                </div>
                <h3 className="font-serif text-xl font-normal text-[#181925] mb-2">
                  Message received
                </h3>
                <p className="text-sm text-[#71717a] max-w-sm mb-6">
                  Thank you for reaching out. We&apos;ve sent your request to our support team and will reply to <span className="font-medium text-[#181925]">{userEmail}</span> shortly.
                </p>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-full bg-[#181925] text-white text-xs font-medium hover:bg-black transition-colors"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleSupportSubmit} className="space-y-4">
                <div>
                  <h3 className="font-serif text-xl font-normal text-[#181925]">
                    Contact support
                  </h3>
                  <p className="text-xs text-[#71717a] mt-1">
                    Have a question or need assistance? We&apos;re here to help.
                  </p>
                </div>

                {supportError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-700 text-xs">
                    {supportError}
                  </div>
                )}

                {/* Category Pills */}
                <div>
                  <label className="block text-xs font-medium text-[#181925] mb-1.5">
                    Category
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {(["General", "Billing", "Memorial", "Technical"] as const).map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategory(cat)}
                        className={`py-1.5 px-2 rounded-xl text-xs font-medium border text-center transition-all ${
                          category === cat
                            ? "bg-[#181925] text-white border-[#181925]"
                            : "bg-white text-[#71717a] border-black/[0.08] hover:border-black/20 hover:text-[#181925]"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label htmlFor="support-subject" className="block text-xs font-medium text-[#181925] mb-1">
                    Subject
                  </label>
                  <input
                    id="support-subject"
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Brief summary of your question..."
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-black/[0.1] focus:border-[#305dde] focus:ring-1 focus:ring-[#305dde] outline-none transition-all placeholder:text-[#999]"
                    maxLength={200}
                    required
                  />
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="support-message" className="block text-xs font-medium text-[#181925] mb-1">
                    How can we help?
                  </label>
                  <textarea
                    id="support-message"
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Please provide details so we can assist you quickly..."
                    className="w-full text-xs p-3 rounded-xl border border-black/[0.1] focus:border-[#305dde] focus:ring-1 focus:ring-[#305dde] outline-none transition-all placeholder:text-[#999] resize-none"
                    maxLength={4000}
                    required
                  />
                </div>

                <div className="p-3 rounded-xl bg-black/[0.02] border border-black/[0.04] text-[11px] text-[#71717a]">
                  We will reply directly to <span className="font-medium text-[#181925]">{userEmail}</span>.
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-full text-xs font-medium text-[#71717a] hover:text-[#181925] hover:bg-black/[0.03] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingSupport}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#305dde] hover:bg-[#274ebd] text-white text-xs font-medium transition-colors disabled:opacity-50"
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
      </div>
    </div>
  )
}
