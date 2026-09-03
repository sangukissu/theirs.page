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

      {/* High-Grade Step Cards */}
      <ul className="grid gap-4 sm:gap-6 lg:grid-cols-3">
        
        {/* ===================================================================== */}
        {/* Card 01 - "Create their page"                                         */}
        {/* ===================================================================== */}
        <li className="group relative flex flex-col overflow-hidden rounded-xl bg-[#f6f6f6] pb-6 sm:pb-8">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(125%_115%_at_0%_0%,#000_0%,#000_18%,transparent_66%)]"
          >
            <DitherGradient from="cyan" bloom="aura" />
          </span>

          <div className="relative flex items-baseline gap-2.5 px-6 py-3 sm:px-8">
            <span className="text-base tabular-nums text-muted-foreground font-medium">01</span>
            <h3 className="text-base font-medium tracking-tight text-[#454545]">Create their page</h3>
          </div>

          <div className="relative flex flex-1 items-center justify-center px-6 py-8 sm:px-8">
            <div className="w-full max-w-[22rem] cursor-default">
              <div className="relative min-w-0 flex flex-col rounded-[32px] border border-border bg-card p-1 shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
                {/* Clean, Silent Window Header — 3 Minimal Dots */}
                <div className="relative z-10 flex items-center gap-1.5 pb-2 pl-3.5 pt-2">
                  <span className="size-2 rounded-full bg-black/15" />
                  <span className="size-2 rounded-full bg-black/15" />
                  <span className="size-2 rounded-full bg-black/15" />
                </div>

                {/* Inner Screen: Clean Creation Preview */}
                <div className="relative flex min-w-0 flex-col h-44 rounded-[28px] border border-border bg-white p-4 justify-between">
                  <div className="flex items-center gap-3.5">
                    {/* Portrait Photo */}
                    <div className="size-16 rounded-2xl overflow-hidden bg-neutral-100 ring-1 ring-black/[0.08] shrink-0 shadow-2xs">
                      <img
                        src="/memorial-family-portrait-grandfather.jpg"
                        alt="Robert Carter"
                        className="size-full object-cover grayscale contrast-105"
                      />
                    </div>

                    {/* Name & Dates */}
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className="text-sm font-medium text-[#181925] truncate">Robert Carter</span>
                      <span className="text-xs font-mono text-muted-foreground">1948 — 2024</span>
                      <span className="text-xs text-muted-foreground">Devon, England</span>
                    </div>
                  </div>

                  {/* Handwritten Memory Snippet */}
                  <div className="p-2.5 rounded-xl bg-[#f8f8f9] border border-black/[0.04]">
                    <p className="text-xs italic text-[#555] line-clamp-2 leading-relaxed">
                      “He could make anyone feel unhurried.”
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <p className="relative pl-6 pr-6 text-sm leading-6 text-muted-foreground sm:pl-8 sm:pr-14 tracking-tight">
            Add their name, a favourite photo and a few details. Start simple, you can add more whenever you’re ready.
          </p>
        </li>

        {/* ===================================================================== */}
        {/* Card 02 - "Invite family & friends"                                   */}
        {/* ===================================================================== */}
        <li className="group relative flex flex-col overflow-hidden rounded-xl bg-[#f6f6f6] pb-6 sm:pb-8">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(125%_115%_at_0%_0%,#000_0%,#000_18%,transparent_66%)]"
          >
            <DitherGradient from="green" bloom="aura" />
          </span>

          <div className="relative flex items-baseline gap-2.5 px-6 py-3 sm:px-8">
            <span className="text-base tabular-nums text-muted-foreground font-medium">02</span>
            <h3 className="text-base font-medium tracking-tight text-[#454545]">Invite family & friends</h3>
          </div>

          <div className="relative flex flex-1 items-center justify-center px-6 py-8 sm:px-8">
            <div className="w-full max-w-[22rem] cursor-default">
              <div className="relative min-w-0 flex flex-col rounded-[32px] border border-border bg-card p-1 shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
                {/* Clean, Silent Window Header — 3 Minimal Dots */}
                <div className="relative z-10 flex items-center gap-1.5 pb-2 pl-3.5 pt-2">
                  <span className="size-2 rounded-full bg-black/15" />
                  <span className="size-2 rounded-full bg-black/15" />
                  <span className="size-2 rounded-full bg-black/15" />
                </div>

                {/* Inner Screen: Share Link & Contributors */}
                <div className="relative flex min-w-0 flex-col h-44 rounded-[28px] border border-border bg-white p-4 justify-between">
                  {/* The Shareable Link Capsule */}
                  <div className="flex items-center justify-between py-2 px-3 rounded-full bg-[#f8f8f9] border border-black/[0.06]">
                    <span className="text-xs font-mono text-muted-foreground truncate">
                      theirs.page/robert-carter
                    </span>
                    <Copy className="size-3 text-muted-foreground/80 shrink-0" />
                  </div>

                  {/* Contributions Flowing In */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="size-5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-medium flex items-center justify-center shrink-0">
                        A
                      </span>
                      <span className="text-[#333] truncate">
                        <strong className="font-medium text-[#181925]">Anita</strong> shared a story
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <span className="size-5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-medium flex items-center justify-center shrink-0">
                        D
                      </span>
                      <span className="text-[#333] truncate">
                        <strong className="font-medium text-[#181925]">David</strong> added 6 photos
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <p className="relative pl-6 pr-6 text-sm leading-6 text-muted-foreground sm:pl-8 sm:pr-14 tracking-tight">
            Share one link so the people who knew them can add their own photos, stories and memories.
          </p>
        </li>

        {/* ===================================================================== */}
        {/* Card 03 - "Watch their story live"                                    */}
        {/* ===================================================================== */}
        <li className="group relative flex flex-col overflow-hidden rounded-xl bg-[#f6f6f6] pb-6 sm:pb-8">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(125%_115%_at_0%_0%,#000_0%,#000_18%,transparent_66%)]"
          >
            <DitherGradient from="magenta" bloom="high" />
          </span>

          <div className="relative flex items-baseline gap-2.5 px-6 py-3 sm:px-8">
            <span className="text-base tabular-nums text-muted-foreground font-medium">03</span>
            <h3 className="text-base font-medium tracking-tight text-[#454545]">Watch their story live</h3>
          </div>

          <div className="relative flex flex-1 items-center justify-center px-6 py-8 sm:px-8">
            <div className="w-full max-w-[22rem] cursor-default">
              <div className="relative min-w-0 flex flex-col rounded-[32px] border border-border bg-card p-1 shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
                {/* Clean, Silent Window Header — 3 Minimal Dots */}
                <div className="relative z-10 flex items-center gap-1.5 pb-2 pl-3.5 pt-2">
                  <span className="size-2 rounded-full bg-black/15" />
                  <span className="size-2 rounded-full bg-black/15" />
                  <span className="size-2 rounded-full bg-black/15" />
                </div>

                {/* Inner Screen: Media Together (Story, Photo, Voicemail, Milestone) */}
                <div className="relative flex min-w-0 flex-col h-44 rounded-[28px] border border-border bg-white p-3.5 justify-between">
                  {/* Story & Photo */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 rounded-xl bg-[#f8f8f9] border border-black/[0.04] text-left">
                      <p className="text-[11px] text-[#444] italic line-clamp-3 leading-snug">
                        “Dad spent Christmas fixing the neighbour&apos;s washer.”
                      </p>
                    </div>

                    <div className="rounded-xl overflow-hidden ring-1 ring-black/[0.06] bg-neutral-100">
                      <img
                        src="/historical-wedding-photo.webp"
                        alt="Wedding 1974"
                        className="size-full object-cover grayscale contrast-105"
                      />
                    </div>
                  </div>

                  {/* Voicemail & Milestone */}
                  <div className="flex items-center justify-between pt-1 text-xs">
                    <div className="inline-flex items-center gap-1.5 text-muted-foreground font-mono text-[11px]">
                      <Volume2 className="size-3 text-primary shrink-0" />
                      <span>0:14 Voicemail</span>
                    </div>

                    <span className="text-[11px] font-mono text-muted-foreground">
                      1981 · Workshop
                    </span>
                  </div>
                </div>
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
