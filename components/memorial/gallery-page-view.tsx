"use client"

import { useMemorialActions } from "./memorial-shell"
import { MemorialGallery, type GalleryItem } from "./memorial-gallery"
import type { GalleryFilter, PagedCollection } from "@/types/memorial-view"

interface GalleryPageViewProps {
  slug: string
  fullName: string
  isDemo: boolean
  isPaid: boolean
  initial: PagedCollection<GalleryItem>
  initialFilter: GalleryFilter
  initialAlbum: string
  initialMediaId?: string
  initialSelectedItem?: GalleryItem | null
}

export function GalleryPageView({
  slug,
  fullName,
  isDemo,
  isPaid,
  initial,
  initialFilter,
  initialAlbum,
  initialMediaId,
  initialSelectedItem,
}: GalleryPageViewProps) {
  const { openContribute } = useMemorialActions()
  return (
    <MemorialGallery
      fullName={fullName}
      items={initial.items}
      isDemo={isDemo}
      isPaid={isPaid}
      onOpenContribute={openContribute}
      browseSlug={slug}
      initialPage={initial}
      initialFilter={initialFilter}
      initialAlbum={initialAlbum}
      initialMediaId={initialMediaId}
      initialSelectedItem={initialSelectedItem}
    />
  )
}
