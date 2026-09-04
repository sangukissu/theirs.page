"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Plus,
  ArrowRight,
  ExternalLink,
  Sparkles,
  Heart,
  Image as ImageIcon,
  Clock,
  Settings,
  Share2,
  Check,
  Globe,
  Lock,
  AlertCircle,
  CheckCircle2,
} from "lucide-react"

interface MemorialSummary {
  id: string
  slug: string
  full_name: string
  preferred_name?: string | null
  birth_year?: number | null
  death_year?: number | null
  headline?: string | null
  portrait_photo_url?: string | null
  status: "draft" | "published" | "archived"
  privacy: "public" | "unlisted" | "private"
  is_paid: boolean
  created_at: string
}

interface TheirsDashboardClientProps {
  userEmail: string
  userId: string
  initialMemorials: MemorialSummary[]
}

interface SlugCheckResult {
  checking: boolean
  available: boolean | null
  message: string | null
  suggestions: string[]
}

export function TheirsDashboardClient({
  userEmail,
  userId,
  initialMemorials,
}: TheirsDashboardClientProps) {
  const router = useRouter()
  const [memorials, setMemorials] = useState<MemorialSummary[]>(initialMemorials)
  const [isCreating, setIsCreating] = useState(false)
  const [fullNameInput, setFullNameInput] = useState("")
  const [slugInput, setSlugInput] = useState("")
  const [slugCheck, setSlugCheck] = useState<SlugCheckResult>({
    checking: false,
    available: null,
    message: null,
    suggestions: [],
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const checkDebounceRef = useRef<NodeJS.Timeout | null>(null)

  // Live availability check
  const checkSlugAvailability = (slug: string, name: string) => {
    if (!slug || slug.length < 3) {
      setSlugCheck({ checking: false, available: null, message: null, suggestions: [] })
      return
    }

    setSlugCheck((prev) => ({ ...prev, checking: true }))

    if (checkDebounceRef.current) clearTimeout(checkDebounceRef.current)
    checkDebounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/memorials/check-slug?slug=${encodeURIComponent(slug)}&fullName=${encodeURIComponent(name)}`
        )
        const data = await res.json()
        setSlugCheck({
          checking: false,
          available: data.available,
          message: data.message,
          suggestions: data.suggestions || [],
        })
      } catch (err) {
        setSlugCheck({ checking: false, available: null, message: null, suggestions: [] })
      }
    }, 300)
  }

  // Auto-generate slug when name changes
  const handleNameChange = (val: string) => {
    setFullNameInput(val)
    const generated = val
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 50)

    setSlugInput(generated)
    checkSlugAvailability(generated, val)
  }

  const handleSlugInputChange = (val: string) => {
    const cleaned = val
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "")
      .replace(/-{2,}/g, "-")
    setSlugInput(cleaned)
    checkSlugAvailability(cleaned, fullNameInput)
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullNameInput.trim()) return

    setIsSubmitting(true)
    setErrorMsg(null)

    try {
      const res = await fetch("/api/memorials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullNameInput.trim(),
          desired_slug: slugInput.trim(),
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Failed to create memorial")
      }

      // Route immediately into the low-friction Memorial Editor
      router.push(`/dashboard/memorials/${data.memorial.id}/editor`)
    } catch (err: any) {
      setErrorMsg(err.message)
      setIsSubmitting(false)
    }
  }

  const handleCopyLink = (slug: string, id: string) => {
    const url = `${window.location.origin}/${slug}`
    navigator.clipboard.writeText(url)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="flex-1 w-full flex flex-col">

      {/* Main Container */}
      <main className="max-w-4xl w-full mx-auto px-4 sm:px-6 py-10 sm:py-14 flex-1 flex flex-col gap-10">
        
        {/* Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-[#181925]">
              Your Memorials
            </h1>
            <p className="text-xs sm:text-sm text-[#71717a]">
              Quiet, dedicated places on the internet honoring the people you love.
            </p>
          </div>

          {memorials.length > 0 && !isCreating && (
            <button
              type="button"
              onClick={() => setIsCreating(true)}
              className="inline-flex items-center gap-1.5 whitespace-nowrap !rounded-full font-medium transition-all cursor-pointer border border-[color-mix(in_srgb,var(--primary)_80%,#3a3480)] bg-[color-mix(in_srgb,var(--primary)_90%,#3a3480)] text-primary-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.22),inset_0_-1px_0_rgba(58,52,128,0.30)] transform-gpu hover:bg-primary hover:border-[color-mix(in_srgb,var(--primary)_70%,#3a3480)] active:translate-y-px active:scale-[0.98] h-8.5 px-4 text-xs select-none self-start sm:self-auto"
            >
              <Plus className="size-3.5" />
              <span>Create memorial</span>
            </button>
          )}
        </div>

        {/* 1. CREATION CARD (When creating or 0 memorials) */}
        {(memorials.length === 0 || isCreating) && (
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-black/[0.08] shadow-xs flex flex-col gap-6">
            <div className="flex flex-col gap-1 border-b border-black/[0.05] pb-4">
              <span className="text-xs font-mono font-medium text-primary uppercase tracking-wider">
                New Memorial
              </span>
              <h2 className="text-lg sm:text-xl font-medium text-[#181925]">
                Who are we remembering?
              </h2>
              <p className="text-xs text-[#71717a]">
                Enter their name to begin. You can add their story, photos, voice notes, and timeline at your own pace.
              </p>
            </div>

            <form onSubmit={handleCreate} className="flex flex-col gap-5">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
                  {errorMsg}
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-[#181925]">
                  Full Name of the Person *
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={fullNameInput}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Robert Edward Carter"
                  className="px-4 py-2.5 rounded-xl bg-[#fafafb] border border-black/[0.08] text-sm text-[#181925] placeholder:text-[#aaa] outline-none focus:border-primary/60 transition-colors"
                />
              </div>

              {/* Web Address (Slug) with Live Collision Checking & Suggestions */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-[#181925]">
                  Their Web Address (Slug)
                </label>
                <div className="flex items-center px-4 py-2.5 rounded-xl bg-[#fafafb] border border-black/[0.08] text-xs text-[#888] font-mono">
                  <span>theirs.page/</span>
                  <input
                    type="text"
                    required
                    value={slugInput}
                    onChange={(e) => handleSlugInputChange(e.target.value)}
                    placeholder="robert-carter"
                    className="flex-1 bg-transparent text-xs text-[#181925] font-mono outline-none ml-0.5"
                  />
                  {slugCheck.checking && (
                    <span className="text-[10px] text-[#888] font-sans">Checking...</span>
                  )}
                  {!slugCheck.checking && slugCheck.available === true && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-sans font-medium">
                      <CheckCircle2 className="size-3.5" />
                      <span>Available</span>
                    </span>
                  )}
                  {!slugCheck.checking && slugCheck.available === false && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-amber-600 font-sans font-medium">
                      <AlertCircle className="size-3.5" />
                      <span>Taken</span>
                    </span>
                  )}
                </div>

                {/* Suggestions Pills if Collision */}
                {slugCheck.available === false && slugCheck.suggestions.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    <span className="text-[11px] text-[#71717a]">Suggested available addresses:</span>
                    {slugCheck.suggestions.map((sug) => (
                      <button
                        key={sug}
                        type="button"
                        onClick={() => {
                          setSlugInput(sug)
                          checkSlugAvailability(sug, fullNameInput)
                        }}
                        className="px-2.5 py-0.5 rounded-full bg-primary/10 hover:bg-primary/20 text-primary text-[11px] font-mono font-medium transition-colors cursor-pointer"
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                )}

                <span className="text-[11px] text-[#888]">
                  This is the permanent link you will share with family and friends.
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                {memorials.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="px-4 py-2 rounded-full text-xs font-medium text-[#666] hover:text-[#181925] hover:bg-neutral-100 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting || !fullNameInput.trim() || slugCheck.available === false}
                  className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap !rounded-full font-medium transition-all cursor-pointer border border-[color-mix(in_srgb,var(--primary)_80%,#3a3480)] bg-[color-mix(in_srgb,var(--primary)_90%,#3a3480)] text-primary-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.22),inset_0_-1px_0_rgba(58,52,128,0.30)] transform-gpu hover:bg-primary hover:border-[color-mix(in_srgb,var(--primary)_70%,#3a3480)] active:translate-y-px active:scale-[0.98] h-9 px-5 text-xs select-none disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Creating...</span>
                  ) : (
                    <>
                      <span>Start their page</span>
                      <ArrowRight className="size-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 2. EXISTING MEMORIALS LIST */}
        {memorials.length > 0 && (
          <div className="flex flex-col gap-4">
            {memorials.map((m) => {
              const yearSpan = m.birth_year && m.death_year ? `${m.birth_year} — ${m.death_year}` : "Memorial"

              return (
                <div
                  key={m.id}
                  className="p-6 rounded-3xl bg-white border border-black/[0.07] hover:border-black/[0.14] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-2xs group"
                >
                  {/* Left: Avatar & Identity */}
                  <div className="flex items-center gap-4">
                    <div className="size-14 rounded-2xl overflow-hidden bg-neutral-100 border border-black/[0.08] shrink-0">
                      <img
                        src={m.portrait_photo_url || "/memorial-family-portrait-grandfather.jpg"}
                        alt={m.full_name}
                        className="size-full object-cover grayscale contrast-105"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base sm:text-lg font-serif font-medium text-[#181925] group-hover:text-primary transition-colors">
                          {m.full_name}
                        </h3>
                        {m.preferred_name && (
                          <span className="text-xs text-[#888]">“{m.preferred_name}”</span>
                        )}
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-mono uppercase font-semibold ${
                            m.status === "published"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}
                        >
                          {m.status}
                        </span>
                        {m.is_paid && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                            Complete
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-[#71717a] font-mono">
                        <span>{yearSpan}</span>
                        <span>·</span>
                        <span className="hover:underline text-primary">theirs.page/{m.slug}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                    {/* Share Button */}
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

                    {/* View Live */}
                    <Link
                      href={`/${m.slug}`}
                      target="_blank"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f4f4f6] hover:bg-neutral-200 text-[#181925] text-xs font-medium transition-colors"
                    >
                      <span>View live</span>
                      <ExternalLink className="size-3 text-[#888]" />
                    </Link>

                    {/* Open Editor */}
                    <Link
                      href={`/dashboard/memorials/${m.id}/editor`}
                      className="inline-flex items-center justify-center gap-1 whitespace-nowrap !rounded-full font-medium transition-all cursor-pointer border border-[color-mix(in_srgb,var(--primary)_80%,#3a3480)] bg-[color-mix(in_srgb,var(--primary)_90%,#3a3480)] text-primary-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.22),inset_0_-1px_0_rgba(58,52,128,0.30)] transform-gpu hover:bg-primary hover:border-[color-mix(in_srgb,var(--primary)_70%,#3a3480)] active:translate-y-px active:scale-[0.98] h-8 px-4 text-xs select-none"
                    >
                      <span>Edit memorial</span>
                      <ArrowRight className="size-3" />
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}

      </main>
    </div>
  )
}
