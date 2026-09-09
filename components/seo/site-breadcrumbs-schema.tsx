import React from "react"
import { JsonLd } from "./json-ld"

interface BreadcrumbItem {
  name: string
  href?: string
}

interface SiteBreadcrumbsSchemaProps {
  items: BreadcrumbItem[]
}

export function SiteBreadcrumbsSchema({ items }: SiteBreadcrumbsSchemaProps) {
  const schemaItems = [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: "https://theirs.page",
    },
    ...items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 2,
      name: item.name,
      ...(item.href ? { item: `https://theirs.page${item.href}` } : {}),
    })),
  ]

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: schemaItems,
  }

  return <JsonLd schema={breadcrumbJsonLd} />
}
