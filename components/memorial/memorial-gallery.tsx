"use client"

import { useState, useRef, useEffect } from "react"
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
} from "lucide-react"
import { ContributionType } from "./contribute-modal"

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
}

export const DEFAULT_GALLERY_ITEMS: GalleryItem[] = [
  // 1. PHOTO
  {
    id: "g1",
    title: "At the Watchmaker’s Bench",
    mediaType: "photo",
    year: "1984",
    location: "High Street Workshop, Devon",
    album: "Workshop",
    mediaUrl: "/memorial-family-portrait-grandfather.jpg",
    aspectRatio: "portrait",
    people: ["Robert Carter"],
    story: "Calibrating a 19th-century mahogany bracket clock for the village church.",
  },
  // 2. VIDEO (Real playable clip)
  {
    id: "g4",
    title: "Tea in the Rose Garden (Super 8)",
    mediaType: "video",
    year: "1989",
    location: "Dartmoor Cottage",
    album: "Family Films",
    mediaUrl: "/videos/speaking.mp4",
    posterUrl: "/memorial-family-portrait-combined.jpg",
    aspectRatio: "landscape",
    duration: "0:12",
    people: ["Robert Carter", "Meena Carter", "Young Anita"],
    story: "Digitized 8mm home film reel. Robert talking about his peace roses while Meena pours Assam tea from the enamel pot.",
  },
  // 3. AUDIO (Real playable audio)
  {
    id: "g3",
    title: "Checking Tyre Pressure Voicemail",
    mediaType: "audio",
    year: "2014",
    location: "Devon Cottage",
    album: "Recordings",
    mediaUrl: "/music/Beloved(chosic.com).mp3",
    duration: "0:24",
    audioTitle: "“Make sure you put enough air in those front tyres...”",
    story: "Voicemail left on Anita’s phone on a rainy Friday before she drove back to London. You can hear his soft chuckle right at the end.",
  },
  // 4. PHOTO
  {
    id: "g2",
    title: "Wedding at St. Jude’s",
    mediaType: "photo",
    year: "1974",
    location: "St. Jude’s Church, Oxford",
    album: "Family",
    mediaUrl: "/historical-wedding-photo.webp",
    aspectRatio: "landscape",
    people: ["Robert Carter", "Meena Sharma"],
    story: "July 20th, 1974. Meena wearing a hand-embroidered silk sari and Robert in his first tailored suit.",
  },
  // 5. VIDEO (Real playable clip)
  {
    id: "g8",
    title: "Quiet Moment in the Workshop",
    mediaType: "video",
    year: "1995",
    location: "High Street Workshop",
    album: "Workshop",
    mediaUrl: "/videos/gentle-smile.mp4",
    posterUrl: "/vintage-family-portraits-colorized.webp",
    aspectRatio: "portrait",
    duration: "0:08",
    people: ["Robert Carter"],
    story: "Recorded on apprentice Sarah’s camcorder. Robert looking up from the jeweler’s lathe with a calm, reassuring smile.",
  },
  // 6. PHOTO
  {
    id: "g5",
    title: "Three Generations in the Rose Garden",
    mediaType: "photo",
    year: "1998",
    location: "Devon Cottage",
    album: "Family",
    mediaUrl: "/memorial-family-portrait-combined.jpg",
    aspectRatio: "square",
    people: ["Robert Carter", "Anita Carter (baby)", "Meena Carter"],
    story: "First summer with granddaughter Anita in the cottage garden. Robert built the wooden pram himself.",
  },
  // 7. AUDIO (Real playable audio)
  {
    id: "g7",
    title: "Recounting the 1968 Morris Minor Trip",
    mediaType: "audio",
    year: "2019",
    location: "Carter Workshop",
    album: "Recordings",
    mediaUrl: "/music/Awakening-Dew(chosic.com).mp3",
    duration: "0:36",
    audioTitle: "“We took the car across the moors in dense fog...”",
    story: "Recorded by apprentice Sarah during tea break. Robert humming Beatles tunes and laughing about the slipping clutch.",
  },
  // 8. VIDEO (Real playable clip)
  {
    id: "g10",
    title: "Sunday Afternoon on Dartmoor",
    mediaType: "video",
    year: "2016",
    location: "Dartmoor National Park",
    album: "Family Films",
    mediaUrl: "/videos/warm-gaze.mp4",
    posterUrl: "/memorial-before.jpg",
    aspectRatio: "landscape",
    duration: "0:06",
    people: ["Robert Carter"],
    story: "Resting on a granite boulder overlooking the river Dart after a long walk through the heather.",
  },
  // 9. PHOTO
  {
    id: "g6",
    title: "Exeter Grammar School Cricket XI",
    mediaType: "photo",
    year: "1960",
    location: "Exeter, Devon",
    album: "Early Years",
    mediaUrl: "/old-school-photo.webp",
    aspectRatio: "landscape",
    people: ["Robert Carter", "Unknown boy on left"],
    hasUnknownPerson: true,
    story: "Robert sitting second from the right, front row. The boy holding the bat is unidentified.",
  },
]

