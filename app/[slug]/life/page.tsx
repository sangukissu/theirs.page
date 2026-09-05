import { redirect } from "next/navigation"

export default async function LegacyLifePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ preview?: string; decade?: string }>
}) {
  const { slug } = await params
  const query = await searchParams
  const nextQuery = new URLSearchParams()
  if (query.preview === "visitor") nextQuery.set("preview", "visitor")
  if (query.decade) nextQuery.set("decade", query.decade)
  redirect(`/${slug}/timeline${nextQuery.size ? `?${nextQuery.toString()}` : ""}`)
}
