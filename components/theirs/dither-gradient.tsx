"use client"

import { useEffect, useRef } from "react"

interface DitherGradientProps {
  from?: string | number
  to?: string
  direction?: "up" | "down" | "left" | "right"
  cell?: number
  opacity?: number
  bloom?: "off" | "low" | "high" | "aura"
  className?: string
}

const BAYER_4X4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
].map((row) => row.map((v) => (v + 0.5) / 16))

const PALETTE: Record<string, [number, number, number]> = {
  blue: [48, 93, 222],
  cyan: [0, 196, 255],
  green: [51, 199, 88],
  purple: [145, 141, 246],
  magenta: [214, 64, 159],
  rose: [244, 63, 94],
  orange: [255, 150, 50],
  grey: [92, 92, 100],
}

function resolveColor(c: string | number): [number, number, number] {
  if (typeof c === "number") {
    const hue = ((c % 360) + 360) % 360
    const s = 0.85
    const l = 0.58
    const cVal = (1 - Math.abs(2 * l - 1)) * s
    const x = cVal * (1 - Math.abs(((hue / 60) % 2) - 1))
    const m = l - cVal / 2
    let r = 0,
      g = 0,
      b = 0
    if (hue < 60) [r, g, b] = [cVal, x, 0]
    else if (hue < 120) [r, g, b] = [x, cVal, 0]
    else if (hue < 180) [r, g, b] = [0, cVal, x]
    else if (hue < 240) [r, g, b] = [0, x, cVal]
    else if (hue < 300) [r, g, b] = [x, 0, cVal]
    else [r, g, b] = [cVal, 0, x]
    return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)]
  }
  return PALETTE[c] || [48, 93, 222]
}

const BLOOM_PRESETS = {
  low: { blur: 3, brightness: 1.35, opacity: 0.7, saturate: 1.4 },
  high: { blur: 5, brightness: 1.5, opacity: 0.78, saturate: 1.5 },
  aura: { blur: 15, brightness: 2.9, opacity: 0.1, saturate: 3 },
}

export function DitherGradient({
  from = "cyan",
  to = "transparent",
  direction = "up",
  cell = 3,
  opacity = 1,
  bloom = "aura",
  className = "",
}: DitherGradientProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const pixelCanvasRef = useRef<HTMLCanvasElement>(null)
  const bloomCanvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const container = containerRef.current
    const pixelCanvas = pixelCanvasRef.current
    if (!container || !pixelCanvas) return

    const render = () => {
      const rect = container.getBoundingClientRect()
      const width = rect.width
      const height = rect.height
      if (width <= 0 || height <= 0) return

      const c = Math.min(960, Math.max(4, Math.round(width / cell)))
      const d = Math.min(600, Math.max(4, Math.round(height / cell)))
      pixelCanvas.width = c
      pixelCanvas.height = d

      const ctx = pixelCanvas.getContext("2d")
      if (!ctx) return

      const u = resolveColor(from)
      const targetTo = to === "transparent" ? null : resolveColor(to)

      for (let y = 0; y < d; y++) {
        for (let x = 0; x < c; x++) {
          const progress =
            1 -
            (direction === "up"
              ? 1 - (y + 0.5) / d
              : direction === "down"
              ? (y + 0.5) / d
              : direction === "left"
              ? 1 - (x + 0.5) / c
              : (x + 0.5) / c)
          const threshold = BAYER_4X4[y & 3][x & 3]
          const active = progress > threshold

          if (targetTo) {
            const col = active ? u : targetTo
            ctx.fillStyle = `rgba(${col[0]},${col[1]},${col[2]},${opacity})`
            ctx.fillRect(x, y, 1, 1)
          } else {
            const alpha = (active ? 0.35 + 0.65 * progress : 0.12 * progress) * opacity
            if (alpha <= 0.004) continue
            ctx.fillStyle = `rgba(${u[0]},${u[1]},${u[2]},${alpha})`
            ctx.fillRect(x, y, 1, 1)
          }
        }
      }

      if (bloomCanvasRef.current) {
        bloomCanvasRef.current.width = c
        bloomCanvasRef.current.height = d
        const bloomCtx = bloomCanvasRef.current.getContext("2d")
        if (bloomCtx) {
          bloomCtx.drawImage(pixelCanvas, 0, 0)
        }
      }
    }

    render()

    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(render)
      observer.observe(container)
      return () => observer.disconnect()
    }
  }, [from, to, direction, cell, opacity, bloom])

  const bloomStyle =
    bloom === "off"
      ? null
      : {
          filter: `blur(${BLOOM_PRESETS[bloom].blur}px) brightness(${BLOOM_PRESETS[bloom].brightness}) saturate(${BLOOM_PRESETS[bloom].saturate})`,
          opacity: BLOOM_PRESETS[bloom].opacity,
          mixBlendMode: "plus-lighter" as const,
          imageRendering: "auto" as const,
        }

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      <canvas
        ref={pixelCanvasRef}
        className="absolute inset-0 h-full w-full"
        style={{ imageRendering: "pixelated" }}
      />
      {bloomStyle && (
        <canvas
          ref={bloomCanvasRef}
          className="absolute inset-0 h-full w-full"
          style={bloomStyle}
        />
      )}
    </div>
  )
}
