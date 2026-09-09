import { SEO_CONFIG } from "./config"
import { FAQS } from "@/content/faq"
import type { MemorialIdentity } from "@/types/memorial-view"
import type { WordPressPost } from "@/lib/wordpress"

/**
 * Stable JSON-LD Schema IDs used across Theirs
 */
export const SCHEMA_IDS = {
  organization: `${SEO_CONFIG.canonicalOrigin}/#organization`,
  website: `${SEO_CONFIG.canonicalOrigin}/#website`,
  webapp: `${SEO_CONFIG.canonicalOrigin}/#webapp`,
  faq: `${SEO_CONFIG.canonicalOrigin}/#faq`,
  webpage: (url: string) => `${url}#webpage`,
  breadcrumb: (url: string) => `${url}#breadcrumb`,
  person: (url: string) => `${url}#person`,
  article: (url: string) => `${url}#article`,
}

export function buildOrganizationSchema() {
  return {
    "@type": "Organization",
    "@id": SCHEMA_IDS.organization,
    name: SEO_CONFIG.siteName,
    url: SEO_CONFIG.canonicalOrigin,
    logo: {
      "@type": "ImageObject",
      url: SEO_CONFIG.logoUrl,
      caption: SEO_CONFIG.siteName,
    },
    description: SEO_CONFIG.defaultDescription,
    email: SEO_CONFIG.supportEmail,
  }
}

export function buildWebSiteSchema() {
  return {
    "@type": "WebSite",
    "@id": SCHEMA_IDS.website,
    url: SEO_CONFIG.canonicalOrigin,
    name: SEO_CONFIG.siteName,
    description: SEO_CONFIG.defaultDescription,
    publisher: {
      "@id": SCHEMA_IDS.organization,
    },
    inLanguage: "en-US",
  }
}

export function buildWebApplicationSchema() {
  return {
    "@type": "WebApplication",
    "@id": SCHEMA_IDS.webapp,
    name: SEO_CONFIG.siteName,
    url: SEO_CONFIG.canonicalOrigin,
    applicationCategory: "LifestyleApplication",
    operatingSystem: "All",
    description: SEO_CONFIG.defaultDescription,
    offers: [
      {
        "@type": "Offer",
        name: SEO_CONFIG.pricing.free.name,
        price: "0",
        priceCurrency: "USD",
        description: SEO_CONFIG.pricing.free.description,
      },
      {
        "@type": "Offer",
        name: SEO_CONFIG.pricing.complete.name,
        price: String(SEO_CONFIG.pricing.complete.price),
        priceCurrency: "USD",
        description: SEO_CONFIG.pricing.complete.description,
      },
    ],
  }
}

export function buildWebPageSchema({
  url,
  name,
  description,
  aboutId,
  isPartOfId = SCHEMA_IDS.website,
}: {
  url: string
  name: string
  description: string
  aboutId?: string
  isPartOfId?: string
}) {
  const page: Record<string, unknown> = {
    "@type": "WebPage",
    "@id": SCHEMA_IDS.webpage(url),
    url,
    name,
    description,
    isPartOf: {
      "@id": isPartOfId,
    },
    inLanguage: "en-US",
  }

  if (aboutId) {
    page.about = {
      "@id": aboutId,
    }
  }

  return page
}

export function buildFaqSchema() {
  return {
    "@type": "FAQPage",
    "@id": SCHEMA_IDS.faq,
    isPartOf: {
      "@id": SCHEMA_IDS.website,
    },
    mainEntity: FAQS.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  }
}

