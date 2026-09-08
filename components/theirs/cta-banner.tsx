"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { useScroll, useSpring } from "framer-motion"
import { normalizeMemorialSlug } from "@/lib/memorial-slug"
import { TEXT_LIMITS } from "@/lib/validation/text-limits"
import { TheirsLogo } from "@/components/theirs/theirs-logo"
import { DitherGradient } from "@/components/theirs/dither-gradient"
import { SandDissolveWordmark } from "@/components/theirs/sand-dissolve-wordmark"

export function CtaBanner() {
  const router = useRouter()
  const [name, setName] = useState("")
  const sectionRef = useRef<HTMLElement>(null)

  // Scroll-driven fracture into bricks and dissolution into sand
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 85%", "center 35%"],
  })

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 26,
    restDelta: 0.001,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) {
      router.push("/login")
      return
    }
    const slug = normalizeMemorialSlug(trimmed)
    try {
      localStorage.setItem("theirs_pending_memorial", JSON.stringify({ name: trimmed, slug }))
      document.cookie = `theirs_pending_name=${encodeURIComponent(trimmed)}; path=/; max-age=86400; SameSite=Lax`
      document.cookie = `theirs_pending_slug=${encodeURIComponent(slug)}; path=/; max-age=86400; SameSite=Lax`
    } catch { }
    router.push(`/login?name=${encodeURIComponent(trimmed)}&slug=${encodeURIComponent(slug)}`)
  }

  return (
    <section
      ref={sectionRef}
      className="relative pt-24 sm:pt-32 md:pt-40 pb-16 sm:pb-24 px-4 sm:px-6 overflow-hidden"
    >
      <div className="max-w-5xl mx-auto relative">
        {/* Horizon Monolith Wordmark with Masonry Brick Fracture & Sand Dissolution */}
        <div
          aria-hidden="true"
          className="pointer-events-none select-none absolute left-1/2 -translate-x-1/2 -top-12 sm:-top-20 md:-top-28 lg:-top-32 w-full flex items-end justify-center z-0"
        >
          <SandDissolveWordmark progress={smoothProgress} text="THEIRS.PAGE" />
        </div>

        {/* Dark CTA Card — sits in front (relative z-10) */}
        <div className="relative z-10 overflow-hidden rounded-[28px] sm:rounded-[36px] bg-[#1a1a1f] p-10 sm:p-20 text-center text-white shadow-2xl flex flex-col items-center justify-center">
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute inset-0 bg-radial from-white/[0.04] via-transparent to-transparent pointer-events-none" />

          {/* Dither Pattern Background Cover (Brand Primary #305dde at 60% Opacity) */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 overflow-hidden select-none opacity-60 z-0"
          >
            <DitherGradient from="#305dde" bloom="aura" direction="down" />
          </div>

          {/* Brand SVG Logo in White Shades & Brand Name */}
          <div className="relative z-10 flex flex-col items-center gap-2 mb-6 select-none">
          <div className="relative size-16 sm:size-20 flex items-center justify-center">
            <TheirsLogo themeAware className="size-full text-white drop-shadow-[0_8px_24px_rgba(255,255,255,0.12)]" />
          </div>
          <span className="text-sm font-medium tracking-tight text-neutral-300">
            theirs.page
          </span>
        </div>

        {/* Headline */}
        <h2 className="relative z-10 text-balance text-2xl sm:text-4xl md:text-5xl font-medium tracking-tight text-white leading-[1.15] max-w-3xl mx-auto mb-3.5">
          Start with their name.{" "}
          <span className="text-neutral-400 font-normal block mt-1 sm:mt-1.5">
            The rest can come together over time.
          </span>
        </h2>

        <p className="relative z-10 text-sm sm:text-base text-neutral-300 max-w-xl mx-auto mb-8 leading-relaxed">
          You don’t need to have everything ready. Create their memorial now, then add photos, stories and tributes whenever you’re ready — with family and friends alongside you.
        </p>

        {/* High-Converting "Create their memorial" Input Box */}
        <div className="relative z-10 w-full max-w-lg flex flex-col items-center gap-2.5">
          <form
            onSubmit={handleSubmit}
            className="w-full flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2 sm:p-1.5 sm:rounded-full sm:bg-[#25252c] sm:border sm:border-white/30 sm:shadow-[0_4px_20px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.15)] transition-all sm:focus-within:border-white sm:focus-within:ring-2 sm:focus-within:ring-white/20"
          >
            {/* Standalone clean pill on mobile, seamless left cell on desktop */}
            <div className="flex-1 flex items-center gap-2 px-4 py-2.5 sm:py-1.5 text-sm rounded-full bg-[#25252c] border border-white/30 sm:border-none sm:bg-transparent shadow-[0_4px_20px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.15)] sm:shadow-none focus-within:border-white focus-within:ring-2 focus-within:ring-white/20 sm:focus-within:ring-0 transition-all">
              <span className="text-xs sm:text-sm text-neutral-300 font-medium shrink-0 select-none">
                Their name
              </span>
              <input
                type="text"
                value={name}
                maxLength={TEXT_LIMITS.personFullName}
                onChange={(e) => setName(e.target.value.slice(0, TEXT_LIMITS.personFullName))}
                onFocus={() => router.prefetch("/login")}
                placeholder="Robert Carter"
                className="w-full bg-transparent font-medium text-white outline-none placeholder:text-neutral-400 text-sm"
              />
            </div>

            {/* High-contrast, confident action button */}
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap !rounded-full font-medium transition-all cursor-pointer bg-white text-[#181925] hover:bg-neutral-100 active:scale-[0.98] h-11 sm:h-10 px-5 text-sm group shrink-0 select-none w-full sm:w-auto shadow-sm"
            >
              <span>Create their memorial</span>
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
          <span className="text-xs text-neutral-400 select-none">
            Free to start · No credit card required
          </span>
        </div>
      </div>
    </div>
  </section>
  )
}
