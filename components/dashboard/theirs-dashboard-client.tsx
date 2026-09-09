"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { normalizeMemorialSlug } from "@/lib/memorial-slug"
import {
  Plus,
  ArrowRight,
  ArrowLeft,
  ExternalLink,
  Sparkles,
  Image as ImageIcon,
  Share2,
  Check,
  Shield,
  Loader2,
  Heart,
} from "lucide-react"
import { PortraitPlaceholder } from "@/components/memorial/portrait-placeholder"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { TEXT_LIMITS } from "@/lib/validation/text-limits"
import { track, identify } from "@/lib/analytics"

interface MemorialSummary {
  id: string
  slug: string
  full_name: string
  birth_year?: number | null
  death_year?: number | null
  headline?: string | null
  portrait_photo_url?: string | null
  status: "draft" | "published" | "archived"
  privacy: "public" | "unlisted" | "private"
  is_paid: boolean
  created_at: string
  access_role: "owner" | "co_admin" | "trusted" | "contributor"
}

interface TheirsDashboardClientProps {
  userEmail: string
  userId: string
  initialMemorials: MemorialSummary[]
  initialName?: string
  initialSlug?: string
  initialCaretakerName?: string
}

const RELATIONSHIP_CHOICES = [
  "Child",
  "Parent",
  "Spouse / partner",
  "Sibling",
  "Grandchild",
  "Grandparent",
  "Other family",
  "Friend",
  "Colleague",
  "Caregiver",
  "Something else",
]

