"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export function TheirsHero() {
  const router = useRouter()
  const [name, setName] = useState("Robert Carter")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    router.push(`/login?name=${encodeURIComponent(name.trim())}`)
  }

  const handlePreset = (preset: string) => {
    setName(preset)
  }

  return (
    <section className="pt-20 pb-16 sm:pt-28 sm:pb-24 px-4 text-center">
      <div className="max-w-3xl mx-auto flex flex-col items-center">
        {/* Subtle Badge */}
        <div className="mb-6 flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-black/[0.06] bg-white px-3 py-1 text-xs text-[#666]">
            <span className="size-1.5 rounded-full bg-primary" />
            <span>Dedicated to a human life</span>
          </div>
        </div>

        {/* Headline */}
        <h1 className="text-balance text-4xl sm:text-6xl font-medium tracking-tight text-[#181925] leading-[1.08]">
          A person is more than{" "}
          <span className="text-primary">two dates on a stone.</span>
        </h1>

        {/* Description */}
        <p className="mx-auto mt-5 max-w-2xl text-pretty text-lg leading-7 text-muted-foreground sm:text-2xl sm:leading-8">
          Reconstruct the texture of who someone was{" "}
          <span className="rounded-md bg-primary/10 box-decoration-clone px-1 py-0.5 text-primary">
            without the complexity
          </span>{" "}
          and gloom of funeral obituaries.
        </p>

        {/* The Exact Link Box CTA (High-Converting & Clutter-Free) */}
        <div className="w-full max-w-xl mt-8 flex flex-col items-center gap-3">
          <form
            onSubmit={handleSubmit}
            className="w-full flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-1.5 rounded-full bg-[#f7f7f8] border border-black/[0.08] transition-colors focus-within:border-primary/50"
          >
            <div className="flex-1 flex items-center gap-1.5 pl-4 pr-2 py-1.5 text-sm">
              <span className="font-mono text-xs sm:text-sm text-[#888] select-none shrink-0">
                theirs.page/
              </span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter their name..."
                className="w-full bg-transparent font-medium text-[#181925] outline-none placeholder:text-[#aaa] text-sm"
              />
            </div>

            <button
              type="submit"
              className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap !rounded-full font-medium transition-all cursor-pointer border border-[color-mix(in_srgb,var(--primary)_80%,#3a3480)] bg-[color-mix(in_srgb,var(--primary)_90%,#3a3480)] text-primary-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.22),inset_0_-1px_0_rgba(58,52,128,0.30)] transform-gpu hover:bg-primary active:scale-[0.98] h-10 px-5 text-xs sm:text-sm group shrink-0 select-none"
            >
              <span>Claim Free Memorial</span>
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

          {/* Preset Pill Tags */}
          <div className="flex items-center gap-1.5 flex-wrap justify-center text-xs text-[#888]">
            <span className="select-none">Try an example:</span>
            {["Grandma Rose", "Dad", "Arthur Pendelton", "Maya Lin"].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => handlePreset(preset)}
                className={`px-2.5 py-0.5 rounded-full transition-colors cursor-pointer ${
                  name === preset
                    ? "bg-neutral-200 text-[#181925] font-medium"
                    : "bg-neutral-100 hover:bg-neutral-200/70 text-[#666]"
                }`}
              >
                {preset}
              </button>
            ))}
          </div>

          {/* Micro Reassurance */}
          <p className="text-xs text-[#888] mt-1 select-none">
            Free to start · No credit card required · Assembled with family
          </p>
        </div>
      </div>
    </section>
  )
}
