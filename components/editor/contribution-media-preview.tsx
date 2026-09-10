"use client"

import { useState, useEffect, useCallback } from "react"
import { YouTubeEmbed } from "@/components/consent/youtube-embed"
import {
  ExternalLink,
  Maximize2,
  Volume2,
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  Film,
} from "lucide-react"

export interface ContributionMediaPreviewProps {
  src?: string | null
  photoUrls?: string[] | null
  mime?: string
  submissionType?: string
  compact?: boolean
  externalVideoId?: string | null
  externalUrl?: string | null
  title?: string
}

export function inferMediaType(
  url?: string | null,
  mime?: string,
  submissionType?: string
): "image" | "audio" | "video" {
  if (submissionType === "voice" || submissionType === "audio") return "audio"
  if (submissionType === "video" || submissionType === "youtube") return "video"
  if (submissionType === "photo" || submissionType === "image") return "image"

  if (mime) {
    const lowerMime = mime.toLowerCase()
    if (lowerMime.startsWith("audio/")) return "audio"
    if (lowerMime.startsWith("video/")) return "video"
    if (lowerMime.startsWith("image/")) return "image"
  }

  if (url) {
    const clean = url.split("?")[0].toLowerCase()
    if (/\.(mp3|wav|m4a|ogg|oga|aac|flac|opus)$/i.test(clean)) return "audio"
    if (/\.(mp4|webm|mov|mkv|ogv)$/i.test(clean)) return "video"
    if (/\.(jpg|jpeg|png|webp|gif|heic|heif|avif)$/i.test(clean)) return "image"
    if (clean.includes("/audio/") || clean.includes("-voice-") || clean.includes("recording")) {
      return "audio"
    }
    if (clean.includes("/video/")) return "video"
  }

  return "image"
}

