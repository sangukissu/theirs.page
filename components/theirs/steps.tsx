"use client"

import { DitherGradient } from "@/components/theirs/dither-gradient"
import { SectionHeader } from "@/components/theirs/section-header"
import { Copy, Volume2 } from "lucide-react"

export function TheirsSteps() {
  return (
    <section id="how-it-works" className="py-16 sm:py-24 px-4 max-w-6xl mx-auto flex flex-col gap-12 sm:gap-16">
      {/* Section Header */}
      <SectionHeader
        badge="How it works"
        title="Create their memorial. Let everyone tell their story."
        description="You don’t need to have everything ready. Start with the basics, share the page with the people who knew them, and build it together over time."
      />

      {/* 3 Open Editorial Scenes (Zero Nested Cards, Zero Dirty Shadows) */}
      <ul className="grid gap-4 sm:gap-6 lg:grid-cols-3">
        
        {/* ===================================================================== */}
        {/* Step 01 - "Create their page"                                         */}
        {/* Open Editorial Scene: The Photograph & The Inscription               */}
        {/* ===================================================================== */}
        <li className="group relative flex flex-col overflow-hidden rounded-2xl bg-[#f6f6f6] pb-6 sm:pb-8 border border-black/[0.04]">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(125%_115%_at_0%_0%,#000_0%,#000_18%,transparent_66%)]"
          >
            <DitherGradient from="cyan" bloom="aura" />
          </span>

          <div className="relative flex items-baseline gap-2.5 px-6 py-4 sm:px-8">
            <span className="text-base tabular-nums text-muted-foreground font-medium">01</span>
            <h3 className="text-base font-medium tracking-tight text-[#222]">Create their page</h3>
          </div>

          {/* Open Graphic Scene — No card-in-card, no box shadows */}
          <div className="relative flex flex-1 items-center justify-center px-6 py-8 sm:px-8 min-h-[220px]">
            <div className="relative w-full max-w-[19rem] flex items-center gap-4">
              {/* Tilted Analog Photo Print */}
              <div className="relative -rotate-3 transition-transform duration-300 group-hover:rotate-0 shrink-0">
                <div className="p-1 bg-white border border-black/[0.08] rounded-xl shadow-xs">
                  <div className="size-20 sm:size-22 rounded-lg overflow-hidden bg-neutral-100">
                    <img
                      src="/memorial-family-portrait-grandfather.jpg"
                      alt="Robert Carter"
                      className="size-full object-cover grayscale contrast-105"
                    />
                  </div>
                </div>
              </div>

              {/* Inscribed Typographic Details */}
              <div className="flex flex-col text-left">
                <span className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground/80">
                  Page Draft
                </span>
                <h4 className="text-base font-medium text-[#181925] leading-snug mt-0.5">
                  Robert Carter
                </h4>
                <p className="text-xs font-mono text-muted-foreground mt-0.5">
                  1948 — 2024
                </p>
                <span className="text-[11px] text-muted-foreground/90 mt-1 italic font-serif">
                  Devon, England
                </span>
              </div>
            </div>
          </div>

          <p className="relative pl-6 pr-6 text-sm leading-6 text-muted-foreground sm:pl-8 sm:pr-14 tracking-tight">
            Add their name, a favourite photo and a few details. Start simple, you can add more whenever you’re ready.
          </p>
        </li>

        {/* ===================================================================== */}
        {/* Step 02 - "Invite family & friends"                                   */}
        {/* Open Network Scene: One Link Drawing In Memories                     */}
        {/* ===================================================================== */}
        <li className="group relative flex flex-col overflow-hidden rounded-2xl bg-[#f6f6f6] pb-6 sm:pb-8 border border-black/[0.04]">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(125%_115%_at_0%_0%,#000_0%,#000_18%,transparent_66%)]"
          >
            <DitherGradient from="green" bloom="aura" />
          </span>

          <div className="relative flex items-baseline gap-2.5 px-6 py-4 sm:px-8">
            <span className="text-base tabular-nums text-muted-foreground font-medium">02</span>
            <h3 className="text-base font-medium tracking-tight text-[#222]">Invite family & friends</h3>
          </div>

          {/* Open Graphic Scene: The Link & Contributed Leaves */}
          <div className="relative flex flex-1 items-center justify-center px-6 py-8 sm:px-8 min-h-[220px]">
            <div className="relative w-full max-w-[19rem] flex flex-col items-center gap-3">
              {/* Central Shared Link Capsule */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-black/[0.08] shadow-2xs">
                <span className="size-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span className="text-xs font-mono text-[#555]">
                  theirs.page/robert-carter
                </span>
                <Copy className="size-3 text-muted-foreground ml-1" />
              </div>

              {/* Floating Contributed Leaves */}
              <div className="w-full flex flex-col gap-2 mt-1">
                {/* Contributor 1: Anita's memory */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/90 border border-black/[0.06] text-left text-xs">
                  <span className="size-5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-medium flex items-center justify-center shrink-0">
                    A
                  </span>
                  <p className="truncate text-[#444] italic">
                    “He never missed a concert...”
                  </p>
                </div>

                {/* Contributor 2: David's photo */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/90 border border-black/[0.06] text-left text-xs">
                  <span className="size-5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-medium flex items-center justify-center shrink-0">
                    D
                  </span>
                  <span className="text-[#444] truncate">
                    Shared 1974 workshop snapshot
                  </span>
                </div>
              </div>
            </div>
          </div>

          <p className="relative pl-6 pr-6 text-sm leading-6 text-muted-foreground sm:pl-8 sm:pr-14 tracking-tight">
            Share one link so the people who knew them can add their own photos, stories and memories.
          </p>
        </li>

        {/* ===================================================================== */}
        {/* Step 03 - "Watch their story live"                                    */}
        {/* Open Collage Scene: Intertwined Memories, Audio & Photography         */}
        {/* ===================================================================== */}
        <li className="group relative flex flex-col overflow-hidden rounded-2xl bg-[#f6f6f6] pb-6 sm:pb-8 border border-black/[0.04]">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(125%_115%_at_0%_0%,#000_0%,#000_18%,transparent_66%)]"
          >
            <DitherGradient from="magenta" bloom="high" />
          </span>

          <div className="relative flex items-baseline gap-2.5 px-6 py-4 sm:px-8">
            <span className="text-base tabular-nums text-muted-foreground font-medium">03</span>
            <h3 className="text-base font-medium tracking-tight text-[#222]">Watch their story live</h3>
          </div>

          {/* Open Graphic Scene: Overlapping Memory Elements */}
          <div className="relative flex flex-1 items-center justify-center px-6 py-8 sm:px-8 min-h-[220px]">
            <div className="relative w-full max-w-[19rem] flex flex-col gap-2.5">
              {/* Top Pair: Handwritten Story + Tilted Photo */}
              <div className="flex items-center gap-2.5">
                <div className="flex-1 p-2.5 rounded-xl bg-white border border-black/[0.06] text-left">
                  <span className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground">
                    Story
                  </span>
                  <p className="text-[11px] font-serif italic text-[#444] line-clamp-2 leading-snug mt-0.5">
                    “Dad spent Christmas fixing the neighbour’s washer.”
                  </p>
                </div>

                <div className="rotate-2 p-1 bg-white border border-black/[0.08] rounded-xl shrink-0 shadow-xs">
                  <div className="size-14 rounded-lg overflow-hidden bg-neutral-100">
                    <img
                      src="/historical-wedding-photo.webp"
                      alt="1974 Wedding"
                      className="size-full object-cover grayscale contrast-105"
                    />
                  </div>
                </div>
              </div>

              {/* Bottom Row: Voice Note & Milestone */}
              <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-white border border-black/[0.06]">
                <div className="inline-flex items-center gap-2 text-xs text-[#555] font-mono">
                  <Volume2 className="size-3 text-primary shrink-0" />
                  <span>Voicemail · 0:14</span>
                </div>
                <span className="text-[11px] font-mono text-muted-foreground">
                  1981 · Workshop
                </span>
              </div>
            </div>
          </div>

          <p className="relative pl-6 pr-6 text-sm leading-6 text-muted-foreground sm:pl-8 sm:pr-14 tracking-tight">
            Memories, photos, voicemails, and milestones all together on one screen, updating as family members contribute.
          </p>
        </li>
      </ul>
    </section>
  )
}
