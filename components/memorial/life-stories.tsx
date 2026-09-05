"use client"

import { useState } from "react"
import {
  Plus,
  MapPin,
  Share2,
  MoreVertical,
  Mail,
  BookOpen,
  Calendar,
  X,
  Maximize2,
} from "lucide-react"
import { ContributionType } from "./contribute-modal"
import { QuillFeatherEmblem } from "./tribute-emblems"

export interface StoryItem {
  id: string
  authorName: string
  authorRelationship?: string
  authorEmail?: string
  dateOrYear: string
  chronologicalYear?: number
  location?: string
  story: string
  photoUrl?: string
  photoUrls?: string[]
  photoCaption?: string
  createdAt?: string
}

export const DEFAULT_STORIES: StoryItem[] = [
  {
    id: "story-1",
    authorName: "Anita Carter",
    authorRelationship: "Daughter",
    dateOrYear: "1994",
    chronologicalYear: 1994,
    location: "London, UK",
    story:
      "Dad couldn’t walk past a broken appliance without trying to repair it. Once he spent half of Christmas Day fixing Mrs. Higgins’ washing machine while everyone was waiting for dinner. He wouldn’t leave until it spun without rattling, then ate cold turkey with greasy hands and a giant grin.",
    photoUrl: "/historical-wedding-photo.webp",
    photoCaption: "Christmas morning in the kitchen, 1994",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
  {
    id: "story-2",
    authorName: "Sarah Jenkins",
    authorRelationship: "Senior Apprentice",
    dateOrYear: "1998",
    chronologicalYear: 1998,
    location: "Carter Workshop",
    story:
      "Thirty years at the bench and I never once heard him raise his voice. Whenever an apprentice broke a delicate clock spring, Bob would just pour a fresh cup of tea, smile, and say: ‘Well, now you know exactly how much pressure it takes to break one. That’s called learning.’",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 120).toISOString(),
  },
  {
    id: "story-3",
    authorName: "Rahul Carter",
    authorRelationship: "Grandson",
    dateOrYear: "2012",
    chronologicalYear: 2012,
    location: "Back Porch, Devon",
    story:
      "He spent three months carving a miniature wooden chess set for my tenth birthday. Every piece was carved from spare oak offcuts from the grandfather clocks. I still keep the King in my desk drawer at university.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 180).toISOString(),
  },
]

interface LifeStoriesProps {
  stories?: StoryItem[]
  fullName?: string
  memorialId?: string
  slug?: string
  isDemo?: boolean
  onOpenContribute: (type?: ContributionType) => void
}

