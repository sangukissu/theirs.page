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
    title: "Memorial Guides & Stories | Theirs",
    description:
      "Guides, reflections, and practical advice on honoring loved ones, preserving family stories, and creating meaningful online memorials.",
    indexable: true,
    sitemap: true,
    schemaType: "CollectionPage",
    breadcrumbLabel: "Blog",
    updatedAt: "2026-09-09",
  },
  "/gift-a-memorial": {
    path: "/gift-a-memorial",
    title: "Gift an Online Memorial Website for Loved Ones | Theirs",
    description:
      "Gift a beautiful, Complete online memorial website for a grieving family member or friend. Prepaid in full, private, with zero subscriptions, ready whenever they are.",
    indexable: true,
    sitemap: true,
    schemaType: "WebPage",
    breadcrumbLabel: "Gift a Memorial",
    updatedAt: "2026-09-11",
  },
  "/create-online-memorial": {
    path: "/create-online-memorial",
    title: "How to Create an Online Memorial Website | Theirs",
    description:
      "Learn how to create a lasting online memorial website for someone you love in minutes. Step-by-step guidance on photos, stories, voicemails, and inviting family.",
    indexable: true,
    sitemap: true,
    schemaType: "WebPage",
    breadcrumbLabel: "Create an Online Memorial",
    updatedAt: "2026-09-11",
  },
  "/free-online-memorial": {
    path: "/free-online-memorial",
    title: "Free Online Memorial Websites: What's Included & Free vs Paid | Theirs",
    description:
      "Create an ad-free online memorial for your loved one at zero cost. Compare free plans, learn what's truly included, and understand how modern families build lasting tributes.",
    indexable: true,
    sitemap: true,
    schemaType: "WebPage",
    breadcrumbLabel: "Free Online Memorial",
    updatedAt: "2026-09-11",
  },
  "/memorial-website-examples": {
    path: "/memorial-website-examples",
    title: "Online Memorial Website Examples & Design Ideas | Theirs",
    description:
      "Explore real online memorial website examples, layouts, and tribute designs. See how families bring photos, stories, audio voicemails, and milestones together.",
    indexable: true,
    sitemap: true,
    schemaType: "WebPage",
    breadcrumbLabel: "Memorial Website Examples",
    updatedAt: "2026-09-11",
  },
  "/best-online-memorial-websites": {
    path: "/best-online-memorial-websites",
    title: "Best Online Memorial Websites: 2026 Comparison & Reviews | Theirs",
    description:
      "Compare the best online memorial websites of 2026. Unbiased analysis of features, pricing models, photo limits, guestbook options, and privacy across top memorial platforms.",
    indexable: true,
    sitemap: true,
    schemaType: "WebPage",
    breadcrumbLabel: "Best Online Memorial Websites",
    updatedAt: "2026-09-11",
  },
  "/memorial-website-cost": {
    path: "/memorial-website-cost",
    title: "Memorial Website Cost: Complete 2026 Pricing Comparison | Theirs",
    description:
      "How much does an online memorial website cost? Compare free tiers, monthly subscription traps, and one-time fee models across major memorial platforms.",
    indexable: true,
    sitemap: true,
    schemaType: "WebPage",
    breadcrumbLabel: "Memorial Website Cost",
    updatedAt: "2026-09-11",
  },
  "/private-online-memorial": {
    path: "/private-online-memorial",
    title: "Private Online Memorial Websites & Password Protection | Theirs",
    description:
      "Create a private, password-protected online memorial for your loved one. Safeguard family memories with unlisted URLs, 4-digit PIN protection, and caretaker moderation.",
    indexable: true,
    sitemap: true,
    schemaType: "WebPage",
    breadcrumbLabel: "Private Online Memorial",
    updatedAt: "2026-09-11",
  },
  "/online-memorial-vs-obituary": {
    path: "/online-memorial-vs-obituary",
    title: "Online Memorial vs Obituary: Key Differences & Comparison | Theirs",
    description:
      "Understand the key differences between an obituary and an online memorial website. Compare costs, collaboration, lifespan, media limits, and how families use both.",
    indexable: true,
    sitemap: true,
    schemaType: "WebPage",
    breadcrumbLabel: "Online Memorial vs Obituary",
    updatedAt: "2026-09-11",
  },
  "/what-to-include-in-online-memorial": {
    path: "/what-to-include-in-online-memorial",
    title: "What to Include in an Online Memorial Website: Checklist & Guide | Theirs",
    description:
      "A gentle, comprehensive guide on what to include in an online memorial website. Practical checklist for photos, life stories, voicemails, timeline milestones, and family tributes.",
    indexable: true,
    sitemap: true,
    schemaType: "WebPage",
    breadcrumbLabel: "What to Include in an Online Memorial",
    updatedAt: "2026-09-11",
  },
}

export function getStaticPage(path: string): StaticPageEntry | undefined {
  return STATIC_PAGES[path]
}

export function getSitemapStaticPages(): StaticPageEntry[] {
  return Object.values(STATIC_PAGES).filter((page) => page.sitemap)
}
