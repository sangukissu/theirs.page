"use client"

import React from "react"
import Link from "next/link"
import { Check, ExternalLink } from "lucide-react"
import {
  MEMORIAL_THEMES_LIST,
  type MemorialThemeId,
} from "@/lib/memorial/themes"

interface AppearanceTabProps {
  memorialId?: string
  slug?: string
  fullName: string
  portraitUrl?: string | null
  birthYear?: string | number | null
  deathYear?: string | number | null
  location?: string | null
  headline?: string | null
  theme?: MemorialThemeId
  currentTheme?: MemorialThemeId
  onChange?: (theme: MemorialThemeId) => void
  onChangeTheme?: (theme: MemorialThemeId) => void
}

export function AppearanceTab({
  slug,
  fullName,
  portraitUrl,
  birthYear,
  deathYear,
  theme,
  currentTheme = "quiet",
  onChange,
  onChangeTheme,
}: AppearanceTabProps) {
  const activeTheme = theme || currentTheme || "quiet"
  const firstName = fullName?.trim().split(/\s+/)[0] || "them"
  const yearsSpan = birthYear && deathYear ? `${birthYear} \u2014 ${deathYear}` : "In Loving Memory"

  const handleSelectTheme = (id: MemorialThemeId) => {
    onChange?.(id)
    onChangeTheme?.(id)
  }

  return (
    <div className="flex flex-col gap-6 pb-10 animate-in fade-in duration-200">
      {/* Header section */}
      <div className="flex items-center justify-between gap-4 border-b border-black/[0.06] pb-4">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-base sm:text-lg font-medium tracking-tight text-[#181925]">
            Make this feel like {firstName}
          </h2>
          <p className="text-xs text-[#71717a]">
            Select an atmosphere that reflects their spirit and presence.
          </p>
        </div>

        {slug ? (
          <Link
            href={`/${slug}?preview=visitor`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-black/[0.08] bg-white text-xs font-medium text-[#181925] hover:bg-neutral-50 active:scale-95 transition-all shrink-0 shadow-2xs"
          >
            <span>Preview</span>
            <ExternalLink className="size-3 text-[#888]" />
          </Link>
        ) : null}
      </div>

      {/* 6 High-Fidelity Compact Atmosphere Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {MEMORIAL_THEMES_LIST.map((t) => {
          const isSelected = activeTheme === t.id

          return (
            <div
              key={t.id}
              role="button"
              tabIndex={0}
              onClick={() => handleSelectTheme(t.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  handleSelectTheme(t.id)
                }
              }}
              className={`group relative flex flex-col rounded-2xl p-2.5 sm:p-3 transition-all duration-200 cursor-pointer text-left outline-none bg-white ${
                isSelected
                  ? "border-2 border-[#181925] ring-2 ring-[#181925]/10 shadow-xs"
                  : "border border-black/[0.08] hover:border-black/25 hover:-translate-y-0.5 hover:shadow-xs"
              }`}
            >
              {/* Miniature Editorial Page Canvas */}
              <div
                className="h-44 sm:h-48 w-full rounded-xl relative p-3 flex flex-col justify-between overflow-hidden border select-none transition-colors"
                style={{
                  backgroundColor: t.colors.bgPage,
                  borderColor: t.colors.border,
                }}
              >
                {/* Canvas Top Bar: Font Tag + Selection Indicator */}
                <div className="flex items-center justify-between gap-2">
                  <span
                    className="text-[9px] font-medium tracking-tight px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: t.colors.bgSurface,
                      color: t.colors.textMuted,
                      border: `1px solid ${t.colors.border}`,
                    }}
                  >
                    {t.typography.fontHeadingName}
                  </span>

                  {isSelected ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#181925] text-white text-[9px] font-semibold tracking-tight shadow-2xs">
                      <Check className="size-2.5 text-emerald-400" strokeWidth={3} />
                      <span>Active</span>
                    </span>
                  ) : (
                    <span className="size-4 rounded-full border border-black/15 bg-white/60 group-hover:border-black/30 group-hover:bg-white transition-colors" />
                  )}
                </div>

                {/* Canvas Center Hero: Vignette & Name */}
                <div className="flex flex-col items-center justify-center text-center my-auto">
                  <div
                    className="size-11 sm:size-12 rounded-xl overflow-hidden border shadow-2xs shrink-0 flex items-center justify-center mb-1.5"
                    style={{
                      backgroundColor: t.colors.bgSurface,
                      borderColor: t.colors.border,
                    }}
                  >
                    {portraitUrl ? (
                      <img
                        src={portraitUrl}
                        alt=""
                        className="size-full object-cover object-top"
                      />
                    ) : (
                      <span
                        className="text-xs font-serif font-bold"
                        style={{ color: t.colors.textMuted }}
                      >
                        {firstName[0]}
                      </span>
                    )}
                  </div>

                  <div
                    className="text-sm sm:text-[15px] font-medium tracking-tight leading-tight line-clamp-1 max-w-[170px]"
                    style={{
                      color: t.colors.textPrimary,
                      fontFamily:
                        t.typography.fontHeadingName.includes("Serif") ||
                        t.typography.fontHeadingName.includes("Roman")
                          ? "Georgia, serif"
                          : "var(--font-sans), sans-serif",
                    }}
                  >
                    {fullName || "Robert Carter"}
                  </div>

                  <div
                    className="text-[10px] font-mono tracking-tight mt-0.5"
                    style={{ color: t.colors.textMuted }}
                  >
                    {yearsSpan}
                  </div>
                </div>

                {/* Canvas Bottom Snippet: Minimalist Tribute Surface */}
                <div
                  className="w-full px-2.5 py-1.5 rounded-lg border flex items-center justify-between gap-2 shadow-2xs"
                  style={{
                    backgroundColor: t.colors.bgSurface,
                    borderColor: t.colors.border,
                  }}
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span
                      className="size-1.5 rounded-full shrink-0"
                      style={{ backgroundColor: t.colors.accent }}
                    />
                    <span
                      className="text-[10px] tracking-tight truncate max-w-[130px] italic"
                      style={{ color: t.colors.textPrimary }}
                    >
                      “A life deeply cherished…”
                    </span>
                  </div>
                  <span
                    className="text-[9px] font-mono shrink-0"
                    style={{ color: t.colors.accent }}
                  >
                    {t.divider.symbol}
                  </span>
                </div>
              </div>

              {/* Card Footer Info Row */}
              <div className="flex items-center justify-between gap-2 px-1 pt-2 pb-0.5">
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs sm:text-sm font-semibold text-[#181925] tracking-tight truncate">
                      {t.name}
                    </span>
                    {t.id === "quiet" && (
                      <span className="text-[9px] uppercase tracking-wider font-mono px-1.5 py-0.2 rounded bg-neutral-100 text-neutral-500 font-medium">
                        Default
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-[#71717a] font-normal truncate">
                    {t.subtitle}
                  </span>
                </div>

                {/* Dynamic 4-Dot Palette Swatch */}
                <div
                  className="flex items-center -space-x-1 shrink-0"
                  title={`${t.name} palette`}
                >
                  <span
                    className="size-3.5 rounded-full border border-black/10 shadow-2xs"
                    style={{ backgroundColor: t.colors.bgPage }}
                  />
                  <span
                    className="size-3.5 rounded-full border border-black/10 shadow-2xs"
                    style={{ backgroundColor: t.colors.bgSurface }}
                  />
                  <span
                    className="size-3.5 rounded-full border border-black/10 shadow-2xs"
                    style={{ backgroundColor: t.colors.textPrimary }}
                  />
                  <span
                    className="size-3.5 rounded-full border border-black/10 shadow-2xs"
                    style={{ backgroundColor: t.colors.accent }}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Subtle reassurance footer note */}
      <p className="text-center text-xs text-[#71717a] pt-2">
        Atmosphere changes apply instantly. Photos, stories, and tributes are always preserved.
      </p>
    </div>
  )
}
