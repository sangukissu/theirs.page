"use client"

import Link from "next/link"

export function TheirsNav() {
  return (
    <header className="sticky top-0 z-50 h-14 w-full px-4 sm:h-16 sm:px-6 pt-3">
      <div className="relative mx-auto flex h-11 sm:h-12 w-full max-w-2xl items-center justify-between rounded-full border border-[#8f8f8f]/30 bg-[#d9d9d9]/50 px-3.5 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.08)]">
        {/* Brand Ring Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <svg viewBox="0 0 512 512" aria-hidden="true" className="size-5 text-primary shrink-0">
            <clipPath id="theirs-ring-logo">
              <path clipRule="evenodd" d="M256 4a252 252 0 1 0 0 504 252 252 0 1 0 0-504Zm0 109a141 141 0 1 1 0 282 141 141 0 1 1 0-282Z" fillRule="evenodd" />
            </clipPath>
            <g clipPath="url(#theirs-ring-logo)" fill="currentColor">
              <rect height="20" width="512" x="0" y="4" />
              <rect height="20" width="512" x="0" y="36" />
              <rect height="20" width="512" x="0" y="68" />
              <rect height="20" width="512" x="0" y="100" />
              <rect height="20" width="512" x="0" y="132" />
              <rect height="20" width="512" x="0" y="164" />
              <rect height="20" width="512" x="0" y="196" />
              <rect height="20" width="512" x="0" y="228" />
              <rect height="20" width="512" x="0" y="260" />
              <rect height="20" width="512" x="0" y="292" />
              <rect height="188" width="512" x="0" y="324" />
            </g>
          </svg>
          <span className="font-medium tracking-tight text-[#454545] text-sm">
            Theirs
          </span>
        </Link>

        {/* Center Links */}
        <div className="hidden sm:flex items-center gap-5 text-xs font-medium text-[#666]">
          <Link href="#features" className="hover:text-[#181925] transition-colors">
            Features
          </Link>
          <Link href="#sample" className="hover:text-[#181925] transition-colors">
            Sample
          </Link>
          <Link href="#pricing" className="hover:text-[#181925] transition-colors">
            Pricing
          </Link>
        </div>

        {/* Right Button */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-1 whitespace-nowrap !rounded-full font-medium transition-all cursor-pointer border border-[color-mix(in_srgb,var(--primary)_80%,#3a3480)] bg-[color-mix(in_srgb,var(--primary)_90%,#3a3480)] text-primary-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.22),inset_0_-1px_0_rgba(58,52,128,0.30)] transform-gpu hover:bg-primary hover:border-[color-mix(in_srgb,var(--primary)_70%,#3a3480)] active:translate-y-px active:scale-[0.98] h-8 px-3 text-xs"
          >
            Get Started Free
          </Link>
        </div>
      </div>
    </header>
  )
}
