"use client"

import { useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Sparkles, SlidersHorizontal, Eye, EyeOff } from "lucide-react"
import { RobertCarterDemoHero } from "./robert-carter-demo-hero"
import { MemorialStory } from "./memorial-story"
import { MemoriesStream } from "./memories-stream"
import { LifeTimeline } from "./life-timeline"
import { MemorialGallery } from "./memorial-gallery"
import { LifeStories } from "./life-stories"
import { LegacyHashRedirect } from "./legacy-hash-redirect"
import { useMemorialActions } from "./memorial-shell"
import { ThemeDivider } from "./memorial-theme-decorations"
import type { MemorialHomeData, MemorialIdentity } from "@/types/memorial-view"
import type { AuraColor, AuraMode } from "./hero-gradient-aura"

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

export function RobertCarterDemoHome({ identity, data }: { identity: MemorialIdentity; data: MemorialHomeData }) {
  const { openContribute } = useMemorialActions()
  const searchParams = useSearchParams()
  const preview = searchParams.get("preview") === "visitor" ? "?preview=visitor" : ""
  const viewHref = (view: string, hash = "") => `/${identity.slug}/${view}${preview}${hash}`
  const sections = identity.sectionSettings
  const currentTheme = identity.theme || "quiet"

  // Interactive Test Controls for Hero Aura
  const [auraOpacity, setAuraOpacity] = useState<number>(0.45)
  const [auraMode, setAuraMode] = useState<AuraMode>("both")
  const [auraColor, setAuraColor] = useState<AuraColor>("cyan")
  const [isTestPanelOpen, setIsTestPanelOpen] = useState(false)

  return (
    <>
      <LegacyHashRedirect slug={identity.slug} />

      {/* Floating Testing Control Bar for Hero Gradient Aura */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2 text-xs font-sans">
        {isTestPanelOpen ? (
          <div className="w-80 rounded-2xl bg-white/95 backdrop-blur-md p-4 shadow-xl border border-black/10 text-neutral-800 flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-black/5 pb-2">
              <div className="flex items-center gap-1.5 font-medium text-neutral-900">
                <Sparkles className="size-4 text-cyan-500" />
                <span>Hero Background Aura Test</span>
              </div>
              <button
                type="button"
                onClick={() => setIsTestPanelOpen(false)}
                className="text-neutral-400 hover:text-neutral-700 font-mono text-sm px-1 cursor-pointer"
              >
                &times;
              </button>
            </div>

            {/* Opacity Control */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-[11px] text-neutral-600 font-mono">
                <span>OPACITY</span>
                <span>{Math.round(auraOpacity * 100)}%</span>
              </div>
              <div className="grid grid-cols-5 gap-1">
                {[0, 0.2, 0.35, 0.5, 0.75].map((op) => (
                  <button
                    key={op}
                    type="button"
                    onClick={() => setAuraOpacity(op)}
                    className={`px-2 py-1 rounded text-center text-[10px] font-mono cursor-pointer transition-colors ${
                      auraOpacity === op
                        ? "bg-neutral-900 text-white font-medium shadow-xs"
                        : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                    }`}
                  >
                    {op === 0 ? "Off" : `${Math.round(op * 100)}%`}
                  </button>
                ))}
              </div>
            </div>

            {/* Mode Control */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] text-neutral-600 font-mono">RENDER ENGINE</span>
              <div className="grid grid-cols-3 gap-1">
                {(["both", "dither", "svg"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setAuraMode(m)}
                    className={`px-2 py-1 rounded text-center text-[10px] capitalize transition-colors ${
                      auraMode === m
                        ? "bg-neutral-900 text-white font-medium"
                        : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                    }`}
                  >
                    {m === "both" ? "Both" : m === "dither" ? "Dither (Login)" : "Pure SVG"}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Tone */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] text-neutral-600 font-mono">COLOR AURA</span>
              <div className="grid grid-cols-4 gap-1">
                {(["cyan", "purple", "green", "orange"] as const).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setAuraColor(c)}
                    className={`px-2 py-1 rounded text-center text-[10px] capitalize transition-colors ${
                      auraColor === c
                        ? "bg-neutral-900 text-white font-medium"
                        : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-[10px] text-neutral-500 leading-tight pt-1 border-t border-black/5">
              Testing dual-side gradient mask (Left: 0% 0%, Right: 100% 0%). Dynamic template is untouched.
            </p>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsTestPanelOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/90 backdrop-blur-md border border-black/10 shadow-lg text-neutral-800 hover:bg-white hover:border-black/20 transition-all cursor-pointer font-medium"
          >
            <Sparkles className="size-4 text-cyan-500 animate-pulse" />
            <span>Test Hero Aura ({Math.round(auraOpacity * 100)}%)</span>
            <SlidersHorizontal className="size-3.5 text-neutral-400" />
          </button>
        )}
      </div>

      {/* Hero Section with Dual Gradient Mask Aura Background */}
      <RobertCarterDemoHero
        fullName={identity.fullName}
        preferredName={identity.preferredName}
        birthYear={identity.birthYear}
        deathYear={identity.deathYear}
        location={identity.location}
        epitaph={identity.epitaph}
        portraitUrl={identity.portraitUrl}
        isDemo={identity.isDemo}
        themeId={currentTheme}
        onOpenContribute={openContribute}
        auraOpacity={auraOpacity}
        auraMode={auraMode}
        auraColor={auraColor}
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
              View all {data.tributes.total} tributes
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
              Explore all {data.timeline.total} milestones
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
              View all {data.media.total} photos & recordings
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
              Read all {data.memories.total} stories & memories
            </ViewFullSection>
          ) : (
            <ThemeDivider themeId={currentTheme} />
          )}
        </>
      )}
    </>
  )
}
