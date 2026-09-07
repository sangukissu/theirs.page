"use client"

import Link from "next/link"

interface MemorialFooterProps {
  fullName?: string
  caretakerName?: string
  caretakerRelationship?: string
}

export function MemorialFooter({
  fullName,
  caretakerName,
  caretakerRelationship,
}: MemorialFooterProps = {}) {
  const firstName = fullName?.trim().split(/\s+/)[0]

  return (
    <aside
      aria-label={fullName ? `About ${fullName}'s memorial` : "Theirs branding"}
      className="fixed bottom-4 left-4 sm:bottom-5 sm:left-5 z-30 print:hidden select-none flex flex-wrap items-center gap-2"
    >
      <Link
        href="/"
        title="theirs.page — dedicated to a human life"
        className="group inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--theme-bg-surface-elevated)] hover:brightness-105 backdrop-blur-md border border-[var(--theme-border)] transition-all duration-200 active:scale-95 cursor-pointer"
      >
        <svg
          viewBox="0 0 512 512"
          aria-hidden="true"
          className="size-3.5 text-[var(--theme-accent)] shrink-0 transition-transform duration-200 group-hover:scale-105"
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
        <span className="text-[11px] sm:text-xs font-medium tracking-tight text-[var(--theme-text-primary)]">
          theirs<span className="text-[var(--theme-accent)] font-semibold">.page</span>
        </span>
      </Link>
      {caretakerName && (
        <span className="max-w-[min(70vw,24rem)] truncate rounded-full border border-[var(--theme-border)] bg-[var(--theme-bg-surface-elevated)] px-3 py-1.5 text-[11px] text-[var(--theme-text-muted)] sm:text-xs">
          Created by <strong className="font-medium text-[var(--theme-text-primary)]">{caretakerName}</strong>
          {caretakerRelationship ? (
            <> &middot; {firstName ? `${firstName}’s ` : ""}{caretakerRelationship.toLowerCase()}</>
          ) : null}
        </span>
      )}
    </aside>
  )
}
