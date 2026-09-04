"use client"

import { useState } from "react"
import { MemorialNav } from "@/components/memorial/memorial-nav"
import { MemorialHero } from "@/components/memorial/memorial-hero"
import { MemorialStory } from "@/components/memorial/memorial-story"
import { MemoriesStream, MemoryItem } from "@/components/memorial/memories-stream"
import { LifeTimeline, TimelineMilestone } from "@/components/memorial/life-timeline"
import { MemorialGallery, GalleryItem } from "@/components/memorial/memorial-gallery"
import { PeopleInLife, PersonConnection } from "@/components/memorial/people-in-life"
import { GuestbookStream, GuestbookNote } from "@/components/memorial/guestbook-stream"
import { MemorialFooter } from "@/components/memorial/memorial-footer"
import { ContributeModal, ContributionType } from "@/components/memorial/contribute-modal"

export interface MemorialData {
  slug: string
  fullName: string
  preferredName?: string | null
  birthYear?: number | null
  deathYear?: number | null
  location?: string | null
  epitaph?: string | null
  biography?: string | null
  portraitUrl?: string | null
  isDemo?: boolean
  memoriesCount?: number
  photosCount?: number
  contributorsCount?: number
  mediaItems?: GalleryItem[]
  timelineEvents?: TimelineMilestone[]
  people?: PersonConnection[]
  memories?: MemoryItem[]
  guestbook?: GuestbookNote[]
}

export function MemorialClientView({ data }: { data: MemorialData }) {
  const [isContributeOpen, setIsContributeOpen] = useState(false)
  const [contributeType, setContributeType] = useState<ContributionType | null>(null)

  const handleOpenContribute = (type?: ContributionType) => {
    setContributeType(type || null)
    setIsContributeOpen(true)
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

      {/* 2. Opening Hero & Identity Header */}
      <MemorialHero
        fullName={data.fullName}
        preferredName={data.preferredName}
        birthYear={data.birthYear}
        deathYear={data.deathYear}
        location={data.location}
        epitaph={data.epitaph}
        portraitUrl={data.portraitUrl}
        memoriesCount={data.memoriesCount ?? 0}
        photosCount={data.photosCount ?? 0}
        contributorsCount={data.contributorsCount ?? 0}
        onOpenContribute={() => handleOpenContribute()}
      />

      {/* 3. The Full Editorial Biography / Story */}
      <MemorialStory
        fullName={data.fullName}
        biography={data.biography}
        isDemo={data.isDemo}
      />

      {/* 4. The Collaborative Memories Stream (Filters, Reactions, Reading feed) */}
      <MemoriesStream
        fullName={data.fullName}
        memories={data.memories}
        isDemo={data.isDemo}
        onOpenContribute={handleOpenContribute}
      />

      {/* 5. Life Timeline Chapters (Full chronological journey) */}
      <LifeTimeline
        milestones={data.timelineEvents}
        isDemo={data.isDemo}
      />

      {/* 6. Unified Media Gallery (Photos, Audio recordings & Home video clips) */}
      <MemorialGallery
        fullName={data.fullName}
        items={data.mediaItems}
        isDemo={data.isDemo}
        onOpenContribute={handleOpenContribute}
      />

      {/* 7. People in Their Life (Connected circles) */}
      <PeopleInLife
        fullName={data.fullName}
        people={data.people}
        isDemo={data.isDemo}
        onOpenContribute={handleOpenContribute}
      />

      {/* 8. Dedicated Guestbook & Condolence Stream */}
      <GuestbookStream
        fullName={data.fullName}
        notes={data.guestbook}
        isDemo={data.isDemo}
        slug={data.slug}
      />

      {/* 9. Permanent Stewardship Footer */}
      <MemorialFooter
        fullName={data.fullName}
        slug={data.slug}
      />

      {/* Guest Contribution Modal */}
      <ContributeModal
        isOpen={isContributeOpen}
        onClose={() => setIsContributeOpen(false)}
        memorialName={data.fullName}
        slug={data.slug}
        initialType={contributeType}
      />
    </main>
  )
}
