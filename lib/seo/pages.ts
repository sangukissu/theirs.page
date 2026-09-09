export interface StaticPageEntry {
  path: string
  title: string
  description: string
  indexable: boolean
  sitemap: boolean
  schemaType: "WebPage" | "CollectionPage" | "AboutPage" | "ContactPage"
  breadcrumbLabel?: string
  updatedAt?: string
}

/**
 * Registry of all static pages on Theirs.
 * Drives both metadata generation and sitemap inclusion centrally.
 */
export const STATIC_PAGES: Record<string, StaticPageEntry> = {
  "/": {
    path: "/",
    title: "Online Memorial Website for Loved Ones | Theirs",
    description:
      "Create a beautiful online memorial website for someone you love. Share photos, stories and tributes, and invite family and friends to add their memories.",
    indexable: true,
    sitemap: true,
    schemaType: "WebPage",
    updatedAt: "2026-09-01",
  },
  "/privacy": {
    path: "/privacy",
    title: "Privacy Policy",
    description:
      "How Theirs collects, protects, and respects family memories, photographs, and personal information.",
    indexable: true,
    sitemap: true,
    schemaType: "WebPage",
    breadcrumbLabel: "Privacy Policy",
    updatedAt: "2026-09-01",
  },
  "/terms": {
    path: "/terms",
    title: "Terms of Service",
    description:
      "The legal agreement between Theirs and memorial caretakers, contributors, and visitors.",
    indexable: true,
    sitemap: true,
    schemaType: "WebPage",
    breadcrumbLabel: "Terms of Service",
    updatedAt: "2026-09-01",
  },
  "/guidelines": {
    path: "/guidelines",
    title: "Memorial & Content Guidelines",
    description:
      "Community standards for creating respectful, authentic, and dignified life archives on Theirs.",
    indexable: true,
    sitemap: true,
    schemaType: "WebPage",
    breadcrumbLabel: "Community Guidelines",
    updatedAt: "2026-09-01",
  },
  "/refunds": {
    path: "/refunds",
    title: "Refund Policy",
    description:
      "Fair, transparent 14-day money-back guarantee for Theirs Complete memorial upgrades.",
    indexable: true,
    sitemap: true,
    schemaType: "WebPage",
    breadcrumbLabel: "Refund Policy",
    updatedAt: "2026-09-01",
  },
  "/blog": {
    path: "/blog",
    title: "Blog | Theirs",
    description:
      "Guides and articles for remembering loved ones and preserving family memories.",
    // Set to false temporarily while blog contains legacy BringBack content
    indexable: false,
    sitemap: false,
    schemaType: "CollectionPage",
    breadcrumbLabel: "Blog",
    updatedAt: "2026-09-01",
  },
}

export function getStaticPage(path: string): StaticPageEntry | undefined {
  return STATIC_PAGES[path]
}

export function getSitemapStaticPages(): StaticPageEntry[] {
  return Object.values(STATIC_PAGES).filter((page) => page.sitemap)
}
