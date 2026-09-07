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
import { useOptimisticReceipts } from "@/lib/memorial/optimistic-receipts"
import { MemoryComposer } from "./memory-composer"
import { SectionEyebrow } from "./section-eyebrow"

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
  isOptimistic?: boolean
  contentFormat?: "html" | "text"
}

interface LifeStoriesProps {
  stories?: StoryItem[]
  fullName?: string
  memorialId?: string
  slug?: string
  isDemo?: boolean
  onOpenContribute: (type?: ContributionType) => void
  showComposer?: boolean
}

export function LifeStories({
  stories,
  fullName = "",
  memorialId,
  slug,
  isDemo = false,
  onOpenContribute,
  showComposer = false,
}: LifeStoriesProps) {
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({})
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [lightboxPhoto, setLightboxPhoto] = useState<{ url: string; caption?: string } | null>(null)

  const activeStories = stories || []

  const firstName = fullName.split(" ")[0] || fullName

  const optimisticReceipts = useOptimisticReceipts(slug || memorialId || "", activeStories)

  const optimisticStories: StoryItem[] = optimisticReceipts
    .filter((r) => r.contribution_type === "story" || Boolean(r.approx_year) || (r.photo_urls && r.photo_urls.length > 0))
    .map((r) => ({
      id: r.id,
      authorName: r.author_name,
      authorRelationship: r.author_relationship || "",
      dateOrYear: r.approx_year ? String(r.approx_year) : "Just now",
      chronologicalYear: typeof r.approx_year === "number" ? r.approx_year : (r.approx_year ? parseInt(String(r.approx_year), 10) || undefined : undefined),
      location: r.location || undefined,
      story: r.story.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim(),
      photoUrl: r.photo_url || (r.photo_urls && r.photo_urls[0]) || undefined,
      photoUrls: r.photo_urls && r.photo_urls.length ? r.photo_urls : undefined,
      createdAt: r.created_at,
      isOptimistic: true,
    }))

  const combined = [
    ...optimisticStories,
    ...activeStories.filter((s) => !optimisticReceipts.some((r) => r.id === s.id)),
  ]

  const sorted = [...combined].sort((a, b) => {
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
      className="py-12 px-4 max-w-4xl mx-auto flex flex-col gap-8 scroll-mt-24"
    >
      {/* Section Header */}
      <div className="flex items-end justify-between gap-3 border-b border-[var(--theme-border)] pb-3.5 sm:pb-5">
        <div className="flex flex-col gap-0.5 min-w-0 pr-1">
          <SectionEyebrow kind="memories" />
          <h2 className="text-xl sm:text-2xl md:text-3xl font-medium tracking-tight text-[var(--theme-text-primary)] truncate leading-tight">
            Stories & Memories <span className="hidden sm:inline">of {firstName}</span>
          </h2>
        </div>

        <button
          type="button"
          onClick={() => showComposer ? document.getElementById("share-memory")?.scrollIntoView({ behavior: "smooth" }) : onOpenContribute("memory")}
          className="inline-flex items-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-[var(--theme-accent)] hover:brightness-105 text-[var(--theme-accent-foreground)] text-xs font-medium transition-all cursor-pointer shadow-xs active:scale-95 shrink-0 whitespace-nowrap"
        >
          <Plus className="size-3.5 shrink-0" />
          <span className="hidden sm:inline">Share a memory</span>
          <span className="sm:hidden">Share</span>
        </button>
      </div>

      {/* Stories Reading Feed */}
      {sorted.length === 0 ? (
        <div className="py-16 text-center text-sm text-[var(--theme-text-muted)] rounded-3xl bg-[var(--theme-bg-surface-subtle)] border border-[var(--theme-border)] flex flex-col items-center justify-center gap-3">
          <div className="size-12 rounded-2xl bg-[var(--theme-bg-surface)] border border-[var(--theme-border)] text-[var(--theme-accent)] flex items-center justify-center">
            <QuillFeatherEmblem size={28} />
          </div>
          <p className="max-w-md text-xs sm:text-sm">
            No memories have been shared yet. Be the first to share an anecdote, a reflection, or a story about {firstName}.
          </p>
          <button
            type="button"
            onClick={() => showComposer ? document.getElementById("share-memory")?.scrollIntoView({ behavior: "smooth" }) : onOpenContribute("memory")}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[var(--theme-accent)] text-[var(--theme-accent-foreground)] text-xs font-medium hover:brightness-105 transition-all cursor-pointer shadow-xs active:scale-95 mt-1"
          >
            <Plus className="size-3.5" />
            <span>Share a memory</span>
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
                id={`story-${item.id}`}
                className="p-6 sm:p-8 rounded-3xl bg-[var(--theme-bg-surface)] border border-[var(--theme-border)] flex flex-col gap-4 transition-all hover:border-[var(--theme-accent)]/30 relative group shadow-none scroll-mt-28"
              >
                {/* Author & Context Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-2xl bg-white dark:bg-white/10 border border-[var(--theme-border)] text-[var(--theme-accent)] flex items-center justify-center shrink-0 shadow-2xs">
                      <QuillFeatherEmblem size={24} />
                    </div>

                    <div className="flex flex-col">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm sm:text-base font-semibold text-[var(--theme-text-primary)] tracking-tight">
                          {item.authorName}
                        </span>
                        {item.authorRelationship && (
                          <>
                            <span className="opacity-40">·</span>
                            <span className="text-xs text-[var(--theme-text-muted)] font-normal">
                              {item.authorRelationship}
                            </span>
                          </>
                        )}
                        {item.isOptimistic && (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-800 bg-emerald-50/90 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
                            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span>Sent to {firstName}&apos;s family</span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-[var(--theme-text-muted)] mt-0.5 font-mono flex-wrap">
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
                              <MapPin className="size-3 opacity-70" />
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
                      className="size-7 rounded-full hover:bg-black/[0.05] text-[var(--theme-text-muted)] hover:text-[var(--theme-text-primary)] flex items-center justify-center transition-colors cursor-pointer"
                      title="Options"
                    >
                      <MoreVertical className="size-4" />
                    </button>

                    {isMenuOpen && (
                      <div className="absolute right-0 top-8 z-30 w-44 rounded-2xl bg-[var(--theme-bg-surface)] border border-[var(--theme-border)] shadow-lg py-1.5 flex flex-col text-xs text-[var(--theme-text-body)] animate-in fade-in zoom-in-95">
                        <button
                          type="button"
                          onClick={() => handleShare(item)}
                          className="w-full px-3.5 py-2 text-left hover:bg-[var(--theme-bg-surface-subtle)] flex items-center gap-2 cursor-pointer"
                        >
                          <Share2 className="size-3.5 opacity-70" />
                          <span>{copiedId === item.id ? "Link copied!" : "Share this story"}</span>
                        </button>
                        {item.authorEmail && (
                          <a
                            href={`mailto:${item.authorEmail}?subject=Regarding your story about ${fullName}`}
                            className="w-full px-3.5 py-2 text-left hover:bg-[var(--theme-bg-surface-subtle)] flex items-center gap-2 cursor-pointer"
                          >
                            <Mail className="size-3.5 opacity-70" />
                            <span>Contact author</span>
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* The Written Story Body */}
                <div className="text-[15px] sm:text-base leading-relaxed sm:leading-7 text-[var(--theme-text-body)] font-normal pt-1">
                  {item.contentFormat === "html" && (!shouldTruncate || isExpanded) ? (
                    <div className="memory-rich-text" dangerouslySetInnerHTML={{ __html: item.story }} />
                  ) : (
                    <p className="whitespace-pre-line">
                      {shouldTruncate && !isExpanded ? `${item.story.replace(/<[^>]*>/g, "").slice(0, 260)}...` : item.story}
                    </p>
                  )}
                  {shouldTruncate && (
                    <button
                      type="button"
                      onClick={() => toggleExpand(item.id)}
                      className="text-xs font-semibold text-[var(--theme-accent)] hover:underline cursor-pointer mt-2 inline-block select-none"
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
                              loading="lazy"
                              decoding="async"
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
                          loading="lazy"
                          decoding="async"
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

      {showComposer && <MemoryComposer memorialId={memorialId} slug={slug || memorialId || ""} fullName={fullName} />}

      <style jsx global>{`
        .memory-rich-text > * + * { margin-top: 0.85rem; }
        .memory-rich-text h2 { font-family: var(--font-serif, Georgia, serif); font-size: 1.3rem; font-weight: 600; color: var(--theme-text-primary, #181925); }
        .memory-rich-text h3 { font-family: var(--font-serif, Georgia, serif); font-size: 1.12rem; font-weight: 600; color: var(--theme-text-primary, #181925); }
        .memory-rich-text blockquote { position: relative; margin: 1.25rem 0; padding: 0.2rem 0 0.2rem 2.25rem; border: none; background: transparent; color: var(--theme-text-primary, #181925); font-style: italic; }
        .memory-rich-text blockquote::before { content: ""; position: absolute; left: 0; top: 0.25rem; width: 1.25rem; height: 1.25rem; background-color: var(--theme-accent, #8b5a45); opacity: 0.45; mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor'%3E%3Cpath d='M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z'/%3E%3C/svg%3E"); -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor'%3E%3Cpath d='M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z'/%3E%3C/svg%3E"); mask-size: contain; -webkit-mask-size: contain; mask-repeat: no-repeat; -webkit-mask-repeat: no-repeat; }
        .memory-rich-text ul { list-style: disc; padding-left: 1.4rem; }
        .memory-rich-text ol { list-style: decimal; padding-left: 1.4rem; }
        .memory-rich-text a { color: var(--theme-accent, var(--primary)); text-decoration: underline; text-underline-offset: 3px; }
        .memory-rich-text hr { border: 0; border-top: 1px solid var(--theme-border, rgba(0,0,0,.09)); margin: 1.25rem 0; }
      `}</style>

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
