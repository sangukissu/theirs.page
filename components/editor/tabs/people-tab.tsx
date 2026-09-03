"use client"

import { useState } from "react"
import { Plus, Trash2, Users } from "lucide-react"

export interface EditorPerson {
  id: string
  name: string
  relationship: string
  photo_url?: string | null
  note?: string | null
}

interface PeopleTabProps {
  memorialId: string
  fullName: string
  people: EditorPerson[]
  onAddPerson: (person: EditorPerson) => void
  onRemovePerson: (id: string) => void
}

export function PeopleTab({
  memorialId,
  fullName,
  people,
  onAddPerson,
  onRemovePerson,
}: PeopleTabProps) {
  const [nameInput, setNameInput] = useState("")
  const [relInput, setRelInput] = useState("")
  const [noteInput, setNoteInput] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const firstName = fullName.split(" ")[0] || "them"
  const DRAFT_KEY = `theirs_people_draft_${memorialId}`

  // Restore unsaved draft on mount
  useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(DRAFT_KEY)
        if (saved) {
          const { name, rel, note } = JSON.parse(saved)
          if (name) setNameInput(name)
          if (rel) setRelInput(rel)
          if (note) setNoteInput(note)
        }
      } catch {}
    }
  })

  const updateDraft = (nextName: string, nextRel: string, nextNote: string) => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify({ name: nextName, rel: nextRel, note: nextNote }))
      } catch {}
    }
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nameInput.trim() || !relInput.trim()) return

    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/memorials/${memorialId}/people`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: nameInput.trim(),
          relationship: relInput.trim(),
          note: noteInput.trim() || null,
        }),
      })

      const data = await res.json()
      if (res.ok && data.person) {
        onAddPerson(data.person)
        setNameInput("")
        setRelInput("")
        setNoteInput("")
        if (typeof window !== "undefined") {
          try {
            localStorage.removeItem(DRAFT_KEY)
          } catch {}
        }
      }
    } catch (err) {
      console.error("Failed to add person:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/memorials/${memorialId}/people?personId=${id}`, {
        method: "DELETE",
      })
      onRemovePerson(id)
    } catch (err) {
      console.error("Failed to delete person:", err)
    }
  }

  return (
    <div className="flex flex-col gap-8 max-w-2xl">
      <div className="flex flex-col gap-1 border-b border-black/[0.06] pb-4">
        <h2 className="text-lg sm:text-xl font-medium text-[#181925]">
          People in {firstName}’s Life
        </h2>
        <p className="text-xs sm:text-sm text-[#71717a]">
          Family, lifelong companions, neighbors, and colleagues who shaped {firstName}’s world.
        </p>
      </div>

      {/* 1. Add Person Form */}
      <form
        onSubmit={handleAdd}
        className="p-5 rounded-2xl bg-white border border-black/[0.07] flex flex-col gap-3.5 shadow-2xs"
      >
        <span className="text-xs font-medium text-[#181925]">Add Someone Important</span>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            required
            value={nameInput}
            onChange={(e) => {
              setNameInput(e.target.value)
              updateDraft(e.target.value, relInput, noteInput)
            }}
            placeholder="Their Name (e.g. Meena Carter)"
            className="flex-1 px-3.5 py-2 rounded-xl bg-[#fafafb] border border-black/[0.08] text-xs sm:text-sm text-[#181925] outline-none focus:border-primary/50"
          />

          <input
            type="text"
            required
            value={relInput}
            onChange={(e) => {
              setRelInput(e.target.value)
              updateDraft(nameInput, e.target.value, noteInput)
            }}
            placeholder="Relationship (e.g. Wife, Daughter, Best Friend)"
            className="w-full sm:w-56 px-3.5 py-2 rounded-xl bg-[#fafafb] border border-black/[0.08] text-xs sm:text-sm text-[#181925] outline-none focus:border-primary/50"
          />
        </div>

        <input
          type="text"
          value={noteInput}
          onChange={(e) => {
            setNoteInput(e.target.value)
            updateDraft(nameInput, relInput, e.target.value)
          }}
          placeholder="Short note (optional, e.g. Married 50 years; partner in everything)"
          className="px-3.5 py-2 rounded-xl bg-[#fafafb] border border-black/[0.08] text-xs text-[#181925] outline-none focus:border-primary/50"
        />

        <div className="flex justify-end pt-1">
          <button
            type="submit"
            disabled={isSubmitting || !nameInput.trim() || !relInput.trim()}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#181925] hover:bg-[#252736] text-white text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
          >
            <Plus className="size-3" />
            <span>Add person</span>
          </button>
        </div>
      </form>

      {/* 2. Existing People List */}
      <div className="flex flex-col gap-2.5">
        <span className="text-xs font-mono text-[#888] uppercase tracking-wider px-1">
          People Connected ({people.length})
        </span>

        {people.length === 0 ? (
          <div className="p-6 rounded-2xl bg-white border border-black/[0.05] text-center text-xs text-[#888]">
            No people added yet. Add close family, friends, or companions above.
          </div>
        ) : (
          people.map((p) => (
            <div
              key={p.id}
              className="p-4 rounded-2xl bg-white border border-black/[0.06] flex items-center justify-between gap-4 group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="size-8 rounded-full bg-[#f4f4f6] text-xs font-semibold text-[#181925] flex items-center justify-center shrink-0">
                  {p.name.charAt(0)}
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs sm:text-sm font-medium text-[#181925] truncate">
                      {p.name}
                    </span>
                    <span className="text-[11px] text-[#71717a] font-mono">
                      · {p.relationship}
                    </span>
                  </div>
                  {p.note && (
                    <span className="text-[11px] text-[#888] truncate">
                      {p.note}
                    </span>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleDelete(p.id)}
                className="size-7 rounded-full text-[#888] hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                title="Remove person"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
