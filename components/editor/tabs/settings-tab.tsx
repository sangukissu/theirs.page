"use client"

import { useState, useRef, useEffect } from "react"
import {
  Globe,
  Lock,
  Shield,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Download,
  Users,
  UserPlus,
  Send,
  Loader2,
  Eye,
  Sparkles,
  BookOpen,
  Heart,
  Calendar,
  Image as ImageIcon,
  MessageSquare,
  Sliders,
} from "lucide-react"
import { UpgradeBanner } from "../upgrade-banner"
import { ConfirmDeleteModal } from "../confirm-delete-modal"
import { SectionSettings, ContributionSettings } from "@/types/theirs"

interface CollaboratorItem {
  id: string
  email: string
  role: "co_admin" | "contributor"
  invitation_accepted?: boolean
  is_trusted?: boolean
  inviteLink?: string
  created_at: string
}

interface SettingsTabProps {
  memorialId: string
  slug: string
  status: "draft" | "published" | "archived"
  privacy: "public" | "unlisted" | "private"
  pin?: string
  successorName: string
  successorEmail: string
  sectionSettings?: SectionSettings | null
  contributionSettings?: ContributionSettings | null
  isPaid?: boolean
  onChange: (field: string, value: any) => void
  onDeleteMemorial: () => void
}

