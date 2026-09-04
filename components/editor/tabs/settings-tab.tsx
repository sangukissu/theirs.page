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
} from "lucide-react"

interface CollaboratorItem {
  id: string
  email: string
  role: "co_admin" | "contributor"
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
  onChange,
  onDeleteMemorial,
}: SettingsTabProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [confirmText, setConfirmText] = useState("")

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

  // 3. Remove Caretaker
  const handleRemoveCollaborator = async (collabId: string) => {
    try {
      const res = await fetch(
        `/api/memorials/${memorialId}/collaborators?collaboratorId=${collabId}`,
        { method: "DELETE" }
      )
      if (res.ok) {
        setCollaborators(collaborators.filter((c) => c.id !== collabId))
      }
    } catch (err) {
      console.error("Failed to remove caretaker:", err)
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

  // 5. Delete Memorial
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
          Permanent Web Address
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
            },
          ].map((mode) => {
            const Icon = mode.icon
            const isSelected = privacy === mode.id
            return (
              <div
                key={mode.id}
                onClick={() => onChange("privacy", mode.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5 select-none ${
                  isSelected
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-black/[0.08] bg-[#fafafb] text-[#555] hover:border-black/[0.15]"
                }`}
              >
                <div className="flex items-center gap-1.5 font-medium text-xs">
                  <Icon className="size-3.5" />
                  <span>{mode.title}</span>
                </div>
                <p className="text-[10px] leading-relaxed text-[#777]">{mode.desc}</p>
              </div>
            )
          })}
        </div>

        {/* PIN Code Setup (Only shown when Private PIN is selected) */}
        {privacy === "private" && (
          <div className="mt-2 p-4 rounded-xl bg-neutral-50 border border-black/[0.06] flex flex-col gap-3">
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
                value={pin}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/\D/g, "").slice(0, 4)
                  onChange("pin", cleaned)
                }}
                placeholder="1234"
                className="w-32 px-3 py-2 rounded-xl bg-white border border-black/[0.12] text-center text-sm font-mono font-bold tracking-widest text-[#181925] outline-none focus:border-primary"
              />
              <span className="text-xs text-[#71717a]">
                {pin && pin.length === 4 ? (
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

      {/* 4. Multiple Family Caretakers & Collaborators (Complete Plan Feature) */}
      <div className="flex flex-col gap-4 p-5 rounded-2xl bg-white border border-black/[0.07]">
        <div className="flex flex-col gap-0.5">
          <label className="text-xs font-medium text-[#181925] flex items-center gap-1.5">
            <Users className="size-3.5 text-primary" />
            <span>Family Caretakers & Collaborators</span>
          </label>
          <p className="text-[11px] text-[#71717a]">
            Invite family members as co-admins to help approve memories, write stories, and upload photos.
          </p>
        </div>

        {/* Invite Form */}
        <form onSubmit={handleAddCollaborator} className="flex flex-col sm:flex-row gap-2">
          <input
            type="email"
            required
            value={collabEmail}
            onChange={(e) => setCollabEmail(e.target.value)}
            placeholder="Family member email..."
            className="flex-1 px-3.5 py-2 rounded-xl bg-[#fafafb] border border-black/[0.08] text-xs text-[#181925] outline-none focus:border-primary/50"
          />
          <select
            value={collabRole}
            onChange={(e) => setCollabRole(e.target.value as any)}
            className="px-3 py-2 rounded-xl bg-[#fafafb] border border-black/[0.08] text-xs text-[#181925] outline-none cursor-pointer"
          >
            <option value="co_admin">Co-admin (Can moderate)</option>
            <option value="contributor">Contributor</option>
          </select>
          <button
            type="submit"
            disabled={collabAdding || !collabEmail.trim()}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#181925] hover:bg-[#252736] disabled:opacity-50 text-white text-xs font-medium transition-colors cursor-pointer"
          >
            {collabAdding ? <Loader2 className="size-3 animate-spin" /> : <UserPlus className="size-3" />}
            <span>Invite</span>
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
          <div className="flex flex-col gap-2 border-t border-black/[0.04] pt-3">
            {collaborators.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-[#fafafb] border border-black/[0.04] text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium text-[#181925]">{c.email}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary uppercase font-semibold">
                    {c.role === "co_admin" ? "Co-admin" : "Contributor"}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveCollaborator(c.id)}
                  className="text-[#aaa] hover:text-rose-600 transition-colors cursor-pointer"
                  title="Remove caretaker"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. Successor Caretaker & Ownership Transfer (Complete Plan Feature) */}
      <div className="flex flex-col gap-4 p-5 rounded-2xl bg-white border border-black/[0.07]">
        <div className="flex flex-col gap-0.5">
          <label className="text-xs font-medium text-[#181925]">
            Successor Caretaker & Rights Transfer
          </label>
          <p className="text-[11px] text-[#71717a]">
            Designate who in your family should have ownership if you are ever unable to manage this memorial.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="text"
            value={successorName}
            onChange={(e) => onChange("successor_name", e.target.value)}
            placeholder="Successor Name (e.g. Anita Carter)"
            className="px-3.5 py-2 rounded-xl bg-[#fafafb] border border-black/[0.08] text-xs text-[#181925] outline-none focus:border-primary/50"
          />

          <input
            type="email"
            value={successorEmail}
            onChange={(e) => onChange("successor_email", e.target.value)}
            placeholder="Successor Email"
            className="px-3.5 py-2 rounded-xl bg-[#fafafb] border border-black/[0.08] text-xs text-[#181925] outline-none focus:border-primary/50"
          />
        </div>

        {/* Transfer Ownership Section */}
        <div className="border-t border-black/[0.05] pt-3 flex flex-col gap-2.5">
          <span className="text-xs font-medium text-[#181925]">
            Transfer Memorial Ownership Now
          </span>
          <p className="text-[11px] text-[#71717a]">
            Permanently hand over primary stewardship to another family member. You will remain a co-admin.
          </p>

          <div className="flex gap-2">
            <input
              type="email"
              value={transferTargetEmail}
              onChange={(e) => setTransferTargetEmail(e.target.value)}
              placeholder="New owner's email address..."
              className="flex-1 px-3.5 py-2 rounded-xl bg-[#fafafb] border border-black/[0.08] text-xs text-[#181925] outline-none focus:border-primary/50"
            />
            <button
              type="button"
              disabled={transferring || !transferTargetEmail.trim()}
              onClick={handleTransferOwnership}
              className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-medium hover:bg-primary/95 disabled:opacity-50 transition-all cursor-pointer"
            >
              {transferring ? "Transferring..." : "Transfer Ownership"}
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
        <div className="flex flex-col gap-0.5">
          <label className="text-xs font-medium text-[#181925] flex items-center gap-1.5">
            <Download className="size-3.5 text-primary" />
            <span>Preservation & Data Export</span>
          </label>
          <p className="text-[11px] text-[#71717a]">
            Download the complete family archive. All stories, timeline events, and direct links to original high-res photos and audio are preserved without lock-in.
          </p>
        </div>

        <a
          href={`/api/memorials/${memorialId}/export`}
          download
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#fafafb] hover:bg-[#f2f2f4] border border-black/[0.08] text-xs font-medium text-[#181925] transition-colors w-fit cursor-pointer"
        >
          <Download className="size-3.5 text-primary" />
          <span>Download Complete Archive (.json)</span>
        </a>
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
    </div>
  )
}
