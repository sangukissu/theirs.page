import { notFound } from "next/navigation"
import { getMemorialViewContext, loadMemorialHome } from "@/lib/memorial/public-data"
import { MemorialBackdropHome } from "@/components/memorial/memorial-backdrop-home"

export default async function RobertCarterBackdropPage() {
  const context = await getMemorialViewContext("robert-carter")
  if (!context) notFound()
  const home = await loadMemorialHome(context)
  return <MemorialBackdropHome identity={context.identity} data={home} />
}
