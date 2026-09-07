"use client"

import { useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Image as ImageIcon, SlidersHorizontal, Sparkles, X } from "lucide-react"
import { MemorialBackdropHero } from "./memorial-backdrop-hero"
import { MemorialStory } from "./memorial-story"
import { MemoriesStream } from "./memories-stream"
import { LifeTimeline } from "./life-timeline"
import { MemorialGallery } from "./memorial-gallery"
import { LifeStories } from "./life-stories"
import { LegacyHashRedirect } from "./legacy-hash-redirect"
import { useMemorialActions } from "./memorial-shell"
import { ThemeDivider } from "./memorial-theme-decorations"
import type { MemorialHomeData, MemorialIdentity } from "@/types/memorial-view"
import type { MemorialThemeId } from "@/lib/memorial/themes"

const SAMPLE_COVERS = [
  {
    id: "workshop",
    label: "Horology Workshop",
    subtitle: "Devon clocks & woodcraft",
    url: "https://images.unsplash.com/photo-1584824486509-112e4181ff6b?q=80&w=2070&auto=format&fit=crop",
    focalY: 35,
  },
  {
    id: "coast",
    label: "Devon Coastline",
    subtitle: "Sea cliffs & morning mist",
    url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2070&auto=format&fit=crop",
    focalY: 40,
  },
  {
    id: "garden",
    label: "English Cottage Garden",
    subtitle: "Daisies, ferns & sunlight",
    url: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?q=80&w=2064&auto=format&fit=crop",
    focalY: 25,
  },
  {
    id: "tree",
    label: "Heirloom Tree",
    subtitle: "Local tree illustration",
    url: "/icons/cover-tree.webp",
    focalY: 50,
  },
  {
    id: "none",
    label: "None (Default Clean)",
    subtitle: "Standard minimal hero",
    url: null,
    focalY: 50,
  },
]

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
        <div aria-hidden="true" className="absolute inset-x-0 bottom-[13px] border-t border-dashed border-[var(--theme-border)] opacity-30" />
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

