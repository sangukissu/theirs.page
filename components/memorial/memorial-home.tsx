"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { MemorialHero } from "./memorial-hero"
import { MemorialStory } from "./memorial-story"
import { MemoriesStream } from "./memories-stream"
import { LifeTimeline } from "./life-timeline"
import { MemorialGallery } from "./memorial-gallery"
import { LifeStories } from "./life-stories"
import { LegacyHashRedirect } from "./legacy-hash-redirect"
import { useMemorialActions } from "./memorial-shell"
import { ThemeDivider } from "./memorial-theme-decorations"
import { isValidThemeId, type MemorialThemeId } from "@/lib/memorial/themes"
import { DEMO_COVER_PRESETS, type DemoCoverPreset } from "./demo-cover-presets"
import type { MemorialHomeData, MemorialIdentity } from "@/types/memorial-view"

type SectionMarkKind = "tributes" | "timeline" | "gallery" | "memories"

function SectionMark({ kind }: { kind: SectionMarkKind }) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.45,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  }

  return (
    <svg viewBox="0 0 52 38" aria-hidden="true" className="h-9 w-12 overflow-visible">
      {kind === "tributes" && <><path {...common} d="M26 34c-.3-8.5-.2-15.2 0-21" /><path {...common} d="M26 14c-7-1.4-8.8-8.7-3.4-10.1 2.8-.7 4 2.2 3.4 5.2-.6-3 1.6-6.3 4.7-5.1 5.2 2 2.8 8.8-4.7 10Z" /><path {...common} d="M25.8 24c-4.8-4-9.5-3-11.1 1.2 4.2 1.7 8.1 1 11.1-1.2ZM26.1 28c4.4-3.7 8.6-2.8 10 1-3.8 1.5-7.3.9-10-1Z" /></>}
      {kind === "timeline" && <><path {...common} d="M4 29c8-16 15 5 24-10S40 6 48 8" /><circle {...common} cx="5" cy="28" r="2.4" /><circle {...common} cx="27" cy="20" r="2.4" /><circle {...common} cx="47" cy="8" r="2.4" /></>}
      {kind === "gallery" && <><rect {...common} x="6" y="8" width="32" height="23" rx="2.5" /><path {...common} d="m9 27 8-8 6 5 5-4 7 7" /><circle {...common} cx="29" cy="15" r="2.5" /><path {...common} d="M13 5h31a2 2 0 0 1 2 2v21" /></>}
      {kind === "memories" && <><path {...common} d="M9 31c8-2 17-9 24-21 2.5-4.2 6.3-5.8 10-5-1 4.1-3.2 7.5-6.5 10.2-7.4 6-16 10.6-27.5 15.8Z" /><path {...common} d="M16 27c7-3.6 13.7-8.5 20-14.6M12 33h25" /></>}
    </svg>
  )
}

function ViewFullSection({ href, kind, children }: { href: string; kind: SectionMarkKind; children: React.ReactNode }) {
  return (
    <div className="mx-auto -mt-5 max-w-4xl px-4 pb-5 sm:-mt-7">
      <div className="relative flex justify-center pt-2">
        <div aria-hidden="true" className="absolute inset-x-0 bottom-[13px] border-t border-dashed border-[var(--theme-accent)]/30" />
        <Link
          href={href}
          prefetch
          className="group relative z-10 flex flex-col items-center bg-[var(--theme-bg-page)] px-5 text-[var(--theme-accent)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-accent)]/35 focus-visible:ring-offset-4 rounded-full transition-colors"
        >
          <span className="mb-1 transition-transform duration-200 group-hover:-translate-y-0.5"><SectionMark kind={kind} /></span>
          <span className="bg-[var(--theme-bg-page)] px-2 text-xs font-semibold tracking-tight group-hover:underline group-hover:underline-offset-4">
            {children} <span aria-hidden="true">&rarr;</span>
          </span>
        </Link>
      </div>
    </div>
  )
}

