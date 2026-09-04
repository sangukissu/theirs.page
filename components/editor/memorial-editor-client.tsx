"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  ExternalLink,
  Save,
  Check,
  User,
  BookOpen,
  Image as ImageIcon,
  Calendar,
  Users,
  MessageSquare,
  Settings,
  Loader2,
  RotateCcw,
  Shield,
} from "lucide-react"

import { IdentityTab } from "./tabs/identity-tab"
import { StoryTab } from "./tabs/story-tab"
import { GalleryTab, EditorMediaItem } from "./tabs/gallery-tab"
import { TimelineTab, EditorTimelineEvent } from "./tabs/timeline-tab"
import { PeopleTab, EditorPerson } from "./tabs/people-tab"
import { ModerationTab, EditorMemory, EditorGuestbookEntry } from "./tabs/moderation-tab"
import { SettingsTab } from "./tabs/settings-tab"

export type EditorSectionTab =
  | "identity"
  | "story"
  | "gallery"
  | "timeline"
  | "people"
  | "moderation"
  | "settings"

interface InitialMemorialData {
  id: string
  slug: string
  full_name: string
  preferred_name?: string | null
  birth_year?: number | null
  death_year?: number | null
  location?: string | null
  headline?: string | null
  biography?: string | null
  portrait_photo_url?: string | null
  status: "draft" | "published" | "archived"
  privacy: "public" | "unlisted" | "private"
  access_pin_hash?: string | null
  successor_name?: string | null
  successor_email?: string | null
  is_paid?: boolean
  paid_at?: string | null
  updated_at?: string
}

interface MemorialEditorClientProps {
  initialMemorial: InitialMemorialData
  initialMediaItems: EditorMediaItem[]
  initialTimelineEvents: EditorTimelineEvent[]
  initialPeople: EditorPerson[]
  initialMemories: EditorMemory[]
  initialGuestbook: EditorGuestbookEntry[]
}

type SaveStatus = "saved" | "saving" | "local-saved"

