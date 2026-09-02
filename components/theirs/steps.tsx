"use client"

import { DitherGradient } from "@/components/theirs/dither-gradient"
import { SectionHeader } from "@/components/theirs/section-header"

export function TheirsSteps() {
  return (
    <section id="how-it-works" className="py-16 sm:py-24 px-4 max-w-6xl mx-auto flex flex-col gap-12 sm:gap-16">
      {/* Section Header */}
      <SectionHeader
        badge="How it works"
        title="Three steps from a blank screen to a living archive"
        description="Building a memorial shouldn't feel like filing administrative paperwork. It should feel like beginning to remember them."
      />

      {/* Exact Step Cards from getopen.so with Dither Canvas Glow */}
      <ul className="grid gap-4 sm:gap-6 lg:grid-cols-3">
        {/* Card 01 - Cyan Aura */}
        <li className="group relative flex flex-col overflow-hidden rounded-xl bg-[#f6f6f6] pb-6 sm:pb-8">
          {/* Exact Dither Canvas Background Masks */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(125%_115%_at_0%_0%,#000_0%,#000_18%,transparent_66%)]"
          >
            <DitherGradient from="cyan" bloom="aura" />
          </span>

          <div className="relative flex items-baseline gap-2.5 px-6 py-3 sm:px-8">
            <span className="text-base tabular-nums text-muted-foreground font-medium">01</span>
            <h3 className="text-base font-medium tracking-tight text-[#454545]">Start with what you have</h3>
          </div>

          <div className="relative flex flex-1 items-center justify-center px-6 py-8 sm:px-8">
            <div className="w-full max-w-[22rem] cursor-default">
              <div className="relative min-w-0 not-dark:bg-clip-padding text-card-foreground flex flex-col rounded-[32px] border border-border bg-card p-1 shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
                {/* Window Header */}
                <div className="relative z-10 flex items-center justify-between gap-2 pb-1.5 pl-3 pr-2 pt-1.5">
                  <h2 className="ml-1 flex items-center gap-2 text-[13px] font-medium text-foreground/80">
                    <span aria-hidden="true" className="ml-0.5 flex h-5 items-center gap-1.5">
                      <span className="size-2.5 rounded-full bg-[#ff5f57]" />
                      <span className="size-2.5 rounded-full bg-[#febc2e]" />
                      <span className="size-2.5 rounded-full bg-[#28c840]" />
                    </span>
                  </h2>
                </div>

                {/* Inner Screen */}
                <div className="relative flex min-w-0 flex-col not-dark:bg-clip-padding text-card-foreground h-40 overflow-hidden rounded-[28px] border border-border bg-[#f6f6f6] py-2 shadow-[0_1px_2px_rgba(0,0,0,0.06)] justify-center px-4">
                  <div className="flex flex-col gap-1.5">
                    <p className="flex items-start gap-1.5 font-mono text-[11px] leading-5">
                      <span className="text-muted-foreground/60">$</span>
                      <span className="text-foreground">theirs init &quot;Robert Carter&quot;</span>
                    </p>
                    <p className="flex items-center gap-1.5 text-xs text-[#305dde] font-medium">
                      ✓ Photo attached: portrait.jpg
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Draft live at theirs.page/robert-carter
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <p className="relative pl-6 pr-6 text-sm leading-6 text-muted-foreground sm:pl-8 sm:pr-14 tracking-tight">
            One photo, one name. No complex questionnaires, no death certificates to upload. That&apos;s all.
          </p>
        </li>

        {/* Card 02 - Green Aura */}
        <li className="group relative flex flex-col overflow-hidden rounded-xl bg-[#f6f6f6] pb-6 sm:pb-8">
          {/* Exact Dither Canvas Background Masks */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(125%_115%_at_0%_0%,#000_0%,#000_18%,transparent_66%)]"
          >
            <DitherGradient from="green" bloom="aura" />
          </span>

          <div className="relative flex items-baseline gap-2.5 px-6 py-3 sm:px-8">
            <span className="text-base tabular-nums text-muted-foreground font-medium">02</span>
            <h3 className="text-base font-medium tracking-tight text-[#454545]">The memories start arriving</h3>
          </div>

          <div className="relative flex flex-1 items-center justify-center px-6 py-8 sm:px-8">
            <div className="w-full max-w-[22rem] cursor-default">
              <div className="relative min-w-0 not-dark:bg-clip-padding text-card-foreground flex flex-col rounded-[32px] border border-border bg-card p-1 shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
                {/* Window Header */}
                <div className="relative z-10 flex items-center justify-between gap-2 pb-1.5 pl-3 pr-2 pt-1.5">
                  <h2 className="ml-1 flex items-center gap-2 text-[13px] font-medium text-foreground/80">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" color="currentColor" className="size-3.5 text-muted-foreground">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M8 12C8 18 12 22 12 22C12 22 16 18 16 12C16 6 12 2 12 2C12 2 8 6 8 12Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.5" />
                      <path d="M21 15H3" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
                      <path d="M21 9H3" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
                    </svg>
                    Family Invite
                  </h2>
                </div>

                {/* Inner Screen */}
                <div className="relative flex min-w-0 flex-col not-dark:bg-clip-padding text-card-foreground h-40 overflow-hidden rounded-[28px] border border-border bg-[#f6f6f6] py-2 shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
                  <div className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center">
                    <div className="flex items-center gap-2">
                      <div className="flex size-9 items-center justify-center rounded-2xl border border-border bg-white shadow-[0_1px_2px_rgba(0,0,0,0.06)] text-xs font-medium text-[#292929]">
                        A
                      </div>
                      <div className="h-px w-10 bg-border relative">
                        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-1.5 rounded-full bg-primary" />
                      </div>
                      <div className="flex size-9 items-center justify-center rounded-2xl border border-border bg-white shadow-[0_1px_2px_rgba(0,0,0,0.06)] text-primary">
                        <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                      </div>
                    </div>
                    <p className="text-xs font-medium text-foreground/80 mt-1">Waiting for the first story…</p>
                    <p className="text-[11px] text-muted-foreground max-w-44 leading-tight">
                      Send one link to relatives; they add memories without logging in.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <p className="relative pl-6 pr-6 text-sm leading-6 text-muted-foreground sm:pl-8 sm:pr-14 tracking-tight">
            The first memory lands within minutes: no login required for family, and you approve each one before it appears.
          </p>
        </li>

        {/* Card 03 - Magenta/Rose High Bloom */}
        <li className="group relative flex flex-col overflow-hidden rounded-xl bg-[#f6f6f6] pb-6 sm:pb-8">
          {/* Exact Dither Canvas Background Masks */}
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
              <div className="relative min-w-0 not-dark:bg-clip-padding text-card-foreground flex flex-col rounded-[32px] border border-border bg-card p-1 shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
                {/* Window Header */}
                <div className="relative z-10 flex items-center justify-between gap-2 pb-1.5 pl-3 pr-2 pt-1.5">
                  <h2 className="ml-1 flex items-center gap-2 text-[13px] font-medium text-foreground/80">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" color="currentColor" className="size-3.5 text-muted-foreground">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M8 12C8 18 12 22 12 22C12 22 16 18 16 12C16 6 12 2 12 2C12 2 8 6 8 12Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.5" />
                      <path d="M21 15H3" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
                      <path d="M21 9H3" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
                    </svg>
                    Contributors
                  </h2>
                </div>

                {/* Inner Screen */}
                <div className="relative flex min-w-0 flex-col not-dark:bg-clip-padding text-card-foreground h-40 overflow-hidden rounded-[28px] border border-border bg-[#f6f6f6] py-2 shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
                  <ul>
                    <li className="flex items-center justify-between gap-4 py-1 pr-4 pl-3.5 text-xs">
                      <span className="flex items-center gap-2 truncate">
                        <span className="size-3.5 rounded-full bg-rose-200 text-[9px] font-medium text-rose-800 flex items-center justify-center">A</span>
                        <span className="truncate text-foreground/80">Anita (Daughter)</span>
                      </span>
                      <span className="text-muted-foreground text-[11px] tabular-nums">4 memories</span>
                    </li>
                    <li className="flex items-center justify-between gap-4 py-1 pr-4 pl-3.5 text-xs">
                      <span className="flex items-center gap-2 truncate">
                        <span className="size-3.5 rounded-full bg-blue-200 text-[9px] font-medium text-blue-800 flex items-center justify-center">D</span>
                        <span className="truncate text-foreground/80">David (Colleague)</span>
                      </span>
                      <span className="text-muted-foreground text-[11px] tabular-nums">2 memories</span>
                    </li>
                    <li className="flex items-center justify-between gap-4 py-1 pr-4 pl-3.5 text-xs">
                      <span className="flex items-center gap-2 truncate">
                        <span className="size-3.5 rounded-full bg-amber-200 text-[9px] font-medium text-amber-800 flex items-center justify-center">S</span>
                        <span className="truncate text-foreground/80">Aunt Sarah</span>
                      </span>
                      <span className="text-muted-foreground text-[11px] tabular-nums">14 photos</span>
                    </li>
                    <li className="flex items-center justify-between gap-4 py-1 pr-4 pl-3.5 text-xs">
                      <span className="flex items-center gap-2 truncate">
                        <span className="size-3.5 rounded-full bg-emerald-200 text-[9px] font-medium text-emerald-800 flex items-center justify-center">R</span>
                        <span className="truncate text-foreground/80">Rahul (Grandson)</span>
                      </span>
                      <span className="text-muted-foreground text-[11px] tabular-nums">1 voicemail</span>
                    </li>
                  </ul>
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
