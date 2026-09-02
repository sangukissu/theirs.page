"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Globe,
  Users,
  Image as ImageIcon,
  Mic,
  ShieldCheck,
  Lock,
  Download,
  Infinity as InfinityIcon,
  Sparkles,
  Heart,
} from "lucide-react"

interface PricingTier {
  memorials: number
  label: string
  price: number
  perUnit: string
  sublabel: string
  contributors: number
  memories: number
}

const TIERS: PricingTier[] = [
  {
    memorials: 1,
    label: "1 Memorial",
    price: 49,
    perUnit: "$49",
    sublabel: "A dedicated permanent archive for one life",
    contributors: 14,
    memories: 42,
  },
  {
    memorials: 3,
    label: "3 Memorials",
    price: 89,
    perUnit: "$30/each",
    sublabel: "Family package for parents & grandparents",
    contributors: 38,
    memories: 118,
  },
  {
    memorials: 5,
    label: "5 Memorials",
    price: 129,
    perUnit: "$26/each",
    sublabel: "Generational archive for the whole family lineage",
    contributors: 72,
    memories: 240,
  },
]

import { SectionHeader } from "@/components/theirs/section-header"

export function TheirsPricing() {
  const [tierIndex, setTierIndex] = useState(0)
  const currentTier = TIERS[tierIndex]

  return (
    <section id="pricing" className="py-16 sm:py-24 flex flex-col gap-12 relative overflow-hidden">
      {/* Header */}
      <SectionHeader
        badge="Pricing"
        title="Simplified pricing"
        description="No confusing tiers. You pay once for permanent preservation. Everything is included."
        className="px-5 max-w-3xl mx-auto"
      />

      {/* Main Split Pricing Card */}
      <div className="w-full max-w-5xl mx-auto px-5">
        <div className="grid grid-cols-1 lg:grid-cols-2 rounded-2xl bg-[#f5f5f7] overflow-hidden border border-black/[0.06]">
          
          {/* Left Column */}
          <div className="p-6 sm:p-8 lg:p-10 flex flex-col items-start gap-6 lg:border-r border-black/[0.08] bg-white">
            {/* Header Row */}
            <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex flex-col gap-0.5">
                <h3 className="font-medium text-[#181925] text-base sm:text-lg">
                  Lifetime memorials
                </h3>
                <p className="text-[#71717a] text-xs sm:text-sm max-w-64">
                  Pay once, preserve forever. No monthly subscriptions for grief.
                </p>
              </div>

              {/* Tabs Switch Pill */}
              <div className="inline-flex items-center bg-[#f5f5f7] rounded-full p-1 border border-black/5 gap-1 shrink-0">
                <span className="flex items-center text-xs font-medium px-3 py-1 bg-white rounded-full text-[#181925] shadow-xs">
                  One-time
                </span>
                <span className="flex items-center text-xs font-medium px-2.5 py-1 text-[#71717a]">
                  Forever
                </span>
              </div>
            </div>

            {/* Price & Metric Display (Using defined Primary Color) */}
            <div className="w-full flex items-end justify-between gap-2 pt-1">
              <span className="inline-flex items-center text-4xl sm:text-5xl font-medium text-primary tracking-tight">
                {currentTier.label}
              </span>
              <div className="flex flex-col items-end">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl sm:text-2xl text-[#71717a]">for</span>
                  <div className="flex items-baseline">
                    <span className="text-2xl sm:text-3xl font-medium text-[#181925]">
                      ${currentTier.price}
                    </span>
                    <span className="text-sm text-[#71717a] ml-1">one-time</span>
                  </div>
                </div>
                <span className="text-[11px] text-emerald-600 font-medium">
                  {currentTier.sublabel}
                </span>
              </div>
            </div>

            {/* Interactive Step Slider */}
            <div className="relative w-full select-none pt-1 pb-1">
              <div className="relative h-12 flex items-center cursor-pointer">
                {/* Dot Markers */}
                <div className="absolute inset-0 flex items-center justify-between px-3 pointer-events-none z-0">
                  {TIERS.map((_, i) => (
                    <div
                      key={i}
                      className={`size-2.5 rounded-full transition-colors ${
                        i <= tierIndex ? "bg-primary" : "bg-neutral-300"
                      }`}
                    />
                  ))}
                </div>

                {/* Slider Track with Defined Primary Gradient */}
                <div className="absolute inset-x-0 h-3 rounded-full bg-neutral-200 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-sky-400 via-primary/80 to-primary transition-all duration-200"
                    style={{
                      width: `${(tierIndex / (TIERS.length - 1)) * 100}%`,
                    }}
                  />
                </div>

                {/* Range Input */}
                <input
                  type="range"
                  min={0}
                  max={TIERS.length - 1}
                  step={1}
                  value={tierIndex}
                  onChange={(e) => setTierIndex(Number(e.target.value))}
                  className="absolute inset-0 w-full opacity-0 cursor-pointer z-20"
                  aria-label="Select pricing tier"
                />

                {/* Visible Thumb */}
                <div
                  className="absolute size-7 rounded-full bg-white shadow-md border border-black/10 transition-all duration-200 pointer-events-none z-10 -ml-3.5"
                  style={{
                    left: `${(tierIndex / (TIERS.length - 1)) * 100}%`,
                  }}
                />
              </div>

              {/* Slider Labels */}
              <div className="flex justify-between text-[11px] font-medium text-[#71717a] px-1 -mt-1">
                <span>1 Memorial ($49)</span>
                <span>3 Memorials ($89)</span>
                <span>5 Memorials ($129)</span>
              </div>
            </div>

            {/* CTA Button Row using Defined Primary Button Styling */}
            <div className="w-full flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-1">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap !rounded-full font-medium transition-all cursor-pointer border border-[color-mix(in_srgb,var(--primary)_80%,#3a3480)] bg-[color-mix(in_srgb,var(--primary)_90%,#3a3480)] text-primary-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.22),inset_0_-1px_0_rgba(58,52,128,0.30)] transform-gpu hover:bg-primary active:scale-[0.98] h-11 px-6 text-sm w-full sm:w-auto group"
              >
                <span>Start with a free draft</span>
                <span className="relative size-4 overflow-hidden inline-flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="absolute inset-0 size-4 transition-transform duration-200 group-hover:translate-x-3 group-hover:opacity-0"
                  >
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="absolute inset-0 size-4 -translate-x-3 opacity-0 transition-transform duration-200 group-hover:translate-x-0 group-hover:opacity-100"
                  >
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </span>
              </Link>
              <p className="text-xs text-[#71717a] max-w-44 leading-relaxed">
                Free to assemble. Pay only when you publish.
              </p>
            </div>

            {/* 10 Feature Checkpoints with Defined Primary Color */}
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2.5 pt-4 border-t border-black/[0.06]">
              <div className="flex items-center gap-2 text-sm text-primary">
                <Globe className="size-4 shrink-0 stroke-[1.5]" />
                <span className="text-[#181925] font-medium text-xs sm:text-sm">Permanent custom link</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-primary">
                <Heart className="size-4 shrink-0 stroke-[1.5]" />
                <span className="text-[#181925] font-medium text-xs sm:text-sm">Unlimited family memories</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-primary">
                <ImageIcon className="size-4 shrink-0 stroke-[1.5]" />
                <span className="text-[#181925] font-medium text-xs sm:text-sm">RAW 4K photo preservation</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-primary">
                <Mic className="size-4 shrink-0 stroke-[1.5]" />
                <span className="text-[#181925] font-medium text-xs sm:text-sm">Voicemail audio player</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-primary">
                <Users className="size-4 shrink-0 stroke-[1.5]" />
                <span className="text-[#181925] font-medium text-xs sm:text-sm">Zero logins for contributors</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-primary">
                <ShieldCheck className="size-4 shrink-0 stroke-[1.5]" />
                <span className="text-[#181925] font-medium text-xs sm:text-sm">Moderation approval queue</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-primary">
                <Lock className="size-4 shrink-0 stroke-[1.5]" />
                <span className="text-[#181925] font-medium text-xs sm:text-sm">3 Simple privacy tiers</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-primary">
                <Sparkles className="size-4 shrink-0 stroke-[1.5]" />
                <span className="text-[#181925] font-medium text-xs sm:text-sm">Successor caretaker transfer</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-primary">
                <Download className="size-4 shrink-0 stroke-[1.5]" />
                <span className="text-[#181925] font-medium text-xs sm:text-sm">1-Click offline archive (ZIP)</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-primary">
                <InfinityIcon className="size-4 shrink-0 stroke-[1.5]" />
                <span className="text-[#181925] font-medium text-xs sm:text-sm">Forever cloud hosting</span>
              </div>
            </div>
          </div>

          {/* Right Column: Simulated Live World Memory Map */}
          <div className="p-6 sm:p-8 lg:p-10 relative overflow-hidden flex flex-col justify-between min-h-[460px] bg-[#f5f5f7]">
            {/* Top Metric Header */}
            <div className="w-full flex flex-col items-center gap-1 z-10 text-center">
              <p className="font-medium text-xs text-[#71717a] text-center">
                Simulated memories for{" "}
                <span className="text-primary font-semibold">Robert Carter</span>
              </p>
              <div className="flex flex-col items-center">
                <span className="text-5xl font-medium text-[#181925] tracking-tight">
                  {currentTier.contributors}
                </span>
                <span className="text-xs text-[#71717a]">family & friends connected</span>
              </div>
            </div>

            {/* The Visual Interactive World Map Sphere with Family Pins */}
            <div className="relative w-full h-72 sm:h-80 my-auto flex items-center justify-center">
              {/* Radial Glow using defined primary */}
              <div className="absolute inset-0 bg-radial from-primary/10 via-transparent to-transparent pointer-events-none" />

              {/* Styled SVG World Map Silhouette */}
              <svg
                viewBox="0 0 800 450"
                className="w-full h-full object-contain opacity-50 select-none pointer-events-none"
                fill="none"
              >
                {/* Earth / Ocean subtle grid lines */}
                <ellipse cx="400" cy="225" rx="360" ry="200" stroke="#000" strokeOpacity="0.06" strokeWidth="1" />
                <ellipse cx="400" cy="225" rx="240" ry="200" stroke="#000" strokeOpacity="0.06" strokeWidth="1" />
                <line x1="40" y1="225" x2="760" y2="225" stroke="#000" strokeOpacity="0.06" strokeWidth="1" />
                
                {/* Continents outlines */}
                <path
                  d="M180,110 Q210,90 260,110 Q280,160 250,210 Q200,220 160,180 Z"
                  fill="#000"
                  fillOpacity="0.08"
                />
                <path
                  d="M230,240 Q260,250 280,310 Q250,370 210,340 Q190,270 230,240 Z"
                  fill="#000"
                  fillOpacity="0.08"
                />
                <path
                  d="M400,100 Q450,90 480,140 Q450,190 390,170 Q370,120 400,100 Z"
                  fill="#000"
                  fillOpacity="0.08"
                />
                <path
                  d="M400,200 Q460,210 470,290 Q440,360 390,320 Q370,230 400,200 Z"
                  fill="#000"
                  fillOpacity="0.08"
                />
                <path
                  d="M500,100 Q620,90 680,160 Q630,230 520,200 Q480,140 500,100 Z"
                  fill="#000"
                  fillOpacity="0.08"
                />
                <path
                  d="M590,280 Q660,270 680,330 Q630,370 580,340 Z"
                  fill="#000"
                  fillOpacity="0.08"
                />

                {/* Connection Arcs using Defined Primary */}
                <path
                  d="M240,160 Q340,80 430,140"
                  stroke="#305dde"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                  strokeOpacity="0.6"
                />
                <path
                  d="M430,140 Q500,100 580,160"
                  stroke="#305dde"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                  strokeOpacity="0.6"
                />
                <path
                  d="M430,140 Q460,250 430,280"
                  stroke="#305dde"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                  strokeOpacity="0.6"
                />
                <path
                  d="M430,140 Q550,260 620,310"
                  stroke="#305dde"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                  strokeOpacity="0.6"
                />
              </svg>

              {/* Pin 1: London (Central Hub) */}
              <div className="absolute top-[28%] left-[48%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer">
                <div className="relative size-8 rounded-full border-2 border-white bg-primary shadow-md flex items-center justify-center text-white text-xs font-medium hover:scale-110 transition-transform">
                  <span>A</span>
                  <span className="absolute -top-1 -right-1 size-2.5 rounded-full bg-emerald-400 ring-2 ring-white animate-pulse" />
                </div>
                <span className="mt-1 px-2 py-0.5 rounded-full bg-white/95 backdrop-blur-xs text-[10px] font-medium text-[#181925] shadow-xs border border-black/5 whitespace-nowrap">
                  Anita (London)
                </span>
              </div>

              {/* Pin 2: New York */}
              <div className="absolute top-[32%] left-[26%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer">
                <div className="size-7 rounded-full border-2 border-white bg-sky-500 shadow-md flex items-center justify-center text-white text-[11px] font-medium hover:scale-110 transition-transform">
                  <span>D</span>
                </div>
                <span className="mt-1 px-2 py-0.5 rounded-full bg-white/95 backdrop-blur-xs text-[10px] font-medium text-[#181925] shadow-xs border border-black/5 whitespace-nowrap">
                  Uncle David (NY)
                </span>
              </div>

              {/* Pin 3: Jaipur */}
              <div className="absolute top-[36%] left-[68%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer">
                <div className="size-7 rounded-full border-2 border-white bg-amber-500 shadow-md flex items-center justify-center text-white text-[11px] font-medium hover:scale-110 transition-transform">
                  <span>R</span>
                </div>
                <span className="mt-1 px-2 py-0.5 rounded-full bg-white/95 backdrop-blur-xs text-[10px] font-medium text-[#181925] shadow-xs border border-black/5 whitespace-nowrap">
                  Rahul (Jaipur)
                </span>
              </div>

              {/* Pin 4: Sydney */}
              <div className="absolute top-[68%] left-[76%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer hidden sm:flex">
                <div className="size-7 rounded-full border-2 border-white bg-primary shadow-md flex items-center justify-center text-white text-[11px] font-medium hover:scale-110 transition-transform">
                  <span>S</span>
                </div>
                <span className="mt-1 px-2 py-0.5 rounded-full bg-white/95 backdrop-blur-xs text-[10px] font-medium text-[#181925] shadow-xs border border-black/5 whitespace-nowrap">
                  Sarah (Sydney)
                </span>
              </div>

              {/* Pin 5: Nairobi */}
              <div className="absolute top-[58%] left-[52%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer hidden sm:flex">
                <div className="size-6 rounded-full border-2 border-white bg-emerald-500 shadow-md flex items-center justify-center text-white text-[10px] font-medium hover:scale-110 transition-transform">
                  <span>M</span>
                </div>
              </div>
            </div>

            {/* Bottom Floating Pill Capsule */}
            <div className="w-full flex justify-center z-10">
              <div className="bg-[#181925] text-white rounded-full shadow-md pl-3 pr-3.5 h-10 flex items-center gap-2 text-xs font-medium">
                <Globe className="size-4 text-primary" />
                <span className="tabular-nums font-semibold text-blue-200">
                  {currentTier.memories}
                </span>
                <span>memories gathered worldwide</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
