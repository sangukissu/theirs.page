import { NextRequest, NextResponse } from "next/server"
import { getMemorialViewContext, loadBrowsePage } from "@/lib/memorial/public-data"
import type { BrowseCollection, GalleryFilter } from "@/types/memorial-view"

const collections: BrowseCollection[] = ["gallery", "memories", "timeline", "tributes"]

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const collection = request.nextUrl.searchParams.get("collection") as BrowseCollection | null
  if (!collection || !collections.includes(collection)) return NextResponse.json({ error: "Invalid collection" }, { status: 400 })
  const context = await getMemorialViewContext(id)
  if (!context) return NextResponse.json({ error: "Memorial not found" }, { status: 404 })
  if (context.requiresPin) return NextResponse.json({ error: "Unlock this private memorial first" }, { status: 403 })
  const sections = context.identity.sectionSettings
  const enabled = collection === "gallery" ? sections.gallery !== false : collection === "memories" ? sections.stories !== false : collection === "tributes" ? sections.tributes !== false : sections.timeline !== false
  if (!enabled) return NextResponse.json({ error: "This section is unavailable" }, { status: 404 })
  const rawFilter = request.nextUrl.searchParams.get("type") || "all"
  const filter: GalleryFilter = ["all", "photo", "audio", "video"].includes(rawFilter) ? rawFilter as GalleryFilter : "all"
  const rawDecade = Number(request.nextUrl.searchParams.get("decade"))
  const decade = Number.isInteger(rawDecade) && rawDecade >= 1000 && rawDecade <= 3000 ? rawDecade : undefined
  const page = await loadBrowsePage(context, collection, { cursor: request.nextUrl.searchParams.get("cursor"), filter, album: request.nextUrl.searchParams.get("album")?.slice(0, 100) || undefined, decade })
  return NextResponse.json(page, { headers: { "Cache-Control": context.identity.privacy === "public" && !context.identity.isOwner ? "no-cache" : "private, no-store, max-age=0", "X-Robots-Tag": "noindex, nofollow" } })
}
