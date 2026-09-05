"use client"

import { createContext, useContext, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { MemorialNav } from "./memorial-nav"
import { MemorialFooter } from "./memorial-footer"
import { ContributeModal, type ContributionType } from "./contribute-modal"
import type { MemorialIdentity } from "@/types/memorial-view"

interface MemorialActions { openContribute: (type?: ContributionType, photoUrl?: string, photoTitle?: string) => void }
const MemorialActionsContext = createContext<MemorialActions | null>(null)

export function useMemorialActions() {
  const value = useContext(MemorialActionsContext)
  if (!value) throw new Error("useMemorialActions must be used inside MemorialShell")
  return value
}

export function MemorialShell({ identity, children }: { identity: MemorialIdentity; children: React.ReactNode }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isOpen, setIsOpen] = useState(false)
  const [type, setType] = useState<ContributionType | null>(null)
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [photoTitle, setPhotoTitle] = useState<string | null>(null)
  const openContribute = (nextType?: ContributionType, nextPhotoUrl?: string, nextPhotoTitle?: string) => {
    setType(nextType || null); setPhotoUrl(nextPhotoUrl || null); setPhotoTitle(nextPhotoTitle || null); setIsOpen(true)
  }
  const closeContribute = () => { setIsOpen(false); setPhotoUrl(null); setPhotoTitle(null) }
  const visitorPreview = identity.isOwner && searchParams.get("preview") === "visitor"
  const draftPreview = identity.status === "draft" && identity.isOwner && !visitorPreview

  return (
    <MemorialActionsContext.Provider value={{ openContribute }}>
      <main className="min-h-screen bg-white text-[#555] selection:bg-primary/10 selection:text-primary relative pb-10 sm:pb-16">
        {draftPreview && (
          <div className="bg-amber-500 text-black px-4 py-2 text-xs font-medium text-center sticky top-0 z-50 shadow-xs flex items-center justify-center gap-2">
            <span>⚠️ <strong>Draft Preview Mode</strong> — This memorial is private and not yet published to visitors.</span>
            <Link href={`/dashboard/memorials/${identity.id}/editor`} className="underline font-bold hover:text-black/80">
              Publish in Settings →
            </Link>
          </div>
        )}
        <MemorialNav
          slug={identity.slug}
          fullName={identity.fullName}
          birthYear={identity.birthYear}
          deathYear={identity.deathYear}
          sectionSettings={identity.sectionSettings}
          onOpenContribute={openContribute}
          hasTopBanner={Boolean(draftPreview)}
        />
        {children}
        <MemorialFooter />
        {visitorPreview && (
          <div className="fixed bottom-5 right-5 z-50 bg-[#181925]/95 text-white px-4 py-2.5 rounded-full shadow-2xl text-xs font-sans flex items-center gap-3 border border-white/20 backdrop-blur-md animate-in fade-in slide-in-from-bottom-3 select-none">
            <span className="flex items-center gap-1.5 font-medium"><span className="size-2 rounded-full bg-emerald-400 animate-pulse" />Viewing as visitor</span>
            <span className="text-white/30">|</span>
            <Link href={`/dashboard/memorials/${identity.id}/editor`} className="text-neutral-300 hover:text-white underline font-semibold transition-colors">
              Back to editor →
            </Link>
          </div>
        )}
        <ContributeModal
          isOpen={isOpen}
          onClose={closeContribute}
          onSubmitted={() => router.refresh()}
          memorialName={identity.fullName}
          slug={identity.slug}
          memorialId={identity.id}
          isPaid={identity.isPaid}
          photoCount={identity.photoCount}
          contributionSettings={identity.contributionSettings}
          initialType={type}
          initialPhotoUrl={photoUrl}
          initialPhotoTitle={photoTitle}
        />
      </main>
    </MemorialActionsContext.Provider>
  )
}