export function LifeStories({
  stories,
  fullName = "Robert Carter",
  memorialId,
  slug,
  isDemo = false,
  onOpenContribute,
}: LifeStoriesProps) {
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({})
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [lightboxPhoto, setLightboxPhoto] = useState<{ url: string; caption?: string } | null>(null)

  const activeStories = isDemo
    ? stories && stories.length > 0
      ? stories
      : DEFAULT_STORIES
    : stories || []

  const firstName = fullName.split(" ")[0] || fullName

  const sorted = [...activeStories].sort((a, b) => {
    if (a.createdAt && b.createdAt) {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    }
    return 0
  })

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const handleShare = async (item: StoryItem) => {
    const url = typeof window !== "undefined" ? window.location.href : ""
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url)
        setCopiedId(item.id)
        setTimeout(() => setCopiedId(null), 2500)
      }
    } catch {
      // Ignore
    }
    setActiveMenuId(null)
  }

  return (
    <section
      id="memories"
      className="py-14 sm:py-20 px-4 max-w-4xl mx-auto flex flex-col gap-8 scroll-mt-24"
    >
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/[0.06] pb-6">
        <div className="flex flex-col gap-1">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-[#8b5a45] uppercase tracking-wider mb-0.5">
            <BookOpen className="size-3.5" />
            <span>Community Archive</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-[#181925]">
            Stories & Memories of {firstName}
          </h2>
          <p className="text-xs sm:text-sm text-[#71717a] max-w-xl leading-relaxed">
            Personal anecdotes, humorous memories, and quiet reflections shared by family, friends, and those who knew {firstName}.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onOpenContribute("memory")}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#181925] hover:bg-[#252736] text-white text-xs font-medium transition-all cursor-pointer shadow-xs active:scale-95 shrink-0 self-start sm:self-auto"
        >
          <Plus className="size-3.5" />
          <span>Share a Story</span>
        </button>
      </div>

      {/* Stories Reading Feed */}
      {sorted.length === 0 ? (
        <div className="py-16 text-center text-sm text-[#71717a] rounded-3xl bg-[#f7f7f8] border border-black/[0.06] flex flex-col items-center justify-center gap-3">
          <div className="size-12 rounded-2xl bg-white border border-black/[0.06] text-[#8b5a45] flex items-center justify-center">
            <QuillFeatherEmblem size={28} />
          </div>
          <p className="max-w-md text-xs sm:text-sm">
            No memories have been shared yet. Be the first to share an anecdote, a reflection, or a story about {firstName}.
          </p>
          <button
            type="button"
            onClick={() => onOpenContribute("memory")}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#181925] text-white text-xs font-medium hover:bg-[#252736] transition-all cursor-pointer shadow-xs active:scale-95 mt-1"
          >
            <Plus className="size-3.5" />
            <span>Share a Story</span>
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {sorted.map((item) => {
            const isExpanded = Boolean(expandedIds[item.id])
            const shouldTruncate = item.story.length > 280
            const isMenuOpen = activeMenuId === item.id

            return (
              <article
                key={item.id}
                className="p-6 sm:p-8 rounded-3xl bg-[#f7f7f8] border border-black/[0.06] flex flex-col gap-4 transition-all hover:border-black/[0.12] relative group shadow-none"
              >
                {/* Author & Context Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-2xl bg-white border border-black/[0.06] text-[#8b5a45] flex items-center justify-center shrink-0">
                      <QuillFeatherEmblem size={24} />
                    </div>

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
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-[#888] mt-0.5 font-mono flex-wrap">
                        {item.dateOrYear && <span>{item.dateOrYear}</span>}
                        {item.chronologicalYear && item.chronologicalYear !== Number(item.dateOrYear) && (
                          <span className="inline-flex items-center gap-1 font-mono">
                            <Calendar className="size-3" />
                            <span>c. {item.chronologicalYear}</span>
                          </span>
                        )}
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
                  </div>

                  {/* Options Menu */}
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
                          <span>{copiedId === item.id ? "Link copied!" : "Share this story"}</span>
                        </button>
                        {item.authorEmail && (
                          <a
                            href={`mailto:${item.authorEmail}?subject=Regarding your story about ${fullName}`}
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

                {/* The Written Story Body */}
                <div className="text-[15px] sm:text-base leading-relaxed sm:leading-7 text-[#2c2d30] font-normal pt-1">
                  <p className="whitespace-pre-line">
                    {shouldTruncate && !isExpanded
                      ? `${item.story.slice(0, 260)}...`
                      : item.story}
                  </p>
                  {shouldTruncate && (
                    <button
                      type="button"
                      onClick={() => toggleExpand(item.id)}
                      className="text-xs font-semibold text-[#8b5a45] hover:underline cursor-pointer mt-2 inline-block select-none"
                    >
                      {isExpanded ? "read less" : "read full story"}
                    </button>
                  )}
                </div>

                {/* Attached Photograph(s) */}
                {((item.photoUrls && item.photoUrls.length > 0) || item.photoUrl) && (
                  <div className="pt-2">
                    {item.photoUrls && item.photoUrls.length > 1 ? (
                      <div className={`grid gap-2.5 ${item.photoUrls.length === 2 ? "grid-cols-2 max-w-lg" : "grid-cols-2 sm:grid-cols-3 max-w-xl"}`}>
                        {item.photoUrls.map((url, pIdx) => (
                          <div
                            key={pIdx}
                            onClick={() => setLightboxPhoto({ url, caption: `${item.authorName} · Photo ${pIdx + 1}` })}
                            className="relative rounded-2xl overflow-hidden border border-black/[0.08] bg-white aspect-4/3 cursor-pointer group/photo"
                          >
                            <img
                              src={url}
                              alt={`Memory photo ${pIdx + 1}`}
                              className="size-full object-cover transition-transform group-hover/photo:scale-[1.03] duration-300"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover/photo:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover/photo:opacity-100">
                              <div className="size-8 rounded-full bg-white/90 text-[#181925] flex items-center justify-center shadow-md">
                                <Maximize2 className="size-3.5" />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div
                        onClick={() => setLightboxPhoto({ url: (item.photoUrls?.[0] || item.photoUrl)!, caption: item.photoCaption || item.authorName })}
                        className="relative rounded-2xl overflow-hidden border border-black/[0.08] bg-white max-w-sm cursor-pointer group/photo"
                      >
                        <img
                          src={item.photoUrls?.[0] || item.photoUrl}
                          alt={item.photoCaption || "Memory photo"}
                          className="w-full max-h-72 object-cover transition-transform group-hover/photo:scale-[1.02] duration-300"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover/photo:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover/photo:opacity-100">
                          <div className="size-9 rounded-full bg-white/90 text-[#181925] flex items-center justify-center shadow-md">
                            <Maximize2 className="size-4" />
                          </div>
                        </div>
                        {item.photoCaption && (
                          <div className="p-2.5 bg-white border-t border-black/[0.06] text-xs text-[#666] italic">
                            {item.photoCaption}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </article>
            )
          })}
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxPhoto && (
        <div
          onClick={() => setLightboxPhoto(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-3xl max-h-[90vh] flex flex-col items-center gap-3"
          >
            <button
              type="button"
              onClick={() => setLightboxPhoto(null)}
              className="absolute -top-10 right-0 text-white/80 hover:text-white transition-colors cursor-pointer"
            >
              <X className="size-6" />
            </button>
            <img
              src={lightboxPhoto.url}
              alt="Full size memory photograph"
              className="max-h-[80vh] w-auto rounded-2xl object-contain shadow-2xl border border-white/10"
            />
            {lightboxPhoto.caption && (
              <p className="text-sm text-white/90 text-center">{lightboxPhoto.caption}</p>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
