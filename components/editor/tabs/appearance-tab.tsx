"use client"

import React, { useState, useRef } from "react"
import Link from "next/link"
import {
  Check,
  ExternalLink,
  Sparkles,
  Image as ImageIcon,
  Upload,
  Loader2,
  Trash2,
  Maximize2,
  Layers,
} from "lucide-react"
import {
  MEMORIAL_THEMES_LIST,
  MEMORIAL_THEMES,
  type MemorialThemeId,
} from "@/lib/memorial/themes"
import {
  HERO_PATTERN_STYLES,
  MemorialCoverPattern,
} from "@/components/memorial/memorial-cover-patterns"
import type {
  MemorialCoverSettings,
  HeroCoverType,
  HeroPatternStyle,
} from "@/types/theirs"
import { useEditorAuthorization } from "../use-editor-authorization"

interface CuratedBackdrop {
  id: string
  title: string
  subtitle: string
  url: string
}

const CURATED_BACKDROPS: CuratedBackdrop[] = [
  {
    id: "rose_garden",
    title: "English Rose Garden",
    subtitle: "Daisies, roses & morning sunlight",
    url: "/theirs/rose-garden.webp",
  },
  {
    id: "wood_workshop",
    title: "Artisan Workshop",
    subtitle: "Woodcraft, chisels & workbench",
    url: "/theirs/wooden-work.webp",
  },
  {
    id: "misty_coast",
    title: "Misty Coastline",
    subtitle: "Peaceful sea waves & quiet horizon",
    url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80",
  },
  {
    id: "still_waters",
    title: "Still Waters",
    subtitle: "Calm reflection, twilight & quiet horizon",
    url: "/theirs/still-waters.webp",
  },
  {
    id: "highland_mist",
    title: "Highland Heather",
    subtitle: "Rolling hills & peaceful sky",
    url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80",
  },
  {
    id: "golden_orchard",
    title: "Golden Orchard",
    subtitle: "Autumn sunlight & whispering trees",
    url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1600&q=80",
  },
]

interface AppearanceTabProps {
  memorialId?: string
  slug?: string
  fullName: string
  portraitUrl?: string | null
  birthYear?: string | number | null
  deathYear?: string | number | null
  location?: string | null
  headline?: string | null
  theme?: MemorialThemeId
  currentTheme?: MemorialThemeId
  coverSettings?: MemorialCoverSettings | null
  galleryPhotos?: Array<{ id: string; url: string; caption?: string | null }>
  onChange?: (theme: MemorialThemeId) => void
  onChangeTheme?: (theme: MemorialThemeId) => void
  onChangeCoverSettings?: (settings: MemorialCoverSettings) => void
}

