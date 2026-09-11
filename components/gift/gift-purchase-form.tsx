"use client"

import React, { useState } from "react"
import { Loader2, ArrowRight, ShieldCheck, Heart, Sparkles } from "lucide-react"

export function GiftPurchaseForm() {
  const [buyerName, setBuyerName] = useState("")
  const [buyerEmail, setBuyerEmail] = useState("")
  const [recipientName, setRecipientName] = useState("")
  const [recipientEmail, setRecipientEmail] = useState("")
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
    <form
      onSubmit={handleSubmit}
      className="w-full rounded-2xl bg-white border border-black/[0.1] p-6 sm:p-8 flex flex-col gap-6"
    >
      {errorMessage && (
        <div className="rounded-xl border border-red-200 bg-red-50/70 p-3.5 text-xs sm:text-sm text-red-800 leading-relaxed">
          {errorMessage}
        </div>
      )}

      {/* Recipient Section */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 pb-2 border-b border-black/[0.06]">
          <span className="flex size-6 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Heart className="size-3.5" />
          </span>
          <h3 className="text-sm font-semibold text-[#181925]">
            1. Who is this gift for?
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div>
            <label className="block font-mono text-[11px] uppercase tracking-wider text-[#666] mb-1.5">
              Recipient's Full Name *
            </label>
            <input
              type="text"
              required
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              placeholder="e.g. Sarah Mitchell"
              className="w-full rounded-xl border border-black/[0.12] bg-[#fafafb] px-3.5 py-2.5 text-sm text-[#181925] placeholder-[#999] focus:bg-white focus:border-primary focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block font-mono text-[11px] uppercase tracking-wider text-[#666] mb-1.5">
              Recipient's Email Address *
            </label>
            <input
              type="email"
              required
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              placeholder="sarah@example.com"
              className="w-full rounded-xl border border-black/[0.12] bg-[#fafafb] px-3.5 py-2.5 text-sm text-[#181925] placeholder-[#999] focus:bg-white focus:border-primary focus:outline-none transition-colors"
            />
            <p className="mt-1 text-[11px] text-[#777]">
              Their private claim link and invitation will be sent here upon payment.
            </p>
          </div>
        </div>
      </div>

      {/* Personal Message Section */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="block font-mono text-[11px] uppercase tracking-wider text-[#666]">
            Personal Note (Optional)
          </label>
          <span className="text-[11px] text-[#888] font-mono">
            {giftMessage.length}/1000
          </span>
        </div>
        <textarea
          rows={3}
          maxLength={1000}
          value={giftMessage}
          onChange={(e) => setGiftMessage(e.target.value)}
          placeholder="e.g. Thinking of you and your family. We hope this gives you a quiet, enduring place to honor your dad's life and stories together."
          className="w-full rounded-xl border border-black/[0.12] bg-[#fafafb] px-3.5 py-2.5 text-sm text-[#181925] placeholder-[#999] focus:bg-white focus:border-primary focus:outline-none transition-colors resize-none leading-relaxed"
        />
        <p className="text-[11px] text-[#777]">
          Included in their email invitation as a highlighted personal quote card.
        </p>
      </div>

      {/* Buyer Section */}
      <div className="flex flex-col gap-3 pt-2">
        <div className="flex items-center gap-2 pb-2 border-b border-black/[0.06]">
          <span className="flex size-6 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Sparkles className="size-3.5" />
          </span>
          <h3 className="text-sm font-semibold text-[#181925]">
            2. Your details
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div>
            <label className="block font-mono text-[11px] uppercase tracking-wider text-[#666] mb-1.5">
              Your Full Name *
            </label>
            <input
              type="text"
              required
              value={buyerName}
              onChange={(e) => setBuyerName(e.target.value)}
              placeholder="e.g. David Ross"
              className="w-full rounded-xl border border-black/[0.12] bg-[#fafafb] px-3.5 py-2.5 text-sm text-[#181925] placeholder-[#999] focus:bg-white focus:border-primary focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block font-mono text-[11px] uppercase tracking-wider text-[#666] mb-1.5">
              Your Email Address *
            </label>
            <input
              type="email"
              required
              value={buyerEmail}
              onChange={(e) => setBuyerEmail(e.target.value)}
              placeholder="david@example.com"
              className="w-full rounded-xl border border-black/[0.12] bg-[#fafafb] px-3.5 py-2.5 text-sm text-[#181925] placeholder-[#999] focus:bg-white focus:border-primary focus:outline-none transition-colors"
            />
            <p className="mt-1 text-[11px] text-[#777]">
              Your official receipt and backup claim link will be sent here immediately.
            </p>
          </div>
        </div>
      </div>

      {/* Summary Entitlement Card */}
      <div className="rounded-xl border border-black/[0.08] bg-[#fafafb] p-4 flex flex-col gap-3">
        <div className="flex items-baseline justify-between pb-2 border-b border-black/[0.06]">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-wider text-primary font-medium">
              Complete Memorial Entitlement
            </p>
            <p className="text-xs text-[#666] mt-0.5">
              Prepaid lifetime family archive with limitless contributions
            </p>
          </div>
          <p className="font-mono text-xl font-medium text-[#181925] tabular-nums">
            $179
            <span className="text-xs text-[#888] font-normal ml-1">one-time</span>
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#555]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-emerald-600 shrink-0" />
            <span>Never expires — ready when they are</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-emerald-600 shrink-0" />
            <span>Zero subscriptions or hidden costs</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-emerald-600 shrink-0" />
            <span>Full private ownership for recipient</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-emerald-600 shrink-0" />
            <span>Usable for new or existing memorial</span>
          </div>
        </div>
      </div>

      {/* Action CTA */}
      <div className="flex flex-col gap-2 pt-1">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 rounded-full font-medium text-sm transition-all cursor-pointer border border-[color-mix(in_srgb,var(--primary)_80%,#8c3a10)] bg-[color-mix(in_srgb,var(--primary)_90%,#8c3a10)] text-primary-foreground hover:bg-primary hover:border-[color-mix(in_srgb,var(--primary)_70%,#8c3a10)] active:translate-y-px active:scale-[0.99] disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              <span>Connecting to secure checkout...</span>
            </>
          ) : (
            <>
              <span>Purchase Gift Memorial — $179</span>
              <ArrowRight className="size-4" />
            </>
          )}
        </button>

        <p className="text-center text-[11px] text-[#737373]">
          Encrypted 256-bit checkout powered by Dodo Payments. No account registration required to purchase.
        </p>
      </div>
    </form>
  )
}
