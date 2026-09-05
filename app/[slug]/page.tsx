import { Metadata } from "next"
import { notFound } from "next/navigation"
import { cookies } from "next/headers"
import { supabaseAdmin } from "@/utils/supabase/admin"
import { createClient } from "@/utils/supabase/server"
import { MemorialClientView, MemorialData } from "./memorial-client-view"
import { MemorialPinGate } from "@/components/memorial/memorial-pin-gate"
import { resolveMediaUrl } from "@/lib/r2"

interface MemorialPageProps {
  params: Promise<{
    slug: string
  }>
  searchParams?: Promise<{
    preview?: string
  }>
}

export async function generateMetadata({ params }: MemorialPageProps): Promise<Metadata> {
  const { slug } = await params

  try {
    let memorial: any = null
    try {
      const res = await supabaseAdmin
        .from("memorials")
        .select("full_name, headline, portrait_photo_url, privacy")
        .eq("slug", slug)
        .maybeSingle()
      memorial = res.data
    } catch {
      const supabase = await createClient()
      const res = await supabase
        .from("memorials")
        .select("full_name, headline, portrait_photo_url, privacy")
        .eq("slug", slug)
        .maybeSingle()
      memorial = res.data
    }

    if (memorial) {
      if (memorial.privacy === "private") {
        return {
          title: "Private Memorial | Theirs",
          description: "A quiet, private memorial protected by the family.",
          robots: { index: false, follow: false },
          openGraph: {
            title: "Private Memorial | Theirs",
            description: "A quiet, private memorial protected by the family.",
            url: `https://theirs.page/${slug}`,
          },
        }
      }

      const title = `${memorial.full_name} — In Loving Memory | Theirs`
      const description = memorial.headline || `A quiet, permanent place dedicated to the memory and story of ${memorial.full_name}.`

      return {
        title,
        description,
        robots: memorial.privacy === "unlisted"
          ? { index: false, follow: false }
          : { index: true, follow: true },
        openGraph: {
          title,
          description,
          url: `https://theirs.page/${slug}`,
          images: memorial.portrait_photo_url ? [{ url: memorial.portrait_photo_url }] : undefined,
        },
      }
    }
  } catch (e) {
    // Graceful fallback
  }

  return {
    title: "Memorial | Theirs",
    description: "A quiet, permanent place on the internet dedicated to a human life.",
    robots: { index: false, follow: false },
  }
}

