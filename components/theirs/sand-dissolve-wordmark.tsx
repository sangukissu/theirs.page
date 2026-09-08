"use client"

import React, { useEffect, useRef, useState, useCallback } from "react"
import { MotionValue, useMotionValueEvent } from "framer-motion"

interface Particle {
  originX: number
  originY: number
  brickOriginX: number
  brickOriginY: number
  localDx: number
  localDy: number
  breakThreshold: number // 0 to 1: when this masonry block yields
  fallSpeed: number
  driftX: number
  rotationSpeed: number
  colorIdx: number // 0 to 3
}

interface SandDissolveWordmarkProps {
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
  { r: 24, g: 25, b: 37, baseAlpha: 0.85 },   // Deep Charcoal
  { r: 48, g: 48, b: 58, baseAlpha: 0.80 },   // Volcanic Slate
  { r: 88, g: 88, b: 100, baseAlpha: 0.70 },  // Titanium Gray
  { r: 138, g: 138, b: 150, baseAlpha: 0.55 },// Weathered Stone Dust
]

export function SandDissolveWordmark({
  progress,
  className = "",
  text = "THEIRS.PAGE",
}: SandDissolveWordmarkProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLSpanElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const currentProgressRef = useRef<number>(0)
  const animFrameRef = useRef<number | null>(null)
  const [isReducedMotion, setIsReducedMotion] = useState(false)

  const dimsRef = useRef<{ width: number; height: number; step: number }>({
    width: 1000,
    height: 240,
    step: 3.5,
  })

  // Check accessibility preference: prefers-reduced-motion
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
    // Vertical room below for heavy stone blocks to descend behind the card rim
    const height = textHeight + 140

    // Mobile performance tuning: clamp DPR to 1.5 and increase step to keep 60fps on mid-range devices
    const isMobile = width < 640
    const step = isMobile ? 4.5 : 3.5
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

    dimsRef.current = { width, height, step }

    // Read exact typography from the living DOM element
    const computed = window.getComputedStyle(textEl)
    const fontSize = computed.fontSize || "140px"
    const fontFamily = computed.fontFamily || "sans-serif"
    const fontWeight = computed.fontWeight || "700"
    const letterSpacing = computed.letterSpacing || "-0.04em"

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

    // Align exactly with the DOM text element at y = 0
    offCtx.fillText(text, width / 2, 0)

    const imgData = offCtx.getImageData(0, 0, width, height)
    const data = imgData.data

    const particles: Particle[] = []
    // 70% architectural masonry: substantial ashlar blocks (approx 10-12px x 8-10px)
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

          // Slower, dignified masonry weathering:
          // Lower courses yield first; pseudo-random noise creates organic stone cleavage
          const normY = y / textHeight
          const distFromCenter = Math.abs(x - width / 2) / (width / 2)
          const noise = pseudoRandom(brickId * 17.31)
          const breakThreshold = Math.min(
            0.75,
            Math.max(0.05, 0.06 + 0.45 * normY + 0.22 * noise + 0.10 * distFromCenter)
          )

          const seed = pIndex * 19.87
          // Heavier mass: slower, dignified gravity
          const fallSpeed = 0.65 + 0.35 * pseudoRandom(seed + 1)
          const driftX = (pseudoRandom(seed + 2) - 0.5) * 1.2 // Restrained horizontal draft
          const rotationSpeed = (pseudoRandom(seed + 3) - 0.5) * 0.45 // Gentle tilt, not spinning
          const colorIdx = Math.floor(pseudoRandom(seed + 4) * PARTICLE_COLORS.length)

          particles.push({
            originX: x,
            originY: y,
            brickOriginX,
            brickOriginY,
            localDx,
            localDy,
            breakThreshold,
            fallSpeed,
            driftX,
            rotationSpeed,
            colorIdx,
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

    const { width, height, step } = dimsRef.current
    ctx.clearRect(0, 0, width, height)

    // When fully at rest (p === 0), leave canvas clear so DOM text is 100% visible
    if (p <= 0.01) return

    const particles = particlesRef.current
    const numParticles = particles.length
    if (numParticles === 0) return

    // Batch draw calls by color bucket to minimize state changes
    const buckets: { x: number; y: number; s: number; a: number }[][] = [
      [], [], [], []
    ]

    for (let i = 0; i < numParticles; i++) {
      const pt = particles[i]

      // State A: Unbroken architectural stone block
      if (p < pt.breakThreshold) {
        buckets[pt.colorIdx].push({
          x: pt.originX,
          y: pt.originY,
          s: step - 0.2,
          a: 0.22,
        })
        continue
      }

      // State B: Masonry weathering & descent
      const elapsed = (p - pt.breakThreshold) / (1 - pt.breakThreshold)

      // 70% Architectural Fracture: Heavy, dignified stone blocks descending with mass
      if (elapsed < 0.70) {
        const blockT = elapsed / 0.70
        // Heavy quadratic stone gravity (slower and heavier)
        const fallY = Math.pow(blockT, 1.7) * (pt.fallSpeed * 52)
        // Dignified angular tilt (subtle masonry shift, never spinning wildly)
        const angle = blockT * pt.rotationSpeed * 0.4
        const cos = Math.cos(angle)
        const sin = Math.sin(angle)

        const rx = pt.localDx * cos - pt.localDy * sin
        const ry = pt.localDx * sin + pt.localDy * cos

        const curX = pt.brickOriginX + rx
        const curY = pt.brickOriginY + ry + fallY

        buckets[pt.colorIdx].push({
          x: curX,
          y: curY,
          s: step - 0.1,
          a: 0.24 * (1 - blockT * 0.12),
        })
      }
      // 30% Subtle Stippled Sand Weathering: Soft grains settling behind the horizon
      else {
        const sandT = (elapsed - 0.70) / (1 - 0.70)

        const fallY =
          pt.fallSpeed * 52 + Math.pow(sandT, 1.5) * (pt.fallSpeed * 48)
        // Gentle horizontal drift
        const scatterX = Math.pow(sandT, 1.1) * (pt.driftX * 16)
        const scatterY = Math.sin(sandT * Math.PI) * 3

        const curX = pt.originX + scatterX
        const curY = pt.originY + fallY + scatterY

        // Grains gently scale to fine stipple dots
        const size = Math.max(1.5, (step - 0.2) * (1 - sandT * 0.35))
        // Dignified weathering fade as particles pass behind the dark card rim
        const alpha = Math.max(0, 0.21 * (1 - sandT * 0.95))

        if (alpha > 0.01 && curY < height) {
          buckets[pt.colorIdx].push({
            x: curX,
            y: curY,
            s: size,
            a: alpha,
          })
        }
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
  }, [isReducedMotion])

  // Scroll listener with ZERO React state updates (direct DOM opacity manipulation)
  useMotionValueEvent(progress, "change", (latest) => {
    if (isReducedMotion) return
    currentProgressRef.current = latest

    // Directly mutate DOM text opacity without triggering React component rerenders
    if (textRef.current) {
      const textAlpha = latest <= 0.02 ? 1 : Math.max(0, 1 - latest * 3.5)
      textRef.current.style.opacity = String(textAlpha)
    }

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
      drawFrame(0)
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
  }, [initParticles, drawFrame, isReducedMotion])

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={`pointer-events-none select-none relative w-full flex flex-col items-center ${className}`}
    >
      {/* 1. Solid Monolith DOM Text — Always full-size and crisp */}
      <span
        ref={textRef}
        className="font-[family-name:var(--font-heading)] font-bold uppercase tracking-[-0.03em] sm:tracking-[-0.04em] text-[12.5vw] sm:text-[13vw] md:text-[130px] lg:text-[150px] leading-[0.82] whitespace-nowrap bg-gradient-to-b from-[#181925]/[0.22] via-[#181925]/[0.10] to-[#181925]/[0.02] bg-clip-text text-transparent select-none block text-center will-change-opacity"
      >
        {text}
      </span>

      {/* 2. Physics Canvas — Layered over text, bypassed for reduced-motion users */}
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
