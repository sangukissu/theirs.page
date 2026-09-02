"use client"

import { useRef } from "react"
import { motion, useSpring, useMotionValue, useTransform } from "framer-motion"

export function LifePanorama() {
  const containerRef = useRef<HTMLDivElement>(null)

  // Subtle parallax tracking on desktop
  const mouseX = useMotionValue(0)
  const springX = useSpring(useTransform(mouseX, [-0.5, 0.5], [-14, 14]), {
    stiffness: 85,
    damping: 28,
  })

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    mouseX.set(x)
  }

  const handleMouseLeave = () => {
    mouseX.set(0)
  }

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full overflow-hidden select-none flex justify-center items-end bg-white"
    >
      {/* ========================================================================= */}
      {/* THE LIFE RIBBON — Responsive Across All Viewports (Mobile to 4K)          */}
      {/* Full width on mobile, upper corners rounded, bottom sharp                 */}
      {/* ========================================================================= */}
      <motion.div
        style={{ x: springX }}
        className="relative w-full max-w-[1480px] h-[190px] xs:h-[230px] sm:h-[370px] lg:h-[440px] shrink-0 [mask-image:linear-gradient(to_bottom,black_0%,black_75%,rgba(0,0,0,0.85)_88%,transparent_100%)]"
      >
        {/* ----------------------------------------------------------------------- */}
        {/* OUTER ROUNDED GRAY BEZEL STRIP — Rounded top corners, sharp bottom     */}
        {/* ----------------------------------------------------------------------- */}
        <div className="relative w-full h-full p-1.5 sm:p-2.5 lg:p-3 rounded-t-2xl sm:rounded-t-[208px] lg:rounded-t-[268px] rounded-b-none bg-[#ebebed] border-t border-x border-black/[0.08] overflow-hidden">
          
          {/* --------------------------------------------------------------------- */}
          {/* INNER PHOTO MAIN CARD — Entire timeline visible across full width     */}
          {/* --------------------------------------------------------------------- */}
          <div className="relative w-full h-full rounded-t-xl sm:rounded-t-[198px] lg:rounded-t-[258px] rounded-b-none overflow-hidden bg-neutral-950 flex items-stretch border border-black/[0.08]">
            
            {/* CHAPTER 1: 1952 Childhood — B&W Print */}
            <div className="relative w-[28%] h-full shrink-0 [mask-image:linear-gradient(to_right,black_65%,transparent_100%)] z-10">
              <img
                src="/memorial-family-portrait-son.jpg"
                alt="Robert Carter Childhood 1952"
                className="size-full object-cover object-top grayscale contrast-120 brightness-95"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-transparent pointer-events-none" />
            </div>

            {/* CHAPTER 2: 1974 Young Adult — Warm Faded 1970s Film */}
            <div className="relative w-[28%] -ml-[5%] h-full shrink-0 [mask-image:linear-gradient(to_right,transparent_0%,black_30%,black_70%,transparent_100%)] z-20">
              <img
                src="/separate-family-portrait-father.jpg"
                alt="Robert Carter Young Adult 1974"
                className="size-full object-cover object-top sepia-[0.25] saturate-95 contrast-105 brightness-95"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-transparent pointer-events-none" />
            </div>

            {/* CHAPTER 3: 1996 Family Reunion — Authentic 1990s 35mm Color */}
            <div className="relative w-[28%] -ml-[5%] h-full shrink-0 [mask-image:linear-gradient(to_right,transparent_0%,black_30%,black_70%,transparent_100%)] z-30">
              <img
                src="/memorial-family-portrait-combined.jpg"
                alt="Family Gathering 1996"
                className="size-full object-cover object-center saturate-110 contrast-105"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-transparent pointer-events-none" />
            </div>

            {/* CHAPTER 4: 2024 Elder Portrait — Final Dominant Panel */}
            <div className="relative w-[29%] -ml-[5%] h-full shrink-0 [mask-image:linear-gradient(to_right,transparent_0%,black_25%,black_100%)] z-40">
              <img
                src="/memorial-family-portrait-grandfather.jpg"
                alt="Robert Carter 2024"
                className="size-full object-cover object-top contrast-110 brightness-100"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-transparent pointer-events-none" />
            </div>

            {/* Subtle, Organic Blue Timeline Hairline (Visible on all screens) */}
            <svg
              className="absolute inset-0 size-full pointer-events-none stroke-primary/45 fill-none z-50"
              viewBox="0 0 1000 300"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path
                d="M 30 225 C 220 205, 450 230, 680 210 C 820 195, 920 220, 970 205"
                strokeWidth="1.5"
              />
            </svg>

            {/* Inscribed Milestone Years Across Lower Curve */}
            <div className="absolute inset-x-0 bottom-8 sm:bottom-16 z-60 pointer-events-none flex justify-between px-3.5 sm:px-14 lg:px-20 text-white/95 font-mono text-[10px] sm:text-xs lg:text-sm font-medium tracking-wider drop-shadow-md">
              <span className="translate-y-0.5">1952</span>
              <span className="-translate-y-1">1974</span>
              <span className="translate-y-0.5">1996</span>
              <span className="-translate-y-0.5">2024</span>
            </div>

            {/* Emotional Quote Inscribed in Lower Midground */}
            <div className="absolute bottom-2 sm:bottom-7 left-1/4 sm:left-1/3 z-60 pointer-events-none text-white/90 italic text-[9px] sm:text-xs lg:text-sm font-serif drop-shadow-md">
              “He could fix almost anything.”
            </div>

            {/* Discreet Voicemail Waveform Near Elder Portrait */}
            <div className="absolute bottom-2 sm:bottom-7 right-3 sm:right-14 lg:right-20 z-60 pointer-events-none inline-flex items-center gap-1.5 text-white/90 font-mono text-[9px] sm:text-xs drop-shadow-md">
              <span className="text-primary font-semibold tracking-tighter">━━━━━━</span>
              <span>0:14</span>
            </div>

          </div>
        </div>

      </motion.div>
    </div>
  )
}
