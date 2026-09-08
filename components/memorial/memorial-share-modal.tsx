"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import {
  Check,
  Copy,
  Download,
  Share2,
  X,
  Loader2,
} from "lucide-react"
import QRCode from "qrcode"
import { TheirsLogo } from "@/components/theirs/theirs-logo"
import { PortraitPlaceholder } from "./portrait-placeholder"
import { MEMORIAL_THEMES, type MemorialThemeId } from "@/lib/memorial/themes"

interface MemorialShareModalProps {
  isOpen: boolean
  onClose: () => void
  fullName: string
  slug: string
  portraitUrl?: string | null
  birthYear?: number | null
  deathYear?: number | null
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
  const [isDownloading, setIsDownloading] = useState(false)
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
  const qrDarkColor = themeDef.colors.textPrimary

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

  // Generate QR code data URL whenever target URL or theme changes
  useEffect(() => {
    let isMounted = true
    if (!isOpen) return

    QRCode.toDataURL(canonicalUrl, {
      width: 480,
      margin: 1,
      errorCorrectionLevel: "M",
      color: {
        dark: qrDarkColor,
        light: "#ffffff",
      },
    })
      .then((url) => {
        if (isMounted) setQrDataUrl(url)
      })
      .catch((err) => {
        console.error("Failed to generate memorial QR code:", err)
      })

    return () => {
      isMounted = false
    }
  }, [canonicalUrl, qrDarkColor, isOpen])

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
          text: `Remembering ${firstName}. We've gathered stories, photographs, and memories in their honor. Please visit to remember them with us or share a memory: ${canonicalUrl}`,
          url: canonicalUrl,
        })
      } catch (err) {
        // User cancelled or share aborted
      }
    }
  }

  const handleDownloadQr = async () => {
    try {
      setIsDownloading(true)
      // Generate sharp 1024x1024 PNG with 4-module quiet zone margin
      const highResUrl = await QRCode.toDataURL(canonicalUrl, {
        width: 1024,
        margin: 4,
        errorCorrectionLevel: "M",
        color: {
          dark: qrDarkColor,
          light: "#ffffff",
        },
      })

      const downloadLink = document.createElement("a")
      downloadLink.href = highResUrl
      downloadLink.download = `${slug}-memorial-qr.png`
      document.body.appendChild(downloadLink)
      downloadLink.click()
      document.body.removeChild(downloadLink)
    } catch (err) {
      console.error("Failed to download high-resolution QR code:", err)
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
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
            <div className="flex items-center justify-between px-6 pt-5 pb-3">
              <div className="flex items-center gap-2">
                <TheirsLogo themeAware className="size-4 text-[var(--theme-accent,#305dde)] shrink-0" />
                <span className="text-xs font-medium tracking-tight text-neutral-500 uppercase">
                  Share & Memorial QR
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
            <div className="px-6 pb-6 flex flex-col items-center">
              {/* Keepsake Visual Card (Theme Styled) */}
              <div
                style={{
                  backgroundColor: themeDef.colors.bgSurface,
                  borderColor: themeDef.colors.border,
                }}
                className="w-full rounded-2xl border p-5 sm:p-6 flex flex-col items-center text-center shadow-xs transition-colors duration-200"
              >
                {/* Person Portrait / Monogram */}
                <div
                  style={{ borderColor: themeDef.colors.border }}
                  className="size-16 sm:size-18 rounded-full overflow-hidden border-2 shadow-2xs mb-3 bg-white shrink-0"
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
                  className="text-xs font-mono mt-0.5"
                >
                  {yearsSpan}
                </p>

                {/* QR Code Plate */}
                <div className="mt-4 p-3 bg-white rounded-2xl border border-black/[0.06] shadow-sm flex flex-col items-center">
                  <div className="size-40 sm:size-44 flex items-center justify-center">
                    {qrDataUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={qrDataUrl}
                        alt={`QR code for ${fullName}'s memorial`}
                        className="size-full object-contain rounded-lg"
                      />
                    ) : (
                      <Loader2 className="size-6 animate-spin text-neutral-400" />
                    )}
                  </div>
                </div>

                {/* Caption / Physical scan bridge note */}
                <p
                  style={{ color: themeDef.colors.textMuted }}
                  className="text-[11px] leading-relaxed mt-3 max-w-[280px]"
                >
                  Scan with any phone camera to visit and share memories at{" "}
                  <strong
                    style={{ color: themeDef.colors.textPrimary }}
                    className="font-semibold"
                  >
                    theirs.page/{slug}
                  </strong>
                </p>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 w-full flex flex-col gap-2">
                {/* Download High-Res PNG Button */}
                <button
                  type="button"
                  onClick={handleDownloadQr}
                  disabled={isDownloading || !qrDataUrl}
                  style={{
                    backgroundColor: themeDef.colors.accent,
                    color: themeDef.colors.accentForeground,
                  }}
                  className="w-full h-11 rounded-full font-medium text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
                >
                  {isDownloading ? (
                    <>
                      <Loader2 className="size-4 animate-spin shrink-0" />
                      <span>Preparing High-Res PNG...</span>
                    </>
                  ) : (
                    <>
                      <Download className="size-4 shrink-0" />
                      <span>Download QR Code (PNG)</span>
                    </>
                  )}
                </button>

                {/* Secondary Actions: Copy Link & Native Share */}
                <div className="flex items-center gap-2 w-full">
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="flex-1 h-10 rounded-full border border-black/[0.09] bg-neutral-50 hover:bg-neutral-100 text-neutral-800 text-xs font-medium flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="size-3.5 text-emerald-600 shrink-0" />
                        <span className="text-emerald-700 font-semibold">Copied link!</span>
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
                      className="flex-1 h-10 rounded-full border border-black/[0.09] bg-neutral-50 hover:bg-neutral-100 text-neutral-800 text-xs font-medium flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all cursor-pointer"
                    >
                      <Share2 className="size-3.5 text-neutral-600 shrink-0" />
                      <span>Share via...</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Quiet Print & Keepsake guidance */}
              <p className="mt-3.5 text-[11px] text-neutral-400 text-center leading-normal">
                Perfect for funeral service cards, celebration of life programs, framed table photos, or plaques.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
