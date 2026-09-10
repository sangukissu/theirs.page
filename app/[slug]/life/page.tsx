import { notFound, redirect, permanentRedirect } from "next/navigation"
import { getMemorialViewContext } from "@/lib/memorial/public-data"

export default async function LegacyLifePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ preview?: string }>
}) {
  const { slug } = await params
  const query = await searchParams
  const context = await getMemorialViewContext(slug)
  if (!context) notFound()

  const nextQuery = new URLSearchParams()
  if (query.preview === "visitor") nextQuery.set("preview", "visitor")
  const qs = nextQuery.size ? `?${nextQuery.toString()}` : ""

  if (context.redirectedToSlug) {
    permanentRedirect(`/${context.redirectedToSlug}/timeline${qs}`)
  }

  redirect(`/${slug}/timeline${qs}`)
}
