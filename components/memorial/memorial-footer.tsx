"use client"

import Link from "next/link"
import { TheirsLogo } from "@/components/theirs/theirs-logo"

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
        className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--theme-bg-surface-elevated)] hover:brightness-105 backdrop-blur-md border border-[var(--theme-border)] transition-all duration-200 active:scale-95 cursor-pointer"
      >
        <TheirsLogo
          themeAware
          className="size-3.5 text-[var(--theme-accent)] shrink-0 transition-transform duration-200 group-hover:scale-105"
        />
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
