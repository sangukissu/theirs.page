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

export default async function MemorialPage({ params }: MemorialPageProps) {
  const { slug } = await params

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
  let people: any[] = []
  let memories: any[] = []
  let guestbook: any[] = []

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
      const [mediaRes, timelineRes, peopleRes, memoriesRes, guestbookRes] = await Promise.all([
        activeClient
          .from("media_items")
          .select("*")
          .eq("memorial_id", dbMemorial.id)
          .order("order_index", { ascending: true })
          .order("created_at", { ascending: true }),
        activeClient
          .from("timeline_events")
          .select("*")
          .eq("memorial_id", dbMemorial.id)
          .order("year", { ascending: true })
          .order("order_index", { ascending: true }),
        activeClient
          .from("people_in_life")
          .select("*")
          .eq("memorial_id", dbMemorial.id)
          .order("order_index", { ascending: true })
          .order("created_at", { ascending: true }),
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
        mediaUrl: resolveMediaUrl(m.url),
      }))

      timelineEvents = (timelineRes.data || []).map((t: any) => ({
        year: t.year,
        chapter: `Year ${t.year}`,
        title: t.title,
        description: t.description || "",
        location: t.location || undefined,
        photoUrl: t.photo_url ? resolveMediaUrl(t.photo_url) : undefined,
      }))

      people = (peopleRes.data || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        relationship: p.relationship,
        circle: "family",
        notes: p.note || undefined,
        photoUrl: p.photo_url ? resolveMediaUrl(p.photo_url) : undefined,
      }))

      memories = (memoriesRes.data || []).map((mem: any) => ({
        id: mem.id,
        authorName: mem.author_name,
        authorRelationship: mem.author_relationship || "Friend",
        dateOrYear: mem.approx_year ? String(mem.approx_year) : "Remembered with love",
        chronologicalYear: mem.approx_year || undefined,
        location: mem.location || undefined,
        story: mem.story,
        photoUrl: mem.photo_url ? resolveMediaUrl(mem.photo_url) : undefined,
        category: "family",
        heartCount: 0,
      }))

      guestbook = (guestbookRes.data || []).map((gb: any) => ({
        id: gb.id,
        author: gb.author_name,
        location: gb.author_location || undefined,
        date: new Date(gb.created_at).toLocaleDateString(),
        message: gb.message,
      }))
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
  const memoriesCount = isDemo ? 14 : memories.length
  const contributorsCount = isDemo ? 8 : (new Set(memories.map((m) => m.authorName)).size || (dbMemorial ? 1 : 0))

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
    memoriesCount,
    photosCount,
    contributorsCount,
    mediaItems: isDemo ? undefined : mediaItems,
    timelineEvents: isDemo ? undefined : timelineEvents,
    people: isDemo ? undefined : people,
    memories: isDemo ? undefined : memories,
    guestbook: isDemo ? undefined : guestbook,
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
      {dbMemorial && dbMemorial.status === "draft" && isOwner && (
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
