"use client"

import { useState } from "react"
import { ImageIcon, Maximize2 } from "lucide-react"

export interface PhotoItem {
  id: string
  title: string
  year: string
  format: string
  url: string
  album: string
}

const DEFAULT_PHOTOS: PhotoItem[] = [
  {
    id: "p1",
    title: "At the Watchmaker’s Bench",
    year: "1984",
    format: "35mm Film Scan · RAW 4K",
    url: "/memorial-family-portrait-grandfather.jpg",
    album: "Workshop",
  },
  {
    id: "p2",
    title: "Wedding at St. Jude’s",
    year: "1974",
    format: "Silver Halide Print · 6000×4000 TIFF",
    url: "/historical-wedding-photo.webp",
    album: "Early Years",
  },
  {
    id: "p3",
    title: "Three Generations in the Garden",
    year: "1998",
    format: "Original Negative · 4032×3024 RAW",
    url: "/memorial-family-portrait-combined.jpg",
    album: "Family",
  },
  {
    id: "p4",
    title: "Exeter Grammar School",
    year: "1960",
    format: "Archival Print · 24-bit Scan",
    url: "/old-school-photo.webp",
    album: "Early Years",
  },
  {
    id: "p5",
    title: "The Devon High Street Storefront",
    year: "1988",
    format: "Kodak Ektachrome · RAW 4K",
    url: "/vintage-family-portraits-colorized.webp",
    album: "Workshop",
  },
  {
    id: "p6",
    title: "Summer on the Moors",
    year: "2015",
    format: "Digital Leica · Uncompressed",
    url: "/memorial-before.jpg",
    album: "Family",
  },
]

export function PhotoAlbums() {
  const [activeAlbum, setActiveAlbum] = useState<string>("all")
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoItem | null>(null)

  const filteredPhotos = DEFAULT_PHOTOS.filter((p) => {
    if (activeAlbum === "all") return true
    return p.album === activeAlbum
  })

  return (
    <section id="photos" className="py-12 sm:py-16 px-4 max-w-4xl mx-auto">
      <div className="flex flex-col gap-8">
        
        {/* Header & Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-black/[0.06] pb-6">
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-mono font-medium text-primary uppercase tracking-wider">
              High-Fidelity Preservation
            </span>
            <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-[#181925]">
              Photographs & Family Albums
            </h2>
            <p className="text-xs sm:text-sm text-[#666]">
              All photos are preserved permanently in original uncompressed resolution.
            </p>
          </div>

          <div className="flex items-center gap-1.5 p-1 rounded-full bg-[#f7f7f8] border border-black/[0.04] self-start sm:self-auto select-none">
            {["all", "Early Years", "Workshop", "Family"].map((albumKey) => (
              <button
                key={albumKey}
                type="button"
                onClick={() => setActiveAlbum(albumKey)}
                className={`text-xs px-3 py-1 rounded-full font-medium transition-colors cursor-pointer capitalize ${
                  activeAlbum === albumKey
                    ? "bg-white text-[#181925] shadow-2xs"
                    : "text-[#666] hover:text-[#181925]"
                }`}
              >
                {albumKey === "all" ? "All Photos" : albumKey}
              </button>
            ))}
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredPhotos.map((photo) => (
            <div
              key={photo.id}
              onClick={() => setSelectedPhoto(photo)}
              className="group relative rounded-2xl overflow-hidden bg-white border border-black/[0.06] p-1.5 cursor-pointer transition-all hover:border-black/[0.12]"
            >
              <div className="aspect-4/3 rounded-xl overflow-hidden bg-neutral-100 relative">
                <img
                  src={photo.url}
                  alt={photo.title}
                  className="size-full object-cover grayscale group-hover:scale-102 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                  <Maximize2 className="size-5" />
                </div>
              </div>

              <div className="p-2 flex flex-col gap-0.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#181925] truncate">
                    {photo.title}
                  </span>
                  <span className="text-[10px] font-mono text-[#888] shrink-0">
                    {photo.year}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-[#888] truncate">
                  {photo.format}
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Lightbox Preview */}
      {selectedPhoto && (
        <div
          onClick={() => setSelectedPhoto(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm p-4 flex items-center justify-center cursor-pointer select-none"
        >
          <div className="max-w-2xl w-full bg-white rounded-3xl p-3 flex flex-col gap-3 overflow-hidden shadow-2xl">
            <div className="aspect-4/3 rounded-2xl overflow-hidden bg-neutral-900">
              <img
                src={selectedPhoto.url}
                alt={selectedPhoto.title}
                className="size-full object-contain"
              />
            </div>
            <div className="px-2 pb-2 flex items-center justify-between text-xs">
              <div className="flex flex-col">
                <span className="font-medium text-[#181925]">{selectedPhoto.title}</span>
                <span className="text-[10px] text-[#888] font-mono">{selectedPhoto.format}</span>
              </div>
              <span className="text-xs text-[#888]">Click anywhere to close</span>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
