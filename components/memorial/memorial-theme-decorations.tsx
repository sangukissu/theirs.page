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
      <div className={`flex items-center justify-center gap-3 py-3 text-[var(--theme-accent)] select-none ${className}`} aria-hidden="true">
        <span className="h-px w-12 sm:w-20 bg-gradient-to-r from-transparent to-[var(--theme-accent)]" />
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="size-3.5 opacity-85">
          <circle cx="12" cy="12" r="2" fill="currentColor" />
          <path d="M12 5c-1.2 2-1.2 4.5 0 7 1.2-2.5 1.2-5 0-7Z" fill="currentColor" fillOpacity="0.25" />
          <path d="M12 12c-1.2 2-1.2 4.5 0 7 1.2-2.5 1.2-5 0-7Z" fill="currentColor" fillOpacity="0.25" />
          <path d="M5 12c2-1.2 4.5-1.2 7 0-2.5 1.2-5 1.2-7 0Z" fill="currentColor" fillOpacity="0.25" />
          <path d="M12 12c2-1.2 4.5-1.2 7 0-2.5 1.2-5 1.2-7 0Z" fill="currentColor" fillOpacity="0.25" />
        </svg>
        <span className="h-px w-12 sm:w-20 bg-gradient-to-l from-transparent to-[var(--theme-accent)]" />
      </div>
    )
  }

  if (themeId === "warm") {
    return (
      <div className={`flex items-center justify-center gap-3 py-3 text-[var(--theme-accent)] select-none ${className}`} aria-hidden="true">
        <span className="h-px w-12 sm:w-20 bg-gradient-to-r from-transparent to-[var(--theme-accent)]" />
        <svg viewBox="0 0 24 24" fill="currentColor" className="size-3.5 opacity-85">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        </svg>
        <span className="h-px w-12 sm:w-20 bg-gradient-to-l from-transparent to-[var(--theme-accent)]" />
      </div>
    )
  }

  if (themeId === "classic") {
    return (
      <div className={`flex items-center justify-center gap-3 py-3 text-[var(--theme-accent)] select-none ${className}`} aria-hidden="true">
        <span className="h-px w-12 sm:w-20 bg-gradient-to-r from-transparent to-[var(--theme-accent)]" />
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="size-3.5 opacity-85">
          <path d="M12 3.5 L17 12 L12 20.5 L7 12 Z" fill="currentColor" fillOpacity="0.2" />
          <circle cx="12" cy="12" r="1.75" fill="currentColor" />
          <circle cx="3.5" cy="12" r="0.75" fill="currentColor" />
          <circle cx="20.5" cy="12" r="0.75" fill="currentColor" />
        </svg>
        <span className="h-px w-12 sm:w-20 bg-gradient-to-l from-transparent to-[var(--theme-accent)]" />
      </div>
    )
  }

  if (themeId === "dusk") {
    return (
      <div className={`flex items-center justify-center gap-3 py-3 text-[var(--theme-accent)] select-none ${className}`} aria-hidden="true">
        <span className="h-px w-12 sm:w-20 bg-gradient-to-r from-transparent to-[var(--theme-accent)]" />
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="size-3.5 opacity-90">
          <path d="M12 2 L13.8 9.2 L21 12 L13.8 14.8 L12 22 L10.2 14.8 L3 12 L10.2 9.2 Z" fill="currentColor" fillOpacity="0.25" />
          <circle cx="12" cy="12" r="1.5" fill="currentColor" />
        </svg>
        <span className="h-px w-12 sm:w-20 bg-gradient-to-l from-transparent to-[var(--theme-accent)]" />
      </div>
    )
  }

  if (themeId === "light") {
    return (
      <div className={`flex items-center justify-center gap-3 py-3 text-[var(--theme-accent)] select-none ${className}`} aria-hidden="true">
        <span className="h-px w-12 sm:w-20 bg-gradient-to-r from-transparent to-[var(--theme-accent)]" />
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="size-3.5 opacity-85">
          <circle cx="12" cy="12" r="2.5" fill="currentColor" />
          <path d="M5.5 12a6.5 6.5 0 0 1 13 0" />
          <path d="M12 4v2.5M6 6.5l1.8 1.8M18 6.5l-1.8 1.8" />
        </svg>
        <span className="h-px w-12 sm:w-20 bg-gradient-to-l from-transparent to-[var(--theme-accent)]" />
      </div>
    )
  }

  // Quiet default: Minimalist dual-ring balance mark
  return (
    <div className={`flex items-center justify-center gap-3 py-3 text-[var(--theme-accent)] select-none ${className}`} aria-hidden="true">
      <span className="h-px w-12 sm:w-20 bg-gradient-to-r from-transparent to-[var(--theme-accent)]" />
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="size-3.5 opacity-80">
        <circle cx="12" cy="12" r="3" fill="currentColor" />
        <circle cx="12" cy="12" r="7" stroke="currentColor" strokeDasharray="1.5 2.5" />
      </svg>
      <span className="h-px w-12 sm:w-20 bg-gradient-to-l from-transparent to-[var(--theme-accent)]" />
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
