"use client"

import { useState } from "react"
import { MessageSquare, Send, CheckCircle2 } from "lucide-react"

export interface GuestbookNote {
  id: string
  author: string
  location?: string
  date: string
  message: string
}

export const DEFAULT_GUESTBOOK: GuestbookNote[] = [
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

interface GuestbookStreamProps {
  fullName: string
  notes?: GuestbookNote[]
  isDemo?: boolean
}

export function GuestbookStream({ fullName, notes, isDemo = false }: GuestbookStreamProps) {
  const [guestbookNotes, setGuestbookNotes] = useState<GuestbookNote[]>(
    isDemo
      ? (notes && notes.length > 0 ? notes : DEFAULT_GUESTBOOK)
      : (notes || [])
  )
  const [authorInput, setAuthorInput] = useState("")
  const [messageInput, setMessageInput] = useState("")
  const [hasSentNote, setHasSentNote] = useState(false)

  const firstName = fullName.split(" ")[0] || fullName

  const handleSendGuestbook = (e: React.FormEvent) => {
    e.preventDefault()
    if (!authorInput.trim() || !messageInput.trim()) return

    const newNote: GuestbookNote = {
      id: `gb-${Date.now()}`,
      author: authorInput.trim(),
      date: "Just now",
      message: messageInput.trim(),
    }
    setGuestbookNotes([newNote, ...guestbookNotes])
    setAuthorInput("")
    setMessageInput("")
    setHasSentNote(true)
    setTimeout(() => setHasSentNote(false), 3500)
  }

  return (
    <section id="guestbook" className="py-12 sm:py-16 px-4 max-w-4xl mx-auto flex flex-col gap-8 scroll-mt-24">
      <div className="flex flex-col gap-1.5 border-b border-black/[0.06] pb-6">
        <span className="text-xs font-mono font-medium text-primary uppercase tracking-wider">
          Guestbook & Condolences
        </span>
        <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-[#181925]">
          Leave a message for the family
        </h2>
        <p className="text-xs sm:text-sm text-[#71717a]">
          A quiet place for friends, neighbours, and colleagues to share warm thoughts and condolences.
        </p>
      </div>

      {/* Inline Submission Form */}
      <form
        onSubmit={handleSendGuestbook}
        className="p-5 sm:p-7 rounded-3xl bg-[#f7f7f8] border border-black/[0.06] flex flex-col gap-3.5"
      >
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            required
            value={authorInput}
            onChange={(e) => setAuthorInput(e.target.value)}
            placeholder="Your name or family name *"
            className="flex-1 px-4 py-2.5 rounded-xl bg-white border border-black/[0.08] text-xs text-[#181925] placeholder:text-[#aaa] outline-none focus:border-primary/50 transition-colors"
          />
        </div>

        <textarea
          required
          rows={3}
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          placeholder={`Write a message of remembrance or support for ${firstName}'s family...`}
          className="w-full px-4 py-3 rounded-xl bg-white border border-black/[0.08] text-xs text-[#181925] placeholder:text-[#aaa] outline-none focus:border-primary/50 transition-colors resize-none leading-relaxed"
        />

        <div className="flex items-center justify-between pt-1">
          {hasSentNote ? (
            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
              <CheckCircle2 className="size-3.5" />
              <span>Message added to guestbook</span>
            </span>
          ) : (
            <span className="text-[11px] text-[#888]">No account required · Added immediately</span>
          )}

          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-[#181925] hover:bg-[#252736] text-white text-xs font-medium transition-colors cursor-pointer shadow-xs active:scale-95"
          >
            <Send className="size-3" />
            <span>Post message</span>
          </button>
        </div>
      </form>

      {/* Notes Stream / Empty State */}
      {guestbookNotes.length === 0 ? (
        <div className="py-10 text-center text-sm text-[#71717a] rounded-3xl bg-[#fafafb] border border-black/[0.06]">
          No messages posted yet. Be the first to leave a message for the family.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {guestbookNotes.map((note) => (
            <div
              key={note.id}
              className="p-5 rounded-2xl bg-white border border-black/[0.05] flex flex-col gap-2 shadow-2xs"
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
              <p className="text-xs sm:text-sm text-[#444] leading-relaxed">
                “{note.message}”
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
