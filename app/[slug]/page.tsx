import { notFound } from "next/navigation"
import { getMemorialViewContext, loadMemorialHome } from "@/lib/memorial/public-data"
import { MemorialHome } from "@/components/memorial/memorial-home"

export default async function MemorialPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const context = await getMemorialViewContext(slug)
  if (!context) notFound()
  if (context.requiresPin) return null
  const home = await loadMemorialHome(context)
  return <MemorialHome identity={context.identity} data={home} />
}
