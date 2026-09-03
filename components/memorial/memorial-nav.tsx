"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Share2, Heart, Plus, Check, ChevronRight } from "lucide-react"
import { ContributionType } from "./contribute-modal"

export type MemorialTab = "overview" | "life" | "memories" | "photos" | "people"

interface MemorialNavProps {
  slug: string
  fullName: string
  birthYear?: number | null
  deathYear?: number | null
  activeTab: MemorialTab
  onSelectTab: (tab: MemorialTab) => void
  onOpenContribute: (type?: ContributionType) => void
}

export function MemorialNav({
  slug,
  fullName,
  birthYear,
  deathYear,
  activeTab,
  onSelectTab,
  onOpenContribute,
}: MemorialNavProps) {
  const [copied, setCopied] = useState(false)
  const [isRemembered, setIsRemembered] = useState(false)
  const [isScrolledPastHero, setIsScrolledPastHero] = useState(false)

  const firstName = fullName.split(" ")[0] || fullName
  const yearSpan = birthYear && deathYear ? `${birthYear}–${deathYear}` : ""

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : `https://theirs.page/${slug}`
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 280) {
        setIsScrolledPastHero(true)
      } else {
        setIsScrolledPastHero(false)
      }
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const tabs: { id: MemorialTab; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "life", label: "Life" },
    { id: "memories", label: "Memories" },
    { id: "photos", label: "Photos" },
    { id: "people", label: "People" },
  ]

  return (
    <>
      {/* Top Floating Brand Capsule (Standard Home link + Quick Actions) */}
      <header className="fixed top-3 inset-x-0 z-40 flex justify-center px-4 pointer-events-none">
        <div className="pointer-events-auto flex items-center justify-between gap-3 px-3.5 py-1.5 rounded-full bg-white/85 backdrop-blur-md border border-black/[0.08] shadow-xs max-w-2xl w-full transition-all">
          {/* Brand & Slug Pill */}
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-xs font-semibold tracking-tight text-[#181925] hover:opacity-80 transition-opacity select-none"
            >
              <span className="size-1.5 rounded-full bg-primary" />
              <span>theirs</span>
            </Link>
            <span className="text-black/[0.15]">/</span>
            <span className="text-xs font-mono text-[#666] truncate max-w-[120px] sm:max-w-[180px]">
              {slug}
            </span>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-[#555] hover:text-[#181925] hover:bg-neutral-100 transition-colors cursor-pointer select-none"
              aria-label="Share memorial link"
            >
              {copied ? (
                <>
                  <Check className="size-3.5 text-emerald-600" />
                  <span className="text-emerald-600 font-medium text-[11px]">Copied</span>
                </>
              ) : (
                <>
                  <Share2 className="size-3.5 text-[#888]" />
                  <span className="hidden sm:inline text-[11px]">Share</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => onOpenContribute()}
              className="inline-flex items-center justify-center gap-1 whitespace-nowrap !rounded-full font-medium transition-all cursor-pointer border border-[color-mix(in_srgb,var(--primary)_80%,#3a3480)] bg-[color-mix(in_srgb,var(--primary)_90%,#3a3480)] text-primary-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.22),inset_0_-1px_0_rgba(58,52,128,0.30)] transform-gpu hover:bg-primary active:scale-[0.98] h-7.5 px-3 text-xs select-none"
            >
              <Plus className="size-3" />
              <span>Add to memorial</span>
            </button>
          </div>
        </div>
      </header>

      {/* Sticky Memorial-Level Hub Navigation Bar */}
      <nav
        aria-label="Memorial sections"
        className="sticky top-16 z-30 w-full px-3 sm:px-4 py-2 pointer-events-none flex justify-center"
      >
        <div className="pointer-events-auto flex items-center justify-between gap-2 sm:gap-4 px-2.5 sm:px-4 py-1.5 rounded-2xl bg-white/90 backdrop-blur-xl border border-black/[0.08] shadow-[0_4px_20px_rgba(0,0,0,0.04)] max-w-4xl w-full">
          
          {/* Left: Identity (Reveals smoothly when scrolled past hero, or sits quietly) */}
          <div
            className={`hidden md:flex items-center gap-2 pr-3 border-r border-black/[0.06] transition-all duration-300 ${
              isScrolledPastHero ? "opacity-100 max-w-[200px]" : "opacity-75 max-w-[160px]"
            }`}
          >
            <span className="font-serif font-medium text-[#181925] text-sm truncate">
              {fullName}
            </span>
            {yearSpan && (
              <span className="text-[10px] font-mono text-[#888] shrink-0">
                {yearSpan}
              </span>
            )}
          </div>

          {/* Center: The 5 Memorial Navigation Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5 flex-1 justify-start md:justify-center">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    onSelectTab(tab.id)
                    // If scrolled down, softly scroll up to tab anchor
                    if (window.scrollY > 400) {
                      window.scrollTo({ top: 320, behavior: "smooth" })
                    }
                  }}
                  className={`relative px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all select-none cursor-pointer ${
                    isActive
                      ? "text-[#181925] bg-[#f2f2f4] font-semibold shadow-2xs"
                      : "text-[#666] hover:text-[#181925] hover:bg-neutral-50"
                  }`}
                >
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>

          {/* Right: Persistent Contextual Actions */}
          <div className="flex items-center gap-1.5 shrink-0 pl-1 sm:pl-3 border-l border-black/[0.06]">
            {/* Heart Tribute */}
            <button
              type="button"
              onClick={() => setIsRemembered(!isRemembered)}
              className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                isRemembered
                  ? "bg-rose-50 text-rose-600 border border-rose-100"
                  : "text-[#666] hover:text-rose-600 hover:bg-neutral-50"
              }`}
              title={`Remember ${firstName}`}
            >
              <Heart
                className={`size-3.5 transition-colors ${
                  isRemembered ? "fill-rose-600 text-rose-600" : ""
                }`}
              />
              <span className="hidden lg:inline text-[11px]">
                {isRemembered ? "Remembered" : `Remember ${firstName}`}
              </span>
            </button>

            {/* Contextual "+ Add" Action */}
            <button
              type="button"
              onClick={() => onOpenContribute()}
              className="inline-flex items-center justify-center gap-1 rounded-full bg-[#181925] hover:bg-[#252736] text-white active:scale-95 h-7.5 px-3 text-xs font-medium transition-all select-none cursor-pointer shadow-xs"
            >
              <Plus className="size-3" />
              <span className="hidden sm:inline">Add</span>
            </button>
          </div>

        </div>
      </nav>
    </>
  )
}
