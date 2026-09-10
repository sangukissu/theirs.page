import type { Metadata } from "next"
import { notFound, permanentRedirect } from "next/navigation"
import { getMemorialViewContext, loadBrowsePage, loadGalleryItem } from "@/lib/memorial/public-data"
import { GalleryPageView } from "@/components/memorial/gallery-page-view"
import type { GalleryItem } from "@/components/memorial/memorial-gallery"
import type { GalleryFilter } from "@/types/memorial-view"

import { buildMemorialMetadata, buildNoIndexMetadata } from "@/lib/seo/metadata"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const context = await getMemorialViewContext(slug)
  if (!context) return buildNoIndexMetadata("Gallery")
  if (context.redirectedToSlug) {
    permanentRedirect(`/${context.redirectedToSlug}/gallery`)
  }

  return buildMemorialMetadata({
    identity: context.identity,
    slug,
    isSubpage: true,
    subpageTitle: "Photographs & Media Gallery",
    subpagePath: "gallery",
  })
}

export default async function GalleryPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ type?: string; album?: string; media?: string }> }) {
  const { slug } = await params
  const query = await searchParams
  const context = await getMemorialViewContext(slug)
  if (context?.redirectedToSlug) {
    const sp = new URLSearchParams()
    if (query.type) sp.set("type", query.type)
    if (query.album) sp.set("album", query.album)
    if (query.media) sp.set("media", query.media)
    const qs = sp.toString() ? `?${sp.toString()}` : ""
    permanentRedirect(`/${context.redirectedToSlug}/gallery${qs}`)
  }
  if (!context || context.identity.sectionSettings.gallery === false) notFound()
  if (context.requiresPin) return null
  const filter: GalleryFilter = ["photo", "audio", "video"].includes(query.type || "") ? query.type as GalleryFilter : "all"
  const album = query.album?.slice(0, 100) || "all"
  const [page, selectedItem] = await Promise.all([
    loadBrowsePage<GalleryItem>(context, "gallery", { filter, album, includeFacets: true }),
    loadGalleryItem(context, query.media),
  ])
  return (
    <div className="pt-16 sm:pt-20 pb-10">
      <GalleryPageView slug={slug} fullName={context.identity.fullName} isDemo={context.identity.isDemo} isPaid={context.identity.isPaid} accessRole={context.identity.accessRole} contributionSettings={context.identity.contributionSettings} initial={page} initialFilter={filter} initialAlbum={album} initialMediaId={query.media} initialSelectedItem={selectedItem} />
    </div>
  )
}
