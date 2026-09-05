import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getMemorialViewContext, loadBrowsePage } from "@/lib/memorial/public-data"
import { PagedTributes } from "@/components/memorial/paged-content"
import type { MemoryItem } from "@/components/memorial/memories-stream"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  return { alternates: { canonical: `/${slug}/tributes` } }
}

export default async function TributesPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const context = await getMemorialViewContext(slug)
  if (!context || context.identity.sectionSettings.tributes === false) notFound()
  if (context.requiresPin) return null
  const page = await loadBrowsePage<MemoryItem>(context, "tributes")
  return <PagedTributes slug={slug} fullName={context.identity.fullName} memorialId={context.identity.id} isDemo={context.identity.isDemo} initial={page} />
}
