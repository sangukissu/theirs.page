"use client"

import Link from "next/link"
import { SectionHeader } from "@/components/theirs/section-header"

export function TheirsPricing() {
  return (
    <section id="pricing" className="py-16 sm:py-24 flex flex-col gap-12 relative overflow-hidden">
      {/* Section Header */}
      <SectionHeader
        badge="Pricing"
        title="Start free. Make it complete when you're ready."
        description={
          <>
            Create a simple memorial for free. Upgrade once when you want to preserve their full story{" "}
            <span className="rounded-md bg-primary/10 box-decoration-clone px-1 py-0.5 text-primary">
              without monthly subscriptions
            </span>
            .
          </>
        }
        className="px-5 max-w-3xl mx-auto"
      />

      {/* Pricing Cards Container */}
      <div className="w-full max-w-4xl mx-auto px-5">
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 list-none p-0 m-0">
          
          {/* =============================================================== */}
          {/* CARD 1: FREE (Flat Gray Card, zero drop shadow)                  */}
          {/* =============================================================== */}
          <li className="flex flex-col rounded-2xl bg-[#f6f6f6] p-6 sm:p-7 border border-black/[0.04]">
            {/* Header / Eyebrow */}
            <div className="flex items-baseline justify-between gap-3">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#181925] font-medium">
                Free
              </p>
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                SIMPLE MEMORIAL
              </p>
            </div>

            {/* Price */}
            <p className="mt-4 flex items-baseline text-4xl font-medium tracking-tight tabular-nums text-[#181925]">
              $0
              <span className="ml-1.5 text-base text-muted-foreground font-normal">Free Plan</span>
            </p>

            {/* Key Specs Table */}
            <dl className="mt-5 flex flex-col gap-2 border-t border-dashed border-border pt-4 font-mono text-xs">
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-muted-foreground">Photos included</dt>
                <dd className="tabular-nums font-medium text-primary">Up to 5</dd>
              </div>
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-muted-foreground">Memories</dt>
                <dd className="tabular-nums font-medium text-primary">Guestbook</dd>
              </div>
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-muted-foreground">Page privacy</dt>
                <dd className="tabular-nums font-medium text-primary">Public / Link</dd>
              </div>
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-muted-foreground">Charged</dt>
                <dd className="tabular-nums font-medium text-[#181925]">$0</dd>
              </div>
            </dl>

            {/* Features Checklist */}
            <ul className="mt-5 flex flex-1 flex-col gap-1.5 border-t border-dashed border-border pt-4 list-none p-0">
              <li className="flex items-start gap-2.5 text-sm leading-6 tracking-tight text-[#181925]">
                <span aria-hidden="true" className="mt-2.5 block size-2 shrink-0 text-muted-foreground/50">
                  <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 8 8">
                    <path d="M4 0v8M0 4h8" />
                  </svg>
                </span>
                Dedicated Theirs memorial page
              </li>
              <li className="flex items-start gap-2.5 text-sm leading-6 tracking-tight text-[#181925]">
                <span aria-hidden="true" className="mt-2.5 block size-2 shrink-0 text-muted-foreground/50">
                  <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 8 8">
                    <path d="M4 0v8M0 4h8" />
                  </svg>
                </span>
                Up to 5 essential photos
              </li>
              <li className="flex items-start gap-2.5 text-sm leading-6 tracking-tight text-[#181925]">
                <span aria-hidden="true" className="mt-2.5 block size-2 shrink-0 text-muted-foreground/50">
                  <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 8 8">
                    <path d="M4 0v8M0 4h8" />
                  </svg>
                </span>
                Guestbook for messages
              </li>
              <li className="flex items-start gap-2.5 text-sm leading-6 tracking-tight text-[#181925]">
                <span aria-hidden="true" className="mt-2.5 block size-2 shrink-0 text-muted-foreground/50">
                  <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 8 8">
                    <path d="M4 0v8M0 4h8" />
                  </svg>
                </span>
                Share with family and friends
              </li>
              <li className="flex items-start gap-2.5 text-sm leading-6 tracking-tight text-[#181925]">
                <span aria-hidden="true" className="mt-2.5 block size-2 shrink-0 text-muted-foreground/50">
                  <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 8 8">
                    <path d="M4 0v8M0 4h8" />
                  </svg>
                </span>
                Quiet, ad-free environment
              </li>
            </ul>

            {/* CTA Button */}
            <Link
              href="/login"
              prefetch={true}
              className="inline-flex items-center justify-center gap-1 whitespace-nowrap !rounded-full font-medium transition-all cursor-pointer border border-[color-mix(in_srgb,var(--primary)_80%,#3a3480)] bg-[color-mix(in_srgb,var(--primary)_90%,#3a3480)] text-primary-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.22),inset_0_-1px_0_rgba(58,52,128,0.30)] transform-gpu hover:bg-primary hover:border-[color-mix(in_srgb,var(--primary)_70%,#3a3480)] active:translate-y-px active:scale-[0.98] h-10 px-4 text-sm mt-6 w-full"
            >
              Create a free memorial
            </Link>
            <p className="mt-2.5 text-center text-xs text-muted-foreground/80">
              No commitment. Free forever.
            </p>
          </li>

          {/* =============================================================== */}
          {/* CARD 2: COMPLETE (Flat Dark #1f1f1f Card, zero drop shadow)      */}
          {/* =============================================================== */}
          <li className="flex flex-col rounded-2xl bg-[#1f1f1f] p-6 text-white sm:p-7 border border-white/[0.06] [--border:rgba(255,255,255,0.16)] [--muted-foreground:#9c9c9c]">
            {/* Header / Eyebrow */}
            <div className="flex items-baseline justify-between gap-3">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] font-medium text-white">
                Complete
              </p>
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                Family archive
              </p>
            </div>

            {/* Price */}
            <p className="mt-4 flex items-baseline text-4xl font-medium tracking-tight tabular-nums text-white">
              $179
              <span className="ml-1.5 text-base text-muted-foreground font-normal">one-time</span>
            </p>

            {/* Key Specs Table */}
            <dl className="mt-5 flex flex-col gap-2 border-t border-dashed border-border pt-4 font-mono text-xs [--primary:#8fb0ff]">
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-muted-foreground">Photos & media</dt>
                <dd className="tabular-nums font-medium text-primary">Unlimited & original</dd>
              </div>
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-muted-foreground">Voice & audio</dt>
                <dd className="tabular-nums font-medium text-primary">Preserved recordings</dd>
              </div>
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-muted-foreground">Family contributors</dt>
                <dd className="tabular-nums font-medium text-primary">Limitless</dd>
              </div>
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-muted-foreground">Charged</dt>
                <dd className="tabular-nums font-medium text-primary">Once per memorial</dd>
              </div>
            </dl>

            {/* Features Checklist */}
            <ul className="mt-5 flex flex-1 flex-col gap-1.5 border-t border-dashed border-border pt-4 list-none p-0">
              <li className="flex items-start gap-2.5 text-sm leading-6 tracking-tight text-white font-medium">
                <span aria-hidden="true" className="mt-2.5 block size-2 shrink-0 text-muted-foreground/50">
                  <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 8 8">
                    <path d="M4 0v8M0 4h8" />
                  </svg>
                </span>
                Everything in Free
              </li>
              <li className="flex items-start gap-2.5 text-sm leading-6 tracking-tight text-[#e5e5e5]">
                <span aria-hidden="true" className="mt-2.5 block size-2 shrink-0 text-muted-foreground/50">
                  <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 8 8">
                    <path d="M4 0v8M0 4h8" />
                  </svg>
                </span>
                Family stories & memories
              </li>
              <li className="flex items-start gap-2.5 text-sm leading-6 tracking-tight text-[#e5e5e5]">
                <span aria-hidden="true" className="mt-2.5 block size-2 shrink-0 text-muted-foreground/50">
                  <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 8 8">
                    <path d="M4 0v8M0 4h8" />
                  </svg>
                </span>
                Photo albums in original quality
              </li>
               <li className="flex items-start gap-2.5 text-sm leading-6 tracking-tight text-[#e5e5e5]">
                <span aria-hidden="true" className="mt-2.5 block size-2 shrink-0 text-muted-foreground/50">
                  <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 8 8">
                    <path d="M4 0v8M0 4h8" />
                  </svg>
                </span>
                Life Story timeline of their life
              </li>
              <li className="flex items-start gap-2.5 text-sm leading-6 tracking-tight text-[#e5e5e5]">
                <span aria-hidden="true" className="mt-2.5 block size-2 shrink-0 text-muted-foreground/50">
                  <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 8 8">
                    <path d="M4 0v8M0 4h8" />
                  </svg>
                </span>
                Video & voice recordings
              </li>
              <li className="flex items-start gap-2.5 text-sm leading-6 tracking-tight text-[#e5e5e5]">
                <span aria-hidden="true" className="mt-2.5 block size-2 shrink-0 text-muted-foreground/50">
                  <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 8 8">
                    <path d="M4 0v8M0 4h8" />
                  </svg>
                </span>
                Unlimited family contributors
              </li>
              <li className="flex items-start gap-2.5 text-sm leading-6 tracking-tight text-[#e5e5e5]">
                <span aria-hidden="true" className="mt-2.5 block size-2 shrink-0 text-muted-foreground/50">
                  <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 8 8">
                    <path d="M4 0v8M0 4h8" />
                  </svg>
                </span>
                Private family memorial
              </li>
              <li className="flex items-start gap-2.5 text-sm leading-6 tracking-tight text-[#e5e5e5]">
                <span aria-hidden="true" className="mt-2.5 block size-2 shrink-0 text-muted-foreground/50">
                  <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 8 8">
                    <path d="M4 0v8M0 4h8" />
                  </svg>
                </span>
                Multiple family caretakers
              </li>
              <li className="flex items-start gap-2.5 text-sm leading-6 tracking-tight text-[#e5e5e5]">
                <span aria-hidden="true" className="mt-2.5 block size-2 shrink-0 text-muted-foreground/50">
                  <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 8 8">
                    <path d="M4 0v8M0 4h8" />
                  </svg>
                </span>
                Choose the next caretaker
              </li>
               <li className="flex items-start gap-2.5 text-sm leading-6 tracking-tight text-[#e5e5e5]">
                <span aria-hidden="true" className="mt-2.5 block size-2 shrink-0 text-muted-foreground/50">
                  <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 8 8">
                    <path d="M4 0v8M0 4h8" />
                  </svg>
                </span>
                Approve contributions before publishing
              </li>
              <li className="flex items-start gap-2.5 text-sm leading-6 tracking-tight text-[#e5e5e5]">
                <span aria-hidden="true" className="mt-2.5 block size-2 shrink-0 text-muted-foreground/50">
                  <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 8 8">
                    <path d="M4 0v8M0 4h8" />
                  </svg>
                </span>
                Download the complete family archive
              </li>
            </ul>

            {/* CTA Button */}
            <Link
              href="/login"
              prefetch={true}
              className="inline-flex items-center justify-center gap-1 whitespace-nowrap !rounded-full font-medium transition-all cursor-pointer border border-[color-mix(in_srgb,var(--primary)_80%,#3a3480)] bg-[color-mix(in_srgb,var(--primary)_90%,#3a3480)] text-primary-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.22),inset_0_-1px_0_rgba(58,52,128,0.30)] transform-gpu hover:bg-primary hover:border-[color-mix(in_srgb,var(--primary)_70%,#3a3480)] active:translate-y-px active:scale-[0.98] h-10 px-4 text-sm mt-6 w-full"
            >
              Make their memorial complete
            </Link>
            <p className="mt-2.5 text-center text-xs text-muted-foreground/80">
              One-time payment per memorial. No monthly fees.
            </p>
          </li>

        </ul>
      </div>
    </section>
  )
}
