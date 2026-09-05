"use client"

import { useState } from "react"
import { Plus, Maximize2, X, HelpCircle, MapPin, Calendar, Tag, Check } from "lucide-react"
import { ContributionType } from "./contribute-modal"

export interface PhotoItem {
  id: string
  title: string
  year: string
  location?: string
  album: "Early Years" | "Family" | "Workshop" | "Travels"
  url: string
  aspectRatio: "portrait" | "landscape" | "square"
  people?: string[]
  hasUnknownPerson?: boolean
  story?: string
}

export const DEFAULT_PHOTOS: PhotoItem[] = [
  {
    id: "p1",
    title: "At the Watchmaker’s Bench",
    year: "1984",
    location: "High Street Workshop, Devon",
    album: "Workshop",
    url: "/memorial-family-portrait-grandfather.jpg",
    aspectRatio: "portrait",
    people: ["Robert Carter"],
    story: "Calibrating a 19th-century mahogany bracket clock for the village church.",
  },
  {
    id: "p2",
    title: "Wedding at St. Jude’s",
    year: "1974",
    location: "St. Jude’s Church, Oxford",
    album: "Early Years",
    url: "/historical-wedding-photo.webp",
    aspectRatio: "landscape",
    people: ["Robert Carter", "Meena Sharma"],
    story: "July 20th, 1974. Meena wearing a hand-embroidered silk sari and Robert in his first tailored suit.",
  },
  {
    id: "p3",
    title: "Three Generations in the Rose Garden",
    year: "1998",
    location: "Devon Cottage",
    album: "Family",
    url: "/memorial-family-portrait-combined.jpg",
    aspectRatio: "square",
    people: ["Robert Carter", "Anita Carter (baby)", "Meena Carter"],
    story: "First summer with Anita in the cottage garden. Robert built the wooden pram himself.",
  },
  {
    id: "p4",
    title: "Exeter Grammar School Cricket XI",
    year: "1960",
    location: "Exeter, Devon",
    album: "Early Years",
    url: "/old-school-photo.webp",
    aspectRatio: "landscape",
    people: ["Robert Carter", "Unknown boy on left"],
    hasUnknownPerson: true,
    story: "Robert sitting second from the right, front row. The boy holding the bat is unidentified.",
  },
  {
    id: "p5",
    title: "The High Street Storefront",
    year: "1988",
    location: "Devon High Street",
    album: "Workshop",
    url: "/vintage-family-portraits-colorized.webp",
    aspectRatio: "portrait",
    people: ["Robert Carter", "David Carter"],
    story: "Standing outside the freshly painted workshop window on the morning of their 5th anniversary.",
  },
  {
    id: "p6",
    title: "Walking the Moorland Trails",
    year: "2015",
    location: "Dartmoor National Park",
    album: "Travels",
    url: "/memorial-before.jpg",
    aspectRatio: "landscape",
    people: ["Robert Carter"],
    story: "With his hazel walking stick and binoculars, scanning for stonechats across the heather.",
  },
]

interface PhotoAlbumsProps {
  photos?: PhotoItem[]
  fullName?: string
  onOpenContribute: (type?: ContributionType) => void
}

