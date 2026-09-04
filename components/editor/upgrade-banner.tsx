"use client"

import { useState } from "react"
import { Shield, Sparkles, Loader2, ArrowRight } from "lucide-react"

interface UpgradeBannerProps {
  memorialId: string
  featureTitle: string
  description: string
  bullets?: string[]
  compact?: boolean
  onUpgrade?: () => void
}

export function UpgradeBanner({
  memorialId,
  featureTitle,
  description,
  bullets,
  compact = false,
  onUpgrade,
}: UpgradeBannerProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCheckout = async () => {
    if (onUpgrade) {
      onUpgrade()
      return
    }

    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/checkout/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memorialId }),
      })
      const data = await res.json()
      const redirectUrl = data.url || data.checkout_url || data.payment_link
      if (!res.ok || !redirectUrl) {
        throw new Error(data.error || "Could not start checkout session")
      }
      window.location.href = redirectUrl
    } catch (err: any) {
      setError(err.message || "Failed to launch checkout")
      setLoading(false)
    }
  }

  if (compact) {
    return (
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[#1f1f1f] text-white border border-white/[0.08]">
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Sparkles className="size-4" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-white">{featureTitle}</span>
              <span className="text-[10px] font-mono uppercase font-semibold text-emerald-400 px-1.5 py-0.2 rounded bg-emerald-950/60 border border-emerald-800/40">
                Complete
              </span>
            </div>
            <span className="text-[11px] text-[#9c9c9c]">{description}</span>
          </div>
        </div>
        <button
          type="button"
          disabled={loading}
          onClick={handleCheckout}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-white hover:bg-neutral-100 text-[#181925] text-xs font-medium shrink-0 transition-all cursor-pointer disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="size-3 animate-spin" />
          ) : (
            <Shield className="size-3 text-primary" />
          )}
          <span>Upgrade to Complete ($179)</span>
        </button>
      </div>
    )
  }

  return (
    <div className="p-6 rounded-3xl bg-[#1f1f1f] text-white border border-white/[0.08] flex flex-col gap-4 shadow-sm">
      <div className="flex items-baseline justify-between gap-2 border-b border-white/[0.08] pb-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-wider text-emerald-400 font-semibold px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-800/40">
            Theirs Complete
          </span>
          <span className="text-xs text-[#888]">·</span>
          <span className="text-xs text-neutral-300 font-medium">$179 one-time</span>
        </div>
        <span className="text-[11px] text-[#888] font-mono">No monthly fees</span>
      </div>

      <div className="flex flex-col gap-1.5">
        <h3 className="text-base font-serif font-medium text-white">{featureTitle}</h3>
        <p className="text-xs text-[#9c9c9c] leading-relaxed">{description}</p>
      </div>

      {bullets && bullets.length > 0 && (
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-neutral-300 py-1">
          {bullets.map((b, i) => (
            <li key={i} className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-emerald-400 shrink-0" />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      )}

      {error && <span className="text-xs text-rose-400 font-medium">{error}</span>}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
        <span className="text-[11px] text-[#888]">
          One-time payment per memorial · Free forever once upgraded
        </span>
        <button
          type="button"
          disabled={loading}
          onClick={handleCheckout}
          className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full bg-white hover:bg-neutral-100 text-[#181925] text-xs font-medium shrink-0 transition-all cursor-pointer disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="size-3.5 animate-spin" />
              <span>Preparing checkout...</span>
            </>
          ) : (
            <>
              <Shield className="size-3.5 text-primary" />
              <span>Upgrade to Complete — $179</span>
              <ArrowRight className="size-3 ml-0.5" />
            </>
          )}
        </button>
      </div>
    </div>
  )
}
