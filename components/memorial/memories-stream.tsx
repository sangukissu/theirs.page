"use client"

import { useState } from "react"
import {
  Heart,
  Volume2,
  Plus,
  Calendar,
  MapPin,
  Play,
  Pause,
  ArrowUpDown,
  BookOpen,
} from "lucide-react"
import { ContributionType } from "./contribute-modal"

export interface MemoryItem {
  id: string
  authorName: string
  authorRelationship: string
  dateOrYear: string
  location?: string
  story: string
  photoUrl?: string
  photoCaption?: string
  audioTitle?: string
  audioDuration?: string
  category: "family" | "friend" | "work"
  chronologicalYear?: number
  heartCount?: number
}

export const DEFAULT_MEMORIES: MemoryItem[] = [
  {
    id: "mem-1",
    authorName: "Anita Carter",
    authorRelationship: "Daughter",
    dateOrYear: "Christmas Day, 1994",
    chronologicalYear: 1994,
    location: "London, UK",
    story:
      "Dad couldn’t walk past a broken appliance without trying to repair it. Once he spent half of Christmas Day fixing Mrs. Higgins’ washing machine while everyone was waiting for dinner. He wouldn’t leave until it spun without rattling, then ate cold turkey with greasy hands and a giant grin.",
    photoUrl: "/historical-wedding-photo.webp",
    photoCaption: "Christmas morning in the kitchen, 1994",
    category: "family",
    heartCount: 8,
  },
  {
    id: "mem-2",
    authorName: "David Carter",
    authorRelationship: "Older Brother",
    dateOrYear: "Summer 1968",
    chronologicalYear: 1968,
    location: "Dartmoor, Devon",
    story:
      "When we took the old Morris Minor across the moors in dense fog without telling Grandad. The clutch was slipping and the windscreen wipers barely twitched, but Bob hummed Beatles songs the whole way without fear. He knew every cow track in Devon.",
    audioTitle: "David recounting the Morris Minor trip",
    audioDuration: "0:42",
    category: "family",
    heartCount: 5,
  },
  {
    id: "mem-3",
    authorName: "Meena Carter",
    authorRelationship: "Wife of 50 years",
    dateOrYear: "Every morning, 1974 — 2024",
    chronologicalYear: 2024,
    location: "Devon Cottage",
    story:
      "For fifty years, Bob brought two cups of Assam tea upstairs at 6:30 every morning in the chipped blue porcelain mugs we bought on Portobello Road. Even in his last week at the cottage, he reminded Anita where the good tea leaves were kept.",
    category: "family",
    heartCount: 14,
  },
  {
    id: "mem-4",
    authorName: "Sarah Jenkins",
    authorRelationship: "Senior Apprentice",
    dateOrYear: "March 1998",
    chronologicalYear: 1998,
    location: "Carter Workshop",
    story:
      "Thirty years at the bench and I never once heard him raise his voice. Whenever an apprentice broke a delicate clock spring, Bob would just pour a fresh cup of tea, smile, and say: ‘Well, now you know exactly how much pressure it takes to break one. That’s called learning.’",
    category: "work",
    heartCount: 6,
  },
  {
    id: "mem-5",
    authorName: "Rahul Carter",
    authorRelationship: "Grandson",
    dateOrYear: "August 2012",
    chronologicalYear: 2012,
    location: "Back Porch, Devon",
    story:
      "He spent three months carving a miniature wooden chess set for my tenth birthday. Every piece was carved from spare oak offcuts from the grandfather clocks. I still keep the King in my desk drawer at university.",
    category: "family",
    heartCount: 7,
  },
  {
    id: "mem-6",
    authorName: "Thomas Bradley",
    authorRelationship: "Lifelong Friend & Beekeeper",
    dateOrYear: "Spring 2001",
    chronologicalYear: 2001,
    location: "Dartmoor Valleys",
    story:
      "Whenever the wild bees nested in the cottage eaves, Bob wouldn't call pest control. He'd put on his old tweed jacket, gently smoke them into a wooden box, and walk them three miles down into the valley so they'd pollinate the heather.",
    category: "friend",
    heartCount: 4,
  },
]

interface MemoriesStreamProps {
  memories?: MemoryItem[]
  fullName?: string
  isDemo?: boolean
  onOpenContribute: (type?: ContributionType) => void
}

