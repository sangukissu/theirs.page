"use client"

import { useRef } from "react"
import { motion, useSpring, useMotionValue, useTransform } from "framer-motion"

export function LifePanorama() {
  const containerRef = useRef<HTMLDivElement>(null)

  // Very subtle parallax tilt on mouse move
  const mouseX = useMotionValue(0)
  const springX = useSpring(useTransform(mouseX, [-0.5, 0.5], [-18, 18]), {
    stiffness: 90,
    damping: 28,
  })

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    mouseX.set(x)
  }

  const handleMouseLeave = () => {
    mouseX.set(0)
  }

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full overflow-hidden select-none flex justify-center items-center pt-2 sm:pt-6 pb-4"
    >
      {/* Soft warm atmospheric background glow */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="w-full max-w-5xl h-72 rounded-full bg-gradient-to-r from-amber-500/[0.02] via-primary/[0.035] to-amber-500/[0.02] blur-3xl -z-10" />
      </div>

      {/* ========================================================================= */}
      {/* THE LIFE PANORAMA — One continuous cinematic life unfolding left to right */}
      {/* ========================================================================= */}
      <motion.div
        style={{ x: springX }}
        className="relative w-[1100px] sm:w-[1300px] lg:w-[1450px] h-[340px] sm:h-[400px] lg:h-[440px] flex items-center justify-between shrink-0"
      >
        {/* Organic Luminous Timeline Hairline connecting the moments */}
        <svg
          className="absolute inset-0 size-full pointer-events-none stroke-primary/30 fill-none z-0"
          viewBox="0 0 1450 440"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M 60 260 C 280 210, 480 290, 720 220 C 960 160, 1180 250, 1400 190"
            strokeWidth="1.5"
            strokeDasharray="4 6"
          />
        </svg>

        {/* ----------------------------------------------------------------------- */}
        {/* CHAPTER 1 (Far Left): 1952 · Childhood on the Devon Moors              */}
        {/* ----------------------------------------------------------------------- */}
        <div className="relative z-10 flex flex-col items-start gap-2.5 -ml-4 sm:ml-2">
          {/* Faded 1950s Black & White Photograph */}
          <div className="relative w-36 sm:w-44 lg:w-48 aspect-4/3 rounded-2xl overflow-hidden shadow-sm ring-1 ring-black/[0.08] rotate-[-3deg] transition-transform duration-500 hover:rotate-0 hover:scale-105">
            <img
              src="/old-school-photo.webp"
              alt="Exeter Childhood 1952"
              className="size-full object-cover grayscale contrast-115 brightness-95"
            />
            {/* Film vignette overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
          </div>

          {/* Inscribed Milestone Metadata directly on canvas (No Box) */}
          <div className="flex flex-col text-left pl-1">
            <span className="font-mono text-xs sm:text-sm font-medium text-[#181925]">
              1952
            </span>
            <span className="text-[11px] font-mono text-[#888]">
              Exeter · Devon Moors
            </span>
          </div>
        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* CHAPTER 2 (Center-Left): 1974 · Married Meena at St. Jude's             */}
        {/* ----------------------------------------------------------------------- */}
        <div className="relative z-10 flex flex-col items-start gap-2 -mt-4 sm:-mt-8">
          {/* Faint Handwritten Letter Fragment passing behind */}
          <div className="absolute -top-10 -left-6 z-0 text-[11px] font-serif italic text-[#888] select-none pointer-events-none opacity-60">
            “my heart only ticks for you...”
          </div>

          {/* 1970s Warm Wedding Photograph */}
          <div className="relative z-10 w-44 sm:w-52 lg:w-56 aspect-4/3 rounded-2xl overflow-hidden shadow-md ring-1 ring-black/[0.08] rotate-[2deg] transition-transform duration-500 hover:rotate-0 hover:scale-105">
            <img
              src="/historical-wedding-photo.webp"
              alt="Wedding at St. Jude's 1974"
              className="size-full object-cover grayscale contrast-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none" />
          </div>

          {/* Inscribed Milestone Metadata directly on canvas */}
          <div className="relative z-10 flex flex-col text-left pl-1">
            <span className="font-mono text-xs sm:text-sm font-medium text-[#181925]">
              1974 · Married Meena
            </span>
            <span className="text-[11px] font-mono text-[#888]">
              St. Jude’s Church · Dartmoor
            </span>
          </div>
        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* CHAPTER 3 (Center): 1981 · The Horology Workshop                        */}
        {/* ----------------------------------------------------------------------- */}
        <div className="relative z-10 flex flex-col items-start gap-2 mt-6 sm:mt-10">
          {/* 1980s Workshop Photograph */}
          <div className="relative w-40 sm:w-48 lg:w-52 aspect-4/3 rounded-2xl overflow-hidden shadow-sm ring-1 ring-black/[0.08] rotate-[-2deg] transition-transform duration-500 hover:rotate-0 hover:scale-105">
            <img
              src="/vintage-family-portraits-colorized.webp"
              alt="Carter Horology 1981"
              className="size-full object-cover grayscale contrast-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none" />
          </div>

          {/* Inscribed Milestone & Famous Saying */}
          <div className="flex flex-col text-left pl-1">
            <span className="font-mono text-xs sm:text-sm font-medium text-[#181925]">
              1981 · Opened his shop
            </span>
            <p className="text-[11px] italic text-[#666] mt-0.5 max-w-[170px] leading-snug">
              “He could fix almost anything.”
            </p>
          </div>
        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* CHAPTER 4 (Center-Right): 2007 · Family & Grandchildren                 */}
        {/* ----------------------------------------------------------------------- */}
        <div className="relative z-10 flex flex-col items-start gap-2 -mt-6 sm:-mt-10">
          {/* Family snapshot with kids */}
          <div className="relative w-40 sm:w-48 lg:w-52 aspect-4/3 rounded-2xl overflow-hidden shadow-sm ring-1 ring-black/[0.08] rotate-[3deg] transition-transform duration-500 hover:rotate-0 hover:scale-105">
            <img
              src="/memorial-family-portrait-combined.jpg"
              alt="Family gathering Devon"
              className="size-full object-cover grayscale contrast-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none" />
          </div>

          {/* Inscribed Milestone */}
          <div className="flex flex-col text-left pl-1">
            <span className="font-mono text-xs sm:text-sm font-medium text-[#181925]">
              2007 · Became a grandfather
            </span>
            <span className="text-[11px] font-mono text-[#888]">
              Devon Garden with Anita & Leo
            </span>
          </div>
        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* CHAPTER 5 (Far Right): 2024 · Strongest Later-Life Portrait & Voice     */}
        {/* ----------------------------------------------------------------------- */}
        <div className="relative z-10 flex flex-col items-start gap-2.5 -mr-4 sm:mr-2">
          {/* Large, Commanding Final Portrait */}
          <div className="relative w-44 sm:w-56 lg:w-60 aspect-4/5 rounded-3xl overflow-hidden shadow-xl ring-1 ring-black/[0.1] rotate-[-1deg] transition-transform duration-500 hover:rotate-0 hover:scale-105">
            <img
              src="/memorial-family-portrait-grandfather.jpg"
              alt="Robert Carter 2024"
              className="size-full object-cover grayscale contrast-115 brightness-100"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent pointer-events-none" />
          </div>

          {/* Inscribed Voice Waveform & Year directly on canvas */}
          <div className="flex flex-col text-left pl-1 w-full">
            <div className="flex items-baseline justify-between gap-4">
              <span className="font-mono text-xs sm:text-sm font-medium text-[#181925]">
                2024
              </span>
              {/* Subtle audio waveform chip */}
              <div className="inline-flex items-center gap-1.5 text-[11px] font-mono text-primary">
                <span className="font-semibold tracking-tighter">━━━━━━</span>
                <span>0:14</span>
              </div>
            </div>
            <span className="text-[11px] font-mono text-[#888]">
              “Remembering Bob”
            </span>
          </div>
        </div>

      </motion.div>

      {/* Soft lower gradient fade into page so the next section begins naturally */}
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white via-white/70 to-transparent pointer-events-none" />
    </div>
  )
}
