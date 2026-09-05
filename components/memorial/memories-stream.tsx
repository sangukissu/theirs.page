"use client"

import { useState, useEffect, useRef } from "react"
import {
  Plus,
  MapPin,
  Share2,
  MoreVertical,
  Mail,
  Loader2,
  AlertCircle,
} from "lucide-react"
import { ContributionType } from "./contribute-modal"
import {
  TributeEmblem,
  TributeType,
  BotanicalFlowerEmblem,
  CandleFlameEmblem,
  QuillFeatherEmblem,
} from "./tribute-emblems"
import { Turnstile } from "@marsidev/react-turnstile"

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
  onOpenContribute?: (type?: ContributionType) => void
}

export function MemoriesStream({
  memories,
  fullName = "Robert Carter",
  memorialId,
  slug,
  isDemo = false,
  onOpenContribute,
}: MemoriesStreamProps) {
  const [items, setItems] = useState<MemoryItem[]>(() => {
    if (isDemo) {
      return memories && memories.length > 0 ? memories : DEFAULT_MEMORIES
    }
    return memories || []
  })

  useEffect(() => {
    if (memories) {
      setItems(memories)
    }
  }, [memories])

  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({})
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Open tribute form state
  const [tributeRitual, setTributeRitual] = useState<"flower" | "candle" | "note">("flower")
  const [authorName, setAuthorName] = useState("")
  const [relationship, setRelationship] = useState("")
  const [content, setContent] = useState("")
  const [turnstileToken, setTurnstileToken] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const formNameInputRef = useRef<HTMLInputElement>(null)

  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "0x4AAAAAAElC6yv2vY7dR2dn"
  const firstName = fullName.split(" ")[0] || fullName

  // Order memories strictly newest first
  const sorted = [...items].sort((a, b) => {
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

  const handleScrollToForm = () => {
    const el = document.getElementById("open-tribute-form")
    if (el) {
      el.scrollIntoView({ behavior: "smooth" })
      setTimeout(() => formNameInputRef.current?.focus(), 300)
    }
  }

  const handleTributeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!authorName.trim()) return

    const effectiveContent =
      content.trim() ||
      (tributeRitual === "flower"
        ? `Laying a flower in loving memory of ${firstName}.`
        : tributeRitual === "candle"
        ? `Lighting a candle in loving memory of ${firstName}.`
        : `A quiet note of remembrance for ${firstName}.`)

    setIsSubmitting(true)
    setFormError(null)

    try {
      const targetIdentifier = memorialId || slug || ""
      const res = await fetch(`/api/memorials/${targetIdentifier}/contribute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "tribute",
          tribute_type: tributeRitual,
          author_name: authorName.trim(),
          author_relationship: relationship.trim() || null,
          content: effectiveContent,
          turnstile_token: turnstileToken || undefined,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit tribute")
      }

      const newTribute: MemoryItem = {
        id: data.memory?.id || `trib-local-${Date.now()}`,
        authorName: authorName.trim(),
        authorRelationship: relationship.trim() || undefined,
        dateOrYear: "Just now",
        story: effectiveContent,
        tributeType: tributeRitual,
        createdAt: new Date().toISOString(),
      }

      setItems((prev) => [newTribute, ...prev])
      setIsSubmitted(true)
    } catch (err: any) {
      console.error("Open tribute form submit error:", err)
      setFormError(err.message || "Failed to submit tribute. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const ritualPlaceholder =
    tributeRitual === "flower"
      ? `“A blossom in memory of ${firstName}, remembered with love and peace.”`
      : tributeRitual === "candle"
      ? `“A candle lit for ${firstName}, whose light and warmth will never leave us.”`
      : `“A quiet note of remembrance, prayer, or thoughts for the family...”`

  const ritualSubmitLabel =
    tributeRitual === "flower"
      ? "Lay Flower"
      : tributeRitual === "candle"
      ? "Light Candle"
      : "Leave Note"

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
          onClick={handleScrollToForm}
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
            onClick={handleScrollToForm}
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

      {/* Embedded Open Tribute Form with all 3 Ritual Options */}
      <div
        id="open-tribute-form"
        className="rounded-3xl bg-[#f7f7f8] border border-black/[0.08] p-6 sm:p-8 scroll-mt-28 mt-2 shadow-xs transition-all"
      >
        {isSubmitted ? (
          <div className="py-8 text-center flex flex-col items-center justify-center gap-3 animate-in fade-in">
            <div className="size-14 rounded-2xl bg-[#faf8f5] border border-[#8b5a45]/20 text-[#8b5a45] flex items-center justify-center shadow-xs">
              {tributeRitual === "candle" ? (
                <CandleFlameEmblem size={30} />
              ) : tributeRitual === "flower" ? (
                <BotanicalFlowerEmblem size={30} />
              ) : (
                <QuillFeatherEmblem size={30} />
              )}
            </div>
            <h3 className="text-lg font-medium text-[#181925]">
              Thank you, {authorName}
            </h3>
            <p className="text-xs sm:text-sm text-[#71717a] max-w-md leading-relaxed">
              Your tribute to {firstName} has been placed. Thank you for honoring their memory.
            </p>
            <button
              type="button"
              onClick={() => {
                setContent("")
                setIsSubmitted(false)
                setTurnstileToken("")
              }}
              className="mt-2 text-xs font-semibold text-[#8b5a45] hover:underline cursor-pointer"
            >
              Leave another tribute &rarr;
            </button>
          </div>
        ) : (
          <form onSubmit={handleTributeSubmit} className="flex flex-col gap-5">
            {/* Form Eyebrow & Header */}
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-mono text-[#8b5a45] uppercase tracking-wider">
                Offer a Gesture
              </span>
              <h3 className="text-lg sm:text-xl font-medium tracking-tight text-[#181925]">
                Leave a Tribute for {firstName}
              </h3>
              <p className="text-xs text-[#71717a]">
                Choose a gesture below to honor {firstName}&apos;s life and comfort the family.
              </p>
            </div>

            {/* 1. Ritual Selector (Segmented 3-Way Toggle) */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => setTributeRitual("flower")}
                className={`flex flex-col items-center justify-center py-3.5 px-2 rounded-2xl border transition-all cursor-pointer text-center ${
                  tributeRitual === "flower"
                    ? "bg-[#faf8f5] border-[#8b5a45] text-[#8b5a45] ring-1 ring-[#8b5a45]/30 shadow-xs"
                    : "bg-white border-black/[0.08] text-[#555] hover:bg-neutral-50 hover:text-[#181925]"
                }`}
              >
                <BotanicalFlowerEmblem size={26} className="shrink-0 mb-1" />
                <span className="text-xs font-medium">Lay a Flower</span>
              </button>

              <button
                type="button"
                onClick={() => setTributeRitual("candle")}
                className={`flex flex-col items-center justify-center py-3.5 px-2 rounded-2xl border transition-all cursor-pointer text-center ${
                  tributeRitual === "candle"
                    ? "bg-[#faf8f5] border-[#8b5a45] text-[#8b5a45] ring-1 ring-[#8b5a45]/30 shadow-xs"
                    : "bg-white border-black/[0.08] text-[#555] hover:bg-neutral-50 hover:text-[#181925]"
                }`}
              >
                <CandleFlameEmblem size={26} className="shrink-0 mb-1" />
                <span className="text-xs font-medium">Light a Candle</span>
              </button>

              <button
                type="button"
                onClick={() => setTributeRitual("note")}
                className={`flex flex-col items-center justify-center py-3.5 px-2 rounded-2xl border transition-all cursor-pointer text-center ${
                  tributeRitual === "note"
                    ? "bg-[#faf8f5] border-[#8b5a45] text-[#8b5a45] ring-1 ring-[#8b5a45]/30 shadow-xs"
                    : "bg-white border-black/[0.08] text-[#555] hover:bg-neutral-50 hover:text-[#181925]"
                }`}
              >
                <QuillFeatherEmblem size={26} className="shrink-0 mb-1" />
                <span className="text-xs font-medium">Leave a Note</span>
              </button>
            </div>

            {/* 2. Contributor Name & Relationship */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-mono text-[#71717a] uppercase tracking-wider">
                  Your Name *
                </label>
                <input
                  ref={formNameInputRef}
                  type="text"
                  required
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="e.g. David Miller"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-black/[0.08] text-sm text-[#181925] placeholder:text-[#aaa] outline-none focus:border-[#8b5a45]/50 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-mono text-[#71717a] uppercase tracking-wider">
                  Relationship to {firstName}
                </label>
                <input
                  type="text"
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  placeholder="e.g. Daughter, Lifelong friend, Colleague"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-black/[0.08] text-sm text-[#181925] placeholder:text-[#aaa] outline-none focus:border-[#8b5a45]/50 transition-colors"
                />
              </div>
            </div>

            {/* 3. Words of Remembrance */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-mono text-[#71717a] uppercase tracking-wider">
                {tributeRitual === "flower"
                  ? "Words to accompany your flower (optional)"
                  : tributeRitual === "candle"
                  ? "Words to accompany your candle (optional)"
                  : "Words of remembrance *"}
              </label>
              <textarea
                required={tributeRitual === "note"}
                rows={3}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={ritualPlaceholder}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-black/[0.08] text-sm text-[#181925] placeholder:text-[#aaa] outline-none focus:border-[#8b5a45]/50 transition-colors resize-none leading-relaxed"
              />
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium flex items-center gap-2">
                <AlertCircle className="size-3.5 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* 4. Turnstile Captcha & Submit */}
            <div className="pt-1 flex flex-col sm:flex-row items-center justify-between gap-4">
              {siteKey ? (
                <Turnstile
                  siteKey={siteKey}
                  onSuccess={setTurnstileToken}
                  onExpire={() => setTurnstileToken("")}
                  onError={() => setTurnstileToken("")}
                />
              ) : (
                <div />
              )}

              <button
                type="submit"
                disabled={isSubmitting || !authorName.trim()}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium transition-all cursor-pointer bg-[#181925] hover:bg-[#252736] text-white shadow-xs active:scale-[0.98] h-10 px-6 text-xs select-none disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    <span>Placing Tribute...</span>
                  </>
                ) : (
                  <>
                    {tributeRitual === "flower" && <BotanicalFlowerEmblem size={16} />}
                    {tributeRitual === "candle" && <CandleFlameEmblem size={16} />}
                    {tributeRitual === "note" && <QuillFeatherEmblem size={16} />}
                    <span>{ritualSubmitLabel}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>

    </section>
  )
}
