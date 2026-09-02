"use client"

import { useState } from "react"
import { MemorialNav } from "@/components/memorial/memorial-nav"
import { MemorialHero } from "@/components/memorial/memorial-hero"
import { MemorialAudio } from "@/components/memorial/memorial-audio"
import { MemorialStory } from "@/components/memorial/memorial-story"
import { MemoriesStream } from "@/components/memorial/memories-stream"
import { LifeTimeline } from "@/components/memorial/life-timeline"
import { PhotoAlbums } from "@/components/memorial/photo-albums"
import { PeopleInLife } from "@/components/memorial/people-in-life"
import { MemorialFooter } from "@/components/memorial/memorial-footer"
import { ContributeModal } from "@/components/memorial/contribute-modal"

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

  const scrollToAudio = () => {
    const el = document.getElementById("voice")
    if (el) {
      el.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <main className="min-h-screen bg-white text-[#555] selection:bg-primary/10 selection:text-primary relative">
      {/* Floating Capsule Header */}
      <MemorialNav
        slug={data.slug}
        fullName={data.fullName}
        onOpenContribute={() => setIsContributeOpen(true)}
      />

      {/* Opening Hero & Identity */}
      <MemorialHero
        fullName={data.fullName}
        preferredName={data.preferredName}
        birthYear={data.birthYear}
        deathYear={data.deathYear}
        location={data.location}
        epitaph={data.epitaph}
        portraitUrl={data.portraitUrl}
        onOpenContribute={() => setIsContributeOpen(true)}
        onScrollToAudio={scrollToAudio}
      />

      {/* Preserved Audio Voicemail */}
      <MemorialAudio />

      {/* The Story / Editorial Biography */}
      <MemorialStory fullName={data.fullName} biography={data.biography} />

      {/* The Collaborative Memories Stream */}
      <MemoriesStream onOpenContribute={() => setIsContributeOpen(true)} />

      {/* Life Timeline Chapters */}
      <LifeTimeline />

      {/* Thematic Photographs & Albums */}
      <PhotoAlbums />

      {/* People in His Life */}
      <PeopleInLife />

      {/* Permanent Stewardship Footer */}
      <MemorialFooter fullName={data.fullName} slug={data.slug} />

      {/* Frictionless 0-Login Contribution Modal */}
      <ContributeModal
        isOpen={isContributeOpen}
        onClose={() => setIsContributeOpen(false)}
        memorialName={data.fullName}
        slug={data.slug}
      />
    </main>
  )
}
