import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getMemorialViewContext } from "@/lib/memorial/public-data"
import { MemorialShell } from "@/components/memorial/memorial-shell"

export const metadata: Metadata = {
  title: "Ambient Backdrop Test — Robert Edward Carter | Theirs",
  description: "Testing ambient memorial backdrop cover photograph with soft vertical and horizontal dissolves.",
  robots: { index: false, follow: false },
}

import { JsonLd } from "@/components/seo/json-ld"

export default async function RobertCarterBackdropLayout({ children }: { children: React.ReactNode }) {
  const context = await getMemorialViewContext("robert-carter")
  if (!context) notFound()
  const { identity } = context
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: identity.fullName,
    birthDate: identity.birthYear ? String(identity.birthYear) : undefined,
    deathDate: identity.deathYear ? String(identity.deathYear) : undefined,
    description: identity.epitaph || undefined,
    url: "https://theirs.page/robert-carter-backdrop",
  }

  return (
    <MemorialShell identity={identity}>
      <JsonLd schema={jsonLd} id="robert-carter-backdrop-demo-schema" />
      {children}
    </MemorialShell>
  )
}
