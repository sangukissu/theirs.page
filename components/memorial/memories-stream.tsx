"use client"

import { useState } from "react"
import {
  Plus,
  MapPin,
  Share2,
  MoreVertical,
  Mail,
} from "lucide-react"
import { ContributionType } from "./contribute-modal"
import { TributeEmblem, TributeType } from "./tribute-emblems"

export interface MemoryItem {
  id: string
  authorName: string
  authorRelationship?: string
  authorEmail?: string
  dateOrYear: string
  location?: string
  story: string
  photoUrl?: string
  photoCaption?: string
  audioTitle?: string
  audioDuration?: string
  chronologicalYear?: number
  tributeType?: TributeType
  createdAt?: string
}

export const DEFAULT_MEMORIES: MemoryItem[] = [
  {
    id: "trib-1",
    authorName: "Meena Carter",
    authorRelationship: "Wife of 50 years",
    dateOrYear: "Yesterday",
    location: "Devon Cottage",
    story:
      "A blossom in memory of my dearest Bob. For fifty years you brought warmth, laughter, and calm into our home.",
    tributeType: "flower",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
  },
  {
    id: "trib-2",
    authorName: "David Carter",
    authorRelationship: "Older Brother",
    dateOrYear: "2 days ago",
    location: "Dartmoor, Devon",
    story:
      "Lighting a candle for my little brother Bob. Your gentle spirit and steady hands will never be forgotten.",
    tributeType: "candle",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
  {
    id: "trib-3",
    authorName: "Thomas Bradley",
    authorRelationship: "Lifelong Friend & Beekeeper",
    dateOrYear: "3 days ago",
    location: "Dartmoor Valleys",
    story:
      "Laying a wildflower for Bob. Rest peacefully, old friend, among the heather and the bees.",
    tributeType: "flower",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
  },
  {
    id: "trib-4",
    authorName: "Eleanor Vance",
    authorRelationship: "Family Neighbor",
    dateOrYear: "5 days ago",
    location: "London, UK",
    story:
      "Holding the entire Carter family in our prayers. Robert’s kindness and warmth touched everyone who walked down our lane.",
    tributeType: "note",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 120).toISOString(),
  },
]

interface MemoriesStreamProps {
  memories?: MemoryItem[]
  fullName?: string
  memorialId?: string
  slug?: string
  isDemo?: boolean
  onOpenContribute: (type?: ContributionType) => void
}