export function ContributionMediaPreview({
  src,
  photoUrls,
  mime,
  submissionType,
  compact = false,
  externalVideoId,
  externalUrl,
  title,
}: ContributionMediaPreviewProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  // Consolidate media URLs (multiple photos array takes precedence over single src)
  const allUrls: string[] = []
  if (Array.isArray(photoUrls) && photoUrls.length > 0) {
    for (const u of photoUrls) {
      if (typeof u === "string" && u.trim() && !allUrls.includes(u.trim())) {
        allUrls.push(u.trim())
      }
    }
  } else if (typeof src === "string" && src.trim()) {
    allUrls.push(src.trim())
  }

  // Keyboard navigation for lightbox
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (lightboxIndex === null) return
      if (e.key === "Escape") {
        setLightboxIndex(null)
      } else if (e.key === "ArrowLeft" && allUrls.length > 1) {
        setLightboxIndex((prev) => (prev !== null ? (prev > 0 ? prev - 1 : allUrls.length - 1) : 0))
      } else if (e.key === "ArrowRight" && allUrls.length > 1) {
        setLightboxIndex((prev) => (prev !== null ? (prev < allUrls.length - 1 ? prev + 1 : 0) : 0))
      }
    },
    [lightboxIndex, allUrls.length]
  )

  useEffect(() => {
    if (lightboxIndex !== null) {
      window.addEventListener("keydown", handleKeyDown)
      return () => window.removeEventListener("keydown", handleKeyDown)
    }
  }, [lightboxIndex, handleKeyDown])

  if (externalVideoId) {
    return (
      <div className={`flex flex-col gap-1.5 ${compact ? "w-full max-w-xs" : "w-full max-w-sm"}`}>
        <div className="overflow-hidden rounded-xl shadow-xs border border-black/[0.08]">
          <YouTubeEmbed videoId={externalVideoId} title={title || "Contributed YouTube video"} />
        </div>
        {externalUrl && (
          <a
            href={externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline self-start cursor-pointer"
          >
            <ExternalLink className="size-3" />
            <span>Watch on YouTube</span>
          </a>
        )}
      </div>
    )
  }

  if (allUrls.length === 0) return null

  const primaryUrl = allUrls[0]
  const mediaType = inferMediaType(primaryUrl, mime, submissionType)

  return (
    <>
      {/* 1. AUDIO PLAYBACK CARD */}
      {mediaType === "audio" && (
        <div
          className={`flex flex-col gap-2 rounded-2xl bg-[#faf8f5] border border-[#8b5a45]/20 p-3 sm:p-4 ${compact ? "w-full max-w-sm" : "w-full max-w-md"
            }`}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-full bg-[#8b5a45]/15 text-[#8b5a45]">
                <Volume2 className="size-4" />
              </span>
              <span className="text-xs font-semibold text-[#181925]">
                {title || "Voice Note / Audio Recording"}
              </span>
            </div>
            <a
              href={primaryUrl}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="inline-flex items-center gap-1 text-[11px] font-medium text-[#71717a] hover:text-black cursor-pointer transition-colors"
              title="Download audio file"
            >
              <Download className="size-3" />
              <span className="hidden sm:inline">Save</span>
            </a>
          </div>

          <audio
            src={primaryUrl}
            controls
            preload="metadata"
            className="w-full h-9 rounded-lg accent-[#8b5a45]"
          />
        </div>
      )}

      {/* 2. PLAYABLE VIDEO CARD */}
      {mediaType === "video" && (
        <div
          className={`relative rounded-2xl overflow-hidden bg-black border border-black/10 flex flex-col group ${compact ? "w-full max-w-xs" : "w-full max-w-sm"
            }`}
        >
          <video
            src={primaryUrl}
            controls
            preload="metadata"
            playsInline
            className="max-h-60 w-full object-contain bg-black"
          />
          <div className="flex items-center justify-between px-3 py-2 bg-neutral-900 border-t border-white/10 text-white text-[11px]">
            <span className="inline-flex items-center gap-1 font-mono text-neutral-300">
              <Film className="size-3" /> Video Clip
            </span>
            <button
              type="button"
              onClick={() => setLightboxIndex(0)}
              className="inline-flex items-center gap-1 text-neutral-300 hover:text-white cursor-pointer transition-colors"
            >
              <Maximize2 className="size-3" />
              <span>Full Screen</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. MULTIPLE IMAGES (GRID) */}
      {mediaType === "image" && allUrls.length > 1 && (
        <div className="flex flex-col gap-1.5 w-full">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-[#71717a]">
              {allUrls.length} contributed photographs · click any to inspect
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 w-full max-w-lg">
            {allUrls.map((url, idx) => (
              <div
                key={url + idx}
                onClick={() => setLightboxIndex(idx)}
                className="relative aspect-4/3 rounded-xl overflow-hidden border border-black/[0.08] bg-neutral-100 group cursor-pointer hover:shadow-xs transition-all"
              >
                <img
                  src={url}
                  alt={title ? `${title} (${idx + 1})` : `Contributed photo ${idx + 1}`}
                  className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 text-white text-[11px] font-medium backdrop-blur-2xs">
                  <Maximize2 className="size-3.5" />
                  <span>Inspect</span>
                </div>
                <span className="absolute bottom-1 right-1 text-[9px] font-mono bg-black/65 text-white px-1.5 py-0.5 rounded backdrop-blur-xs">
                  {idx + 1}/{allUrls.length}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. SINGLE IMAGE */}
      {mediaType === "image" && allUrls.length === 1 && (
        <div className="relative inline-block group">
          <div
            onClick={() => setLightboxIndex(0)}
            className={`relative rounded-xl overflow-hidden border border-black/[0.08] bg-neutral-100 cursor-pointer shadow-2xs hover:shadow-sm transition-all ${compact ? "h-28 w-auto max-w-full" : "h-36 sm:h-44 w-auto max-w-full"
              }`}
          >
            <img
              src={primaryUrl}
              alt={title || "Contributed photograph"}
              className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white text-xs font-medium backdrop-blur-2xs">
              <Maximize2 className="size-3.5" />
              <span>Click to inspect</span>
            </div>
          </div>
        </div>
      )}

      {/* LIGHTBOX INSPECTION MODAL */}
      {lightboxIndex !== null && allUrls[lightboxIndex] && (
        <div
          onClick={() => setLightboxIndex(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col justify-between text-white select-none p-4 cursor-pointer animate-in fade-in duration-200"
        >
          {/* Top Bar */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-5xl mx-auto flex items-center justify-between pb-3 border-b border-white/10"
          >
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-white/90">
                {title || "Attachment Inspection"}
              </span>
              {allUrls.length > 1 && (
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-white/15 text-white/90">
                  {lightboxIndex + 1} of {allUrls.length}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <a
                href={allUrls[lightboxIndex]}
                target="_blank"
                rel="noopener noreferrer"
                download
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                title="Download original file"
              >
                <Download className="size-4" />
              </a>
              <button
                type="button"
                onClick={() => setLightboxIndex(null)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                title="Close viewer (Esc)"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>

          {/* Center Stage */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex-1 relative flex items-center justify-center py-4 max-w-5xl mx-auto w-full"
          >
            {/* Prev Button */}
            {allUrls.length > 1 && (
              <button
                type="button"
                onClick={() =>
                  setLightboxIndex((prev) =>
                    prev !== null ? (prev > 0 ? prev - 1 : allUrls.length - 1) : 0
                  )
                }
                className="absolute left-2 z-10 p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white transition-all cursor-pointer shadow-lg"
                title="Previous image"
              >
                <ChevronLeft className="size-6" />
              </button>
            )}

            {/* Media Content */}
            {mediaType === "video" ? (
              <video
                src={allUrls[lightboxIndex]}
                controls
                autoPlay
                playsInline
                className="max-h-[78vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl bg-black"
              />
            ) : mediaType === "audio" ? (
              <div className="flex flex-col items-center gap-4 bg-[#181925] border border-white/10 p-8 rounded-3xl max-w-md w-full shadow-2xl">
                <div className="flex size-16 items-center justify-center rounded-full bg-amber-500/20 text-amber-400">
                  <Volume2 className="size-8" />
                </div>
                <h3 className="text-base font-medium text-white">{title || "Audio Recording"}</h3>
                <audio
                  src={allUrls[lightboxIndex]}
                  controls
                  autoPlay
                  className="w-full mt-2 accent-amber-500"
                />
              </div>
            ) : (
              <img
                src={allUrls[lightboxIndex]}
                alt="Enlarged view"
                className="max-h-[78vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl border border-white/10"
              />
            )}

            {/* Next Button */}
            {allUrls.length > 1 && (
              <button
                type="button"
                onClick={() =>
                  setLightboxIndex((prev) =>
                    prev !== null ? (prev < allUrls.length - 1 ? prev + 1 : 0) : 0
                  )
                }
                className="absolute right-2 z-10 p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white transition-all cursor-pointer shadow-lg"
                title="Next image"
              >
                <ChevronRight className="size-6" />
              </button>
            )}
          </div>

          {/* Bottom Hint */}
          <div className="text-center text-[11px] text-white/50 pb-2">
            Use arrow keys to navigate · Esc to close
          </div>
        </div>
      )}
    </>
  )
}
