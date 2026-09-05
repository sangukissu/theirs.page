import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getMemorialViewContext, loadBrowsePage, loadGalleryItem } from "@/lib/memorial/public-data"
import { GalleryPageView } from "@/components/memorial/gallery-page-view"
import type { GalleryItem } from "@/components/memorial/memorial-gallery"
import type { GalleryFilter } from "@/types/memorial-view"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  return { alternates: { canonical: `/${slug}/gallery` } }
}

export default async function GalleryPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ type?: string; album?: string; media?: string }> }) {
  const { slug } = await params
  const query = await searchParams
  const context = await getMemorialViewContext(slug)
  if (!context || context.identity.sectionSettings.gallery === false) notFound()
  if (context.requiresPin) return null
  const filter: GalleryFilter = ["photo", "audio", "video"].includes(query.type || "") ? query.type as GalleryFilter : "all"
  const album = query.album?.slice(0, 100) || "all"
  const [page, selectedItem] = await Promise.all([
    loadBrowsePage<GalleryItem>(context, "gallery", { filter, album }),
    loadGalleryItem(context, query.media),
  ])
  return (
    <div className="pt-16 sm:pt-20 pb-10">
      <GalleryPageView slug={slug} fullName={context.identity.fullName} isDemo={context.identity.isDemo} isPaid={context.identity.isPaid} initial={page} initialFilter={filter} initialAlbum={album} initialMediaId={query.media} initialSelectedItem={selectedItem} />
    </div>
  )
}
