"use client"

import { useState, useRef, useEffect, useCallback, useMemo } from "react"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import {
  Maximize2,
  X,
  HelpCircle,
  MapPin,
  Calendar,
  Play,
  Pause,
  Plus,
  Video,
  Volume2,
  VolumeX,
  Image as ImageIcon,
  Check,
  Film,
  RotateCcw,
  Pin,
  Share2,
  BookOpen,
  Download,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { ContributionType } from "./contribute-modal"
import type { GalleryFacets, GalleryFilter, PagedCollection } from "@/types/memorial-view"
import type { ContributionSettings } from "@/types/theirs"
import type { MemorialAccessRole } from "@/lib/memorial-auth"
import { useOptimisticReceipts } from "@/lib/memorial/optimistic-receipts"
import { YouTubeEmbed } from "@/components/consent/youtube-embed"
import { resolveMediaCapabilities } from "@/lib/uploads/capabilities"

export type GalleryMediaType = "photo" | "audio" | "video"

export interface GalleryItem {
  id: string
  title: string
  mediaType: GalleryMediaType
  year: string
  location?: string
  album?: string
  isPinned?: boolean
  mediaUrl: string // Real audio file, video file, or high-res photo URL
  posterUrl?: string // Poster image for video/audio preview
  aspectRatio?: "portrait" | "landscape" | "square"
  duration?: string
  people?: string[]
  hasUnknownPerson?: boolean
  story?: string
  audioTitle?: string
  addedBy?: string
  sourceMemoryId?: string
  isOptimistic?: boolean
  externalVideoId?: string
}

interface MemorialGalleryProps {
  fullName?: string
  items?: GalleryItem[]
  isDemo?: boolean
  isPaid?: boolean
  accessRole?: MemorialAccessRole | null
  contributionSettings?: ContributionSettings | null
  onOpenContribute: (
    type?: ContributionType,
    initialPhotoUrl?: string,
    initialPhotoTitle?: string,
    initialMediaId?: string
  ) => void
  browseSlug?: string
  slug?: string
  initialPage?: PagedCollection<GalleryItem>
  initialFilter?: GalleryFilter
  initialAlbum?: string
  initialMediaId?: string
  initialSelectedItem?: GalleryItem | null
  hideAllTab?: boolean
  pageSize?: number
}

export function MemorialGallery({
  fullName = "",
  items,
  isDemo = false,
  isPaid = false,
  accessRole = null,
  contributionSettings = null,
  onOpenContribute,
  browseSlug,
  slug,
  initialPage,
  initialFilter = "all",
  initialAlbum = "all",
  initialMediaId,
  initialSelectedItem,
  hideAllTab = false,
  pageSize,
}: MemorialGalleryProps) {
  const router = useRouter()
  const pathname = usePathname()
  const fallbackItems = items || []
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>(initialPage?.items || fallbackItems)
  const effectiveInitialFilter: GalleryFilter = hideAllTab && initialFilter === "all" ? "photo" : initialFilter
  const [filter, setFilter] = useState<GalleryFilter>(effectiveInitialFilter)
  const [selectedAlbum, setSelectedAlbum] = useState<string>(initialAlbum)
  const [facets, setFacets] = useState<GalleryFacets | undefined>(initialPage?.facets)
  const [nextCursor, setNextCursor] = useState<string | null>(initialPage?.nextCursor || null)
  const [hasMore, setHasMore] = useState(Boolean(initialPage?.hasMore))
  const [isLoadingPage, setIsLoadingPage] = useState(false)
  const [pageError, setPageError] = useState<string | null>(null)
  const [didLoadMore, setDidLoadMore] = useState(false)
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null)
  const failedRequestRef = useRef<{ filter: GalleryFilter; album: string; cursor: string | null; append: boolean } | null>(null)
  const selectedFromHistoryRef = useRef(false)
  const lastTriggerRef = useRef<HTMLElement | null>(null)
  const [identifiedMap, setIdentifiedMap] = useState<Record<string, boolean>>({})

  // Optimistic Contributor Receipts
  const activeSlug = browseSlug || slug || ""
  const optimisticReceipts = useOptimisticReceipts(activeSlug, galleryItems)

  const optimisticMediaItems = useMemo<GalleryItem[]>(() => {
    return optimisticReceipts
      .filter((r) => r.photo_url || (r.photo_urls && r.photo_urls.length > 0) || (r.contribution_type && ["photo", "voice", "video"].includes(r.contribution_type)))
      .map((r): GalleryItem => ({
        id: r.id,
        title: r.story ? (r.story.length > 50 ? `${r.story.slice(0, 50)}...` : r.story) : (r.contribution_type === "voice" ? "Voice recording" : r.contribution_type === "video" ? "Video recording" : "Photograph"),
        mediaType: (r.contribution_type === "voice" ? "audio" : r.contribution_type === "video" ? "video" : "photo") as GalleryMediaType,
        year: r.approx_year ? String(r.approx_year) : "Recently added",
        location: r.location || undefined,
        album: "Family contributions",
        mediaUrl: r.photo_url || (r.photo_urls && r.photo_urls[0]) || "",
        externalVideoId: r.external_provider === "youtube" ? r.external_id || undefined : undefined,
        aspectRatio: "portrait",
        story: r.story,
        addedBy: r.author_name,
        isOptimistic: true,
      }))
  }, [optimisticReceipts])

  const allGalleryItems = useMemo(() => {
    if (optimisticMediaItems.length === 0) return galleryItems
    const existingIds = new Set(galleryItems.map((i) => i.id))
    const deduped = optimisticMediaItems.filter((i) => !existingIds.has(i.id))
    return [...deduped, ...galleryItems]
  }, [optimisticMediaItems, galleryItems])

  // Real Audio & Video Playback State
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null)
  const [audioProgress, setAudioProgress] = useState<Record<string, number>>({})
  const [audioCurrentTime, setAudioCurrentTime] = useState<Record<string, string>>({})
  const [audioDurations, setAudioDurations] = useState<Record<string, string>>({})
  const [videoDurations, setVideoDurations] = useState<Record<string, string>>({})
  const audioElementsRef = useRef<Record<string, HTMLAudioElement>>({})

  const firstName = fullName.split(" ")[0] || fullName

  const uniqueAlbums = facets?.albums || Array.from(
    new Set(allGalleryItems.map((i) => i.album?.trim()).filter(Boolean))
  ) as string[]

  const filteredItems = useMemo(() => {
    const matchingOptimistic = optimisticMediaItems.filter((item) => {
      const matchesType = filter === "all" || item.mediaType === filter
      const matchesAlbum = selectedAlbum === "all" || item.album?.trim() === selectedAlbum
      return matchesType && matchesAlbum
    })
    const matchingGallery = galleryItems.filter((item) => {
      const matchesType = filter === "all" || item.mediaType === filter
      const matchesAlbum = selectedAlbum === "all" || item.album?.trim() === selectedAlbum
      return matchesType && matchesAlbum
    })
    const existingIds = new Set(matchingGallery.map((i) => i.id))
    const deduped = matchingOptimistic.filter((i) => !existingIds.has(i.id))
    return [...deduped, ...matchingGallery]
  }, [optimisticMediaItems, galleryItems, filter, selectedAlbum])

  const photoCount = facets?.photo ?? allGalleryItems.filter((i) => i.mediaType === "photo").length
  const audioCount = facets?.audio ?? allGalleryItems.filter((i) => i.mediaType === "audio").length
  const videoCount = facets?.video ?? allGalleryItems.filter((i) => i.mediaType === "video").length
  const allCount = facets?.all ?? allGalleryItems.length
  const mediaCapabilities = useMemo(() => resolveMediaCapabilities({
    context: accessRole ? "member_contribution" : "guest_contribution",
    isPaid,
    accessRole,
    contributionSettings,
    existingMediaCounts: { image: photoCount },
  }), [accessRole, contributionSettings, isPaid, photoCount])

  useEffect(() => {
    if (!initialPage) return
    setGalleryItems(initialPage.items)
    setFacets(initialPage.facets)
    setNextCursor(initialPage.nextCursor)
    setHasMore(initialPage.hasMore)
    setDidLoadMore(false)
  }, [initialPage])

  const fetchGalleryPage = useCallback(async (nextFilter: GalleryFilter, nextAlbum: string, cursor?: string | null, append = false) => {
    if (!activeSlug || isLoadingPage) return
    setIsLoadingPage(true)
    setPageError(null)
    failedRequestRef.current = { filter: nextFilter, album: nextAlbum, cursor: cursor || null, append }
    try {
      const params = new URLSearchParams({ collection: "gallery", type: nextFilter })
      if (nextAlbum !== "all") params.set("album", nextAlbum)
      if (pageSize) params.set("pageSize", String(pageSize))
      if (cursor) params.set("cursor", cursor)
      else params.set("includeFacets", "true")
      const response = await fetch(`/api/memorials/${activeSlug}/browse?${params.toString()}`, { cache: "no-store" })
      if (!response.ok) throw new Error("We couldn't load the gallery right now.")
      const page = await response.json() as PagedCollection<GalleryItem>
      setGalleryItems((current) => append ? [...current, ...page.items.filter((item) => !current.some((existing) => existing.id === item.id))] : page.items)
      if (page.facets) setFacets(page.facets)
      setNextCursor(page.nextCursor)
      setHasMore(page.hasMore)
      setDidLoadMore(append)
      failedRequestRef.current = null
    } catch (reason) {
      setPageError(reason instanceof Error ? reason.message : "We couldn't load the gallery right now.")
    } finally {
      setIsLoadingPage(false)
    }
  }, [activeSlug, isLoadingPage, pageSize])

  const changeFilters = (nextFilter: GalleryFilter, nextAlbum: string) => {
    setFilter(nextFilter)
    setSelectedAlbum(nextAlbum)
    setDidLoadMore(false)
    if (browseSlug) {
      const params = new URLSearchParams()
      if (new URL(window.location.href).searchParams.get("preview") === "visitor") params.set("preview", "visitor")
      if (nextFilter !== "all") params.set("type", nextFilter)
      if (nextAlbum !== "all") params.set("album", nextAlbum)
      window.history.replaceState(window.history.state, "", `${pathname}${params.size ? `?${params.toString()}` : ""}`)
    }
    void fetchGalleryPage(nextFilter, nextAlbum)
  }

  const handleIdentify = (id: string) => {
    setIdentifiedMap((prev) => ({ ...prev, [id]: true }))
  }

  // Modal & Slideshow State
  const [isSlideshowPlaying, setIsSlideshowPlaying] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)
  const touchStartXRef = useRef<number | null>(null)

  const currentIndex = selectedItem
    ? filteredItems.findIndex((i) => i.id === selectedItem.id)
    : -1

  const replaceMediaInUrl = useCallback((mediaId: string) => {
    if (!browseSlug) return
    const url = new URL(window.location.href)
    url.searchParams.set("media", mediaId)
    window.history.replaceState({ ...window.history.state, theirsMedia: mediaId }, "", `${url.pathname}${url.search}${url.hash}`)
  }, [browseSlug])

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    if (isNaN(secs) || !isFinite(secs) || secs < 0) return "0:00"
    const m = Math.floor(secs / 60)
    const s = Math.floor(secs % 60)
    return `${m}:${s < 10 ? "0" : ""}${s}`
  }

  // Navigation handlers
  const handlePrev = useCallback(() => {
    if (filteredItems.length <= 1) return
    const nextIdx = (currentIndex - 1 + filteredItems.length) % filteredItems.length
    setSelectedItem(filteredItems[nextIdx])
    replaceMediaInUrl(filteredItems[nextIdx].id)
  }, [filteredItems, currentIndex, replaceMediaInUrl])

  const handleNext = useCallback(() => {
    if (filteredItems.length <= 1) return
    const nextIdx = (currentIndex + 1) % filteredItems.length
    setSelectedItem(filteredItems[nextIdx])
    replaceMediaInUrl(filteredItems[nextIdx].id)
  }, [filteredItems, currentIndex, replaceMediaInUrl])

  const openItem = useCallback((item: GalleryItem, trigger?: HTMLElement | null) => {
    lastTriggerRef.current = trigger || null
    setSelectedItem(item)
    if (browseSlug) {
      const url = new URL(window.location.href)
      if (url.searchParams.get("media") !== item.id) {
        url.searchParams.set("media", item.id)
        window.history.pushState({ ...window.history.state, theirsMedia: item.id }, "", `${url.pathname}${url.search}${url.hash}`)
        selectedFromHistoryRef.current = true
      }
    }
  }, [browseSlug])

  const handleCloseModal = useCallback(() => {
    setSelectedItem(null)
    setIsSlideshowPlaying(false)
    if (browseSlug && new URL(window.location.href).searchParams.has("media")) {
      if (selectedFromHistoryRef.current) {
        selectedFromHistoryRef.current = false
        window.history.back()
      } else {
        const url = new URL(window.location.href)
        url.searchParams.delete("media")
        router.replace(`${url.pathname}${url.search}${url.hash}`, { scroll: false })
      }
    }
    window.setTimeout(() => lastTriggerRef.current?.focus(), 0)
  }, [browseSlug, router])

  useEffect(() => {
    if (!browseSlug) return
    const requestedId = new URL(window.location.href).searchParams.get("media") || initialMediaId
    if (requestedId) {
      const requested = galleryItems.find((item) => item.id === requestedId) || (initialSelectedItem?.id === requestedId ? initialSelectedItem : undefined)
      if (requested) setSelectedItem(requested)
    }
    const handlePopState = () => {
      const mediaId = new URL(window.location.href).searchParams.get("media")
      if (!mediaId) {
        setSelectedItem(null)
        setIsSlideshowPlaying(false)
        window.setTimeout(() => lastTriggerRef.current?.focus(), 0)
      } else {
        const item = galleryItems.find((candidate) => candidate.id === mediaId)
        if (item) setSelectedItem(item)
      }
    }
    window.addEventListener("popstate", handlePopState)
    return () => window.removeEventListener("popstate", handlePopState)
  }, [browseSlug, galleryItems, initialMediaId, initialSelectedItem])

  const toggleSlideshow = useCallback(() => {
    setIsSlideshowPlaying((prev) => !prev)
  }, [])

  const handleShare = async (item: GalleryItem) => {
    const shareUrl = typeof window !== "undefined" ? window.location.href : ""
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: item.title || fullName,
          text: item.story || `Remembering on ${fullName}'s memorial archive`,
          url: shareUrl,
        })
        return
      } catch {
        // Ignored or cancelled
      }
    }
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(shareUrl)
        setCopiedLink(true)
        setTimeout(() => setCopiedLink(false), 2200)
      } catch (err) {
        console.error("Clipboard copy error:", err)
      }
    }
  }

  const handleDownload = (item: GalleryItem) => {
    const a = document.createElement("a")
    a.href = item.mediaUrl
    const safeTitle = item.title
      ? item.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
      : "memorial-media"
    const extension =
      item.mediaType === "video" ? ".mp4" : item.mediaType === "audio" ? ".mp3" : ".jpg"
    a.download = `${safeTitle}${extension}`
    a.target = "_blank"
    a.rel = "noopener noreferrer"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const handleTellStory = () => {
    const photoUrl =
      selectedItem?.mediaType === "photo"
        ? selectedItem.mediaUrl
        : selectedItem?.posterUrl || undefined
    const photoTitle = selectedItem?.title
    handleCloseModal()
    onOpenContribute("memory", photoUrl, photoTitle, selectedItem?.id)
  }

  // Responsive Column Count for true Left-to-Right Masonry distribution
  const [columnsCount, setColumnsCount] = useState(2)

  useEffect(() => {
    const updateColumns = () => {
      if (window.innerWidth < 768) {
        setColumnsCount(2)
      } else {
        setColumnsCount(3)
      }
    }
    updateColumns()
    window.addEventListener("resize", updateColumns)
    return () => window.removeEventListener("resize", updateColumns)
  }, [])

  const columnItems = useMemo(() => {
    const cols: GalleryItem[][] = Array.from({ length: columnsCount }, () => [])
    filteredItems.forEach((item, index) => {
      cols[index % columnsCount].push(item)
    })
    return cols
  }, [filteredItems, columnsCount])

  // Slideshow interval
  useEffect(() => {
    if (!isSlideshowPlaying || !selectedItem || filteredItems.length <= 1) return

    const timer = setInterval(() => {
      setSelectedItem((current) => {
        if (!current) return null
        const idx = filteredItems.findIndex((i) => i.id === current.id)
        const nextIdx = (idx + 1) % filteredItems.length
        replaceMediaInUrl(filteredItems[nextIdx].id)
        return filteredItems[nextIdx]
      })
    }, 4500)

    return () => clearInterval(timer)
  }, [isSlideshowPlaying, selectedItem, filteredItems, replaceMediaInUrl])

  // Keyboard navigation
  useEffect(() => {
    if (!selectedItem) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault()
        handlePrev()
      } else if (e.key === "ArrowRight") {
        e.preventDefault()
        handleNext()
      } else if (e.key === "Escape") {
        e.preventDefault()
        handleCloseModal()
      } else if (e.key === " ") {
        const tag = (e.target as HTMLElement)?.tagName?.toLowerCase()
        if (tag !== "input" && tag !== "textarea") {
          e.preventDefault()
          toggleSlideshow()
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [selectedItem, handlePrev, handleNext, handleCloseModal, toggleSlideshow])

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (selectedItem) {
      const originalOverflow = document.body.style.overflow
      document.body.style.overflow = "hidden"
      return () => {
        document.body.style.overflow = originalOverflow
      }
    }
  }, [selectedItem])

  // Proactively fetch metadata for audio items so duration is visible immediately
  useEffect(() => {
    galleryItems.forEach((item) => {
      if (item.mediaType === "audio" && item.mediaUrl && !item.duration) {
        try {
          const probe = new Audio()
          probe.preload = "metadata"
          probe.src = item.mediaUrl
          probe.onloadedmetadata = () => {
            if (probe.duration && isFinite(probe.duration)) {
              setAudioDurations((prev) => ({
                ...prev,
                [item.id]: formatTime(probe.duration),
              }))
            }
          }
        } catch {
          // Probe error ignored
        }
      }
    })
  }, [galleryItems])

  // Audio Play/Pause handler
  const handleToggleAudio = (item: GalleryItem) => {
    // If clicking already playing track, pause it
    if (playingAudioId === item.id) {
      const audio = audioElementsRef.current[item.id]
      if (audio) audio.pause()
      setPlayingAudioId(null)
      return
    }

    // Pause any other playing audio
    if (playingAudioId && audioElementsRef.current[playingAudioId]) {
      audioElementsRef.current[playingAudioId].pause()
    }

    // Create or reuse audio element
    let audio = audioElementsRef.current[item.id]
    if (!audio) {
      audio = new Audio(item.mediaUrl)
      audio.preload = "metadata"
      audioElementsRef.current[item.id] = audio

      audio.addEventListener("loadedmetadata", () => {
        if (audio.duration && isFinite(audio.duration)) {
          setAudioDurations((prev) => ({
            ...prev,
            [item.id]: formatTime(audio.duration),
          }))
        }
      })

      audio.addEventListener("timeupdate", () => {
        if (!audio.duration || isNaN(audio.duration)) return
        const pct = (audio.currentTime / audio.duration) * 100
        setAudioProgress((prev) => ({ ...prev, [item.id]: pct }))
        setAudioCurrentTime((prev) => ({ ...prev, [item.id]: formatTime(audio.currentTime) }))
      })

      audio.addEventListener("ended", () => {
        setPlayingAudioId(null)
        setAudioProgress((prev) => ({ ...prev, [item.id]: 0 }))
        setAudioCurrentTime((prev) => ({ ...prev, [item.id]: "0:00" }))
      })

      audio.addEventListener("error", (e) => {
        console.error("Audio playback error:", e)
        setPlayingAudioId(null)
      })
    }

    audio
      .play()
      .then(() => {
        setPlayingAudioId(item.id)
      })
      .catch((err) => {
        console.error("Failed to start audio playback:", err)
        setPlayingAudioId(null)
      })
  }

  // Seek audio via waveform click
  const handleSeekAudio = (item: GalleryItem, e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioElementsRef.current[item.id]
    if (!audio || !audio.duration || isNaN(audio.duration)) return
    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const pct = Math.max(0, Math.min(1, clickX / rect.width))
    audio.currentTime = pct * audio.duration
  }

  // Cleanup all audio on unmount
  useEffect(() => {
    return () => {
      Object.values(audioElementsRef.current).forEach((a) => a.pause())
    }
  }, [])

  return (
    <section id="gallery" className="py-12 px-4 max-w-4xl mx-auto flex flex-col gap-4 scroll-mt-24">

      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[var(--theme-border)] pb-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-[var(--theme-text-primary)]">
            Gallery
          </h2>
        </div>

        {mediaCapabilities.nativePhoto ? (
          <button
            type="button"
            onClick={() => onOpenContribute("photo")}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[var(--theme-accent)] hover:brightness-105 text-[var(--theme-accent-foreground)] text-xs font-medium transition-all self-start sm:self-auto cursor-pointer shadow-xs active:scale-95"
          >
            <Plus className="size-3.5" />
            <span>Add photos</span>
          </button>
        ) : null}
      </div>

      {/* Format Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 select-none">
        {[
          { key: "all", label: `All (${allCount})`, show: !hideAllTab },
          { key: "photo", label: `Photos (${photoCount})`, icon: ImageIcon, show: true },
          { key: "audio", label: `Voice & Audio (${audioCount})`, icon: Volume2, show: Boolean(isPaid || audioCount > 0) },
          { key: "video", label: `Home Video (${videoCount})`, icon: Film, show: Boolean(isPaid || videoCount > 0) },
        ]
          .filter((tab) => tab.show)
          .map((tab) => {
            const Icon = tab.icon
            const isActive = filter === tab.key
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => changeFilters(tab.key as GalleryFilter, selectedAlbum)}
                disabled={isLoadingPage}
                className={`inline-flex items-center gap-1.5 text-xs px-3.5 py-1.5 rounded-full font-medium transition-all cursor-pointer ${isActive
                  ? "bg-[var(--theme-accent)] text-[var(--theme-accent-foreground)] shadow-2xs"
                  : "bg-[var(--theme-bg-surface-subtle)] border border-[var(--theme-border)] text-[var(--theme-text-muted)] hover:text-[var(--theme-text-primary)]"
                  }`}
              >
                {Icon && <Icon className="size-3 shrink-0" />}
                <span>{tab.label}</span>
              </button>
            )
          })}
      </div>

      {/* Album Filter Bar (Only visible when items have albums) */}
      {uniqueAlbums.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 select-none -mt-4">
          <span className="text-xs font-medium text-[var(--theme-text-muted)] pr-1 shrink-0">Album:</span>
          <button
            type="button"
            onClick={() => changeFilters(filter, "all")}
            disabled={isLoadingPage}
            className={`text-xs px-3 py-1 rounded-full font-medium transition-all cursor-pointer shrink-0 ${selectedAlbum === "all"
              ? "bg-[var(--theme-accent)] text-[var(--theme-accent-foreground)] shadow-2xs"
              : "bg-[var(--theme-bg-surface-subtle)] border border-[var(--theme-border)] text-[var(--theme-text-muted)] hover:text-[var(--theme-text-primary)]"
              }`}
          >
            All Albums
          </button>
          {uniqueAlbums.map((alb) => (
            <button
              key={alb}
              type="button"
              onClick={() => changeFilters(filter, alb)}
              disabled={isLoadingPage}
              className={`text-xs px-3 py-1 rounded-full font-medium transition-all cursor-pointer shrink-0 ${selectedAlbum === alb
                ? "bg-[var(--theme-accent)] text-[var(--theme-accent-foreground)] shadow-2xs"
                : "bg-[var(--theme-bg-surface-subtle)] border border-[var(--theme-border)] text-[var(--theme-text-muted)] hover:text-[var(--theme-text-primary)]"
                }`}
            >
              {alb}
            </button>
          ))}
        </div>
      )}

      {/* Unified Media Grid / Empty State */}
      {filteredItems.length === 0 ? (
        <div className="py-16 text-center text-sm text-[var(--theme-text-muted)] rounded-3xl bg-[var(--theme-bg-surface-subtle)] border border-[var(--theme-border)] flex flex-col items-center justify-center gap-3">
          <p>No photographs, voice notes, or videos added to the gallery yet.</p>
          {mediaCapabilities.nativePhoto ? (
            <button
              type="button"
              onClick={() => onOpenContribute("photo")}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--theme-accent)] hover:underline cursor-pointer"
            >
              <Plus className="size-3.5" />
              <span>Add the first memory</span>
            </button>
          ) : null}
        </div>
      ) : (
        /* FLUID MASONRY GRID (Left-to-right distributed, no empty leading slots, natural dimensions) */
        <div
          className={`grid gap-2.5 sm:gap-4 items-start ${columnsCount === 2 ? "grid-cols-2" : "grid-cols-3"}`}
        >
          {columnItems.map((col, colIdx) => (
            <div key={colIdx} className="flex flex-col gap-2.5 sm:gap-4 min-w-0">
              {col.map((item) => {
                // 1. REAL AUDIO CARD (Interactive Waveform Player in Masonry Flow)
                if (item.mediaType === "audio") {
                  const isPlaying = playingAudioId === item.id
                  const progress = audioProgress[item.id] || 0
                  const currentFormattedTime = audioCurrentTime[item.id] || "0:00"
                  const durationDisplay =
                    audioDurations[item.id] ||
                    (item.duration && item.duration !== "undefined" ? item.duration : "")

                  return (
                    <div key={item.id} className="w-full">
                      <div className="p-3.5 sm:p-5 rounded-2xl bg-[#f7f7f8] border border-black/[0.06] hover:border-black/[0.12] transition-all flex flex-col justify-between gap-3 sm:gap-4 group">
                        <div className="flex items-center justify-between gap-1 flex-wrap">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-mono text-[var(--theme-accent)] bg-[var(--theme-accent)]/10 px-1.5 sm:px-2 py-0.5 rounded-full font-medium">
                              <Volume2 className="size-2.5 sm:size-3" />
                              <span>Voice recording</span>
                            </span>
                            {item.isPinned && (
                              <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-mono font-medium text-[var(--theme-accent)] bg-[var(--theme-accent)]/8 border border-[var(--theme-accent)]/30 px-1.5 py-0.5 rounded-full">
                                <Pin className="size-2 sm:size-2.5 fill-[var(--theme-accent)]" /> Featured
                              </span>
                            )}
                            {item.isOptimistic && (
                              <span className="inline-flex items-center gap-1.5 text-[9px] sm:text-[10px] font-sans font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span>Sent to {firstName}&apos;s family</span>
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] sm:text-[11px] font-mono text-[#888]">
                            {isPlaying
                              ? (durationDisplay ? `${currentFormattedTime} / ${durationDisplay}` : currentFormattedTime)
                              : (durationDisplay || "Audio recording")}
                          </span>
                        </div>

                        <div
                          onClick={(event) => openItem(item, event.currentTarget)}
                          onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); openItem(item, event.currentTarget) } }}
                          tabIndex={0}
                          role="button"
                          className="flex flex-col gap-1 cursor-pointer"
                        >
                          <h3 className="text-xs sm:text-sm font-medium text-[#181925] line-clamp-2 hover:text-[var(--theme-accent)] transition-colors">
                            {item.title}
                          </h3>
                          {item.story && (
                            <p className="text-[11px] sm:text-xs text-[#555] leading-relaxed line-clamp-2">
                              “{item.story}”
                            </p>
                          )}
                        </div>

                        {/* Interactive Waveform Seekbar */}
                        <div className="p-2 sm:p-3 rounded-xl bg-white border border-black/[0.06] flex items-center gap-2 sm:gap-3 select-none">
                          <button
                            type="button"
                            onClick={() => handleToggleAudio(item)}
                            className="size-7 sm:size-9 rounded-full bg-[var(--theme-accent)] text-[var(--theme-accent-foreground)] flex items-center justify-center shrink-0 hover:brightness-105 transition-transform active:scale-95 cursor-pointer shadow-xs"
                            aria-label={isPlaying ? "Pause audio" : "Play audio"}
                          >
                            {isPlaying ? (
                              <Pause className="size-3.5 sm:size-4 fill-current" />
                            ) : (
                              <Play className="size-3.5 sm:size-4 ml-0.5 fill-current" />
                            )}
                          </button>

                          {/* Clickable Scrubber Waveform */}
                          <div
                            onClick={(e) => handleSeekAudio(item, e)}
                            className="flex-1 flex items-center gap-[2px] sm:gap-[2.5px] h-5 sm:h-6 cursor-pointer relative overflow-hidden"
                            title="Click to seek"
                          >
                            {[35, 65, 95, 45, 80, 55, 75, 40, 90, 60, 30, 75, 50, 85, 40, 65, 90, 55].map((h, i) => {
                              const barPct = (i / 18) * 100
                              const isFilled = barPct <= progress

                              return (
                                <span
                                  key={i}
                                  className={`flex-1 rounded-full transition-all duration-150 min-w-[2px] ${isFilled ? "bg-[var(--theme-accent)]" : "bg-neutral-200"
                                    } ${isPlaying && isFilled ? "animate-pulse" : ""}`}
                                  style={{ height: `${h}%` }}
                                />
                              )
                            })}
                          </div>

                          {item.year && (
                            <span className="text-[9px] sm:text-[10px] font-mono text-[#888] shrink-0">
                              {item.year}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                }

                // 2. REAL VIDEO CARD (Uncropped in Masonry Grid with Play Glyph)
                if (item.mediaType === "video") {
                  if (item.externalVideoId) {
                    return (
                      <div key={item.id} className="w-full overflow-hidden rounded-2xl bg-neutral-900 shadow-xs">
                        <YouTubeEmbed videoId={item.externalVideoId} title={item.title} />
                        {(item.title || item.year || item.location) && (
                          <div className="flex items-start justify-between gap-3 px-3.5 py-3 text-white">
                            <span className="min-w-0 truncate text-xs font-medium">{item.title || "Shared video"}</span>
                            {(item.year || item.location) && (
                              <span className="shrink-0 text-[10px] font-mono text-white/65">
                                {[item.year, item.location].filter(Boolean).join(" · ")}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  }
                  const videoDuration =
                    videoDurations[item.id] ||
                    (item.duration && item.duration !== "undefined" ? item.duration : "")

                  return (
                    <div key={item.id} className="w-full">
                      <div
                        onClick={(event) => openItem(item, event.currentTarget)}
                        onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); openItem(item, event.currentTarget) } }}
                        tabIndex={0}
                        role="button"
                        className="group relative rounded-2xl overflow-hidden bg-neutral-900 cursor-pointer shadow-xs hover:shadow-md transition-all duration-300 w-full"
                      >
                        {item.posterUrl ? (
                          <img
                            src={item.posterUrl}
                            alt={item.title}
                            loading="lazy"
                            className="w-full h-auto object-cover block transition-transform duration-500 group-hover:scale-[1.02]"
                          />
                        ) : (
                          <video
                            src={`${item.mediaUrl}#t=0.001`}
                            preload="metadata"
                            muted
                            playsInline
                            onLoadedMetadata={(e) => {
                              const dur = e.currentTarget.duration
                              if (dur && isFinite(dur)) {
                                setVideoDurations((prev) => ({ ...prev, [item.id]: formatTime(dur) }))
                              }
                            }}
                            className="w-full h-auto object-cover block pointer-events-none"
                          />
                        )}

                        {/* Glowing Video Play Button Overlay */}
                        <div className="absolute inset-0 bg-black/35 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                          <div className="size-11 rounded-full bg-white/95 text-[#181925] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <Play className="size-5 ml-0.5 fill-[#181925]" />
                          </div>
                        </div>

                        {/* Pinned Featured Badge */}
                        {item.isPinned && (
                          <div className="absolute top-2.5 left-2.5 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[var(--theme-accent)] text-[var(--theme-accent-foreground)] text-[10px] font-mono shadow-xs backdrop-blur-xs">
                            <Pin className="size-2.5 fill-current" />
                            <span>Featured</span>
                          </div>
                        )}

                        {/* Optimistic Receipt Badge */}
                        {item.isOptimistic && (
                          <div className="absolute top-2.5 left-2.5 z-10 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/90 text-emerald-200 text-[10px] font-medium border border-emerald-500/40 shadow-xs backdrop-blur-xs">
                            <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span>Sent to {firstName}&apos;s family</span>
                          </div>
                        )}

                        {/* Video Duration Badge */}
                        <div className="absolute bottom-2.5 right-2.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/75 text-white text-[10px] font-mono backdrop-blur-xs">
                          <Film className="size-2.5" />
                          <span>{videoDuration || "Video"}</span>
                        </div>

                        {/* Subtle Hover Gradient & Info Overlay */}
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-3 pt-6 text-white pointer-events-none">
                          <span className="text-xs font-medium text-white truncate block drop-shadow-xs">
                            {item.title}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                }

                // 3. PHOTO CARD (Clean Uncropped Photography in Masonry Grid)
                return (
                  <div key={item.id} className="w-full">
                    <div
                      onClick={(event) => openItem(item, event.currentTarget)}
                      onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); openItem(item, event.currentTarget) } }}
                      tabIndex={0}
                      role="button"
                      className="group relative rounded-2xl overflow-hidden bg-neutral-100 cursor-pointer shadow-xs hover:shadow-md transition-all duration-300 w-full"
                    >
                      <img
                        src={item.mediaUrl}
                        alt={item.title}
                        loading="lazy"
                        className="w-full h-auto object-cover block rounded-2xl transition-transform duration-500 group-hover:scale-[1.02]"
                      />

                      {/* Optimistic Receipt Badge */}
                      {item.isOptimistic && (
                        <div className="absolute top-2.5 left-2.5 z-10 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/90 text-emerald-200 text-[10px] font-medium border border-emerald-500/40 shadow-xs backdrop-blur-xs">
                          <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span>Sent to {firstName}&apos;s family</span>
                        </div>
                      )}

                      {/* Elegant Vignette Gradient & Details on Hover */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3.5 text-white pointer-events-none">
                        <div className="flex items-end justify-between gap-2">
                          <div className="flex flex-col min-w-0">
                            {item.title && item.title !== "Photograph" && (
                              <span className="text-xs font-medium text-white truncate drop-shadow-xs">
                                {item.title}
                              </span>
                            )}
                            {(item.year || item.location) && (
                              <span className="text-[10px] font-mono text-white/85 drop-shadow-xs truncate">
                                {[item.year, item.location].filter(Boolean).join(" · ")}
                              </span>
                            )}
                          </div>
                          <div className="size-7 rounded-full bg-white/25 backdrop-blur-md flex items-center justify-center text-white shrink-0 shadow-xs">
                            <Maximize2 className="size-3.5" />
                          </div>
                        </div>
                      </div>

                      {/* Pinned Featured Badge */}
                      {item.isPinned && (
                        <div className="absolute top-2.5 left-2.5 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[var(--theme-accent)] text-[var(--theme-accent-foreground)] text-[10px] font-mono shadow-xs backdrop-blur-xs">
                          <Pin className="size-2.5 fill-current" />
                          <span>Featured</span>
                        </div>
                      )}

                      {/* "Who is this?" flag for unidentified faces */}
                      {item.hasUnknownPerson && !item.isPinned && (
                        <div className="absolute top-2.5 left-2.5 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/90 text-white text-[10px] font-medium backdrop-blur-xs shadow-xs">
                          <HelpCircle className="size-2.5" />
                          <span>Who is this?</span>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      )}

      {browseSlug && (hasMore || pageError) && (
        <div className="flex flex-col items-center gap-3 pt-2">
          {pageError && <p role="alert" className="text-sm text-red-700">{pageError}</p>}
          <button
            type="button"
            disabled={isLoadingPage}
            onClick={() => {
              const failed = failedRequestRef.current
              void (failed
                ? fetchGalleryPage(failed.filter, failed.album, failed.cursor, failed.append)
                : fetchGalleryPage(filter, selectedAlbum, nextCursor, true))
            }}
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[var(--theme-accent)] px-5 text-sm font-semibold text-[var(--theme-accent-foreground)] shadow-xs hover:brightness-105 active:scale-[0.98] transition-all disabled:opacity-60 cursor-pointer"
          >
            {isLoadingPage && <RotateCcw className="size-4 animate-spin" />}
            {isLoadingPage ? "Loading…" : pageError ? "Try again" : "Show more media"}
          </button>
        </div>
      )}

      {browseSlug && didLoadMore && !hasMore && !pageError && (
        <p className="pt-2 text-center text-sm text-[var(--theme-text-muted)]">All media are shown.</p>
      )}

      {/* =================================================================== */}
      {/* THEATER LIGHTBOX MODAL (ForeverMissed-inspired Responsive Viewer)   */}
      {/* =================================================================== */}
      {selectedItem && (
        <div
          onClick={handleCloseModal}
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between text-white select-none overflow-hidden"
        >
          {/* TOP TOOLBAR */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full flex items-center justify-between px-3 sm:px-6 py-3 sm:py-4 z-20 border-b border-white/10 bg-black/40 backdrop-blur-sm"
          >
            {/* Center/Left Actions Inspired by ForeverMissed */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Share */}
              <button
                type="button"
                onClick={() => handleShare(selectedItem)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Share this memory"
              >
                <Share2 className="size-3.5" />
                <span>{copiedLink ? "Link Copied!" : "Share"}</span>
              </button>

              {/* Start / Pause Slideshow */}
              {filteredItems.length > 1 && (
                <button
                  type="button"
                  onClick={toggleSlideshow}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${isSlideshowPlaying
                    ? "bg-white/20 text-white"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                    }`}
                  title={isSlideshowPlaying ? "Pause slideshow" : "Start slideshow"}
                >
                  {isSlideshowPlaying ? (
                    <>
                      <Pause className="size-3.5 fill-current" />
                      <span className="hidden sm:inline">Pause slideshow</span>
                    </>
                  ) : (
                    <>
                      <Play className="size-3.5 fill-current" />
                      <span className="hidden sm:inline">Start slideshow</span>
                    </>
                  )}
                </button>
              )}

              {/* Tell a Story */}
              <button
                type="button"
                onClick={handleTellStory}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Tell a story about this memory"
              >
                <BookOpen className="size-3.5" />
                <span className="hidden sm:inline">Tell a Story</span>
              </button>

              {/* Download */}
              <button
                type="button"
                onClick={() => handleDownload(selectedItem)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Download high-resolution file"
                aria-label="Download original"
              >
                <Download className="size-3.5" />
                <span className="sr-only sm:not-sr-only sm:inline">Download</span>
              </button>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={handleCloseModal}
              className="size-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer ml-2 shrink-0"
              aria-label="Close media viewer"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* CENTER VIEWPORT (Media Stage + Prev/Next Chevrons) */}
          <div
            className="flex-1 relative flex items-center justify-center px-2 sm:px-14 py-2 sm:py-4 overflow-hidden"
            onTouchStart={(e) => {
              touchStartXRef.current = e.touches[0].clientX
            }}
            onTouchEnd={(e) => {
              if (touchStartXRef.current === null) return
              const diff = touchStartXRef.current - e.changedTouches[0].clientX
              if (diff > 50) handleNext()
              if (diff < -50) handlePrev()
              touchStartXRef.current = null
            }}
          >
            {/* Left Chevron */}
            {filteredItems.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  handlePrev()
                }}
                className="absolute left-2 sm:left-4 z-30 p-2 sm:p-3 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-all cursor-pointer group"
                aria-label="Previous memory"
              >
                <ChevronLeft className="size-7 sm:size-9 group-active:scale-90 transition-transform" />
              </button>
            )}

            {/* Main Media Content */}
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative flex items-center justify-center max-w-full max-h-full"
            >
              {selectedItem.mediaType === "video" && selectedItem.externalVideoId ? (
                <div className="w-[92vw] max-w-4xl sm:w-[80vw]">
                  <YouTubeEmbed videoId={selectedItem.externalVideoId} title={selectedItem.title} />
                </div>
              ) : selectedItem.mediaType === "video" ? (
                <video
                  controls
                  autoPlay
                  playsInline
                  src={selectedItem.mediaUrl}
                  poster={selectedItem.posterUrl}
                  className="max-h-[68vh] sm:max-h-[74vh] max-w-[92vw] sm:max-w-[80vw] w-auto h-auto object-contain rounded-lg shadow-2xl"
                  onLoadedMetadata={(e) => {
                    const dur = e.currentTarget.duration
                    if (dur && isFinite(dur)) {
                      setVideoDurations((prev) => ({
                        ...prev,
                        [selectedItem.id]: formatTime(dur),
                      }))
                    }
                  }}
                />
              ) : selectedItem.mediaType === "audio" ? (
                <div className="py-10 sm:py-12 px-6 sm:px-10 w-full max-w-md flex flex-col items-center justify-center gap-5 bg-[#181925] text-white rounded-3xl border border-white/10 shadow-2xl">
                  <div className="size-16 rounded-full bg-[var(--theme-accent)]/20 flex items-center justify-center text-[var(--theme-accent)]">
                    <Volume2 className="size-8" />
                  </div>
                  <div className="text-center">
                    <h4 className="text-base font-medium text-white">{selectedItem.title}</h4>
                    {selectedItem.story && (
                      <p className="text-xs text-neutral-300 mt-2 italic">“{selectedItem.story}”</p>
                    )}
                  </div>
                  <audio
                    controls
                    autoPlay
                    className="w-full mt-2"
                    src={selectedItem.mediaUrl}
                    onLoadedMetadata={(e) => {
                      const dur = e.currentTarget.duration
                      if (dur && isFinite(dur)) {
                        setAudioDurations((prev) => ({
                          ...prev,
                          [selectedItem.id]: formatTime(dur),
                        }))
                      }
                    }}
                  />
                </div>
              ) : (
                <img
                  src={selectedItem.mediaUrl}
                  alt={selectedItem.title}
                  className="max-h-[68vh] sm:max-h-[74vh] max-w-[92vw] sm:max-w-[82vw] w-auto h-auto object-contain rounded-md shadow-2xl transition-all duration-300"
                />
              )}
            </div>

            {/* Right Chevron */}
            {filteredItems.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  handleNext()
                }}
                className="absolute right-2 sm:right-4 z-30 p-2 sm:p-3 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-all cursor-pointer group"
                aria-label="Next memory"
              >
                <ChevronRight className="size-7 sm:size-9 group-active:scale-90 transition-transform" />
              </button>
            )}
          </div>

          {/* BOTTOM METADATA BAR */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full px-4 sm:px-8 py-3 sm:py-4 z-20 border-t border-white/10 bg-black/40 backdrop-blur-sm flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4"
          >
            {/* Left: Counter "23 of 27" */}
            <div className="text-xs sm:text-sm font-mono text-white/70 shrink-0 self-start sm:self-center">
              {currentIndex >= 0 ? `${currentIndex + 1} of ${filteredItems.length}` : ""}
            </div>

            {/* Center: Caption & Details */}
            <div className="flex flex-col items-center justify-center text-center max-w-xl mx-auto min-w-0">
              {/* Caption / Title */}
              <p className="text-xs sm:text-sm font-medium text-white truncate max-w-full">
                {selectedItem.title && selectedItem.title !== "Photograph"
                  ? selectedItem.title
                  : (selectedItem.story || "Photograph")}
              </p>

              {/* Subtitle / Contributor Line */}
              <div className="flex items-center gap-2 text-[11px] text-white/60 font-sans mt-0.5 flex-wrap justify-center">
                {selectedItem.addedBy && (
                  <span>
                    Added by <strong className="font-medium text-white/85">{selectedItem.addedBy}</strong>
                  </span>
                )}
                {selectedItem.sourceMemoryId && activeSlug && (
                  <>
                    <span>·</span>
                    <Link
                      href={`/${activeSlug}/memories#story-${selectedItem.sourceMemoryId}`}
                      className="inline-flex items-center gap-1 text-white/80 hover:text-white underline underline-offset-2 transition-colors"
                    >
                      From {selectedItem.addedBy ? `${selectedItem.addedBy}’s memory` : "memory"} &rarr;
                    </Link>
                  </>
                )}
                {selectedItem.year && (
                  <>
                    {(selectedItem.addedBy || selectedItem.sourceMemoryId) && <span>·</span>}
                    <span className="font-mono">{selectedItem.year}</span>
                  </>
                )}
                {selectedItem.location && (
                  <>
                    <span>·</span>
                    <span>{selectedItem.location}</span>
                  </>
                )}
                {selectedItem.album && (
                  <>
                    <span>·</span>
                    <span className="text-[var(--theme-accent)]/90">{selectedItem.album}</span>
                  </>
                )}
              </div>

              {/* Optimistic Receipt Indicator */}
              {selectedItem.isOptimistic && (
                <div className="mt-1.5 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-200 text-[10px] border border-emerald-500/40">
                  <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Sent to {firstName}&apos;s family</span>
                </div>
              )}

              {/* Separate story if not used as title */}
              {selectedItem.story && selectedItem.title !== selectedItem.story && selectedItem.title !== "Photograph" && (
                <p className="text-xs text-white/75 italic mt-1 line-clamp-2 max-w-md hidden sm:block">
                  “{selectedItem.story}”
                </p>
              )}

              {/* Pictured people chips */}
              {selectedItem.people && selectedItem.people.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap mt-1.5 justify-center">
                  <span className="text-[10px] font-mono text-white/50">Pictured:</span>
                  {selectedItem.people.map((p, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-full bg-white/10 text-white text-[10px] font-medium"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Unknown person helper / spacer */}
            <div className="shrink-0 flex items-center justify-end self-end sm:self-center">
              {selectedItem.hasUnknownPerson ? (
                identifiedMap[selectedItem.id] ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-500/30">
                    <Check className="size-3" />
                    <span>Note sent</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleIdentify(selectedItem.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-[11px] font-medium text-amber-200 transition-colors cursor-pointer"
                  >
                    <HelpCircle className="size-3" />
                    <span>Identify person</span>
                  </button>
                )
              ) : (
                <div className="w-12 sm:w-16 hidden sm:block" />
              )}
            </div>
          </div>
        </div>
      )}

    </section>
  )
}