export function MemoriesStream({
  memories,
  fullName = "Robert Carter",
  memorialId,
  slug,
  isDemo = false,
  onOpenContribute,
}: MemoriesStreamProps) {
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({})
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const activeMemories = isDemo
    ? (memories && memories.length > 0 ? memories : DEFAULT_MEMORIES)
    : (memories || [])

  const firstName = fullName.split(" ")[0] || fullName

  // Order memories strictly newest first
  const sorted = [...activeMemories].sort((a, b) => {
    if (a.createdAt && b.createdAt) {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    }
    return 0
  })

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const handleShare = async (item: MemoryItem) => {
    const url = typeof window !== "undefined" ? window.location.href : ""
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url)
        setCopiedId(item.id)
        setTimeout(() => setCopiedId(null), 2500)
      }
    } catch {
      // Fallback
    }
    setActiveMenuId(null)
  }

  return (
    <section id="tributes" className="py-12 sm:py-16 px-4 max-w-4xl mx-auto flex flex-col gap-8 scroll-mt-24">
      
      {/* Header with single clear CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/[0.06] pb-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-[#181925]">
            Tributes to {firstName}
          </h2>
          <p className="text-xs sm:text-sm text-[#71717a]">
            Flowers, candles, and quiet notes of remembrance from family and friends.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onOpenContribute("tribute")}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#181925] hover:bg-[#252736] text-white text-xs font-medium transition-all cursor-pointer shadow-xs active:scale-95 shrink-0 self-start sm:self-auto"
        >
          <Plus className="size-3.5" />
          <span>Leave a Tribute</span>
        </button>
      </div>

      {/* Reading Stream of Tributes */}
      {sorted.length === 0 ? (
        <div className="py-16 text-center text-sm text-[#71717a] rounded-3xl bg-[#f7f7f8] border border-black/[0.06] flex flex-col items-center justify-center gap-3">
          <p>No tributes shared yet. Be the first to leave words of remembrance for {firstName}.</p>
          <button
            type="button"
            onClick={() => onOpenContribute("tribute")}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#181925] text-white text-xs font-medium hover:bg-[#252736] transition-all cursor-pointer shadow-xs active:scale-95"
          >
            <Plus className="size-3.5" />
            <span>Leave a Tribute</span>
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {sorted.map((item) => {
            const isExpanded = !!expandedIds[item.id]
            const shouldTruncate = item.story.length > 260
            const isMenuOpen = activeMenuId === item.id

            // Check if tribute is recent (last 48 hours)
            let isNew = false
            if (item.createdAt) {
              const diffHours = (Date.now() - new Date(item.createdAt).getTime()) / (1000 * 60 * 60)
              if (diffHours >= 0 && diffHours < 48) isNew = true
            }

            return (
              <article
                key={item.id}
                className="p-6 sm:p-7 rounded-3xl bg-[#f7f7f8] border border-black/[0.06] flex flex-col sm:flex-row items-start gap-4 sm:gap-6 transition-all hover:border-black/[0.12] relative group shadow-none"
              >
                {/* Left Column: Linocut Ritual Emblem in clean white badge */}
                <div className="shrink-0 p-2.5 rounded-2xl bg-white border border-black/[0.06] text-[#8b5a45] flex items-center justify-center self-start shadow-none">
                  <TributeEmblem
                    type={item.tributeType || (item.photoUrl ? "photo" : "note")}
                    size={40}
                  />
                </div>

                {/* Right Column: Tribute Content */}
                <div className="flex-1 min-w-0 flex flex-col gap-3.5 w-full">
                  
                  {/* Author Header & Utility Menu */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm sm:text-base font-semibold text-[#181925] tracking-tight">
                          {item.authorName}
                        </span>
                        {item.authorRelationship && (
                          <>
                            <span className="text-black/[0.2]">·</span>
                            <span className="text-xs text-[#71717a] font-normal">
                              {item.authorRelationship}
                            </span>
                          </>
                        )}
                        {isNew && (
                          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-amber-100/70 text-amber-900 border border-amber-200">
                            New
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-[#888] mt-0.5 font-mono">
                        {item.dateOrYear && <span>{item.dateOrYear}</span>}
                        {item.location && (
                          <>
                            <span>·</span>
                            <span className="inline-flex items-center gap-1 font-sans">
                              <MapPin className="size-3 text-[#aaa]" />
                              {item.location}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Three-dot menu ⋮ for Share & Contact Author */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setActiveMenuId(isMenuOpen ? null : item.id)}
                        className="size-7 rounded-full hover:bg-black/[0.05] text-[#888] hover:text-[#181925] flex items-center justify-center transition-colors cursor-pointer"
                        title="Options"
                      >
                        <MoreVertical className="size-4" />
                      </button>

                      {isMenuOpen && (
                        <div className="absolute right-0 top-8 z-30 w-44 rounded-2xl bg-white border border-black/[0.08] shadow-lg py-1.5 flex flex-col text-xs text-[#333] animate-in fade-in zoom-in-95">
                          <button
                            type="button"
                            onClick={() => handleShare(item)}
                            className="w-full px-3.5 py-2 text-left hover:bg-neutral-50 flex items-center gap-2 cursor-pointer"
                          >
                            <Share2 className="size-3.5 text-[#666]" />
                            <span>Share this tribute</span>
                          </button>
                          {item.authorEmail && (
                            <a
                              href={`mailto:${item.authorEmail}?subject=Regarding your tribute to ${fullName}`}
                              className="w-full px-3.5 py-2 text-left hover:bg-neutral-50 flex items-center gap-2 cursor-pointer"
                            >
                              <Mail className="size-3.5 text-[#666]" />
                              <span>Contact author</span>
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Story Narrative with Progressive Disclosure */}
                  <div className="text-[14.5px] sm:text-[15.5px] leading-relaxed sm:leading-7 text-[#2c2d30] font-normal">
                    <p className="whitespace-pre-line">
                      {shouldTruncate && !isExpanded
                        ? `${item.story.slice(0, 240)}...`
                        : item.story}
                    </p>
                    {shouldTruncate && (
                      <button
                        type="button"
                        onClick={() => toggleExpand(item.id)}
                        className="text-xs font-semibold text-[#8b5a45] hover:underline cursor-pointer mt-1.5 inline-block select-none"
                      >
                        {isExpanded ? "read less" : "read more"}
                      </button>
                    )}
                  </div>



                  {/* Bottom Action: Clean Share link */}
                  <div className="pt-2 border-t border-black/[0.04] flex items-center justify-between text-xs text-[#888]">
                    <button
                      type="button"
                      onClick={() => handleShare(item)}
                      className="inline-flex items-center gap-1.5 text-xs text-[#777] hover:text-[#181925] transition-colors cursor-pointer select-none"
                    >
                      <Share2 className="size-3.5" />
                      <span>Share</span>
                    </button>
                    {copiedId === item.id && (
                      <span className="text-[11px] text-emerald-700 font-medium animate-in fade-in">
                        Link copied to clipboard!
                      </span>
                    )}
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}

      {/* Quiet End Prompt */}
      {sorted.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 sm:p-7 rounded-3xl bg-[#f7f7f8] border border-black/[0.06] text-left mt-2">
          <div className="flex flex-col gap-0.5">
            <h3 className="text-sm sm:text-base font-medium text-[#181925]">
              Have words or a memory of {firstName}?
            </h3>
            <p className="text-xs text-[#71717a]">
              Every tribute helps the family remember the complete person.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onOpenContribute("memory")}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#181925] text-white text-xs font-medium hover:bg-[#252736] transition-all cursor-pointer shadow-xs active:scale-95 shrink-0"
          >
            <Plus className="size-3.5" />
            <span>Leave a Tribute</span>
          </button>
        </div>
      )}

    </section>
  )
}
