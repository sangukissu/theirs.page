"use client"

import { Heart, Volume2, Plus, ArrowDown } from "lucide-react"

interface MemorialHeroProps {
  fullName: string
  preferredName?: string | null
  birthYear?: number | null
  deathYear?: number | null
  location?: string | null
  epitaph?: string | null
  portraitUrl?: string | null
  memoriesCount?: number
  photosCount?: number
  contributorsCount?: number
  onOpenContribute: () => void
}

export function MemorialHero({
  fullName,
  preferredName,
  birthYear = 1948,
  deathYear = 2024,
  location = "Devon, England",
  epitaph,
  portraitUrl = "/memorial-family-portrait-grandfather.jpg",
  memoriesCount = 14,
  photosCount = 42,
  contributorsCount = 8,
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
            className="size-full object-cover object-top filter grayscale contrast-105"
          />
          {/* Subtle bottom vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
          
          {/* Monospace film stamp */}
          <span className="absolute bottom-2 left-2 text-[9px] font-mono text-white/90 bg-black/40 backdrop-blur-xs px-1.5 py-0.5 rounded">
            ORIGINAL ARCHIVE
          </span>
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
          <p className="mt-4 text-base sm:text-xl text-[#555] leading-relaxed max-w-xl font-normal text-balance">
            “{epitaph}”
          </p>
        )}

        {/* Living Metrics Ribbon */}
        <div className="flex items-center gap-3 mt-4 text-xs font-medium text-[#777] flex-wrap justify-center select-none">
          <span>{memoriesCount} memories gathered</span>
          <span className="text-black/[0.15]">·</span>
          <span>{photosCount} photographs</span>
          <span className="text-black/[0.15]">·</span>
          <span>{contributorsCount} family contributors</span>
        </div>

        {/* Call-to-Action Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 select-none">
          {/* Primary Action: Add Memory */}
          <button
            type="button"
            onClick={onOpenContribute}
            className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap !rounded-full font-medium transition-all cursor-pointer border border-[color-mix(in_srgb,var(--primary)_80%,#3a3480)] bg-[color-mix(in_srgb,var(--primary)_90%,#3a3480)] text-primary-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.22),inset_0_-1px_0_rgba(58,52,128,0.30)] transform-gpu hover:bg-primary active:scale-[0.98] h-10 px-5 text-sm group"
          >
            <Plus className="size-4" />
            <span>Add a Memory</span>
          </button>
        </div>

      </div>

    </section>
  )
}
