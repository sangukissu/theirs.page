"use client"

import React, { useEffect, useRef, useState, useCallback } from "react"
import { MotionValue, useMotionValueEvent } from "framer-motion"

interface Particle {
  originX: number         // Final letter X on canvas
  originY: number         // Final letter Y on canvas
  brickOriginX: number    // Center X of its ashlar masonry block
  brickOriginY: number    // Center Y of its ashlar masonry block
  localDx: number         // Offset from block center
  localDy: number         // Offset from block center
  initialRiseY: number    // Distance starting just behind the CTA horizon rim
  initialDriftX: number   // Subtle horizontal drift in dust state
  tiltAngle: number       // Restrained architectural micro-rotation (-0.28 to +0.28 rad)
  lockThreshold: number   // Progress value (0.44 to 0.72) where block locks into home slot
  colorIdx: number        // 0 to 3
  baseAlpha: number       // Vertical luminance gradient: 0.12 at bottom to 0.24 at top
}

interface LayoutDims {
  width: number
  height: number
  step: number
  textHeight: number
  fontSize: string
  fontFamily: string
  fontWeight: string
  letterSpacing: string
}

interface MasonryAssemblyWordmarkProps {
  progress: MotionValue<number>
  className?: string
  text?: string
}

// Pseudo-random generator for 100% deterministic, reversible scrubbing
function pseudoRandom(seed: number): number {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453
  return x - Math.floor(x)
}

// Museum-grade monochromatic architectural stone palette
const PARTICLE_COLORS = [
  { r: 24, g: 25, b: 37 },    // Deep Charcoal (#181925)
  { r: 48, g: 48, b: 58 },    // Volcanic Slate (#30303a)
  { r: 88, g: 88, b: 100 },   // Titanium Gray (#585864)
  { r: 138, g: 138, b: 150 }, // Weathered Stone Dust (#8a8a96)
]

