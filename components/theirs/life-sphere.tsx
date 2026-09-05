"use client"

import { useRef } from "react"
import { motion, useSpring, useMotionValue, useTransform } from "framer-motion"
import Link from "next/link"
import { Volume2, ArrowRight } from "lucide-react"

export function LifeSphere() {
  const containerRef = useRef<HTMLDivElement>(null)

  // Gentle 2D parallax for depth
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const parallaxX = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), {
    stiffness: 120,
    damping: 26,
  })
  const parallaxY = useSpring(useTransform(mouseY, [-0.5, 0.5], [-6, 6]), {
    stiffness: 120,
    damping: 26,
  })

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    mouseX.set(x)
    mouseY.set(y)
  }

  const handleMouseLeave = () => {
    mouseX.set(0)
    mouseY.set(0)
  }

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full h-[360px] sm:h-[430px] lg:h-[480px] overflow-hidden flex justify-center items-start select-none bg-white border-b border-black/[0.05]"
    >
      {/* ========================================================================= */}
      {/* THE LIFE SPHERE DOME — Cleanly Cut at Bottom Horizon Line (Like Reference) */}
      {/* ========================================================================= */}
      <div
        className="relative w-[1000px] sm:w-[1300px] lg:w-[1500px] aspect-square rounded-full [clip-path:circle(50%_at_50%_50%)] bg-[#fbfbfa] border-t border-black/[0.08] flex items-start justify-center pt-5 sm:pt-8 overflow-hidden shrink-0"
      >
        {/* Atmosphere & Horizon Luminous Rim Highlight */}
        <div className="absolute inset-x-0 top-0 h-32 rounded-t-full bg-gradient-to-b from-black/[0.015] to-transparent pointer-events-none" />
        
        {/* Glowing Horizon Accent Line */}
        <div className="absolute top-0 inset-x-1/4 h-[1px] bg-gradient-to-r from-transparent via-black/[0.1] to-transparent pointer-events-none" />

        {/* Spherical Latitude & Longitude Celestial Guide Arcs */}
        <svg
          className="absolute inset-0 size-full pointer-events-none stroke-black/[0.03] fill-none"
          viewBox="0 0 1500 1500"
          aria-hidden="true"
        >
          {/* Latitude Arcs */}
          <ellipse cx="750" cy="450" rx="680" ry="240" strokeWidth="1" strokeDasharray="3 6" />
          <ellipse cx="750" cy="560" rx="620" ry="200" strokeWidth="1" strokeDasharray="2 5" />
          <ellipse cx="750" cy="700" rx="550" ry="170" strokeWidth="0.8" strokeDasharray="2 4" />

          {/* Spherical Longitude Meridians */}
          <path d="M 750 0 C 450 300, 450 900, 750 1500" strokeWidth="0.8" strokeDasharray="3 6" />
          <path d="M 750 0 C 1050 300, 1050 900, 750 1500" strokeWidth="0.8" strokeDasharray="3 6" />
          <path d="M 750 0 C 250 400, 250 800, 750 1500" strokeWidth="0.6" strokeDasharray="2 5" />
          <path d="M 750 0 C 1250 400, 1250 800, 750 1500" strokeWidth="0.6" strokeDasharray="2 5" />
        </svg>

        {/* Clean Neutral Constellation Timeline Line */}
        <svg
          className="absolute inset-x-0 top-8 sm:top-12 w-full h-36 pointer-events-none stroke-black/15 fill-none z-10"
          viewBox="0 0 1500 150"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M 120 100 Q 750 15 1380 110"
            strokeWidth="1.2"
            strokeDasharray="4 6"
          />
        </svg>
      </div>

      {/* ========================================================================= */}
      {/* FLOATING ARTIFACTS CONTAINER (Constrained to max-w-4xl so ZERO clipping)  */}
      {/* ========================================================================= */}
      <motion.div
        style={{ x: parallaxX, y: parallaxY }}
        className="absolute inset-0 max-w-4xl lg:max-w-5xl mx-auto pointer-events-none z-20 flex justify-center"
      >
        {/* ----------------------------------------------------------------------- */}
        {/* CENTERPIECE: Robert's Iconic Portrait & Inscribed Life Identity         */}
        {/* ----------------------------------------------------------------------- */}
        <div className="relative pointer-events-auto flex flex-col items-center text-center mt-3 sm:mt-5">
          <Link
            href="/robert-carter"
            className="group block relative cursor-pointer"
            title="Explore Robert Carter's whole life"
          >
            {/* Crisp Photographic Frame Matching Site Style */}
            <div className="relative size-24 sm:size-32 md:size-36 rounded-full overflow-hidden bg-neutral-100 ring-4 ring-white shadow-sm border border-black/[0.08] mx-auto transition-transform duration-300 group-hover:scale-105">
              <img
                src="/memorial-family-portrait-grandfather.jpg"
                alt="Robert Edward Carter"
                className="size-full object-cover object-top"
              />
            </div>

            {/* Inscribed Life Name & Span */}
            <div className="mt-2.5 flex flex-col items-center">
              <h2 className="text-xl sm:text-2xl font-medium tracking-tight text-[#181925]">
                Robert Edward Carter
              </h2>
              <span className="font-mono text-xs text-[#888] tracking-wider mt-0.5">
                1948 — 2024 · Devon, England
              </span>

              {/* Inscribed One-Line Epitaph */}
              <p className="mt-1.5 text-xs text-[#555] italic max-w-xs sm:max-w-sm leading-relaxed">
                “He could fix almost anything, except his habit of telling the same joke twice.”
              </p>

              {/* Clean Presence Pill matching site design */}
              <div className="inline-flex items-center gap-2 mt-2 px-2.5 py-0.5 rounded-full bg-white border border-black/[0.06] text-[11px] font-mono text-[#777] shadow-2xs">
                <span>14 memories</span>
                <span className="size-1 rounded-full bg-black/20" />
                <span>42 photos</span>
                <span className="size-1 rounded-full bg-black/20" />
                <span>0:14 voicemail</span>
              </div>
            </div>
          </Link>
        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* LEFT WING ARTIFACTS — Curated, Fully Visible, Matching Bento Style       */}
        {/* ----------------------------------------------------------------------- */}

        {/* Left Artifact 1: 1952 Childhood Photo Card (Elevated along curve) */}
        <div className="absolute top-4 sm:top-6 left-3 sm:left-6 lg:left-10 pointer-events-auto">
          <div className="p-2 sm:p-2.5 rounded-2xl bg-white border border-black/[0.08] shadow-xs flex items-center gap-2.5 transition-transform duration-300 hover:scale-105">
            <div className="size-10 sm:size-11 rounded-xl overflow-hidden bg-neutral-100 border border-black/[0.06] shrink-0">
              <img
                src="/old-school-photo.webp"
                alt="Exeter Childhood 1952"
                className="size-full object-cover grayscale"
              />
            </div>
            <div className="flex flex-col text-left pr-1">
              <span className="text-xs font-medium text-[#181925]">Exeter Childhood</span>
              <span className="text-[10px] font-mono text-[#888]">1952 · Devon Moors</span>
            </div>
          </div>
          {/* Subtle connection pin indicator */}
          <div className="w-px h-3 bg-black/[0.12] mx-auto" />
          <div className="size-1.5 rounded-full bg-primary mx-auto" />
        </div>

        {/* Left Artifact 2: Anita's Memory Quote Pill */}
        <div className="hidden sm:flex absolute top-36 sm:top-40 left-2 sm:left-4 lg:left-8 pointer-events-auto flex-col items-start">
          <div className="p-2.5 rounded-2xl bg-white border border-black/[0.08] shadow-xs flex flex-col gap-1 text-left max-w-[210px] transition-transform duration-300 hover:scale-105">
            <div className="flex items-center gap-1.5">
              <div className="size-4 rounded-full bg-neutral-200 text-[#181925] text-[9px] font-medium flex items-center justify-center">
                A
              </div>
              <span className="text-[11px] font-medium text-[#181925]">Anita (Daughter)</span>
            </div>
            <p className="text-[11px] text-[#555] leading-relaxed italic line-clamp-2">
              “Dad spent Christmas Day fixing the neighbour&apos;s washing machine...”
            </p>
          </div>
        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* RIGHT WING ARTIFACTS — Curated, Fully Visible, Matching Bento Style      */}
        {/* ----------------------------------------------------------------------- */}

        {/* Right Artifact 1: 1974 Wedding Photo Card (Elevated along curve) */}
        <div className="absolute top-4 sm:top-6 right-3 sm:right-6 lg:right-10 pointer-events-auto">
          <div className="p-2 sm:p-2.5 rounded-2xl bg-white border border-black/[0.08] shadow-xs flex items-center gap-2.5 transition-transform duration-300 hover:scale-105">
            <div className="size-10 sm:size-11 rounded-xl overflow-hidden bg-neutral-100 border border-black/[0.06] shrink-0">
              <img
                src="/historical-wedding-photo.webp"
                alt="St. Jude's, July 1974"
                className="size-full object-cover grayscale"
              />
            </div>
            <div className="flex flex-col text-left pr-1">
              <span className="text-xs font-medium text-[#181925]">Wedding at St. Jude&apos;s</span>
              <span className="text-[10px] font-mono text-[#888]">July 1974 · Dartmoor</span>
            </div>
          </div>
          {/* Subtle connection pin indicator */}
          <div className="w-px h-3 bg-black/[0.12] mx-auto" />
          <div className="size-1.5 rounded-full bg-primary mx-auto" />
        </div>

        {/* Right Artifact 2: Preserved Audio Voicemail Capsule */}
        <div className="hidden sm:flex absolute top-36 sm:top-40 right-2 sm:right-4 lg:right-8 pointer-events-auto">
          <div className="px-3.5 py-2 rounded-2xl bg-white border border-black/[0.08] shadow-xs flex items-center gap-2.5 transition-transform duration-300 hover:scale-105">
            <div className="size-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Volume2 className="size-3" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-medium text-[#181925] leading-tight">
                Voicemail from Dad
              </span>
              <span className="text-[10px] font-mono text-[#888]">0:14 · Soft chuckle</span>
            </div>
            {/* 5 Animated Frequency Waveform Bars */}
            <div className="flex items-center gap-[2px] h-3.5 ml-1">
              {[40, 75, 100, 60, 35].map((h, i) => (
                <span key={i} className="w-[2px] bg-primary rounded-full" style={{ height: `${h}%` }} />
              ))}
            </div>
          </div>
        </div>

      </motion.div>

      {/* ----------------------------------------------------------------------- */}
      {/* HORIZON CUT LINE & ANCHOR ACTION (Exact Reference Composition)         */}
      {/* ----------------------------------------------------------------------- */}
      <div className="absolute inset-x-0 bottom-0 flex items-center justify-center pb-3.5 z-30 pointer-events-none">
        <Link
          href="/robert-carter"
          className="pointer-events-auto inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-black/[0.08] text-xs font-medium text-[#181925] hover:bg-neutral-50 shadow-xs transition-all group"
        >
          <span>Explore Robert&apos;s full life page</span>
          <ArrowRight className="size-3 text-primary group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

    </div>
  )
}
