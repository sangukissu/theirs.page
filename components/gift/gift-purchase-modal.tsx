"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Gift, ShieldCheck, Heart, Sparkles, Loader2, ArrowRight } from "lucide-react"

interface GiftPurchaseModalProps {
  isOpen: boolean
  onClose: () => void
  defaultRecipientEmail?: string
  defaultRecipientName?: string
}

export function GiftPurchaseModal({
  isOpen,
  onClose,
  defaultRecipientEmail = "",
  defaultRecipientName = "",
}: GiftPurchaseModalProps) {
  const [buyerName, setBuyerName] = useState("")
  const [buyerEmail, setBuyerEmail] = useState("")
  const [recipientName, setRecipientName] = useState(defaultRecipientName)
  const [recipientEmail, setRecipientEmail] = useState(defaultRecipientEmail)
  const [giftMessage, setGiftMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!buyerName.trim()) {
      setErrorMessage("Please enter your name.")
      return
    }
    if (!buyerEmail.trim() || !buyerEmail.includes("@")) {
      setErrorMessage("Please enter a valid email address for your receipt.")
      return
    }
    if (!recipientName.trim()) {
      setErrorMessage("Please enter the recipient's name.")
      return
    }
    if (!recipientEmail.trim() || !recipientEmail.includes("@")) {
      setErrorMessage("Please enter the recipient's email address.")
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch("/api/gift/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buyer_name: buyerName.trim(),
          buyer_email: buyerEmail.trim().toLowerCase(),
          recipient_name: recipientName.trim(),
          recipient_email: recipientEmail.trim().toLowerCase(),
          gift_message: giftMessage.trim() || undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Unable to initiate gift checkout.")
      }

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      } else {
        throw new Error("No checkout URL received.")
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred. Please try again.")
      setIsLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 font-sans overflow-y-auto"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !isLoading) {
              onClose()
            }
          }}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
            className="fixed inset-0 bg-black/45 cursor-pointer"
          />

          {/* Modal Container - STRICT ZERO SHADOWS */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 8 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            role="dialog"
            aria-modal="true"
            className="relative w-full max-w-[540px] my-6 rounded-2xl bg-white border border-black/[0.12] z-10 flex flex-col overflow-hidden"
          >
            {/* Top Close Button */}
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="absolute right-3.5 top-3.5 size-8 rounded-full flex items-center justify-center text-[#737373] hover:bg-[#f3f4f6] hover:text-[#181925] transition-colors cursor-pointer disabled:opacity-50 z-20"
              aria-label="Close"
            >
              <X className="size-4" />
            </button>

            {/* Header */}
            <div className="px-6 pt-6 pb-5 border-b border-black/[0.06] bg-[#fafafb]">
              <div className="flex items-center gap-2.5 mb-2">
                <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Gift className="size-4" />
                </span>
                <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-primary font-medium">
                  Memorial Gift Entitlement
                </span>
              </div>
              <h2 className="font-serif text-xl sm:text-2xl text-[#181925] leading-tight font-normal">
                Gift a Complete memorial
              </h2>
              <p className="mt-1.5 text-xs sm:text-sm text-[#666] leading-relaxed">
                Give a loved one or family member the gift of a permanent memorial archive, completely prepaid. They can create a new memorial or upgrade an existing one whenever they feel ready.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
              {errorMessage && (
                <div className="rounded-lg border border-red-200 bg-red-50/70 p-3 text-xs text-red-800 leading-relaxed">
                  {errorMessage}
                </div>
              )}

              {/* Recipient Details */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#181925]">
                  <Heart className="size-3.5 text-primary" />
                  <span>Who is this gift for?</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-mono text-[10px] uppercase tracking-wider text-[#666] mb-1">
                      Recipient Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      placeholder="e.g. Sarah Mitchell"
                      className="w-full rounded-lg border border-black/[0.12] bg-[#fafafb] px-3 py-2 text-sm text-[#181925] placeholder-[#999] focus:bg-white focus:border-primary focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block font-mono text-[10px] uppercase tracking-wider text-[#666] mb-1">
                      Recipient Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={recipientEmail}
                      onChange={(e) => setRecipientEmail(e.target.value)}
                      placeholder="sarah@example.com"
                      className="w-full rounded-lg border border-black/[0.12] bg-[#fafafb] px-3 py-2 text-sm text-[#181925] placeholder-[#999] focus:bg-white focus:border-primary focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Personal Message */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-mono text-[10px] uppercase tracking-wider text-[#666]">
                    Personal Note (Optional)
                  </label>
                  <span className="text-[10px] text-[#888]">
                    {giftMessage.length}/1000
                  </span>
                </div>
                <textarea
                  rows={3}
                  maxLength={1000}
                  value={giftMessage}
                  onChange={(e) => setGiftMessage(e.target.value)}
                  placeholder="e.g. Thinking of you and your family. We hope this gives you a quiet, enduring place to honor your father together."
                  className="w-full rounded-lg border border-black/[0.12] bg-[#fafafb] px-3 py-2 text-sm text-[#181925] placeholder-[#999] focus:bg-white focus:border-primary focus:outline-none transition-colors resize-none leading-relaxed"
                />
              </div>

              {/* Buyer Details */}
              <div className="flex flex-col gap-3 pt-2 border-t border-black/[0.06]">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#181925]">
                  <Sparkles className="size-3.5 text-primary" />
                  <span>Your details (for receipt & greeting)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-mono text-[10px] uppercase tracking-wider text-[#666] mb-1">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={buyerName}
                      onChange={(e) => setBuyerName(e.target.value)}
                      placeholder="e.g. David Ross"
                      className="w-full rounded-lg border border-black/[0.12] bg-[#fafafb] px-3 py-2 text-sm text-[#181925] placeholder-[#999] focus:bg-white focus:border-primary focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block font-mono text-[10px] uppercase tracking-wider text-[#666] mb-1">
                      Your Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={buyerEmail}
                      onChange={(e) => setBuyerEmail(e.target.value)}
                      placeholder="david@example.com"
                      className="w-full rounded-lg border border-black/[0.12] bg-[#fafafb] px-3 py-2 text-sm text-[#181925] placeholder-[#999] focus:bg-white focus:border-primary focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Value & Guarantees Box */}
              <div className="rounded-xl border border-black/[0.08] bg-[#fbfbfc] p-3.5 text-xs text-[#555] flex flex-col gap-2">
                <div className="flex items-center justify-between font-medium text-[#181925] pb-1.5 border-b border-black/[0.05]">
                  <span>Complete Memorial Entitlement</span>
                  <span className="font-mono text-sm text-primary">$179 one-time</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-[#666]">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="size-3.5 text-emerald-600 shrink-0" />
                    <span>No subscriptions or hidden fees</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="size-3.5 text-emerald-600 shrink-0" />
                    <span>Never expires; claim at any time</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="size-3.5 text-emerald-600 shrink-0" />
                    <span>Full private ownership for recipient</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="size-3.5 text-emerald-600 shrink-0" />
                    <span>Unlimited photos, audio & contributors</span>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 rounded-full font-medium text-sm transition-all cursor-pointer border border-[color-mix(in_srgb,var(--primary)_80%,#8c3a10)] bg-[color-mix(in_srgb,var(--primary)_90%,#8c3a10)] text-primary-foreground hover:bg-primary hover:border-[color-mix(in_srgb,var(--primary)_70%,#8c3a10)] active:translate-y-px active:scale-[0.99] disabled:opacity-60 flex items-center justify-center gap-2 mt-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>Preparing secure checkout...</span>
                  </>
                ) : (
                  <>
                    <span>Continue to secure checkout — $179</span>
                    <ArrowRight className="size-4" />
                  </>
                )}
              </button>

              <p className="text-center text-[11px] text-[#737373]">
                Processed securely with Dodo Payments. You will also receive an email receipt with the direct claim link.
              </p>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
