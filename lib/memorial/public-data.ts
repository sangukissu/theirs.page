import "server-only"

import { cache } from "react"
import type { SupabaseClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"
import { createClient } from "@/utils/supabase/server"
import { getSupabaseAdminSafe } from "@/utils/supabase/admin"
import { resolveMediaUrl } from "@/lib/r2"
import { RESERVED_MEMORIAL_SLUGS } from "@/lib/memorial-slug"
import type { GalleryItem } from "@/components/memorial/memorial-gallery"
import type { TimelineMilestone } from "@/components/memorial/life-timeline"
import type { StoryItem } from "@/components/memorial/life-stories"
import type { MemoryItem } from "@/components/memorial/memories-stream"
import type {
  BrowseCollection,
  GalleryFacets,
  GalleryFilter,
  MemorialHomeData,
  MemorialIdentity,
  PagedCollection,
} from "@/types/memorial-view"
import type { SectionSettings } from "@/types/theirs"
import { getMemorialPinCookieName, verifyPinAccessToken } from "@/lib/security/pin"

const DEFAULT_SECTIONS: Required<SectionSettings> = {
  story: true,
  tributes: true,
  timeline: true,
  gallery: true,
  stories: true,
}

export const COLLECTION_PAGE_SIZES: Record<BrowseCollection, number> = {
  gallery: 24,
  memories: 6,
  timeline: 20,
  tributes: 12,
}

const DEMO_GALLERY: GalleryItem[] = [
  { id: "g1", title: "At the Watchmaker’s Bench", mediaType: "photo", year: "1984", location: "High Street Workshop, Devon", album: "Workshop", isPinned: true, mediaUrl: "/memorial-family-portrait-grandfather.jpg", aspectRatio: "portrait", story: "Calibrating a 19th-century bracket clock for the village church.", addedBy: "Anita Carter" },
  { id: "g4", title: "Tea in the Rose Garden", mediaType: "video", year: "1989", location: "Dartmoor Cottage", album: "Family Films", mediaUrl: "/videos/speaking.mp4", posterUrl: "/memorial-family-portrait-combined.jpg", aspectRatio: "landscape", duration: "0:12", story: "A digitized family film from a summer afternoon.", addedBy: "Anita Carter" },
  { id: "g3", title: "Checking Tyre Pressure Voicemail", mediaType: "audio", year: "2014", location: "Devon Cottage", album: "Recordings", mediaUrl: "/music/Beloved(chosic.com).mp3", duration: "0:24", story: "A voicemail left before Anita drove back to London.", addedBy: "Anita Carter" },
  { id: "g2", title: "Wedding at St. Jude’s", mediaType: "photo", year: "1974", location: "St. Jude’s Church, Oxford", album: "Family", mediaUrl: "/historical-wedding-photo.webp", aspectRatio: "landscape", story: "Meena and Robert on their wedding day.", addedBy: "Meena Carter" },
  { id: "g8", title: "Quiet Moment in the Workshop", mediaType: "video", year: "1995", location: "High Street Workshop", album: "Workshop", mediaUrl: "/videos/gentle-smile.mp4", posterUrl: "/vintage-family-portraits-colorized.webp", aspectRatio: "portrait", duration: "0:08", addedBy: "Sarah Jenkins" },
  { id: "g5", title: "Three Generations in the Rose Garden", mediaType: "photo", year: "1998", location: "Devon Cottage", album: "Family", mediaUrl: "/memorial-family-portrait-combined.jpg", aspectRatio: "square", addedBy: "Meena Carter" },
  { id: "g7", title: "The Morris Minor Trip", mediaType: "audio", year: "2019", location: "Carter Workshop", album: "Recordings", mediaUrl: "/music/Awakening-Dew(chosic.com).mp3", duration: "0:36", story: "Robert remembering a foggy drive across the moors.", addedBy: "Sarah Jenkins" },
  { id: "g10", title: "Sunday Afternoon on Dartmoor", mediaType: "video", year: "2016", location: "Dartmoor National Park", album: "Family Films", mediaUrl: "/videos/warm-gaze.mp4", posterUrl: "/memorial-before.jpg", aspectRatio: "landscape", duration: "0:06", addedBy: "Anita Carter" },
  { id: "g6", title: "Exeter Grammar School Cricket XI", mediaType: "photo", year: "1960", location: "Exeter, Devon", album: "Early Years", mediaUrl: "/old-school-photo.webp", aspectRatio: "landscape", hasUnknownPerson: true, addedBy: "Anita Carter" },
]

const DEMO_TIMELINE: TimelineMilestone[] = [
  { year: 1948, chapter: "Chapter I", title: "Born in Exeter, Devon", description: "Born in autumn, the younger of two sons raised on the edge of the Devon moors.", location: "Exeter, Devon" },
  { year: 1968, chapter: "Chapter II", title: "Horological Apprenticeship in London", description: "Moved to Clerkenwell to study under master watchmakers.", location: "Clerkenwell, London", photoUrl: "/old-school-photo.webp" },
  { year: 1974, chapter: "Chapter III", title: "Married Meena at St. Jude’s", description: "They bought a small stone cottage near Dartmoor and began their life together.", location: "St. Jude’s Church", photoUrl: "/historical-wedding-photo.webp" },
  { year: 1983, chapter: "Chapter IV", title: "Founded Carter Clocks & Woodworking", description: "Opened his independent workshop on the high street.", location: "Devon High Street" },
  { year: 2004, chapter: "Chapter V", title: "Welcomed Granddaughter Anita", description: "Spent weekends teaching her about birds, ponies, and woodworking.", location: "Devon Cottage", photoUrl: "/memorial-family-portrait-combined.jpg" },
  { year: 2018, chapter: "Chapter VI", title: "Retirement & The Rose Garden", description: "Handed over the workshop keys and tended his heritage roses.", location: "Dartmoor Cottage" },
  { year: 2024, chapter: "Chapter VII", title: "A life remembered", description: "Robert died peacefully at home with his family beside him.", location: "Dartmoor, Devon" },
]

const DEMO_STORIES: StoryItem[] = [
  { id: "story-1", authorName: "Anita Carter", authorRelationship: "Daughter", dateOrYear: "1994", chronologicalYear: 1994, location: "London, UK", story: "Dad couldn’t walk past a broken appliance without trying to repair it. Once he spent half of Christmas Day fixing Mrs. Higgins’ washing machine while everyone was waiting for dinner.", photoUrl: "/historical-wedding-photo.webp", createdAt: "2024-04-08T10:00:00.000Z" },
  { id: "story-2", authorName: "Sarah Jenkins", authorRelationship: "Senior Apprentice", dateOrYear: "1998", chronologicalYear: 1998, location: "Carter Workshop", story: "Thirty years at the bench and I never once heard him raise his voice. Whenever an apprentice broke a delicate clock spring, Bob would pour a fresh cup of tea and call it learning.", createdAt: "2024-04-07T10:00:00.000Z" },
  { id: "story-3", authorName: "Rahul Carter", authorRelationship: "Grandson", dateOrYear: "2012", chronologicalYear: 2012, location: "Back Porch, Devon", story: "He spent three months carving a miniature wooden chess set for my tenth birthday. I still keep the King in my desk drawer at university.", createdAt: "2024-04-06T10:00:00.000Z" },
]

const DEMO_TRIBUTES: MemoryItem[] = [
  { id: "m1", authorName: "Meena Carter", authorRelationship: "Wife of 50 years", dateOrYear: "Yesterday", location: "Devon Cottage", story: "A blossom in memory of my dearest Bob. For fifty years you brought warmth, laughter, and calm into our home.", tributeType: "flower", createdAt: "2024-04-08T12:00:00.000Z" },
  { id: "m2", authorName: "David Carter", authorRelationship: "Older Brother", dateOrYear: "2 days ago", story: "Lighting a candle for my little brother Bob. Your gentle spirit and steady hands will never be forgotten.", tributeType: "candle", createdAt: "2024-04-07T12:00:00.000Z" },
  { id: "m3", authorName: "Thomas Bradley", authorRelationship: "Lifelong Friend", dateOrYear: "3 days ago", story: "Rest peacefully, old friend, among the heather and the bees.", tributeType: "flower", createdAt: "2024-04-06T12:00:00.000Z" },
  { id: "m4", authorName: "Eleanor Vance", authorRelationship: "Family Neighbour", dateOrYear: "5 days ago", story: "Robert’s kindness and warmth touched everyone who walked down our lane.", tributeType: "note", createdAt: "2024-04-04T12:00:00.000Z" },
]

type MemorialRow = Record<string, any>

export interface MemorialViewContext {
  identity: MemorialIdentity
  memorial: MemorialRow | null
  db: SupabaseClient | null
  requiresPin: boolean
  canSeeFamilyOnly: boolean
}

function displayDate(value?: string | null) {
  if (!value) return ""
  const date = new Date(value)
  const diffHours = Math.floor((Date.now() - date.getTime()) / 3_600_000)
  const diffDays = Math.floor(diffHours / 24)
  if (diffHours < 1) return "Just now"
  if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? "hour" : "hours"} ago`
  if (diffDays === 1) return "Yesterday"
  if (diffDays < 7) return `${diffDays} days ago`
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

function mapMedia(row: MemorialRow, publicDelivery = false): GalleryItem {
  return {
    id: row.id,
    title: row.caption || (row.media_type === "video" ? "Video Clip" : row.media_type === "audio" ? "Voice Note" : "Photograph"),
    mediaType: row.media_type === "image" ? "photo" : row.media_type,
    year: row.approx_year ? String(row.approx_year) : "",
    location: row.location || undefined,
    album: row.album || undefined,
    isPinned: Boolean(row.is_pinned),
    mediaUrl: resolveMediaUrl(row.url, { publicDelivery }),
    posterUrl: row.poster_url ? resolveMediaUrl(row.poster_url, { publicDelivery }) : undefined,
    addedBy: row.uploaded_by || undefined,
    people: row.tagged_people ? row.tagged_people.split(",").map((item: string) => item.trim()).filter(Boolean) : undefined,
  }
}

export async function loadGalleryItem(context: MemorialViewContext, mediaId?: string): Promise<GalleryItem | null> {
  if (!mediaId || context.requiresPin) return null
  if (context.identity.isDemo) return DEMO_GALLERY.find((item) => item.id === mediaId) || null
  if (!context.db || !context.memorial?.id) return null
  const result = await context.db.from("media_items").select("*").eq("memorial_id", context.memorial.id).eq("id", mediaId).maybeSingle()
  const publicDelivery = context.memorial?.status === "published" && context.memorial?.privacy !== "private"
  return result.data ? mapMedia(result.data, publicDelivery) : null
}

function mapStory(row: MemorialRow, publicDelivery = false): StoryItem {
  const rawUrls = Array.isArray(row.photo_urls) && row.photo_urls.length ? row.photo_urls : row.photo_url ? [row.photo_url] : []
  const photoUrls = rawUrls.map((url: string) => resolveMediaUrl(url, { publicDelivery }))
  return {
    id: row.id,
    authorName: row.author_name,
    authorRelationship: row.author_relationship || "",
    dateOrYear: row.approx_year ? String(row.approx_year) : displayDate(row.created_at),
    chronologicalYear: row.approx_year || undefined,
    location: row.location || undefined,
    story: row.story,
    photoUrl: photoUrls[0],
    photoUrls: photoUrls.length ? photoUrls : undefined,
    createdAt: row.created_at,
  }
}

function mapTribute(row: MemorialRow): MemoryItem {
  return {
    id: row.id,
    authorName: row.author_name,
    authorRelationship: row.author_relationship || "",
    dateOrYear: displayDate(row.created_at),
    chronologicalYear: row.approx_year || undefined,
    location: row.location || undefined,
    story: row.story,
    tributeType: row.tribute_type || "note",
    createdAt: row.created_at,
  }
}

function mapTimeline(row: MemorialRow, publicDelivery = false): TimelineMilestone {
  return {
    year: row.year,
    chapter: `Year ${row.year}`,
    title: row.title,
    description: row.description || "",
    location: row.location || undefined,
    photoUrl: row.photo_url ? resolveMediaUrl(row.photo_url, { publicDelivery }) : undefined,
  }
}

export const getMemorialViewContext = cache(async (slug: string): Promise<MemorialViewContext | null> => {
  if (RESERVED_MEMORIAL_SLUGS.has(slug.toLowerCase())) return null
  const isDemo = slug === "robert-carter"
  const serverClient = await createClient()
  const { data: { user } } = await serverClient.auth.getUser().catch(() => ({ data: { user: null } }))
  let memorial: MemorialRow | null = null
  let db: SupabaseClient | null = null
  const admin = getSupabaseAdminSafe()

  if (admin) {
    const result = await admin.from("memorials").select("*").eq("slug", slug).maybeSingle()
    if (result.data) {
      memorial = result.data
      db = admin
    }
  }
  if (!memorial) {
    const result = await serverClient.from("memorials").select("*").eq("slug", slug).maybeSingle()
    if (result.data) {
      memorial = result.data
      db = serverClient
    }
  }
  if (!memorial && !isDemo) return null

  const isOwner = Boolean(user?.id && memorial?.owner_id === user.id)
  if (memorial && memorial.status !== "published" && !isOwner) return null

  const cookieStore = await cookies()
  const pinUnlocked = Boolean(
    memorial?.privacy === "private" &&
      verifyPinAccessToken(
        cookieStore.get(getMemorialPinCookieName(slug))?.value,
        memorial.id,
        memorial.access_pin_hash
      )
  )
  const requiresPin = Boolean(memorial?.privacy === "private" && !isOwner && !pinUnlocked)
  const sections = { ...DEFAULT_SECTIONS, ...(memorial?.section_settings || {}) }
  let photoCount = DEMO_GALLERY.filter((item) => item.mediaType === "photo").length
  if (memorial && db) {
    const result = await db.from("media_items").select("id", { count: "exact", head: true }).eq("memorial_id", memorial.id).eq("media_type", "image")
    photoCount = result.count || 0
  }

  return {
    memorial,
    db,
    requiresPin,
    canSeeFamilyOnly: Boolean(isOwner || pinUnlocked),
    identity: {
      id: memorial?.id,
      slug,
      fullName: memorial?.full_name || "Robert Edward Carter",
      preferredName: memorial?.preferred_name || (isDemo ? "Bob" : null),
      birthYear: memorial?.birth_year || (isDemo ? 1948 : null),
      deathYear: memorial?.death_year || (isDemo ? 2024 : null),
      location: memorial?.location || (isDemo ? "Devon, England" : null),
      epitaph: memorial?.headline || (isDemo ? "Watchmaker, master woodworker, and an unhurried listener. Built grandfather clocks by day, fixed bicycles for neighborhood children by evening." : null),
      biography: memorial?.biography || null,
      portraitUrl: memorial?.portrait_photo_url
        ? resolveMediaUrl(memorial.portrait_photo_url, {
            publicDelivery: memorial.status === "published" && memorial.privacy !== "private",
          })
        : "/memorial-family-portrait-grandfather.jpg",
      isDemo,
      isPaid: isDemo || Boolean(memorial?.is_paid),
      isOwner,
      status: memorial?.status,
      privacy: memorial?.privacy,
      sectionSettings: sections,
      contributionSettings: memorial?.contribution_settings || null,
      photoCount,
    },
  }
})

interface CursorState {
  snapshot: string
  offset?: number
}

function encodeCursor(state: CursorState | null) {
  return state ? Buffer.from(JSON.stringify(state)).toString("base64url") : null
}

function decodeCursor(cursor?: string | null): CursorState {
  if (!cursor) return { snapshot: new Date().toISOString(), offset: 0 }
  try {
    const parsed = JSON.parse(Buffer.from(cursor, "base64url").toString("utf8")) as CursorState
    return {
      snapshot: typeof parsed.snapshot === "string" ? parsed.snapshot : new Date().toISOString(),
      offset: Math.max(0, Math.min(Number(parsed.offset) || 0, 10_000)),
    }
  } catch {
    return { snapshot: new Date().toISOString(), offset: 0 }
  }
}

function demoPage<T>(items: T[], cursor: CursorState, pageSize: number): PagedCollection<T> {
  const offset = cursor.offset || 0
  const pageItems = items.slice(offset, offset + pageSize)
  const nextOffset = offset + pageItems.length
  return {
    items: pageItems,
    total: items.length,
    hasMore: nextOffset < items.length,
    nextCursor: nextOffset < items.length ? encodeCursor({ ...cursor, offset: nextOffset }) : null,
  }
}

export interface BrowseOptions {
  cursor?: string | null
  filter?: GalleryFilter
  album?: string
  decade?: number
  pageSize?: number
}

export async function loadBrowsePage<T>(context: MemorialViewContext, collection: BrowseCollection, options: BrowseOptions = {}): Promise<PagedCollection<T>> {
  const cursor = decodeCursor(options.cursor)
  const pageSize = Math.max(1, Math.min(options.pageSize || COLLECTION_PAGE_SIZES[collection], COLLECTION_PAGE_SIZES[collection]))

  if (context.identity.isDemo) {
    if (collection === "gallery") {
      const filter = options.filter || "all"
      const albums = Array.from(new Set(DEMO_GALLERY.map((item) => item.album).filter(Boolean))) as string[]
      const filtered = DEMO_GALLERY.filter((item) => (filter === "all" || item.mediaType === filter) && (!options.album || options.album === "all" || item.album === options.album))
      return { ...demoPage(filtered, cursor, pageSize), facets: { all: DEMO_GALLERY.length, photo: DEMO_GALLERY.filter((item) => item.mediaType === "photo").length, audio: DEMO_GALLERY.filter((item) => item.mediaType === "audio").length, video: DEMO_GALLERY.filter((item) => item.mediaType === "video").length, albums } } as PagedCollection<T>
    }
    if (collection === "memories") return demoPage(DEMO_STORIES, cursor, pageSize) as PagedCollection<T>
    if (collection === "tributes") return demoPage(DEMO_TRIBUTES, cursor, pageSize) as PagedCollection<T>
    const timeline = options.decade ? DEMO_TIMELINE.filter((item) => Math.floor(item.year / 10) * 10 === options.decade) : DEMO_TIMELINE
    return demoPage(timeline, cursor, pageSize) as PagedCollection<T>
  }

  const db = context.db
  const memorialId = context.memorial?.id
  if (!db || !memorialId || context.requiresPin) return { items: [], total: 0, hasMore: false, nextCursor: null }
  const publicDelivery = context.memorial?.status === "published" && context.memorial?.privacy !== "private"

  if (collection === "gallery") {
    const offset = cursor.offset || 0
    const filter = options.filter || "all"
    const applyFilters = (query: any) => {
      let next = query.eq("memorial_id", memorialId).lte("created_at", cursor.snapshot)
      if (filter !== "all") next = next.eq("media_type", filter === "photo" ? "image" : filter)
      if (options.album && options.album !== "all") next = next.eq("album", options.album)
      return next
    }
    let query = applyFilters(db.from("media_items").select("*", { count: "exact" }))
      .order("is_pinned", { ascending: false })
      .order("order_index", { ascending: true })
      .order("created_at", { ascending: true })
      .order("id", { ascending: true })
      .range(offset, offset + pageSize - 1)
    const result = await query
    const items = (result.data || []).map((row: MemorialRow) => mapMedia(row, publicDelivery))
    const total = result.count || 0
    const nextOffset = offset + items.length
    let facets: GalleryFacets | undefined
    if (offset === 0) {
      const countType = (mediaType?: string) => {
        let countQuery = db.from("media_items").select("id", { count: "exact", head: true }).eq("memorial_id", memorialId).lte("created_at", cursor.snapshot)
        if (mediaType) countQuery = countQuery.eq("media_type", mediaType)
        return countQuery
      }
      const [allResult, photoResult, audioResult, videoResult, albumResult] = await Promise.all([
        countType(), countType("image"), countType("audio"), countType("video"),
        db.from("media_items").select("album").eq("memorial_id", memorialId).lte("created_at", cursor.snapshot).not("album", "is", null),
      ])
      facets = {
        all: allResult.count || 0,
        photo: photoResult.count || 0,
        audio: audioResult.count || 0,
        video: videoResult.count || 0,
        albums: Array.from(new Set((albumResult.data || []).map((row: any) => row.album?.trim()).filter(Boolean))) as string[],
      }
    }
    return { items, total, hasMore: nextOffset < total, nextCursor: nextOffset < total ? encodeCursor({ ...cursor, offset: nextOffset }) : null, facets } as PagedCollection<T>
  }

  if (collection === "memories") {
    const offset = cursor.offset || 0
    let query = db.from("memories").select("*", { count: "exact" })
      .eq("memorial_id", memorialId).eq("status", "approved").eq("contribution_type", "story")
      .lte("created_at", cursor.snapshot).order("created_at", { ascending: false }).order("id", { ascending: false })
      .range(offset, offset + pageSize - 1)
    if (!context.canSeeFamilyOnly) query = query.eq("visibility", "everyone")
    const result = await query
    const items = (result.data || []).map((row: MemorialRow) => mapStory(row, publicDelivery))
    const total = result.count || 0
    const nextOffset = offset + items.length
    return { items, total, hasMore: nextOffset < total, nextCursor: nextOffset < total ? encodeCursor({ ...cursor, offset: nextOffset }) : null } as PagedCollection<T>
  }

  if (collection === "timeline") {
    const offset = cursor.offset || 0
    let query = db.from("timeline_events").select("*", { count: "exact" }).eq("memorial_id", memorialId).lte("created_at", cursor.snapshot)
    if (options.decade) query = query.gte("year", options.decade).lt("year", options.decade + 10)
    const result = await query.order("year", { ascending: true }).order("order_index", { ascending: true }).order("id", { ascending: true }).range(offset, offset + pageSize - 1)
    const items = (result.data || []).map((row: MemorialRow) => mapTimeline(row, publicDelivery))
    const total = result.count || 0
    const nextOffset = offset + items.length
    return { items, total, hasMore: nextOffset < total, nextCursor: nextOffset < total ? encodeCursor({ ...cursor, offset: nextOffset }) : null } as PagedCollection<T>
  }

  const offset = cursor.offset || 0
  let memoryQuery = db.from("memories").select("*", { count: "exact" })
    .eq("memorial_id", memorialId).eq("status", "approved").eq("contribution_type", "tribute")
    .lte("created_at", cursor.snapshot).order("created_at", { ascending: false }).order("id", { ascending: false })
    .range(offset, offset + pageSize - 1)
  if (!context.canSeeFamilyOnly) memoryQuery = memoryQuery.eq("visibility", "everyone")
  const memoryResult = await memoryQuery
  const items = (memoryResult.data || []).map(mapTribute)
  const total = memoryResult.count || 0
  const nextOffset = offset + items.length
  return {
    items,
    total,
    hasMore: nextOffset < total,
    nextCursor: nextOffset < total ? encodeCursor({ snapshot: cursor.snapshot, offset: nextOffset }) : null,
  } as PagedCollection<T>
}

export async function loadMemorialHome(context: MemorialViewContext): Promise<MemorialHomeData> {
  const sections = context.identity.sectionSettings
  const empty = <T,>(): PagedCollection<T> => ({ items: [], total: 0, hasMore: false, nextCursor: null })
  const [media, memories, timeline, tributes] = await Promise.all([
    sections.gallery === false ? empty<GalleryItem>() : loadBrowsePage<GalleryItem>(context, "gallery", { pageSize: 6 }),
    sections.stories === false ? empty<StoryItem>() : loadBrowsePage<StoryItem>(context, "memories", { pageSize: 2 }),
    sections.timeline === false ? empty<TimelineMilestone>() : loadBrowsePage<TimelineMilestone>(context, "timeline", { pageSize: context.identity.isDemo ? 3 : 5 }),
    sections.tributes === false ? empty<MemoryItem>() : loadBrowsePage<MemoryItem>(context, "tributes", { pageSize: 2 }),
  ])
  return { media, memories, timeline, tributes }
}

export async function loadTimelineDecades(context: MemorialViewContext): Promise<number[]> {
  if (context.identity.isDemo) return Array.from(new Set(DEMO_TIMELINE.map((item) => Math.floor(item.year / 10) * 10)))
  if (!context.db || !context.memorial?.id || context.requiresPin) return []
  const result = await context.db.from("timeline_events").select("year").eq("memorial_id", context.memorial.id).order("year", { ascending: true })
  return Array.from(new Set((result.data || []).map((row: any) => Math.floor(row.year / 10) * 10)))
}
