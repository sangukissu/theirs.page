"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Gift,
  ShieldCheck,
  Sparkles,
  Loader2,
  ArrowRight,
  UserCheck,
} from "lucide-react"

interface ExistingMemorialOption {
  id: string
  full_name: string
  slug: string
  is_paid: boolean
}

interface GiftClaimClientProps {
  token: string
  claimInfo: {
    buyer_name: string
    recipient_name: string
    recipient_email: string
    gift_message?: string | null
    amount: number
  }
  currentUser: {
    id: string
    email?: string
  } | null
  existingMemorials?: ExistingMemorialOption[]
}

export function GiftClaimClient({
  token,
  claimInfo,
  currentUser,
  existingMemorials = [],
}: GiftClaimClientProps) {
  const router = useRouter()
  const [claimMode, setClaimMode] = useState<"new" | "existing">("new")
  const [fullName, setFullName] = useState("")
  const [relationship, setRelationship] = useState("")
  const [selectedMemorialId, setSelectedMemorialId] = useState(
    existingMemorials.length > 0 ? existingMemorials[0].id : ""
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Unauthenticated view
  if (!currentUser) {
    const loginRedirect = `/login?next=${encodeURIComponent(`/gift/claim?token=${token}`)}`

    return (
      <div className="w-full max-w-xl rounded-2xl border border-black/[0.08] bg-[#f7f7f8] p-6 sm:p-8 flex flex-col gap-6 text-left">
        {/* Gift Header Card */}
        <div className="flex items-center justify-between pb-4 border-b border-black/[0.06]">
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Gift className="size-4" />
            </span>
            <div>
              <p className="font-mono text-xs uppercase tracking-wider text-primary font-medium">
                Memorial Gift For
              </p>
              <h2 className="text-xl font-medium text-[#181925] tracking-tight">
                {claimInfo.recipient_name}
              </h2>
            </div>
          </div>
          <span className="font-mono text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200/70 px-2.5 py-1 rounded-full">
            $179 Prepaid
          </span>
        </div>

        {/* Buyer Greeting & Message */}
        <div className="rounded-xl border border-black/[0.06] bg-white p-4 flex flex-col gap-2">
          <p className="font-mono text-xs uppercase tracking-wider text-[#888]">
            From {claimInfo.buyer_name}:
          </p>
          {claimInfo.gift_message ? (
            <p className="font-serif italic text-sm leading-6 text-[#333]">
              “{claimInfo.gift_message}”
            </p>
          ) : (
            <p className="font-serif italic text-sm leading-6 text-[#555]">
              “Thinking of you and your family. We hope this gives you a quiet, enduring place to honor your loved one together.”
            </p>
          )}
        </div>

        {/* Explanation & Authentication Action */}
        <div className="flex flex-col gap-3">
          <div className="flex items-start gap-2.5 text-sm leading-6 text-[#666]">
            <ShieldCheck className="size-4 text-emerald-600 shrink-0 mt-1" />
            <span>
              This memorial entitlement is paid in full. To ensure that only you control and edit your loved one's memorial, please sign in or create your free account.
            </span>
          </div>

          <Link
            href={loginRedirect}
            className="w-full h-11 rounded-full font-medium text-sm transition-all cursor-pointer border border-[color-mix(in_srgb,var(--primary)_80%,#8c3a10)] bg-[color-mix(in_srgb,var(--primary)_90%,#8c3a10)] text-primary-foreground hover:bg-primary active:scale-[0.98] flex items-center justify-center gap-2 mt-2"
          >
            <span>Sign in or create account to claim</span>
            <ArrowRight className="size-4" />
          </Link>
          <p className="text-center text-xs text-[#888]">
            No credit card or payment will ever be required from you.
          </p>
        </div>
      </div>
    )
  }

  // Authenticated Claim Form
  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (claimMode === "new") {
      if (!fullName.trim() || fullName.trim().length < 2) {
        setErrorMessage("Please enter the full name of the loved one being remembered.")
        return
      }
    } else {
      if (!selectedMemorialId) {
        setErrorMessage("Please select a memorial to upgrade.")
        return
      }
    }

    setIsSubmitting(true)

    try {
      const res = await fetch("/api/gift/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          mode: claimMode === "new" ? "new_memorial" : "existing_memorial",
          fullName: claimMode === "new" ? fullName.trim() : undefined,
          creatorRelationship: claimMode === "new" && relationship.trim() ? relationship.trim() : undefined,
          memorialId: claimMode === "existing" ? selectedMemorialId : undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to redeem gift.")
      }

      if (data.redirectUrl) {
        router.push(data.redirectUrl)
      } else {
        router.push("/dashboard")
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred. Please try again.")
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full max-w-xl rounded-2xl border border-black/[0.08] bg-[#f7f7f8] p-6 sm:p-8 flex flex-col gap-6 text-left">
      {/* Top Banner */}
      <div className="flex items-center justify-between pb-4 border-b border-black/[0.06]">
        <div className="flex items-center gap-2">
          <UserCheck className="size-4 text-emerald-600" />
          <span className="text-xs text-[#666]">
            Signed in as <strong className="text-[#181925]">{currentUser.email || "Recipient"}</strong>
          </span>
        </div>
        <span className="font-mono text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200/70 px-2.5 py-0.5 rounded-full">
          $179 Gift Active
        </span>
      </div>

      {/* Gift Note Recall */}
      <div className="rounded-xl border border-black/[0.06] bg-white p-4 flex flex-col gap-1.5">
        <p className="font-mono text-xs uppercase tracking-wider text-[#888]">
          Gift from {claimInfo.buyer_name}
        </p>
        {claimInfo.gift_message && (
          <p className="font-serif italic text-sm leading-6 text-[#333]">
            “{claimInfo.gift_message}”
          </p>
        )}
      </div>

      {/* Mode Switcher (if user has existing memorials) */}
      {existingMemorials.length > 0 && (
        <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-white border border-black/[0.06]">
          <button
            type="button"
            onClick={() => setClaimMode("new")}
            className={`py-2 px-3 rounded-lg text-xs font-medium transition-colors ${
              claimMode === "new"
                ? "bg-[#181925] text-white"
                : "text-[#666] hover:text-[#181925]"
            }`}
          >
            Create new memorial
          </button>
          <button
            type="button"
            onClick={() => setClaimMode("existing")}
            className={`py-2 px-3 rounded-lg text-xs font-medium transition-colors ${
              claimMode === "existing"
                ? "bg-[#181925] text-white"
                : "text-[#666] hover:text-[#181925]"
            }`}
          >
            Upgrade existing memorial
          </button>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleRedeem} className="flex flex-col gap-5">
        {errorMessage && (
          <div className="rounded-xl border border-red-200 bg-red-50/80 p-3.5 text-sm text-red-800 leading-relaxed">
            {errorMessage}
          </div>
        )}

        {claimMode === "new" ? (
          <>
            <div>
              <label className="block font-mono text-xs uppercase tracking-wider text-[#888] font-medium mb-1.5">
                Who are you remembering? *
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Eleanor Vance"
                className="w-full rounded-xl border border-black/[0.08] bg-white px-3.5 py-2.5 text-sm font-medium text-[#181925] placeholder-[#aaa] focus:border-primary focus:outline-none transition-colors"
              />
              <p className="mt-1 text-xs text-[#777]">
                You can add their birth & death years, stories, and photos immediately after creation.
              </p>
            </div>

            <div>
              <label className="block font-mono text-xs uppercase tracking-wider text-[#888] font-medium mb-1.5">
                Your relationship to them (Optional)
              </label>
              <input
                type="text"
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                placeholder="e.g. Daughter, Grandson, Lifelong Friend"
                className="w-full rounded-xl border border-black/[0.08] bg-white px-3.5 py-2.5 text-sm font-medium text-[#181925] placeholder-[#aaa] focus:border-primary focus:outline-none transition-colors"
              />
            </div>
          </>
        ) : (
          <div>
            <label className="block font-mono text-xs uppercase tracking-wider text-[#888] font-medium mb-1.5">
              Select existing memorial to upgrade to Complete:
            </label>
            <div className="flex flex-col gap-2">
              {existingMemorials.map((mem) => (
                <label
                  key={mem.id}
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${
                    selectedMemorialId === mem.id
                      ? "border-primary bg-primary/5 text-[#181925]"
                      : "border-black/[0.08] bg-white text-[#555] hover:bg-[#fafafb]"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <input
                      type="radio"
                      name="existingMemorial"
                      value={mem.id}
                      checked={selectedMemorialId === mem.id}
                      onChange={() => setSelectedMemorialId(mem.id)}
                      className="accent-primary"
                    />
                    <div>
                      <p className="font-medium text-sm text-[#181925]">{mem.full_name}</p>
                      <p className="font-mono text-xs text-[#777]">theirs.page/{mem.slug}</p>
                    </div>
                  </div>

                  {mem.is_paid ? (
                    <span className="text-xs font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      Already Complete
                    </span>
                  ) : (
                    <span className="text-xs font-mono text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                      Free Plan
                    </span>
                  )}
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Benefits reminder */}
        <div className="rounded-xl border border-black/[0.06] bg-white p-4 flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5 font-medium text-sm text-[#181925]">
            <Sparkles className="size-3.5 text-primary" />
            <span>Complete Tier Entitlement Included</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs text-[#666]">
            <span>• Original-quality photos & media</span>
            <span>• Audio & voice notes</span>
            <span>• Invite family contributors</span>
            <span>• Zero recurring subscriptions</span>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-11 rounded-full font-medium text-sm transition-all cursor-pointer border border-[color-mix(in_srgb,var(--primary)_80%,#8c3a10)] bg-[color-mix(in_srgb,var(--primary)_90%,#8c3a10)] text-primary-foreground hover:bg-primary active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              <span>Activating memorial...</span>
            </>
          ) : (
            <>
              <span>
                {claimMode === "new"
                  ? "Claim Gift & Create Memorial"
                  : "Apply Gift & Upgrade Memorial"}
              </span>
              <ArrowRight className="size-4" />
            </>
          )}
        </button>
      </form>
    </div>
  )
}
