"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Volume2, ArrowRight, ArrowDown } from "lucide-react"

export function TheirsHero() {
  const router = useRouter()
  const [name, setName] = useState("Robert Carter")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    router.push(`/login?name=${encodeURIComponent(name.trim())}`)
  }

  return (
    <section className="pt-8 sm:pt-12 pb-0 px-4 text-center overflow-hidden flex flex-col items-center">
      <div className="max-w-4xl mx-auto flex flex-col items-center w-full">
        
        {/* Eyebrow Pill */}
        <div className="mb-4 flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-black/[0.06] bg-white px-3 py-1 text-xs text-[#666] select-none">
            <span className="size-1.5 rounded-full bg-primary" />
            <span>For their story</span>
          </div>
        </div>

        {/* Scaled Responsive Headline */}
        <h1 className="text-balance text-3xl font-medium leading-[1.1] tracking-tight text-[#454545] sm:text-6xl sm:leading-[1.06] max-w-[760px]">
          A life is more than{" "}
          <span className="text-primary">two dates.</span>
        </h1>

        {/* Human Subheadline - Clean Neutral Gray, No Rainbow Highlight */}
        <p className="mx-auto mt-4 max-w-[760px] text-pretty text-base sm:text-xl lg:text-[22px] leading-relaxed text-[#666]">
          Keep the photos, stories, voices and little things that made them who they were — together in one beautiful page.
        </p>

        {/* High-Converting "Create their page" Input Box */}
        <div className="w-full max-w-lg mt-7 flex flex-col items-center gap-2.5">
          <form
            onSubmit={handleSubmit}
            className="w-full flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-1.5 rounded-full bg-[#f7f7f8] border border-black/[0.08] transition-colors focus-within:border-primary/50"
          >
            <div className="flex-1 flex items-center gap-2 pl-4 pr-2 py-1.5 text-sm">
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

            <button
              type="submit"
              className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap !rounded-full font-medium transition-all cursor-pointer border border-[color-mix(in_srgb,var(--primary)_80%,#3a3480)] bg-[color-mix(in_srgb,var(--primary)_90%,#3a3480)] text-primary-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.22),inset_0_-1px_0_rgba(58,52,128,0.30)] transform-gpu hover:bg-primary active:scale-[0.98] h-10 px-5 text-xs sm:text-sm group shrink-0 select-none"
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

          {/* Micro Reassurance & Secondary Action */}
          <div className="flex flex-col sm:flex-row items-center gap-2 text-xs text-[#888] select-none">
            <span>Free to start · No credit card required</span>
            <span className="hidden sm:inline text-black/[0.15]">·</span>
            <Link
              href="/robert-carter"
              className="inline-flex items-center gap-1 font-medium text-[#555] hover:text-[#181925] transition-colors underline underline-offset-2"
            >
              <span>See an example instead</span>
              <ArrowRight className="size-3 text-primary" />
            </Link>
          </div>
        </div>

        {/* Top 30-35% Example Memorial Page Peek (Peeks into 1st Viewport) */}
        <Link
          href="/robert-carter"
          id="example"
          className="w-full max-w-3xl mt-9 sm:mt-12 group block text-left"
          title="Click to view Robert's full memorial page"
        >
          <div className="relative rounded-t-3xl sm:rounded-t-[36px] border-t border-x border-black/[0.08] bg-white p-6 sm:p-8 pb-16 transition-all duration-300 group-hover:border-black/[0.16] shadow-xs select-none">
            
            {/* Window Chrome Header Bar */}
            <div className="flex items-center justify-between border-b border-black/[0.05] pb-4 mb-6">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-primary" />
                <span className="text-xs font-mono text-[#666]">
                  theirs.page/robert-carter
                </span>
              </div>

              <div className="flex items-center gap-2 text-[11px] font-mono text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                <span className="size-1 rounded-full bg-emerald-500" />
                <span>Live memorial</span>
              </div>
            </div>

            {/* Memorial Header Peek Content */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-6">
              {/* Authentic Restored Portrait */}
              <div className="size-20 sm:size-24 rounded-2xl overflow-hidden bg-neutral-100 border border-black/[0.06] shrink-0">
                <img
                  src="/memorial-family-portrait-grandfather.jpg"
                  alt="Robert Edward Carter"
                  className="size-full object-cover grayscale contrast-105"
                />
              </div>

              {/* Identity & Epitaph */}
              <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <h3 className="text-xl sm:text-2xl font-medium tracking-tight text-[#181925]">
                    Robert Edward Carter
                  </h3>
                  <span className="text-xs sm:text-sm font-mono text-[#888]">
                    1948 — 2024 · 76 years
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-[#555] leading-relaxed italic">
                  “He could fix almost anything, except his habit of telling the same joke twice.”
                </p>

                {/* Living Content Pills */}
                <div className="flex items-center gap-2 pt-1 text-[11px] font-mono text-[#777] flex-wrap">
                  <span className="bg-[#f7f7f8] px-2.5 py-0.5 rounded-md border border-black/[0.04]">
                    14 Memories
                  </span>
                  <span className="bg-[#f7f7f8] px-2.5 py-0.5 rounded-md border border-black/[0.04]">
                    42 Photographs
                  </span>
                  <span className="bg-[#f7f7f8] px-2.5 py-0.5 rounded-md border border-black/[0.04]">
                    His Story
                  </span>
                  <span className="inline-flex items-center gap-1 text-primary bg-primary/10 px-2.5 py-0.5 rounded-md font-medium">
                    <Volume2 className="size-3" />
                    <span>0:14 Voicemail</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Gradient Curtain Inviting Exploration */}
            <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white via-white/80 to-transparent flex items-end justify-center pb-2.5 pointer-events-none">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 border border-black/[0.06] text-xs font-medium text-[#181925] group-hover:bg-neutral-200 transition-colors">
                <span>View Robert&apos;s full page</span>
                <ArrowRight className="size-3 text-primary group-hover:translate-x-0.5 transition-transform" />
              </span>
            </div>

          </div>
        </Link>

      </div>
    </section>
  )
}
