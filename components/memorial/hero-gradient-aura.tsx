"use client"

import { DitherGradient } from "@/components/theirs/dither-gradient"

export type AuraMode = "both" | "dither" | "svg"
export type AuraColor = "cyan" | "purple" | "green" | "magenta" | "orange" | "accent"

interface HeroGradientAuraProps {
  opacity?: number // e.g. 0.45 (45%)
  mode?: AuraMode
  color?: AuraColor
  accentColor?: string
  className?: string
}

export function HeroGradientAura({
  opacity = 0.45,
  mode = "both",
  color = "cyan",
  accentColor,
  className = "",
}: HeroGradientAuraProps) {
  const ditherColor = color === "accent" ? "cyan" : color
  const svgHex =
    color === "accent" && accentColor
      ? accentColor
      : color === "purple"
      ? "#918df6"
      : color === "green"
      ? "#33c758"
      : color === "magenta"
      ? "#d6409f"
      : color === "orange"
      ? "#ff9632"
      : "#00c4ff"

  const showDither = mode === "both" || mode === "dither"
  const showSvg = mode === "both" || mode === "svg"

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden select-none z-0 [mask-image:linear-gradient(to_bottom,black_75%,transparent_100%)] transition-opacity duration-300 ${className}`}
      style={{ opacity }}
    >
      {/* 1. Vector SVG Gradient Mesh Layer (Dual Left & Right) */}
      {showSvg && (
        <svg
          className="pointer-events-none absolute inset-0 size-full"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          viewBox="0 0 1200 600"
        >
          <defs>
            {/* Left side radial gradient: Origin at top-left (0% 0%) */}
            <radialGradient id="hero-aura-left-svg" cx="0%" cy="0%" r="75%" fx="0%" fy="0%">
              <stop offset="0%" stopColor={svgHex} stopOpacity="0.85" />
              <stop offset="25%" stopColor={svgHex} stopOpacity="0.5" />
              <stop offset="55%" stopColor={svgHex} stopOpacity="0.2" />
              <stop offset="85%" stopColor={svgHex} stopOpacity="0" />
            </radialGradient>

            {/* Right side radial gradient: Origin at top-right (100% 0%) */}
            <radialGradient id="hero-aura-right-svg" cx="100%" cy="0%" r="75%" fx="100%" fy="0%">
              <stop offset="0%" stopColor={svgHex} stopOpacity="0.85" />
              <stop offset="25%" stopColor={svgHex} stopOpacity="0.5" />
              <stop offset="55%" stopColor={svgHex} stopOpacity="0.2" />
              <stop offset="85%" stopColor={svgHex} stopOpacity="0" />
            </radialGradient>
          </defs>

          <rect width="100%" height="100%" fill="url(#hero-aura-left-svg)" />
          <rect width="100%" height="100%" fill="url(#hero-aura-right-svg)" />
        </svg>
      )}

      {/* 2. Exact Dither Gradient Aura from Login Page */}
      {showDither && (
        <div className="absolute inset-0">
          {/* Left Side: Starts at top-left (0% 0%) */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(125%_115%_at_0%_0%,#000_0%,#000_30%,transparent_75%)]"
          >
            <DitherGradient from={ditherColor} bloom="aura" />
          </span>

          {/* Right Side: Starts at top-right (100% 0%) as used on Login Page */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(125%_115%_at_100%_0%,#000_0%,#000_30%,transparent_75%)]"
          >
            <DitherGradient from={ditherColor} bloom="aura" />
          </span>
        </div>
      )}
    </div>
  )
}
