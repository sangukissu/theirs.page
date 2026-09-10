import { notFound } from "next/navigation"
import { getMemorialViewContext, loadMemorialHome } from "@/lib/memorial/public-data"
import { MemorialHome } from "@/components/memorial/memorial-home"

export default async function RobertCarterPage() {
  const context = await getMemorialViewContext("robert-carter")
  if (!context) notFound()
  const home = await loadMemorialHome(context)
  return <MemorialHome identity={context.identity} data={home} />
}