export function MemoriesStream({
  memories,
  fullName = "Robert Carter",
  isDemo = false,
  onOpenContribute,
}: MemoriesStreamProps) {
  const activeMemories = isDemo
    ? (memories && memories.length > 0 ? memories : DEFAULT_MEMORIES)
    : (memories || [])
  const [filter, setFilter] = useState<"all" | "family" | "friend" | "work">("all")
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest" | "chronological">("newest")
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({})
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null)

  const firstName = fullName.split(" ")[0] || fullName

  const filtered = activeMemories.filter((m) => {
    if (filter === "all") return true
    return m.category === filter
  })

  const sorted = [...filtered].sort((a, b) => {
    if (sortOrder === "chronological") {
      return (a.chronologicalYear || 0) - (b.chronologicalYear || 0)
    }
    if (sortOrder === "oldest") {
      return a.id.localeCompare(b.id)
    }
    // newest default
    return b.id.localeCompare(a.id)
  })

  const toggleLike = (id: string) => {
    setLikedMap((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <section id="memories" className="py-12 sm:py-16 px-4 max-w-4xl mx-auto flex flex-col gap-8 scroll-mt-24">
      
      {/* Header & Controls */}
      <div className="flex flex-col gap-5 border-b border-black/[0.06] pb-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
           
            <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-[#181925]">
              Memories of {firstName}
            </h2>
          </div>

          <button
            type="button"
            onClick={() => onOpenContribute("memory")}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#181925] hover:bg-[#252736] text-white text-xs font-medium transition-all self-start sm:self-auto cursor-pointer shadow-xs active:scale-95"
          >
            <Plus className="size-3.5" />
            <span className="hidden sm:block">Add your memory</span>
          </button>
        </div>

        {/* Filter Chips & Sort Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 select-none">
          {/* Categories */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
            {[
              { id: "all", label: "All" },
              { id: "family", label: "Family" },
              { id: "friend", label: "Friends" },
              { id: "work", label: "Work" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilter(tab.id as any)}
                className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all cursor-pointer ${
                  filter === tab.id
                    ? "bg-[#181925] text-white shadow-2xs"
                    : "bg-[#f4f4f6] text-[#666] hover:text-[#181925]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Sort Selector */}
          <div className="inline-flex items-center gap-1.5 text-xs text-[#71717a]">
            <ArrowUpDown className="size-3.5 text-[#999]" />
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as any)}
              className="bg-transparent font-medium text-[#181925] outline-none cursor-pointer text-xs"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="chronological">Life chronological order</option>
            </select>
          </div>
        </div>
      </div>

      {/* Editorial Single-Column Reading Stream (Max ~680px for Reading Comfort) */}
      {sorted.length === 0 ? (
        <div className="py-16 text-center text-sm text-[#71717a] rounded-3xl bg-[#fafafb] border border-black/[0.06] flex flex-col items-center justify-center gap-3">
          <p>No memories shared yet. Be the first to share a memory of {firstName}.</p>
          <button
            type="button"
            onClick={() => onOpenContribute("memory")}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline cursor-pointer"
          >
            <Plus className="size-3.5" />
            <span>Add the first memory</span>
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {sorted.map((item) => {
          const isLiked = !!likedMap[item.id]
          const count = (item.heartCount || 0) + (isLiked ? 1 : 0)
          const isAudioPlaying = playingAudioId === item.id

          return (
            <article
              key={item.id}
              className="p-6 sm:p-7 rounded-3xl bg-[#f7f7f8] border border-black/[0.05] flex flex-col gap-4 transition-all hover:border-black/[0.10]"
            >
              {/* Author & Relationship Badge */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="size-9 rounded-full bg-white border border-black/[0.08] text-xs font-semibold text-[#181925] flex items-center justify-center shrink-0">
                    {item.authorName.charAt(0)}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-[#181925]">
                      {item.authorName}
                    </span>
                    <span className="text-xs text-[#71717a]">
                      {item.authorRelationship}
                    </span>
                  </div>
                </div>

                <div className="text-right hidden sm:flex flex-col items-end text-[11px] font-mono text-[#888]">
                  <span>{item.dateOrYear}</span>
                  {item.location && <span>{item.location}</span>}
                </div>
              </div>

              {/* Story Narrative */}
              <p className="text-[15px] sm:text-base leading-relaxed sm:leading-7 text-[#2f2f2f] font-normal">
                “{item.story}”
              </p>

              {/* Embedded Audio Note (if present) */}
              {item.audioTitle && (
                <div className="p-3 rounded-2xl bg-white border border-black/[0.06] flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setPlayingAudioId(isAudioPlaying ? null : item.id)}
                    className="size-8 rounded-full bg-primary text-white flex items-center justify-center shrink-0 hover:bg-primary/90 transition-colors cursor-pointer"
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
                            isAudioPlaying ? "bg-primary" : "bg-neutral-300"
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
                <div className="rounded-2xl overflow-hidden border border-black/[0.06] bg-neutral-100 max-h-72">
                  <img
                    src={item.photoUrl}
                    alt={item.photoCaption || "Contributed memory"}
                    className="w-full h-full object-cover grayscale contrast-105"
                  />
                  {item.photoCaption && (
                    <div className="p-2.5 bg-white/90 backdrop-blur-xs text-xs text-[#666] italic border-t border-black/[0.04]">
                      {item.photoCaption}
                    </div>
                  )}
                </div>
              )}

              {/* Memory Action: "♡ This brought back a memory" */}
              <div className="pt-2 border-t border-black/[0.04] flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => toggleLike(item.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer select-none ${
                    isLiked
                      ? "bg-rose-50 text-rose-600 border border-rose-100"
                      : "text-[#71717a] hover:text-rose-600 hover:bg-white"
                  }`}
                >
                  <Heart className={`size-3.5 ${isLiked ? "fill-rose-600" : ""}`} />
                  <span>This brought back a memory</span>
                  <span className="font-mono text-[11px] text-[#888] ml-0.5">({count})</span>
                </button>

                <div className="sm:hidden text-[10px] font-mono text-[#888]">
                  {item.dateOrYear}
                </div>
              </div>
            </article>
          )
        })}
      </div>
      )}

      {/* Persistent End Action */}
      <div className="flex flex-col items-center justify-center p-8 rounded-3xl bg-[#f9f9fa] border border-black/[0.06] text-center gap-3 mt-4">
        <BookOpen className="size-6 text-primary" />
        <div className="flex flex-col gap-1">
          <h3 className="text-base font-medium text-[#181925]">
            Have a story of {firstName}?
          </h3>
          <p className="text-xs text-[#71717a] max-w-sm">
            Even a short note or forgotten moment helps the family build the permanent archive.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onOpenContribute("memory")}
          className="mt-1 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-white text-xs font-medium hover:bg-primary/95 transition-all cursor-pointer shadow-xs active:scale-95"
        >
          <Plus className="size-3.5" />
          <span>Contribute a memory</span>
        </button>
      </div>

    </section>
  )
}
