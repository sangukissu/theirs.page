"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  MessageSquare,
  Heart,
  Volume2,
  Plus,
  Calendar,
  MapPin,
  Image as ImageIcon,
  CheckCircle2,
} from "lucide-react"

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
  category: "family" | "friend" | "colleague"
}

const DEFAULT_MEMORIES: MemoryItem[] = [
  {
    id: "mem-1",
    authorName: "Anita Carter",
    authorRelationship: "Daughter",
    dateOrYear: "Christmas Day, 1994",
    location: "London, UK",
    story:
      "Dad couldn’t walk past a broken appliance without trying to repair it. Once he spent half of Christmas Day fixing Mrs. Higgins’ washing machine while everyone was waiting for dinner. He wouldn’t leave until it spun without rattling, then ate cold turkey with greasy hands and a giant grin.",
    photoUrl: "/historical-wedding-photo.webp",
    photoCaption: "Christmas morning in the kitchen, 1994",
    category: "family",
  },
  {
    id: "mem-2",
    authorName: "David Carter",
    authorRelationship: "Brother",
    dateOrYear: "Summer 1968",
    location: "Dartmoor, Devon",
    story:
      "When we took the old Morris Minor across the moors in dense fog without telling Grandad. The clutch was slipping and the windscreen wipers barely twitched, but Bob hummed Beatles songs the whole way without fear. He knew every cow track in Devon.",
    audioTitle: "David recounting the Morris Minor trip",
    audioDuration: "0:42",
    category: "family",
  },
  {
    id: "mem-3",
    authorName: "Meena Carter",
    authorRelationship: "Wife of 50 years",
    dateOrYear: "Every morning, 1974 — 2024",
    location: "Devon Cottage",
    story:
      "For fifty years, Bob brought two cups of Assam tea upstairs at 6:30 every morning in the chipped blue porcelain mugs we bought on Portobello Road. Even in his last week at the cottage, he reminded Anita where the good tea leaves were kept.",
    category: "family",
  },
  {
    id: "mem-4",
    authorName: "Sarah Jenkins",
    authorRelationship: "Apprentice & Colleague",
    dateOrYear: "March 1998",
    location: "Carter Workshop",
    story:
      "Thirty years at the bench and I never once heard him raise his voice. Whenever an apprentice broke a delicate spring, Bob would just pour a cup of tea, smile, and say: ‘Well, now you know exactly how much pressure it takes to break one. That’s called learning.’",
    category: "colleague",
  },
  {
    id: "mem-5",
    authorName: "Rahul Carter",
    authorRelationship: "Grandson",
    dateOrYear: "August 2012",
    location: "Back Porch, Devon",
    story:
      "He spent three months carving a miniature wooden chess set for my tenth birthday. Every piece was carved from spare oak offcuts from the grandfather clocks. I still keep the King in my desk drawer in university.",
    category: "family",
  },
]

interface MemoriesStreamProps {
  memories?: MemoryItem[]
  onOpenContribute: () => void
}

