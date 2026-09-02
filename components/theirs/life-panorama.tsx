"use client"

import { useRef } from "react"
import { motion, useSpring, useMotionValue, useTransform } from "framer-motion"

export function LifePanorama() {
  const containerRef = useRef<HTMLDivElement>(null)

  // Very subtle parallax tracking for organic life feel
  const mouseX = useMotionValue(0)
  const springX = useSpring(useTransform(mouseX, [-0.5, 0.5], [-16, 16]), {
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
      className="relative w-full overflow-hidden select-none flex justify-center items-end pt-2 sm:pt-4 bg-white"
    >
      {/* ========================================================================= */}
      {/* THE LIFE RIBBON — One Continuous Panoramic Object Rising from Below       */}
      {/* Pure White Background Around the Strip · Zero Gray Haze / Zero Gray Blur  */}
      {/* ========================================================================= */}
      <motion.div
        style={{ x: springX }}
        className="relative w-[1140px] sm:w-[1340px] lg:w-[1480px] h-[350px] sm:h-[410px] lg:h-[450px] shrink-0"
      >
        {/* ----------------------------------------------------------------------- */}
        {/* OUTER ROUNDED GRAY BEZEL STRIP — Perfectly concentric with inner photos */}
        {/* ----------------------------------------------------------------------- */}
        <div className="relative w-full h-full p-2 sm:p-2.5 lg:p-3 rounded-t-[148px] sm:rounded-t-[208px] lg:rounded-t-[268px] bg-[#ebebed] border-t border-x border-black/[0.08] overflow-hidden">
          
          {/* --------------------------------------------------------------------- */}
          {/* INNER PHOTO MAIN CARD — Seamless crossfading continuous ribbon        */}
          {/* --------------------------------------------------------------------- */}
          <div className="relative w-full h-full rounded-t-[138px] sm:rounded-t-[198px] lg:rounded-t-[258px] overflow-hidden bg-neutral-950 flex items-stretch border border-black/[0.08]">
            
            {/* PHOTO 1 (0% - 24%): 1952 Childhood — B&W Print */}
            <div className="relative w-[24%] h-full shrink-0 [mask-image:linear-gradient(to_right,black_70%,transparent_100%)] z-10">
              <img
                src="/memorial-family-portrait-son.jpg"
                alt="Robert Carter Childhood 1952"
                className="size-full object-cover object-top grayscale contrast-125 brightness-95"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 pointer-events-none" />
            </div>

            {/* PHOTO 2 (20% - 44%): 1968 Youth / Young Adult — Sepia-toned Film */}
            <div className="relative w-[24%] -ml-[5%] h-full shrink-0 [mask-image:linear-gradient(to_right,transparent_0%,black_25%,black_75%,transparent_100%)] z-20">
              <img
                src="/memorial-family-portrait-father.jpg"
                alt="Robert Carter Young Adult 1968"
                className="size-full object-cover object-top sepia-[0.35] saturate-85 contrast-110 brightness-95"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 pointer-events-none" />
            </div>

            {/* PHOTO 3 (40% - 64%): 1974 Partnership / Marriage — Warm 1970s Kodachrome (Unified Person) */}
            <div className="relative w-[26%] -ml-[5%] h-full shrink-0 [mask-image:linear-gradient(to_right,transparent_0%,black_25%,black_75%,transparent_100%)] z-30">
              <img
                src="/separate-family-portrait-father.jpg"
                alt="Robert Carter 1974"
                className="size-full object-cover object-top sepia-[0.18] saturate-110 contrast-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-black/20 pointer-events-none" />
            </div>

            {/* PHOTO 4 (60% - 84%): 1996 Family Reunion — Authentic 1990s 35mm Color */}
            <div className="relative w-[25%] -ml-[5%] h-full shrink-0 [mask-image:linear-gradient(to_right,transparent_0%,black_25%,black_75%,transparent_100%)] z-40">
              <img
                src="/memorial-family-portrait-combined.jpg"
                alt="Family Reunion 1996"
                className="size-full object-cover object-center saturate-115 contrast-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 pointer-events-none" />
            </div>

            {/* PHOTO 5 (80% - 100%): 2024 Elder Portrait — Modern Digital Clarity */}
            <div className="relative w-[26%] -ml-[5%] h-full shrink-0 [mask-image:linear-gradient(to_right,transparent_0%,black_25%,black_100%)] z-50">
              <img
                src="/memorial-family-portrait-grandfather.jpg"
                alt="Robert Carter 2024"
                className="size-full object-cover object-top contrast-110 brightness-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/20 pointer-events-none" />
            </div>

            {/* Organic Flowing Blue Timeline Thread crossing through the ribbon */}
            <svg
              className="absolute inset-0 size-full pointer-events-none stroke-primary/70 fill-none z-60"
              viewBox="0 0 1480 440"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path
                d="M 60 270 C 260 210, 480 300, 740 230 C 1000 160, 1220 260, 1420 180"
                strokeWidth="1.8"
              />
            </svg>

            {/* Inscribed Milestone Years directly on the ribbon canvas */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 z-70 pointer-events-none flex justify-between px-10 sm:px-20 text-white/90 font-mono text-xs sm:text-sm font-semibold tracking-wider drop-shadow-md">
              <span>1952</span>
              <span className="translate-y-3">1968</span>
              <span className="-translate-y-2">1974</span>
              <span className="translate-y-2">1996</span>
              <span className="-translate-y-4">2024</span>
            </div>

            {/* One emotional quote etched directly into the ribbon */}
            <div className="absolute bottom-20 sm:bottom-24 left-1/3 z-70 pointer-events-none text-white/85 italic text-xs sm:text-sm font-serif drop-shadow-md">
              “He could fix almost anything.”
            </div>

            {/* Subtle audio waveform chip embedded near later life */}
            <div className="absolute top-28 right-28 sm:right-36 z-70 pointer-events-none inline-flex items-center gap-2 text-white/90 font-mono text-xs drop-shadow-md">
              <span className="text-primary font-bold tracking-tighter">━━━━━━</span>
              <span>0:14</span>
            </div>

          </div>
        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* DIMENSIONALITY: Later-Life Portrait Breaks Slightly Above Ribbon Rim    */}
        {/* ----------------------------------------------------------------------- */}
        <div className="absolute -top-4 sm:-top-6 right-6 sm:right-12 lg:right-16 z-80 w-36 sm:w-48 lg:w-56 aspect-square rounded-full overflow-hidden ring-4 ring-white shadow-2xl pointer-events-none transition-transform duration-500">
          <img
            src="/memorial-family-portrait-grandfather.jpg"
            alt="Robert Carter Dimensional Portrait"
            className="size-full object-cover object-top contrast-115"
          />
        </div>

      </motion.div>

      {/* Smooth lower horizon fade into white page */}
      <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none z-90" />
    </div>
  )
}
