import React from "react"

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
      item: "https://theirs-page.sangukissu.workers.dev",
    },
    ...items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 2,
      name: item.name,
      ...(item.href ? { item: `https://theirs-page.sangukissu.workers.dev${item.href}` } : {}),
    })),
  ]

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: schemaItems,
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
    />
  )
}