export function TheirsDashboardClient({
  userEmail,
  userId,
  initialMemorials,
  initialName = "",
  initialSlug = "",
  initialCaretakerName = "",
}: TheirsDashboardClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [memorials, setMemorials] = useState<MemorialSummary[]>(initialMemorials)
  const [profileName, setProfileName] = useState(initialCaretakerName.trim().slice(0, 60))
  const [creatorNameInput, setCreatorNameInput] = useState(initialCaretakerName.trim().slice(0, 60))
  const [isCreating, setIsCreating] = useState(initialMemorials.length === 0 || Boolean(initialName.trim()))
  const [fullNameInput, setFullNameInput] = useState(initialName.slice(0, 80))
  const [relationship, setRelationship] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [checkingOutId, setCheckingOutId] = useState<string | null>(null)

  const showCreateForm = isCreating || memorials.length === 0
  const firstName = fullNameInput.trim().split(" ")[0] || ""
  const accessNotice = searchParams.get("access")

  // Identify user with Open Analytics (using pseudonymous user ID)
  useEffect(() => {
    if (userId) {
      identify(userId)
    }
  }, [userId])

  const handleUpgrade = async (memorialId: string) => {
    setCheckingOutId(memorialId)
    track("checkout_initiated", { plan: "complete", source: "dashboard" })
    try {
      const res = await fetch("/api/checkout/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memorialId }),
      })
      const data = await res.json()
      const redirectUrl = data.url || data.checkout_url || data.payment_link
      if (res.ok && redirectUrl) {
        window.location.href = redirectUrl
      } else {
        alert(data.error || "Could not launch checkout session")
        setCheckingOutId(null)
      }
    } catch {
      alert("Network error launching checkout")
      setCheckingOutId(null)
    }
  }

  // Auto-fill on initial load if pending memorial exists
  useEffect(() => {
    if (isSubmitting || isRedirecting) return
    let nameToUse = initialName

    if (!nameToUse) {
      const paramName = searchParams.get("name")?.trim()
      if (paramName) {
        nameToUse = paramName
      } else {
        // Fallback to cookie
        const nameMatch = document.cookie.match(/(?:^|;\s*)theirs_pending_name=([^;]+)/)
        if (nameMatch && nameMatch[1]) {
          nameToUse = decodeURIComponent(nameMatch[1]).trim()
        } else {
          // Fallback to localStorage
          try {
            const stored = localStorage.getItem("theirs_pending_memorial")
            if (stored) {
              const parsed = JSON.parse(stored)
              if (parsed?.name) {
                nameToUse = parsed.name.trim()
              }
            }
          } catch { }
        }
      }
    }

    if (nameToUse) {
      setFullNameInput(nameToUse.slice(0, TEXT_LIMITS.personFullName))
      setIsCreating(true)
    }
  }, [initialName, searchParams])

  const handleCreate = async (e?: React.FormEvent, skipRelationship = false) => {
    if (e) e.preventDefault()
    const targetName = fullNameInput.trim().slice(0, TEXT_LIMITS.personFullName)
    if (!targetName) {
      setErrorMsg("Please provide the name of the person you are remembering.")
      return
    }

    const effectiveCreatorName = (profileName || creatorNameInput).trim().slice(0, 60)
    if (!profileName && effectiveCreatorName.length < 2) {
      setErrorMsg("Please enter your name so family and friends know who is caring for this memorial.")
      return
    }

    setIsSubmitting(true)
    setErrorMsg(null)

    try {
      const selectedRel = skipRelationship ? null : (relationship.trim() || null)
      const res = await fetch("/api/memorials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: targetName,
          creator_name: !profileName ? effectiveCreatorName : undefined,
          creator_relationship: selectedRel,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Failed to create memorial")
      }

      track("memorial_created", {
        relationship: selectedRel || "unspecified",
      })

      setIsRedirecting(true)

      // Clean up pending memorial storage & cookies
      try {
        localStorage.removeItem("theirs_pending_memorial")
        document.cookie = "theirs_pending_name=; path=/; max-age=0"
        document.cookie = "theirs_pending_slug=; path=/; max-age=0"
      } catch { }

      // Route immediately into the low-friction Memorial Editor
      router.replace(`/dashboard/memorials/${data.memorial.id}/editor`)
    } catch (err: any) {
      setErrorMsg(err.message)
      setIsSubmitting(false)
      setIsRedirecting(false)
    }
  }

  const handleCancelCreate = () => {
    if (memorials.length === 0) return
    setIsCreating(false)
    setFullNameInput("")
    setRelationship("")
    setErrorMsg(null)
    try {
      localStorage.removeItem("theirs_pending_memorial")
      document.cookie = "theirs_pending_name=; path=/; max-age=0"
      document.cookie = "theirs_pending_slug=; path=/; max-age=0"
    } catch { }
    const url = new URL(window.location.href)
    if (url.searchParams.has("name") || url.searchParams.has("slug")) {
      url.searchParams.delete("name")
      url.searchParams.delete("slug")
      window.history.replaceState({}, "", url.pathname + (url.search ? url.search : ""))
    }
  }

  const handleCopyLink = (slug: string, id: string) => {
    const url = `${window.location.origin}/${slug}`
    navigator.clipboard.writeText(url)
    track("memorial_shared", { channel: "copy_link", source: "dashboard" })
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="flex-1 w-full flex flex-col">
      {/* 1. CREATION / ONBOARDING VIEW */}
      {showCreateForm ? (
        <main className="max-w-xl w-full mx-auto px-4 sm:px-6 py-10 sm:py-16 flex-1 flex flex-col justify-center gap-6">
          {memorials.length > 0 && (
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={handleCancelCreate}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-[#71717a] hover:text-[#181925] transition-colors cursor-pointer py-1"
              >
                <ArrowLeft className="size-3.5" />
                <span>Back to your memorials</span>
              </button>
            </div>
          )}

          <div className="rounded-2xl bg-white p-6 sm:p-7 border border-black/[0.04]">
            <div className="flex flex-col gap-1.5 pb-4">
              <span className="text-[11px] font-mono font-medium text-primary uppercase tracking-wider">
                New Memorial
              </span>
              <h2 className="text-2xl sm:text-3xl font-heading font-medium tracking-tight text-[#181925]">
                {firstName ? (
                  <>
                    Your connection to <span className="text-primary">{firstName}</span>
                  </>
                ) : (
                  "Who would you like to remember?"
                )}
              </h2>
              <p className="text-xs sm:text-sm text-[#71717a] leading-relaxed">
                {firstName
                  ? "A little context helps family and friends know who’s caring for this page."
                  : "Start with their name. You can add their stories, photos, voice notes, and memories whenever you’re ready."}
              </p>
            </div>

            <form onSubmit={(e) => handleCreate(e, false)} className="flex flex-col gap-5">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
                  {errorMsg}
                </div>
              )}

              {/* If name not already entered on landing page, ask for their full name */}
              {!initialName && (
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="memorial-person-name" className="text-xs font-medium text-[#181925]">
                    Their full name *
                  </label>
                  <input
                    id="memorial-person-name"
                    type="text"
                    required
                    autoFocus
                    maxLength={80}
                    disabled={isSubmitting || isRedirecting}
                    value={fullNameInput}
                    onChange={(e) => setFullNameInput(e.target.value.slice(0, 80))}
                    placeholder="e.g. Robert Edward Carter"
                    className="px-4 py-2.5 rounded-xl bg-[#fafafb] border border-black/[0.08] text-sm text-[#181925] placeholder:text-[#aaa] outline-none focus:border-primary/60 transition-colors disabled:opacity-60"
                  />
                </div>
              )}

              {/* If user profile name is not yet saved, ask for their name once */}
              {!profileName && (
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="creator-name" className="text-xs font-medium text-[#181925]">
                    Your name *
                  </label>
                  <input
                    id="creator-name"
                    type="text"
                    required
                    autoComplete="name"
                    autoFocus={Boolean(initialName)}
                    maxLength={60}
                    disabled={isSubmitting || isRedirecting}
                    value={creatorNameInput}
                    onChange={(e) => setCreatorNameInput(e.target.value.slice(0, 60))}
                    placeholder="e.g. Anita Carter"
                    className="px-4 py-2.5 rounded-xl bg-[#fafafb] border border-black/[0.08] text-sm text-[#181925] placeholder:text-[#aaa] outline-none focus:border-primary/60 transition-colors disabled:opacity-60"
                  />
                  <span className="text-[11px] text-[#888]">
                    Family and friends will see this as the creator of the memorial.
                  </span>
                </div>
              )}

              {/* Relationship dropdown (Custom Radix UI Select) */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="creator-relationship" className="text-xs font-medium text-[#181925]">
                  {firstName ? (
                    <>
                      You are <span className="text-primary">{firstName}</span>’s…
                    </>
                  ) : (
                    "You are their…"
                  )}
                </label>
                <Select
                  disabled={isSubmitting || isRedirecting}
                  value={relationship || undefined}
                  onValueChange={(val) => setRelationship(val === "clear" ? "" : val)}
                >
                  <SelectTrigger
                    id="creator-relationship"
                    className="w-full h-11 px-4 rounded-xl bg-[#fafafb] border border-black/[0.08] text-sm text-[#181925] outline-none focus:border-primary/60 transition-colors"
                  >
                    <SelectValue placeholder="Select relationship (optional)..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="clear" className="text-[#888]">
                      Select relationship (optional)...
                    </SelectItem>
                    {RELATIONSHIP_CHOICES.map((rel) => (
                      <SelectItem key={rel} value={rel}>
                        {rel}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="text-[11px] text-[#888]">
                  You can change or hide this later.
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || isRedirecting || !fullNameInput.trim() || (!profileName && creatorNameInput.trim().length < 2)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 whitespace-nowrap !rounded-full font-medium transition-all cursor-pointer border border-[color-mix(in_srgb,var(--primary)_80%,#3a3480)] bg-[color-mix(in_srgb,var(--primary)_90%,#3a3480)] text-primary-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.22),inset_0_-1px_0_rgba(58,52,128,0.30)] transform-gpu hover:bg-primary hover:border-[color-mix(in_srgb,var(--primary)_70%,#3a3480)] active:translate-y-px active:scale-[0.98] h-10 px-6 text-xs sm:text-sm select-none disabled:opacity-50 disabled:pointer-events-none"
                >
                  {isSubmitting || isRedirecting ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin" />
                      <span>{isRedirecting ? "Opening memorial..." : "Creating memorial..."}</span>
                    </>
                  ) : (
                    <>
                      <span>{firstName ? `Create ${firstName}’s memorial` : "Create memorial"}</span>
                      <ArrowRight className="size-3.5" />
                    </>
                  )}
                </button>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    disabled={isSubmitting || isRedirecting}
                    onClick={() => handleCreate(undefined, true)}
                    className="text-xs text-[#71717a] hover:text-[#181925] underline underline-offset-2 transition-colors cursor-pointer py-1 disabled:opacity-50"
                  >
                    Skip for now
                  </button>
                  {memorials.length > 0 && (
                    <button
                      type="button"
                      disabled={isSubmitting || isRedirecting}
                      onClick={handleCancelCreate}
                      className="text-xs text-[#71717a] hover:text-[#181925] transition-colors cursor-pointer py-1 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </main>
      ) : (
        /* 2. EXISTING MEMORIALS LIST */
        <main className="max-w-3xl w-full mx-auto px-4 sm:px-6 py-10 sm:py-14 flex-1 flex flex-col gap-8">
          {(accessNotice === "denied" || accessNotice === "revoked") && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
              {accessNotice === "revoked"
                ? "Your access to that memorial has been removed."
                : "You do not have permission to open that memorial’s Studio."}
            </div>
          )}

          {/* Title Header */}
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl sm:text-3xl font-heading font-medium tracking-tight text-[#181925]">
                Memorials
              </h1>
              <p className="text-xs sm:text-sm text-[#71717a]">
                A quiet place for the people you never want to forget.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsCreating(true)}
              className="inline-flex items-center gap-1.5 whitespace-nowrap !rounded-full font-medium transition-all cursor-pointer border border-[color-mix(in_srgb,var(--primary)_80%,#3a3480)] bg-[color-mix(in_srgb,var(--primary)_90%,#3a3480)] text-primary-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.22),inset_0_-1px_0_rgba(58,52,128,0.30)] transform-gpu hover:bg-primary hover:border-[color-mix(in_srgb,var(--primary)_70%,#3a3480)] active:translate-y-px active:scale-[0.98] h-8.5 px-4 text-xs select-none self-start sm:self-auto"
            >
              <Plus className="size-3.5" />
              <span>Create memorial</span>
            </button>
          </div>

          <div className="flex flex-col gap-4">
            {/* Complete Highlights Banner if user has unpaid memorials */}
            {memorials.some((m) => m.access_role === "owner" && !m.is_paid) && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[#1f1f1f] text-white border border-white/[0.08] shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <Sparkles className="size-4" />
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-white">Pro Plan</span>
                      <span className="text-[10px] font-mono uppercase font-semibold text-emerald-400 px-1.5 py-0.2 rounded bg-emerald-950/60 border border-emerald-800/40">
                        $179 One-Time
                      </span>
                    </div>
                    <span className="text-[11px] text-[#9c9c9c]">
                      Unlock original-resolution photos, voice memos, home video clips, private PIN protection, and full family data export.
                    </span>
                  </div>
                </div>
                <span className="text-[11px] text-neutral-400 hidden lg:inline font-mono">
                  Per-memorial · No monthly fees
                </span>
              </div>
            )}

            {memorials.map((m) => {
              const yearSpan = m.birth_year && m.death_year ? `${m.birth_year} — ${m.death_year}` : "Memorial"
              const canOpenStudio = m.access_role === "owner" || m.access_role === "co_admin"
              const isOwner = m.access_role === "owner"
              const roleLabel = isOwner
                ? "Owner"
                : m.access_role === "co_admin"
                  ? "Co-admin"
                  : m.access_role === "trusted"
                    ? "Trusted contributor"
                    : "Contributor"

              return (
                <div
                  key={m.id}
                  className="p-6 rounded-3xl bg-white border border-black/[0.07] hover:border-black/[0.14] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-2xs group"
                >
                  {/* Left: Avatar & Identity */}
                  <div className="flex items-center gap-4">
                    <div className="size-14 rounded-2xl overflow-hidden bg-neutral-100 border border-black/[0.08] shrink-0">
                      {m.portrait_photo_url ? (
                        <img
                          src={
                            m.portrait_photo_url.startsWith("http://") ||
                              m.portrait_photo_url.startsWith("https://") ||
                              m.portrait_photo_url.startsWith("/")
                              ? m.portrait_photo_url
                              : `/api/media?key=${encodeURIComponent(m.portrait_photo_url)}`
                          }
                          alt={m.full_name}
                          className="size-full object-cover"
                        />
                      ) : (
                        <PortraitPlaceholder fullName={m.full_name} />
                      )}
                    </div>

                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base sm:text-lg font-heading font-medium text-[#181925] group-hover:text-primary transition-colors">
                          {m.full_name}
                        </h3>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-mono uppercase font-semibold ${m.status === "published"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                            }`}
                        >
                          {m.status}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {roleLabel}
                        </span>
                        {isOwner && !m.is_paid && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase font-semibold bg-neutral-100 text-[#666] border border-black/[0.08]">
                            Free Tier
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-[#71717a] font-mono">
                        <span>{yearSpan}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-auto shrink-0 flex-wrap sm:flex-nowrap">
                    {/* Draft links are intentionally not shareable. */}
                    {m.status === "published" && (
                      <button
                        type="button"
                        onClick={() => handleCopyLink(m.slug, m.id)}
                        className="size-8.5 rounded-full bg-[#f4f4f6] hover:bg-neutral-200 text-[#555] flex items-center justify-center transition-colors cursor-pointer"
                        title="Copy share link"
                      >
                        {copiedId === m.id ? (
                          <Check className="size-3.5 text-emerald-600" />
                        ) : (
                          <Share2 className="size-3.5" />
                        )}
                      </button>
                    )}

                    {/* View Live */}
                    <Link
                      href={`/${m.slug}`}
                      target="_blank"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f4f4f6] hover:bg-neutral-200 text-[#181925] text-xs font-medium transition-colors"
                    >
                      <span>{m.status === "published" ? "View live" : "Preview"}</span>
                      <ExternalLink className="size-3 text-[#888]" />
                    </Link>

                    {/* Upgrade to Pro CTA Button (for free memorials) */}
                    {isOwner && !m.is_paid && (
                      <button
                        type="button"
                        disabled={checkingOutId === m.id}
                        onClick={() => handleUpgrade(m.id)}
                        className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium transition-all cursor-pointer shadow-2xs disabled:opacity-50"
                      >
                        {checkingOutId === m.id ? (
                          <Loader2 className="size-3 animate-spin" />
                        ) : (
                          <Shield className="size-3" />
                        )}
                        <span>Upgrade ($179)</span>
                      </button>
                    )}

                    {/* Capability-specific primary action */}
                    <Link
                      href={canOpenStudio
                        ? `/dashboard/memorials/${m.id}/editor`
                        : `/${m.slug}/memories#share-memory`}
                      className="inline-flex items-center justify-center gap-1 whitespace-nowrap !rounded-full font-medium transition-all cursor-pointer border border-[color-mix(in_srgb,var(--primary)_80%,#3a3480)] bg-[color-mix(in_srgb,var(--primary)_90%,#3a3480)] text-primary-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.22),inset_0_-1px_0_rgba(58,52,128,0.30)] transform-gpu hover:bg-primary hover:border-[color-mix(in_srgb,var(--primary)_70%,#3a3480)] active:translate-y-px active:scale-[0.98] h-8 px-4 text-xs select-none"
                    >
                      <span>{canOpenStudio ? "Open Studio" : "Contribute"}</span>
                      <ArrowRight className="size-3" />
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </main>
      )}
    </div>
  )
}
