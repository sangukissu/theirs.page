import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { createClient } from "@/utils/supabase/server"
import { MemorialClientView } from "./memorial-client-view"

interface MemorialPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: MemorialPageProps): Promise<Metadata> {
  const { slug } = await params
  const cleanName = slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")

  return {
    title: `${cleanName} — Theirs`,
    description: `A living memorial and life archive for ${cleanName}. Stories, photographs, and memories preserved permanently on Theirs.`,
    alternates: {
      canonical: `https://theirs.page/${slug}`,
    },
    openGraph: {
      title: `${cleanName} — Memorial Archive`,
      description: `A place on the internet dedicated to the life of ${cleanName}.`,
      url: `https://theirs.page/${slug}`,
      siteName: "Theirs",
      type: "profile",
    },
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

  // Attempt database fetch from Supabase
  let dbMemorial = null
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from("memorials")
      .select("*")
      .eq("slug", slug)
      .single()

    if (data) {
      dbMemorial = data
    }
  } catch (err) {
    // Fall back gracefully to rich demo dataset
  }

  const memorialData = {
    slug,
    fullName: dbMemorial?.full_name || (slug === "robert-carter" ? "Robert Edward Carter" : slug.split("-").map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")),
    preferredName: dbMemorial?.preferred_name || (slug === "robert-carter" ? "Bob" : null),
    birthYear: dbMemorial?.birth_year || 1948,
    deathYear: dbMemorial?.death_year || 2024,
    location: "Devon, England",
    epitaph:
      dbMemorial?.headline ||
      "Watchmaker, master woodworker, and an unhurried listener. Built grandfather clocks by day, fixed bicycles for neighborhood children by evening.",
    biography: dbMemorial?.biography || null,
    portraitUrl: dbMemorial?.portrait_photo_url || "/memorial-family-portrait-grandfather.jpg",
  }

  // Schema.org Person & Memorial Structured Data for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: memorialData.fullName,
    birthDate: String(memorialData.birthYear),
    deathDate: String(memorialData.deathYear),
    description: memorialData.epitaph,
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
