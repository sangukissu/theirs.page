"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { DitherGradient } from "@/components/theirs/dither-gradient"
import { SectionHeader } from "@/components/theirs/section-header"
import { Play, Pause, Copy, Check } from "lucide-react"

// =============================================================================
// SHOWCASE 01: Create their page (Warm, Alive Inscription Panel)
// =============================================================================
function ShowcaseOne() {
  const [step, setStep] = useState(0)

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 500),   // Photo appears
      setTimeout(() => setStep(2), 1400),  // Name types in
      setTimeout(() => setStep(3), 2600),  // Details & quote inscribe
      setTimeout(() => setStep(0), 7500),  // Loop
    ]
    return () => timers.forEach(clearTimeout)
  }, [step === 0])

  const fullName = "Robert Carter"
  const displayName = step >= 2 ? fullName : ""

  return (
    <div className="w-full max-w-[20.5rem] min-h-[195px] bg-white border border-black/[0.08] rounded-2xl p-4 flex flex-col justify-between text-left">
      {/* Top Row: Photo & Restrained Identity Details */}
      <div className="flex items-start gap-3.5">
        {/* Photo with Emerald Verification Tick */}
        <div className="relative size-18 rounded-xl overflow-hidden bg-neutral-100 border border-black/10 shrink-0">
          <AnimatePresence mode="wait">
            {step >= 1 ? (
              <motion.div
                key="photo"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="relative size-full"
              >
                <img
                  src="/memorial-family-portrait-grandfather.jpg"
                  alt="Robert Carter"
                  className="size-full object-cover grayscale contrast-105"
                />
                <span className="absolute bottom-1 right-1 size-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[9px] font-bold">
                  ✓
                </span>
              </motion.div>
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="size-full flex items-center justify-center text-[10px] font-mono text-neutral-400 bg-neutral-50"
              >
                + photo
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Refined Identity Typography with Primary Accent */}
        <div className="flex flex-col flex-1 min-w-0 pt-0.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-medium text-primary uppercase tracking-wider">
              Memorial
            </span>
            <span className="text-[10px] font-mono text-emerald-600 font-medium">
              {step >= 3 ? "✓ Ready" : "Drafting"}
            </span>
          </div>

          <div className="h-6 flex items-center mt-0.5">
            <h4 className="text-sm font-medium text-[#181925] tracking-tight">
              {displayName}
            </h4>
            {step < 3 && (
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className="inline-block w-[1.5px] h-3.5 bg-primary ml-0.5"
              />
            )}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: step >= 3 ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-1.5 text-[11px] font-mono text-neutral-600 mt-0.5"
          >
            <span className="font-semibold text-neutral-800">1948 — 2024</span>
            <span className="text-neutral-300">·</span>
            <span className="font-serif italic text-neutral-600">Devon, UK</span>
          </motion.div>
        </div>
      </div>

      {/* Bottom Row: Inscribed Thought */}
      <motion.div
        initial={{ opacity: 0, y: 2 }}
        animate={{ opacity: step >= 3 ? 1 : 0, y: step >= 3 ? 0 : 2 }}
        transition={{ duration: 0.4 }}
        className="pt-2.5 border-t border-black/[0.06] flex items-center justify-between"
      >
        <p className="text-[11px] font-serif italic text-neutral-700 truncate max-w-[210px]">
          “He could make anyone feel unhurried.”
        </p>
        <span className="text-[10px] font-mono text-primary/80 font-medium">
          Saved
        </span>
      </motion.div>
    </div>
  )
}

