"use client"

import { useState } from "react"
import { MemorialNav } from "@/components/memorial/memorial-nav"
import { MemorialHero } from "@/components/memorial/memorial-hero"
import { MemorialStory } from "@/components/memorial/memorial-story"
import { MemoriesStream, MemoryItem } from "@/components/memorial/memories-stream"
import { LifeTimeline, TimelineMilestone } from "@/components/memorial/life-timeline"
import { MemorialGallery, GalleryItem } from "@/components/memorial/memorial-gallery"
import { LifeStories, StoryItem } from "@/components/memorial/life-stories"
import { MemorialFooter } from "@/components/memorial/memorial-footer"
import { ContributeModal, ContributionType } from "@/components/memorial/contribute-modal"
import { SectionSettings } from "@/types/theirs"

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
  sectionSettings?: SectionSettings | null
  memoriesCount?: number
  photosCount?: number
  contributorsCount?: number
  mediaItems?: GalleryItem[]
  timelineEvents?: TimelineMilestone[]
  memories?: MemoryItem[]
  tributes?: MemoryItem[]
  stories?: StoryItem[]
}

export function MemorialClientView({ data }: { data: MemorialData }) {
  const [isContributeOpen, setIsContributeOpen] = useState(false)
  const [contributeType, setContributeType] = useState<ContributionType | null>(null)

  const handleOpenContribute = (type?: ContributionType) => {
    setContributeType(type || null)
    setIsContributeOpen(true)
  }

  const sections = data.sectionSettings || {
    story: true,
    tributes: true,
    timeline: true,
    gallery: true,
    stories: true,
  }

  return (
    <main className="min-h-screen bg-white text-[#555] selection:bg-primary/10 selection:text-primary relative pb-16">
      {/* 1. Top Section Navigation Bar (Fixed at top) */}
      <MemorialNav
        slug={data.slug}
        fullName={data.fullName}
        birthYear={data.birthYear}
        deathYear={data.deathYear}
        sectionSettings={sections}
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
        onOpenContribute={handleOpenContribute}
      />

      {/* 3. The Full Editorial Biography / Story */}
      {sections.story !== false && (
        <MemorialStory
          fullName={data.fullName}
          biography={data.biography}
          isDemo={data.isDemo}
        />
      )}

      {/* 4. The Collaborative Tributes Stream (Flowers, Candles, Condolence notes) */}
      {sections.tributes !== false && (
        <MemoriesStream
          fullName={data.fullName}
          memories={data.tributes || data.memories}
          memorialId={data.id}
          slug={data.slug}
          isDemo={data.isDemo}
          onOpenContribute={handleOpenContribute}
        />
      )}

      {/* 5. Life Timeline Chapters (Full chronological journey) */}
      {sections.timeline !== false && (
        <LifeTimeline
          milestones={data.timelineEvents}
          isDemo={data.isDemo}
        />
      )}

      {/* 6. Unified Media Gallery (Photos, Audio recordings & Home video clips) */}
      {sections.gallery !== false && (
        <MemorialGallery
          fullName={data.fullName}
          items={data.mediaItems}
          isDemo={data.isDemo}
          isPaid={data.isPaid}
          onOpenContribute={handleOpenContribute}
        />
      )}

      {/* 7. Dedicated Life Stories & Memories (Personal narratives & photo anecdotes - AFTER GALLERY) */}
      {sections.stories !== false && (
        <LifeStories
          fullName={data.fullName}
          stories={data.stories}
          memorialId={data.id}
          slug={data.slug}
          isDemo={data.isDemo}
          onOpenContribute={handleOpenContribute}
        />
      )}

      {/* 8. Permanent Stewardship Footer */}
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