export function AppearanceTab({
  memorialId,
  slug,
  fullName,
  portraitUrl,
  birthYear,
  deathYear,
  theme,
  currentTheme = "quiet",
  coverSettings,
  galleryPhotos = [],
  onChange,
  onChangeTheme,
  onChangeCoverSettings,
}: AppearanceTabProps) {
  const activeTheme = theme || currentTheme || "quiet"
  const firstName = fullName?.trim().split(/\s+/)[0] || "them"
  const yearsSpan = birthYear && deathYear ? `${birthYear} \u2014 ${deathYear}` : "In Loving Memory"

  const handleAuthorizationFailure = useEditorAuthorization(memorialId || "")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploadingCover, setIsUploadingCover] = useState(false)
  const [coverUploadError, setCoverUploadError] = useState<string | null>(null)
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null)

  const currentCover: MemorialCoverSettings = coverSettings || { type: "clean" }
  const activeCoverType: HeroCoverType = currentCover.type || "clean"
  const activePatternStyle: HeroPatternStyle = currentCover.pattern_style || "soft_aura"

  const handleSelectTheme = (id: MemorialThemeId) => {
    onChange?.(id)
    onChangeTheme?.(id)
  }

  const handleSelectCoverType = (type: HeroCoverType) => {
    if (type === "clean") {
      setLocalPreviewUrl(null)
      onChangeCoverSettings?.({ type: "clean" })
    } else if (type === "pattern") {
      setLocalPreviewUrl(null)
      onChangeCoverSettings?.({
        type: "pattern",
        pattern_style: currentCover.pattern_style || "soft_aura",
      })
    } else if (type === "their_world") {
      onChangeCoverSettings?.({
        type: "their_world",
        cover_url: currentCover.cover_url || CURATED_BACKDROPS[0].url,
        focal_y: currentCover.focal_y ?? 50,
        focal_x: 50,
        source_type: currentCover.source_type || "curated",
      })
    }
  }

  const resolveCoverSrc = (url?: string | null) => {
    if (!url) return ""
    if (
      url.startsWith("blob:") ||
      url.startsWith("data:") ||
      url.startsWith("http://") ||
      url.startsWith("https://") ||
      url.startsWith("/")
    ) {
      return url
    }
    return `/api/media?key=${encodeURIComponent(url)}`
  }

  const displayCoverUrl = localPreviewUrl || resolveCoverSrc(currentCover.cover_url)

  const handleSelectPattern = (styleId: HeroPatternStyle) => {
    setLocalPreviewUrl(null)
    onChangeCoverSettings?.({
      type: "pattern",
      pattern_style: styleId,
    })
  }

  const handleSetFocalPosition = (focalY: number) => {
    if (activeCoverType !== "their_world") return
    onChangeCoverSettings?.({
      ...currentCover,
      type: "their_world",
      focal_y: focalY,
    })
  }

  const handleSelectCuratedCover = (backdrop: CuratedBackdrop) => {
    setLocalPreviewUrl(null)
    onChangeCoverSettings?.({
      type: "their_world",
      cover_url: backdrop.url,
      focal_y: 50,
      focal_x: 50,
      source_type: "curated",
    })
  }

  const handleSelectGalleryPhoto = (url: string) => {
    setLocalPreviewUrl(null)
    onChangeCoverSettings?.({
      type: "their_world",
      cover_url: url,
      focal_y: 50,
      focal_x: 50,
      source_type: "memorial_media",
    })
  }

  const handleRemoveCover = () => {
    setLocalPreviewUrl(null)
    onChangeCoverSettings?.({ type: "clean" })
  }

  const handleUploadCover = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploadingCover(true)
    setCoverUploadError(null)

    const preview = URL.createObjectURL(file)
    setLocalPreviewUrl(preview)

    try {
      const presignedRes = await fetch("/api/r2/presigned-upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type || "application/octet-stream",
          fileSize: file.size,
          folder: "covers",
          memorialId,
        }),
      })
      const presignedData = await presignedRes.json().catch(() => ({}))
      if (handleAuthorizationFailure(presignedRes)) return
      if (!presignedRes.ok) throw new Error(presignedData.error || "Failed to prepare photo upload")

      let uploadKey = presignedData.stagingKey || presignedData.key
      try {
        const directRes = await fetch(presignedData.uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": presignedData.contentType || file.type },
          body: file,
        })
        if (!directRes.ok) throw new Error(`Direct upload returned ${directRes.status}`)
      } catch (directError) {
        console.warn("Direct upload failed, using fallback:", directError)
        const formData = new FormData()
        formData.append("file", file)
        formData.append("folder", "covers")
        if (memorialId) formData.append("memorialId", memorialId)
        const fallbackRes = await fetch("/api/r2/upload", { method: "POST", body: formData })
        const fallbackData = await fallbackRes.json().catch(() => ({}))
        if (handleAuthorizationFailure(fallbackRes)) return
        if (!fallbackRes.ok) throw new Error(fallbackData.error || "Failed to upload photo")
        uploadKey = fallbackData.key
      }

      onChangeCoverSettings?.({
        type: "their_world",
        cover_url: uploadKey,
        focal_y: 50,
        focal_x: 50,
        source_type: "uploaded",
      })
    } catch (err: any) {
      console.error("Cover upload error:", err)
      setCoverUploadError(err.message || "Failed to upload photo")
      setLocalPreviewUrl(null)
    } finally {
      setIsUploadingCover(false)
      if (e.target) e.target.value = ""
    }
  }

  return (
    <div className="flex flex-col gap-10 pb-12 animate-in fade-in duration-200">
      {/* ------------------------------------------------------------------ */}
      {/* SECTION 1: ATMOSPHERE THEMES                                       */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between gap-4 border-b border-black/[0.06] pb-4">
          <div className="flex flex-col gap-0.5">
            <h2 className="text-base sm:text-lg font-medium tracking-tight text-[#181925]">
              Make this feel like {firstName}
            </h2>
            <p className="text-xs text-[#71717a]">
              Select an atmosphere that reflects their spirit and presence.
            </p>
          </div>

          {slug ? (
            <Link
              href={`/${slug}?preview=visitor`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-black/[0.08] bg-white text-xs font-medium text-[#181925] hover:bg-neutral-50 active:scale-95 transition-all shrink-0 shadow-2xs"
            >
              <span>Preview</span>
              <ExternalLink className="size-3 text-[#888]" />
            </Link>
          ) : null}
        </div>

        {/* 6 Atmosphere Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {MEMORIAL_THEMES_LIST.map((t) => {
            const isSelected = activeTheme === t.id

            return (
              <div
                key={t.id}
                role="button"
                tabIndex={0}
                onClick={() => handleSelectTheme(t.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    handleSelectTheme(t.id)
                  }
                }}
                className={`group relative flex flex-col rounded-2xl p-2.5 sm:p-3 transition-all duration-200 cursor-pointer text-left outline-none bg-white ${isSelected
                  ? "border-2 border-[#181925] ring-2 ring-[#181925]/10 shadow-xs"
                  : "border border-black/[0.08] hover:border-black/25 hover:-translate-y-0.5 hover:shadow-xs"
                  }`}
              >
                {/* Miniature Editorial Page Canvas */}
                <div
                  className="h-32 sm:h-36 w-full rounded-xl relative p-3 flex flex-col justify-between overflow-hidden border select-none transition-colors"
                  style={{
                    backgroundColor: t.colors.bgPage,
                    borderColor: t.colors.border,
                  }}
                >
                  {/* Canvas Top Bar: Font Tag + Selection Indicator */}
                  <div className="flex items-center justify-between gap-2">


                    {isSelected ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#181925] text-white text-[9px] font-semibold tracking-tight shadow-2xs">
                        <Check className="size-2.5 text-emerald-400" strokeWidth={3} />
                        <span>Active</span>
                      </span>
                    ) : (
                      <span className="size-4 rounded-full border border-black/15 bg-white/60 group-hover:border-black/30 group-hover:bg-white transition-colors" />
                    )}
                  </div>

                  {/* Canvas Center Hero: Vignette & Name */}
                  <div className="flex flex-col items-center justify-center text-center my-auto">
                    <div
                      className="size-11 sm:size-12 rounded-xl overflow-hidden border shadow-2xs shrink-0 flex items-center justify-center mb-1.5"
                      style={{
                        backgroundColor: t.colors.bgSurface,
                        borderColor: t.colors.border,
                      }}
                    >
                      {portraitUrl ? (
                        <img
                          src={portraitUrl}
                          alt=""
                          className="size-full object-cover object-top"
                        />
                      ) : (
                        <span
                          className="text-xs font-serif font-bold"
                          style={{ color: t.colors.textMuted }}
                        >
                          {firstName[0]}
                        </span>
                      )}
                    </div>

                    <div
                      className="text-sm sm:text-[15px] font-medium tracking-tight leading-tight line-clamp-1 max-w-[170px]"
                      style={{
                        color: t.colors.textPrimary,
                        fontFamily:
                          t.typography.fontHeadingName.includes("Serif") ||
                            t.typography.fontHeadingName.includes("Roman")
                            ? "Georgia, serif"
                            : "var(--font-sans), sans-serif",
                      }}
                    >
                      {fullName || "Robert Carter"}
                    </div>

                    <div
                      className="text-[10px] font-mono tracking-tight mt-0.5"
                      style={{ color: t.colors.textMuted }}
                    >
                      {yearsSpan}
                    </div>
                  </div>


                </div>

                {/* Card Footer Info Row */}
                <div className="flex items-center justify-between gap-2 px-1 pt-2 pb-0.5">
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs sm:text-sm font-semibold text-[#181925] tracking-tight truncate">
                        {t.name}
                      </span>
                      {t.id === "quiet" && (
                        <span className="text-[9px] uppercase tracking-wider font-mono px-1.5 py-0.2 rounded bg-neutral-100 text-neutral-500 font-medium">
                          Default
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-[#71717a] font-normal truncate">
                      {t.subtitle}
                    </span>
                  </div>

                  {/* Dynamic 4-Dot Palette Swatch */}
                  <div
                    className="flex items-center -space-x-1 shrink-0"
                    title={`${t.name} palette`}
                  >
                    <span
                      className="size-3.5 rounded-full border border-black/10 shadow-2xs"
                      style={{ backgroundColor: t.colors.bgPage }}
                    />
                    <span
                      className="size-3.5 rounded-full border border-black/10 shadow-2xs"
                      style={{ backgroundColor: t.colors.bgSurface }}
                    />
                    <span
                      className="size-3.5 rounded-full border border-black/10 shadow-2xs"
                      style={{ backgroundColor: t.colors.textPrimary }}
                    />
                    <span
                      className="size-3.5 rounded-full border border-black/10 shadow-2xs"
                      style={{ backgroundColor: t.colors.accent }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* SECTION 2: MEMORIAL COVER (HERO BACKGROUND)                       */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex flex-col gap-6 pt-4 border-t border-black/[0.06]">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-base sm:text-lg font-medium tracking-tight text-[#181925]">
            Memorial Cover
          </h2>
          <p className="text-xs text-[#71717a]">
            An ambient backdrop behind the portrait and memory details. Choose between a quiet clean canvas, a curated atmospheric pattern, or a photograph from their world.
          </p>
        </div>

        {/* 3 Top-Level Segmented Tabs */}
        <div className="inline-flex p-1 rounded-2xl bg-[#f4f4f6] border border-black/[0.06] self-start">
          <button
            type="button"
            onClick={() => handleSelectCoverType("clean")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${activeCoverType === "clean"
              ? "bg-white text-[#181925] shadow-xs"
              : "text-[#71717a] hover:text-[#181925]"
              }`}
          >
            <Layers className="size-3.5" />
            <span>Clean</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectCoverType("pattern")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${activeCoverType === "pattern"
              ? "bg-white text-[#181925] shadow-xs"
              : "text-[#71717a] hover:text-[#181925]"
              }`}
          >
            <Sparkles className="size-3.5 text-indigo-500" />
            <span>Pattern</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectCoverType("their_world")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${activeCoverType === "their_world"
              ? "bg-white text-[#181925] shadow-xs"
              : "text-[#71717a] hover:text-[#181925]"
              }`}
          >
            <ImageIcon className="size-3.5 text-amber-600" />
            <span>Their World</span>
          </button>
        </div>

        {/* 1. CLEAN MODE DETAILS */}
        {activeCoverType === "clean" && (
          <div className="rounded-2xl border border-black/[0.08] bg-white p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex flex-col gap-1 max-w-md">
              <span className="text-sm font-semibold text-[#181925]">
                Clean Atmosphere Canvas Active
              </span>
              <p className="text-xs text-[#71717a] leading-relaxed">
                The portrait, lifespan, and remembrance text rest peacefully on the unadorned canvas of your chosen atmosphere. No additional background graphics are displayed.
              </p>
            </div>
            <div className="px-3 py-1.5 rounded-full bg-neutral-100 text-[#555] text-xs font-mono font-medium shrink-0">
              Default Minimal Hero
            </div>
          </div>
        )}

        {/* 2. PATTERN MODE DETAILS */}
        {activeCoverType === "pattern" && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between text-xs text-[#71717a]">
              <span>
                Patterns derive their tones automatically from your active <strong>{MEMORIAL_THEMES[activeTheme].name}</strong> atmosphere.
              </span>
            </div>

            {/* 7 Pattern Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {HERO_PATTERN_STYLES.map((style) => {
                const isSelected = activePatternStyle === style.id

                return (
                  <div
                    key={style.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleSelectPattern(style.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault()
                        handleSelectPattern(style.id)
                      }
                    }}
                    className={`group relative flex flex-col rounded-2xl p-2.5 transition-all duration-200 cursor-pointer text-left outline-none bg-white ${isSelected
                      ? "border-2 border-[#181925] ring-2 ring-[#181925]/10 shadow-xs"
                      : "border border-black/[0.08] hover:border-black/25 hover:-translate-y-0.5 hover:shadow-xs"
                      }`}
                  >
                    {/* Pattern Live Canvas Thumbnail */}
                    <div
                      className="h-28 w-full rounded-xl relative overflow-hidden border select-none transition-colors"
                      style={{
                        backgroundColor: MEMORIAL_THEMES[activeTheme].colors.bgPage,
                        borderColor: MEMORIAL_THEMES[activeTheme].colors.border,
                      }}
                    >
                      <MemorialCoverPattern style={style.id} themeId={activeTheme} />

                      {/* Small Center Silhouette */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div
                          className="size-7 rounded-lg border shadow-2xs flex items-center justify-center opacity-70"
                          style={{
                            backgroundColor: MEMORIAL_THEMES[activeTheme].colors.bgSurface,
                            borderColor: MEMORIAL_THEMES[activeTheme].colors.border,
                          }}
                        >
                          <span
                            className="text-[10px] font-serif font-bold"
                            style={{ color: MEMORIAL_THEMES[activeTheme].colors.textMuted }}
                          >
                            {firstName[0]}
                          </span>
                        </div>
                      </div>

                      {/* Selection Check Tag */}
                      {isSelected && (
                        <div className="absolute top-2 right-2 z-10">
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[#181925] text-white text-[9px] font-semibold tracking-tight shadow-2xs">
                            <Check className="size-2 text-emerald-400" strokeWidth={3} />
                            <span>Active</span>
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Style Info */}
                    <div className="flex flex-col gap-0.5 px-1 pt-2 pb-0.5">
                      <span className="text-xs font-semibold text-[#181925] tracking-tight">
                        {style.name}
                      </span>
                      <span className="text-[11px] text-[#71717a] font-normal line-clamp-2 leading-relaxed">
                        {style.description}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* 3. THEIR WORLD MODE DETAILS */}
        {activeCoverType === "their_world" && (
          <div className="flex flex-col gap-6">
            {/* Active Cover Preview & Reposition Controls */}
            {displayCoverUrl && (
              <div className="rounded-2xl border border-black/[0.08] bg-white p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[#181925]">
                      Active Ambient Backdrop
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-neutral-100 text-[#666]">
                      {currentCover.source_type === "uploaded"
                        ? "Personal Upload"
                        : currentCover.source_type === "memorial_media"
                          ? "From Gallery"
                          : "Curated Place"}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleRemoveCover}
                    className="inline-flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 font-medium cursor-pointer"
                  >
                    <Trash2 className="size-3.5" />
                    <span>Remove</span>
                  </button>
                </div>

                {/* Miniature Ambient Vignette Preview */}
                <div
                  className="h-36 sm:h-44 w-full rounded-xl relative overflow-hidden border select-none flex items-center justify-center"
                  style={{
                    backgroundColor: MEMORIAL_THEMES[activeTheme].colors.bgPage,
                    borderColor: MEMORIAL_THEMES[activeTheme].colors.border,
                  }}
                >
                  {/* Photo with radial vignette & theme dissolve */}
                  <div
                    className="absolute inset-0 [mask-image:radial-gradient(ellipse_85%_75%_at_50%_35%,black_35%,transparent_100%)] opacity-75"
                  >
                    <img
                      src={displayCoverUrl}
                      alt=""
                      className="size-full object-cover"
                      style={{
                        objectPosition: `50% ${currentCover.focal_y ?? 50}%`,
                      }}
                    />
                  </div>

                  {isUploadingCover && (
                    <div className="absolute inset-0 bg-black/50 z-20 flex items-center justify-center text-white text-xs font-medium backdrop-blur-xs">
                      Uploading cover photo...
                    </div>
                  )}

                  {/* Multi-stop vertical dissolve */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: `linear-gradient(to bottom, transparent 0%, transparent 40%, ${MEMORIAL_THEMES[activeTheme].colors.bgPage} 92%, ${MEMORIAL_THEMES[activeTheme].colors.bgPage} 100%)`,
                    }}
                  />

                  {/* Silhouette Portrait Overlay */}
                  <div className="relative z-10 flex flex-col items-center gap-1">
                    <div
                      className="size-10 rounded-xl overflow-hidden border shadow-2xs flex items-center justify-center"
                      style={{
                        backgroundColor: MEMORIAL_THEMES[activeTheme].colors.bgSurface,
                        borderColor: MEMORIAL_THEMES[activeTheme].colors.border,
                      }}
                    >
                      {portraitUrl ? (
                        <img
                          src={portraitUrl}
                          alt=""
                          className="size-full object-cover object-top"
                        />
                      ) : (
                        <span
                          className="text-xs font-serif font-bold"
                          style={{ color: MEMORIAL_THEMES[activeTheme].colors.textMuted }}
                        >
                          {firstName[0]}
                        </span>
                      )}
                    </div>
                    <span
                      className="text-xs font-medium tracking-tight"
                      style={{ color: MEMORIAL_THEMES[activeTheme].colors.textPrimary }}
                    >
                      {fullName || "Robert Carter"}
                    </span>
                  </div>
                </div>

                {/* Simple Repositioning Control (Top, Center, Bottom) */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                  <span className="text-xs text-[#71717a]">
                    Adjust image focus area:
                  </span>
                  <div className="inline-flex p-0.5 rounded-xl bg-neutral-100 border border-black/[0.05] self-start sm:self-auto">
                    {[
                      { label: "Focus Top", y: 20 },
                      { label: "Focus Center", y: 50 },
                      { label: "Focus Bottom", y: 80 },
                    ].map((pos) => {
                      const isActive = (currentCover.focal_y ?? 50) === pos.y
                      return (
                        <button
                          key={pos.label}
                          type="button"
                          onClick={() => handleSetFocalPosition(pos.y)}
                          className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${isActive
                            ? "bg-white text-[#181925] shadow-2xs font-semibold"
                            : "text-[#71717a] hover:text-[#181925]"
                            }`}
                        >
                          {pos.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Photo Sources Header */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-semibold text-[#181925]">
                    Select a photograph from their life
                  </span>
                  <p className="text-xs text-[#71717a]">
                    Upload a photograph, choose from their gallery, or select a serene place they loved.
                  </p>
                </div>

                {/* Direct Upload Button */}
                <button
                  type="button"
                  disabled={isUploadingCover}
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#181925] text-white text-xs font-medium hover:bg-neutral-800 transition-all cursor-pointer disabled:opacity-50 self-start sm:self-auto shrink-0 shadow-2xs"
                >
                  {isUploadingCover ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="size-3.5" />
                      <span>Upload Photo</span>
                    </>
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleUploadCover}
                  className="hidden"
                />
              </div>

              {coverUploadError && (
                <div className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-xl p-2.5">
                  {coverUploadError}
                </div>
              )}

              {/* Gallery Photos Row (if any exist) */}
              {galleryPhotos.length > 0 && (
                <div className="flex flex-col gap-2 pt-1">
                  <span className="text-xs font-medium text-[#71717a]">
                    From this memorial's gallery:
                  </span>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {galleryPhotos.slice(0, 6).map((item) => {
                      const isSelected = currentCover.cover_url === item.url
                      return (
                        <div
                          key={item.id}
                          role="button"
                          tabIndex={0}
                          onClick={() => handleSelectGalleryPhoto(item.url)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault()
                              handleSelectGalleryPhoto(item.url)
                            }
                          }}
                          className={`group relative aspect-4/3 rounded-xl overflow-hidden border cursor-pointer transition-all ${isSelected
                            ? "border-2 border-[#181925] ring-2 ring-[#181925]/10 shadow-xs"
                            : "border-black/[0.08] hover:border-black/30 hover:shadow-2xs"
                            }`}
                        >
                          <img
                            src={item.url}
                            alt=""
                            className="size-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          {isSelected && (
                            <div className="absolute top-1.5 right-1.5 size-4 rounded-full bg-[#181925] text-white flex items-center justify-center shadow-2xs">
                              <Check className="size-2.5 text-emerald-400" strokeWidth={3} />
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Curated Atmospheric Places */}
              <div className="flex flex-col gap-2 pt-2">
                <span className="text-xs font-medium text-[#71717a]">
                  Or choose a place they cherished:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {CURATED_BACKDROPS.map((place) => {
                    const isSelected = currentCover.cover_url === place.url
                    return (
                      <div
                        key={place.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => handleSelectCuratedCover(place)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault()
                            handleSelectCuratedCover(place)
                          }
                        }}
                        className={`group relative flex flex-col rounded-2xl p-2 transition-all duration-200 cursor-pointer text-left outline-none bg-white ${isSelected
                          ? "border-2 border-[#181925] ring-2 ring-[#181925]/10 shadow-xs"
                          : "border border-black/[0.08] hover:border-black/25 hover:-translate-y-0.5 hover:shadow-xs"
                          }`}
                      >
                        <div className="h-24 w-full rounded-xl overflow-hidden relative border border-black/[0.06]">
                          <img
                            src={place.url}
                            alt={place.title}
                            className="size-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          {isSelected && (
                            <div className="absolute top-2 right-2">
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[#181925] text-white text-[9px] font-semibold tracking-tight shadow-2xs">
                                <Check className="size-2 text-emerald-400" strokeWidth={3} />
                                <span>Active</span>
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col gap-0.5 px-1 pt-2 pb-0.5">
                          <span className="text-xs font-semibold text-[#181925] tracking-tight">
                            {place.title}
                          </span>
                          <span className="text-[11px] text-[#71717a] font-normal truncate">
                            {place.subtitle}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Subtle reassurance footer note */}
      <p className="text-center text-xs text-[#71717a] pt-2">
        Appearance and cover changes apply instantly. Original photographs, stories, and tributes are always preserved.
      </p>
    </div>
  )
}
