"use client"

import React, { useState } from "react"
import { Loader2, ArrowRight, ShieldCheck, Heart, Sparkles, CheckCircle2 } from "lucide-react"

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
      className="w-full max-w-2xl mx-auto rounded-3xl bg-[#f7f7f8] border border-black/[0.06] p-6 sm:p-10 flex flex-col gap-8 text-left"
    >
      {errorMessage && (
        <div className="rounded-2xl border border-red-200 bg-red-50/80 p-4 text-sm text-red-800 leading-relaxed">
          {errorMessage}
        </div>
      )}

      {/* Step 1: Recipient Details */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between pb-2 border-b border-black/[0.06]">
          <div className="flex items-center gap-2">
            <span className="size-6 rounded-md bg-primary/10 text-primary flex items-center justify-center">
              <Heart className="size-3.5" />
            </span>
            <h3 className="text-base font-medium text-[#181925] tracking-tight">
              1. Who is this gift for?
            </h3>
          </div>
          <span className="text-xs font-mono text-[#888]">Step 1 of 2</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="flex flex-col rounded-xl bg-white border border-black/[0.08] p-3 sm:p-3.5 focus-within:border-primary/50 transition-colors">
            <label className="text-xs font-mono uppercase tracking-wider text-[#888] font-medium mb-1">
              Recipient's Full Name *
            </label>
            <input
              type="text"
              required
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              placeholder="e.g. Sarah Mitchell"
              className="w-full bg-transparent font-medium text-sm text-[#181925] outline-none placeholder:text-[#aaa]"
            />
          </div>

          <div className="flex flex-col rounded-xl bg-white border border-black/[0.08] p-3 sm:p-3.5 focus-within:border-primary/50 transition-colors">
            <label className="text-xs font-mono uppercase tracking-wider text-[#888] font-medium mb-1">
              Recipient's Email Address *
            </label>
            <input
              type="email"
              required
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              placeholder="sarah@example.com"
              className="w-full bg-transparent font-medium text-sm text-[#181925] outline-none placeholder:text-[#aaa]"
            />
          </div>
        </div>
        <p className="text-xs text-[#777] leading-relaxed -mt-1">
          Their private invitation and personalized claim instructions will be emailed here.
        </p>
      </div>

      {/* Personal Note */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-mono uppercase tracking-wider text-[#888] font-medium">
            Personal Note or Sympathy Message (Optional)
          </label>
          <span className="text-xs font-mono text-[#888]">
            {giftMessage.length}/1000
          </span>
        </div>
        <div className="rounded-xl bg-white border border-black/[0.08] p-3 sm:p-3.5 focus-within:border-primary/50 transition-colors">
          <textarea
            rows={3}
            maxLength={1000}
            value={giftMessage}
            onChange={(e) => setGiftMessage(e.target.value)}
            placeholder="e.g. Thinking of you and your family. We wanted you to have a quiet, lasting place to celebrate your dad's life and gather memories whenever you feel ready."
            className="w-full bg-transparent font-serif italic text-sm text-[#181925] outline-none placeholder:text-[#aaa] placeholder:font-sans placeholder:not-italic resize-none leading-relaxed"
          />
        </div>
        <p className="text-xs text-[#777]">
          Presented in their invitation as an editorial quote card.
        </p>
      </div>

      {/* Step 2: Buyer Details */}
      <div className="flex flex-col gap-4 pt-2">
        <div className="flex items-center justify-between pb-2 border-b border-black/[0.06]">
          <div className="flex items-center gap-2">
            <span className="size-6 rounded-md bg-primary/10 text-primary flex items-center justify-center">
              <Sparkles className="size-3.5" />
            </span>
            <h3 className="text-base font-medium text-[#181925] tracking-tight">
              2. Your details (for greeting & receipt)
            </h3>
          </div>
          <span className="text-xs font-mono text-[#888]">Step 2 of 2</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="flex flex-col rounded-xl bg-white border border-black/[0.08] p-3 sm:p-3.5 focus-within:border-primary/50 transition-colors">
            <label className="text-xs font-mono uppercase tracking-wider text-[#888] font-medium mb-1">
              Your Full Name *
            </label>
            <input
              type="text"
              required
              value={buyerName}
              onChange={(e) => setBuyerName(e.target.value)}
              placeholder="e.g. David Ross"
              className="w-full bg-transparent font-medium text-sm text-[#181925] outline-none placeholder:text-[#aaa]"
            />
          </div>

          <div className="flex flex-col rounded-xl bg-white border border-black/[0.08] p-3 sm:p-3.5 focus-within:border-primary/50 transition-colors">
            <label className="text-xs font-mono uppercase tracking-wider text-[#888] font-medium mb-1">
              Your Email Address *
            </label>
            <input
              type="email"
              required
              value={buyerEmail}
              onChange={(e) => setBuyerEmail(e.target.value)}
              placeholder="david@example.com"
              className="w-full bg-transparent font-medium text-sm text-[#181925] outline-none placeholder:text-[#aaa]"
            />
          </div>
        </div>
        <p className="text-xs text-[#777] leading-relaxed -mt-1">
          Your official receipt and backup claim link will be emailed to you immediately upon payment.
        </p>
      </div>

      {/* Value Summary Card */}
      <div className="rounded-2xl bg-white border border-black/[0.08] p-5 flex flex-col gap-3.5">
        <div className="flex items-baseline justify-between pb-2.5 border-b border-black/[0.06]">
          <div>
            <span className="font-mono text-xs uppercase tracking-wider text-primary font-medium">
              Complete Memorial Entitlement
            </span>
            <p className="text-xs text-[#666] mt-0.5">
              Permanent prepaid family archive · Limitless contributors
            </p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-medium tracking-tight text-[#181925] tabular-nums">
              $179
            </span>
            <span className="text-xs text-[#888] ml-1 font-normal">one-time</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#555]">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0" />
            <span>Never expires — ready when they are</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0" />
            <span>Zero recurring monthly subscriptions</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0" />
            <span>Unlimited original photos & audio notes</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0" />
            <span>Full private ownership for recipient</span>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="flex flex-col gap-2.5">
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap !rounded-full font-medium transition-all cursor-pointer border border-[color-mix(in_srgb,var(--primary)_80%,#8c3a10)] bg-[color-mix(in_srgb,var(--primary)_90%,#8c3a10)] text-primary-foreground hover:bg-primary active:scale-[0.98] h-12 px-6 text-sm group select-none w-full disabled:opacity-60"
        >
          {isLoading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              <span>Connecting to secure checkout...</span>
            </>
          ) : (
            <>
              <span>Continue to secure payment — $179</span>
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </button>

        <div className="flex items-center justify-center gap-2 text-xs text-[#888]">
          <ShieldCheck className="size-3.5 text-[#888]" />
          <span>Encrypted checkout via Dodo Payments. No account registration needed to purchase.</span>
        </div>
      </div>
    </form>
  )
}
