"use client"

import { Plus, Quote } from "lucide-react"
import { ContributionType } from "./contribute-modal"
import { PortraitPlaceholder } from "./portrait-placeholder"
import { formatMemorialLocation } from "@/lib/validation/text-limits"
import { ThemeHeroFrame } from "./memorial-theme-decorations"
import type { MemorialThemeId } from "@/lib/memorial/themes"

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
  onOpenContribute,
}: MemorialHeroProps) {
  const yearsSpan = birthYear && deathYear ? `${birthYear} \u2014 ${deathYear}` : "In Loving Memory"
  const age = birthYear && deathYear ? deathYear - birthYear : null

  return (
    <section className="pt-24 sm:pt-32 pb-12 sm:pb-16 px-4 max-w-4xl mx-auto text-center flex flex-col items-center">
      
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

    </section>
  )
}
