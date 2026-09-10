"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import {
  Check,
  Copy,
  Download,
  Share2,
  X,
  QrCode,
  Loader2,
  Image as ImageIcon,
} from "lucide-react"
import { TheirsLogo } from "@/components/theirs/theirs-logo"
import { PortraitPlaceholder } from "./portrait-placeholder"
import { MEMORIAL_THEMES, type MemorialThemeId } from "@/lib/memorial/themes"
import {
  generateThemedQrDataUrl,
  generateKeepsakeCardDataUrl,
} from "@/lib/memorial/memorial-qr"
import { track } from "@/lib/analytics"

interface MemorialShareModalProps {
  isOpen: boolean
  onClose: () => void
  fullName: string
  slug: string
  portraitUrl?: string | null
  birthYear?: number | string | null
  deathYear?: number | string | null
  themeId?: MemorialThemeId
}

export function MemorialShareModal({
  isOpen,
  onClose,
  fullName,
  slug,
  portraitUrl,
  birthYear,
  deathYear,
  themeId = "quiet",
}: MemorialShareModalProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [isDownloadingCard, setIsDownloadingCard] = useState(false)
  const [isDownloadingQrOnly, setIsDownloadingQrOnly] = useState(false)
  const [canShare, setCanShare] = useState(false)

  const firstName = fullName.trim().split(/\s+/)[0] || fullName
  const yearsSpan =
    birthYear && deathYear
      ? `${birthYear} \u2014 ${deathYear}`
      : birthYear
        ? `Born ${birthYear}`
        : deathYear
          ? `\u2014 ${deathYear}`
          : "In Loving Memory"

  const themeDef = MEMORIAL_THEMES[themeId] || MEMORIAL_THEMES.quiet

  const canonicalUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/${slug}`
      : `https://theirs.page/${slug}`

  const resolvedPortraitUrl = (() => {
    if (!portraitUrl) return null
    if (
      portraitUrl.startsWith("blob:") ||
      portraitUrl.startsWith("data:") ||
      portraitUrl.startsWith("http://") ||
      portraitUrl.startsWith("https://") ||
      portraitUrl.startsWith("/")
    ) {
      return portraitUrl
    }
    return `/api/media?key=${encodeURIComponent(portraitUrl)}`
  })()

  // Detect native share capability
  useEffect(() => {
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      setCanShare(true)
    }
  }, [])

  // Generate QR code data URL (with theme color + center avatar) whenever modal opens
  useEffect(() => {
    let isMounted = true
    if (!isOpen) return

    generateThemedQrDataUrl(
      {
        url: canonicalUrl,
        fullName,
        slug,
        portraitUrl,
        birthYear,
        deathYear,
        themeId,
      },
      540
    )
      .then((url) => {
        if (isMounted) setQrDataUrl(url)
      })
      .catch((err) => {
        console.error("Failed to generate memorial QR code:", err)
      })

    return () => {
      isMounted = false
    }
  }, [canonicalUrl, fullName, slug, portraitUrl, birthYear, deathYear, themeId, isOpen])

  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose])

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(canonicalUrl)
      track("memorial_shared", { channel: "copy_link", source: "memorial_modal" })
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy memorial link:", err)
    }
  }

  const handleNativeShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `${fullName} — Theirs`,
          text: `Remembering ${firstName}. We've gathered stories, photographs, and memories in their honor. Please visit to remember them with us or share a memory:`,
          url: canonicalUrl,
        })
        track("memorial_shared", { channel: "native_share", source: "memorial_modal" })
      } catch (err) {
        // User cancelled or aborted
      }
    }
  }

  // 1-Click Instant Download: Complete Keepsake Plaque / Card (PNG)
  const handleDownloadCard = async () => {
    try {
      setIsDownloadingCard(true)
      track("memorial_shared", { channel: "qr_card_download", source: "memorial_modal" })
      const cardDataUrl = await generateKeepsakeCardDataUrl({
        url: canonicalUrl,
        fullName,
        slug,
        birthYear,
        deathYear,
        portraitUrl,
        themeId,
      })

      const downloadLink = document.createElement("a")
      downloadLink.href = cardDataUrl
      downloadLink.download = `${slug}-memorial-keepsake-card.png`
      document.body.appendChild(downloadLink)
      downloadLink.click()
      document.body.removeChild(downloadLink)
    } catch (err) {
      console.error("Failed to download memorial card:", err)
    } finally {
      setIsDownloadingCard(false)
    }
  }

  // Download raw QR code square only (with theme color & center avatar)
  const handleDownloadQrOnly = async () => {
    try {
      setIsDownloadingQrOnly(true)
      track("memorial_shared", { channel: "qr_only", source: "memorial_modal" })
      const qrOnlyUrl = await generateThemedQrDataUrl(
        {
          url: canonicalUrl,
          fullName,
          slug,
          portraitUrl,
          birthYear,
          deathYear,
          themeId,
        },
        1024
      )

      const downloadLink = document.createElement("a")
      downloadLink.href = qrOnlyUrl
      downloadLink.download = `${slug}-qr-code.png`
      document.body.appendChild(downloadLink)
      downloadLink.click()
      document.body.removeChild(downloadLink)
    } catch (err) {
      console.error("Failed to download QR image:", err)
    } finally {
      setIsDownloadingQrOnly(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ type: "spring", duration: 0.35, bounce: 0.1 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="share-modal-title"
            className="relative w-full max-w-md rounded-3xl bg-[#ffffff] shadow-2xl border border-black/[0.08] overflow-hidden z-10 flex flex-col my-auto"
          >
            {/* Header bar */}
            <div className="flex items-center justify-between px-5 pt-4 pb-2.5 sm:px-6 sm:pt-5 sm:pb-3">
              <div className="flex items-center gap-2">
                <TheirsLogo themeAware className="size-4 text-[var(--theme-accent,#305dde)] shrink-0" />
                <span className="text-xs font-medium tracking-tight text-neutral-500 uppercase">
                  Memorial Keepsake & QR
                </span>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="size-8 rounded-full flex items-center justify-center text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
                aria-label="Close dialog"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Content Body */}
            <div className="px-5 pb-5 sm:px-6 sm:pb-6 flex flex-col items-center">
              {/* Keepsake Visual Card (Theme Styled) */}
              <div
                style={{
                  backgroundColor: themeDef.colors.bgSurface,
                  borderColor: themeDef.colors.border,
                }}
                className="w-full rounded-2xl border p-4 sm:p-5 flex flex-col items-center text-center shadow-xs transition-colors duration-200 relative overflow-hidden"
              >
                {/* Person Portrait / Monogram Header */}
                <div
                  style={{ borderColor: themeDef.colors.accent }}
                  className="size-15 sm:size-17 rounded-full overflow-hidden border-2 shadow-sm mb-2.5 bg-white shrink-0 relative"
                >
                  {resolvedPortraitUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={resolvedPortraitUrl}
                      alt={fullName}
                      className="size-full object-cover object-top"
                    />
                  ) : (
                    <PortraitPlaceholder fullName={fullName} />
                  )}
                </div>

                {/* Name & Lifespan */}
                <h3
                  style={{ color: themeDef.colors.textPrimary }}
                  id="share-modal-title"
                  className="font-serif text-lg sm:text-xl font-medium tracking-tight leading-snug line-clamp-1"
                >
                  {fullName}
                </h3>
                <p
                  style={{ color: themeDef.colors.textMuted }}
                  className="text-xs font-mono mt-1.5 sm:mt-2"
                >
                  {yearsSpan}
                </p>

                {/* Themed QR Code Plate with Center Photo Badge */}
                <div className="mt-3.5 p-3 bg-white rounded-2xl border border-black/[0.06] shadow-sm flex flex-col items-center">
                  <div className="size-44 sm:size-48 flex items-center justify-center relative">
                    {qrDataUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={qrDataUrl}
                        alt={`Theme-colored QR code for ${fullName}'s memorial`}
                        className="size-full object-contain rounded-lg"
                      />
                    ) : (
                      <Loader2 className="size-6 animate-spin text-neutral-400" />
                    )}
                  </div>
                </div>

                {/* Scan Caption */}
                <p
                  style={{ color: themeDef.colors.textMuted }}
                  className="text-[11px] leading-relaxed mt-2.5 max-w-[280px]"
                >
                  Scan with any phone camera to visit & share memories at{" "}
                  <strong
                    style={{ color: themeDef.colors.textPrimary }}
                    className="font-semibold"
                  >
                    theirs.page/{slug}
                  </strong>
                </p>

                {/* Bottom Card Branding (No tagline, logo in theme color, theirs in black, .page in theme color) */}
                <div
                  style={{ borderColor: themeDef.colors.border }}
                  className="mt-3 pt-2.5 border-t w-full flex items-center justify-center gap-1.5 select-none"
                >
                  <TheirsLogo themeAware className="size-3.5 text-[var(--theme-accent,#305dde)] shrink-0" />
                  <span className="text-xs font-semibold tracking-tight text-[#181925]">
                    theirs<span style={{ color: themeDef.colors.accent }}>.page</span>
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 w-full flex flex-col gap-2">
                <div className="flex items-center gap-2 w-full">
                  {/* Primary Download: Complete Keepsake Card (PNG) */}
                  <button
                    type="button"
                    onClick={handleDownloadQrOnly}
                    disabled={isDownloadingQrOnly || !qrDataUrl}
                    title="Download isolated QR image square"
                    className="h-10 px-3 rounded-full border border-black/[0.09] bg-neutral-50 hover:bg-neutral-100 text-neutral-800 text-xs font-medium flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50 shrink-0"
                  >
                    {isDownloadingQrOnly ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <QrCode className="size-3.5 text-neutral-600 shrink-0" />
                    )}
                    <span className="">QR Only</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadCard}
                    disabled={isDownloadingCard || !qrDataUrl}
                    style={{
                      backgroundColor: themeDef.colors.accent,
                      color: themeDef.colors.accentForeground,
                    }}
                    className="w-full h-11 rounded-full font-medium text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isDownloadingCard ? (
                      <>
                        <Loader2 className="size-4 animate-spin shrink-0" />
                        <span>Generating Card...</span>
                      </>
                    ) : (
                      <>
                        <Download className="size-4 shrink-0" />
                        <span>Download Keepsake Card</span>
                      </>
                    )}
                  </button>

                </div>
                {/* Secondary Row: QR Only, Copy Link, Native Share */}
                <div className="flex items-center gap-2 w-full">


                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="flex-1 h-10 rounded-full border border-black/[0.09] bg-neutral-50 hover:bg-neutral-100 text-neutral-800 text-xs font-medium flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="size-3.5 text-emerald-600 shrink-0" />
                        <span className="text-emerald-700 font-semibold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="size-3.5 text-neutral-600 shrink-0" />
                        <span>Copy link</span>
                      </>
                    )}
                  </button>

                  {canShare && (
                    <button
                      type="button"
                      onClick={handleNativeShare}
                      className="h-10 px-3.5 rounded-full border border-black/[0.09] bg-neutral-50 hover:bg-neutral-100 text-neutral-800 text-xs font-medium flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all cursor-pointer shrink-0"
                      title="Share via device menu"
                    >
                      <Share2 className="size-3.5 text-neutral-600 shrink-0" />
                      <span>Share</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Physical Keepsake & Print guidance */}
              <p className="mt-3 text-[11px] text-neutral-400 text-center leading-normal">
                Print ready for funeral service cards, celebration of life programs, table displays, or headstone plaques.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