export default async function MemorialPage({ params, searchParams }: MemorialPageProps) {
  const { slug } = await params
  const resolvedSearchParams = searchParams ? await searchParams : {}
  const isVisitorPreview = resolvedSearchParams?.preview === "visitor"

  // Reserved top-level slugs that should not match as a memorial
  const reservedSlugs = [
    "admin",
    "api",
    "auth",
    "dashboard",
    "error",
    "family-memory-book",
    "login",
    "m",
    "privacy",
    "terms",
    "robots.txt",
    "sitemap.xml",
  ]

  if (reservedSlugs.includes(slug.toLowerCase())) {
    notFound()
  }

  const isDemo = slug === "robert-carter"

  // 1. Check current visitor session
  let currentUserId: string | null = null
  let serverSupabase: any = null
  try {
    serverSupabase = await createClient()
    const { data: { user } } = await serverSupabase.auth.getUser()
    currentUserId = user?.id || null
  } catch {}

  // 2. Resilient Database Query (attempts admin first, falls back to server client)
  let dbMemorial: any = null
  let activeClient: any = null
  let mediaItems: any[] = []
  let timelineEvents: any[] = []
  let memories: any[] = []
  let tributes: any[] = []
  let stories: any[] = []

  try {
    const { data: memorial } = await supabaseAdmin
      .from("memorials")
      .select("*")
      .eq("slug", slug)
      .maybeSingle()

    if (memorial) {
      dbMemorial = memorial
      activeClient = supabaseAdmin
    }
  } catch (err) {
    // Admin query failed or secret key is absent in host env
  }

  if (!dbMemorial && serverSupabase) {
    try {
      const { data: memorial } = await serverSupabase
        .from("memorials")
        .select("*")
        .eq("slug", slug)
        .maybeSingle()

      if (memorial) {
        dbMemorial = memorial
        activeClient = serverSupabase
      }
    } catch (err) {
      console.error("Server client memorial fetch error:", err)
    }
  }

  // 3. If not found in database and not the curated demo slug, 404
  if (!dbMemorial && !isDemo) {
    notFound()
  }

  const isOwner = currentUserId && dbMemorial && currentUserId === dbMemorial.owner_id

  // 4. Draft check: If memorial is in draft, only the owner can preview it
  if (dbMemorial && dbMemorial.status === "draft" && !isOwner) {
    notFound()
  }

  // 5. Fetch related collections using whichever client succeeded
  if (dbMemorial && activeClient) {
    try {
      const [mediaRes, timelineRes, memoriesRes, guestbookRes] = await Promise.all([
        activeClient
          .from("media_items")
          .select("*")
          .eq("memorial_id", dbMemorial.id)
          .order("is_pinned", { ascending: false })
          .order("order_index", { ascending: true })
          .order("created_at", { ascending: true }),
        activeClient
          .from("timeline_events")
          .select("*")
          .eq("memorial_id", dbMemorial.id)
          .order("year", { ascending: true })
          .order("order_index", { ascending: true }),
        activeClient
          .from("memories")
          .select("*")
          .eq("memorial_id", dbMemorial.id)
          .eq("status", "approved")
          .order("created_at", { ascending: false }),
        activeClient
          .from("guestbook_entries")
          .select("*")
          .eq("memorial_id", dbMemorial.id)
          .eq("status", "approved")
          .order("created_at", { ascending: false }),
      ])

      mediaItems = (mediaRes.data || []).map((m: any) => ({
        id: m.id,
        title: m.caption || (m.media_type === "video" ? "Video Clip" : m.media_type === "audio" ? "Voice Note" : "Photograph"),
        mediaType: m.media_type === "image" ? "photo" : (m.media_type as "photo" | "audio" | "video"),
        year: m.approx_year ? String(m.approx_year) : "",
        location: m.location || undefined,
        album: m.album || undefined,
        isPinned: Boolean(m.is_pinned),
        mediaUrl: resolveMediaUrl(m.url),
        addedBy: m.uploaded_by || undefined,
        people: m.tagged_people ? m.tagged_people.split(",").map((s: string) => s.trim()).filter(Boolean) : undefined,
      }))

      timelineEvents = (timelineRes.data || []).map((t: any) => ({
        year: t.year,
        chapter: `Year ${t.year}`,
        title: t.title,
        description: t.description || "",
        location: t.location || undefined,
        photoUrl: t.photo_url ? resolveMediaUrl(t.photo_url) : undefined,
      }))

      const rawMemories = memoriesRes.data || []
      const rawGuestbook = guestbookRes.data || []

      for (const mem of rawMemories) {
        let dateOrYear = ""
        if (mem.approx_year) {
          dateOrYear = String(mem.approx_year)
        } else if (mem.created_at) {
          const d = new Date(mem.created_at)
          const now = new Date()
          const diffMs = now.getTime() - d.getTime()
          const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
          const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
          if (diffHours < 1) dateOrYear = "Just now"
          else if (diffHours < 24) dateOrYear = `${diffHours} ${diffHours === 1 ? "hour" : "hours"} ago`
          else if (diffDays === 1) dateOrYear = "Yesterday"
          else if (diffDays < 7) dateOrYear = `${diffDays} days ago`
          else dateOrYear = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
        }

        const isStory =
          mem.contribution_type === "story" ||
          (!mem.contribution_type && (mem.photo_url || (Array.isArray(mem.photo_urls) && mem.photo_urls.length > 0) || mem.approx_year || (mem.story && mem.story.length > 200)))

        const rawPhotoUrls = Array.isArray(mem.photo_urls) && mem.photo_urls.length > 0
          ? mem.photo_urls
          : mem.photo_url
          ? [mem.photo_url]
          : []
        const photoUrls = rawPhotoUrls.map((u: string) => resolveMediaUrl(u))

        if (isStory) {
          stories.push({
            id: mem.id,
            authorName: mem.author_name,
            authorRelationship: mem.author_relationship || "",
            dateOrYear,
            chronologicalYear: mem.approx_year || undefined,
            location: mem.location || undefined,
            story: mem.story,
            photoUrl: photoUrls[0] || undefined,
            photoUrls: photoUrls.length > 0 ? photoUrls : undefined,
            createdAt: mem.created_at,
          })
        } else {
          tributes.push({
            id: mem.id,
            authorName: mem.author_name,
            authorRelationship: mem.author_relationship || "",
            dateOrYear,
            chronologicalYear: mem.approx_year || undefined,
            location: mem.location || undefined,
            story: mem.story,
            tributeType: (mem.tribute_type as any) || "note",
            createdAt: mem.created_at,
          })
        }
      }

      for (const gb of rawGuestbook) {
        let dateOrYear = ""
        if (gb.created_at) {
          const d = new Date(gb.created_at)
          const now = new Date()
          const diffMs = now.getTime() - d.getTime()
          const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
          const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
          if (diffHours < 1) dateOrYear = "Just now"
          else if (diffHours < 24) dateOrYear = `${diffHours} ${diffHours === 1 ? "hour" : "hours"} ago`
          else if (diffDays === 1) dateOrYear = "Yesterday"
          else if (diffDays < 7) dateOrYear = `${diffDays} days ago`
          else dateOrYear = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
        }

        tributes.push({
          id: `gb-${gb.id}`,
          authorName: gb.author_name,
          authorRelationship: "",
          dateOrYear,
          story: gb.message,
          tributeType: "note",
          createdAt: gb.created_at,
        })
      }

      tributes.sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0
        return timeB - timeA
      })

      stories.sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0
        return timeB - timeA
      })

      memories = [...tributes]
    } catch (err) {
      console.error("Error fetching child collections:", err)
    }
  }

  const fullName =
    dbMemorial?.full_name ||
    (isDemo
      ? "Robert Edward Carter"
      : slug
          .split("-")
          .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" "))

  const preferredName = dbMemorial?.preferred_name || (isDemo ? "Bob" : null)
  const birthYear = dbMemorial?.birth_year || (isDemo ? 1948 : null)
  const deathYear = dbMemorial?.death_year || (isDemo ? 2024 : null)
  const location = dbMemorial?.location || (isDemo ? "Devon, England" : null)
  const epitaph = dbMemorial?.headline || (isDemo ? "Watchmaker, master woodworker, and an unhurried listener. Built grandfather clocks by day, fixed bicycles for neighborhood children by evening." : null)
  const biography = dbMemorial?.biography || null
  const portraitUrl = dbMemorial?.portrait_photo_url ? resolveMediaUrl(dbMemorial.portrait_photo_url) : (isDemo ? "/memorial-family-portrait-grandfather.jpg" : "/memorial-family-portrait-grandfather.jpg")

  // 6. Private PIN Gate Check
  if (dbMemorial && dbMemorial.privacy === "private" && !isOwner) {
    const cookieStore = await cookies()
    const isPinUnlocked = cookieStore.get(`theirs_pin_${slug}`)?.value === "unlocked"

    if (!isPinUnlocked) {
      return (
        <MemorialPinGate
          fullName={fullName}
          portraitUrl={portraitUrl}
          slug={slug}
        />
      )
    }
  }

  const photosCount = isDemo ? 42 : mediaItems.filter((m) => m.mediaType === "photo").length
  const memoriesCount = isDemo ? 14 : (tributes.length + stories.length)
  const contributorsCount = isDemo
    ? 8
    : (new Set([...tributes.map((m) => m.authorName), ...stories.map((s) => s.authorName)]).size || (dbMemorial ? 1 : 0))

  const memorialData: MemorialData = {
    id: dbMemorial?.id,
    slug,
    fullName,
    preferredName,
    birthYear,
    deathYear,
    location,
    epitaph,
    biography,
    portraitUrl,
    isDemo,
    isPaid: isDemo ? true : Boolean(dbMemorial?.is_paid),
    sectionSettings: dbMemorial?.section_settings || {
      story: true,
      tributes: true,
      timeline: true,
      gallery: true,
      stories: true,
    },
    memoriesCount,
    photosCount,
    contributorsCount,
    mediaItems: isDemo ? undefined : mediaItems,
    timelineEvents: isDemo ? undefined : timelineEvents,
    memories: isDemo ? undefined : tributes,
    tributes: isDemo ? undefined : tributes,
    stories: isDemo ? undefined : stories,
  }

  // Schema.org Person & Memorial Structured Data for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: memorialData.fullName,
    birthDate: memorialData.birthYear ? String(memorialData.birthYear) : undefined,
    deathDate: memorialData.deathYear ? String(memorialData.deathYear) : undefined,
    description: memorialData.epitaph || undefined,
    url: `https://theirs.page/${slug}`,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* 1. If viewing in visitor preview mode: show subtle floating pill */}
      {isOwner && isVisitorPreview && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#181925]/95 text-white px-4 py-2.5 rounded-full shadow-2xl text-xs font-sans flex items-center gap-3 border border-white/20 backdrop-blur-md animate-in fade-in slide-in-from-bottom-3 select-none">
          <span className="flex items-center gap-1.5 font-medium">
            <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
            Viewing as visitor
          </span>
          <span className="text-white/30">|</span>
          <a
            href={`/dashboard/memorials/${dbMemorial?.id}/editor`}
            className="text-neutral-300 hover:text-white underline font-semibold transition-colors"
          >
            Back to editor &rarr;
          </a>
        </div>
      )}

      {/* 2. Standard draft mode banner (suppressed in visitor preview) */}
      {dbMemorial && dbMemorial.status === "draft" && isOwner && !isVisitorPreview && (
        <div className="bg-amber-500 text-black px-4 py-2 text-xs font-medium text-center sticky top-0 z-50 shadow-xs flex items-center justify-center gap-2">
          <span>⚠️ <strong>Draft Preview Mode</strong> — This memorial is private and not yet published to visitors.</span>
          <a
            href={`/dashboard/memorials/${dbMemorial.id}/editor`}
            className="underline font-bold hover:text-black/80"
          >
            Publish in Settings &rarr;
          </a>
        </div>
      )}
      <MemorialClientView data={memorialData} />
    </>
  )
}
