"use client"

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
        <div aria-hidden="true" className="absolute inset-x-0 bottom-[13px] border-t border-dashed border-primary/30" />
        <Link
          href={href}
          prefetch
          className="group relative z-10 flex flex-col items-center bg-white px-5 text-primary outline-none focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-4"
        >
          <span className="mb-1 transition-transform duration-200 group-hover:-translate-y-0.5"><SectionMark kind={kind} /></span>
          <span className="bg-white px-2 text-xs font-semibold tracking-tight group-hover:underline group-hover:underline-offset-4">
            {children} <span aria-hidden="true">→</span>
          </span>
        </Link>
      </div>
    </div>
  )
}

export function MemorialHome({ identity, data }: { identity: MemorialIdentity; data: MemorialHomeData }) {
  const { openContribute } = useMemorialActions()
  const searchParams = useSearchParams()
  const preview = searchParams.get("preview") === "visitor" ? "?preview=visitor" : ""
  const viewHref = (view: string, hash = "") => `/${identity.slug}/${view}${preview}${hash}`
  const sections = identity.sectionSettings
  const remaining = (total: number, shown: number) => Math.max(0, total - shown)

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
        onOpenContribute={openContribute}
      />

      <MemorialStory fullName={identity.fullName} biography={identity.biography} isDemo={identity.isDemo} />

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
          {(identity.isDemo || data.tributes.hasMore) && (
            <ViewFullSection href={viewHref("tributes")} kind="tributes">
              {identity.isDemo ? `View all ${data.tributes.total} tributes` : `View ${remaining(data.tributes.total, data.tributes.items.length)} more tributes`}
            </ViewFullSection>
          )}
        </>
      )}

      {sections.timeline !== false && (
        <>
          <LifeTimeline milestones={data.timeline.items} isDemo={identity.isDemo} />
          {(identity.isDemo || data.timeline.hasMore) && (
            <ViewFullSection href={viewHref("timeline")} kind="timeline">
              {identity.isDemo ? `Explore all ${data.timeline.total} milestones` : `Explore ${remaining(data.timeline.total, data.timeline.items.length)} more milestones`}
            </ViewFullSection>
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
            onOpenContribute={openContribute}
            initialPage={{ ...data.media, hasMore: false, nextCursor: null }}
          />
          {(identity.isDemo || data.media.hasMore) && (
            <ViewFullSection href={viewHref("gallery")} kind="gallery">
              {identity.isDemo ? `View all ${data.media.total} photos & recordings` : `View ${remaining(data.media.total, data.media.items.length)} more photos & recordings`}
            </ViewFullSection>
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
          {(identity.isDemo || data.memories.hasMore) && (
            <ViewFullSection href={viewHref("memories")} kind="memories">
              {identity.isDemo ? `View all ${data.memories.total} stories & memories` : `Read ${remaining(data.memories.total, data.memories.items.length)} more stories & memories`}
            </ViewFullSection>
          )}
        </>
      )}
    </>
  )
}
