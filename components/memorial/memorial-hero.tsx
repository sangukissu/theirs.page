"use client"

import { Plus, Quote } from "lucide-react"
import { ContributionType } from "./contribute-modal"
import { PortraitPlaceholder } from "./portrait-placeholder"
import { formatMemorialLocation } from "@/lib/validation/text-limits"
import { ThemeHeroFrame } from "./memorial-theme-decorations"
import { MemorialCoverPattern } from "./memorial-cover-patterns"
import type { MemorialThemeId } from "@/lib/memorial/themes"
import type { MemorialCoverSettings } from "@/types/theirs"

interface MemorialHeroProps {
  fullName: string
  preferredName?: string | null
  birthYear?: number | null
  deathYear?: number | null
  location?: string | null
  epitaph?: string | null
  portraitUrl?: string | null
  isDemo?: boolean
  themeId?: MemorialThemeId
  coverSettings?: MemorialCoverSettings | null
  onOpenContribute: (type?: ContributionType) => void
}

export function MemorialHero({
  fullName,
  preferredName,
  birthYear = null,
  deathYear = null,
  location = null,
  epitaph,
  portraitUrl = null,
  isDemo = false,
  themeId = "quiet",
  coverSettings,
  onOpenContribute,
}: MemorialHeroProps) {
  const yearsSpan = birthYear && deathYear ? `${birthYear} \u2014 ${deathYear}` : "In Loving Memory"
  const age = birthYear && deathYear ? deathYear - birthYear : null
  const displayCoverUrl = (() => {
    const url = coverSettings?.cover_url
    if (!url) return null
    if (
      url.startsWith("blob:") ||
      url.startsWith("data:") ||
      url.startsWith("http://") ||
      url.startsWith("https://") ||
      url.startsWith("/")
    ) {
      return url
    }
    return `/api/media?key=${encodeURIComponent(url)}`
  })()

  const isTheirWorld = coverSettings?.type === "their_world" && Boolean(displayCoverUrl)
  const isPattern = coverSettings?.type === "pattern"

  return (
    <section className="relative w-full overflow-hidden isolate">
      {/* 1. Ambient Memorial Backdrop Layer (Their World) - FULL WIDTH */}
      {isTheirWorld && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 w-full select-none z-0 overflow-hidden transition-all duration-500"
          style={{
            height: "clamp(460px, 55vw, 640px)",
            WebkitMaskImage:
              "radial-gradient(ellipse 95% 85% at 50% 25%, black 45%, rgba(0,0,0,0.85) 70%, transparent 100%)",
            maskImage:
              "radial-gradient(ellipse 95% 85% at 50% 25%, black 45%, rgba(0,0,0,0.85) 70%, transparent 100%)",
          }}
        >
          <img
            src={displayCoverUrl!}
            alt=""
            className="size-full object-cover transition-all duration-300"
            style={{
              objectPosition: `${coverSettings?.focal_x ?? 50}% ${coverSettings?.focal_y ?? 35}%`,
              opacity: 0.75,
            }}
          />
          <div className="absolute inset-0 bg-[var(--theme-bg-page)]/15" />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `linear-gradient(
                to bottom,
                rgba(255,255,255,0.02) 0%,
                color-mix(in srgb, var(--theme-bg-page) 12%, transparent) 25%,
                color-mix(in srgb, var(--theme-bg-page) 45%, transparent) 55%,
                color-mix(in srgb, var(--theme-bg-page) 88%, transparent) 80%,
                var(--theme-bg-page) 100%
              )`,
            }}
          />
        </div>
      )}

      {/* 2. Theme-Derived Curated Pattern Layer - FULL WIDTH */}
      {isPattern && (
        <MemorialCoverPattern
          style={coverSettings?.pattern_style || "soft_aura"}
          themeId={themeId}
          className="w-full"
        />
      )}

      {/* 3. Hero Content Foreground Canvas - INNER CONTAINER (max-w-4xl) */}
      <div className="relative z-10 pt-24 sm:pt-32 pb-12 sm:pb-16 px-4 max-w-4xl mx-auto text-center flex flex-col items-center w-full">
      
      {/* Museum-Grade Archival Portrait Frame with Theme Matting */}
      <ThemeHeroFrame themeId={themeId}>
        <div className="relative size-32 sm:size-40 rounded-2xl overflow-hidden bg-neutral-100/50 border border-[var(--theme-border)]">
          {portraitUrl ? (
            <>
              <img
                src={portraitUrl}
                alt={fullName}
                className="size-full object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
            </>
          ) : (
            <PortraitPlaceholder fullName={fullName} />
          )}
        </div>
      </ThemeHeroFrame>

      {/* Identity & Preferred Name */}
      <div className="flex flex-col items-center gap-2 max-w-2xl">
        <div className="flex items-center gap-2 flex-wrap justify-center">
          <h1 className="text-3xl sm:text-5xl font-medium tracking-tight text-[var(--theme-text-primary)] leading-tight">
            {fullName}
          </h1>
          {preferredName && (
            <span className="text-xl sm:text-2xl text-[var(--theme-text-muted)] font-normal italic">
              ({preferredName})
            </span>
          )}
        </div>

        {/* Lifespan & Location Capsule */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[var(--theme-bg-surface-subtle)] border border-[var(--theme-border)] text-xs font-mono text-[var(--theme-text-muted)] mt-1 select-none max-w-full">
          <span>{yearsSpan}</span>
          {age && (
            <>
              <span className="opacity-40">&middot;</span>
              <span>{age} years</span>
            </>
          )}
          {(() => {
            const displayLocation = formatMemorialLocation(location)
            if (!displayLocation) return null
            return (
              <>
                <span className="opacity-40">&middot;</span>
                <span>{displayLocation}</span>
              </>
            )
          })()}
        </div>

        {/* The Personality Epitaph (Life Dominates, Death Only Explains Why) */}
        {epitaph && (
          <figure className="mt-5 flex max-w-xl flex-col items-center px-3">
            <Quote
              aria-hidden="true"
              className="mb-2 size-7 text-[var(--theme-accent)] opacity-80"
              strokeWidth={1.5}
            />
            <blockquote>
              <p className="text-balance font-serif text-lg italic leading-relaxed text-[var(--theme-text-primary)] sm:text-xl sm:leading-8">
                {epitaph}
              </p>
            </blockquote>
            <span
              aria-hidden="true"
              className="mt-4 h-px w-12 bg-[var(--theme-quote-border)]"
            />
          </figure>
        )}

        {/* Call-to-Action Action Buttons */}
        <div className="mt-4 flex flex-col sm:flex-row items-center gap-3 select-none">
          <button
            type="button"
            onClick={() => onOpenContribute("tribute")}
            className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap !rounded-full font-medium transition-all cursor-pointer bg-[var(--theme-accent)] text-[var(--theme-accent-foreground)] shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_4px_16px_rgba(0,0,0,0.12)] transform-gpu hover:brightness-105 active:scale-[0.98] h-10 px-5 text-sm group"
          >
            <Plus className="size-4" />
            <span>Leave a Tribute</span>
          </button>
        </div>

      </div>

    </div>

    </section>
  )
}
