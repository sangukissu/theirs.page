"use client"

import Link from "next/link"

export function CtaBanner() {
  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto relative overflow-hidden rounded-[28px] sm:rounded-[36px] bg-[#1a1a1f] p-10 sm:p-20 text-center text-white shadow-2xl flex flex-col items-center justify-center">
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute inset-0 bg-radial from-white/[0.04] via-transparent to-transparent pointer-events-none" />

        {/* Concentric Striped Aperture Logo */}
        <div className="relative size-20 sm:size-24 flex items-center justify-center mb-6 select-none">
          <svg
            viewBox="0 0 100 100"
            className="size-full text-neutral-300"
            fill="currentColor"
          >
            <mask id="cta-ring-mask">
              <rect width="100" height="100" fill="white" />
              <circle cx="50" cy="50" r="24" fill="black" />
            </mask>
            <g mask="url(#cta-ring-mask)">
              <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="2.5" strokeDasharray="3 3" opacity="0.6" />
              <circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" strokeWidth="2.5" strokeDasharray="4 2" opacity="0.8" />
              <circle cx="50" cy="50" r="34" fill="none" stroke="currentColor" strokeWidth="3" opacity="0.9" />
              <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="2.5" strokeDasharray="2 2" opacity="0.7" />
              <circle cx="50" cy="50" r="26" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.5" />
            </g>
          </svg>
        </div>

        {/* Headline */}
        <h2 className="text-balance text-2xl sm:text-4xl md:text-5xl font-medium tracking-tight text-white leading-[1.15] max-w-2xl mx-auto mb-3">
          Know who they were, where they walked, and what they gave to the world.{" "}
          <span className="text-neutral-400 font-normal">Starting today.</span>
        </h2>

        <p className="text-sm text-neutral-400 max-w-md mx-auto mb-8 leading-relaxed">
          You don&apos;t have to do it alone. Create the memorial in two minutes, and let the people who loved them assemble the rest.
        </p>

        {/* Exact Hero Primary Button (Zero style deviation) */}
        <Link
          href="/login"
          className="inline-flex items-center justify-center gap-1 whitespace-nowrap !rounded-full font-medium transition-all cursor-pointer border border-[color-mix(in_srgb,var(--primary)_80%,#3a3480)] bg-[color-mix(in_srgb,var(--primary)_90%,#3a3480)] text-primary-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.22),inset_0_-1px_0_rgba(58,52,128,0.30)] transform-gpu hover:bg-primary hover:border-[color-mix(in_srgb,var(--primary)_70%,#3a3480)] active:translate-y-px active:scale-[0.98] h-9 px-4 text-sm group"
        >
          <span>Create their memorial</span>
          <span className="relative size-4 overflow-hidden inline-flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="absolute inset-0 size-4 transition-transform duration-200 group-hover:translate-x-3 group-hover:opacity-0"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="absolute inset-0 size-4 -translate-x-3 opacity-0 transition-transform duration-200 group-hover:translate-x-0 group-hover:opacity-100"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </span>
        </Link>
      </div>
    </section>
  )
}
