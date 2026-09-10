"use client"

import { useState } from "react"
import { Palette, Sparkles } from "lucide-react"
import {
  MEMORIAL_THEMES,
  type MemorialThemeId,
  type MemorialThemeDefinition,
} from "@/lib/memorial/themes"

const THEME_CYCLE: MemorialThemeId[] = [
  "quiet",
  "warm",
  "garden",
  "classic",
  "dusk",
  "light",
]

interface MemorialThemeSwitcherProps {
  currentTheme: MemorialThemeId
  currentCoverName?: string
  onThemeChange: (themeId: MemorialThemeId) => void
}

export function MemorialThemeSwitcher({
  currentTheme,
  currentCoverName,
  onThemeChange,
}: MemorialThemeSwitcherProps) {
  const [isAnimating, setIsAnimating] = useState(false)

  const currentIndex = THEME_CYCLE.indexOf(currentTheme)
  const safeIndex = currentIndex >= 0 ? currentIndex : 0
  const activeDef: MemorialThemeDefinition =
    MEMORIAL_THEMES[currentTheme] || MEMORIAL_THEMES.quiet

  const nextIndex = (safeIndex + 1) % THEME_CYCLE.length
  const nextTheme = THEME_CYCLE[nextIndex]
  const nextDef = MEMORIAL_THEMES[nextTheme]

  const handleClick = () => {
    setIsAnimating(true)
    onThemeChange(nextTheme)
    setTimeout(() => setIsAnimating(false), 300)
  }

  return (
    <aside
      aria-label="Memorial theme and cover switcher"
      className="fixed bottom-5 right-5 z-50 select-none font-sans"
    >
      <button
        type="button"
        onClick={handleClick}
        aria-label={`Current theme is ${activeDef.name}${currentCoverName ? ` with ${currentCoverName} cover` : ""}. Click to switch theme and cover.`}
        className={`group relative flex items-center gap-2.5 rounded-full border border-black/10 bg-white/95 px-4 py-2.5 text-xs font-medium text-neutral-800 shadow-[0_8px_30px_rgba(0,0,0,0.12)] backdrop-blur-md transition-all duration-200 hover:scale-105 hover:bg-white hover:border-black/20 hover:shadow-[0_12px_36px_rgba(0,0,0,0.18)] active:scale-95 cursor-pointer ${
          isAnimating ? "scale-95" : ""
        }`}
      >
        {/* Accent Color Swatch Indicator */}
        <span className="relative flex size-3.5 items-center justify-center">
          <span
            className="absolute inline-flex size-full rounded-full opacity-60 transition-colors duration-300"
            style={{ backgroundColor: activeDef.colors.accent }}
          />
          <span
            className="relative inline-flex size-2.5 rounded-full transition-colors duration-300"
            style={{ backgroundColor: activeDef.colors.accent }}
          />
        </span>

        {/* Palette Icon */}
        <Palette className="size-3.5 text-neutral-500 transition-transform duration-200 group-hover:rotate-12" />

        {/* Theme & Cover Name Indicator */}
        <div className="flex flex-col text-left leading-tight">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-neutral-900 tracking-tight">
              Theme: {activeDef.name}
            </span>
            <span className="text-[10px] font-mono text-neutral-400">
              ({safeIndex + 1}/{THEME_CYCLE.length})
            </span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-neutral-500 font-normal mt-0.5">
            {currentCoverName && (
              <>
                <span>Cover: <strong className="text-neutral-700 font-medium">{currentCoverName}</strong></span>
                <span className="opacity-40">&middot;</span>
              </>
            )}
            <span>Switch &rarr; <strong className="text-neutral-700 font-medium">{nextDef.name}</strong></span>
          </div>
        </div>

        {/* Subtle sparkle ornament */}
        <Sparkles className="size-3 text-amber-500/70 transition-opacity duration-200 opacity-60 group-hover:opacity-100" />
      </button>
    </aside>
  )
}
