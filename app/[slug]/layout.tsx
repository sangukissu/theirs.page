import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getMemorialViewContext } from "@/lib/memorial/public-data"
import { MemorialPinGate } from "@/components/memorial/memorial-pin-gate"
import { MemorialShell } from "@/components/memorial/memorial-shell"
import { JsonLd } from "@/components/seo/json-ld"
import { buildMemorialMetadata, buildNoIndexMetadata } from "@/lib/seo/metadata"
import { buildMemorialSchemaGraph } from "@/lib/seo/schema"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const context = await getMemorialViewContext(slug)
  if (!context) {
    return buildNoIndexMetadata("Memorial")
  }

  return buildMemorialMetadata({
    identity: context.identity,
    slug,
  })
}

export default async function MemorialLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const context = await getMemorialViewContext(slug)
  if (!context) notFound()

  const { identity } = context
  if (context.requiresPin) {
    return <MemorialPinGate fullName={identity.fullName} portraitUrl={identity.portraitUrl} slug={slug} />
  }

  const schema = buildMemorialSchemaGraph(identity, slug)

  return (
    <MemorialShell identity={identity}>
      {schema && <JsonLd schema={schema} id={`memorial-schema-${slug}`} />}
      {children}
    </MemorialShell>
  )
}