export function SettingsTab({
  memorialId,
  slug,
  status,
  privacy,
  pin = "",
  successorName,
  successorEmail,
  sectionSettings,
  contributionSettings,
  isPaid = false,
  onChange,
  onDeleteMemorial,
}: SettingsTabProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [confirmText, setConfirmText] = useState("")

  // Checkout State
  const [checkingOut, setCheckingOut] = useState(false)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)

  // Live slug checking state
  const [slugChecking, setSlugChecking] = useState(false)
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null)
  const [slugMessage, setSlugMessage] = useState<string | null>(null)
  const [slugSuggestions, setSlugSuggestions] = useState<string[]>([])
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Collaborators state
  const [collaborators, setCollaborators] = useState<CollaboratorItem[]>([])
  const [loadingCollabs, setLoadingCollabs] = useState(false)
  const [collabEmail, setCollabEmail] = useState("")
  const [collabRole, setCollabRole] = useState<"co_admin" | "contributor">("co_admin")
  const [collabAdding, setCollabAdding] = useState(false)
  const [collabError, setCollabError] = useState<string | null>(null)
  const [copiedCollabId, setCopiedCollabId] = useState<string | null>(null)
  const [caretakerToDelete, setCaretakerToDelete] = useState<CollaboratorItem | null>(null)
  const [isRemovingCaretaker, setIsRemovingCaretaker] = useState(false)

  const handleCopyInvite = (collabId: string, link?: string) => {
    if (!link) return
    navigator.clipboard.writeText(link)
    setCopiedCollabId(collabId)
    setTimeout(() => setCopiedCollabId(null), 2500)
  }

  const currentContributionSettings: ContributionSettings = contributionSettings || {
    accept_contributions: true,
    tributes: true,
    memories: true,
    photos: true,
    voice: true,
    videos: true,
    moments: true,
  }

  const handleToggleContributionSetting = (key: keyof ContributionSettings, value: boolean) => {
    const updated = {
      ...currentContributionSettings,
      [key]: value,
    }
    onChange("contribution_settings", updated)
  }

  // Ownership transfer state
  const [transferring, setTransferring] = useState(false)
  const [transferTargetEmail, setTransferTargetEmail] = useState("")
  const [transferSuccess, setTransferSuccess] = useState<string | null>(null)
  const [transferError, setTransferError] = useState<string | null>(null)

  // 1. Fetch Collaborators on Mount
  useEffect(() => {
    let isMounted = true
    async function fetchCollabs() {
      setLoadingCollabs(true)
      try {
        const res = await fetch(`/api/memorials/${memorialId}/collaborators`)
        const data = await res.json()
        if (isMounted && data.collaborators) {
          setCollaborators(data.collaborators)
        }
      } catch (err) {
        console.error("Failed to load caretakers:", err)
      } finally {
        if (isMounted) setLoadingCollabs(false)
      }
    }
    fetchCollabs()
    return () => {
      isMounted = false
    }
  }, [memorialId])

  const handleSlugChange = (raw: string) => {
    const cleaned = raw.toLowerCase().replace(/[^a-z0-9-]/g, "").replace(/-{2,}/g, "-")
    onChange("slug", cleaned)

    if (!cleaned || cleaned.length < 3) {
      setSlugAvailable(null)
      setSlugMessage(null)
      setSlugSuggestions([])
      return
    }

    setSlugChecking(true)
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)
    debounceTimerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/memorials/check-slug?slug=${encodeURIComponent(cleaned)}&excludeId=${encodeURIComponent(memorialId)}`
        )
        const data = await res.json()
        setSlugChecking(false)
        setSlugAvailable(data.available)
        setSlugMessage(data.message)
        setSlugSuggestions(data.suggestions || [])
      } catch {
        setSlugChecking(false)
      }
    }, 300)
  }

  // 2. Add Caretaker
  const handleAddCollaborator = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!collabEmail.trim()) return

    setCollabAdding(true)
    setCollabError(null)

    try {
      const res = await fetch(`/api/memorials/${memorialId}/collaborators`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: collabEmail.trim(), role: collabRole }),
      })

      const data = await res.json()

      if (res.ok && data.collaborator) {
        setCollaborators([...collaborators, data.collaborator])
        setCollabEmail("")
      } else {
        setCollabError(data.error || "Failed to invite caretaker.")
      }
    } catch {
      setCollabError("Network error. Please try again.")
    } finally {
      setCollabAdding(false)
    }
  }

  // 3. Toggle Contributor Trust (Bypasses human approval, automated safety still screens)
  const handleToggleTrust = async (collaboratorId: string, currentTrust: boolean) => {
    const nextTrust = !currentTrust
    // Optimistic UI update
    setCollaborators((prev) =>
      prev.map((c) => (c.id === collaboratorId ? { ...c, is_trusted: nextTrust } : c))
    )
    try {
      const res = await fetch(`/api/memorials/${memorialId}/collaborators`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collaboratorId, is_trusted: nextTrust }),
      })
      if (!res.ok) {
        // Revert on failure
        setCollaborators((prev) =>
          prev.map((c) => (c.id === collaboratorId ? { ...c, is_trusted: currentTrust } : c))
        )
      }
    } catch {
      setCollaborators((prev) =>
        prev.map((c) => (c.id === collaboratorId ? { ...c, is_trusted: currentTrust } : c))
      )
    }
  }

  // 4. Remove Caretaker
  const handleConfirmRemoveCollaborator = async () => {
    if (!caretakerToDelete) return
    setIsRemovingCaretaker(true)
    try {
      const res = await fetch(
        `/api/memorials/${memorialId}/collaborators?collaboratorId=${caretakerToDelete.id}`,
        { method: "DELETE" }
      )
      if (res.ok) {
        setCollaborators(collaborators.filter((c) => c.id !== caretakerToDelete.id))
        setCaretakerToDelete(null)
      }
    } catch (err) {
      console.error("Failed to remove caretaker:", err)
    } finally {
      setIsRemovingCaretaker(false)
    }
  }

  // 4. Transfer Ownership
  const handleTransferOwnership = async () => {
    if (!transferTargetEmail.trim()) return

    setTransferring(true)
    setTransferError(null)
    setTransferSuccess(null)

    try {
      const res = await fetch(`/api/memorials/${memorialId}/transfer-ownership`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetEmail: transferTargetEmail.trim(),
          targetName: successorName || undefined,
        }),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        setTransferSuccess(data.message)
        setTransferTargetEmail("")
      } else {
        setTransferError(data.error || "Failed to transfer ownership.")
      }
    } catch {
      setTransferError("Network error. Please try again.")
    } finally {
      setTransferring(false)
    }
  }

  // 5. Complete Upgrade ($179 One-Time)
  const handleUpgradeComplete = async () => {
    setCheckingOut(true)
    setCheckoutError(null)
    try {
      const res = await fetch("/api/checkout/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memorialId }),
      })
      const data = await res.json()
      if (!res.ok || !data.url) {
        throw new Error(data.error || "Could not start checkout session")
      }
      window.location.href = data.url
    } catch (err: any) {
      setCheckoutError(err.message || "Failed to launch checkout")
      setCheckingOut(false)
    }
  }

  // 6. Delete Memorial
  const handleDelete = async () => {
    if (confirmText !== "DELETE") return

    setIsDeleting(true)
    try {
      const res = await fetch(`/api/memorials/${memorialId}`, {
        method: "DELETE",
      })
      if (res.ok) {
        onDeleteMemorial()
      }
    } catch (err) {
      console.error("Failed to delete memorial:", err)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="flex flex-col gap-8 max-w-2xl">
      {/* Header */}
      <div className="flex flex-col gap-1 border-b border-black/[0.06] pb-4">
        <h2 className="text-lg sm:text-xl font-medium text-[#181925]">
          Memorial Settings & Stewardship
        </h2>
        <p className="text-xs sm:text-sm text-[#71717a]">
          Manage publication status, shareable web address, privacy levels, and long-term family caretaking.
        </p>
      </div>

      {/* Complete Activation Status / Upgrade Card */}
      {isPaid ? (
        <div className="flex items-center justify-between p-5 rounded-2xl bg-white border border-emerald-200/80 shadow-2xs">
          <div className="flex items-center gap-3.5">
            <div className="size-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200">
              <CheckCircle2 className="size-5" />
            </div>
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-medium text-[#181925]">Theirs Pro Plan Active</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-mono uppercase font-semibold">
                  Family Archive
                </span>
              </div>
              <p className="text-[11px] text-[#71717a]">
                Original-quality media preservation, audio recordings, unlimited contributors, and family collaboration are active.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 p-5 rounded-2xl bg-[#1f1f1f] text-white border border-white/[0.08]">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] uppercase tracking-wider text-emerald-400 font-semibold">
                Pro Plan
              </span>
              <span className="text-xs text-[#888]">·</span>
              <span className="text-sm font-medium text-white">$179 one-time</span>
            </div>
            <p className="text-xs text-[#9c9c9c] max-w-md leading-relaxed">
              Unlock original-resolution photos, voice recordings, video clips, private mode, and unlimited family collaborators.
            </p>
            {checkoutError && (
              <span className="text-xs text-rose-400 font-medium">{checkoutError}</span>
            )}
          </div>

          <button
            type="button"
            disabled={checkingOut}
            onClick={handleUpgradeComplete}
            className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full bg-white hover:bg-neutral-100 text-[#181925] text-xs font-medium shrink-0 transition-all cursor-pointer disabled:opacity-50"
          >
            {checkingOut ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                <span>Preparing checkout...</span>
              </>
            ) : (
              <>
                <Shield className="size-3.5 text-primary" />
                <span>Upgrade to Pro</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* 1. Publication Status Switcher */}
      <div className="flex flex-col gap-3 p-5 rounded-2xl bg-white border border-black/[0.07]">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <label className="text-xs font-medium text-[#181925]">
              Publication Status
            </label>
            <p className="text-[11px] text-[#71717a]">
              Control whether this memorial is open to visitors or in private drafting.
            </p>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-[#f4f4f6] rounded-full border border-black/[0.05]">
            <button
              type="button"
              onClick={() => onChange("status", "published")}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                status === "published"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-[#666] hover:text-[#181925]"
              }`}
            >
              Published (Live)
            </button>
            <button
              type="button"
              onClick={() => onChange("status", "draft")}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                status === "draft"
                  ? "bg-[#181925] text-white shadow-xs"
                  : "text-[#666] hover:text-[#181925]"
              }`}
            >
              Draft (Private)
            </button>
          </div>
        </div>

        {status === "published" ? (
          <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/60 border border-emerald-200 text-xs text-emerald-800">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5 text-emerald-600" />
              <span>Live at <strong>theirs.page/{slug}</strong></span>
            </span>
            <a
              href={`/${slug}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-emerald-700 font-semibold hover:underline"
            >
              <span>View live page</span>
              <ExternalLink className="size-3" />
            </a>
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200 text-xs text-amber-800 flex items-center justify-between">
            <span>In Draft mode. Only you can preview this page.</span>
            <a
              href={`/${slug}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-amber-700 font-semibold hover:underline"
            >
              <span>Preview</span>
              <ExternalLink className="size-3" />
            </a>
          </div>
        )}
      </div>

      {/* 2. Permanent Web Address (Slug) with Live Check */}
      <div className="flex flex-col gap-2 p-5 rounded-2xl bg-white border border-black/[0.07]">
        <label className="text-xs font-medium text-[#181925]">
          Web Address (Link)
        </label>
        <div className="flex items-center px-4 py-2 rounded-xl bg-[#fafafb] border border-black/[0.08] text-xs text-[#888] font-mono">
          <span>theirs.page/</span>
          <input
            type="text"
            value={slug}
            onChange={(e) => handleSlugChange(e.target.value)}
            placeholder="robert-carter"
            className="flex-1 bg-transparent text-[#181925] outline-none font-medium ml-0.5"
          />
          {slugChecking && <span className="text-[10px] text-muted-foreground animate-pulse">Checking...</span>}
          {!slugChecking && slugAvailable === true && (
            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
              <CheckCircle2 className="size-3" /> Available
            </span>
          )}
          {!slugChecking && slugAvailable === false && (
            <span className="inline-flex items-center gap-1 text-[11px] text-amber-700 font-medium">
              <AlertCircle className="size-3" /> Already taken
            </span>
          )}
        </div>

        {slugSuggestions.length > 0 && slugAvailable === false && (
          <div className="flex items-center gap-2 flex-wrap pt-1">
            <span className="text-[11px] text-[#71717a]">Try an alternative:</span>
            {slugSuggestions.map((sug) => (
              <button
                key={sug}
                type="button"
                onClick={() => handleSlugChange(sug)}
                className="px-2.5 py-0.5 rounded-full bg-primary/10 hover:bg-primary/20 text-primary text-[11px] font-mono font-medium transition-colors cursor-pointer"
              >
                {sug}
              </button>
            ))}
          </div>
        )}

        <span className="text-[11px] text-[#888]">
          You can customize this address anytime.
        </span>
      </div>

      {/* 3. Privacy Mode & PIN Protection */}
      <div className="flex flex-col gap-4 p-5 rounded-2xl bg-white border border-black/[0.07]">
        <div className="flex flex-col gap-0.5">
          <label className="text-xs font-medium text-[#181925]">
            Privacy Level
          </label>
          <p className="text-[11px] text-[#71717a]">
            Choose who can discover or read this memorial.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              id: "public",
              title: "Public",
              desc: "Visible to anyone and indexed by search engines so distant friends can find it.",
              icon: Globe,
            },
            {
              id: "unlisted",
              title: "Unlisted",
              desc: "Only people who have the link can visit. Hidden from Google and search bots.",
              icon: Shield,
            },
            {
              id: "private",
              title: "Private PIN",
              desc: "Requires a 4-digit PIN code to view memories and stories.",
              icon: Lock,
              isPaidOnly: true,
            },
          ].map((mode) => {
            const Icon = mode.icon
            const isSelected = privacy === mode.id
            return (
              <div
                key={mode.id}
                onClick={() => {
                  if (mode.isPaidOnly && !isPaid) {
                    handleUpgradeComplete()
                    return
                  }
                  onChange("privacy", mode.id)
                }}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5 select-none ${
                  isSelected
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-black/[0.08] bg-[#fafafb] text-[#555] hover:border-black/[0.15]"
                }`}
              >
                <div className="flex items-center justify-between gap-1.5 font-medium text-xs">
                  <div className="flex items-center gap-1.5">
                    <Icon className="size-3.5" />
                    <span>{mode.title}</span>
                  </div>
                  {mode.isPaidOnly && !isPaid && (
                    <span className="text-[9px] font-mono uppercase font-semibold text-emerald-700 px-1.5 py-0.2 rounded bg-emerald-50 border border-emerald-200">
                      Complete
                    </span>
                  )}
                </div>
                <p className="text-[10px] leading-relaxed text-[#777]">{mode.desc}</p>
              </div>
            )
          })}
        </div>

        {/* PIN Code Setup (Only shown when Private PIN is selected) */}
        {privacy === "private" && (
          <div className="mt-2 p-4 rounded-xl bg-neutral-50 border border-black/[0.06] flex flex-col gap-3">
            {!isPaid && (
              <UpgradeBanner
                compact
                memorialId={memorialId}
                featureTitle="Private PIN Protection"
                description="Protect memories and stories behind a 4-digit PIN code for family and close friends."
                onUpgrade={handleUpgradeComplete}
              />
            )}

            <div className="flex flex-col gap-0.5">
              <label className="text-xs font-semibold text-[#181925] flex items-center gap-1.5">
                <Lock className="size-3 text-primary" />
                <span>Set 4-Digit Access PIN</span>
              </label>
              <p className="text-[11px] text-[#71717a]">
                Visitors must type this 4-digit code to read memories and condolences.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={4}
                disabled={!isPaid}
                value={pin}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/\D/g, "").slice(0, 4)
                  onChange("pin", cleaned)
                }}
                placeholder="1234"
                className="w-32 px-3 py-2 rounded-xl bg-white border border-black/[0.12] text-center text-sm font-mono font-bold tracking-widest text-[#181925] outline-none focus:border-primary disabled:bg-neutral-100 disabled:text-neutral-500 disabled:cursor-not-allowed"
              />
              <span className="text-xs text-[#71717a]">
                {!isPaid ? (
                  <span className="text-amber-700 font-medium">Upgrade to Pro to activate PIN</span>
                ) : pin && pin.length === 4 ? (
                  <span className="text-emerald-600 font-medium flex items-center gap-1">
                    <CheckCircle2 className="size-3.5" /> PIN active
                  </span>
                ) : (
                  "Enter 4 numbers"
                )}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 4. Page Sections & Visibility Controls */}
      <div className="flex flex-col gap-4 p-5 rounded-2xl bg-white border border-black/[0.07]">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <label className="text-xs font-medium text-[#181925] flex items-center gap-1.5">
              <Sliders className="size-3.5 text-primary" />
              <span>Page Sections & Layout</span>
            </label>
            <p className="text-[11px] text-[#71717a]">
              Turn memorial sections ON or OFF. Disabled sections disappear completely from the page and navigation bar.
            </p>
          </div>
        </div>

        <div className="flex flex-col divide-y divide-black/[0.05] border border-black/[0.06] rounded-xl overflow-hidden bg-[#fafafb]">
          {[
            {
              key: "tributes" as const,
              title: "Ritual Tributes",
              desc: "Offerings stream where visitors lay flowers, light candles, or leave notes.",
              icon: Heart,
              active: sectionSettings?.tributes !== false,
            },
            {
              key: "timeline" as const,
              title: "Life Timeline Chapters",
              desc: "Chronological milestone chapters and key dates in their journey.",
              icon: Calendar,
              active: sectionSettings?.timeline !== false,
            },
            {
              key: "gallery" as const,
              title: "Media Gallery",
              desc: "Family photo albums, recorded voice notes, and digitized home videos.",
              icon: ImageIcon,
              active: sectionSettings?.gallery !== false,
            },
            {
              key: "stories" as const,
              title: "Personal Stories & Memories",
              desc: "Narratives, anecdotes, and photo stories contributed by friends and family.",
              icon: MessageSquare,
              active: sectionSettings?.stories !== false,
            },
          ].map((sec) => {
            const Icon = sec.icon
            return (
              <div
                key={sec.key}
                className="flex items-center justify-between p-3.5 sm:px-4 hover:bg-white transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0 pr-4">
                  <div
                    className={`size-8 rounded-lg flex items-center justify-center shrink-0 border ${
                      sec.active
                        ? "bg-primary/10 text-primary border-primary/20"
                        : "bg-neutral-200/60 text-[#888] border-black/[0.05]"
                    }`}
                  >
                    <Icon className="size-4" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-medium text-[#181925] truncate">
                      {sec.title}
                    </span>
                    <span className="text-[11px] text-[#71717a] line-clamp-1">
                      {sec.desc}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 select-none shrink-0">
                  <span
                    className={`text-xs font-medium ${
                      sec.active ? "text-emerald-700" : "text-[#71717a]"
                    }`}
                  >
                    {sec.active ? "Active" : "Hidden"}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const current = {
                        tributes: sectionSettings?.tributes !== false,
                        timeline: sectionSettings?.timeline !== false,
                        gallery: sectionSettings?.gallery !== false,
                        stories: sectionSettings?.stories !== false,
                      }
                      onChange("section_settings", {
                        ...current,
                        story: true,
                        [sec.key]: !current[sec.key],
                      })
                    }}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      sec.active ? "bg-emerald-600" : "bg-neutral-300"
                    }`}
                    role="switch"
                    aria-checked={sec.active}
                    title={sec.active ? `Hide ${sec.title} on memorial` : `Show ${sec.title} on memorial`}
                  >
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none inline-block size-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                        sec.active ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Visitor Contributions & Permissions */}
      <div className="flex flex-col gap-4 p-5 rounded-2xl bg-white border border-black/[0.07]">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <label className="text-xs font-medium text-[#181925] flex items-center gap-1.5">
              <Heart className="size-3.5 text-primary" />
              <span>Visitor Contributions & Permissions</span>
            </label>
            <p className="text-[11px] text-[#71717a]">
              Control what visitors may submit. Turned OFF items disappear completely from public forms.
            </p>
          </div>

          <div className="flex items-center gap-2 select-none">
            <span
              className={`text-xs ${
                currentContributionSettings.accept_contributions !== false
                  ? "text-[#71717a]"
                  : "text-rose-700 font-medium"
              }`}
            >
              {currentContributionSettings.accept_contributions !== false ? "Open" : "Closed"}
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={currentContributionSettings.accept_contributions !== false}
              onClick={() =>
                handleToggleContributionSetting(
                  "accept_contributions",
                  currentContributionSettings.accept_contributions === false
                )
              }
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                currentContributionSettings.accept_contributions !== false
                  ? "bg-emerald-600"
                  : "bg-neutral-300"
              }`}
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block size-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                  currentContributionSettings.accept_contributions !== false
                    ? "translate-x-4"
                    : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        {currentContributionSettings.accept_contributions !== false && (
          <div className="flex flex-col divide-y divide-black/[0.05] border border-black/[0.06] rounded-xl overflow-hidden bg-[#fafafb]">
            {[
              {
                key: "tributes" as const,
                title: "Tributes & Quiet Condolences",
                desc: "Visitors can lay flowers, light candles, or leave quiet written notes of remembrance.",
              },
              {
                key: "memories" as const,
                title: "Memories & Written Stories",
                desc: "Visitors can write anecdotal stories and personal reflections about their life.",
              },
              {
                key: "photos" as const,
                title: "Photographs",
                desc: "Allow visitors to contribute photos they took or cherished.",
              },
              {
                key: "voice" as const,
                title: "Voice Notes",
                desc: "Voicemails or spoken memories uploaded by family and friends.",
              },
              {
                key: "videos" as const,
                title: "Video Clips",
                desc: "Home movies, celebrations, or recorded video clips.",
              },
              {
                key: "moments" as const,
                title: "Life Moments",
                desc: "Timeline additions and significant milestone suggestions.",
              },
            ].map((opt) => {
              const active = currentContributionSettings[opt.key] !== false
              return (
                <div
                  key={opt.key}
                  className="flex items-center justify-between p-3.5 sm:px-4 hover:bg-white transition-colors"
                >
                  <div className="flex flex-col min-w-0 pr-4">
                    <span className="text-xs font-medium text-[#181925]">{opt.title}</span>
                    <span className="text-[11px] text-[#71717a]">{opt.desc}</span>
                  </div>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={active}
                    onClick={() => handleToggleContributionSetting(opt.key, !active)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      active ? "bg-emerald-600" : "bg-neutral-300"
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none inline-block size-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                        active ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* 5. Multiple Family Caretakers & Collaborators (Complete Plan Feature) */}
      <div className="flex flex-col gap-4 p-5 rounded-2xl bg-white border border-black/[0.07]">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <label className="text-xs font-medium text-[#181925] flex items-center gap-1.5">
              <Users className="size-3.5 text-primary" />
              <span>Family Caretakers & Collaborators</span>
            </label>
            <p className="text-[11px] text-[#71717a]">
              Invite family members as co-admins to help approve memories, write stories, and upload photos.
            </p>
          </div>
          {!isPaid && (
            <span className="text-[10px] font-mono uppercase font-semibold text-emerald-700 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 shrink-0">
              Pro Plan
            </span>
          )}
        </div>

        {!isPaid && (
          <UpgradeBanner
            compact
            memorialId={memorialId}
            featureTitle="Unlimited Family Caretakers"
            description="Invite children, siblings, and cousins to curate this memorial together without account friction."
            onUpgrade={handleUpgradeComplete}
          />
        )}

        {/* Invite Form */}
        <form onSubmit={handleAddCollaborator} className={`flex flex-col sm:flex-row gap-2 ${!isPaid ? "opacity-75" : ""}`}>
          <input
            type="email"
            required
            disabled={!isPaid}
            value={collabEmail}
            onChange={(e) => setCollabEmail(e.target.value)}
            placeholder={!isPaid ? "Upgrade to invite family co-admins..." : "Family member email..."}
            className="flex-1 px-3.5 py-2 rounded-xl bg-[#fafafb] border border-black/[0.08] text-xs text-[#181925] outline-none focus:border-primary/50 disabled:bg-neutral-100 disabled:text-neutral-500 disabled:cursor-not-allowed"
          />
          <select
            disabled={!isPaid}
            value={collabRole}
            onChange={(e) => setCollabRole(e.target.value as any)}
            className="px-3 py-2 rounded-xl bg-[#fafafb] border border-black/[0.08] text-xs text-[#181925] outline-none cursor-pointer disabled:bg-neutral-100 disabled:text-neutral-500 disabled:cursor-not-allowed"
          >
            <option value="co_admin">Co-admin (Can moderate)</option>
            <option value="contributor">Contributor</option>
          </select>
          <button
            type="submit"
            disabled={!isPaid || collabAdding || !collabEmail.trim()}
            className={`inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium transition-colors ${
              !isPaid
                ? "bg-neutral-100 text-neutral-500 border border-neutral-200 cursor-not-allowed"
                : "bg-[#181925] hover:bg-[#252736] disabled:opacity-50 text-white cursor-pointer"
            }`}
          >
            {!isPaid ? (
              <>
                <Lock className="size-3" />
                <span>Upgrade to invite</span>
              </>
            ) : collabAdding ? (
              <Loader2 className="size-3 animate-spin" />
            ) : (
              <>
                <UserPlus className="size-3" />
                <span>Invite</span>
              </>
            )}
          </button>
        </form>

        {collabError && (
          <span className="text-[11px] text-rose-600 font-medium">{collabError}</span>
        )}

        {/* Collaborators List */}
        {loadingCollabs ? (
          <span className="text-xs text-[#888] animate-pulse">Loading caretakers...</span>
        ) : collaborators.length === 0 ? (
          <span className="text-xs text-[#888] italic">No additional caretakers invited yet.</span>
        ) : (
          <div className="flex flex-col gap-2.5 border-t border-black/[0.04] pt-3">
            {collaborators.map((c) => (
              <div
                key={c.id}
                className="flex flex-col p-3 rounded-xl bg-[#fafafb] border border-black/[0.04] text-xs gap-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-[#181925]">{c.email}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary uppercase font-semibold">
                      {c.role === "co_admin" ? "Co-admin" : "Contributor"}
                    </span>
                    {c.invitation_accepted === false && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                        Pending
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    {c.inviteLink && c.invitation_accepted === false && (
                      <button
                        type="button"
                        onClick={() => handleCopyInvite(c.id, c.inviteLink)}
                        className="text-[11px] text-[#71717a] hover:text-primary transition-colors cursor-pointer inline-flex items-center gap-1"
                        title="Copy invitation link"
                      >
                        {copiedCollabId === c.id ? (
                          <span className="text-emerald-600 font-medium">Link copied!</span>
                        ) : (
                          <span className="underline">Copy link</span>
                        )}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setCaretakerToDelete(c)}
                      className="text-[#aaa] hover:text-rose-600 transition-colors cursor-pointer"
                      title="Remove caretaker"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>

                {/* Trust Switch for Contributor Role */}
                {c.role === "contributor" ? (
                  <div className="flex items-center justify-between pt-2 border-t border-black/[0.04]">
                    <div className="flex flex-col pr-3">
                      <span className="text-[11px] font-medium text-[#181925]">
                        Trust {c.email.split("@")[0]}&apos;s contributions
                      </span>
                      <span className="text-[10px] text-[#71717a] leading-tight">
                        Contributions appear without waiting for your approval. Theirs will still run automated safety checks.
                      </span>
                    </div>

                    <button
                      type="button"
                      role="switch"
                      aria-checked={Boolean(c.is_trusted)}
                      onClick={() => handleToggleTrust(c.id, Boolean(c.is_trusted))}
                      className={`relative inline-flex h-4.5 w-8 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        c.is_trusted ? "bg-emerald-600" : "bg-neutral-300"
                      }`}
                      title={c.is_trusted ? "Trusted contributor (auto-publishes)" : "Approval required"}
                    >
                      <span
                        aria-hidden="true"
                        className={`pointer-events-none inline-block size-3.5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                          c.is_trusted ? "translate-x-3.5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                ) : (
                  <div className="pt-1.5 border-t border-black/[0.04]">
                    <span className="text-[10px] text-[#71717a] italic">
                      Co-admins have full moderation and direct publishing privileges.
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. Successor Caretaker & Ownership Transfer (Complete Plan Feature) */}
      <div className="flex flex-col gap-4 p-5 rounded-2xl bg-white border border-black/[0.07]">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <label className="text-xs font-medium text-[#181925]">
              Successor Caretaker & Rights Transfer
            </label>
            <p className="text-[11px] text-[#71717a]">
              Designate who in your family should have ownership if you are ever unable to manage this memorial.
            </p>
          </div>
          {!isPaid && (
            <span className="text-[10px] font-mono uppercase font-semibold text-emerald-700 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 shrink-0">
              Pro Plan
            </span>
          )}
        </div>

        {!isPaid && (
          <UpgradeBanner
            compact
            memorialId={memorialId}
            featureTitle="Successor Stewardship & Transfer"
            description="Ensure the memorial lives on across generations by designating a successor caretaker and enabling ownership transfers."
            onUpgrade={handleUpgradeComplete}
          />
        )}

        <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 ${!isPaid ? "opacity-75" : ""}`}>
          <input
            type="text"
            disabled={!isPaid}
            value={successorName}
            onChange={(e) => onChange("successor_name", e.target.value)}
            placeholder="Successor Name (e.g. Anita Carter)"
            className="px-3.5 py-2 rounded-xl bg-[#fafafb] border border-black/[0.08] text-xs text-[#181925] outline-none focus:border-primary/50 disabled:bg-neutral-100 disabled:text-neutral-500 disabled:cursor-not-allowed"
          />

          <input
            type="email"
            disabled={!isPaid}
            value={successorEmail}
            onChange={(e) => onChange("successor_email", e.target.value)}
            placeholder="Successor Email"
            className="px-3.5 py-2 rounded-xl bg-[#fafafb] border border-black/[0.08] text-xs text-[#181925] outline-none focus:border-primary/50 disabled:bg-neutral-100 disabled:text-neutral-500 disabled:cursor-not-allowed"
          />
        </div>

        {/* Transfer Ownership Section */}
        <div className={`border-t border-black/[0.05] pt-3 flex flex-col gap-2.5 ${!isPaid ? "opacity-75" : ""}`}>
          <span className="text-xs font-medium text-[#181925]">
            Transfer Memorial Ownership Now
          </span>
          <p className="text-[11px] text-[#71717a]">
            Permanently hand over primary stewardship to another family member. You will remain a co-admin.
          </p>

          <div className="flex gap-2">
            <input
              type="email"
              disabled={!isPaid}
              value={transferTargetEmail}
              onChange={(e) => setTransferTargetEmail(e.target.value)}
              placeholder="New owner's email address..."
              className="flex-1 px-3.5 py-2 rounded-xl bg-[#fafafb] border border-black/[0.08] text-xs text-[#181925] outline-none focus:border-primary/50 disabled:bg-neutral-100 disabled:text-neutral-500 disabled:cursor-not-allowed"
            />
            <button
              type="button"
              disabled={!isPaid || transferring || !transferTargetEmail.trim()}
              onClick={handleTransferOwnership}
              className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                !isPaid
                  ? "bg-neutral-100 text-neutral-500 border border-neutral-200 cursor-not-allowed"
                  : "bg-primary text-white hover:bg-primary/95 disabled:opacity-50 cursor-pointer"
              }`}
            >
              {!isPaid ? (
                <>
                  <Lock className="size-3 inline mr-1" />
                  <span>Upgrade to transfer</span>
                </>
              ) : transferring ? (
                "Transferring..."
              ) : (
                "Transfer Ownership"
              )}
            </button>
          </div>

          {transferSuccess && (
            <span className="text-xs text-emerald-700 font-medium">{transferSuccess}</span>
          )}
          {transferError && (
            <span className="text-xs text-rose-600 font-medium">{transferError}</span>
          )}
        </div>
      </div>

      {/* 6. Preservation & Download Complete Archive (Landing Page Promise) */}
      <div className="flex flex-col gap-3 p-5 rounded-2xl bg-white border border-black/[0.07]">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <label className="text-xs font-medium text-[#181925] flex items-center gap-1.5">
              <Download className="size-3.5 text-primary" />
              <span>Preservation & Data Export</span>
            </label>
            <p className="text-[11px] text-[#71717a]">
              Download the complete family archive. All stories, timeline events, and direct links to original high-res photos and audio are preserved without lock-in.
            </p>
          </div>
          {!isPaid && (
            <span className="text-[10px] font-mono uppercase font-semibold text-emerald-700 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 shrink-0">
              Pro Plan
            </span>
          )}
        </div>

        {!isPaid && (
          <UpgradeBanner
            compact
            memorialId={memorialId}
            featureTitle="Full Data Export Archive"
            description="Download all original media, voice memos, and stories in a complete zip archive. Guaranteed preservation without lock-in."
            onUpgrade={handleUpgradeComplete}
          />
        )}

        {isPaid ? (
          <a
            href={`/api/memorials/${memorialId}/export`}
            download
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#fafafb] hover:bg-[#f2f2f4] border border-black/[0.08] text-xs font-medium text-[#181925] transition-colors w-fit cursor-pointer"
          >
            <Download className="size-3.5 text-primary" />
            <span>Download Complete Archive (.zip)</span>
          </a>
        ) : (
          <button
            type="button"
            onClick={handleUpgradeComplete}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-neutral-100 border border-neutral-200 text-xs font-medium text-neutral-500 transition-colors w-fit cursor-pointer hover:bg-neutral-200"
          >
            <Lock className="size-3.5" />
            <span>Upgrade to Download Archive</span>
          </button>
        )}
      </div>

      {/* 7. Danger Zone: Delete Memorial */}
      <div className="flex flex-col gap-3 p-5 rounded-2xl bg-rose-50/40 border border-rose-200">
        <div className="flex items-center gap-2 text-rose-700 font-medium text-xs">
          <AlertTriangle className="size-4" />
          <span>Danger Zone: Permanent Deletion</span>
        </div>
        <p className="text-[11px] text-rose-800 leading-relaxed">
          Deleting this memorial permanently removes all memories, photos, voice notes, and timeline chapters. This action cannot be undone.
        </p>

        <div className="flex flex-col gap-2 pt-2">
          <label className="text-[11px] text-[#666]">
            Type <strong className="font-mono text-rose-700">DELETE</strong> to confirm:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="DELETE"
              className="w-36 px-3 py-1.5 rounded-xl bg-white border border-rose-200 text-xs font-mono outline-none"
            />
            <button
              type="button"
              disabled={confirmText !== "DELETE" || isDeleting}
              onClick={handleDelete}
              className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-medium transition-colors cursor-pointer"
            >
              {isDeleting ? "Deleting..." : "Delete Permanently"}
            </button>
          </div>
        </div>
      </div>

      <ConfirmDeleteModal
        isOpen={!!caretakerToDelete}
        title="Remove caretaker?"
        description="This family caretaker will lose access to collaborate and manage this memorial."
        itemPreview={
          caretakerToDelete
            ? `${caretakerToDelete.email} (${caretakerToDelete.role === "co_admin" ? "Co-admin" : "Contributor"})`
            : null
        }
        confirmLabel="Remove caretaker"
        isDeleting={isRemovingCaretaker}
        onConfirm={handleConfirmRemoveCollaborator}
        onClose={() => !isRemovingCaretaker && setCaretakerToDelete(null)}
      />
    </div>
  )
}
