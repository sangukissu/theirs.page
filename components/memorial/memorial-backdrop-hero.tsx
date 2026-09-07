"use client"

import { Plus, Quote } from "lucide-react"
import { ContributionType } from "./contribute-modal"
import { PortraitPlaceholder } from "./portrait-placeholder"
import { formatMemorialLocation } from "@/lib/validation/text-limits"
import { ThemeHeroFrame } from "./memorial-theme-decorations"
import type { MemorialThemeId } from "@/lib/memorial/themes"

export interface MemorialBackdropHeroProps {
  fullName: string
  preferredName?: string | null
  birthYear?: number | null
  deathYear?: number | null
  location?: string | null
  epitaph?: string | null
  portraitUrl?: string | null
  isDemo?: boolean
  themeId?: MemorialThemeId
  onOpenContribute: (type?: ContributionType) => void

  // Ambient Memorial Backdrop Options
  coverUrl?: string | null
  coverFocalX?: number // 0 - 100, default 50
  coverFocalY?: number // 0 - 100, default 30
  washOpacity?: number // visual opacity of image, e.g. 0.32
  useRadialVignette?: boolean // true for radial ellipse mask (no rectangle)
  backdropHeightDesktop?: number // e.g. 520
  backdropHeightMobile?: number // e.g. 410
}

export function MemorialBackdropHero({
  fullName,
  preferredName,
  birthYear = null,
  deathYear = null,
  location = null,
  epitaph,
  portraitUrl = null,
  themeId = "quiet",
  onOpenContribute,
  coverUrl = null,
  coverFocalX = 50,
  coverFocalY = 30,
  washOpacity = 0.32,
  useRadialVignette = true,
  backdropHeightDesktop = 520,
  backdropHeightMobile = 410,
}: MemorialBackdropHeroProps) {
  const yearsSpan = birthYear && deathYear ? `${birthYear} \u2014 ${deathYear}` : "In Loving Memory"
  const age = birthYear && deathYear ? deathYear - birthYear : null

  return (
    <section className="relative w-full overflow-hidden isolate">
      {/* --------------------------------------------------------------------- */}
      {/* AMBIENT MEMORIAL BACKDROP LAYER                                       */}
      {/* Lives behind the hero content without sharp edges or boxy banner cards */}
      {/* --------------------------------------------------------------------- */}
      {coverUrl && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 select-none z-0 overflow-hidden transition-all duration-500"
          style={{
            height: `clamp(${backdropHeightMobile}px, 50vw, ${backdropHeightDesktop}px)`,
            ...(useRadialVignette
              ? {
                  WebkitMaskImage:
                    "radial-gradient(ellipse 85% 75% at 50% 25%, black 25%, rgba(0,0,0,0.75) 55%, transparent 100%)",
                  maskImage:
                    "radial-gradient(ellipse 85% 75% at 50% 25%, black 25%, rgba(0,0,0,0.75) 55%, transparent 100%)",
                }
              : {}),
          }}
        >
          {/* 1. Underlying Photograph (their world: workshop, garden, sea, hills) */}
          <img
            src={coverUrl}
            alt=""
            className="size-full object-cover transition-all duration-300"
            style={{
              objectPosition: `${coverFocalX}% ${coverFocalY}%`,
              opacity: washOpacity,
            }}
          />

          {/* 2. Soft Ambient Tint matching Active Theme Page Background */}
          <div className="absolute inset-0 bg-[var(--theme-bg-page)]/20" />

          {/* 3. Multi-stop Vertical Dissolve: Fades seamlessly into page background */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `linear-gradient(
                to bottom,
                rgba(255,255,255,0.06) 0%,
                color-mix(in srgb, var(--theme-bg-page) 10%, transparent) 28%,
                color-mix(in srgb, var(--theme-bg-page) 42%, transparent) 58%,
                color-mix(in srgb, var(--theme-bg-page) 88%, transparent) 82%,
                var(--theme-bg-page) 100%
              )`,
            }}
          />

          {/* 4. Subtle Left/Right Horizontal Edge Vignette for ultra-wide displays */}
          <div
            className="absolute inset-0 pointer-events-none hidden sm:block"
            style={{
              background: `linear-gradient(
                to right,
                var(--theme-bg-page) 0%,
                transparent 14%,
                transparent 86%,
                var(--theme-bg-page) 100%
              )`,
            }}
          />
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* HERO CONTENT: Preserved centered composition (Portrait -> Name -> CTA)*/}
      {/* --------------------------------------------------------------------- */}
      <div className="relative z-10 pt-24 sm:pt-32 pb-12 sm:pb-16 px-4 max-w-4xl mx-auto text-center flex flex-col items-center">
        {/* Museum-Grade Archival Portrait Frame with Theme Matting */}
        <ThemeHeroFrame themeId={themeId}>
          <div className="relative size-32 sm:size-40 rounded-2xl overflow-hidden bg-neutral-100/60 border border-[var(--theme-border)] shadow-sm">
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
        <div className="flex flex-col items-center gap-2 max-w-2xl mt-1">
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <h1 className="text-3xl sm:text-5xl font-medium tracking-tight text-[var(--theme-text-primary)] leading-tight drop-shadow-2xs">
              {fullName}
            </h1>
            {preferredName && (
              <span className="text-xl sm:text-2xl text-[var(--theme-text-muted)] font-normal italic">
                ({preferredName})
              </span>
            )}
          </div>

          {/* Lifespan & Location Capsule */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[var(--theme-bg-surface-subtle)]/90 backdrop-blur-xs border border-[var(--theme-border)] text-xs font-mono text-[var(--theme-text-muted)] mt-1 select-none max-w-full shadow-2xs">
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

          {/* The Personality Epitaph */}
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
              <span>Leave a tribute</span>
            </button>
            <button
              type="button"
              onClick={() => onOpenContribute("memory")}
              className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap !rounded-full font-medium transition-all cursor-pointer border border-[var(--theme-border)] bg-[var(--theme-bg-surface)]/90 backdrop-blur-xs text-[var(--theme-text-primary)] shadow-2xs hover:bg-[var(--theme-bg-surface-subtle)] active:scale-[0.98] h-10 px-5 text-sm"
            >
              <span>Share a memory</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