export function buildBreadcrumbSchema(
  items: Array<{ name: string; url: string }>,
  pageUrl: string
) {
  return {
    "@type": "BreadcrumbList",
    "@id": SCHEMA_IDS.breadcrumb(pageUrl),
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

/**
 * Builds factual Person schema for a public memorial.
 * Only visible/known data is included.
 */
export function buildPersonSchema(identity: MemorialIdentity, slug: string) {
  const memorialUrl = `${SEO_CONFIG.canonicalOrigin}/${slug}`
  const person: Record<string, unknown> = {
    "@type": "Person",
    "@id": SCHEMA_IDS.person(memorialUrl),
    name: identity.fullName,
    url: memorialUrl,
  }

  if (identity.birthYear) {
    // Format as year or ISO date if month/day known
    person.birthDate = identity.birthMonth && identity.birthDay
      ? `${identity.birthYear}-${String(identity.birthMonth).padStart(2, "0")}-${String(identity.birthDay).padStart(2, "0")}`
      : String(identity.birthYear)
  }

  if (identity.deathYear) {
    person.deathDate = identity.deathMonth && identity.deathDay
      ? `${identity.deathYear}-${String(identity.deathMonth).padStart(2, "0")}-${String(identity.deathDay).padStart(2, "0")}`
      : String(identity.deathYear)
  }

  if (identity.portraitUrl) {
    person.image = identity.portraitUrl
  }

  if (identity.epitaph?.trim()) {
    person.description = identity.epitaph.trim()
  }

  return person
}

/**
 * Builds the complete connected JSON-LD graph for the Homepage
 */
export function buildHomeSchemaGraph() {
  const homeUrl = `${SEO_CONFIG.canonicalOrigin}/`

  return {
    "@context": "https://schema.org",
    "@graph": [
      buildOrganizationSchema(),
      buildWebSiteSchema(),
      buildWebApplicationSchema(),
      buildWebPageSchema({
        url: homeUrl,
        name: SEO_CONFIG.defaultTitle,
        description: SEO_CONFIG.defaultDescription,
      }),
      buildFaqSchema(),
    ],
  }
}

/**
 * Builds the connected JSON-LD graph for a public memorial overview
 */
export function buildMemorialSchemaGraph(identity: MemorialIdentity, slug: string) {
  // Never emit public discovery schema for private/unlisted/draft memorials
  if (identity.privacy !== "public" || identity.status !== "published") {
    return null
  }

  const memorialUrl = `${SEO_CONFIG.canonicalOrigin}/${slug}`
  const personId = SCHEMA_IDS.person(memorialUrl)

  return {
    "@context": "https://schema.org",
    "@graph": [
      buildOrganizationSchema(),
      buildWebSiteSchema(),
      buildWebPageSchema({
        url: memorialUrl,
        name: `${identity.fullName} Memorial | ${SEO_CONFIG.siteName}`,
        description: identity.epitaph || `Online memorial honoring the life and memories of ${identity.fullName}.`,
        aboutId: personId,
      }),
      buildPersonSchema(identity, slug),
    ],
  }
}

/**
 * Builds the JSON-LD graph for static legal pages
 */
export function buildLegalPageSchemaGraph(path: string, title: string, description: string) {
  const pageUrl = `${SEO_CONFIG.canonicalOrigin}${path}`

  return {
    "@context": "https://schema.org",
    "@graph": [
      buildOrganizationSchema(),
      buildWebSiteSchema(),
      buildWebPageSchema({
        url: pageUrl,
        name: `${title} | ${SEO_CONFIG.siteName}`,
        description,
      }),
    ],
  }
}

/**
 * Builds the JSON-LD graph for a blog article
 */
export function buildBlogArticleSchemaGraph(post: WordPressPost) {
  const articleUrl = `${SEO_CONFIG.canonicalOrigin}/blog/${post.slug}`
  const articleId = SCHEMA_IDS.article(articleUrl)
  const plainExcerpt = post.excerpt ? post.excerpt.replace(/<[^>]*>/g, "").trim() : post.title

  return {
    "@context": "https://schema.org",
    "@graph": [
      buildOrganizationSchema(),
      buildWebSiteSchema(),
      buildWebPageSchema({
        url: articleUrl,
        name: `${post.title} | Theirs Blog`,
        description: plainExcerpt,
        aboutId: articleId,
      }),
      buildBreadcrumbSchema(
        [
          { name: "Home", url: SEO_CONFIG.canonicalOrigin },
          { name: "Stories & Guides", url: `${SEO_CONFIG.canonicalOrigin}/blog` },
          { name: post.title, url: articleUrl },
        ],
        articleUrl
      ),
      {
        "@type": "BlogPosting",
        "@id": articleId,
        headline: post.title,
        description: plainExcerpt,
        image: post.featuredImage?.node?.sourceUrl || SEO_CONFIG.defaultOgImage,
        datePublished: post.date,
        dateModified: post.modified,
        author: {
          "@type": "Person",
          name: post.author.node.name && post.author.node.name.includes("@")
            ? "Theirs Editorial Team"
            : post.author.node.name || "Theirs Editorial Team",
          ...(post.author.node.avatar?.url ? { image: post.author.node.avatar.url } : {}),
          jobTitle: "Editorial Contributor",
          worksFor: {
            "@id": SCHEMA_IDS.organization,
          },
        },
        publisher: {
          "@id": SCHEMA_IDS.organization,
        },
        mainEntityOfPage: articleUrl,
        inLanguage: "en-US",
      },
    ],
  }
}
