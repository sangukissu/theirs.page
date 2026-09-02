"use client"

import Link from "next/link"

export function TheirsNav() {
  return (
    <header className="sticky top-0 z-50 h-16 w-full px-4 sm:px-6 pt-3 sm:pt-4">
      <div className="relative mx-auto flex h-12 sm:h-13 w-full max-w-3xl items-center justify-between rounded-full border border-[#8f8f8f]/30 bg-[#d9d9d9]/50 px-2 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.06)]">
        {/* Clean Wordmark: Theirs. */}
        <Link href="/" className="flex items-center group ml-4">
          <span className="font-semibold tracking-tight text-[#181925] text-lg">
            Theirs<span className="text-primary">.</span>
          </span>
        </Link>

        {/* Center Links */}
        <div className="hidden sm:flex items-center gap-8 text-xs sm:text-sm font-medium text-[#666]">
          <Link href="#how-it-works" className="hover:text-[#181925] transition-colors">
            How it works
          </Link>
          <Link href="/robert-carter" className="hover:text-[#181925] transition-colors">
            Example
          </Link>
          <Link href="#pricing" className="hover:text-[#181925] transition-colors">
            Pricing
          </Link>
        </div>

        {/* Right CTA Button */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-1 whitespace-nowrap !rounded-full font-medium transition-all cursor-pointer border border-[color-mix(in_srgb,var(--primary)_80%,#3a3480)] bg-[color-mix(in_srgb,var(--primary)_90%,#3a3480)] text-primary-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.22),inset_0_-1px_0_rgba(58,52,128,0.30)] transform-gpu hover:bg-primary hover:border-[color-mix(in_srgb,var(--primary)_70%,#3a3480)] active:translate-y-px active:scale-[0.98] h-8.5 px-4 text-xs select-none"
          >
            Create a page
          </Link>
        </div>
      </div>
    </header>
  )
}
