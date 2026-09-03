"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ArrowRight,
  Heart,
  Volume2,
  Calendar,
  MapPin,
  Clock,
  BookOpen,
  Image as ImageIcon,
  Users,
  MessageSquare,
  Plus,
  Send,
  CheckCircle2,
} from "lucide-react"
import { MemorialAudio } from "./memorial-audio"
import { MemorialTab } from "./memorial-nav"
import { ContributionType } from "./contribute-modal"
import { DEFAULT_MEMORIES } from "./memories-stream"
import { DEFAULT_PHOTOS } from "./photo-albums"

interface OverviewViewProps {
  fullName: string
  biography?: string | null
  onSelectTab: (tab: MemorialTab) => void
  onOpenContribute: (type?: ContributionType) => void
}

interface GuestbookNote {
  id: string
  author: string
  location?: string
  date: string
  message: string
}

const DEFAULT_GUESTBOOK: GuestbookNote[] = [
  {
    id: "gb-1",
    author: "Claire & David Wilson",
    location: "Bristol",
    date: "3 days ago",
    message: "Sending our deepest love to Meena and Anita. Robert was the gentlest man in Devon.",
  },
  {
    id: "gb-2",
    author: "George & Linda Sharma",
    location: "Toronto, Canada",
    date: "1 week ago",
    message: "Remembering all the warm summer afternoons at the cottage. Rest in peace, dear Bob.",
  },
  {
    id: "gb-3",
    author: "The Miller Family",
    location: "Exeter",
    date: "2 weeks ago",
    message: "The high street will never be the same without his quiet presence and bright smile.",
  },
]

