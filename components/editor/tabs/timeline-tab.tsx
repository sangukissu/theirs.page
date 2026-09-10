"use client"

import { useState, useRef } from "react"
import { Plus, Trash2, Calendar, MapPin, Lock, Upload, Image as ImageIcon, X, Loader2, Pencil } from "lucide-react"
import { UpgradeBanner } from "../upgrade-banner"
import { ConfirmDeleteModal } from "../confirm-delete-modal"
import { TEXT_LIMITS } from "@/lib/validation/text-limits"
import { useEditorAuthorization } from "../use-editor-authorization"

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
  onUpdateEvent?: (event: EditorTimelineEvent) => void
}

function handleNumericKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
  if (
    e.key === "Backspace" ||
    e.key === "Delete" ||
    e.key === "ArrowLeft" ||
    e.key === "ArrowRight" ||
    e.key === "Tab" ||
    e.key === "Enter" ||
    e.key === "Escape" ||
    e.ctrlKey ||
    e.metaKey ||
    e.altKey
  ) {
    return
  }
  if (!/^\d$/.test(e.key)) {
    e.preventDefault()
  }
}

export function TimelineTab({
  memorialId,
  fullName,
  events,
  isPaid = false,
  onUpgrade,
  onAddEvent,
  onRemoveEvent,
  onUpdateEvent,
}: TimelineTabProps) {
  const handleAuthorizationFailure = useEditorAuthorization(memorialId)
  const [yearInput, setYearInput] = useState("")
  const [titleInput, setTitleInput] = useState("")
  const [descInput, setDescInput] = useState("")
  const [locationInput, setLocationInput] = useState("")
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null)
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [eventToDelete, setEventToDelete] = useState<EditorTimelineEvent | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Edit Milestone States
  const [editingEventId, setEditingEventId] = useState<string | null>(null)
  const [editYear, setEditYear] = useState("")
  const [editTitle, setEditTitle] = useState("")
  const [editDesc, setEditDesc] = useState("")
  const [editLocation, setEditLocation] = useState("")
  const [editPhotoUrl, setEditPhotoUrl] = useState<string | null>(null)
  const [editPhotoPreviewUrl, setEditPhotoPreviewUrl] = useState<string | null>(null)
  const [isUploadingEditPhoto, setIsUploadingEditPhoto] = useState(false)
  const [isSavingEdit, setIsSavingEdit] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)
  const editFileInputRef = useRef<HTMLInputElement | null>(null)

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
      } catch { }
    }
  })

  const updateDraft = (nextYear: string, nextTitle: string, nextDesc: string, nextLoc: string) => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(
          DRAFT_KEY,
          JSON.stringify({ year: nextYear, title: nextTitle, desc: nextDesc, loc: nextLoc })
        )
      } catch { }
    }
  }

  const uploadFile = async (file: File): Promise<string | null> => {
    // 1. Request presigned upload URL from server
    const presignedRes = await fetch("/api/r2/presigned-upload-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        filename: file.name,
        contentType: file.type || "image/jpeg",
        fileSize: file.size,
        folder: "timeline",
        memorialId,
      }),
    })

    const presignedData = await presignedRes.json()
    if (handleAuthorizationFailure(presignedRes)) return null
    if (!presignedRes.ok) {
      throw new Error(presignedData.error || "Failed to prepare photo upload")
    }

    // 2. Direct browser -> Cloudflare R2 PUT with server fallback
    let uploadKey = presignedData.stagingKey || presignedData.key
    let directSucceeded = false

    try {
      const uploadRes = await fetch(presignedData.uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": presignedData.contentType || file.type || "image/jpeg",
        },
        body: file,
      })
      if (uploadRes.ok) {
        directSucceeded = true
      }
    } catch (directErr) {
      console.warn("Direct timeline upload failed (likely CORS preflight), falling back to /api/r2/upload:", directErr)
    }

    if (!directSucceeded) {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("folder", "timeline")
      formData.append("memorialId", memorialId)

      const fallbackRes = await fetch("/api/r2/upload", {
        method: "POST",
        body: formData,
      })
      const fallbackData = await fallbackRes.json()
      if (handleAuthorizationFailure(fallbackRes)) return null
      if (!fallbackRes.ok) {
        throw new Error(fallbackData.error || "Failed to upload photo via server fallback")
      }
      uploadKey = fallbackData.key
    }

    return uploadKey
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploadingPhoto(true)
    const preview = URL.createObjectURL(file)
    setPhotoPreviewUrl(preview)

    try {
      const key = await uploadFile(file)
      if (key) {
        setPhotoUrl(key)
      } else {
        setPhotoPreviewUrl(null)
      }
    } catch (err) {
      console.error("Timeline photo upload failed:", err)
      setPhotoPreviewUrl(null)
    } finally {
      setIsUploadingPhoto(false)
      if (e.target) {
        e.target.value = ""
      }
    }
  }

  const startEditing = (evt: EditorTimelineEvent) => {
    setEditingEventId(evt.id)
    setEditYear(String(evt.year).slice(0, 4))
    setEditTitle(evt.title)
    setEditDesc(evt.description || "")
    setEditLocation(evt.location || "")
    setEditPhotoUrl(evt.photo_url || null)
    setEditPhotoPreviewUrl(evt.photo_url || null)
    setEditError(null)
  }

  const cancelEditing = () => {
    setEditingEventId(null)
    setEditYear("")
    setEditTitle("")
    setEditDesc("")
    setEditLocation("")
    setEditPhotoUrl(null)
    setEditPhotoPreviewUrl(null)
    setEditError(null)
  }

  const handleEditPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploadingEditPhoto(true)
    const preview = URL.createObjectURL(file)
    setEditPhotoPreviewUrl(preview)

    try {
      const key = await uploadFile(file)
      if (key) {
        setEditPhotoUrl(key)
      } else {
        setEditPhotoPreviewUrl(editPhotoUrl)
      }
    } catch (err: any) {
      console.error("Edit timeline photo upload failed:", err)
      setEditError(err.message || "Failed to upload photo")
      setEditPhotoPreviewUrl(editPhotoUrl)
    } finally {
      setIsUploadingEditPhoto(false)
      if (e.target) {
        e.target.value = ""
      }
    }
  }

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    const sanitizedYear = editYear.replace(/\D/g, "").slice(0, 4)
    if (!editingEventId || !sanitizedYear || sanitizedYear.length < 4 || !editTitle.trim()) return

    setIsSavingEdit(true)
    setEditError(null)

    try {
      const res = await fetch(`/api/memorials/${memorialId}/timeline`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: editingEventId,
          year: Number(sanitizedYear),
          title: editTitle.trim().slice(0, TEXT_LIMITS.timelineTitle),
          description: editDesc.trim().slice(0, TEXT_LIMITS.timelineDescription) || null,
          location: editLocation.trim().slice(0, TEXT_LIMITS.location) || null,
          photo_url: editPhotoUrl,
        }),
      })

      const data = await res.json()
      if (handleAuthorizationFailure(res)) return
      if (res.ok && data.event) {
        onUpdateEvent?.(data.event)
        cancelEditing()
      } else {
        setEditError(data.error || "Failed to save milestone changes.")
      }
    } catch (err: any) {
      console.error("Failed to update milestone:", err)
      setEditError(err.message || "An unexpected error occurred while saving.")
    } finally {
      setIsSavingEdit(false)
    }
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    const sanitizedYear = yearInput.replace(/\D/g, "").slice(0, 4)
    if (!sanitizedYear || sanitizedYear.length < 4 || !titleInput.trim()) return

    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/memorials/${memorialId}/timeline`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          year: Number(sanitizedYear),
          title: titleInput.trim().slice(0, TEXT_LIMITS.timelineTitle),
          description: descInput.trim().slice(0, TEXT_LIMITS.timelineDescription) || null,
          location: locationInput.trim().slice(0, TEXT_LIMITS.location) || null,
          photo_url: photoUrl || null,
        }),
      })

      const data = await res.json()
      if (handleAuthorizationFailure(res)) return
      if (res.ok && data.event) {
        onAddEvent(data.event)
        setYearInput("")
        setTitleInput("")
        setDescInput("")
        setLocationInput("")
        setPhotoUrl(null)
        setPhotoPreviewUrl(null)
        if (typeof window !== "undefined") {
          try {
            localStorage.removeItem(DRAFT_KEY)
          } catch { }
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
      if (handleAuthorizationFailure(res)) return
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
    <div className="flex flex-col gap-6 max-w-2xl mb-6">
      <div className="flex flex-col gap-1 border-b border-black/[0.06] pb-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg sm:text-xl font-medium text-[#181925]">
            Life Chronology & Milestones
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-[#71717a]">
          The major markers of {firstName}’s journey. Chapters and ordering are calculated automatically by year.
        </p>
      </div>

      <div className="flex flex-col gap-8">


        {/* 1. Add Milestone Form (3 fields max) */}
        <form
          onSubmit={handleAdd}
          className={`p-5 rounded-2xl bg-white border border-black/[0.05] flex flex-col gap-3.5 ${!isPaid ? "opacity-75" : ""
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
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={4}
              required
              disabled={!isPaid}
              value={yearInput}
              onKeyDown={handleNumericKeyDown}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "").slice(0, 4)
                setYearInput(val)
                updateDraft(val, titleInput, descInput, locationInput)
              }}
              placeholder="Year (e.g. 1974)"
              className="w-full sm:w-32 px-3.5 py-2 rounded-xl bg-[#fafafb] border border-black/[0.08] text-xs sm:text-sm text-[#181925] font-mono outline-none focus:border-primary/50 disabled:bg-neutral-100 disabled:text-neutral-500 disabled:cursor-not-allowed"
            />

            <input
              type="text"
              required
              maxLength={TEXT_LIMITS.timelineTitle}
              disabled={!isPaid}
              value={titleInput}
              onChange={(e) => {
                const val = e.target.value.slice(0, TEXT_LIMITS.timelineTitle)
                setTitleInput(val)
                updateDraft(yearInput, val, descInput, locationInput)
              }}
              placeholder={
                !isPaid
                  ? "Upgrade to Pro to add milestones"
                  : "Milestone title (e.g. Married Meena at St. Jude’s)"
              }
              className="flex-1 px-3.5 py-2 rounded-xl bg-[#fafafb] border border-black/[0.08] text-xs sm:text-sm text-[#181925] outline-none focus:border-primary/50 disabled:bg-neutral-100 disabled:text-neutral-500 disabled:cursor-not-allowed"
            />

            <input
              type="text"
              maxLength={TEXT_LIMITS.location}
              disabled={!isPaid}
              value={locationInput}
              onChange={(e) => {
                const val = e.target.value.slice(0, TEXT_LIMITS.location)
                setLocationInput(val)
                updateDraft(yearInput, titleInput, descInput, val)
              }}
              placeholder="Location (optional, e.g. Devon, England)"
              className="w-full sm:w-48 px-3.5 py-2 rounded-xl bg-[#fafafb] border border-black/[0.08] text-xs sm:text-sm text-[#181925] outline-none focus:border-primary/50 disabled:bg-neutral-100 disabled:text-neutral-500 disabled:cursor-not-allowed"
            />
          </div>

          <div className="flex flex-col gap-1">
            <textarea
              rows={3}
              maxLength={TEXT_LIMITS.timelineDescription}
              disabled={!isPaid}
              value={descInput}
              onChange={(e) => {
                const val = e.target.value.slice(0, TEXT_LIMITS.timelineDescription)
                setDescInput(val)
                updateDraft(yearInput, titleInput, val, locationInput)
              }}
              placeholder="What happened? Share the story, memories, or details of this milestone (optional)..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#fafafb] border border-black/[0.08] text-xs sm:text-sm text-[#181925] placeholder:text-[#aaa] outline-none focus:border-primary/50 resize-y leading-relaxed font-sans disabled:bg-neutral-100 disabled:text-neutral-500 disabled:cursor-not-allowed"
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
                  src={photoPreviewUrl || photoUrl}
                  alt="Milestone preview"
                  className="size-7 rounded-lg object-cover"
                />
                <span className="text-[11px] text-[#444] font-medium">Photo attached</span>
                <button
                  type="button"
                  onClick={() => {
                    setPhotoUrl(null)
                    setPhotoPreviewUrl(null)
                  }}
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
              className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${!isPaid
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
            sortedEvents.map((evt) =>
              editingEventId === evt.id ? (
                <form
                  key={evt.id}
                  onSubmit={handleSaveEdit}
                  className="p-4 sm:p-5 rounded-2xl bg-white border-2 border-primary/20 shadow-xs flex flex-col gap-3.5 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-[#181925]">
                        Edit Life Milestone
                      </span>
                      <span className="text-[10px] font-mono text-[#888] bg-neutral-100 px-2 py-0.5 rounded-full">
                        {evt.year}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={cancelEditing}
                      disabled={isSavingEdit}
                      className="size-6 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 flex items-center justify-center transition-colors cursor-pointer"
                      title="Cancel editing"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={4}
                      required
                      disabled={isSavingEdit}
                      value={editYear}
                      onKeyDown={handleNumericKeyDown}
                      onChange={(e) => setEditYear(e.target.value.replace(/\D/g, "").slice(0, 4))}
                      placeholder="Year (e.g. 1974)"
                      className="w-full sm:w-32 px-3.5 py-2 rounded-xl bg-[#fafafb] border border-black/[0.08] text-xs sm:text-sm text-[#181925] font-mono outline-none focus:border-primary/50"
                    />

                    <input
                      type="text"
                      required
                      disabled={isSavingEdit}
                      maxLength={TEXT_LIMITS.timelineTitle}
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value.slice(0, TEXT_LIMITS.timelineTitle))}
                      placeholder="Milestone title (e.g. Married Meena at St. Jude’s)"
                      className="flex-1 px-3.5 py-2 rounded-xl bg-[#fafafb] border border-black/[0.08] text-xs sm:text-sm text-[#181925] outline-none focus:border-primary/50"
                    />

                    <input
                      type="text"
                      disabled={isSavingEdit}
                      maxLength={TEXT_LIMITS.location}
                      value={editLocation}
                      onChange={(e) => setEditLocation(e.target.value.slice(0, TEXT_LIMITS.location))}
                      placeholder="Location (optional, e.g. Devon, England)"
                      className="w-full sm:w-48 px-3.5 py-2 rounded-xl bg-[#fafafb] border border-black/[0.08] text-xs sm:text-sm text-[#181925] outline-none focus:border-primary/50"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <textarea
                      rows={3}
                      disabled={isSavingEdit}
                      maxLength={TEXT_LIMITS.timelineDescription}
                      value={editDesc}
                      onChange={(e) => setEditDesc(e.target.value.slice(0, TEXT_LIMITS.timelineDescription))}
                      placeholder="What happened? Share the story, memories, or details of this milestone (optional)..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#fafafb] border border-black/[0.08] text-xs sm:text-sm text-[#181925] placeholder:text-[#aaa] outline-none focus:border-primary/50 resize-y leading-relaxed font-sans"
                    />
                  </div>

                  {/* Photo Attachment / Replacement */}
                  <div className="flex items-center gap-3 pt-0.5">
                    <input
                      ref={editFileInputRef}
                      type="file"
                      accept="image/*"
                      disabled={isUploadingEditPhoto || isSavingEdit}
                      onChange={handleEditPhotoUpload}
                      className="hidden"
                    />

                    {editPhotoUrl ? (
                      <div className="inline-flex items-center gap-2 p-1.5 pr-2.5 rounded-xl bg-[#fafafb] border border-black/[0.08]">
                        <img
                          src={editPhotoPreviewUrl || editPhotoUrl}
                          alt="Milestone preview"
                          className="size-7 rounded-lg object-cover"
                        />
                        <span className="text-[11px] text-[#444] font-medium">Photo attached</span>
                        <button
                          type="button"
                          onClick={() => editFileInputRef.current?.click()}
                          disabled={isUploadingEditPhoto || isSavingEdit}
                          className="text-[11px] text-[#666] hover:text-[#181925] underline ml-1 cursor-pointer"
                        >
                          Change
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditPhotoUrl(null)
                            setEditPhotoPreviewUrl(null)
                          }}
                          disabled={isUploadingEditPhoto || isSavingEdit}
                          className="size-5 rounded-full hover:bg-rose-50 text-neutral-400 hover:text-rose-600 flex items-center justify-center transition-colors cursor-pointer"
                          title="Remove photo"
                        >
                          <X className="size-3" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        disabled={isUploadingEditPhoto || isSavingEdit}
                        onClick={() => editFileInputRef.current?.click()}
                        className="inline-flex items-center gap-1.5 text-xs text-[#666] hover:text-[#181925] disabled:opacity-50 cursor-pointer select-none"
                      >
                        {isUploadingEditPhoto ? (
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

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={cancelEditing}
                        disabled={isSavingEdit}
                        className="px-3.5 py-1.5 rounded-full text-xs font-medium text-[#666] hover:text-[#181925] hover:bg-neutral-100 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSavingEdit || !editYear || !editTitle.trim()}
                        className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium bg-[#181925] hover:bg-[#252736] text-white cursor-pointer disabled:opacity-50 transition-colors"
                      >
                        {isSavingEdit ? (
                          <>
                            <Loader2 className="size-3 animate-spin" />
                            <span>Saving...</span>
                          </>
                        ) : (
                          <span>Save changes</span>
                        )}
                      </button>
                    </div>
                  </div>

                  {editError && (
                    <div className="text-xs text-rose-600 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-xl">
                      {editError}
                    </div>
                  )}
                </form>
              ) : (
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

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => startEditing(evt)}
                      disabled={!isPaid}
                      className="size-7 rounded-full text-[#888] hover:text-[#181925] hover:bg-neutral-100 flex items-center justify-center transition-colors cursor-pointer"
                      title="Edit milestone"
                    >
                      <Pencil className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEventToDelete(evt)}
                      className="size-7 rounded-full text-[#888] hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors cursor-pointer"
                      title="Remove milestone"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              )
            )
          )}
        </div>
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
