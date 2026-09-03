"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { MemorialNav, MemorialTab } from "@/components/memorial/memorial-nav"
import { MemorialHero } from "@/components/memorial/memorial-hero"
import { OverviewView } from "@/components/memorial/overview-view"
import { LifeView } from "@/components/memorial/life-view"
import { MemoriesStream } from "@/components/memorial/memories-stream"
import { PhotoAlbums } from "@/components/memorial/photo-albums"
import { PeopleInLife } from "@/components/memorial/people-in-life"
import { MemorialFooter } from "@/components/memorial/memorial-footer"
import { ContributeModal, ContributionType } from "@/components/memorial/contribute-modal"

interface MemorialData {
  slug: string
  fullName: string
  preferredName?: string | null
  birthYear?: number | null
  deathYear?: number | null
  location?: string | null
  epitaph?: string | null
  biography?: string | null
  portraitUrl?: string | null
}

export function MemorialClientView({ data }: { data: MemorialData }) {
  const searchParams = useSearchParams()
  const router = useRouter()

  // Initialize active tab from URL query if present, otherwise default to "overview"
  const tabParam = searchParams.get("tab") as MemorialTab | null
  const validTabs: MemorialTab[] = ["overview", "life", "memories", "photos", "people"]
  const initialTab: MemorialTab = tabParam && validTabs.includes(tabParam) ? tabParam : "overview"

  const [activeTab, setActiveTab] = useState<MemorialTab>(initialTab)
  const [isContributeOpen, setIsContributeOpen] = useState(false)
  const [contributeType, setContributeType] = useState<ContributionType | null>(null)

  // Sync tab with URL without full reload
  const handleSelectTab = (tab: MemorialTab) => {
    setActiveTab(tab)
    const newUrl = tab === "overview" ? `/${data.slug}` : `/${data.slug}?tab=${tab}`
    window.history.replaceState(null, "", newUrl)
  }

  const handleOpenContribute = (type?: ContributionType) => {
    setContributeType(type || null)
    setIsContributeOpen(true)
  }

  const scrollToAudio = () => {
    if (activeTab !== "overview") {
      setActiveTab("overview")
    }
    setTimeout(() => {
      const el = document.getElementById("voice")
      if (el) {
        el.scrollIntoView({ behavior: "smooth" })
      }
    }, 100)
  }

  return (
    <main className="min-h-screen bg-white text-[#555] selection:bg-primary/10 selection:text-primary relative pb-16">
      {/* Floating Capsule Header + Sticky Memorial Section Navigation */}
      <MemorialNav
        slug={data.slug}
        fullName={data.fullName}
        birthYear={data.birthYear}
        deathYear={data.deathYear}
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        onOpenContribute={handleOpenContribute}
      />

      {/* Identity Hero (Featured prominently on Overview, and accessible as identity anchor) */}
      {activeTab === "overview" ? (
        <MemorialHero
          fullName={data.fullName}
          preferredName={data.preferredName}
          birthYear={data.birthYear}
          deathYear={data.deathYear}
          location={data.location}
          epitaph={data.epitaph}
          portraitUrl={data.portraitUrl}
          onOpenContribute={() => handleOpenContribute()}
          onScrollToAudio={scrollToAudio}
        />
      ) : (
        /* Compact Identity Header for Sub-Sections */
        <div className="pt-24 sm:pt-28 pb-4 px-4 max-w-4xl mx-auto flex items-center justify-between border-b border-black/[0.05]">
          <div className="flex items-center gap-3">
            <div
              onClick={() => handleSelectTab("overview")}
              className="size-10 sm:size-12 rounded-xl overflow-hidden bg-neutral-100 border border-black/[0.08] shrink-0 cursor-pointer"
            >
              <img
                src={data.portraitUrl || "/memorial-family-portrait-grandfather.jpg"}
                alt={data.fullName}
                className="size-full object-cover grayscale contrast-105"
              />
            </div>
            <div className="flex flex-col">
              <button
                type="button"
                onClick={() => handleSelectTab("overview")}
                className="text-base sm:text-lg font-serif font-medium text-[#181925] hover:text-primary transition-colors text-left"
              >
                {data.fullName}
              </button>
              <span className="text-[11px] font-mono text-[#888]">
                {data.birthYear && data.deathYear ? `${data.birthYear} — ${data.deathYear}` : "Memorial"} · {data.location || "Devon, England"}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleSelectTab("overview")}
            className="text-xs text-primary font-medium hover:underline cursor-pointer hidden sm:inline"
          >
            ← Back to Overview
          </button>
        </div>
      )}

      {/* Dynamic Tab Views */}
      <div className="w-full">
        {activeTab === "overview" && (
          <OverviewView
            fullName={data.fullName}
            biography={data.biography}
            onSelectTab={handleSelectTab}
            onOpenContribute={handleOpenContribute}
          />
        )}

        {activeTab === "life" && (
          <LifeView
            fullName={data.fullName}
            biography={data.biography}
            onOpenContribute={handleOpenContribute}
          />
        )}

        {activeTab === "memories" && (
          <MemoriesStream
            fullName={data.fullName}
            onOpenContribute={handleOpenContribute}
          />
        )}

        {activeTab === "photos" && (
          <PhotoAlbums
            fullName={data.fullName}
            onOpenContribute={handleOpenContribute}
          />
        )}

        {activeTab === "people" && (
          <PeopleInLife
            fullName={data.fullName}
            onOpenContribute={handleOpenContribute}
          />
        )}
      </div>

      {/* Permanent Stewardship Footer */}
      <MemorialFooter fullName={data.fullName} slug={data.slug} />

      {/* 5-Choice Contribution Modal */}
      <ContributeModal
        isOpen={isContributeOpen}
        onClose={() => {
          setIsContributeOpen(false)
          setContributeType(null)
        }}
        memorialName={data.fullName}
        slug={data.slug}
        initialType={contributeType}
      />
    </main>
  )
}
