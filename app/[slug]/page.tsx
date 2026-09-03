import { Metadata } from "next"
import { notFound } from "next/navigation"
import { supabaseAdmin } from "@/utils/supabase/admin"
import { MemorialClientView, MemorialData } from "./memorial-client-view"

interface MemorialPageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: MemorialPageProps): Promise<Metadata> {
  const { slug } = await params

  try {
    const { data: memorial } = await supabaseAdmin
      .from("memorials")
      .select("full_name, headline, portrait_photo_url")
      .eq("slug", slug)
      .maybeSingle()

    if (memorial) {
      const title = `${memorial.full_name} — In Loving Memory | Theirs`
      const description = memorial.headline || `A quiet, permanent place dedicated to the memory and story of ${memorial.full_name}.`

      return {
        title,
        description,
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

  const capitalized = slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")

  return {
    title: `${capitalized} — In Loving Memory | Theirs`,
    description: `A quiet, permanent place on the internet dedicated to the memory of ${capitalized}.`,
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

  // Query memorial from Supabase using supabaseAdmin (bypasses RLS token drops for public readers)
  let dbMemorial: any = null
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

      // Fetch all related collections concurrently
      const [mediaRes, timelineRes, peopleRes, memoriesRes, guestbookRes] = await Promise.all([
        supabaseAdmin
          .from("media_items")
          .select("*")
          .eq("memorial_id", memorial.id)
          .order("order_index", { ascending: true })
          .order("created_at", { ascending: true }),
        supabaseAdmin
          .from("timeline_events")
          .select("*")
          .eq("memorial_id", memorial.id)
          .order("year", { ascending: true })
          .order("order_index", { ascending: true }),
        supabaseAdmin
          .from("people_in_life")
          .select("*")
          .eq("memorial_id", memorial.id)
          .order("order_index", { ascending: true })
          .order("created_at", { ascending: true }),
        supabaseAdmin
          .from("memories")
          .select("*")
          .eq("memorial_id", memorial.id)
          .eq("status", "approved")
          .order("created_at", { ascending: false }),
        supabaseAdmin
          .from("guestbook_entries")
          .select("*")
          .eq("memorial_id", memorial.id)
          .eq("status", "approved")
          .order("created_at", { ascending: false }),
      ])

      mediaItems = (mediaRes.data || []).map((m: any) => ({
        id: m.id,
        title: m.caption || (m.media_type === "video" ? "Video Clip" : m.media_type === "audio" ? "Voice Note" : "Photograph"),
        mediaType: m.media_type === "image" ? "photo" : (m.media_type as "photo" | "audio" | "video"),
        year: m.approx_year ? String(m.approx_year) : "",
        location: m.location || undefined,
        mediaUrl: m.url,
      }))

      timelineEvents = (timelineRes.data || []).map((t: any) => ({
        year: t.year,
        chapter: `Year ${t.year}`,
        title: t.title,
        description: t.description || "",
        location: t.location || undefined,
        photoUrl: t.photo_url || undefined,
      }))

      people = (peopleRes.data || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        relationship: p.relationship,
        circle: "family",
        notes: p.note || undefined,
        photoUrl: p.photo_url || undefined,
      }))

      memories = (memoriesRes.data || []).map((mem: any) => ({
        id: mem.id,
        authorName: mem.author_name,
        authorRelationship: mem.author_relationship || "Friend",
        dateOrYear: mem.approx_year ? String(mem.approx_year) : "Remembered with love",
        chronologicalYear: mem.approx_year || undefined,
        location: mem.location || undefined,
        story: mem.story,
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
    }
  } catch (err) {
    console.error("Error fetching memorial data:", err)
  }

  // If not found in database and not the curated demo slug, 404
  if (!dbMemorial && !isDemo) {
    notFound()
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
  const portraitUrl = dbMemorial?.portrait_photo_url || (isDemo ? "/memorial-family-portrait-grandfather.jpg" : "/memorial-family-portrait-grandfather.jpg")

  const photosCount = isDemo ? 42 : mediaItems.filter((m) => m.mediaType === "photo").length
  const memoriesCount = isDemo ? 14 : memories.length
  const contributorsCount = isDemo ? 8 : (new Set(memories.map((m) => m.authorName)).size || (dbMemorial ? 1 : 0))

  const memorialData: MemorialData = {
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
      <MemorialClientView data={memorialData} />
    </>
  )
}