export function OverviewView({
  fullName,
  biography,
  onSelectTab,
  onOpenContribute,
}: OverviewViewProps) {
  const firstName = fullName.split(" ")[0] || fullName

  // Lightweight guestbook local state
  const [notes, setNotes] = useState<GuestbookNote[]>(DEFAULT_GUESTBOOK)
  const [authorInput, setAuthorInput] = useState("")
  const [messageInput, setMessageInput] = useState("")
  const [hasSentNote, setHasSentNote] = useState(false)

  const handleSendGuestbook = (e: React.FormEvent) => {
    e.preventDefault()
    if (!authorInput.trim() || !messageInput.trim()) return

    const newNote: GuestbookNote = {
      id: `gb-${Date.now()}`,
      author: authorInput.trim(),
      date: "Just now",
      message: messageInput.trim(),
    }
    setNotes([newNote, ...notes])
    setAuthorInput("")
    setMessageInput("")
    setHasSentNote(true)
    setTimeout(() => setHasSentNote(false), 3500)
  }

  // 4 Milestone highlights for Overview preview
  const milestonePreviews = [
    { year: 1948, label: "Born in Exeter", detail: "Devon moors childhood" },
    { year: 1974, label: "Married Meena", detail: "St. Jude’s Church" },
    { year: 1983, label: "Carter Clocks", detail: "High street workshop" },
    { year: 2004, label: "Grandfather", detail: "Teaching Anita carpentry" },
  ]

  // Curated recent memories (first 2)
  const featuredMemories = DEFAULT_MEMORIES.slice(0, 2)

  // Curated photo mosaic (first 5)
  const photoMosaic = DEFAULT_PHOTOS.slice(0, 5)

  return (
    <div className="py-6 sm:py-10 px-4 max-w-4xl mx-auto flex flex-col gap-14 sm:gap-18">
      
      {/* 1. HEAR HIS VOICE (Featured Audio Player) */}
      <MemorialAudio />

      {/* 2. HIS STORY (Abbreviated Preview with "Read full story →") */}
      <section className="flex flex-col gap-5 border-t border-black/[0.06] pt-10">
        <div className="flex items-baseline justify-between gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-mono font-medium text-primary uppercase tracking-wider">
              Biography
            </span>
            <h2 className="text-xl sm:text-2xl font-medium tracking-tight text-[#181925]">
              His story
            </h2>
          </div>

          <button
            type="button"
            onClick={() => onSelectTab("life")}
            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline cursor-pointer select-none"
          >
            <span>Read full story</span>
            <ArrowRight className="size-3.5" />
          </button>
        </div>

        <div className="prose prose-neutral max-w-none text-[15px] sm:text-[16px] leading-7 text-[#444] line-clamp-3">
          {biography || (
            <>
              Robert was born in Exeter during the autumn of 1948, the younger of two brothers raised on the edge of the Devon moors. In 1968, he took an apprenticeship in horology in London’s Clerkenwell district, learning how to carve balance wheels by hand under master watchmakers. It was during this period on Portobello Market that he met Meena, whom he married in 1974 at St. Jude’s Church before opening Carter Clocks on the high street in 1983.
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => onSelectTab("life")}
          className="self-start inline-flex items-center gap-1.5 text-xs font-medium text-[#181925] bg-[#f4f4f6] hover:bg-neutral-200 px-3.5 py-1.5 rounded-full transition-colors cursor-pointer"
        >
          <span>Continue reading biography</span>
          <ArrowRight className="size-3" />
        </button>
      </section>

      {/* 3. RECENTLY REMEMBERED (2-3 Featured Memories) */}
      <section className="flex flex-col gap-5 border-t border-black/[0.06] pt-10">
        <div className="flex items-baseline justify-between gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-mono font-medium text-primary uppercase tracking-wider">
              Family & Friends
            </span>
            <h2 className="text-xl sm:text-2xl font-medium tracking-tight text-[#181925]">
              Recently remembered
            </h2>
          </div>

          <button
            type="button"
            onClick={() => onSelectTab("memories")}
            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline cursor-pointer select-none"
          >
            <span>See all {DEFAULT_MEMORIES.length} memories</span>
            <ArrowRight className="size-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {featuredMemories.map((mem) => (
            <div
              key={mem.id}
              onClick={() => onSelectTab("memories")}
              className="p-5 sm:p-6 rounded-2xl bg-[#f7f7f8] border border-black/[0.05] hover:border-black/[0.12] transition-all cursor-pointer flex flex-col justify-between gap-3 group"
            >
              <div className="flex items-center gap-2.5">
                <div className="size-7 rounded-full bg-white border border-black/[0.06] text-xs font-semibold text-[#181925] flex items-center justify-center shrink-0">
                  {mem.authorName.charAt(0)}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-medium text-[#181925] truncate group-hover:text-primary transition-colors">
                    {mem.authorName}
                  </span>
                  <span className="text-[10px] text-[#71717a]">{mem.authorRelationship}</span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-[#333] leading-relaxed line-clamp-3">
                “{mem.story}”
              </p>

              <div className="pt-2 border-t border-black/[0.04] flex items-center justify-between text-[10px] font-mono text-[#888]">
                <span>{mem.dateOrYear}</span>
                <span className="text-primary group-hover:translate-x-0.5 transition-transform">Read memory →</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. A LIFE IN MOMENTS (Timeline Milestone Preview) */}
      <section className="flex flex-col gap-5 border-t border-black/[0.06] pt-10">
        <div className="flex items-baseline justify-between gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-mono font-medium text-primary uppercase tracking-wider">
              Chronology
            </span>
            <h2 className="text-xl sm:text-2xl font-medium tracking-tight text-[#181925]">
              A life in moments
            </h2>
          </div>

          <button
            type="button"
            onClick={() => onSelectTab("life")}
            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline cursor-pointer select-none"
          >
            <span>Explore full timeline</span>
            <ArrowRight className="size-3.5" />
          </button>
        </div>

        {/* 4-Step Milestone Chain */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {milestonePreviews.map((m, idx) => (
            <div
              key={idx}
              onClick={() => onSelectTab("life")}
              className="p-4 rounded-2xl bg-[#f7f7f8] border border-black/[0.05] hover:border-black/[0.12] transition-all cursor-pointer flex flex-col gap-2 group"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm font-semibold text-primary">
                  {m.year}
                </span>
                <span className="size-1.5 rounded-full bg-primary/40 group-hover:bg-primary transition-colors" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-medium text-[#181925] group-hover:text-primary transition-colors truncate">
                  {m.label}
                </span>
                <span className="text-[10px] text-[#71717a] truncate">
                  {m.detail}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. PHOTOGRAPHS (Asymmetric Mosaic Preview) */}
      <section className="flex flex-col gap-5 border-t border-black/[0.06] pt-10">
        <div className="flex items-baseline justify-between gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-mono font-medium text-primary uppercase tracking-wider">
              Archive Gallery
            </span>
            <h2 className="text-xl sm:text-2xl font-medium tracking-tight text-[#181925]">
              Photographs of {firstName}
            </h2>
          </div>

          <button
            type="button"
            onClick={() => onSelectTab("photos")}
            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline cursor-pointer select-none"
          >
            <span>View all {DEFAULT_PHOTOS.length} photos</span>
            <ArrowRight className="size-3.5" />
          </button>
        </div>

        {/* Asymmetric 5-Photo Mosaic */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Main Large Portrait (spans 2 rows on desktop) */}
          <div
            onClick={() => onSelectTab("photos")}
            className="col-span-2 row-span-2 rounded-2xl overflow-hidden bg-neutral-100 border border-black/[0.06] relative group cursor-pointer aspect-square sm:aspect-auto sm:min-h-[260px]"
          >
            <img
              src={photoMosaic[0].url}
              alt={photoMosaic[0].title}
              className="size-full object-cover grayscale contrast-105 group-hover:scale-102 transition-transform duration-300"
            />
            <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/70 to-transparent text-white text-xs flex justify-between items-end">
              <span className="font-medium truncate">{photoMosaic[0].title}</span>
              <span className="font-mono text-[10px] text-white/80">{photoMosaic[0].year}</span>
            </div>
          </div>

          {/* 3 Flanking Photos */}
          {photoMosaic.slice(1, 5).map((p) => (
            <div
              key={p.id}
              onClick={() => onSelectTab("photos")}
              className="rounded-xl overflow-hidden bg-neutral-100 border border-black/[0.06] relative group cursor-pointer aspect-4/3"
            >
              <img
                src={p.url}
                alt={p.title}
                className="size-full object-cover grayscale contrast-105 group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/60 to-transparent text-white text-[10px] flex justify-between items-end">
                <span className="truncate">{p.title}</span>
                <span className="font-mono text-[9px] text-white/80">{p.year}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. PEOPLE PREVIEW (Small Faces & Names) */}
      <section className="flex flex-col gap-4 border-t border-black/[0.06] pt-10">
        <div className="flex items-baseline justify-between gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-mono font-medium text-primary uppercase tracking-wider">
              Relationships
            </span>
            <h2 className="text-xl sm:text-2xl font-medium tracking-tight text-[#181925]">
              People who knew him
            </h2>
          </div>

          <button
            type="button"
            onClick={() => onSelectTab("people")}
            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline cursor-pointer select-none"
          >
            <span>See all people in his life</span>
            <ArrowRight className="size-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-1">
          {[
            { name: "Meena", role: "Wife" },
            { name: "Anita", role: "Daughter" },
            { name: "David", role: "Brother" },
            { name: "Rahul", role: "Grandson" },
            { name: "Sarah", role: "Apprentice" },
            { name: "Thomas", role: "Friend" },
          ].map((person, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectTab("people")}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f7f7f8] hover:bg-neutral-200 border border-black/[0.05] transition-colors cursor-pointer shrink-0"
            >
              <div className="size-5 rounded-full bg-white text-[10px] font-semibold text-[#181925] flex items-center justify-center">
                {person.name.charAt(0)}
              </div>
              <span className="text-xs font-medium text-[#181925]">{person.name}</span>
              <span className="text-[10px] text-[#888]">· {person.role}</span>
            </button>
          ))}
        </div>
      </section>

      {/* 7. DEDICATED GUESTBOOK / LEAVE A MESSAGE */}
      <section className="flex flex-col gap-6 border-t border-black/[0.06] pt-10">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-mono font-medium text-primary uppercase tracking-wider">
            Guestbook & Condolences
          </span>
          <h2 className="text-xl sm:text-2xl font-medium tracking-tight text-[#181925]">
            Leave a message
          </h2>
          <p className="text-xs sm:text-sm text-[#71717a]">
            A quiet space for friends, neighbours, and colleagues to share warm thoughts with {firstName}&apos;s family.
          </p>
        </div>

        {/* Inline Submission Form */}
        <form
          onSubmit={handleSendGuestbook}
          className="p-5 sm:p-6 rounded-3xl bg-[#f7f7f8] border border-black/[0.06] flex flex-col gap-3.5"
        >
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              required
              value={authorInput}
              onChange={(e) => setAuthorInput(e.target.value)}
              placeholder="Your name or family name *"
              className="flex-1 px-3.5 py-2 rounded-xl bg-white border border-black/[0.08] text-xs text-[#181925] placeholder:text-[#aaa] outline-none focus:border-primary/50 transition-colors"
            />
          </div>

          <textarea
            required
            rows={2}
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder="Write a message of remembrance or support for the family..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-black/[0.08] text-xs text-[#181925] placeholder:text-[#aaa] outline-none focus:border-primary/50 transition-colors resize-none leading-relaxed"
          />

          <div className="flex items-center justify-between pt-1">
            {hasSentNote ? (
              <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                <CheckCircle2 className="size-3.5" />
                <span>Message added to guestbook</span>
              </span>
            ) : (
              <span className="text-[11px] text-[#888]">No account required</span>
            )}

            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#181925] hover:bg-[#252736] text-white text-xs font-medium transition-colors cursor-pointer shadow-xs active:scale-95"
            >
              <Send className="size-3" />
              <span>Post message</span>
            </button>
          </div>
        </form>

        {/* Existing Guestbook Messages Stream */}
        <div className="flex flex-col gap-2.5">
          {notes.map((note) => (
            <div
              key={note.id}
              className="p-4 rounded-2xl bg-white border border-black/[0.05] flex flex-col gap-1.5"
            >
              <div className="flex items-baseline justify-between text-xs">
                <div className="flex items-baseline gap-2">
                  <span className="font-medium text-[#181925]">{note.author}</span>
                  {note.location && (
                    <span className="text-[10px] text-[#888] font-mono">({note.location})</span>
                  )}
                </div>
                <span className="text-[10px] text-[#888] font-mono">{note.date}</span>
              </div>
              <p className="text-xs text-[#555] leading-relaxed">{note.message}</p>
            </div>
          ))}
        </div>
      </section>

    </div>
  )
}
