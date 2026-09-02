"use client"

import { useState } from "react"
import Link from "next/link"
import { Share2, Heart, Plus, Check } from "lucide-react"

interface MemorialNavProps {
  slug: string
  fullName: string
  onOpenContribute: () => void
}

export function MemorialNav({ slug, fullName, onOpenContribute }: MemorialNavProps) {
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : `https://theirs.page/${slug}`
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <nav className="fixed top-4 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
      <div className="pointer-events-auto flex items-center justify-between gap-3 px-3.5 py-2 rounded-full bg-white/85 backdrop-blur-md border border-black/[0.08] shadow-xs max-w-2xl w-full">
        {/* Brand & Slug Pill */}
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs font-semibold tracking-tight text-[#181925] hover:opacity-80 transition-opacity select-none"
          >
            <span className="size-1.5 rounded-full bg-primary" />
            <span>theirs</span>
          </Link>
          <span className="text-black/[0.15]">/</span>
          <span className="text-xs font-mono text-[#666] truncate max-w-[140px] sm:max-w-[200px]">
            {slug}
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Share Button */}
          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-[#555] hover:text-[#181925] hover:bg-neutral-100 transition-colors cursor-pointer select-none"
            aria-label="Share memorial link"
          >
            {copied ? (
              <>
                <Check className="size-3.5 text-emerald-600" />
                <span className="text-emerald-600 font-medium">Copied</span>
              </>
            ) : (
              <>
                <Share2 className="size-3.5 text-[#888]" />
                <span className="hidden sm:inline">Share</span>
              </>
            )}
          </button>

          {/* Primary Action: Add Memory */}
          <button
            type="button"
            onClick={onOpenContribute}
            className="inline-flex items-center justify-center gap-1 whitespace-nowrap !rounded-full font-medium transition-all cursor-pointer border border-[color-mix(in_srgb,var(--primary)_80%,#3a3480)] bg-[color-mix(in_srgb,var(--primary)_90%,#3a3480)] text-primary-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.22),inset_0_-1px_0_rgba(58,52,128,0.30)] transform-gpu hover:bg-primary active:scale-[0.98] h-8 px-3.5 text-xs select-none"
          >
            <Plus className="size-3.5" />
            <span>Add a Memory</span>
          </button>
        </div>
      </div>
    </nav>
  )
}
