"use client"

import { useState } from "react"
import { MemorialNav } from "@/components/memorial/memorial-nav"
import { MemorialHero } from "@/components/memorial/memorial-hero"
import { MemorialStory } from "@/components/memorial/memorial-story"
import { MemoriesStream, MemoryItem } from "@/components/memorial/memories-stream"
import { LifeTimeline, TimelineMilestone } from "@/components/memorial/life-timeline"
import { MemorialGallery, GalleryItem } from "@/components/memorial/memorial-gallery"
import { MemorialFooter } from "@/components/memorial/memorial-footer"
import { ContributeModal, ContributionType } from "@/components/memorial/contribute-modal"

export interface MemorialData {
  id?: string
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
  isPaid?: boolean
  memoriesCount?: number
  photosCount?: number
  contributorsCount?: number
  mediaItems?: GalleryItem[]
  timelineEvents?: TimelineMilestone[]
  memories?: MemoryItem[]
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
        memorialId={data.id}
        slug={data.slug}
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
        isPaid={data.isPaid}
        onOpenContribute={handleOpenContribute}
      />

      {/* 7. Permanent Stewardship Footer */}
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
        memorialId={data.id}
        isPaid={data.isPaid}
        photoCount={data.photosCount}
        initialType={contributeType}
      />
    </main>
  )
}
