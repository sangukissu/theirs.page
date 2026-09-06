import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getMemorialViewContext } from "@/lib/memorial/public-data"
import { MemorialPinGate } from "@/components/memorial/memorial-pin-gate"
import { MemorialShell } from "@/components/memorial/memorial-shell"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const context = await getMemorialViewContext(slug)
  if (!context) return { title: "Memorial", robots: { index: false, follow: false } }
  const { identity } = context
  if (identity.privacy === "private") {
    return {
      title: "Private Memorial",
      description: "A private family memorial.",
      alternates: { canonical: `https://theirs.page/${slug}` },
      robots: { index: false, follow: false },
    }
  }

  const years =
    identity.birthYear && identity.deathYear
      ? `${identity.birthYear}–${identity.deathYear}`
      : identity.birthYear
      ? `b. ${identity.birthYear}`
      : identity.deathYear
      ? `d. ${identity.deathYear}`
      : ""

  const yearsLabel = years ? ` (${years})` : ""
  const headlinePart = identity.epitaph?.trim() ? ` “${identity.epitaph.trim()}”.` : ""
  const locationPart = identity.location?.trim() ? ` from ${identity.location.trim()}` : ""

  const pageTitle = `${identity.fullName}${yearsLabel} — Memorial & Life Story`
  const description = `In loving memory of ${identity.fullName}${yearsLabel}${locationPart}.${headlinePart} A place dedicated to their life, stories, photographs, and memories.`

  const isIndexable = identity.privacy === "public" && identity.status === "published"

  return {
    title: {
      default: `${pageTitle} | Theirs`,
      template: `%s | ${identity.fullName} Memorial`,
    },
    description,
    alternates: { canonical: `https://theirs.page/${slug}` },
    robots: isIndexable ? { index: true, follow: true } : { index: false, follow: false },
    openGraph: {
      title: `${pageTitle} | Theirs`,
      description,
      url: `https://theirs.page/${slug}`,
      siteName: "Theirs",
      locale: "en_US",
      type: "profile",
      images: identity.portraitUrl
        ? [
            {
              url: identity.portraitUrl,
              alt: `Memorial portrait of ${identity.fullName}`,
            },
          ]
        : undefined,
    },
    twitter: {
      card: identity.portraitUrl ? "summary_large_image" : "summary",
      title: `${pageTitle} | Theirs`,
      description,
      images: identity.portraitUrl ? [identity.portraitUrl] : undefined,
    },
  }
}

export default async function MemorialLayout({ children, params }: { children: React.ReactNode; params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const context = await getMemorialViewContext(slug)
  if (!context) notFound()
  const { identity } = context
  if (context.requiresPin) return <MemorialPinGate fullName={identity.fullName} portraitUrl={identity.portraitUrl} slug={slug} />
  const jsonLd = { "@context": "https://schema.org", "@type": "Person", name: identity.fullName, birthDate: identity.birthYear ? String(identity.birthYear) : undefined, deathDate: identity.deathYear ? String(identity.deathYear) : undefined, description: identity.epitaph || undefined, url: `https://theirs.page/${slug}` }
  return <MemorialShell identity={identity}><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />{children}</MemorialShell>
}
