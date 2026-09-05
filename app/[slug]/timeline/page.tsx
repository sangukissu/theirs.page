import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getMemorialViewContext, loadBrowsePage, loadTimelineDecades } from "@/lib/memorial/public-data"
import { PagedTimeline } from "@/components/memorial/paged-content"
import type { TimelineMilestone } from "@/components/memorial/life-timeline"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  return { alternates: { canonical: `/${slug}/timeline` } }
}

export default async function TimelinePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ decade?: string }>
}) {
  const { slug } = await params
  const query = await searchParams
  const context = await getMemorialViewContext(slug)
  if (!context || context.identity.sectionSettings.timeline === false) notFound()
  if (context.requiresPin) return null

  const requestedDecade = Number(query.decade)
  const initialDecade = Number.isInteger(requestedDecade) && requestedDecade >= 1000 && requestedDecade <= 3000
    ? requestedDecade
    : undefined
  const [timeline, decades] = await Promise.all([
    loadBrowsePage<TimelineMilestone>(context, "timeline", { decade: initialDecade }),
    loadTimelineDecades(context),
  ])

  return (
    <div className="pb-10">
      <PagedTimeline
        slug={slug}
        initial={timeline}
        decades={decades}
        isDemo={context.identity.isDemo}
        initialDecade={initialDecade}
      />
    </div>
  )
}
