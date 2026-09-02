"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Volume2, ArrowRight } from "lucide-react"

export function TheirsHero() {
  const router = useRouter()
  const [name, setName] = useState("Robert Carter")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    router.push(`/login?name=${encodeURIComponent(name.trim())}`)
  }

  return (
    <section className="relative pt-8 sm:pt-12 pb-0 px-4 text-center overflow-hidden flex flex-col items-center">
      <div className="max-w-4xl mx-auto flex flex-col items-center w-full">
        
        {/* Eyebrow Pill */}
        <div className="mb-4 flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-black/[0.06] bg-white px-3.5 py-1 text-xs text-[#666] select-none shadow-2xs">
            <span className="size-1.5 rounded-full bg-primary" />
            <span>For their story</span>
          </div>
        </div>

        {/* Commanding Two-Line Headline */}
        <h1 className="text-balance text-4xl sm:text-6xl lg:text-[68px] font-medium tracking-[-0.04em] text-[#181925] leading-[1.04] max-w-[850px] mb-4">
          A life is more than
          <br />
          <span className="text-primary">two dates.</span>
        </h1>

        {/* Human Subheadline */}
        <p className="mx-auto max-w-[660px] text-pretty text-base sm:text-xl leading-relaxed text-[#666] mb-6 sm:mb-7">
          Keep the photos, stories, voices and little things that made them who they were — together in one beautiful page.
        </p>

        {/* High-Converting "Create their page" Input Box (Responsive on Mobile & Desktop) */}
        <div className="w-full max-w-lg flex flex-col items-center gap-2.5 mb-6 sm:mb-8">
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

        {/* The Mockup with Compact Height & Smooth Low-Opacity Blended Layer in Viewport */}
        <Link
          href="/robert-carter"
          id="example"
          className="w-full max-w-3xl group block text-left select-none"
          title="Click to view Robert's full memorial page"
        >
          <div className="relative rounded-t-3xl sm:rounded-t-[36px] border-t border-x border-black/[0.08] bg-white p-5 sm:p-7 pb-10 sm:pb-12 transition-all duration-300 group-hover:border-black/[0.16] shadow-xs overflow-hidden">
            
            {/* Window Chrome Header Bar */}
            <div className="flex items-center justify-between border-b border-black/[0.05] pb-3.5 mb-5">
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
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5">
              {/* Authentic Restored Portrait */}
              <div className="size-18 sm:size-22 rounded-2xl overflow-hidden bg-neutral-100 border border-black/[0.06] shrink-0">
                <img
                  src="/memorial-family-portrait-grandfather.jpg"
                  alt="Robert Edward Carter"
                  className="size-full object-cover grayscale contrast-105"
                />
              </div>

              {/* Identity & Epitaph */}
              <div className="flex flex-col gap-1 flex-1 min-w-0">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <h3 className="text-lg sm:text-2xl font-medium tracking-tight text-[#181925]">
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
                <div className="flex items-center gap-2 pt-0.5 text-[11px] font-mono text-[#777] flex-wrap">
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

            {/* In-Page Snippets Peeking In Underneath */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-left opacity-75">
              {/* Memory Snippet 1 */}
              <div className="p-2.5 rounded-xl bg-[#f7f7f8] border border-black/[0.04] flex flex-col justify-between gap-1">
                <div className="flex items-center justify-between text-[10px]">
                  <div className="flex items-center gap-1.5">
                    <div className="size-3.5 rounded-full bg-neutral-200 text-[#181925] text-[8px] font-medium flex items-center justify-center">
                      A
                    </div>
                    <span className="font-medium text-[#181925]">Anita (Daughter)</span>
                  </div>
                  <span className="font-mono text-[#888]">1994</span>
                </div>
                <p className="text-[11px] text-[#555] leading-relaxed line-clamp-2">
                  “Dad spent half of Christmas Day fixing Mrs. Higgins&apos; washing machine while everyone was waiting for dinner...”
                </p>
              </div>

              {/* Memory Photo Snippet 2 */}
              <div className="p-2 rounded-xl bg-[#f7f7f8] border border-black/[0.04] flex items-center gap-2.5">
                <div className="size-10 rounded-lg overflow-hidden bg-neutral-200 border border-black/[0.06] shrink-0">
                  <img
                    src="/historical-wedding-photo.webp"
                    alt="Wedding at St. Jude's"
                    className="size-full object-cover grayscale"
                  />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-medium text-[#181925] truncate">
                    Wedding at St. Jude&apos;s
                  </span>
                  <span className="text-[10px] text-[#888] font-mono">
                    July 1974 · Dartmoor
                  </span>
                </div>
              </div>
            </div>

            {/* Smooth Low-Opacity Blended Layer Keeping the Button Comfortably in Viewport */}
            <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white via-white/85 to-transparent pointer-events-none flex items-end justify-center pb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 border border-black/[0.06] text-xs font-medium text-[#181925] group-hover:bg-neutral-200 transition-colors shadow-2xs">
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
