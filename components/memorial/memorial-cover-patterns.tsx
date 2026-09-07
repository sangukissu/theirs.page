"use client"

import React, { useId } from "react"
import { MEMORIAL_THEMES, type MemorialThemeId } from "@/lib/memorial/themes"
import type { HeroPatternStyle } from "@/types/theirs"

export interface PatternStyleMeta {
  id: HeroPatternStyle
  name: string
  description: string
}

export const HERO_PATTERN_STYLES: PatternStyleMeta[] = [
  {
    id: "soft_aura",
    name: "Soft Aura",
    description: "Luminous dual gradient aura with fine corner texture",
  },
  {
    id: "dither",
    name: "Dither",
    description: "Stippled geometric grain echoing vintage print technique",
  },
  {
    id: "heritage_lines",
    name: "Heritage Lines",
    description: "Classical guilloche engraving and archival curves",
  },
  {
    id: "sanctuary_arch",
    name: "Sanctuary Arch",
    description: "Architectural vaulted arches and serene sacred geometry",
  },
  {
    id: "eternal_crest",
    name: "Eternal Crest",
    description: "Archival sunburst intaglio and celestial radiating halo",
  },
  {
    id: "glow",
    name: "Glow",
    description: "Smooth, pure vector gradient ambient radiance",
  },
  {
    id: "botanical_veil",
    name: "Botanical Veil",
    description: "Whispered organic laurel and foliage contours",
  },
]

interface MemorialCoverPatternProps {
  style?: HeroPatternStyle
  themeId?: MemorialThemeId
  className?: string
}