export function MemorialBackdropHome({
  identity,
  data,
}: {
  identity: MemorialIdentity
  data: MemorialHomeData
}) {
  const { openContribute } = useMemorialActions()
  const searchParams = useSearchParams()
  const preview = searchParams.get("preview") === "visitor" ? "?preview=visitor" : ""
  const viewHref = (view: string, hash = "") => `/${identity.slug}/${view}${preview}${hash}`
  const sections = identity.sectionSettings

  // Interactive Backdrop State
  const [selectedCoverIndex, setSelectedCoverIndex] = useState<number>(0)
  const [washOpacity, setWashOpacity] = useState<number>(0.32)
  const [useRadialVignette, setUseRadialVignette] = useState<boolean>(true)
  const [focalY, setFocalY] = useState<number>(SAMPLE_COVERS[0].focalY)
  const [activeTheme, setActiveTheme] = useState<MemorialThemeId>(identity.theme || "quiet")
  const [isPanelOpen, setIsPanelOpen] = useState<boolean>(true)

  const currentCover = SAMPLE_COVERS[selectedCoverIndex]

  const handleSelectCover = (index: number) => {
    setSelectedCoverIndex(index)
    setFocalY(SAMPLE_COVERS[index].focalY)
  }

  return (
    <div data-memorial-theme={activeTheme} className="theirs-theme-root transition-colors duration-300">
      <LegacyHashRedirect slug={identity.slug} />

      {/* --------------------------------------------------------------------- */}
      {/* FLOATING DESIGN LAB CONTROLS                                          */}
      {/* Allows testing different covers, opacities, vignettes, and themes     */}
      {/* --------------------------------------------------------------------- */}
      <aside aria-label="Backdrop Design Lab" className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2 text-xs font-sans">
        {isPanelOpen ? (
          <div className="w-88 max-w-[calc(100vw-2rem)] rounded-2xl bg-white/95 backdrop-blur-md p-4 shadow-2xl border border-black/10 text-neutral-800 flex flex-col gap-3.5 max-h-[85vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-black/5 pb-2.5">
              <div className="flex items-center gap-2 font-medium text-neutral-900">
                <Sparkles className="size-4 text-primary" />
                <span className="font-semibold text-sm">Memorial Backdrop Lab</span>
              </div>
              <button
                type="button"
                onClick={() => setIsPanelOpen(false)}
                className="size-6 rounded-full hover:bg-neutral-100 flex items-center justify-center text-neutral-400 hover:text-neutral-700 transition-colors"
                title="Minimize test panel"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* 1. Cover Selection */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-mono text-neutral-500 uppercase tracking-wider">
                Photo Preset (Their World)
              </span>
              <div className="grid grid-cols-1 gap-1.5">
                {SAMPLE_COVERS.map((cover, idx) => (
                  <button
                    key={cover.id}
                    type="button"
                    onClick={() => handleSelectCover(idx)}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-left transition-all border ${
                      selectedCoverIndex === idx
                        ? "bg-neutral-900 text-white border-neutral-900 shadow-xs"
                        : "bg-neutral-50 hover:bg-neutral-100 border-black/5 text-neutral-700"
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="font-medium text-xs">{cover.label}</span>
                      <span className={`text-[10px] ${selectedCoverIndex === idx ? "text-neutral-300" : "text-neutral-400"}`}>
                        {cover.subtitle}
                      </span>
                    </div>
                    {cover.url && (
                      <div className="size-8 rounded-lg overflow-hidden shrink-0 border border-white/20">
                        <img src={cover.url} alt="" className="size-full object-cover" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Visual Wash Opacity */}
            <div className="flex flex-col gap-1.5 pt-1 border-t border-black/5">
              <div className="flex items-center justify-between text-[11px] font-mono text-neutral-500">
                <span className="uppercase tracking-wider">Atmospheric Wash</span>
                <span className="font-semibold text-neutral-900">{Math.round(washOpacity * 100)}%</span>
              </div>
              <div className="grid grid-cols-4 gap-1">
                {[
                  { label: "20% Subtle", val: 0.2 },
                  { label: "32% Ideal", val: 0.32 },
                  { label: "45% Noticeable", val: 0.45 },
                  { label: "60% Vivid", val: 0.6 },
                ].map((item) => (
                  <button
                    key={item.val}
                    type="button"
                    onClick={() => setWashOpacity(item.val)}
                    className={`px-2 py-1.5 rounded-lg text-center text-[10px] font-medium transition-colors border ${
                      washOpacity === item.val
                        ? "bg-neutral-900 text-white border-neutral-900"
                        : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 border-transparent"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Vignette Geometry */}
            <div className="flex flex-col gap-1.5 pt-1 border-t border-black/5">
              <span className="text-[11px] font-mono text-neutral-500 uppercase tracking-wider">
                Edge Treatment
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => setUseRadialVignette(true)}
                  className={`px-2.5 py-1.5 rounded-lg text-[10px] font-medium transition-colors border text-left ${
                    useRadialVignette
                      ? "bg-neutral-900 text-white border-neutral-900"
                      : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 border-transparent"
                  }`}
                >
                  <span className="block font-semibold">Radial Ellipse</span>
                  <span className="text-[9px] opacity-80">No rectangle (Dissolves)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setUseRadialVignette(false)}
                  className={`px-2.5 py-1.5 rounded-lg text-[10px] font-medium transition-colors border text-left ${
                    !useRadialVignette
                      ? "bg-neutral-900 text-white border-neutral-900"
                      : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 border-transparent"
                  }`}
                >
                  <span className="block font-semibold">Full Width</span>
                  <span className="text-[9px] opacity-80">Edge-to-edge</span>
                </button>
              </div>
            </div>

            {/* 4. Theme / Atmosphere Switcher */}
            <div className="flex flex-col gap-1.5 pt-1 border-t border-black/5">
              <span className="text-[11px] font-mono text-neutral-500 uppercase tracking-wider">
                Atmosphere & Theme
              </span>
              <div className="grid grid-cols-5 gap-1">
                {(["quiet", "warm", "garden", "classic", "dusk"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setActiveTheme(t)}
                    className={`px-1.5 py-1 rounded-md text-center text-[10px] capitalize transition-colors font-medium border ${
                      activeTheme === t
                        ? "bg-neutral-900 text-white border-neutral-900"
                        : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 border-transparent"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Architecture note */}
            <p className="text-[10px] text-neutral-400 leading-tight pt-2 border-t border-black/5">
              Ambient Memorial Backdrop: The cover lives behind the hero with no bottom edge, dissolving into the page.
            </p>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsPanelOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/95 backdrop-blur-md border border-black/10 shadow-xl text-neutral-800 hover:bg-white hover:border-black/25 transition-all cursor-pointer font-medium text-xs"
          >
            <ImageIcon className="size-4 text-primary" />
            <span>Backdrop Lab ({currentCover.label.split(" ")[0]})</span>
            <SlidersHorizontal className="size-3.5 text-neutral-400" />
          </button>
        )}
      </aside>

      {/* --------------------------------------------------------------------- */}
      {/* HERO SECTION WITH AMBIENT MEMORIAL BACKDROP                           */}
      {/* --------------------------------------------------------------------- */}
      <MemorialBackdropHero
        fullName={identity.fullName}
        preferredName={identity.preferredName}
        birthYear={identity.birthYear}
        deathYear={identity.deathYear}
        location={identity.location}
        epitaph={identity.epitaph}
        portraitUrl={identity.portraitUrl}
        themeId={activeTheme}
        onOpenContribute={openContribute}
        coverUrl={currentCover.url}
        coverFocalX={50}
        coverFocalY={focalY}
        washOpacity={washOpacity}
        useRadialVignette={useRadialVignette}
      />

      <ThemeDivider themeId={activeTheme} />

      <MemorialStory fullName={identity.fullName} biography={identity.biography} />

      <ThemeDivider themeId={activeTheme} />

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
              View all {data.tributes.total} tributes
            </ViewFullSection>
          ) : (
            <ThemeDivider themeId={activeTheme} />
          )}
        </>
      )}

      {sections.timeline !== false && (
        <>
          <LifeTimeline milestones={data.timeline.items} isDemo={identity.isDemo} />
          {data.timeline.hasMore ? (
            <ViewFullSection href={viewHref("timeline")} kind="timeline">
              Explore all {data.timeline.total} milestones
            </ViewFullSection>
          ) : (
            <ThemeDivider themeId={activeTheme} />
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
              View all {data.media.total} photos & recordings
            </ViewFullSection>
          ) : (
            <ThemeDivider themeId={activeTheme} />
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
              Read all {data.memories.total} stories & memories
            </ViewFullSection>
          ) : (
            <ThemeDivider themeId={activeTheme} />
          )}
        </>
      )}
    </div>
  )
}