export function MasonryAssemblyWordmark({
  progress,
  className = "",
  text = "THEIRS.PAGE",
}: MasonryAssemblyWordmarkProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLSpanElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const currentProgressRef = useRef<number>(0)
  const animFrameRef = useRef<number | null>(null)
  const [isReducedMotion, setIsReducedMotion] = useState(false)

  const dimsRef = useRef<LayoutDims>({
    width: 1000,
    height: 260,
    step: 3.2,
    textHeight: 120,
    fontSize: "140px",
    fontFamily: "sans-serif",
    fontWeight: "700",
    letterSpacing: "-0.04em",
  })

  // Accessibility check: prefers-reduced-motion
  useEffect(() => {
    if (typeof window === "undefined") return
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    setIsReducedMotion(mediaQuery.matches)

    const handler = (e: MediaQueryListEvent) => setIsReducedMotion(e.matches)
    mediaQuery.addEventListener("change", handler)
    return () => mediaQuery.removeEventListener("change", handler)
  }, [])

  // Initialize and rasterize the wordmark using exact computed styles from DOM
  const initParticles = useCallback(() => {
    if (isReducedMotion) return

    const textEl = textRef.current
    const canvas = canvasRef.current
    if (!textEl || !canvas) return

    const rect = textEl.getBoundingClientRect()
    const width = Math.max(320, Math.floor(rect.width || 1000))
    const textHeight = Math.max(40, Math.floor(rect.height || 120))
    // Vertical room below for particles emerging from behind the CTA card horizon
    const height = textHeight + 150

    // Mobile performance tuning: clamp DPR to 1.5 and increase sampling step
    const isMobile = width < 640
    const step = isMobile ? 4.5 : 3.2
    const dpr = typeof window !== "undefined"
      ? (isMobile ? Math.min(1.5, window.devicePixelRatio || 1) : Math.min(2, window.devicePixelRatio || 1))
      : 1

    canvas.width = width * dpr
    canvas.height = height * dpr
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`

    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.scale(dpr, dpr)

    // Read exact typography from living DOM element
    const computed = window.getComputedStyle(textEl)
    const fontSize = computed.fontSize || "140px"
    const fontFamily = computed.fontFamily || "sans-serif"
    const fontWeight = computed.fontWeight || "700"
    const letterSpacing = computed.letterSpacing || "-0.04em"

    dimsRef.current = {
      width,
      height,
      step,
      textHeight,
      fontSize,
      fontFamily,
      fontWeight,
      letterSpacing,
    }

    // Offscreen canvas for sampling letterforms with exact font metrics
    const offCanvas = document.createElement("canvas")
    offCanvas.width = width
    offCanvas.height = height
    const offCtx = offCanvas.getContext("2d", { willReadFrequently: true })
    if (!offCtx) return

    offCtx.clearRect(0, 0, width, height)
    offCtx.fillStyle = "#181925"
    offCtx.font = `${fontWeight} ${fontSize} ${fontFamily}`
    offCtx.textAlign = "center"
    offCtx.textBaseline = "top"

    if ("letterSpacing" in offCtx) {
      try {
        ;(offCtx as unknown as { letterSpacing: string }).letterSpacing = letterSpacing
      } catch {}
    }

    // Rasterize letters starting at y = 0
    offCtx.fillText(text, width / 2, 0)

    const imgData = offCtx.getImageData(0, 0, width, height)
    const data = imgData.data

    const particles: Particle[] = []
    // Ashlar masonry dimensions (~10px x 7.5px)
    const brickW = Math.round(step * 3.2)
    const brickH = Math.round(step * 2.4)

    let pIndex = 0
    for (let y = 0; y < textHeight; y += step) {
      for (let x = 0; x < width; x += step) {
        const pixelIdx = (Math.floor(y) * width + Math.floor(x)) * 4
        const alpha = data[pixelIdx + 3]

        if (alpha > 40) {
          const brickCol = Math.floor(x / brickW)
          const brickRow = Math.floor(y / brickH)
          const brickId = brickRow * 1000 + brickCol

          const brickOriginX = brickCol * brickW + brickW / 2
          const brickOriginY = brickRow * brickH + brickH / 2
          const localDx = x - brickOriginX
          const localDy = y - brickOriginY

          // Immediate, well-distributed bottom-up assembly:
          // Motion begins instantly at p > 0 with zero delay.
          // Lower portions of letters (normY ~ 1) lock in between p = 0.44 - 0.52
          // Upper portions of letters (normY ~ 0) lock in between p = 0.64 - 0.72
          const normY = y / textHeight
          const distFromCenter = Math.abs(x - width / 2) / (width / 2)
          const noise = pseudoRandom(brickId * 17.31)
          const lockThreshold = Math.min(
            0.72,
            Math.max(0.44, 0.46 + (1 - normY) * 0.22 + (noise - 0.5) * 0.06 + distFromCenter * 0.03)
          )

          const seed = pIndex * 19.87

          // Initial submerged distance: positioned right at the horizon rim
          // for instant visibility without delayed dead-time
          const initialRiseY = (textHeight - y) * 0.75 + 14 + 18 * pseudoRandom(seed + 1)
          const initialDriftX = (pseudoRandom(seed + 2) - 0.5) * 16
          const tiltAngle = (pseudoRandom(seed + 3) - 0.5) * 0.28 // Restrained micro-rotation

          // Vertical gradient matching the monolithic wordmark:
          // Darker at top (baseAlpha ~ 0.24), softer slate fading toward CTA (baseAlpha ~ 0.12)
          const baseAlpha = 0.24 - normY * 0.11

          const colorIdx = Math.floor(pseudoRandom(seed + 4) * PARTICLE_COLORS.length)

          particles.push({
            originX: x,
            originY: y,
            brickOriginX,
            brickOriginY,
            localDx,
            localDy,
            initialRiseY,
            initialDriftX,
            tiltAngle,
            lockThreshold,
            colorIdx,
            baseAlpha,
          })
          pIndex++
        }
      }
    }

    particlesRef.current = particles
  }, [text, isReducedMotion])

  // Draw particle frame based on scroll progress
  const drawFrame = useCallback((p: number) => {
    if (isReducedMotion) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const {
      width,
      height,
      step,
      textHeight,
      fontSize,
      fontFamily,
      fontWeight,
      letterSpacing,
    } = dimsRef.current

    ctx.clearRect(0, 0, width, height)

    // Equal-power cross-dissolve parameters:
    // Once upper blocks seat (p >= 0.68), the solid monolithic stone face seamlessly
    // fuses with the brick grid over p = 0.68 -> 0.78.
    // By p = 0.78, the monolithic text is 100% solid and remains perfectly still.
    const solidProgress = Math.min(1, Math.max(0, (p - 0.68) / 0.10))
    const solidAlpha = Math.sin(solidProgress * Math.PI * 0.5)
    const brickAlphaMultiplier = Math.cos(solidProgress * Math.PI * 0.5)

    // If fully solidified (p >= 0.78), render ONLY the crisp monolithic text directly on canvas.
    // ZERO particles, zero position mismatch, zero jerk, 100% stillness.
    if (solidProgress >= 1) {
      ctx.save()
      const grad = ctx.createLinearGradient(0, 0, 0, textHeight)
      grad.addColorStop(0, "rgba(24, 25, 37, 0.22)")
      grad.addColorStop(0.5, "rgba(24, 25, 37, 0.10)")
      grad.addColorStop(1, "rgba(24, 25, 37, 0.02)")

      ctx.fillStyle = grad
      ctx.font = `${fontWeight} ${fontSize} ${fontFamily}`
      ctx.textAlign = "center"
      ctx.textBaseline = "top"
      if ("letterSpacing" in ctx) {
        try {
          ;(ctx as unknown as { letterSpacing: string }).letterSpacing = letterSpacing
        } catch {}
      }
      ctx.fillText(text, width / 2, 0)
      ctx.restore()
      return
    }

    const particles = particlesRef.current
    const numParticles = particles.length
    if (numParticles === 0) return

    // Batch draw calls by color bucket to minimize state changes
    const buckets: { x: number; y: number; s: number; a: number }[][] = [
      [], [], [], []
    ]

    // Immediate entry fade with NO delay: active immediately from p = 0.001
    const entryFade = Math.min(1, Math.max(0, p / 0.025))

    for (let i = 0; i < numParticles; i++) {
      const pt = particles[i]

      // Progress normalized to this block's lock threshold:
      // t goes from 0.0 to 1.0 as p goes from 0 to pt.lockThreshold
      const t = Math.min(1, Math.max(0, p / pt.lockThreshold))

      // Smooth cubic ease-out upward rise
      const riseFactor = Math.pow(1 - t, 2.0)
      const currentRiseY = pt.initialRiseY * riseFactor

      // ----------------------------------------------------
      // Stage 4: Permanently Locked in Letterform (t >= 1.0)
      // ----------------------------------------------------
      if (t >= 1.0) {
        buckets[pt.colorIdx].push({
          x: pt.originX,
          y: pt.originY,
          s: step - 0.15,
          a: pt.baseAlpha * brickAlphaMultiplier,
        })
        continue
      }

      // ----------------------------------------------------
      // Stage 3 & 2: Masonry Condensation & Assembly (t >= 0.25)
      // ----------------------------------------------------
      if (t >= 0.25) {
        const assemblyT = (t - 0.25) / 0.75 // 0.0 to 1.0

        // Dignified micro-rotation aligning smoothly to zero
        const angle = pt.tiltAngle * Math.pow(1 - assemblyT, 1.6)
        const cos = Math.cos(angle)
        const sin = Math.sin(angle)

        const rx = pt.localDx * cos - pt.localDy * sin
        const ry = pt.localDx * sin + pt.localDy * cos

        const curX = pt.brickOriginX + rx
        const curY = pt.brickOriginY + ry + currentRiseY

        // Block scale smoothly expands from condensed cluster to full ashlar block
        const size = Math.min(step - 0.15, 1.6 + (step - 0.15 - 1.6) * Math.min(1, assemblyT * 1.5))
        // Alpha reaches full architectural opacity
        const alpha = pt.baseAlpha * (0.75 + 0.25 * assemblyT) * brickAlphaMultiplier

        if (curY < height && curY > -20) {
          buckets[pt.colorIdx].push({
            x: curX,
            y: curY,
            s: size,
            a: alpha,
          })
        }
        continue
      }

      // ----------------------------------------------------
      // Stage 1: Fine Stone Dust Emerging from Horizon (t < 0.25)
      // ----------------------------------------------------
      const dustT = t / 0.25 // 0.0 to 1.0

      // Faint horizontal drift dissipating as dust converges
      const driftFactor = Math.pow(1 - dustT, 1.2)
      const curX = pt.originX + pt.initialDriftX * driftFactor
      const curY = pt.originY + currentRiseY

      // Stippled dust grains (1.3px -> 2.0px)
      const size = 1.3 + dustT * 0.7
      // Immediate, healthy opacity with no delayed fade
      const alpha = pt.baseAlpha * (0.40 + 0.40 * dustT) * entryFade * brickAlphaMultiplier

      if (curY < height && curY > -20 && alpha > 0.01) {
        buckets[pt.colorIdx].push({
          x: curX,
          y: curY,
          s: size,
          a: alpha,
        })
      }
    }

    // Render batch buckets
    for (let c = 0; c < 4; c++) {
      const b = buckets[c]
      if (b.length === 0) continue

      const color = PARTICLE_COLORS[c]
      for (let j = 0; j < b.length; j++) {
        const item = b[j]
        ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${item.a})`
        ctx.fillRect(item.x, item.y, item.s, item.s)
      }
    }

    // During the fusion window (0.68 <= p < 0.78), smoothly draw the monolithic face on top
    // with matching exact geometry, eliminating any texture snap or jerk
    if (solidAlpha > 0.005) {
      ctx.save()
      const grad = ctx.createLinearGradient(0, 0, 0, textHeight)
      grad.addColorStop(0, `rgba(24, 25, 37, ${0.22 * solidAlpha})`)
      grad.addColorStop(0.5, `rgba(24, 25, 37, ${0.10 * solidAlpha})`)
      grad.addColorStop(1, `rgba(24, 25, 37, ${0.02 * solidAlpha})`)

      ctx.fillStyle = grad
      ctx.font = `${fontWeight} ${fontSize} ${fontFamily}`
      ctx.textAlign = "center"
      ctx.textBaseline = "top"
      if ("letterSpacing" in ctx) {
        try {
          ;(ctx as unknown as { letterSpacing: string }).letterSpacing = letterSpacing
        } catch {}
      }
      ctx.fillText(text, width / 2, 0)
      ctx.restore()
    }
  }, [isReducedMotion, text])

  // Scroll listener with ZERO React state updates
  useMotionValueEvent(progress, "change", (latest) => {
    if (isReducedMotion) return
    currentProgressRef.current = latest

    if (animFrameRef.current !== null) {
      cancelAnimationFrame(animFrameRef.current)
    }
    animFrameRef.current = requestAnimationFrame(() => {
      drawFrame(latest)
    })
  })

  // Mount, font ready, and debounced resize observer
  useEffect(() => {
    if (isReducedMotion) return

    const handleInit = () => {
      initParticles()
      const initialP = progress.get()
      currentProgressRef.current = initialP
      drawFrame(initialP)
    }

    handleInit()

    if (typeof document !== "undefined" && document.fonts) {
      document.fonts.ready.then(handleInit)
    }

    // 150ms debounce on resize to eliminate canvas thrashing
    let resizeTimer: ReturnType<typeof setTimeout> | null = null
    const handleResize = () => {
      if (resizeTimer) clearTimeout(resizeTimer)
      resizeTimer = setTimeout(() => {
        initParticles()
        drawFrame(currentProgressRef.current)
      }, 150)
    }

    window.addEventListener("resize", handleResize, { passive: true })
    return () => {
      if (resizeTimer) clearTimeout(resizeTimer)
      window.removeEventListener("resize", handleResize)
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current)
      }
    }
  }, [initParticles, drawFrame, isReducedMotion, progress])

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={`pointer-events-none select-none relative w-full flex flex-col items-center ${className}`}
    >
      {/* 1. Structural DOM Text — Establishes layout geometry and computed metrics.
             Visible statically if user prefers reduced motion. */}
      <span
        ref={textRef}
        aria-hidden="true"
        style={{
          opacity: isReducedMotion ? 1 : 0,
        }}
        className="font-[family-name:var(--font-heading)] font-bold uppercase tracking-[-0.03em] sm:tracking-[-0.04em] text-[12.5vw] sm:text-[13vw] md:text-[130px] lg:text-[150px] leading-[0.82] whitespace-nowrap bg-gradient-to-b from-[#181925]/[0.22] via-[#181925]/[0.10] to-[#181925]/[0.02] bg-clip-text text-transparent select-none block text-center pointer-events-none"
      >
        {text}
      </span>

      {/* 2. Masonry Assembly Canvas — Handles 100% of visual rendering (dust -> blocks -> solid monolith)
             with zero engine handoff and zero alignment jerk */}
      {!isReducedMotion && (
        <canvas
          ref={canvasRef}
          className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 will-change-transform"
          style={{
            imageRendering: "pixelated",
          }}
        />
      )}
    </div>
  )
}

// Backwards-compatible alias for existing imports
export const SandDissolveWordmark = MasonryAssemblyWordmark