interface MemorialGalleryProps {
  fullName?: string
  items?: GalleryItem[]
  isDemo?: boolean
  isPaid?: boolean
  onOpenContribute: (type?: ContributionType) => void
}

export function MemorialGallery({
  fullName = "Robert Carter",
  items,
  isDemo = false,
  isPaid = false,
  onOpenContribute,
}: MemorialGalleryProps) {
  const galleryItems = isDemo ? (items && items.length > 0 ? items : DEFAULT_GALLERY_ITEMS) : (items || [])
  const [filter, setFilter] = useState<"all" | "photo" | "audio" | "video">("all")
  const [selectedAlbum, setSelectedAlbum] = useState<string>("all")
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null)
  const [identifiedMap, setIdentifiedMap] = useState<Record<string, boolean>>({})

  // Real Audio & Video Playback State
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null)
  const [audioProgress, setAudioProgress] = useState<Record<string, number>>({})
  const [audioCurrentTime, setAudioCurrentTime] = useState<Record<string, string>>({})
  const [audioDurations, setAudioDurations] = useState<Record<string, string>>({})
  const [videoDurations, setVideoDurations] = useState<Record<string, string>>({})
  const audioElementsRef = useRef<Record<string, HTMLAudioElement>>({})

  const firstName = fullName.split(" ")[0] || fullName

  const uniqueAlbums = Array.from(
    new Set(galleryItems.map((i) => i.album?.trim()).filter(Boolean))
  ) as string[]

  const filteredItems = galleryItems.filter((item) => {
    const matchesType = filter === "all" || item.mediaType === filter
    const matchesAlbum = selectedAlbum === "all" || item.album?.trim() === selectedAlbum
    return matchesType && matchesAlbum
  })

  const photoCount = galleryItems.filter((i) => i.mediaType === "photo").length
  const audioCount = galleryItems.filter((i) => i.mediaType === "audio").length
  const videoCount = galleryItems.filter((i) => i.mediaType === "video").length

  const handleIdentify = (id: string) => {
    setIdentifiedMap((prev) => ({ ...prev, [id]: true }))
  }

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    if (isNaN(secs) || !isFinite(secs) || secs < 0) return "0:00"
    const m = Math.floor(secs / 60)
    const s = Math.floor(secs % 60)
    return `${m}:${s < 10 ? "0" : ""}${s}`
  }

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
    <section id="gallery" className="py-12 sm:py-16 px-4 max-w-4xl mx-auto flex flex-col gap-8 scroll-mt-24">
      
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-black/[0.06] pb-6">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-mono font-medium text-primary uppercase tracking-wider">
            Media Archive
          </span>
          <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-[#181925]">
            Gallery
          </h2>
          <p className="text-xs sm:text-sm text-[#71717a]">
            Preserved photographs, actual voice recordings, and digitized family film reels.
          </p>
        </div>

        {!isPaid && photoCount >= 5 ? (
          <div className="text-xs text-[#71717a] bg-[#f4f4f6] px-3.5 py-1.5 rounded-full font-medium self-start sm:self-auto select-none">
            Photo limit reached ({photoCount}/5)
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onOpenContribute("photo")}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#181925] hover:bg-[#252736] text-white text-xs font-medium transition-all self-start sm:self-auto cursor-pointer shadow-xs active:scale-95"
          >
            <Plus className="size-3.5" />
            <span>Add to gallery</span>
          </button>
        )}
      </div>

      {/* Format Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 select-none">
        {[
          { key: "all", label: `All (${galleryItems.length})`, show: true },
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
                onClick={() => setFilter(tab.key as any)}
                className={`inline-flex items-center gap-1.5 text-xs px-3.5 py-1.5 rounded-full font-medium transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#181925] text-white shadow-2xs"
                    : "bg-[#f4f4f6] text-[#666] hover:text-[#181925]"
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
          <span className="text-xs font-medium text-[#71717a] pr-1 shrink-0">Album:</span>
          <button
            type="button"
            onClick={() => setSelectedAlbum("all")}
            className={`text-xs px-3 py-1 rounded-full font-medium transition-all cursor-pointer shrink-0 ${
              selectedAlbum === "all"
                ? "bg-[#8b5a45] text-white shadow-2xs"
                : "bg-[#f4f4f6] text-[#666] hover:text-[#181925]"
            }`}
          >
            All Albums
          </button>
          {uniqueAlbums.map((alb) => (
            <button
              key={alb}
              type="button"
              onClick={() => setSelectedAlbum(alb)}
              className={`text-xs px-3 py-1 rounded-full font-medium transition-all cursor-pointer shrink-0 ${
                selectedAlbum === alb
                  ? "bg-[#8b5a45] text-white shadow-2xs"
                  : "bg-[#f4f4f6] text-[#666] hover:text-[#181925]"
              }`}
            >
              {alb}
            </button>
          ))}
        </div>
      )}

      {/* Unified Media Grid / Empty State */}
      {filteredItems.length === 0 ? (
        <div className="py-16 text-center text-sm text-[#71717a] rounded-3xl bg-[#fafafb] border border-black/[0.06] flex flex-col items-center justify-center gap-3">
          <p>No photographs, voice notes, or videos added to the gallery yet.</p>
          {!isPaid && photoCount >= 5 ? null : (
            <button
              type="button"
              onClick={() => onOpenContribute("photo")}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline cursor-pointer"
            >
              <Plus className="size-3.5" />
              <span>Add the first memory</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredItems.map((item) => {
          
          // ===================================================================
          // 1. REAL AUDIO CARD (Interactive Waveform Player)
          // ===================================================================
          if (item.mediaType === "audio") {
            const isPlaying = playingAudioId === item.id
            const progress = audioProgress[item.id] || 0
            const currentFormattedTime = audioCurrentTime[item.id] || "0:00"
            const durationDisplay =
              audioDurations[item.id] ||
              (item.duration && item.duration !== "undefined" ? item.duration : "")

            return (
              <div
                key={item.id}
                className="p-5 rounded-2xl bg-[#f7f7f8] border border-black/[0.06] hover:border-black/[0.12] transition-all flex flex-col justify-between gap-4 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 text-[11px] font-mono text-primary bg-primary/10 px-2 py-0.5 rounded-full font-medium">
                      <Volume2 className="size-3" />
                      <span>Voice recording</span>
                    </span>
                    {item.isPinned && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono font-medium text-[#8b5a45] bg-[#faf8f5] border border-[#8b5a45]/30 px-2 py-0.5 rounded-full">
                        <Pin className="size-2.5 fill-[#8b5a45]" /> Featured
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-mono text-[#888]">
                    {isPlaying
                      ? (durationDisplay ? `${currentFormattedTime} / ${durationDisplay}` : currentFormattedTime)
                      : (durationDisplay || "Audio recording")}
                  </span>
                </div>

                <div className="flex flex-col gap-1">
                  <h3 className="text-sm font-medium text-[#181925] line-clamp-2">
                    {item.title}
                  </h3>
                  {item.story && (
                    <p className="text-xs text-[#555] leading-relaxed line-clamp-2">
                      “{item.story}”
                    </p>
                  )}
                </div>

                {/* Interactive Waveform Seekbar */}
                <div className="p-3 rounded-xl bg-white border border-black/[0.06] flex items-center gap-3 select-none">
                  <button
                    type="button"
                    onClick={() => handleToggleAudio(item)}
                    className="size-9 rounded-full bg-primary text-white flex items-center justify-center shrink-0 hover:bg-primary/95 transition-transform active:scale-95 cursor-pointer shadow-xs"
                    aria-label={isPlaying ? "Pause audio" : "Play audio"}
                  >
                    {isPlaying ? (
                      <Pause className="size-4 fill-white" />
                    ) : (
                      <Play className="size-4 ml-0.5 fill-white" />
                    )}
                  </button>

                  {/* Clickable Scrubber Waveform */}
                  <div
                    onClick={(e) => handleSeekAudio(item, e)}
                    className="flex-1 flex items-center gap-[2.5px] h-6 cursor-pointer relative"
                    title="Click to seek"
                  >
                    {[35, 65, 95, 45, 80, 55, 75, 40, 90, 60, 30, 75, 50, 85, 40, 65, 90, 55].map((h, i) => {
                      const barPct = (i / 18) * 100
                      const isFilled = barPct <= progress

                      return (
                        <span
                          key={i}
                          className={`flex-1 rounded-full transition-all duration-150 ${
                            isFilled
                              ? "bg-primary"
                              : "bg-neutral-200"
                          } ${isPlaying && isFilled ? "animate-pulse" : ""}`}
                          style={{ height: `${h}%` }}
                        />
                      )
                    })}
                  </div>

                  {item.year && (
                    <span className="text-[10px] font-mono text-[#888] shrink-0">
                      {item.year}
                    </span>
                  )}
                </div>
              </div>
            )
          }

          // ===================================================================
          // 2. REAL VIDEO CARD (Opens Theater Video Player Lightbox)
          // ===================================================================
          if (item.mediaType === "video") {
            const videoDuration =
              videoDurations[item.id] ||
              (item.duration && item.duration !== "undefined" ? item.duration : "")

            return (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className="group relative rounded-2xl overflow-hidden bg-white border border-black/[0.06] p-2 cursor-pointer transition-all hover:border-black/[0.14] flex flex-col gap-2.5"
              >
                <div className="aspect-[3/2] rounded-xl overflow-hidden bg-neutral-900 relative">
                  {item.posterUrl ? (
                    <img
                      src={item.posterUrl}
                      alt={item.title}
                      className="size-full object-cover grayscale contrast-105 group-hover:scale-105 transition-transform duration-300"
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
                      className="size-full object-cover grayscale contrast-105 group-hover:scale-105 transition-transform duration-300 pointer-events-none"
                    />
                  )}
                  
                  {/* Glowing Video Play Button Overlay */}
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/25 transition-colors flex items-center justify-center">
                    <div className="size-11 rounded-full bg-white/95 text-[#181925] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Play className="size-5 ml-0.5 fill-[#181925]" />
                    </div>
                  </div>

                  {/* Pinned Featured Badge */}
                  {item.isPinned && (
                    <div className="absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#8b5a45] text-white text-[10px] font-mono shadow-xs backdrop-blur-xs">
                      <Pin className="size-2.5 fill-white" />
                      <span>Featured</span>
                    </div>
                  )}

                  {/* Video Duration Badge */}
                  {videoDuration ? (
                    <div className="absolute bottom-2 right-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/75 text-white text-[10px] font-mono backdrop-blur-xs">
                      <Film className="size-2.5" />
                      <span>{videoDuration}</span>
                    </div>
                  ) : (
                    <div className="absolute bottom-2 right-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/75 text-white text-[10px] font-mono backdrop-blur-xs">
                      <Film className="size-2.5" />
                      <span>Video</span>
                    </div>
                  )}
                </div>

                <div className="px-1 pb-1 flex flex-col gap-0.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-[#181925] truncate">
                      {item.title}
                    </span>
                    {item.year && (
                      <span className="text-[11px] font-mono text-[#888] shrink-0">
                        {item.year}
                      </span>
                    )}
                  </div>
                  {item.location && (
                    <span className="text-[11px] text-[#71717a] truncate">
                      {item.location}
                    </span>
                  )}
                </div>
              </div>
            )
          }

          // ===================================================================
          // 3. PHOTO CARD (Opens High-Res Photo Lightbox)
          // ===================================================================
          return (
            <div
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className="group relative rounded-2xl overflow-hidden bg-white border border-black/[0.06] p-2 cursor-pointer transition-all hover:border-black/[0.14] flex flex-col gap-2.5"
            >
              <div
                className={`rounded-xl overflow-hidden bg-neutral-100 relative ${
                  item.aspectRatio === "portrait"
                    ? "aspect-[4/5]"
                    : item.aspectRatio === "square"
                    ? "aspect-square"
                    : "aspect-[3/2]"
                }`}
              >
                <img
                  src={item.mediaUrl}
                  alt={item.title}
                  className="size-full object-cover grayscale contrast-105 group-hover:scale-102 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                  <Maximize2 className="size-5 drop-shadow-sm" />
                </div>

                {/* Pinned Featured Badge */}
                {item.isPinned && (
                  <div className="absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#8b5a45] text-white text-[10px] font-mono shadow-xs backdrop-blur-xs">
                    <Pin className="size-2.5 fill-white" />
                    <span>Featured</span>
                  </div>
                )}

                {/* "Who is this?" flag for unidentified faces */}
                {item.hasUnknownPerson && !item.isPinned && (
                  <div className="absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/90 text-white text-[10px] font-medium backdrop-blur-xs shadow-xs">
                    <HelpCircle className="size-2.5" />
                    <span>Who is this?</span>
                  </div>
                )}
              </div>

              <div className="px-1 pb-1 flex flex-col gap-0.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-[#181925] truncate">
                    {item.title}
                  </span>
                  {item.year && (
                    <span className="text-[11px] font-mono text-[#888] shrink-0">
                      {item.year}
                    </span>
                  )}
                </div>
                {item.location && (
                  <span className="text-[11px] text-[#71717a] truncate">
                    {item.location}
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
      )}

      {/* =================================================================== */}
      {/* THEATER LIGHTBOX MODAL (Full Video Player or Photo Viewer)          */}
      {/* =================================================================== */}
      {selectedItem && (
        <div
          onClick={() => setSelectedItem(null)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md p-4 sm:p-6 flex items-center justify-center select-none"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-3xl w-full bg-white rounded-3xl p-4 sm:p-6 flex flex-col gap-4 overflow-hidden shadow-2xl relative"
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 size-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-[#666] flex items-center justify-center transition-colors cursor-pointer z-10"
              aria-label="Close media player"
            >
              <X className="size-4" />
            </button>

            {/* Main Media Player Container */}
            <div className="max-h-[60vh] rounded-2xl overflow-hidden bg-black flex items-center justify-center relative">
              {selectedItem.mediaType === "video" ? (
                /* REAL HTML5 VIDEO PLAYER WITH FULL CONTROLS */
                <video
                  controls
                  autoPlay
                  playsInline
                  className="w-full max-h-[60vh] object-contain rounded-2xl"
                  src={selectedItem.mediaUrl}
                  poster={selectedItem.posterUrl}
                  onLoadedMetadata={(e) => {
                    const dur = e.currentTarget.duration
                    if (dur && isFinite(dur)) {
                      setVideoDurations((prev) => ({
                        ...prev,
                        [selectedItem.id]: formatTime(dur),
                      }))
                    }
                  }}
                >
                  Your browser does not support HTML5 video playback.
                </video>
              ) : selectedItem.mediaType === "audio" ? (
                /* REAL AUDIO PLAYER IN LIGHTBOX */
                <div className="py-12 px-6 w-full flex flex-col items-center justify-center gap-5 bg-[#181925] text-white rounded-2xl">
                  <div className="size-16 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                    <Volume2 className="size-8" />
                  </div>
                  <div className="text-center max-w-md">
                    <h4 className="text-base font-medium">{selectedItem.title}</h4>
                    {selectedItem.story && (
                      <p className="text-xs text-neutral-400 mt-1 line-clamp-2">“{selectedItem.story}”</p>
                    )}
                  </div>
                  <audio
                    controls
                    autoPlay
                    className="w-full max-w-md mt-2"
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
                /* REAL HIGH-RES PHOTOGRAPH VIEWER */
                <img
                  src={selectedItem.mediaUrl}
                  alt={selectedItem.title}
                  className="size-full object-contain max-h-[60vh]"
                />
              )}
            </div>

            {/* Media Information & Story Details */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pt-1">
              <div className="flex flex-col gap-1.5 max-w-xl">
                <div className="flex items-baseline gap-2">
                  <h3 className="text-base sm:text-lg font-medium text-[#181925]">
                    {selectedItem.title}
                  </h3>
                  {selectedItem.year && (
                    <span className="text-xs font-mono text-[#888]">
                      {selectedItem.year}
                    </span>
                  )}
                  {(() => {
                    const dur =
                      videoDurations[selectedItem.id] ||
                      audioDurations[selectedItem.id] ||
                      (selectedItem.duration && selectedItem.duration !== "undefined"
                        ? selectedItem.duration
                        : null)
                    if (!dur) return null
                    return (
                      <span className="text-[11px] font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                        {dur}
                      </span>
                    )
                  })()}
                </div>

                {selectedItem.location && (
                  <div className="flex items-center gap-1.5 text-xs text-[#71717a]">
                    <MapPin className="size-3 text-[#999]" />
                    <span>{selectedItem.location}</span>
                  </div>
                )}

                {selectedItem.story && (
                  <p className="text-xs sm:text-sm text-[#444] leading-relaxed mt-1">
                    “{selectedItem.story}”
                  </p>
                )}

                {selectedItem.people && selectedItem.people.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap mt-2">
                    <span className="text-[11px] font-mono text-[#888]">Pictured:</span>
                    {selectedItem.people.map((p, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-full bg-[#f4f4f6] text-[#181925] text-[11px] font-medium"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* "Who is this?" Helper for Photos */}
              {selectedItem.hasUnknownPerson && (
                <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200/60 flex flex-col gap-2 shrink-0 sm:max-w-[210px]">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-amber-900">
                    <HelpCircle className="size-3.5 text-amber-600" />
                    <span>Can you help identify?</span>
                  </div>
                  <p className="text-[11px] text-amber-800 leading-snug">
                    Someone in this photograph is unknown. Help the family identify them.
                  </p>
                  {identifiedMap[selectedItem.id] ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700">
                      <Check className="size-3" />
                      <span>Note sent to family</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleIdentify(selectedItem.id)}
                      className="px-3 py-1.5 rounded-full bg-white hover:bg-amber-100/50 border border-amber-300 text-xs font-medium text-amber-900 transition-colors cursor-pointer"
                    >
                      I know who this is
                    </button>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </section>
  )
}