export function MemorialCoverPattern({
  style = "soft_aura",
  themeId = "quiet",
  className = "",
}: MemorialCoverPatternProps) {
  const uniqueId = useId().replace(/:/g, "")
  const themeDef = MEMORIAL_THEMES[themeId] || MEMORIAL_THEMES.quiet
  const accent = themeDef.colors.accent
  const isDark = themeDef.isDark

  // Map deprecated or legacy styles to their closest modern equivalents
  const activeStyle: HeroPatternStyle =
    style === "paper_grain"
      ? "heritage_lines"
      : style === "starlight"
      ? "soft_aura"
      : style === "fluted_colonnade" || style === "harmonic_ripples" || style === "cadence"
      ? "heritage_lines"
      : style

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden select-none z-0 [mask-image:linear-gradient(to_bottom,black_65%,transparent_100%)] ${className}`}
    >
      {/* 1. SOFT AURA (Dual Vector Radial Glow + Fine Corner Stipple Aura) */}
      {activeStyle === "soft_aura" && (
        <svg
          className="pointer-events-none absolute inset-0 size-full"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          viewBox="0 0 1200 600"
        >
          <defs>
            <radialGradient id={`aura-l-${uniqueId}`} cx="0%" cy="0%" r="80%">
              <stop offset="0%" stopColor={accent} stopOpacity={isDark ? "0.65" : "0.5"} />
              <stop offset="35%" stopColor={accent} stopOpacity="0.22" />
              <stop offset="70%" stopColor={accent} stopOpacity="0.04" />
              <stop offset="100%" stopColor={accent} stopOpacity="0" />
            </radialGradient>
            <radialGradient id={`aura-r-${uniqueId}`} cx="100%" cy="0%" r="80%">
              <stop offset="0%" stopColor={accent} stopOpacity={isDark ? "0.65" : "0.5"} />
              <stop offset="35%" stopColor={accent} stopOpacity="0.22" />
              <stop offset="70%" stopColor={accent} stopOpacity="0.04" />
              <stop offset="100%" stopColor={accent} stopOpacity="0" />
            </radialGradient>
            <pattern
              id={`aura-stipple-${uniqueId}`}
              width="10"
              height="10"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="2" cy="2" r="1.1" fill={accent} fillOpacity={isDark ? "0.6" : "0.45"} />
              <circle cx="7" cy="7" r="1.1" fill={accent} fillOpacity={isDark ? "0.6" : "0.45"} />
              <circle cx="7" cy="2" r="0.7" fill={accent} fillOpacity={isDark ? "0.35" : "0.25"} />
              <circle cx="2" cy="7" r="0.7" fill={accent} fillOpacity={isDark ? "0.35" : "0.25"} />
            </pattern>
            <mask id={`aura-mask-l-${uniqueId}`}>
              <radialGradient id={`mask-rg-l-${uniqueId}`} cx="0%" cy="0%" r="75%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
                <stop offset="40%" stopColor="#ffffff" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0" />
              </radialGradient>
              <rect width="100%" height="100%" fill={`url(#mask-rg-l-${uniqueId})`} />
            </mask>
            <mask id={`aura-mask-r-${uniqueId}`}>
              <radialGradient id={`mask-rg-r-${uniqueId}`} cx="100%" cy="0%" r="75%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
                <stop offset="40%" stopColor="#ffffff" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0" />
              </radialGradient>
              <rect width="100%" height="100%" fill={`url(#mask-rg-r-${uniqueId})`} />
            </mask>
          </defs>
          {/* Dual Glow Halos */}
          <rect width="100%" height="100%" fill={`url(#aura-l-${uniqueId})`} />
          <rect width="100%" height="100%" fill={`url(#aura-r-${uniqueId})`} />
          {/* Corner Stipple Dither Texture */}
          <rect width="100%" height="100%" fill={`url(#aura-stipple-${uniqueId})`} mask={`url(#aura-mask-l-${uniqueId})`} />
          <rect width="100%" height="100%" fill={`url(#aura-stipple-${uniqueId})`} mask={`url(#aura-mask-r-${uniqueId})`} />
        </svg>
      )}

      {/* 2. DITHER (Pure Vector Stipple Halftone Matrix) */}
      {activeStyle === "dither" && (
        <svg
          className="pointer-events-none absolute inset-0 size-full"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          viewBox="0 0 1200 600"
        >
          <defs>
            <pattern
              id={`dither-bayer-${uniqueId}`}
              width="8"
              height="8"
              patternUnits="userSpaceOnUse"
            >
              <rect x="0" y="0" width="1.6" height="1.6" fill={accent} fillOpacity={isDark ? "0.85" : "0.65"} />
              <rect x="4" y="4" width="1.6" height="1.6" fill={accent} fillOpacity={isDark ? "0.85" : "0.65"} />
              <rect x="4" y="0" width="1" height="1" fill={accent} fillOpacity={isDark ? "0.5" : "0.38"} />
              <rect x="0" y="4" width="1" height="1" fill={accent} fillOpacity={isDark ? "0.5" : "0.38"} />
              <rect x="2" y="2" width="1.2" height="1.2" fill={accent} fillOpacity={isDark ? "0.6" : "0.48"} />
              <rect x="6" y="6" width="1.2" height="1.2" fill={accent} fillOpacity={isDark ? "0.6" : "0.48"} />
              <rect x="2" y="6" width="0.8" height="0.8" fill={accent} fillOpacity={isDark ? "0.35" : "0.25"} />
              <rect x="6" y="2" width="0.8" height="0.8" fill={accent} fillOpacity={isDark ? "0.35" : "0.25"} />
            </pattern>
            <mask id={`dither-mask-corners-${uniqueId}`}>
              <radialGradient id={`dither-mg-l-${uniqueId}`} cx="0%" cy="0%" r="85%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                <stop offset="35%" stopColor="#ffffff" stopOpacity="0.65" />
                <stop offset="70%" stopColor="#ffffff" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0" />
              </radialGradient>
              <radialGradient id={`dither-mg-r-${uniqueId}`} cx="100%" cy="0%" r="85%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                <stop offset="35%" stopColor="#ffffff" stopOpacity="0.65" />
                <stop offset="70%" stopColor="#ffffff" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0" />
              </radialGradient>
              <rect width="100%" height="100%" fill="#000000" />
              <rect width="100%" height="100%" fill={`url(#dither-mg-l-${uniqueId})`} />
              <rect width="100%" height="100%" fill={`url(#dither-mg-r-${uniqueId})`} />
            </mask>
          </defs>
          <rect
            width="100%"
            height="100%"
            fill={`url(#dither-bayer-${uniqueId})`}
            mask={`url(#dither-mask-corners-${uniqueId})`}
          />
        </svg>
      )}

      {/* 3. HERITAGE LINES (Archival Guilloche Curves & Fine Concentric Arcs) */}
      {activeStyle === "heritage_lines" && (
        <svg
          className="pointer-events-none absolute inset-0 size-full opacity-35"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 600"
          preserveAspectRatio="xMidYMin slice"
        >
          <g stroke={accent} fill="none" strokeWidth="0.8" opacity="0.75">
            {/* Fine Concentric Arcs Left */}
            <circle cx="0" cy="0" r="180" strokeDasharray="3 3" />
            <circle cx="0" cy="0" r="280" />
            <circle cx="0" cy="0" r="380" strokeDasharray="4 4" />
            <circle cx="0" cy="0" r="480" />
            <circle cx="0" cy="0" r="580" strokeDasharray="2 4" />

            {/* Fine Concentric Arcs Right */}
            <circle cx="1200" cy="0" r="180" strokeDasharray="3 3" />
            <circle cx="1200" cy="0" r="280" />
            <circle cx="1200" cy="0" r="380" strokeDasharray="4 4" />
            <circle cx="1200" cy="0" r="480" />
            <circle cx="1200" cy="0" r="580" strokeDasharray="2 4" />

            {/* Subtle Center Archival Horizontal Flourish */}
            <path d="M300 80 Q 600 140, 900 80" strokeWidth="0.5" opacity="0.5" />
            <path d="M360 95 Q 600 150, 840 95" strokeWidth="0.5" strokeDasharray="2 3" opacity="0.4" />
          </g>
        </svg>
      )}

      {/* 4. SANCTUARY ARCH (Architectural Vaulted Arches & Serene Sacred Geometry) */}
      {activeStyle === "sanctuary_arch" && (
        <svg
          className="pointer-events-none absolute inset-0 size-full opacity-40"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 600"
          preserveAspectRatio="xMidYMin slice"
        >
          <defs>
            <linearGradient id={`arch-grad-${uniqueId}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={accent} stopOpacity={isDark ? "0.85" : "0.65"} />
              <stop offset="60%" stopColor={accent} stopOpacity={isDark ? "0.35" : "0.22"} />
              <stop offset="100%" stopColor={accent} stopOpacity="0" />
            </linearGradient>
            <radialGradient id={`arch-halo-${uniqueId}`} cx="50%" cy="38%" r="55%">
              <stop offset="0%" stopColor={accent} stopOpacity={isDark ? "0.35" : "0.22"} />
              <stop offset="50%" stopColor={accent} stopOpacity={isDark ? "0.12" : "0.07"} />
              <stop offset="100%" stopColor={accent} stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Central Sanctuary Halo Wash */}
          <rect width="100%" height="100%" fill={`url(#arch-halo-${uniqueId})`} />

          <g stroke={`url(#arch-grad-${uniqueId})`} fill="none" strokeWidth="1">
            {/* Concentric Vaulted Arch Ribs Framing Portrait */}
            <path d="M420 560 V 220 C 420 120, 780 120, 780 220 V 560" strokeWidth="1.2" />
            <path d="M450 560 V 235 C 450 150, 750 150, 750 235 V 560" strokeWidth="0.8" strokeDasharray="4 4" />
            <path d="M380 560 V 200 C 380 90, 820 90, 820 200 V 560" strokeWidth="0.75" />
            <path d="M340 560 V 180 C 340 60, 860 60, 860 180 V 560" strokeWidth="0.6" strokeDasharray="3 5" />
            <path d="M480 560 V 250 C 480 180, 720 180, 720 250 V 560" strokeWidth="0.6" />

            {/* Fluted Vertical Radiations in Outer Wings */}
            <path d="M260 560 V 160 C 260 30, 940 30, 940 160 V 560" strokeWidth="0.5" opacity="0.5" />
            <path d="M180 560 V 150 C 180 0, 1020 0, 1020 150 V 560" strokeWidth="0.4" strokeDasharray="2 4" opacity="0.4" />

            {/* Sacred Keystone Rays */}
            <line x1="600" y1="20" x2="600" y2="80" strokeWidth="1" />
            <line x1="560" y1="28" x2="575" y2="82" strokeWidth="0.6" />
            <line x1="640" y1="28" x2="625" y2="82" strokeWidth="0.6" />
            <line x1="520" y1="42" x2="550" y2="88" strokeWidth="0.5" />
            <line x1="680" y1="42" x2="650" y2="88" strokeWidth="0.5" />

            {/* Keystone Diamond Accent */}
            <polygon points="600,75 606,85 600,95 594,85" fill={accent} fillOpacity="0.25" strokeWidth="0.8" />
          </g>
        </svg>
      )}

      {/* 5. ETERNAL CREST (Archival Sunburst Intaglio & Radiating Halo) */}
      {activeStyle === "eternal_crest" && (
        <svg
          className="pointer-events-none absolute inset-0 size-full opacity-40"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 600"
          preserveAspectRatio="xMidYMin slice"
        >
          <defs>
            <linearGradient id={`crest-grad-${uniqueId}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={accent} stopOpacity={isDark ? "0.85" : "0.7"} />
              <stop offset="65%" stopColor={accent} stopOpacity={isDark ? "0.35" : "0.22"} />
              <stop offset="100%" stopColor={accent} stopOpacity="0" />
            </linearGradient>
            <radialGradient id={`crest-halo-${uniqueId}`} cx="50%" cy="32%" r="48%">
              <stop offset="0%" stopColor={accent} stopOpacity={isDark ? "0.4" : "0.25"} />
              <stop offset="45%" stopColor={accent} stopOpacity={isDark ? "0.15" : "0.08"} />
              <stop offset="100%" stopColor={accent} stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Central Radiance Wash */}
          <rect width="100%" height="100%" fill={`url(#crest-halo-${uniqueId})`} />

          {/* Symmetrical Archival Intaglio Linework */}
          <g stroke={`url(#crest-grad-${uniqueId})`} fill="none">
            {/* Concentric Celestial Rings framing portrait focal point (600, 185) */}
            <circle cx="600" cy="185" r="110" strokeWidth="1" opacity="0.8" />
            <circle cx="600" cy="185" r="135" strokeWidth="0.6" strokeDasharray="3 4" opacity="0.65" />
            <circle cx="600" cy="185" r="175" strokeWidth="0.8" opacity="0.75" />
            <circle cx="600" cy="185" r="225" strokeWidth="0.6" strokeDasharray="4 5" opacity="0.55" />
            <circle cx="600" cy="185" r="285" strokeWidth="0.7" opacity="0.45" />
            <circle cx="600" cy="185" r="350" strokeWidth="0.5" strokeDasharray="3 7" opacity="0.35" />
            <circle cx="600" cy="185" r="430" strokeWidth="0.4" strokeDasharray="2 6" opacity="0.25" />

            {/* 16 Major Sunburst Rays (22.5 deg intervals) with Archival Finials */}
            {[0, 22.5, 45, 67.5, 90, 112.5, 135, 157.5, 180, 202.5, 225, 247.5, 270, 292.5, 315, 337.5].map((deg) => (
              <g key={deg} transform={`rotate(${deg} 600 185)`}>
                <line x1="600" y1="55" x2="600" y2="100" strokeWidth="0.9" />
                <line x1="600" y1="15" x2="600" y2="45" strokeWidth="0.6" strokeDasharray="3 3" />
                <circle cx="600" cy="55" r="1.4" fill={accent} stroke="none" opacity="0.85" />
              </g>
            ))}

            {/* 16 Intermediate Hairline Rays (Stippled Offset) */}
            {[11.25, 33.75, 56.25, 78.75, 101.25, 123.75, 146.25, 168.75, 191.25, 213.75, 236.25, 258.75, 281.25, 303.75, 326.25, 348.75].map((deg) => (
              <g key={deg} transform={`rotate(${deg} 600 185)`}>
                <line x1="600" y1="40" x2="600" y2="85" strokeWidth="0.5" strokeDasharray="2 4" opacity="0.6" />
              </g>
            ))}

            {/* Cardinal Star Accents */}
            <polygon points="600,42 604,50 600,58 596,50" fill={accent} fillOpacity="0.5" strokeWidth="0.6" />
            <polygon points="600,312 604,320 600,328 596,320" fill={accent} fillOpacity="0.5" strokeWidth="0.6" />
            <polygon points="465,185 473,181 481,185 473,189" fill={accent} fillOpacity="0.5" strokeWidth="0.6" />
            <polygon points="719,185 727,181 735,185 727,189" fill={accent} fillOpacity="0.5" strokeWidth="0.6" />

            {/* Symmetrical Horizon Axis Hairline Rules */}
            <line x1="60" y1="185" x2="445" y2="185" strokeWidth="0.7" opacity="0.5" />
            <line x1="755" y1="185" x2="1140" y2="185" strokeWidth="0.7" opacity="0.5" />
            <circle cx="60" cy="185" r="2.2" fill={accent} stroke="none" opacity="0.7" />
            <circle cx="1140" cy="185" r="2.2" fill={accent} stroke="none" opacity="0.7" />

            {/* Graceful Archival Lateral Flourish Brackets */}
            <path d="M120 185 C 220 185, 310 215, 370 280 S 390 380, 390 460" strokeWidth="0.6" strokeDasharray="3 4" opacity="0.4" />
            <path d="M1080 185 C 980 185, 890 215, 830 280 S 810 380, 810 460" strokeWidth="0.6" strokeDasharray="3 4" opacity="0.4" />
          </g>
        </svg>
      )}

      {/* 6. GLOW (Smooth Vector Radial Ambient Wash) */}
      {activeStyle === "glow" && (
        <svg
          className="pointer-events-none absolute inset-0 size-full opacity-55"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          viewBox="0 0 1200 600"
        >
          <defs>
            <radialGradient id={`glow-l-${uniqueId}`} cx="0%" cy="0%" r="80%">
              <stop offset="0%" stopColor={accent} stopOpacity={isDark ? "0.75" : "0.55"} />
              <stop offset="30%" stopColor={accent} stopOpacity="0.25" />
              <stop offset="65%" stopColor={accent} stopOpacity="0.05" />
              <stop offset="90%" stopColor={accent} stopOpacity="0" />
            </radialGradient>
            <radialGradient id={`glow-r-${uniqueId}`} cx="100%" cy="0%" r="80%">
              <stop offset="0%" stopColor={accent} stopOpacity={isDark ? "0.75" : "0.55"} />
              <stop offset="30%" stopColor={accent} stopOpacity="0.25" />
              <stop offset="65%" stopColor={accent} stopOpacity="0.05" />
              <stop offset="90%" stopColor={accent} stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="100%" height="100%" fill={`url(#glow-l-${uniqueId})`} />
          <rect width="100%" height="100%" fill={`url(#glow-r-${uniqueId})`} />
        </svg>
      )}

      {/* 6. BOTANICAL VEIL (Organic Laurel and Leaf Contour Silhouette) */}
      {activeStyle === "botanical_veil" && (
        <svg
          className="pointer-events-none absolute inset-0 size-full opacity-35"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 600"
          preserveAspectRatio="xMidYMin slice"
        >
          <defs>
            <linearGradient id={`leaf-grad-l-${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={accent} stopOpacity="0.6" />
              <stop offset="100%" stopColor={accent} stopOpacity="0" />
            </linearGradient>
            <linearGradient id={`leaf-grad-r-${uniqueId}`} x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={accent} stopOpacity="0.6" />
              <stop offset="100%" stopColor={accent} stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Left Branch Flourish */}
          <g stroke={`url(#leaf-grad-l-${uniqueId})`} fill="none" strokeWidth="1.2">
            <path d="M-20 40 C 80 80, 160 160, 220 280 C 250 340, 260 420, 240 500" />
            <path d="M30 65 C 60 40, 110 50, 115 80 C 120 110, 70 100, 30 65 Z" fill={accent} fillOpacity="0.08" />
            <path d="M75 105 C 120 90, 160 110, 160 145 C 160 175, 110 160, 75 105 Z" fill={accent} fillOpacity="0.08" />
            <path d="M125 160 C 180 150, 215 185, 205 220 C 195 250, 150 225, 125 160 Z" fill={accent} fillOpacity="0.08" />
            <path d="M170 230 C 230 225, 260 270, 245 305 C 230 335, 185 300, 170 230 Z" fill={accent} fillOpacity="0.08" />
          </g>

          {/* Right Branch Flourish */}
          <g stroke={`url(#leaf-grad-r-${uniqueId})`} fill="none" strokeWidth="1.2">
            <path d="M1220 40 C 1120 80, 1040 160, 980 280 C 950 340, 940 420, 960 500" />
            <path d="M1170 65 C 1140 40, 1090 50, 1085 80 C 1080 110, 1130 100, 1170 65 Z" fill={accent} fillOpacity="0.08" />
            <path d="M1125 105 C 1080 90, 1040 110, 1040 145 C 1040 175, 1090 160, 1125 105 Z" fill={accent} fillOpacity="0.08" />
            <path d="M1075 160 C 1020 150, 985 185, 995 220 C 1005 250, 1050 225, 1075 160 Z" fill={accent} fillOpacity="0.08" />
            <path d="M1030 230 C 970 225, 940 270, 955 305 C 970 335, 1015 300, 1030 230 Z" fill={accent} fillOpacity="0.08" />
          </g>
        </svg>
      )}
    </div>
  )
}
