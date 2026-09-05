"use client"

import Link from "next/link"

interface MemorialFooterProps {
  fullName?: string
  slug?: string
  caretakerName?: string
  successorName?: string
}

export function MemorialFooter({}: MemorialFooterProps = {}) {
  return (
    <aside
      aria-label="Theirs branding"
      className="fixed bottom-4 left-4 sm:bottom-5 sm:left-5 z-30 print:hidden select-none"
    >
      <Link
        href="/"
        title="theirs.page — dedicated to a human life"
        className="group inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 hover:bg-white backdrop-blur-md border border-black/[0.08] hover:border-black/20 shadow-[0_2px_10px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.02)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-all duration-200 active:scale-95 cursor-pointer"
      >
        <svg
          viewBox="0 0 512 512"
          aria-hidden="true"
          className="size-3.5 text-primary shrink-0 transition-transform duration-200 group-hover:scale-105"
        >
          <clipPath id="theirs-memorial-badge-logo">
            <path
              clipRule="evenodd"
              d="M256 4a252 252 0 1 0 0 504 252 252 0 1 0 0-504Zm0 109a141 141 0 1 1 0 282 141 141 0 1 1 0-282Z"
              fillRule="evenodd"
            />
          </clipPath>
          <g clipPath="url(#theirs-memorial-badge-logo)" fill="currentColor">
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
        <span className="text-[11px] sm:text-xs font-medium tracking-tight text-[#181925] group-hover:text-black">
          theirs<span className="text-primary font-semibold">.page</span>
        </span>
      </Link>
    </aside>
  )
}
