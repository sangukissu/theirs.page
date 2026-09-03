"use client"

import { useState } from "react"
import { MemorialNav } from "@/components/memorial/memorial-nav"
import { MemorialHero } from "@/components/memorial/memorial-hero"
import { MemorialStory } from "@/components/memorial/memorial-story"
import { MemorialAudio } from "@/components/memorial/memorial-audio"
import { MemoriesStream } from "@/components/memorial/memories-stream"
import { LifeTimeline } from "@/components/memorial/life-timeline"
import { MemorialGallery } from "@/components/memorial/memorial-gallery"
import { PeopleInLife } from "@/components/memorial/people-in-life"
import { GuestbookStream } from "@/components/memorial/guestbook-stream"
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
  const [isContributeOpen, setIsContributeOpen] = useState(false)
  const [contributeType, setContributeType] = useState<ContributionType | null>(null)

  const handleOpenContribute = (type?: ContributionType) => {
    setContributeType(type || null)
    setIsContributeOpen(true)
  }

  const scrollToAudio = () => {
    const el = document.getElementById("voice")
    if (el) {
      el.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <main className="min-h-screen bg-white text-[#555] selection:bg-primary/10 selection:text-primary relative pb-16">
      {/* 1. Top Section Navigation Bar (Fixed at top) */}
      <MemorialNav
        slug={data.slug}
        fullName={data.fullName}
        birthYear={data.birthYear}
        deathYear={data.deathYear}
        onOpenContribute={handleOpenContribute}
      />

      {/* 2. Opening Hero & Identity Header (Who Robert was) */}
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

      {/* 3. The Full Editorial Biography / Story */}
      <MemorialStory
        fullName={data.fullName}
        biography={data.biography}
      />

      {/* 4. Preserved Audio Voice Note */}
      <MemorialAudio />

      {/* 5. The Collaborative Memories Stream (Filters, Reactions, Reading feed) */}
      <MemoriesStream
        fullName={data.fullName}
        onOpenContribute={handleOpenContribute}
      />

      {/* 6. Life Timeline Chapters (Full chronological journey) */}
      <LifeTimeline />

      {/* 7. Unified Media Gallery (Photos, Audio recordings & Home video) */}
      <MemorialGallery
        fullName={data.fullName}
        onOpenContribute={handleOpenContribute}
      />

      {/* 8. People in His Life (Connected circles, detail drawers) */}
      <PeopleInLife
        fullName={data.fullName}
        onOpenContribute={handleOpenContribute}
      />

      {/* 9. Dedicated Guestbook & Condolence Stream */}
      <GuestbookStream fullName={data.fullName} />

      {/* 10. Permanent Stewardship Footer */}
      <MemorialFooter
        fullName={data.fullName}
        slug={data.slug}
      />

      {/* 11. 5-Choice Contribution Chooser Modal */}
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