export function MemorialHome({ identity, data }: { identity: MemorialIdentity; data: MemorialHomeData }) {
  const { openContribute } = useMemorialActions()
  const searchParams = useSearchParams()
  const sections = identity.sectionSettings
  const remaining = (total: number, shown: number) => Math.max(0, total - shown)

  const themeQueryParam = searchParams.get("theme")
  const initialTheme: MemorialThemeId = (isValidThemeId(themeQueryParam) ? themeQueryParam : identity.theme) || "quiet"
  const [currentTheme, setCurrentTheme] = useState<MemorialThemeId>(initialTheme)

  // Curated demo cover selection (Heritage Lines, Sanctuary Arch, Dither, Soft Aura, Misty Coastline, Highland Heather, Still Waters, Artisan Workshop)
  const [activeCover, setActiveCover] = useState<DemoCoverPreset | null>(() => {
    if (!identity.isDemo) return null
    const match = DEMO_COVER_PRESETS.find(
      (p) =>
        (p.settings.pattern_style && p.settings.pattern_style === identity.coverSettings?.pattern_style) ||
        (p.settings.cover_url && p.settings.cover_url === identity.coverSettings?.cover_url)
    )
    return match || DEMO_COVER_PRESETS[0]
  })

  const [currentCoverSettings, setCurrentCoverSettings] = useState(
    identity.coverSettings || (identity.isDemo ? DEMO_COVER_PRESETS[0].settings : null)
  )

  useEffect(() => {
    if (isValidThemeId(themeQueryParam)) {
      setCurrentTheme(themeQueryParam)
    }
  }, [themeQueryParam])

  useEffect(() => {
    if (!identity.isDemo) return
    const onDemoThemeChange = (e: Event) => {
      const detail = (e as CustomEvent).detail
      if (detail?.theme && isValidThemeId(detail.theme)) {
        setCurrentTheme(detail.theme)
      }
      if (detail?.cover?.settings) {
        setCurrentCoverSettings(detail.cover.settings)
      }
    }
    window.addEventListener("theirs_demo_theme_changed", onDemoThemeChange)
    return () => window.removeEventListener("theirs_demo_theme_changed", onDemoThemeChange)
  }, [identity.isDemo])

  const viewHref = (view: string, hash = "") => {
    const params = new URLSearchParams()
    if (searchParams.get("preview") === "visitor") params.set("preview", "visitor")
    if (identity.isDemo && currentTheme) params.set("theme", currentTheme)
    const q = params.toString() ? `?${params.toString()}` : ""
    return `/${identity.slug}/${view}${q}${hash}`
  }

  return (
    <>
      <LegacyHashRedirect slug={identity.slug} />

      <MemorialHero
        fullName={identity.fullName}
        preferredName={identity.preferredName}
        birthYear={identity.birthYear}
        deathYear={identity.deathYear}
        location={identity.location}
        epitaph={identity.epitaph}
        portraitUrl={identity.portraitUrl}
        isDemo={identity.isDemo}
        themeId={currentTheme}
        coverSettings={currentCoverSettings}
        onOpenContribute={openContribute}
      />

      <ThemeDivider themeId={currentTheme} />

      <MemorialStory fullName={identity.fullName} biography={identity.biography} />

      <ThemeDivider themeId={currentTheme} />

      {sections.tributes !== false && (
        <>
          <MemoriesStream
            fullName={identity.fullName}
            memories={data.tributes.items}
            memorialId={identity.id}
            slug={identity.slug}
            isDemo={identity.isDemo}
            onOpenContribute={openContribute}
          />
          {data.tributes.hasMore ? (
            <ViewFullSection href={viewHref("tributes")} kind="tributes">
              View {remaining(data.tributes.total, data.tributes.items.length)} more tributes
            </ViewFullSection>
          ) : (
            <ThemeDivider themeId={currentTheme} />
          )}
        </>
      )}

      {sections.timeline !== false && (
        <>
          <LifeTimeline milestones={data.timeline.items} isDemo={identity.isDemo} />
          {data.timeline.hasMore ? (
            <ViewFullSection href={viewHref("timeline")} kind="timeline">
              Explore {remaining(data.timeline.total, data.timeline.items.length)} more milestones
            </ViewFullSection>
          ) : (
            <ThemeDivider themeId={currentTheme} />
          )}
        </>
      )}

      {sections.gallery !== false && (
        <>
          <MemorialGallery
            fullName={identity.fullName}
            items={data.media.items}
            isDemo={identity.isDemo}
            isPaid={identity.isPaid}
            accessRole={identity.accessRole}
            contributionSettings={identity.contributionSettings}
            onOpenContribute={openContribute}
            slug={identity.slug}
            initialPage={{ ...data.media, hasMore: false, nextCursor: null }}
            hideAllTab
            initialFilter="photo"
            pageSize={6}
          />
          {data.media.hasMore ? (
            <ViewFullSection href={viewHref("gallery")} kind="gallery">
              View {remaining(data.media.total, data.media.items.length)} more photos & recordings
            </ViewFullSection>
          ) : (
            <ThemeDivider themeId={currentTheme} />
          )}
        </>
      )}

      {sections.stories !== false && (
        <>
          <LifeStories
            fullName={identity.fullName}
            stories={data.memories.items}
            memorialId={identity.id}
            slug={identity.slug}
            isDemo={identity.isDemo}
            onOpenContribute={openContribute}
          />
          {data.memories.hasMore ? (
            <ViewFullSection href={viewHref("memories")} kind="memories">
              Read {remaining(data.memories.total, data.memories.items.length)} more stories & memories
            </ViewFullSection>
          ) : (
            <ThemeDivider themeId={currentTheme} />
          )}
        </>
      )}
    </>
  )
}
