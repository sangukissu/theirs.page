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
  const cleanRel = caretakerRelationship?.trim().toLowerCase()
  const formattedRel = cleanRel
    ? firstName && !cleanRel.includes(firstName.toLowerCase())
      ? `${firstName}’s ${cleanRel}`
      : cleanRel
    : null

  return (
    <>
      {/* Floating brand mark */}
      <aside
        aria-label="Theirs branding"
        className="fixed bottom-4 left-4 sm:bottom-5 sm:left-5 z-30 print:hidden select-none"
      >
        <Link
          href="/"
          title="theirs.page — online memorial website"
          className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--theme-bg-surface-elevated)] hover:brightness-105 backdrop-blur-md border border-[var(--theme-border)] transition-all duration-200 active:scale-95 cursor-pointer shadow-xs"
        >
          <TheirsLogo
            themeAware
            className="size-3.5 text-[var(--theme-accent)] shrink-0 transition-transform duration-200 group-hover:scale-105"
          />
          <span className="text-[11px] sm:text-xs font-medium tracking-tight text-[var(--theme-text-primary)]">
            theirs<span className="text-[var(--theme-accent)] font-semibold">.page</span>
          </span>
        </Link>
      </aside>

      {/* In-page minimal footer: two lines only, centered, flex column */}
      {(fullName || caretakerName) && (
        <footer
          aria-label={fullName ? `In loving memory of ${fullName}` : "Memorial footer"}
          className="w-full max-w-xl mx-auto mt-8 pt-8 pb-4 flex flex-col items-center justify-center text-center px-4 select-none print:hidden border-t border-[var(--theme-border)]/80"
        >
          {fullName && (
            <p className="font-serif text-sm sm:text-base text-[var(--theme-text-primary)] tracking-wide italic">
              In loving memory of {fullName}
            </p>
          )}
          {caretakerName && (
            <p className="mt-1 text-xs sm:text-[13px] text-[var(--theme-text-muted)] font-sans">
              Created by <span className="font-medium text-[var(--theme-text-body)]">{caretakerName}</span>
              {formattedRel && (
                <>
                  <span className="mx-2 opacity-50" aria-hidden="true">&middot;</span>
                  <span>{formattedRel}</span>
                </>
              )}
            </p>
          )}
        </footer>
      )}
    </>
  )
}
