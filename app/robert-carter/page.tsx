import { notFound } from "next/navigation"
import { getMemorialViewContext, loadMemorialHome } from "@/lib/memorial/public-data"
import { RobertCarterDemoHome } from "@/components/memorial/robert-carter-demo-home"

export default async function RobertCarterPage() {
  const context = await getMemorialViewContext("robert-carter")
  if (!context) notFound()
  const home = await loadMemorialHome(context)
  return <RobertCarterDemoHome identity={context.identity} data={home} />
}