export function MemoriesStream({
  memories = DEFAULT_MEMORIES,
  onOpenContribute,
}: MemoriesStreamProps) {
  const [filter, setFilter] = useState<"all" | "family" | "colleague">("all")
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({})

  const filteredMemories = memories.filter((m) => {
    if (filter === "all") return true
    return m.category === filter
  })

  const toggleLike = (id: string) => {
    setLikedMap((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <section id="memories" className="py-12 sm:py-16 px-4 max-w-4xl mx-auto">
      <div className="flex flex-col gap-8">
        
        {/* Section Header & Filters */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-black/[0.06] pb-6">
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-mono font-medium text-primary uppercase tracking-wider">
              The Living Archive
            </span>
            <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-[#181925]">
              Contributed Memories
            </h2>
            <p className="text-xs sm:text-sm text-[#666]">
              Stories gathered from the people who knew and loved him.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 rounded-full bg-[#f7f7f8] border border-black/[0.04] self-start sm:self-auto select-none">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`text-xs px-3 py-1 rounded-full font-medium transition-colors cursor-pointer ${
                filter === "all"
                  ? "bg-white text-[#181925] shadow-2xs"
                  : "text-[#666] hover:text-[#181925]"
              }`}
            >
              All ({memories.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter("family")}
              className={`text-xs px-3 py-1 rounded-full font-medium transition-colors cursor-pointer ${
                filter === "family"
                  ? "bg-white text-[#181925] shadow-2xs"
                  : "text-[#666] hover:text-[#181925]"
              }`}
            >
              Family
            </button>
            <button
              type="button"
              onClick={() => setFilter("colleague")}
              className={`text-xs px-3 py-1 rounded-full font-medium transition-colors cursor-pointer ${
                filter === "colleague"
                  ? "bg-white text-[#181925] shadow-2xs"
                  : "text-[#666] hover:text-[#181925]"
              }`}
            >
              Workshop & Friends
            </button>
          </div>
        </div>

        {/* Memories Grid / Stream */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence>
            {filteredMemories.map((item) => (
              <motion.article
                key={item.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="p-5 sm:p-6 rounded-2xl bg-white border border-black/[0.06] flex flex-col justify-between gap-4"
              >
                {/* Author Info & Date */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-2 border-b border-black/[0.04] pb-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="size-8 rounded-full bg-neutral-100 border border-black/[0.06] text-[#181925] text-xs font-medium flex items-center justify-center shrink-0">
                        {item.authorName.charAt(0)}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-medium text-[#181925] truncate">
                          {item.authorName}
                        </span>
                        <span className="text-[11px] text-[#888] truncate">
                          {item.authorRelationship}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end text-[11px] text-[#888] shrink-0 font-mono">
                      <span>{item.dateOrYear}</span>
                      {item.location && <span className="text-[10px]">{item.location}</span>}
                    </div>
                  </div>

                  {/* Story Text */}
                  <p className="text-xs sm:text-sm text-[#444] leading-relaxed">
                    “{item.story}”
                  </p>
                </div>

                {/* Optional Media Attachments */}
                <div className="flex flex-col gap-2 pt-2 border-t border-black/[0.04]">
                  {item.photoUrl && (
                    <div className="flex items-center gap-3 p-2 rounded-xl bg-[#f7f7f8] border border-black/[0.04]">
                      <div className="size-10 rounded-lg overflow-hidden bg-neutral-100 border border-black/[0.06] shrink-0">
                        <img
                          src={item.photoUrl}
                          alt={item.photoCaption || "Attached memory photo"}
                          className="size-full object-cover grayscale"
                        />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[11px] font-medium text-[#181925] truncate">
                          {item.photoCaption || "Photograph attached"}
                        </span>
                        <span className="text-[10px] text-[#888] font-mono">
                          Preserved original scan
                        </span>
                      </div>
                    </div>
                  )}

                  {item.audioTitle && (
                    <div className="flex items-center justify-between p-2 rounded-xl bg-[#f7f7f8] border border-black/[0.04] text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <Volume2 className="size-3.5 text-primary shrink-0" />
                        <span className="text-xs font-medium text-[#181925] truncate">
                          {item.audioTitle}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-[#888] shrink-0">
                        {item.audioDuration}
                      </span>
                    </div>
                  )}

                  {/* Reaction Button */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <span className="size-1 rounded-full bg-emerald-500" />
                      Approved memory
                    </span>

                    <button
                      type="button"
                      onClick={() => toggleLike(item.id)}
                      className="inline-flex items-center gap-1 text-[11px] text-[#777] hover:text-rose-600 transition-colors cursor-pointer select-none"
                    >
                      <Heart
                        className={`size-3.5 ${
                          likedMap[item.id] ? "fill-rose-500 text-rose-500" : "text-[#888]"
                        }`}
                      />
                      <span>{likedMap[item.id] ? "Touched" : "Remember"}</span>
                    </button>
                  </div>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>

          {/* In-Stream Invitation Card */}
          <div className="p-6 rounded-2xl bg-[#f7f7f8] border border-black/[0.06] flex flex-col justify-between items-start gap-4 text-left">
            <div className="flex flex-col gap-2">
              <span className="size-8 rounded-full bg-white flex items-center justify-center border border-black/[0.06] text-primary">
                <Plus className="size-4" />
              </span>
              <h3 className="text-base font-medium text-[#181925]">
                Do you remember Robert?
              </h3>
              <p className="text-xs text-[#666] leading-relaxed">
                Add a small story, a phrase he repeated, or a photo you took with him. It takes 30 seconds and requires no account.
              </p>
            </div>

            <button
              type="button"
              onClick={onOpenContribute}
              className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap !rounded-full font-medium transition-all cursor-pointer border border-[color-mix(in_srgb,var(--primary)_80%,#3a3480)] bg-[color-mix(in_srgb,var(--primary)_90%,#3a3480)] text-primary-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.22),inset_0_-1px_0_rgba(58,52,128,0.30)] transform-gpu hover:bg-primary active:scale-[0.98] h-9 px-4 text-xs select-none"
            >
              <span>Add your memory</span>
              <span>→</span>
            </button>
          </div>
        </div>

      </div>
    </section>
  )
}
