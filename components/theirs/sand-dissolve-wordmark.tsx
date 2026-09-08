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
  breakThreshold: number // 0 to 1: when this brick fractures
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

// Museum-grade monochromatic architectural palette (Graphite, Slate, Titanium, Stone Dust)
const PARTICLE_COLORS = [
  { r: 24, g: 25, b: 37, baseAlpha: 0.85 },   // Deep Charcoal
  { r: 48, g: 48, b: 58, baseAlpha: 0.80 },   // Volcanic Slate
  { r: 88, g: 88, b: 100, baseAlpha: 0.70 },  // Titanium Gray
  { r: 138, g: 138, b: 150, baseAlpha: 0.55 },// Fine Stone Dust
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
  const [textOpacity, setTextOpacity] = useState(1)
  const dimsRef = useRef<{ width: number; height: number; step: number }>({
    width: 1000,
    height: 240,
    step: 3.5,
  })
  const animFrameRef = useRef<number | null>(null)

  // Initialize and rasterize the wordmark using the EXACT computed styles from the DOM
  const initParticles = useCallback(() => {
    const textEl = textRef.current
    const canvas = canvasRef.current
    if (!textEl || !canvas) return

    const rect = textEl.getBoundingClientRect()
    const width = Math.max(320, Math.floor(rect.width || 1000))
    const textHeight = Math.max(40, Math.floor(rect.height || 120))
    // Provide generous vertical room below for falling bricks and cascading sand
    const height = textHeight + 140
    const dpr = typeof window !== "undefined" ? Math.min(2, window.devicePixelRatio || 1) : 1

    canvas.width = width * dpr
    canvas.height = height * dpr
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`

    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.scale(dpr, dpr)

    const step = width < 640 ? 3 : 3.5
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
    const brickW = Math.round(step * 2.6) // ~8-9px brick width
    const brickH = Math.round(step * 2.0) // ~6-7px brick height

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

          // Natural structural fracture:
          // Lower bricks and outer letters yield first; pseudo-random noise creates organic masonry crumbling
          const normY = y / textHeight
          const distFromCenter = Math.abs(x - width / 2) / (width / 2)
          const noise = pseudoRandom(brickId * 17.31)
          const breakThreshold = Math.min(
            0.75,
            Math.max(0.04, 0.05 + 0.48 * normY + 0.24 * noise + 0.10 * distFromCenter)
          )

          const seed = pIndex * 19.87
          const fallSpeed = 0.85 + 0.55 * pseudoRandom(seed + 1)
          const driftX = (pseudoRandom(seed + 2) - 0.5) * 2.0 // Subtle horizontal air turbulence
          const rotationSpeed = (pseudoRandom(seed + 3) - 0.5) * 0.95 // Angular tilt as brick drops
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
  }, [text])

  // Draw particle frame based on scroll progress
  const drawFrame = useCallback((p: number) => {
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

    // Batch draw calls by color bucket
    const buckets: { x: number; y: number; s: number; a: number }[][] = [
      [], [], [], []
    ]

    for (let i = 0; i < numParticles; i++) {
      const pt = particles[i]

      // State A: Unbroken stone brick
      if (p < pt.breakThreshold) {
        const strain = Math.max(0, p - (pt.breakThreshold - 0.04)) / 0.04
        const jx = strain > 0 ? (pseudoRandom(i + p) - 0.5) * 0.7 * strain : 0
        const jy = strain > 0 ? (pseudoRandom(i * 2 + p) - 0.5) * 0.7 * strain : 0

        buckets[pt.colorIdx].push({
          x: pt.originX + jx,
          y: pt.originY + jy,
          s: step - 0.2,
          a: 0.22,
        })
        continue
      }

      // State B: Falling & dissolving
      const elapsed = (p - pt.breakThreshold) / (1 - pt.breakThreshold)

      // Sub-Phase 1: Coherent Brick Tumble (Elapsed 0.0 -> 0.25)
      if (elapsed < 0.25) {
        const brickT = elapsed / 0.25
        const fallY = Math.pow(brickT, 2) * (pt.fallSpeed * 32)
        const angle = brickT * pt.rotationSpeed
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
          a: 0.24 * (1 - brickT * 0.15),
        })
      }
      // Sub-Phase 2: Disintegration into Stippled Sand Particles (Elapsed >= 0.25)
      else {
        const sandT = (elapsed - 0.25) / (1 - 0.25)

        const fallY =
          pt.fallSpeed * 32 + Math.pow(sandT, 1.85) * (pt.fallSpeed * 125)
        const scatterX = Math.pow(sandT, 1.2) * (pt.driftX * 48)
        const scatterY = Math.sin(sandT * Math.PI) * 4

        const curX = pt.originX + scatterX
        const curY = pt.originY + fallY + scatterY

        // Sand particles shrink from blocks into fine grains (1.5px)
        const size = Math.max(1.2, (step - 0.2) * (1 - sandT * 0.45))
        // Natural sand mist dissolution into the dark horizon
        const alpha = Math.max(0, 0.22 * Math.pow(1 - sandT, 1.35))

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
  }, [])

  // Listen to scroll progress
  useMotionValueEvent(progress, "change", (latest) => {
    // When progress starts, fade out DOM text as canvas takes over smoothly
    setTextOpacity(latest <= 0.02 ? 1 : Math.max(0, 1 - latest * 3.5))

    if (animFrameRef.current !== null) {
      cancelAnimationFrame(animFrameRef.current)
    }
    animFrameRef.current = requestAnimationFrame(() => {
      drawFrame(latest)
    })
  })

  // Font loading & resize observers
  useEffect(() => {
    const handleInit = () => {
      initParticles()
      drawFrame(0)
    }

    handleInit()

    if (typeof document !== "undefined" && document.fonts) {
      document.fonts.ready.then(handleInit)
    }

    window.addEventListener("resize", handleInit, { passive: true })
    return () => {
      window.removeEventListener("resize", handleInit)
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current)
      }
    }
  }, [initParticles, drawFrame])

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={`pointer-events-none select-none relative w-full flex flex-col items-center ${className}`}
    >
      {/* 1. Solid Monolith DOM Text — 100% identical to the giant original text */}
      <span
        ref={textRef}
        style={{
          opacity: textOpacity,
          transition: "opacity 0.15s ease-out",
        }}
        className="font-[family-name:var(--font-heading)] font-bold uppercase tracking-[-0.03em] sm:tracking-[-0.04em] text-[12.5vw] sm:text-[13vw] md:text-[130px] lg:text-[150px] leading-[0.82] whitespace-nowrap bg-gradient-to-b from-[#181925]/[0.22] via-[#181925]/[0.10] to-[#181925]/[0.02] bg-clip-text text-transparent select-none block text-center"
      >
        {text}
      </span>

      {/* 2. Physics Canvas — Layered directly over the text, with falling room */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 will-change-transform"
        style={{
          imageRendering: "pixelated",
        }}
      />
    </div>
  )
}