export function MemorialEditorClient({
  initialMemorial,
  initialMediaItems,
  initialTimelineEvents,
  initialPeople,
  initialMemories,
  initialGuestbook,
}: MemorialEditorClientProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<EditorSectionTab>("identity")

  const isPaid = Boolean(initialMemorial.is_paid)

  // Storage key for resilient local-first backup
  const DRAFT_KEY = `theirs_editor_draft_${initialMemorial.id}`

  // Form State
  const [form, setForm] = useState({
    full_name: initialMemorial.full_name || "",
    preferred_name: initialMemorial.preferred_name || "",
    birth_year: initialMemorial.birth_year ? String(initialMemorial.birth_year) : "",
    death_year: initialMemorial.death_year ? String(initialMemorial.death_year) : "",
    location: initialMemorial.location || "",
    headline: initialMemorial.headline || "",
    biography: initialMemorial.biography || "",
    portrait_photo_url: initialMemorial.portrait_photo_url || "",
    slug: initialMemorial.slug || "",
    status: initialMemorial.status || "draft",
    privacy: (!isPaid && initialMemorial.privacy === "private") ? "public" : (initialMemorial.privacy || "public"),
    pin: isPaid ? (initialMemorial.access_pin_hash || "") : "",
    successor_name: initialMemorial.successor_name || "",
    successor_email: initialMemorial.successor_email || "",
  })

  // Relational Collections
  const [mediaItems, setMediaItems] = useState<EditorMediaItem[]>(initialMediaItems)
  const [timelineEvents, setTimelineEvents] = useState<EditorTimelineEvent[]>(initialTimelineEvents)
  const [people, setPeople] = useState<EditorPerson[]>(initialPeople)
  const [memories, setMemories] = useState<EditorMemory[]>(initialMemories)
  const [guestbook, setGuestbook] = useState<EditorGuestbookEntry[]>(initialGuestbook)

  // Auto-Save Status
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved")
  const [restoredNotice, setRestoredNotice] = useState(false)
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const formRef = useRef(form)
  formRef.current = form

  // Checkout handling for Pro Plan ($179)
  const [checkingOut, setCheckingOut] = useState(false)
  const handleUpgradeComplete = async () => {
    setCheckingOut(true)
    try {
      const res = await fetch("/api/checkout/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memorialId: initialMemorial.id }),
      })
      const data = await res.json()
      const redirectUrl = data.url || data.checkout_url || data.payment_link
      if (res.ok && redirectUrl) {
        window.location.href = redirectUrl
      } else {
        alert(data.error || "Could not launch checkout session")
        setCheckingOut(false)
      }
    } catch {
      alert("Network error launching checkout")
      setCheckingOut(false)
    }
  }

  // 1. Restore local draft on mount if newer and dirty
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed && parsed.form && parsed.isDirty) {
          if (!isPaid && parsed.form.privacy === "private") {
            parsed.form.privacy = "public"
            parsed.form.pin = ""
          }

          const hasUnsavedContent = Object.keys(parsed.form).some(
            (key) => (parsed.form as any)[key] !== (form as any)[key]
          )
          if (hasUnsavedContent) {
            setForm((prev) => ({ ...prev, ...parsed.form }))
            setRestoredNotice(true)
            setSaveStatus("local-saved")
            setTimeout(() => setRestoredNotice(false), 5000)
          }
        }
      }
    } catch (err) {
      console.warn("Could not read local draft:", err)
    }
  }, [DRAFT_KEY, isPaid])

  // 2. CLOUD PERSISTENCE ENGINE (PATCH to Supabase)
  const saveToCloud = useCallback(
    async (currentForm: typeof form): Promise<boolean> => {
      setSaveStatus("saving")
      const safePrivacy = (!isPaid && currentForm.privacy === "private") ? "public" : currentForm.privacy
      const safePin = !isPaid ? null : (currentForm.pin || null)

      try {
        const res = await fetch(`/api/memorials/${initialMemorial.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            full_name: currentForm.full_name,
            preferred_name: currentForm.preferred_name || null,
            birth_year: currentForm.birth_year ? Number(currentForm.birth_year) : null,
            death_year: currentForm.death_year ? Number(currentForm.death_year) : null,
            location: currentForm.location || null,
            headline: currentForm.headline || null,
            biography: currentForm.biography || null,
            portrait_photo_url: currentForm.portrait_photo_url || null,
            slug: currentForm.slug,
            status: currentForm.status,
            privacy: safePrivacy,
            pin: safePin,
            successor_name: currentForm.successor_name || null,
            successor_email: currentForm.successor_email || null,
          }),
        })

        if (res.ok) {
          setSaveStatus("saved")
          setLastSavedAt(new Date())
          try {
            localStorage.setItem(
              DRAFT_KEY,
              JSON.stringify({
                form: currentForm,
                timestamp: Date.now(),
                isDirty: false,
              })
            )
          } catch {}
          return true
        } else {
          const errData = await res.json().catch(() => ({}))
          console.warn("Cloud save error:", res.status, errData)
          setSaveStatus("local-saved")
          return false
        }
      } catch (err) {
        console.error("Cloud auto-save error:", err)
        setSaveStatus("local-saved")
        return false
      }
    },
    [initialMemorial.id, DRAFT_KEY, isPaid]
  )

  // 3. FIELD CHANGE HANDLER (Immediate LocalStorage + Debounced Cloud Sync)
  const handleFieldChange = (field: string, value: any) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value }

      try {
        localStorage.setItem(
          DRAFT_KEY,
          JSON.stringify({
            form: next,
            timestamp: Date.now(),
            isDirty: true,
          })
        )
      } catch (e) {
        console.warn("LocalStorage write failed:", e)
      }

      return next
    })

    setSaveStatus("local-saved")

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)
    debounceTimerRef.current = setTimeout(() => {
      saveToCloud(formRef.current)
    }, 1000)
  }

  // 4. MANUAL "SAVE NOW" ACTION
  const handleManualSave = async () => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)
    await saveToCloud(formRef.current)
  }

  // 5. BEFOREUNLOAD GUARD
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (saveStatus === "saving") {
        e.preventDefault()
        e.returnValue = ""
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [saveStatus])

  // 6. GALLERY MEDIA UPDATES
  const handleUpdateMedia = async (id: string, field: "caption" | "approx_year" | "location", value: any) => {
    setMediaItems((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    )

    try {
      await fetch(`/api/memorials/${initialMemorial.id}/media`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mediaId: id,
          [field]: value,
        }),
      })
    } catch (err) {
      console.error("Failed to auto-save media update:", err)
    }
  }

  // 7. PUBLISH TOGGLE
  const togglePublishStatus = async () => {
    const nextStatus = form.status === "published" ? "draft" : "published"
    handleFieldChange("status", nextStatus)
    try {
      await fetch(`/api/memorials/${initialMemorial.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      })
    } catch (err) {
      console.error("Publish toggle failed:", err)
    }
  }

  const pendingContributions =
    memories.filter((m) => m.status === "pending_approval").length +
    guestbook.filter((g) => g.status === "pending_approval").length

  // Exactly 7 clean, unbloated tabs matching public memorial structure
  const tabs: {
    id: EditorSectionTab
    label: string
    icon: any
    count?: number
    isCompleteOnly?: boolean
  }[] = [
    { id: "identity", label: "Identity & Hero", icon: User },
    { id: "story", label: "Life Story", icon: BookOpen },
    { id: "gallery", label: "Gallery", icon: ImageIcon, count: mediaItems.length },
    { id: "timeline", label: "Timeline", icon: Calendar, count: timelineEvents.length, isCompleteOnly: true },
    { id: "people", label: "People in Life", icon: Users, count: people.length },
    { id: "moderation", label: "Contributions", icon: MessageSquare, count: pendingContributions },
    { id: "settings", label: "Settings", icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-[#fafafb] text-[#181925] flex flex-col">
      
      {/* 1. Master Top Bar */}
      <header className="h-16 border-b border-black/[0.06] bg-white/90 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-4 min-w-0">
          <Link
            href="/dashboard"
            className="flex items-center gap-1 text-xs font-medium text-[#71717a] hover:text-[#181925] transition-colors shrink-0"
          >
            <ArrowLeft className="size-3.5" />
            <span className="hidden sm:inline">Memorials</span>
          </Link>

          <span className="text-black/[0.15]">/</span>

          <div className="flex items-center gap-2 min-w-0">
            <h1 className="text-sm font-serif font-medium text-[#181925] truncate">
              {form.full_name || "Untitled Memorial"}
            </h1>

            {/* Status Pill Toggle */}
            <button
              type="button"
              onClick={togglePublishStatus}
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase font-semibold cursor-pointer transition-all shrink-0 ${
                form.status === "published"
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                  : "bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100"
              }`}
              title="Click to toggle between Draft and Published"
            >
              {form.status}
            </button>
          </div>
        </div>

        {/* Right Actions & Auto-Save Indicator */}
        <div className="flex items-center gap-3 shrink-0">
          
          {/* Live Auto-Save Status Badge */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#71717a] font-sans pr-1">
            {saveStatus === "saving" && (
              <span className="inline-flex items-center gap-1 text-primary">
                <Loader2 className="size-3 animate-spin" />
                <span className="text-[11px]">Saving...</span>
              </span>
            )}

            {saveStatus === "local-saved" && (
              <span className="inline-flex items-center gap-1 text-amber-600" title="Changes are safely buffered on this device and saving to cloud">
                <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-[11px]">Saved locally</span>
              </span>
            )}

            {saveStatus === "saved" && (
              <span className="inline-flex items-center gap-1 text-emerald-600">
                <Check className="size-3" />
                <span className="text-[11px]">Saved</span>
              </span>
            )}
          </div>

          <Link
            href={`/${form.slug}`}
            target="_blank"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f4f4f6] hover:bg-neutral-200 text-[#181925] text-xs font-medium transition-colors"
          >
            <span>Preview live</span>
            <ExternalLink className="size-3 text-[#888]" />
          </Link>

          {/* Upgrade to Pro/Complete CTA (Only shown when not paid yet) */}
          {!initialMemorial.is_paid && (
            <button
              type="button"
              disabled={checkingOut}
              onClick={handleUpgradeComplete}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium transition-all cursor-pointer shadow-2xs disabled:opacity-50"
            >
              {checkingOut ? (
                <Loader2 className="size-3 animate-spin" />
              ) : (
                <Shield className="size-3" />
              )}
              <span className="hidden sm:inline">Upgrade ($179)</span>
              <span className="sm:hidden">Upgrade</span>
            </button>
          )}

          {/* Manual Save Button */}
          <button
            type="button"
            onClick={handleManualSave}
            disabled={saveStatus === "saving"}
            className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap !rounded-full font-medium transition-all cursor-pointer border border-[color-mix(in_srgb,var(--primary)_80%,#3a3480)] bg-[color-mix(in_srgb,var(--primary)_90%,#3a3480)] text-primary-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.22),inset_0_-1px_0_rgba(58,52,128,0.30)] transform-gpu hover:bg-primary hover:border-[color-mix(in_srgb,var(--primary)_70%,#3a3480)] active:translate-y-px active:scale-[0.98] h-8 px-4 text-xs select-none disabled:opacity-50"
          >
            {saveStatus === "saving" ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : saveStatus === "saved" ? (
              <>
                <Check className="size-3.5 text-white" />
                <span>Saved</span>
              </>
            ) : (
              <>
                <Save className="size-3.5" />
                <span>Save changes</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Unsaved Draft Recovery Notice */}
      {restoredNotice && (
        <div className="bg-primary/10 border-b border-primary/20 px-4 py-2 text-center text-xs text-primary font-medium flex items-center justify-center gap-2">
          <RotateCcw className="size-3.5" />
          <span>Restored your latest unsaved edits from this device. All text preserved.</span>
        </div>
      )}

      {/* 2. Responsive Editor Body (Sidebar + Content Canvas) */}
      <div className="flex-1 flex flex-col md:flex-row max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10 gap-8">
        
        {/* Navigation Tabs (Horizontal on Mobile, Vertical Sidebar on Desktop) */}
        <aside className="w-full md:w-56 shrink-0 flex flex-col gap-1">
          <div className="flex md:flex-col overflow-x-auto no-scrollbar gap-1 p-1 rounded-2xl bg-white md:bg-transparent border md:border-none border-black/[0.06]">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center justify-between gap-2.5 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#181925] text-white shadow-2xs"
                      : "text-[#666] hover:text-[#181925] hover:bg-white/80"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="size-3.5 shrink-0" />
                    <span>{tab.label}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {tab.isCompleteOnly && !initialMemorial.is_paid && (
                      <span
                        className={`text-[9px] font-mono uppercase font-semibold px-1.5 py-0.2 rounded-full ${
                          isActive ? "bg-white/20 text-white" : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        }`}
                      >
                        Pro
                      </span>
                    )}

                    {tab.count !== undefined && tab.count > 0 && (
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                          isActive ? "bg-white/20 text-white" : "bg-neutral-100 text-[#777]"
                        }`}
                      >
                        {tab.count}
                      </span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </aside>

        {/* Active Tab Canvas */}
        <main className="flex-1 min-w-0 bg-transparent">
          {activeTab === "identity" && (
            <IdentityTab
              memorialId={initialMemorial.id}
              fullName={form.full_name}
              preferredName={form.preferred_name}
              birthYear={form.birth_year}
              deathYear={form.death_year}
              location={form.location}
              headline={form.headline}
              portraitUrl={form.portrait_photo_url}
              onChange={handleFieldChange}
            />
          )}

          {activeTab === "story" && (
            <StoryTab
              fullName={form.full_name}
              biography={form.biography}
              onChange={(val) => handleFieldChange("biography", val)}
            />
          )}

          {activeTab === "gallery" && (
            <GalleryTab
              memorialId={initialMemorial.id}
              fullName={form.full_name}
              mediaItems={mediaItems}
              isPaid={Boolean(initialMemorial.is_paid)}
              onUpgrade={handleUpgradeComplete}
              onAddMedia={(item) => setMediaItems([item, ...mediaItems])}
              onRemoveMedia={(id) => setMediaItems(mediaItems.filter((m) => m.id !== id))}
              onUpdateMedia={handleUpdateMedia}
            />
          )}

          {activeTab === "timeline" && (
            <TimelineTab
              memorialId={initialMemorial.id}
              fullName={form.full_name}
              events={timelineEvents}
              isPaid={Boolean(initialMemorial.is_paid)}
              onUpgrade={handleUpgradeComplete}
              onAddEvent={(evt) => setTimelineEvents([...timelineEvents, evt])}
              onRemoveEvent={(id) => setTimelineEvents(timelineEvents.filter((e) => e.id !== id))}
            />
          )}

          {activeTab === "people" && (
            <PeopleTab
              memorialId={initialMemorial.id}
              fullName={form.full_name}
              people={people}
              onAddPerson={(p) => setPeople([...people, p])}
              onRemovePerson={(id) => setPeople(people.filter((p) => p.id !== id))}
            />
          )}

          {activeTab === "moderation" && (
            <ModerationTab
              memorialId={initialMemorial.id}
              memories={memories}
              guestbookEntries={guestbook}
              onUpdateMemoryStatus={(id, status) => {
                setMemories(
                  memories.map((m) => (m.id === id ? { ...m, status } : m))
                )
              }}
              onUpdateGuestbookStatus={(id, status) => {
                setGuestbook(
                  guestbook.map((g) => (g.id === id ? { ...g, status } : g))
                )
              }}
              onDeleteMemory={(id) => setMemories(memories.filter((m) => m.id !== id))}
              onDeleteGuestbook={(id) => setGuestbook(guestbook.filter((g) => g.id !== id))}
            />
          )}

          {activeTab === "settings" && (
            <SettingsTab
              memorialId={initialMemorial.id}
              slug={form.slug}
              status={form.status}
              privacy={form.privacy}
              pin={form.pin}
              successorName={form.successor_name}
              successorEmail={form.successor_email}
              isPaid={Boolean(initialMemorial.is_paid)}
              onChange={handleFieldChange}
              onDeleteMemorial={() => router.push("/dashboard")}
            />
          )}
        </main>

      </div>
    </div>
  )
}
