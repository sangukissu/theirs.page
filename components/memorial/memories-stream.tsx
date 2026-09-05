"use client"

import { useState } from "react"
import {
  Plus,
  Play,
  Pause,
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
    id: "mem-3",
    authorName: "Meena Carter",
    authorRelationship: "Wife of 50 years",
    dateOrYear: "Yesterday",
    location: "Devon Cottage",
    story:
      "For fifty years, Bob brought two cups of Assam tea upstairs at 6:30 every morning in the chipped blue porcelain mugs we bought on Portobello Road. Even in his last week at the cottage, he reminded Anita where the good tea leaves were kept.",
    tributeType: "flower",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
  },
  {
    id: "mem-1",
    authorName: "Anita Carter",
    authorRelationship: "Daughter",
    dateOrYear: "1994",
    chronologicalYear: 1994,
    location: "London, UK",
    story:
      "Dad couldn’t walk past a broken appliance without trying to repair it. Once he spent half of Christmas Day fixing Mrs. Higgins’ washing machine while everyone was waiting for dinner. He wouldn’t leave until it spun without rattling, then ate cold turkey with greasy hands and a giant grin.",
    photoUrl: "/historical-wedding-photo.webp",
    photoCaption: "Christmas morning in the kitchen, 1994",
    tributeType: "photo",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
  {
    id: "mem-2",
    authorName: "David Carter",
    authorRelationship: "Older Brother",
    dateOrYear: "1968",
    chronologicalYear: 1968,
    location: "Dartmoor, Devon",
    story:
      "When we took the old Morris Minor across the moors in dense fog without telling Grandad. The clutch was slipping and the windscreen wipers barely twitched, but Bob hummed Beatles songs the whole way without fear. He knew every cow track in Devon.",
    audioTitle: "David recounting the Morris Minor trip",
    audioDuration: "0:42",
    tributeType: "candle",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
  },
  {
    id: "mem-4",
    authorName: "Sarah Jenkins",
    authorRelationship: "Senior Apprentice",
    dateOrYear: "1998",
    chronologicalYear: 1998,
    location: "Carter Workshop",
    story:
      "Thirty years at the bench and I never once heard him raise his voice. Whenever an apprentice broke a delicate clock spring, Bob would just pour a fresh cup of tea, smile, and say: ‘Well, now you know exactly how much pressure it takes to break one. That’s called learning.’",
    tributeType: "note",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 120).toISOString(),
  },
  {
    id: "mem-5",
    authorName: "Rahul Carter",
    authorRelationship: "Grandson",
    dateOrYear: "2012",
    chronologicalYear: 2012,
    location: "Back Porch, Devon",
    story:
      "He spent three months carving a miniature wooden chess set for my tenth birthday. Every piece was carved from spare oak offcuts from the grandfather clocks. I still keep the King in my desk drawer at university.",
    tributeType: "note",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 180).toISOString(),
  },
  {
    id: "mem-6",
    authorName: "Thomas Bradley",
    authorRelationship: "Lifelong Friend & Beekeeper",
    dateOrYear: "2001",
    chronologicalYear: 2001,
    location: "Dartmoor Valleys",
    story:
      "Whenever the wild bees nested in the cottage eaves, Bob wouldn't call pest control. He'd put on his old tweed jacket, gently smoke them into a wooden box, and walk them three miles down into the valley so they'd pollinate the heather.",
    tributeType: "flower",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 240).toISOString(),
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
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null)
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
            Stories, prayers, and words of remembrance from family and friends.
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
            const isAudioPlaying = playingAudioId === item.id
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

                  {/* Embedded Audio Memo (if present) */}
                  {item.audioTitle && (
                    <div className="p-3 rounded-2xl bg-white border border-black/[0.06] flex items-center justify-between gap-3 my-1">
                      <button
                        type="button"
                        onClick={() => setPlayingAudioId(isAudioPlaying ? null : item.id)}
                        className="size-8 rounded-full bg-[#181925] text-white flex items-center justify-center shrink-0 hover:bg-[#282a3a] transition-colors cursor-pointer"
                      >
                        {isAudioPlaying ? <Pause className="size-3.5" /> : <Play className="size-3.5 ml-0.5" />}
                      </button>
                      <div className="flex-1 flex flex-col min-w-0">
                        <span className="text-xs font-medium text-[#181925] truncate">
                          {item.audioTitle}
                        </span>
                        <div className="flex items-center gap-1 h-2.5 mt-0.5">
                          {[30, 60, 90, 45, 80, 50, 70, 40, 85, 60, 30].map((h, i) => (
                            <div
                              key={i}
                              className={`w-0.5 rounded-full transition-all ${
                                isAudioPlaying ? "bg-[#181925]" : "bg-neutral-300"
                              }`}
                              style={{ height: `${h}%` }}
                            />
                          ))}
                        </div>
                      </div>
                      <span className="text-[11px] font-mono text-[#888] shrink-0">
                        {item.audioDuration}
                      </span>
                    </div>
                  )}

                  {/* Embedded Photograph (if present) */}
                  {item.photoUrl && (
                    <div className="rounded-2xl overflow-hidden border border-black/[0.06] bg-neutral-100 max-h-80 my-1">
                      <img
                        src={item.photoUrl}
                        alt={item.photoCaption || "Contributed photograph"}
                        className="w-full h-full object-cover grayscale contrast-105"
                      />
                      {item.photoCaption && (
                        <div className="p-2.5 bg-white/90 backdrop-blur-xs text-xs text-[#666] italic border-t border-black/[0.04]">
                          {item.photoCaption}
                        </div>
                      )}
                    </div>
                  )}

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
