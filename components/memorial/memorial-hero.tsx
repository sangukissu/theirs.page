"use client"

import { Plus, Quote } from "lucide-react"
import { ContributionType } from "./contribute-modal"

interface MemorialHeroProps {
  fullName: string
  preferredName?: string | null
  birthYear?: number | null
  deathYear?: number | null
  location?: string | null
  epitaph?: string | null
  portraitUrl?: string | null
  isDemo?: boolean
  onOpenContribute: (type?: ContributionType) => void
}

export function MemorialHero({
  fullName,
  preferredName,
  birthYear = 1948,
  deathYear = 2024,
  location = "Devon, England",
  epitaph,
  portraitUrl = "/memorial-family-portrait-grandfather.jpg",
  isDemo = false,
  onOpenContribute,
}: MemorialHeroProps) {
  const yearsSpan = birthYear && deathYear ? `${birthYear} — ${deathYear}` : "In Loving Memory"
  const age = birthYear && deathYear ? deathYear - birthYear : null

  return (
    <section className="pt-24 sm:pt-32 pb-12 sm:pb-16 px-4 max-w-4xl mx-auto text-center flex flex-col items-center">
      
      {/* Museum-Grade Archival Portrait Frame (Zero Shadows, Hairline Border) */}
      <div className="relative p-2 rounded-3xl bg-white border border-black/[0.08] mb-8 select-none">
        <div className="relative size-32 sm:size-40 rounded-2xl overflow-hidden bg-neutral-100 border border-black/[0.06]">
          <img
            src={portraitUrl || "/memorial-family-portrait-grandfather.jpg"}
            alt={fullName}
            className="size-full object-cover object-top"
          />
          {/* Subtle bottom vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
 
        </div>
      </div>

      {/* Identity & Preferred Name */}
      <div className="flex flex-col items-center gap-2 max-w-2xl">
        <div className="flex items-center gap-2 flex-wrap justify-center">
          <h1 className="text-3xl sm:text-5xl font-medium tracking-tight text-[#181925] leading-tight">
            {fullName}
          </h1>
          {preferredName && (
            <span className="text-xl sm:text-2xl text-[#888] font-normal italic">
              ({preferredName})
            </span>
          )}
        </div>

        {/* Lifespan & Location Monospace Capsule */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f7f7f8] border border-black/[0.06] text-xs font-mono text-[#666] mt-1 select-none">
          <span>{yearsSpan}</span>
          {age && (
            <>
              <span className="text-black/[0.2]">·</span>
              <span>{age} years</span>
            </>
          )}
          {location && (
            <>
              <span className="text-black/[0.2]">·</span>
              <span>{location}</span>
            </>
          )}
        </div>

        {/* The Personality Epitaph (Life Dominates, Death Only Explains Why) */}
        {epitaph && (
          <figure className="mt-5 flex max-w-xl flex-col items-center px-3">
            <Quote
              aria-hidden="true"
              className={isDemo ? "mb-2 size-7 text-primary/70" : "mb-2 size-7 text-primary opacity-70"}
              strokeWidth={1.5}
            />
            <blockquote>
              <p className="text-balance font-serif text-lg italic leading-relaxed text-[#3a3a40] sm:text-xl sm:leading-8">
                {epitaph}
              </p>
            </blockquote>
            <span
              aria-hidden="true"
              className={isDemo ? "mt-4 h-px w-10 bg-primary/40" : "mt-4 h-px w-10 bg-primary opacity-40"}
            />
          </figure>
        )}



        {/* Call-to-Action Action Buttons */}
        <div className="mt-4 flex flex-col sm:flex-row items-center gap-3 select-none">
          {/* Primary Action: Add Memory */}
          <button
            type="button"
            onClick={() => onOpenContribute("tribute")}
            className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap !rounded-full font-medium transition-all cursor-pointer border border-[color-mix(in_srgb,var(--primary)_80%,#3a3480)] bg-[color-mix(in_srgb,var(--primary)_90%,#3a3480)] text-primary-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.22),inset_0_-1px_0_rgba(58,52,128,0.30)] transform-gpu hover:bg-primary active:scale-[0.98] h-10 px-5 text-sm group"
          >
            <Plus className="size-4" />
            <span>Leave a Tribute</span>
          </button>
        </div>

      </div>

    </section>
  )
}
