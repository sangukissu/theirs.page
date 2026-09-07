"use client"

import { useMemorialActions } from "./memorial-shell"
import { MemorialGallery, type GalleryItem } from "./memorial-gallery"
import type { GalleryFilter, PagedCollection } from "@/types/memorial-view"
import type { ContributionSettings } from "@/types/theirs"
import type { MemorialAccessRole } from "@/lib/memorial-auth"

interface GalleryPageViewProps {
  slug: string
  fullName: string
  isDemo: boolean
  isPaid: boolean
  accessRole?: MemorialAccessRole | null
  contributionSettings?: ContributionSettings | null
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
  accessRole,
  contributionSettings,
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
      accessRole={accessRole}
      contributionSettings={contributionSettings}
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
