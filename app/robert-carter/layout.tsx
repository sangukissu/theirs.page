import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getMemorialViewContext } from "@/lib/memorial/public-data"
import { MemorialShell } from "@/components/memorial/memorial-shell"

export const metadata: Metadata = {
  title: "Robert Edward Carter (1948–2024) — Memorial & Life Story | Theirs",
  description: "In loving memory of Robert Edward Carter. A place dedicated to his life, stories, photographs, and memories.",
  robots: { index: false, follow: false },
}

import { JsonLd } from "@/components/seo/json-ld"

export default async function RobertCarterLayout({ children }: { children: React.ReactNode }) {
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
    url: "https://theirs.page/robert-carter",
  }

  return (
    <MemorialShell identity={identity}>
      <JsonLd schema={jsonLd} id="robert-carter-demo-schema" />
      {children}
    </MemorialShell>
  )
}
