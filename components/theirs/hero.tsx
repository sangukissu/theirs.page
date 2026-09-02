"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { LifePanorama } from "./life-panorama"

export function TheirsHero() {
  const router = useRouter()
  const [name, setName] = useState("Robert Carter")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    router.push(`/login?name=${encodeURIComponent(name.trim())}`)
  }

  return (
    <section className="relative pt-8 sm:pt-12 pb-0 px-4 text-center overflow-hidden flex flex-col items-center bg-white">
      <div className="max-w-4xl mx-auto flex flex-col items-center w-full">
        
        {/* Eyebrow Pill */}
        <div className="mb-3.5 flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-black/[0.06] bg-white px-3.5 py-1 text-xs text-[#666] select-none shadow-2xs">
            <span className="size-1.5 rounded-full bg-primary" />
            <span>For their story</span>
          </div>
        </div>

        {/* Commanding Two-Line Headline */}
        <h1 className="text-balance text-4xl sm:text-6xl lg:text-[68px] font-medium tracking-[-0.04em] text-[#181925] leading-[1.04] max-w-[850px] mb-3.5">
          A life is more than
          <br />
          <span className="text-primary">two dates.</span>
        </h1>

        {/* Human Subheadline */}
        <p className="mx-auto max-w-[660px] text-pretty text-base sm:text-xl leading-relaxed text-[#666] mb-5 sm:mb-6">
          Keep the photos, stories, voices and little things that made them who they were — together in one beautiful page.
        </p>

        {/* High-Converting "Create their page" Input Box (Responsive on Mobile & Desktop) */}
        <div className="w-full max-w-lg flex flex-col items-center gap-2 mb-4 sm:mb-5">
          <form
            onSubmit={handleSubmit}
            className="w-full flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2 sm:p-1.5 sm:rounded-full sm:bg-[#f7f7f8] sm:border sm:border-black/[0.08] sm:shadow-2xs transition-colors sm:focus-within:border-primary/50"
          >
            {/* Standalone clean pill on mobile, seamless left cell on desktop */}
            <div className="flex-1 flex items-center gap-2 px-4 py-2.5 sm:py-1.5 text-sm rounded-full bg-[#f7f7f8] border border-black/[0.08] sm:border-none sm:bg-transparent shadow-2xs sm:shadow-none focus-within:border-primary/50 transition-colors">
              <span className="text-xs sm:text-sm text-[#888] font-medium shrink-0 select-none">
                Their name
              </span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Robert Carter"
                className="w-full bg-transparent font-medium text-[#181925] outline-none placeholder:text-[#aaa] text-sm"
              />
            </div>

            {/* Standalone full-width pill on mobile, right action button on desktop */}
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap !rounded-full font-medium transition-all cursor-pointer border border-[color-mix(in_srgb,var(--primary)_80%,#3a3480)] bg-[color-mix(in_srgb,var(--primary)_90%,#3a3480)] text-primary-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.22),inset_0_-1px_0_rgba(58,52,128,0.30)] transform-gpu hover:bg-primary active:scale-[0.98] h-11 sm:h-10 px-5 text-sm group shrink-0 select-none w-full sm:w-auto"
            >
              <span>Create their page</span>
              <span className="relative size-3.5 overflow-hidden inline-flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="absolute inset-0 size-3.5 transition-transform duration-200 group-hover:translate-x-3 group-hover:opacity-0"
                >
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="absolute inset-0 size-3.5 -translate-x-3 opacity-0 transition-transform duration-200 group-hover:translate-x-0 group-hover:opacity-100"
                >
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </span>
            </button>
          </form>

          {/* Clean Trust Line */}
          <span className="text-xs text-[#888] select-none">
            Free to start · No credit card required
          </span>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* THE LIFE PANORAMA — One Dense Cinematic Mass of Memories                  */}
      {/* ========================================================================= */}
      <LifePanorama />

    </section>
  )
}
