import type { GalleryItem } from "@/components/memorial/memorial-gallery"
import type { TimelineMilestone } from "@/components/memorial/life-timeline"
import type { StoryItem } from "@/components/memorial/life-stories"
import type { MemoryItem } from "@/components/memorial/memories-stream"
import type { SectionSettings, ContributionSettings } from "@/types/theirs"

export type MemorialView = "home" | "timeline" | "memories" | "gallery" | "tributes"
export type BrowseCollection = "gallery" | "memories" | "timeline" | "tributes"
export type GalleryFilter = "all" | "photo" | "audio" | "video"

export interface MemorialIdentity {
  id?: string
  slug: string
  fullName: string
  preferredName?: string | null
  birthYear?: number | null
  deathYear?: number | null
  location?: string | null
  epitaph?: string | null
  biography?: string | null
  portraitUrl?: string | null
  isDemo: boolean
  isPaid: boolean
  isOwner: boolean
  status?: string
  privacy?: string
  sectionSettings: SectionSettings
  contributionSettings?: ContributionSettings | null
  photoCount: number
}

export interface GalleryFacets {
  all: number
  photo: number
  audio: number
  video: number
  albums: string[]
}

export interface PagedCollection<T> {
  items: T[]
  total: number
  hasMore: boolean
  nextCursor: string | null
  facets?: GalleryFacets
}

export interface MemorialHomeData {
  media: PagedCollection<GalleryItem>
  memories: PagedCollection<StoryItem>
  timeline: PagedCollection<TimelineMilestone>
  tributes: PagedCollection<MemoryItem>
}
