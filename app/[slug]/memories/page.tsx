import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getMemorialViewContext, loadBrowsePage } from "@/lib/memorial/public-data"
import { PagedMemories } from "@/components/memorial/paged-content"
import type { StoryItem } from "@/components/memorial/life-stories"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  return { alternates: { canonical: `/${slug}/memories` } }
}

export default async function MemoriesPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const context = await getMemorialViewContext(slug)
  if (!context || context.identity.sectionSettings.stories === false) notFound()
  if (context.requiresPin) return null
  const page = await loadBrowsePage<StoryItem>(context, "memories")
  return <PagedMemories slug={slug} fullName={context.identity.fullName} memorialId={context.identity.id} isDemo={context.identity.isDemo} initial={page} />
}
