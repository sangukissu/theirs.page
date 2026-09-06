"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Check, Copy, ExternalLink, Globe2, Link2, Loader2, LockKeyhole, Share2, Sparkles, X } from "lucide-react"

type PublishPrivacy = "public" | "unlisted" | "private"

interface PublishMemorialDialogProps {
  isOpen: boolean
  memorialName: string
  slug: string
  status: "draft" | "published" | "archived"
  privacy: "public" | "unlisted" | "private"
  hasPortrait: boolean
  hasStory: boolean
  memoryCount: number
  onClose: () => void
  onPublish: (privacy: PublishPrivacy) => Promise<void>
  onUnpublish: () => Promise<void>
}

export function PublishMemorialDialog({
  isOpen,
  memorialName,
  slug,
  status,
  privacy,
  hasPortrait,
  hasStory,
  memoryCount,
  onClose,
  onPublish,
  onUnpublish,
}: PublishMemorialDialogProps) {
  const [selectedPrivacy, setSelectedPrivacy] = useState<PublishPrivacy>(privacy)
  const [phase, setPhase] = useState<"ready" | "publishing" | "live">(status === "published" ? "live" : "ready")
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [memorialUrl, setMemorialUrl] = useState(`https://theirs.page/${slug}`)

  useEffect(() => {
    if (!isOpen) return
    setSelectedPrivacy(privacy)
    setPhase(status === "published" ? "live" : "ready")
    setCopied(false)
    setError(null)
    setMemorialUrl(`${window.location.origin}/${slug}`)
  }, [isOpen, privacy, slug, status])

  const publish = async () => {
    setPhase("publishing")
    setError(null)
    try {
      await onPublish(selectedPrivacy)
      setPhase("live")
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The memorial could not be published.")
      setPhase("ready")
    }
  }

  const unpublish = async () => {
    setError(null)
    try {
      await onUnpublish()
      onClose()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The memorial could not be returned to draft.")
    }
  }

  const copyLink = async () => {
    await navigator.clipboard.writeText(memorialUrl)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2200)
  }

  const share = async () => {
    if (navigator.share) {
      await navigator.share({ title: `${memorialName} — Theirs`, url: memorialUrl }).catch(() => undefined)
    } else {
      await copyLink()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <motion.button
            type="button"
            aria-label="Close publish dialog"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#181925]/45 backdrop-blur-sm"
          />
          <motion.section
            role="dialog"
            aria-modal="true"
            aria-labelledby="publish-dialog-title"
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-xl overflow-hidden rounded-[2rem] border border-white/40 bg-[#fffefa] shadow-2xl"
          >
            <div className="h-1.5 bg-primary" />
            <button type="button" onClick={onClose} aria-label="Close" className="absolute right-5 top-5 flex size-8 items-center justify-center rounded-full bg-black/[0.05] text-[#666] transition-colors hover:bg-black/10">
              <X className="size-4" />
            </button>

            {phase === "live" ? (
              <div className="relative flex flex-col items-center px-6 py-10 text-center sm:px-10 sm:py-12">
                <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
                  {["left-[12%] top-16", "left-[22%] top-28", "right-[16%] top-20", "right-[25%] top-36"].map((position, index) => (
                    <motion.span key={position} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: [0, 1, 0.65], scale: 1, y: [8, -6] }} transition={{ delay: index * 0.08 }} className={`absolute ${position} size-2 rounded-full ${index % 2 ? "bg-amber-300" : "bg-primary/60"}`} />
                  ))}
                </div>
                <motion.div initial={{ scale: 0.7, rotate: -8 }} animate={{ scale: 1, rotate: 0 }} className="mb-5 flex size-16 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-600 shadow-sm">
                  <Check className="size-8" strokeWidth={2.2} />
                </motion.div>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">The page is live</p>
                <h2 id="publish-dialog-title" className="font-serif text-2xl font-medium tracking-tight text-[#181925] sm:text-3xl">You created a place for {memorialName}&apos;s life.</h2>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-[#666]">It is ready for family and friends to visit, remember, and add to over time.</p>
                <div className="mt-6 flex w-full items-center gap-2 rounded-2xl border border-black/[0.08] bg-white p-2 pl-4 text-left shadow-xs">
                  <span className="min-w-0 flex-1 truncate text-xs text-[#666]">{memorialUrl}</span>
                  <button type="button" onClick={copyLink} className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-[#f1f2f4] px-3 text-xs font-medium text-[#181925] hover:bg-neutral-200">
                    {copied ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>
                <div className="mt-4 flex w-full flex-col gap-2 sm:flex-row">
                  <button type="button" onClick={share} className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary/90 active:scale-[0.98]"><Share2 className="size-4" />Share memorial</button>
                  <a href={`/${slug}`} target="_blank" rel="noreferrer" className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full border border-black/[0.09] bg-white px-5 text-sm font-semibold text-[#181925] transition-colors hover:bg-neutral-50">Visit live page<ExternalLink className="size-4" /></a>
                </div>
                <button type="button" onClick={unpublish} className="mt-7 text-xs text-[#8a8c92] underline decoration-black/20 underline-offset-4 hover:text-[#181925]">Return this page to private draft</button>
                {error && <p className="mt-3 text-xs font-medium text-rose-700">{error}</p>}
              </div>
            ) : (
              <div className="px-6 py-8 sm:px-10 sm:py-10">
                <div className="mb-6 flex size-12 items-center justify-center rounded-2xl bg-primary/8 text-primary"><Sparkles className="size-5" /></div>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">Ready to share</p>
                <h2 id="publish-dialog-title" className="font-serif text-2xl font-medium tracking-tight text-[#181925] sm:text-3xl">Publish {memorialName}&apos;s memorial</h2>
                <p className="mt-3 text-sm leading-relaxed text-[#666]">This is the moment the private draft becomes a place others can visit. You can continue editing it after publishing.</p>

                <div className="mt-6 grid grid-cols-3 gap-2 rounded-2xl border border-black/[0.06] bg-white p-3">
                  {[{ label: "Portrait", done: hasPortrait }, { label: "Life story", done: hasStory }, { label: "Memories", done: memoryCount > 0 }].map((item) => (
                    <div key={item.label} className="flex flex-col items-center gap-1.5 rounded-xl bg-[#fafafb] px-2 py-3 text-center">
                      <span className={`flex size-5 items-center justify-center rounded-full ${item.done ? "bg-emerald-100 text-emerald-700" : "bg-neutral-200 text-neutral-500"}`}>{item.done ? <Check className="size-3" /> : "·"}</span>
                      <span className="text-[10px] font-medium text-[#666]">{item.label}</span>
                    </div>
                  ))}
                </div>

                <fieldset className="mt-6">
                  <legend className="mb-2 text-xs font-medium text-[#181925]">Who can find this page?</legend>
                  <div className={`grid gap-2 ${privacy === "private" ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
                    <button type="button" onClick={() => setSelectedPrivacy("unlisted")} className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition-all ${selectedPrivacy === "unlisted" ? "border-primary bg-primary/[0.04] ring-1 ring-primary/20" : "border-black/[0.08] bg-white hover:border-black/20"}`}>
                      <Link2 className="mt-0.5 size-4 shrink-0 text-primary" /><span><strong className="block text-xs text-[#181925]">Anyone with the link</strong><span className="mt-1 block text-[11px] leading-relaxed text-[#71717a]">A gentle first step. Search engines will not list it.</span></span>
                    </button>
                    <button type="button" onClick={() => setSelectedPrivacy("public")} className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition-all ${selectedPrivacy === "public" ? "border-primary bg-primary/[0.04] ring-1 ring-primary/20" : "border-black/[0.08] bg-white hover:border-black/20"}`}>
                      <Globe2 className="mt-0.5 size-4 shrink-0 text-primary" /><span><strong className="block text-xs text-[#181925]">Public and discoverable</strong><span className="mt-1 block text-[11px] leading-relaxed text-[#71717a]">Anyone can visit and search engines may list it.</span></span>
                    </button>
                    {privacy === "private" && (
                      <button type="button" onClick={() => setSelectedPrivacy("private")} className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition-all ${selectedPrivacy === "private" ? "border-primary bg-primary/[0.04] ring-1 ring-primary/20" : "border-black/[0.08] bg-white hover:border-black/20"}`}>
                        <LockKeyhole className="mt-0.5 size-4 shrink-0 text-primary" /><span><strong className="block text-xs text-[#181925]">Keep PIN protected</strong><span className="mt-1 block text-[11px] leading-relaxed text-[#71717a]">Visitors still need the existing family PIN.</span></span>
                      </button>
                    )}
                  </div>
                </fieldset>

                {error && <p className="mt-4 text-xs font-medium text-rose-700">{error}</p>}
                <div className="mt-7 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <button type="button" onClick={onClose} className="h-11 rounded-full px-5 text-sm font-medium text-[#666] hover:bg-black/[0.04]">Not yet</button>
                  <button type="button" onClick={publish} disabled={phase === "publishing"} className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-60">
                    {phase === "publishing" ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
                    {phase === "publishing" ? "Publishing..." : "Publish their page"}
                  </button>
                </div>
              </div>
            )}
          </motion.section>
        </div>
      )}
    </AnimatePresence>
  )
}