export function PhotoAlbums({
  photos = DEFAULT_PHOTOS,
  fullName = "Robert Carter",
  onOpenContribute,
}: PhotoAlbumsProps) {
  const [activeAlbum, setActiveAlbum] = useState<string>("all")
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoItem | null>(null)
  const [identifiedMap, setIdentifiedMap] = useState<Record<string, boolean>>({})

  const firstName = fullName.split(" ")[0] || fullName

  const filteredPhotos = photos.filter((p) => {
    if (activeAlbum === "all") return true
    return p.album === activeAlbum
  })

  const handleIdentify = (photoId: string) => {
    setIdentifiedMap((prev) => ({ ...prev, [photoId]: true }))
  }

  return (
    <section id="photos" className="py-12 px-4 max-w-4xl mx-auto flex flex-col gap-4 scroll-mt-24">

      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-black/[0.06] pb-4">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-mono font-medium text-primary uppercase tracking-wider">
            Family Photo Archive
          </span>
          <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-[#181925]">
            {firstName} in photographs
          </h2>
          <p className="text-xs sm:text-sm text-[#71717a]">
            {photos.length} preserved photographs · 4 family albums
          </p>
        </div>

        <button
          type="button"
          onClick={() => onOpenContribute("photo")}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-medium transition-all self-start sm:self-auto cursor-pointer shadow-xs active:scale-95"
        >
          <Plus className="size-3.5" />
          <span>Add photographs</span>
        </button>
      </div>

      {/* Album Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 select-none">
        {["all", "Early Years", "Family", "Workshop", "Travels"].map((albumKey) => (
          <button
            key={albumKey}
            type="button"
            onClick={() => setActiveAlbum(albumKey)}
            className={`text-xs px-3.5 py-1.5 rounded-full font-medium transition-all cursor-pointer ${activeAlbum === albumKey
              ? "bg-primary text-primary-foreground shadow-2xs"
              : "bg-[#f4f4f6] text-[#666] hover:text-[#181925]"
              }`}
          >
            {albumKey === "all" ? "All photos" : albumKey}
          </button>
        ))}
      </div>

      {/* Asymmetric / Masonry Editorial Photo Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {filteredPhotos.map((photo) => (
          <div
            key={photo.id}
            onClick={() => setSelectedPhoto(photo)}
            className="group relative rounded-2xl overflow-hidden bg-white border border-black/[0.06] p-2 cursor-pointer transition-all hover:border-black/[0.14] flex flex-col gap-2.5"
          >
            {/* Image Container with Varied Ratios */}
            <div
              className={`rounded-xl overflow-hidden bg-neutral-100 relative ${photo.aspectRatio === "portrait"
                ? "aspect-[4/5]"
                : photo.aspectRatio === "square"
                  ? "aspect-square"
                  : "aspect-[3/2]"
                }`}
            >
              <img
                src={photo.url}
                alt={photo.title}
                className="size-full object-cover group-hover:scale-102 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                <Maximize2 className="size-5 drop-shadow-sm" />
              </div>

              {/* Unidentified Person Pill */}
              {photo.hasUnknownPerson && (
                <div className="absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/90 text-white text-[10px] font-medium backdrop-blur-xs shadow-xs">
                  <HelpCircle className="size-2.5" />
                  <span>Who is this?</span>
                </div>
              )}
            </div>

            {/* Human Editorial Captions */}
            <div className="px-1 pb-1 flex flex-col gap-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-[#181925] truncate">
                  {photo.title}
                </span>
                <span className="text-[11px] font-mono text-[#888] shrink-0">
                  {photo.year}
                </span>
              </div>
              {photo.location && (
                <span className="text-[11px] text-[#71717a] truncate">
                  {photo.location}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div
          onClick={() => setSelectedPhoto(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm p-4 sm:p-6 flex items-center justify-center select-none"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-3xl w-full bg-white rounded-3xl p-4 sm:p-6 flex flex-col gap-4 overflow-hidden shadow-2xl relative"
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 size-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-[#666] flex items-center justify-center transition-colors cursor-pointer z-10"
              aria-label="Close photo preview"
            >
              <X className="size-4" />
            </button>

            {/* High-Res Photo Container */}
            <div className="max-h-[60vh] rounded-2xl overflow-hidden bg-neutral-900 flex items-center justify-center">
              <img
                src={selectedPhoto.url}
                alt={selectedPhoto.title}
                className="size-full object-contain max-h-[60vh]"
              />
            </div>

            {/* Photo Details & "Who is this?" Family Helper */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pt-1">
              <div className="flex flex-col gap-1.5 max-w-xl">
                <div className="flex items-baseline gap-2">
                  <h3 className="text-base sm:text-lg font-medium text-[#181925]">
                    {selectedPhoto.title}
                  </h3>
                  <span className="text-xs font-mono text-[#888]">
                    {selectedPhoto.year}
                  </span>
                </div>

                {selectedPhoto.location && (
                  <div className="flex items-center gap-1.5 text-xs text-[#71717a]">
                    <MapPin className="size-3 text-[#999]" />
                    <span>{selectedPhoto.location}</span>
                  </div>
                )}

                {selectedPhoto.story && (
                  <p className="text-xs sm:text-sm text-[#444] leading-relaxed mt-1">
                    “{selectedPhoto.story}”
                  </p>
                )}

                {selectedPhoto.people && selectedPhoto.people.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap mt-2">
                    <span className="text-[11px] font-mono text-[#888]">Pictured:</span>
                    {selectedPhoto.people.map((person, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-full bg-[#f4f4f6] text-[#181925] text-[11px] font-medium"
                      >
                        {person}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* "Who is this?" Action for unidentified family members */}
              {selectedPhoto.hasUnknownPerson && (
                <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200/60 flex flex-col gap-2 shrink-0 sm:max-w-[210px]">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-amber-900">
                    <HelpCircle className="size-3.5 text-amber-600" />
                    <span>Can you help identify?</span>
                  </div>
                  <p className="text-[11px] text-amber-800 leading-snug">
                    Someone in this photograph is unknown. Help the family identify them.
                  </p>
                  {identifiedMap[selectedPhoto.id] ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700">
                      <Check className="size-3" />
                      <span>Note sent to family</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleIdentify(selectedPhoto.id)}
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
