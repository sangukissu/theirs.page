"use client"

import { createContext, useContext, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { MemorialNav } from "./memorial-nav"
import { MemorialFooter } from "./memorial-footer"
import { ContributeModal, type ContributionType } from "./contribute-modal"
import { MemorialShareModal } from "./memorial-share-modal"
import type { MemorialIdentity } from "@/types/memorial-view"
import { isValidThemeId, type MemorialThemeId } from "@/lib/memorial/themes"
import { MemorialThemeSwitcher } from "./memorial-theme-switcher"
import { DEMO_COVER_PRESETS, getRandomCoverPreset, type DemoCoverPreset } from "./demo-cover-presets"

interface MemorialActions {
  openContribute: (
    type?: ContributionType,
    photoUrl?: string,
    photoTitle?: string,
    mediaId?: string
  ) => void
  openShare: () => void
}
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
  const [isShareOpen, setIsShareOpen] = useState(false)
  const [type, setType] = useState<ContributionType | null>(null)
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [photoTitle, setPhotoTitle] = useState<string | null>(null)
  const [mediaId, setMediaId] = useState<string | null>(null)
  const openContribute = (nextType?: ContributionType, nextPhotoUrl?: string, nextPhotoTitle?: string, nextMediaId?: string) => {
    if (nextType === "memory" && !nextPhotoUrl && !nextMediaId) {
      router.push(`/${identity.slug}/memories#share-memory`)
      return
    }
    setType(nextType || null); setPhotoUrl(nextPhotoUrl || null); setPhotoTitle(nextPhotoTitle || null); setMediaId(nextMediaId || null); setIsOpen(true)
  }
  const closeContribute = () => { setIsOpen(false); setPhotoUrl(null); setPhotoTitle(null); setMediaId(null) }
  const openShare = () => setIsShareOpen(true)
  const closeShare = () => setIsShareOpen(false)

  const visitorPreview = identity.isOwner && searchParams.get("preview") === "visitor"
  const draftPreview = identity.status === "draft" && identity.isOwner && !visitorPreview

  const themeQueryParam = searchParams.get("theme")
  const activeTheme: MemorialThemeId = (isValidThemeId(themeQueryParam) ? themeQueryParam : identity.theme) || "quiet"
  const [shellTheme, setShellTheme] = useState<MemorialThemeId>(activeTheme)
  const [demoCover, setDemoCover] = useState<DemoCoverPreset>(() => {
    const match = DEMO_COVER_PRESETS.find(
      (p) =>
        (p.settings.pattern_style && p.settings.pattern_style === identity.coverSettings?.pattern_style) ||
        (p.settings.cover_url && p.settings.cover_url === identity.coverSettings?.cover_url)
    )
    return match || DEMO_COVER_PRESETS[0]
  })

  useEffect(() => {
    if (isValidThemeId(themeQueryParam)) {
      setShellTheme(themeQueryParam)
    } else if (identity.theme) {
      setShellTheme(identity.theme)
    }
  }, [themeQueryParam, identity.theme])

  const handleDemoThemeChange = (nextTheme: MemorialThemeId) => {
    setShellTheme(nextTheme)
    const nextCover = getRandomCoverPreset(demoCover.id)
    setDemoCover(nextCover)

    if (typeof document !== "undefined") {
      document.cookie = `theirs_demo_theme=${nextTheme}; path=/; max-age=604800; SameSite=Lax`
      document.cookie = `theirs_demo_cover=${nextCover.id}; path=/; max-age=604800; SameSite=Lax`
      const mainEl = document.querySelector<HTMLElement>("main[data-memorial-theme]")
      if (mainEl) {
        mainEl.setAttribute("data-memorial-theme", nextTheme)
      }
    }

    if (typeof window !== "undefined") {
      const url = new URL(window.location.href)
      url.searchParams.set("theme", nextTheme)
      window.history.replaceState(null, "", url.toString())
      window.dispatchEvent(
        new CustomEvent("theirs_demo_theme_changed", {
          detail: { theme: nextTheme, cover: nextCover },
        })
      )
    }
  }

  useEffect(() => {
    const refreshPublishedReceipt = () => router.refresh()
    window.addEventListener("theirs_receipt_published", refreshPublishedReceipt)
    return () => window.removeEventListener("theirs_receipt_published", refreshPublishedReceipt)
  }, [router])

  return (
    <MemorialActionsContext.Provider value={{ openContribute, openShare }}>
      <main
        data-memorial-theme={identity.isDemo ? shellTheme : activeTheme}
        className="theirs-theme-root min-h-screen bg-[var(--theme-bg-page)] text-[var(--theme-text-body)] selection:bg-[var(--theme-accent)]/15 selection:text-[var(--theme-accent)] relative pb-10 transition-colors duration-200"
      >
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
          onOpenShare={openShare}
          hasTopBanner={Boolean(draftPreview)}
        />
        {children}
        <MemorialFooter
          fullName={identity.fullName}
          caretakerName={identity.caretakerName || undefined}
          caretakerRelationship={identity.caretakerRelationship || undefined}
        />
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
          currentUserId={identity.viewerUserId}
          accessRole={identity.accessRole}
          photoCount={identity.photoCount}
          contributionSettings={identity.contributionSettings}
          initialType={type}
          initialPhotoUrl={photoUrl}
          initialPhotoTitle={photoTitle}
          initialMediaId={mediaId}
        />
        <MemorialShareModal
          isOpen={isShareOpen}
          onClose={closeShare}
          fullName={identity.fullName}
          slug={identity.slug}
          portraitUrl={identity.portraitUrl}
          birthYear={identity.birthYear}
          deathYear={identity.deathYear}
          themeId={identity.isDemo ? shellTheme : activeTheme}
        />
        {identity.isDemo && (
          <MemorialThemeSwitcher
            currentTheme={shellTheme}
            currentCoverName={demoCover.name}
            onThemeChange={handleDemoThemeChange}
          />
        )}
      </main>
    </MemorialActionsContext.Provider>
  )
}
