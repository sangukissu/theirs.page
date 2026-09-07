"use client"

import React from "react"
import type { MemorialThemeId } from "@/lib/memorial/themes"

interface ThemeDividerProps {
  themeId?: MemorialThemeId
  className?: string
}

export function ThemeDivider({ themeId = "quiet", className = "" }: ThemeDividerProps) {
  if (themeId === "garden") {
    return (
      <div className={`flex items-center justify-center gap-3 py-6 my-2 text-[var(--theme-accent)] opacity-70 select-none ${className}`} aria-hidden="true">
        <span className="h-px w-12 sm:w-20 bg-gradient-to-r from-transparent to-[var(--theme-accent)]" />
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="size-4">
          <path d="M12 21a9 9 0 0 0 9-9c0-4.97-4.03-9-9-9-4.97 0-9 4.03-9 9 0 5 4 9 9 9Z" stroke="none" />
          <path d="M12 3c-4.5 4.5-3 11 0 16 3-5 4.5-11.5 0-16Z" fill="currentColor" fillOpacity="0.15" />
          <path d="M12 7c-2 2-2 5 0 8" />
        </svg>
        <span className="h-px w-12 sm:w-20 bg-gradient-to-l from-transparent to-[var(--theme-accent)]" />
      </div>
    )
  }

  if (themeId === "warm") {
    return (
      <div className={`flex items-center justify-center gap-3 py-6 my-2 text-[var(--theme-accent)] opacity-75 select-none ${className}`} aria-hidden="true">
        <span className="h-px w-12 sm:w-20 bg-gradient-to-r from-transparent to-[var(--theme-accent)]" />
        <svg viewBox="0 0 24 24" fill="currentColor" className="size-3.5 opacity-80">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        </svg>

        <span className="h-px w-12 sm:w-20 bg-gradient-to-l from-transparent to-[var(--theme-accent)]" />
      </div>
    )
  }

  if (themeId === "classic") {
    return (
      <div className={`flex items-center justify-center gap-2.5 py-6 my-2 text-[var(--theme-accent)] opacity-65 select-none ${className}`} aria-hidden="true">
        <span className="h-px w-14 sm:w-24 bg-gradient-to-r from-transparent via-[var(--theme-border)] to-[var(--theme-accent)]" />
        <span className="text-[9px] font-serif">{"\u2726"}</span>
        <span className="h-px w-14 sm:w-24 bg-gradient-to-l from-transparent via-[var(--theme-border)] to-[var(--theme-accent)]" />
      </div>
    )
  }

  if (themeId === "dusk") {
    return (
      <div className={`flex items-center justify-center gap-3 py-6 my-2 text-[var(--theme-accent)] opacity-80 select-none ${className}`} aria-hidden="true">
        <span className="h-px w-12 sm:w-20 bg-gradient-to-r from-transparent to-[var(--theme-accent)]/60" />
        <span className="text-xs">{"\u2727"}</span>
        <span className="h-px w-12 sm:w-20 bg-gradient-to-l from-transparent to-[var(--theme-accent)]/60" />
      </div>
    )
  }

  if (themeId === "light") {
    return (
      <div className={`flex items-center justify-center gap-3 py-6 my-2 text-[var(--theme-accent)] opacity-60 select-none ${className}`} aria-hidden="true">
        <span className="h-px w-12 sm:w-20 border-t border-dashed border-[var(--theme-accent)]" />
        <span className="size-1 rounded-full bg-[var(--theme-accent)]" />
        <span className="h-px w-12 sm:w-20 border-t border-dashed border-[var(--theme-accent)]" />
      </div>
    )
  }

  // Quiet default
  return (
    <div className={`flex items-center justify-center gap-3 py-6 my-2 text-[#aaa] select-none ${className}`} aria-hidden="true">
      <span className="h-px w-12 sm:w-16 bg-black/[0.08]" />
      <span className="size-1 rounded-full bg-black/[0.25]" />
      <span className="h-px w-12 sm:w-16 bg-black/[0.08]" />
    </div>
  )
}

interface ThemeHeroFrameProps {
  themeId?: MemorialThemeId
  children: React.ReactNode
  className?: string
}

export function ThemeHeroFrame({ themeId = "quiet", children, className = "" }: ThemeHeroFrameProps) {
  if (themeId === "garden") {
    return (
      <div className={`relative p-2.5 rounded-3xl bg-[var(--theme-bg-surface)] border border-[#3d6c4a]/25 shadow-[0_6px_24px_rgba(61,108,74,0.08)] mb-8 select-none transition-all ${className}`}>
        {/* Subtle Botanical Corner Mark */}
        <div className="absolute -top-2 -right-2 size-6 text-[#3d6c4a] opacity-85 pointer-events-none" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C8 6 6 10 7 14c1 4 4 6 7 7 1-4 3-8 1-13-1-3-2-5-3-6Z" opacity="0.35" />
            <path d="M13 3c3 3 5 7 4 11-1 3-3 5-6 6 0-3-1-7 1-11 1-2 1-4 1-6Z" fillOpacity="0.2" />
          </svg>
        </div>
        {children}
      </div>
    )
  }

  if (themeId === "warm") {
    return (
      <div className={`relative p-2.5 rounded-3xl bg-[var(--theme-bg-surface)] border border-[#b85d2a]/25 shadow-[0_6px_28px_rgba(184,93,42,0.08)] mb-8 select-none transition-all ${className}`}>
        {children}
      </div>
    )
  }

  if (themeId === "classic") {
    return (
      <div className={`relative p-3 rounded-2xl bg-[var(--theme-bg-surface)] border-2 border-[#6e2836]/20 shadow-[0_4px_20px_rgba(0,0,0,0.04)] ring-1 ring-inset ring-[#6e2836]/10 mb-8 select-none transition-all ${className}`}>
        {children}
      </div>
    )
  }

  if (themeId === "dusk") {
    return (
      <div className={`relative p-2.5 rounded-3xl bg-[var(--theme-bg-surface)] border border-[#d4af37]/35 shadow-[0_0_35px_rgba(212,175,55,0.15)] mb-8 select-none transition-all ${className}`}>
        {children}
      </div>
    )
  }

  if (themeId === "light") {
    return (
      <div className={`relative p-2.5 rounded-3xl bg-[var(--theme-bg-surface)] border border-[#2c78b8]/20 shadow-[0_6px_30px_rgba(44,120,184,0.09)] mb-8 select-none transition-all ${className}`}>
        {children}
      </div>
    )
  }

  // Quiet default
  return (
    <div className={`relative p-2 rounded-3xl bg-[var(--theme-bg-surface)] border border-[var(--theme-border)] mb-8 select-none transition-all ${className}`}>
      {children}
    </div>
  )
}
