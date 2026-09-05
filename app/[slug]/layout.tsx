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
    return { title: "Private Memorial", description: "A private family memorial.", alternates: { canonical: `/${slug}` }, robots: { index: false, follow: false } }
  }
  const title = `${identity.fullName} — A life remembered`
  const description = identity.epitaph || `Stories, photographs, and memories of ${identity.fullName}.`
  return { title, description, alternates: { canonical: `/${slug}` }, robots: identity.privacy === "private" || identity.privacy === "unlisted" ? { index: false, follow: false } : { index: true, follow: true }, openGraph: { title, description, url: `https://theirs.page/${slug}`, images: identity.portraitUrl ? [{ url: identity.portraitUrl }] : undefined } }
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
