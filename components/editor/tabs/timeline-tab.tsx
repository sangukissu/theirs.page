"use client"

import { useState, useRef } from "react"
import { Plus, Trash2, Calendar, MapPin, Lock, Upload, Image as ImageIcon, X, Loader2 } from "lucide-react"
import { UpgradeBanner } from "../upgrade-banner"
import { ConfirmDeleteModal } from "../confirm-delete-modal"

export interface EditorTimelineEvent {
  id: string
  year: number
  title: string
  description?: string | null
  location?: string | null
  photo_url?: string | null
}

interface TimelineTabProps {
  memorialId: string
  fullName: string
  events: EditorTimelineEvent[]
  isPaid?: boolean
  onUpgrade?: () => void
  onAddEvent: (event: EditorTimelineEvent) => void
  onRemoveEvent: (id: string) => void
}

export function TimelineTab({
  memorialId,
  fullName,
  events,
  isPaid = false,
  onUpgrade,
  onAddEvent,
  onRemoveEvent,
}: TimelineTabProps) {
  const [yearInput, setYearInput] = useState("")
  const [titleInput, setTitleInput] = useState("")
  const [descInput, setDescInput] = useState("")
  const [locationInput, setLocationInput] = useState("")
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [eventToDelete, setEventToDelete] = useState<EditorTimelineEvent | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const firstName = fullName.split(" ")[0] || "them"
  const DRAFT_KEY = `theirs_timeline_draft_${memorialId}`

  // Restore unsaved draft on mount
  useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(DRAFT_KEY)
        if (saved) {
          const { year, title, desc, loc } = JSON.parse(saved)
          if (year) setYearInput(year)
          if (title) setTitleInput(title)
          if (desc) setDescInput(desc)
          if (loc) setLocationInput(loc)
        }
      } catch {}
    }
  })

  const updateDraft = (nextYear: string, nextTitle: string, nextDesc: string, nextLoc: string) => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(
          DRAFT_KEY,
          JSON.stringify({ year: nextYear, title: nextTitle, desc: nextDesc, loc: nextLoc })
        )
      } catch {}
    }
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploadingPhoto(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("folder", "timeline")
      formData.append("memorialId", memorialId)

      const res = await fetch("/api/r2/upload", {
        method: "POST",
        body: formData,
      })
      const data = await res.json()
      if (res.ok && data.publicUrl) {
        setPhotoUrl(data.publicUrl)
      }
    } catch (err) {
      console.error("Timeline photo upload failed:", err)
    } finally {
      setIsUploadingPhoto(false)
    }
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!yearInput || !titleInput.trim()) return

    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/memorials/${memorialId}/timeline`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          year: Number(yearInput),
          title: titleInput.trim(),
          description: descInput.trim() || null,
          location: locationInput.trim() || null,
          photo_url: photoUrl || null,
        }),
      })

      const data = await res.json()
      if (res.ok && data.event) {
        onAddEvent(data.event)
        setYearInput("")
        setTitleInput("")
        setDescInput("")
        setLocationInput("")
        setPhotoUrl(null)
        if (typeof window !== "undefined") {
          try {
            localStorage.removeItem(DRAFT_KEY)
          } catch {}
        }
      }
    } catch (err) {
      console.error("Failed to add milestone:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!eventToDelete) return
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/memorials/${memorialId}/timeline?eventId=${eventToDelete.id}`, {
        method: "DELETE",
      })
      if (res.ok) {
        onRemoveEvent(eventToDelete.id)
        setEventToDelete(null)
      } else {
        const data = await res.json().catch(() => ({}))
        console.error("Failed to delete milestone:", data.error)
      }
    } catch (err) {
      console.error("Failed to delete milestone:", err)
    } finally {
      setIsDeleting(false)
    }
  }

  const sortedEvents = [...events].sort((a, b) => a.year - b.year)

  return (
    <div className="flex flex-col gap-8 max-w-2xl">
      <div className="flex flex-col gap-1 border-b border-black/[0.06] pb-4">
        <h2 className="text-lg sm:text-xl font-medium text-[#181925]">
          Life Chronology & Milestones
        </h2>
        <p className="text-xs sm:text-sm text-[#71717a]">
          The major markers of {firstName}’s journey. Chapters and ordering are calculated automatically by year.
        </p>
      </div>

      {/* Complete Plan Upgrade Banner */}
      {!isPaid && (
        <UpgradeBanner
          memorialId={memorialId}
          featureTitle="Life Chronology & Milestones"
          description={`Preserve the key chapters, moves, marriages, and turning points of ${firstName}’s journey in chronological order. Chapters and markers are beautifully woven into the memorial.`}
          bullets={[
            "Unlimited milestone events & life markers",
            "Automatic chronological chapter ordering",
            "Prominently woven into the public memorial",
            "Included with all other Theirs Complete features",
          ]}
          onUpgrade={onUpgrade}
        />
      )}

      {/* 1. Add Milestone Form (3 fields max) */}
      <form
        onSubmit={handleAdd}
        className={`p-5 rounded-2xl bg-white border border-black/[0.07] flex flex-col gap-3.5 shadow-2xs ${
          !isPaid ? "opacity-75" : ""
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-[#181925]">Add a Life Milestone</span>
          {!isPaid && (
            <span className="text-[10px] font-mono uppercase font-semibold text-emerald-700 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200">
              Pro Plan
            </span>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="number"
            required
            disabled={!isPaid}
            value={yearInput}
            onChange={(e) => {
              setYearInput(e.target.value)
              updateDraft(e.target.value, titleInput, descInput, locationInput)
            }}
            placeholder="Year (e.g. 1974)"
            className="w-full sm:w-36 px-3.5 py-2 rounded-xl bg-[#fafafb] border border-black/[0.08] text-xs sm:text-sm text-[#181925] font-mono outline-none focus:border-primary/50 disabled:bg-neutral-100 disabled:text-neutral-500 disabled:cursor-not-allowed"
          />

          <input
            type="text"
            required
            disabled={!isPaid}
            value={titleInput}
            onChange={(e) => {
              setTitleInput(e.target.value)
              updateDraft(yearInput, e.target.value, descInput, locationInput)
            }}
            placeholder={
              !isPaid
                ? "Upgrade to Pro to add milestones"
                : "What happened? (e.g. Married Meena at St. Jude’s)"
            }
            className="flex-1 px-3.5 py-2 rounded-xl bg-[#fafafb] border border-black/[0.08] text-xs sm:text-sm text-[#181925] outline-none focus:border-primary/50 disabled:bg-neutral-100 disabled:text-neutral-500 disabled:cursor-not-allowed"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="text"
            disabled={!isPaid}
            value={descInput}
            onChange={(e) => {
              setDescInput(e.target.value)
              updateDraft(yearInput, titleInput, e.target.value, locationInput)
            }}
            placeholder="Brief note or detail (optional, e.g. Moved to Devon)"
            className="px-3.5 py-2 rounded-xl bg-[#fafafb] border border-black/[0.08] text-xs text-[#181925] outline-none focus:border-primary/50 disabled:bg-neutral-100 disabled:text-neutral-500 disabled:cursor-not-allowed"
          />

          <input
            type="text"
            disabled={!isPaid}
            value={locationInput}
            onChange={(e) => {
              setLocationInput(e.target.value)
              updateDraft(yearInput, titleInput, descInput, e.target.value)
            }}
            placeholder="Location (optional, e.g. Devon, England)"
            className="px-3.5 py-2 rounded-xl bg-[#fafafb] border border-black/[0.08] text-xs text-[#181925] outline-none focus:border-primary/50 disabled:bg-neutral-100 disabled:text-neutral-500 disabled:cursor-not-allowed"
          />
        </div>

        {/* Optional Photo Attachment */}
        <div className="flex items-center gap-3 pt-0.5">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            disabled={!isPaid || isUploadingPhoto}
            onChange={handlePhotoUpload}
            className="hidden"
          />

          {photoUrl ? (
            <div className="inline-flex items-center gap-2 p-1.5 pr-2.5 rounded-xl bg-[#fafafb] border border-black/[0.08]">
              <img
                src={photoUrl}
                alt="Milestone preview"
                className="size-7 rounded-lg object-cover"
              />
              <span className="text-[11px] text-[#444] font-medium">Photo attached</span>
              <button
                type="button"
                onClick={() => setPhotoUrl(null)}
                className="size-5 rounded-full hover:bg-rose-50 text-neutral-400 hover:text-rose-600 flex items-center justify-center transition-colors cursor-pointer"
                title="Remove photo"
              >
                <X className="size-3" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              disabled={!isPaid || isUploadingPhoto}
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 text-xs text-[#666] hover:text-[#181925] disabled:opacity-50 cursor-pointer select-none"
            >
              {isUploadingPhoto ? (
                <>
                  <Loader2 className="size-3.5 animate-spin text-primary" />
                  <span>Uploading photo...</span>
                </>
              ) : (
                <>
                  <Upload className="size-3.5" />
                  <span>Attach a photo (optional)</span>
                </>
              )}
            </button>
          )}

          <div className="flex-1" />

          <button
            type="submit"
            disabled={!isPaid || isSubmitting || !yearInput || !titleInput.trim()}
            className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
              !isPaid
                ? "bg-neutral-100 text-neutral-500 border border-neutral-200 cursor-not-allowed"
                : "bg-[#181925] hover:bg-[#252736] text-white cursor-pointer disabled:opacity-50"
            }`}
          >
            {!isPaid ? (
              <>
                <Lock className="size-3" />
                <span>Upgrade to add</span>
              </>
            ) : (
              <>
                <Plus className="size-3" />
                <span>Add milestone</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* 2. Existing Milestones List */}
      <div className="flex flex-col gap-2.5">
        <span className="text-xs font-mono text-[#888] uppercase tracking-wider px-1">
          Preserved Milestones ({sortedEvents.length})
        </span>

        {sortedEvents.length === 0 ? (
          <div className="p-6 rounded-2xl bg-white border border-black/[0.05] text-center text-xs text-[#888]">
            No milestones added yet. Add a birth year, wedding, career turn, or major family moment above.
          </div>
        ) : (
          sortedEvents.map((evt) => (
            <div
              key={evt.id}
              className="p-4 rounded-2xl bg-white border border-black/[0.06] flex items-center justify-between gap-4 group"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                {evt.photo_url ? (
                  <div className="size-12 rounded-xl overflow-hidden bg-neutral-100 shrink-0 border border-black/[0.06]">
                    <img
                      src={evt.photo_url}
                      alt={evt.title}
                      className="size-full object-cover"
                    />
                  </div>
                ) : (
                  <span className="font-mono text-sm font-semibold text-primary shrink-0 min-w-10">
                    {evt.year}
                  </span>
                )}
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {evt.photo_url && (
                      <span className="font-mono text-xs font-semibold text-primary">
                        {evt.year}
                      </span>
                    )}
                    <span className="text-xs sm:text-sm font-medium text-[#181925] truncate">
                      {evt.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-[#71717a] flex-wrap">
                    {evt.description && (
                      <span className="truncate">{evt.description}</span>
                    )}
                    {evt.location && (
                      <span className="inline-flex items-center gap-0.5 font-mono text-[10px] text-[#888]">
                        <MapPin className="size-2.5" />
                        {evt.location}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setEventToDelete(evt)}
                className="size-7 rounded-full text-[#888] hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                title="Remove milestone"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          ))
        )}
      </div>

      <ConfirmDeleteModal
        isOpen={!!eventToDelete}
        title="Delete life milestone?"
        description="This milestone will be permanently removed from the chronology. This action cannot be undone."
        itemPreview={eventToDelete ? `${eventToDelete.year} · ${eventToDelete.title}` : null}
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onClose={() => !isDeleting && setEventToDelete(null)}
      />
    </div>
  )
}
