import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getMemorialViewContext, loadBrowsePage } from "@/lib/memorial/public-data"
import { PagedTimeline } from "@/components/memorial/paged-content"
import type { TimelineMilestone } from "@/components/memorial/life-timeline"

import { buildMemorialMetadata, buildNoIndexMetadata } from "@/lib/seo/metadata"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const context = await getMemorialViewContext(slug)
  if (!context) return buildNoIndexMetadata("Timeline")

  return buildMemorialMetadata({
    identity: context.identity,
    slug,
    isSubpage: true,
    subpageTitle: "Life Timeline & Chapters",
    subpagePath: "timeline",
  })
}

export default async function TimelinePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const context = await getMemorialViewContext(slug)
  if (!context || context.identity.sectionSettings.timeline === false) notFound()
  if (context.requiresPin) return null

  const timeline = await loadBrowsePage<TimelineMilestone>(context, "timeline")

  return (
    <div className="pt-16 sm:pt-20 pb-10">
      <PagedTimeline slug={slug} initial={timeline} isDemo={context.identity.isDemo} />
    </div>
  )
}
