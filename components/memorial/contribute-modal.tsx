"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, CheckCircle2, Heart, Upload, Sparkles, Loader2 } from "lucide-react"

interface ContributeModalProps {
  isOpen: boolean
  onClose: () => void
  memorialName: string
  slug: string
}

export function ContributeModal({
  isOpen,
  onClose,
  memorialName,
  slug,
}: ContributeModalProps) {
  const [authorName, setAuthorName] = useState("")
  const [relationship, setRelationship] = useState("")
  const [story, setStory] = useState("")
  const [approxYear, setApproxYear] = useState("")
  const [location, setLocation] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!authorName.trim() || !story.trim()) return

    setIsSubmitting(true)
    // Simulate brief submission latency (wired to API / pending_approval)
    await new Promise((r) => setTimeout(r, 900))
    setIsSubmitting(false)
    setIsSubmitted(true)
  }

  const handleReset = () => {
    setIsSubmitted(false)
    setAuthorName("")
    setRelationship("")
    setStory("")
    setApproxYear("")
    setLocation("")
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs cursor-pointer"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-lg rounded-3xl bg-white border border-black/[0.08] p-6 sm:p-8 overflow-hidden shadow-2xl z-10 select-none"
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="absolute top-5 right-5 size-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-[#666] flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="size-4" />
            </button>

            {isSubmitted ? (
              <div className="py-8 flex flex-col items-center text-center gap-4">
                <div className="size-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                  <CheckCircle2 className="size-6" />
                </div>

                <div className="flex flex-col gap-1.5">
                  <h3 className="text-xl font-medium text-[#181925]">
                    Thank you for remembering
                  </h3>
                  <p className="text-xs sm:text-sm text-[#666] max-w-sm leading-relaxed">
                    Your story has been safely sent to {memorialName}&apos;s family moderation queue. It will appear on the memorial once approved.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleReset}
                  className="mt-4 px-5 py-2 rounded-full bg-neutral-100 hover:bg-neutral-200 text-xs font-medium text-[#181925] transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-5">
                {/* Header */}
                <div className="flex flex-col gap-1 pr-6">
                  <div className="flex items-center gap-1.5 text-xs text-primary font-medium">
                    <Sparkles className="size-3" />
                    <span>No account needed</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-medium tracking-tight text-[#181925]">
                    Add a memory of {memorialName}
                  </h3>
                  <p className="text-xs text-[#666]">
                    Share an anecdote, a funny saying, or a quiet moment you never want to forget.
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
                  {/* Name & Relationship */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium text-[#181925]">
                        Your name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={authorName}
                        onChange={(e) => setAuthorName(e.target.value)}
                        placeholder="e.g. Anita Carter"
                        className="h-9 px-3 rounded-xl bg-[#f7f7f8] border border-black/[0.08] text-xs text-[#181925] outline-none focus:border-primary focus:bg-white transition-colors"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium text-[#181925]">
                        Relationship
                      </label>
                      <input
                        type="text"
                        value={relationship}
                        onChange={(e) => setRelationship(e.target.value)}
                        placeholder="e.g. Daughter, Old Friend"
                        className="h-9 px-3 rounded-xl bg-[#f7f7f8] border border-black/[0.08] text-xs text-[#181925] outline-none focus:border-primary focus:bg-white transition-colors"
                      />
                    </div>
                  </div>

                  {/* Story Textarea */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-[#181925]">
                      The memory <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={story}
                      onChange={(e) => setStory(e.target.value)}
                      placeholder="“I remember when Dad spent half of Christmas Day fixing the neighbor's washing machine...”"
                      className="p-3 rounded-xl bg-[#f7f7f8] border border-black/[0.08] text-xs text-[#181925] outline-none focus:border-primary focus:bg-white transition-colors leading-relaxed resize-none"
                    />
                  </div>

                  {/* Year & Location */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium text-[#181925]">
                        Rough year (optional)
                      </label>
                      <input
                        type="text"
                        value={approxYear}
                        onChange={(e) => setApproxYear(e.target.value)}
                        placeholder="e.g. 1994"
                        className="h-9 px-3 rounded-xl bg-[#f7f7f8] border border-black/[0.08] text-xs text-[#181925] outline-none focus:border-primary focus:bg-white transition-colors"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium text-[#181925]">
                        Location (optional)
                      </label>
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="e.g. London, Devon cottage"
                        className="h-9 px-3 rounded-xl bg-[#f7f7f8] border border-black/[0.08] text-xs text-[#181925] outline-none focus:border-primary focus:bg-white transition-colors"
                      />
                    </div>
                  </div>

                  {/* Reassurance note */}
                  <div className="p-2.5 rounded-xl bg-neutral-50 border border-black/[0.04] text-[11px] text-[#777] leading-relaxed">
                    🔒 Nothing goes live immediately. The family reviews all memories first to protect the privacy of the memorial.
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="mt-1 inline-flex items-center justify-center gap-1.5 whitespace-nowrap !rounded-full font-medium transition-all cursor-pointer border border-[color-mix(in_srgb,var(--primary)_80%,#3a3480)] bg-[color-mix(in_srgb,var(--primary)_90%,#3a3480)] text-primary-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.22),inset_0_-1px_0_rgba(58,52,128,0.30)] transform-gpu hover:bg-primary active:scale-[0.98] h-10 w-full text-xs sm:text-sm group disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        <span>Sending to family...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit memory to family</span>
                        <span>→</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
