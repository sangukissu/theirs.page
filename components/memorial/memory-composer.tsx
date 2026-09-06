"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { AlertCircle, CheckCircle2, Loader2, Send } from "lucide-react"
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile"
import { RichStoryEditor } from "@/components/editor/rich-story-editor"
import { useContributionDraft } from "@/hooks/use-contribution-draft"
import { saveLocalReceipt } from "@/lib/memorial/optimistic-receipts"
import { TEXT_LIMITS } from "@/lib/validation/text-limits"

interface MemoryComposerProps {
  memorialId?: string
  slug: string
  fullName: string
  onSubmitted?: () => void
}

export function MemoryComposer({ memorialId, slug, fullName, onSubmitted }: MemoryComposerProps) {
  const targetIdentifier = memorialId || slug
  const firstName = fullName.split(" ")[0] || fullName
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ""
  const turnstileRef = useRef<TurnstileInstance>(null)
  const restoredRef = useRef(false)
  const [authorName, setAuthorName] = useState("")
  const [relationship, setRelationship] = useState("")
  const [content, setContent] = useState("")
  const [year, setYear] = useState("")
  const [location, setLocation] = useState("")
  const [turnstileToken, setTurnstileToken] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const draftValue = useMemo(() => ({
    name: authorName,
    relationship,
    content,
    year,
    location,
  }), [authorName, relationship, content, year, location])
  const { restoredDraft, clearDraft } = useContributionDraft({
    memorialId: targetIdentifier,
    type: "memory",
    value: draftValue,
    enabled: !isSubmitted,
  })

  useEffect(() => {
    if (!restoredDraft || restoredRef.current) return
    restoredRef.current = true
    setAuthorName(restoredDraft.name || "")
    setRelationship(restoredDraft.relationship || "")
    setContent(restoredDraft.content || "")
    setYear(restoredDraft.year || "")
    setLocation(restoredDraft.location || "")
  }, [restoredDraft])

  const resetTurnstile = () => {
    setTurnstileToken("")
    turnstileRef.current?.reset()
  }
  const plainContent = content.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim()

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!authorName.trim() || !plainContent || !turnstileToken) return
    setIsSubmitting(true)
    setError(null)
    try {
      const response = await fetch(`/api/memorials/${targetIdentifier}/contribute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "memory",
          author_name: authorName.trim(),
          author_relationship: relationship.trim() || null,
          content,
          approx_year: year.trim() || null,
          location: location.trim() || null,
          tribute_type: "note",
          turnstile_token: turnstileToken,
        }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || "Your memory could not be shared.")

      if (data.item && data.receipt_token) {
        saveLocalReceipt(slug, {
          id: data.item.id,
          receipt_token: data.receipt_token,
          memorial_slug: slug,
          memorial_id: memorialId,
          author_name: data.item.author_name,
          author_relationship: data.item.author_relationship,
          story: data.item.story,
          approx_year: data.item.approx_year,
          location: data.item.location,
          photo_url: data.item.photo_url,
          photo_urls: data.item.photo_urls,
          tribute_type: data.item.tribute_type,
          contribution_type: data.item.contribution_type,
          status: data.item.status,
          created_at: data.item.created_at || new Date().toISOString(),
        })
      }
      clearDraft()
      setIsSubmitted(true)
      setAuthorName("")
      setRelationship("")
      setContent("")
      setYear("")
      setLocation("")
      onSubmitted?.()
    } catch (reason) {
      resetTurnstile()
      setError(reason instanceof Error ? reason.message : "Your memory could not be shared.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div id="share-memory" className="scroll-mt-28 rounded-3xl border border-emerald-200 bg-emerald-50/70 p-8 text-center">
        <CheckCircle2 className="mx-auto mb-3 size-8 text-emerald-600" />
        <h3 className="font-serif text-xl text-[#181925]">Your memory was sent to {firstName}&apos;s family.</h3>
        <p className="mt-1 text-sm text-[#666]">A caretaker will review it before it appears publicly.</p>
      </div>
    )
  }

  return (
    <form id="share-memory" onSubmit={handleSubmit} className="scroll-mt-28 rounded-3xl border border-black/[0.08] bg-[#faf9f7] p-4 sm:p-6">
      <div className="mb-5">
        <h3 className="font-serif text-xl text-[#181925] sm:text-2xl">Share a memory</h3>
        <p className="mt-1 text-sm leading-6 text-[#666]">Tell the story in your own words. A draft stays on this device for seven days.</p>
      </div>
      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        <label className="text-sm font-medium text-[#333]">Your name
          <input required maxLength={TEXT_LIMITS.contributorName} value={authorName} onChange={(e) => setAuthorName(e.target.value)} className="mt-1.5 w-full rounded-xl border border-black/[0.1] bg-white px-3 py-2.5 text-base font-normal outline-none focus:border-primary/50" />
        </label>
        <label className="text-sm font-medium text-[#333]">Relationship to {firstName}
          <input maxLength={TEXT_LIMITS.relationship} value={relationship} onChange={(e) => setRelationship(e.target.value)} className="mt-1.5 w-full rounded-xl border border-black/[0.1] bg-white px-3 py-2.5 text-base font-normal outline-none focus:border-primary/50" />
        </label>
        <label className="text-sm font-medium text-[#333]">Approximate year
          <input inputMode="numeric" maxLength={4} placeholder="e.g. 1998" value={year} onChange={(e) => setYear(e.target.value.replace(/\D/g, "").slice(0, 4))} className="mt-1.5 w-full rounded-xl border border-black/[0.1] bg-white px-3 py-2.5 text-base font-normal outline-none focus:border-primary/50" />
        </label>
        <label className="text-sm font-medium text-[#333]">Location
          <input maxLength={TEXT_LIMITS.location} value={location} onChange={(e) => setLocation(e.target.value)} className="mt-1.5 w-full rounded-xl border border-black/[0.1] bg-white px-3 py-2.5 text-base font-normal outline-none focus:border-primary/50" />
        </label>
      </div>
      <RichStoryEditor value={content} onChange={setContent} maxPlainTextLength={TEXT_LIMITS.memory} placeholder={`I remember when ${firstName}…`} />
      {error && <p role="alert" className="mt-3 flex items-center gap-2 text-sm text-rose-700"><AlertCircle className="size-4" />{error}</p>}
      <div className="mt-4 flex flex-col items-center justify-between gap-4 sm:flex-row">
        {siteKey ? (
          <Turnstile ref={turnstileRef} siteKey={siteKey} options={{ appearance: "interaction-only", refreshExpired: "auto", action: "contribution" }} onSuccess={setTurnstileToken} onExpire={resetTurnstile} onError={() => setTurnstileToken("")} />
        ) : (
          <p className="text-sm text-amber-800">Contributions are temporarily unavailable while the security check is configured.</p>
        )}
        <button type="submit" disabled={isSubmitting || !siteKey || !turnstileToken || !authorName.trim() || !plainContent} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50">
          {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
          {isSubmitting ? "Sending…" : "Share memory"}
        </button>
      </div>
    </form>
  )
}