// =============================================================================
// SHOWCASE 02: Invite family & friends (Warm Contributed Gathering)
// =============================================================================
function ShowcaseTwo() {
  const [phase, setPhase] = useState(0)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 700),  // Anita arrives
      setTimeout(() => setPhase(2), 2200), // David arrives
      setTimeout(() => setPhase(0), 7500), // Loop
    ]
    return () => timers.forEach(clearTimeout)
  }, [phase === 0])

  const handleCopy = () => {
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="w-full max-w-5xl min-h-[195px] bg-white border border-black/[0.08] rounded-2xl p-4 flex flex-col justify-between text-left">
      {/* Top: Understated Link Bar with Live Emerald Beacon */}
      <div className="flex items-center justify-between py-1.5 px-3 rounded-xl bg-neutral-50 border border-black/[0.06]">
        <div className="flex items-center gap-2 min-w-0">
          <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span className="text-[11px] font-mono font-medium text-neutral-800 truncate">
            theirs.page/robert-carter
          </span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:text-primary/80 transition-colors shrink-0 ml-2"
        >
          {copied ? (
            <>
              <Check className="size-3 text-emerald-600" />
              <span className="text-emerald-600 font-medium">Copied</span>
            </>
          ) : (
            <>
              <Copy className="size-3 text-primary" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Middle/Bottom: Warm, Distinct Contributed Memories */}
      <div className="flex flex-col gap-2 pt-2">
        {/* Contributor 1: Anita (Rose Accent) */}
        <div className="flex items-start gap-2.5 pb-2 border-b border-black/[0.05]">
          <div className="size-6 rounded-full bg-rose-100 border border-rose-200 text-rose-700 text-[10px] font-semibold flex items-center justify-center shrink-0 mt-0.5">
            A
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-medium text-[#181925]">Anita (Daughter)</span>
              <span className="text-[10px] font-mono text-neutral-400">Just now</span>
            </div>
            <p className="text-[11px] text-neutral-600 italic font-serif truncate mt-0.5">
              “He never missed a single concert...”
            </p>
          </div>
        </div>

        {/* Contributor 2: David (Blue Accent) */}
        <div className="flex items-center gap-2.5">
          <div className="size-6 rounded-full bg-blue-100 border border-blue-200 text-blue-700 text-[10px] font-semibold flex items-center justify-center shrink-0">
            D
          </div>
          <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-medium text-[#181925]">David (Brother)</span>
              <span className="text-[11px] text-neutral-500 truncate">1974 workshop snapshot</span>
            </div>
            <div className="size-8 rounded-lg overflow-hidden border border-black/10 shrink-0">
              <img
                src="/vintage-family-portraits-colorized.webp"
                alt="Workshop photo"
                className="size-full object-cover saturate-110"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// =============================================================================
// SHOWCASE 03: Watch their story live (Vibrant Audio & Warm Photo Tapestry)
// =============================================================================
function ShowcaseThree() {
  const [isPlaying, setIsPlaying] = useState(true)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!isPlaying) return
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 14) return 0
        return +(prev + 0.2).toFixed(1)
      })
    }, 200)
    return () => clearInterval(interval)
  }, [isPlaying])

  const formattedSeconds = progress < 10 ? `0:0${Math.floor(progress)}` : `0:${Math.floor(progress)}`

  return (
    <div className="w-full max-w-[20.5rem] min-h-[195px] bg-white border border-black/[0.08] rounded-2xl p-4 flex flex-col justify-between text-left">
      {/* Top: Active Audio Player with Primary Color Accents */}
      <div className="flex flex-col gap-2 pb-2.5 border-b border-black/[0.06]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              className="size-6 rounded-full bg-primary/10 hover:bg-primary/20 text-primary flex items-center justify-center transition-colors shrink-0"
              aria-label={isPlaying ? "Pause voicemail" : "Play voicemail"}
            >
              {isPlaying ? <Pause className="size-2.5" /> : <Play className="size-2.5 ml-0.5" />}
            </button>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-[#181925]">
                Voicemail from Dad
              </span>
              <span className="size-1 rounded-full bg-emerald-500" />
            </div>
          </div>
          <span className="text-xs font-mono font-medium text-primary">
            {formattedSeconds} / 0:14
          </span>
        </div>

        {/* Luminous Waveform Bars */}
        <div className="relative h-4 flex items-center gap-[2px] px-1.5 bg-neutral-50 border border-black/[0.05] rounded-md overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-primary/10 transition-all duration-200 pointer-events-none"
            style={{ width: `${(progress / 14) * 100}%` }}
          />

          {[35, 75, 100, 50, 85, 95, 40, 80, 70, 45, 90, 60, 35, 80, 55, 85, 40, 70, 50].map((baseHeight, idx) => {
            const isPast = (idx / 19) * 14 <= progress
            return (
              <motion.span
                key={idx}
                animate={
                  isPlaying
                    ? {
                        height: [
                          `${baseHeight * 0.4}%`,
                          `${baseHeight}%`,
                          `${baseHeight * 0.5}%`,
                        ],
                      }
                    : { height: `${baseHeight}%` }
                }
                transition={{
                  duration: 0.6 + (idx % 3) * 0.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className={`w-[1.5px] rounded-full block transition-colors duration-150 ${
                  isPast ? "bg-primary" : "bg-neutral-300"
                }`}
              />
            )
          })}
        </div>
      </div>

      {/* Bottom: Linked Memory Quote & Wedding Photo */}
      <div className="flex items-center justify-between gap-3 pt-0.5">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 text-[9px] font-mono font-medium text-neutral-400 uppercase tracking-wider">
            <span>Memory</span>
            <span className="text-neutral-300">·</span>
            <span className="text-rose-600 font-medium">Anita</span>
          </div>
          <p className="text-[11px] font-serif italic text-neutral-700 line-clamp-2 leading-snug mt-0.5">
            “Dad spent Christmas fixing the neighbour’s washer.”
          </p>
        </div>

        {/* Vintage 1974 Photo with Amber Year Badge */}
        <div className="size-11 rounded-lg overflow-hidden border border-black/10 shrink-0 relative">
          <img
            src="/historical-wedding-photo.webp"
            alt="Wedding"
            className="size-full object-cover sepia-[0.2] saturate-110 contrast-105"
          />
          <span className="absolute inset-x-0 bottom-0 bg-amber-950/70 text-[8px] font-mono text-amber-200 text-center py-px">
            1974
          </span>
        </div>
      </div>
    </div>
  )
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================
export function TheirsSteps() {
  return (
    <section id="how-it-works" className="py-16 sm:py-24 px-4 max-w-5xl mx-auto flex flex-col gap-12 sm:gap-16">
      {/* Section Header */}
      <SectionHeader
        badge="How it works"
        title="Create their memorial. Let everyone tell their story."
        description={
          <>
            You don’t need to have everything ready. Start with the basics, share the page with the people who knew them, and{" "}
            <span className="rounded-md bg-primary/10 box-decoration-clone px-1 py-0.5 text-primary">
              build it together over time
            </span>
            .
          </>
        }
      />

      {/* 3 Refined, Vibrant Showcase Cards */}
      <ul className="grid gap-4 sm:gap-6 lg:grid-cols-3">
        
        {/* Step 01 */}
        <li className="group relative flex flex-col overflow-hidden rounded-2xl bg-[#f6f6f6] pb-6 sm:pb-8 border border-black/[0.06]">
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

          <div className="relative flex flex-1 items-center justify-center px-4 py-5 sm:px-6 min-h-[215px]">
            <ShowcaseOne />
          </div>

          <p className="relative pl-6 pr-6 text-sm leading-6 text-muted-foreground sm:pl-8 sm:pr-14 tracking-tight">
            Add their name, a favourite photo and a few details. Start simple, you can add more whenever you’re ready.
          </p>
        </li>

        {/* Step 02 */}
        <li className="group relative flex flex-col overflow-hidden rounded-2xl bg-[#f6f6f6] pb-6 sm:pb-8 border border-black/[0.06]">
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

          <div className="relative flex flex-1 items-center justify-center px-4 py-5 sm:px-6 min-h-[215px]">
            <ShowcaseTwo />
          </div>

          <p className="relative pl-6 pr-6 text-sm leading-6 text-muted-foreground sm:pl-8 sm:pr-14 tracking-tight">
            Share one link so the people who knew them can add their own photos, stories and memories.
          </p>
        </li>

        {/* Step 03 */}
        <li className="group relative flex flex-col overflow-hidden rounded-2xl bg-[#f6f6f6] pb-6 sm:pb-8 border border-black/[0.06]">
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

          <div className="relative flex flex-1 items-center justify-center px-4 py-5 sm:px-6 min-h-[215px]">
            <ShowcaseThree />
          </div>

          <p className="relative pl-6 pr-6 text-sm leading-6 text-muted-foreground sm:pl-8 sm:pr-14 tracking-tight">
            Memories, photos, voicemails, and milestones all together on one screen, updating as family members contribute.
          </p>
        </li>
      </ul>
    </section>
  )
}
