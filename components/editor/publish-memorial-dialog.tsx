"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import {
  Check,
  Copy,
  ExternalLink,
  Globe2,
  Link2,
  Loader2,
  LockKeyhole,
  MessageSquare,
  Share2,
  Sparkles,
  X,
} from "lucide-react"

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

export function buildMemorialShareMessage(memorialName: string, url: string): string {
  return `Remembering ${memorialName}. We've gathered stories, photographs, and memories in their honor. Please visit to remember them with us or share a memory: ${url}`
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
  const [phase, setPhase] = useState<"ready" | "publishing" | "live">(
    status === "published" ? "live" : "ready"
  )
  const [copiedLink, setCopiedLink] = useState(false)
  const [copiedInvite, setCopiedInvite] = useState(false)
  const [isUnpublishing, setIsUnpublishing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [memorialUrl, setMemorialUrl] = useState(`https://theirs.page/${slug}`)

  useEffect(() => {
    if (!isOpen) return
    setSelectedPrivacy(privacy)
    setPhase(status === "published" ? "live" : "ready")
    setCopiedLink(false)
    setCopiedInvite(false)
    setIsUnpublishing(false)
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
    setIsUnpublishing(true)
    setError(null)
    try {
      await onUnpublish()
      onClose()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The memorial could not be un-published.")
    } finally {
      setIsUnpublishing(false)
    }
  }

  const shareMessage = buildMemorialShareMessage(memorialName, memorialUrl)

  const copyLink = async () => {
    await navigator.clipboard.writeText(memorialUrl)
    setCopiedLink(true)
    window.setTimeout(() => setCopiedLink(false), 2200)
  }

  const copyInviteMessage = async () => {
    await navigator.clipboard.writeText(shareMessage)
    setCopiedInvite(true)
    window.setTimeout(() => setCopiedInvite(false), 2200)
  }

  const share = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      await navigator
        .share({
          title: `${memorialName} — Theirs`,
          text: shareMessage,
          url: memorialUrl,
        })
        .catch(() => undefined)
    } else {
      await copyLink()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 sm:p-6 select-none">
          {/* Backdrop */}
          <motion.button
            type="button"
            aria-label="Close publish dialog"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#181925]/50 backdrop-blur-xs cursor-default"
          />

          {/* Dialog Container */}
          <motion.section
            role="dialog"
            aria-modal="true"
            aria-labelledby="publish-dialog-title"
            initial={{ opacity: 0, scale: 0.97, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-lg max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-3xl border border-black/[0.08] bg-white shadow-2xl p-6 sm:p-8 flex flex-col z-10"
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close dialog"
              className="absolute right-4 top-4 sm:right-5 sm:top-5 flex size-8 items-center justify-center rounded-full text-[#71717a] hover:text-[#181925] hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              <X className="size-4" />
            </button>

            {phase === "live" ? (
              /* LIVE & SHARE STATE */
              <div className="flex flex-col">
                <div className="flex items-center gap-3 mb-2">
                  <div className="size-10 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200/80 flex items-center justify-center shrink-0">
                    <Check className="size-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-mono uppercase font-semibold text-emerald-700">
                      Memorial Live
                    </span>
                    <h2
                      id="publish-dialog-title"
                      className="font-serif text-xl sm:text-2xl font-medium tracking-tight text-[#181925]"
                    >
                      A place for {memorialName}&apos;s life is live
                    </h2>
                  </div>
                </div>

                <p className="mt-1.5 text-xs sm:text-sm text-[#71717a] leading-relaxed">
                  Family and friends can now visit, read memories, and contribute stories and photographs.
                </p>

                {/* Link Pill Container */}
                <div className="mt-5 flex items-center gap-2 rounded-2xl border border-black/[0.07] bg-[#fafafb] p-1.5 pl-3.5">
                  <span className="min-w-0 flex-1 truncate text-xs font-mono text-[#555]">
                    {memorialUrl}
                  </span>
                  <button
                    type="button"
                    onClick={copyLink}
                    className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full bg-white border border-black/[0.08] px-3 text-xs font-medium text-[#181925] hover:bg-neutral-50 active:scale-95 transition-all cursor-pointer shadow-2xs"
                  >
                    {copiedLink ? (
                      <Check className="size-3 text-emerald-600" />
                    ) : (
                      <Copy className="size-3 text-[#666]" />
                    )}
                    <span>{copiedLink ? "Copied" : "Copy link"}</span>
                  </button>
                </div>



                {/* Primary Action Buttons */}
                <div className="mt-5 flex flex-col sm:flex-row gap-2.5 w-full">
                  <button
                    type="button"
                    onClick={share}
                    className="flex w-full sm:flex-1 h-11 min-h-[44px] sm:h-10 sm:min-h-[40px] shrink-0 items-center justify-center gap-2 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs sm:text-xs font-medium transition-all active:scale-[0.98] cursor-pointer shadow-xs px-4"
                  >
                    <Share2 className="size-3.5 shrink-0" />
                    <span>Share memorial</span>
                  </button>
                  <a
                    href={`/${slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex w-full sm:flex-1 h-11 min-h-[44px] sm:h-10 sm:min-h-[40px] shrink-0 items-center justify-center gap-2 rounded-full border border-black/[0.09] bg-white hover:bg-neutral-50 text-xs sm:text-xs font-medium text-[#181925] transition-all cursor-pointer px-4"
                  >
                    <span>Visit live page</span>
                    <ExternalLink className="size-3 shrink-0 text-[#71717a]" />
                  </a>
                </div>

                {/* Clear Unpublish Section */}
                <div className="mt-6 pt-5 border-t border-black/[0.06] flex flex-col items-center gap-1 text-center">
                  <button
                    type="button"
                    onClick={unpublish}
                    disabled={isUnpublishing}
                    className="text-xs font-medium text-[#71717a] hover:text-rose-700 transition-colors cursor-pointer underline underline-offset-4 decoration-black/15 hover:decoration-rose-300"
                  >
                    {isUnpublishing
                      ? "Unpublishing..."
                      : "Unpublish memorial (Return to private draft)"}
                  </button>
                  <p className="text-[11px] text-[#8e9096] max-w-sm leading-relaxed">
                    Hides this page from visitors and search engines. All stories, photos, and tributes remain safely preserved.
                  </p>
                </div>

                {error && <p className="mt-3 text-xs font-medium text-rose-700 text-center">{error}</p>}
              </div>
            ) : (
              /* READY TO PUBLISH STATE */
              <div className="flex flex-col">
                <div className="flex items-center gap-3 mb-2">
                  <div className="size-10 rounded-2xl bg-primary/8 text-primary border border-primary/20 flex items-center justify-center shrink-0">
                    <Sparkles className="size-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-mono uppercase font-semibold text-primary">
                      Ready to Publish
                    </span>
                    <h2
                      id="publish-dialog-title"
                      className="font-serif text-xl sm:text-2xl font-medium tracking-tight text-[#181925]"
                    >
                      Publish {memorialName}&apos;s memorial
                    </h2>
                  </div>
                </div>

                <p className="mt-1 text-xs sm:text-sm leading-relaxed text-[#71717a]">
                  This makes the private draft accessible to family and friends. You can continue editing and adding to it anytime.
                </p>

                {/* Completeness Indicators */}
                <div className="mt-4 grid grid-cols-3 gap-2 rounded-2xl border border-black/[0.06] bg-[#fafafb] p-2.5">
                  {[
                    { label: "Portrait", done: hasPortrait },
                    { label: "Life story", done: hasStory },
                    { label: "Memories", done: memoryCount > 0 },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex flex-col items-center gap-1 rounded-xl bg-white p-2.5 text-center border border-black/[0.04]"
                    >
                      <span
                        className={`flex size-5 items-center justify-center rounded-full text-xs ${item.done
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-neutral-100 text-neutral-400"
                          }`}
                      >
                        {item.done ? <Check className="size-3" /> : "·"}
                      </span>
                      <span className="text-[10px] font-medium text-[#555]">{item.label}</span>
                    </div>
                  ))}
                </div>

                {/* Privacy Options */}
                <fieldset className="mt-5">
                  <legend className="mb-2 text-xs font-medium text-[#181925]">
                    Who can find this page?
                  </legend>
                  <div
                    className={`grid gap-2 ${privacy === "private" ? "sm:grid-cols-3" : "sm:grid-cols-2"
                      }`}
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedPrivacy("unlisted")}
                      className={`flex items-start gap-2.5 rounded-2xl border p-3.5 text-left transition-all cursor-pointer ${selectedPrivacy === "unlisted"
                        ? "border-primary bg-primary/[0.04] ring-1 ring-primary/20"
                        : "border-black/[0.08] bg-white hover:border-black/20"
                        }`}
                    >
                      <Link2 className="mt-0.5 size-4 shrink-0 text-primary" />
                      <div>
                        <strong className="block text-xs text-[#181925]">Anyone with link</strong>
                        <span className="mt-0.5 block text-[11px] leading-relaxed text-[#71717a]">
                          Search engines will not index it.
                        </span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedPrivacy("public")}
                      className={`flex items-start gap-2.5 rounded-2xl border p-3.5 text-left transition-all cursor-pointer ${selectedPrivacy === "public"
                        ? "border-primary bg-primary/[0.04] ring-1 ring-primary/20"
                        : "border-black/[0.08] bg-white hover:border-black/20"
                        }`}
                    >
                      <Globe2 className="mt-0.5 size-4 shrink-0 text-primary" />
                      <div>
                        <strong className="block text-xs text-[#181925]">Public & searchable</strong>
                        <span className="mt-0.5 block text-[11px] leading-relaxed text-[#71717a]">
                          Search engines may index it.
                        </span>
                      </div>
                    </button>

                    {privacy === "private" && (
                      <button
                        type="button"
                        onClick={() => setSelectedPrivacy("private")}
                        className={`flex items-start gap-2.5 rounded-2xl border p-3.5 text-left transition-all cursor-pointer ${selectedPrivacy === "private"
                          ? "border-primary bg-primary/[0.04] ring-1 ring-primary/20"
                          : "border-black/[0.08] bg-white hover:border-black/20"
                          }`}
                      >
                        <LockKeyhole className="mt-0.5 size-4 shrink-0 text-primary" />
                        <div>
                          <strong className="block text-xs text-[#181925]">PIN protected</strong>
                          <span className="mt-0.5 block text-[11px] leading-relaxed text-[#71717a]">
                            Requires the family PIN.
                          </span>
                        </div>
                      </button>
                    )}
                  </div>
                </fieldset>

                {error && <p className="mt-3 text-xs font-medium text-rose-700">{error}</p>}

                {/* Footer Buttons */}
                <div className="mt-6 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2 w-full">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex w-full sm:w-auto h-11 sm:h-10 min-h-[44px] sm:min-h-[40px] shrink-0 items-center justify-center rounded-full px-5 text-xs font-medium text-[#666] hover:bg-black/[0.04] transition-colors cursor-pointer"
                  >
                    Keep editing
                  </button>
                  <button
                    type="button"
                    onClick={publish}
                    disabled={phase === "publishing"}
                    className="flex w-full sm:w-auto h-11 sm:h-10 min-h-[44px] sm:min-h-[40px] shrink-0 items-center justify-center gap-2 rounded-full bg-primary px-6 text-xs font-semibold text-white shadow-xs transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-60 cursor-pointer"
                  >
                    {phase === "publishing" ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="size-3.5" />
                    )}
                    <span>{phase === "publishing" ? "Publishing..." : "Publish memorial"}</span>
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
