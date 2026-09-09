import type { Metadata } from "next"
import { SEO_CONFIG } from "./config"
import { STATIC_PAGES } from "./pages"
import type { MemorialIdentity } from "@/types/memorial-view"
import type { WordPressPost } from "@/lib/wordpress"

/**
 * Builds metadata for static pages defined in STATIC_PAGES registry.
 */
export function buildStaticMetadata(
  path: string,
  overrides?: Partial<Metadata>
): Metadata {
  const page = STATIC_PAGES[path]
  const title = page?.title || SEO_CONFIG.defaultTitle
  const description = page?.description || SEO_CONFIG.defaultDescription
  const isHome = path === "/"
  const canonicalUrl = `${SEO_CONFIG.canonicalOrigin}${isHome ? "/" : path}`
  const isIndexable = page ? page.indexable : true

  return {
    title: isHome ? { absolute: SEO_CONFIG.defaultTitle } : title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    robots: isIndexable
      ? { index: true, follow: true }
      : { index: false, follow: false },
    openGraph: {
      title: isHome ? SEO_CONFIG.defaultTitle : `${title} | ${SEO_CONFIG.siteName}`,
      description,
      url: canonicalUrl,
      siteName: SEO_CONFIG.siteName,
      locale: SEO_CONFIG.locale,
      type: "website",
      images: [
        {
          url: SEO_CONFIG.defaultOgImage,
          width: 1200,
          height: 630,
          alt: SEO_CONFIG.siteName,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: isHome ? SEO_CONFIG.defaultTitle : `${title} | ${SEO_CONFIG.siteName}`,
      description,
      images: [SEO_CONFIG.defaultOgImage],
    },
    ...overrides,
  }
}

export interface MemorialMetadataOptions {
  identity: MemorialIdentity
  slug: string
  isSubpage?: boolean
  subpageTitle?: string
  subpagePath?: string
}

/**
 * Builds metadata for memorial pages adhering to:
 * - "One person. One memorial. One indexable URL."
 * - Formula: {Full Name} Memorial ({years if available}) | Theirs
 * - Subpages get robots: { index: false, follow: true }
 * - Private / PIN memorials get robots: { index: false, follow: false } with NO private data leakage.
 */
export function buildMemorialMetadata({
  identity,
  slug,
  isSubpage = false,
  subpageTitle,
  subpagePath,
}: MemorialMetadataOptions): Metadata {
  const canonicalRoot = `${SEO_CONFIG.canonicalOrigin}/${slug}`

  // 1. Private / PIN protected memorial - never leak private details or images
  if (identity.privacy === "private") {
    return {
      title: { absolute: `Private Memorial | ${SEO_CONFIG.siteName}` },
      description: "A private family memorial.",
      alternates: {
        canonical: canonicalRoot,
      },
      robots: { index: false, follow: false },
      openGraph: {
        title: `Private Memorial | ${SEO_CONFIG.siteName}`,
        description: "A private family memorial.",
        url: canonicalRoot,
        siteName: SEO_CONFIG.siteName,
        locale: SEO_CONFIG.locale,
        type: "website",
      },
      twitter: {
        card: "summary",
        title: `Private Memorial | ${SEO_CONFIG.siteName}`,
        description: "A private family memorial.",
      },
    }
  }

  // Calculate year range
  const years =
    identity.birthYear && identity.deathYear
      ? `${identity.birthYear}–${identity.deathYear}`
      : identity.birthYear
      ? `b. ${identity.birthYear}`
      : identity.deathYear
      ? `d. ${identity.deathYear}`
      : ""

  const yearsLabel = years ? ` (${years})` : ""
  const headlinePart = identity.epitaph?.trim() ? ` “${identity.epitaph.trim()}”.` : ""
  const locationPart = identity.location?.trim() ? ` from ${identity.location.trim()}` : ""

  const memorialNameWithYears = `${identity.fullName} Memorial${yearsLabel}`
  const pageTitle = `${memorialNameWithYears} | ${SEO_CONFIG.siteName}`
  const description = `In loving memory of ${identity.fullName}${yearsLabel}${locationPart}.${headlinePart} A place dedicated to their life, stories, photographs, and memories.`

  const isPublicAndPublished =
    identity.privacy === "public" && identity.status === "published"

  // 2. Memorial Subpages (e.g. /gallery, /timeline, /memories, /tributes)
  if (isSubpage && subpageTitle) {
    const subpageCanonical = subpagePath
      ? `${SEO_CONFIG.canonicalOrigin}/${slug}/${subpagePath}`
      : canonicalRoot

    return {
      title: {
        absolute: `${subpageTitle} — ${memorialNameWithYears} | ${SEO_CONFIG.siteName}`,
      },
      description,
      alternates: {
        canonical: subpageCanonical,
      },
      // Keep subpages crawlable and link-following, but do not index them as separate SERP results
      robots: isPublicAndPublished
        ? { index: false, follow: true }
        : { index: false, follow: false },
      openGraph: {
        title: `${subpageTitle} — ${memorialNameWithYears} | ${SEO_CONFIG.siteName}`,
        description,
        url: subpageCanonical,
        siteName: SEO_CONFIG.siteName,
        locale: SEO_CONFIG.locale,
        type: "website",
        images: identity.portraitUrl
          ? [{ url: identity.portraitUrl, alt: `Memorial portrait of ${identity.fullName}` }]
          : [{ url: SEO_CONFIG.defaultOgImage, alt: SEO_CONFIG.siteName }],
      },
      twitter: {
        card: identity.portraitUrl ? "summary_large_image" : "summary",
        title: `${subpageTitle} — ${memorialNameWithYears} | ${SEO_CONFIG.siteName}`,
        description,
        images: identity.portraitUrl ? [identity.portraitUrl] : [SEO_CONFIG.defaultOgImage],
      },
    }
  }

  // 3. Memorial Overview (/[slug])
  return {
    title: {
      absolute: pageTitle,
    },
    description,
    alternates: {
      canonical: canonicalRoot,
    },
    robots: isPublicAndPublished
      ? { index: true, follow: true }
      : { index: false, follow: false },
    openGraph: {
      title: pageTitle,
      description,
      url: canonicalRoot,
      siteName: SEO_CONFIG.siteName,
      locale: SEO_CONFIG.locale,
      type: "website", // Not "profile"
      images: identity.portraitUrl
        ? [
            {
              url: identity.portraitUrl,
              alt: `Memorial portrait of ${identity.fullName}`,
            },
          ]
        : [
            {
              url: SEO_CONFIG.defaultOgImage,
              alt: SEO_CONFIG.siteName,
            },
          ],
    },
    twitter: {
      card: identity.portraitUrl ? "summary_large_image" : "summary",
      title: pageTitle,
      description,
      images: identity.portraitUrl ? [identity.portraitUrl] : [SEO_CONFIG.defaultOgImage],
    },
  }
}

export interface BlogMetadataOptions {
  post?: WordPressPost | null
  isArticle?: boolean
}

/**
 * Builds metadata for blog pages.
 * While the blog contains legacy photo restoration content, index is false.
 */
export function buildBlogMetadata({
  post,
  isArticle = false,
}: BlogMetadataOptions = {}): Metadata {
  const isTemporarilyNoIndex = process.env.BLOG_NOINDEX === "true"

  if (isArticle && post) {
    const rawTitle = post.title || "Article"
    // Defensively strip any existing brand suffixes like "- Theirs", "| Theirs Blog", or "- BringBack"
    const cleanTitle = rawTitle.replace(/\s*([|–—-])\s*(Theirs(\s*Blog)?|BringBack).*$/i, "").trim()
    const articleTitle = `${cleanTitle} | Theirs Blog`
    const rawExcerpt = post.excerpt || cleanTitle
    const plainExcerpt = rawExcerpt.replace(/<[^>]*>/g, "").trim()
    const ogImage = post.featuredImage?.node?.sourceUrl || SEO_CONFIG.defaultOgImage
    const canonical = `${SEO_CONFIG.canonicalOrigin}/blog/${post.slug}`

    return {
      title: {
        absolute: articleTitle,
      },
      description: plainExcerpt,
      alternates: {
        canonical,
      },
      robots: isTemporarilyNoIndex
        ? { index: false, follow: false }
        : { index: true, follow: true },
      openGraph: {
        title: articleTitle,
        description: plainExcerpt,
        url: canonical,
        siteName: SEO_CONFIG.siteName,
        locale: SEO_CONFIG.locale,
        type: "article",
        publishedTime: post.date,
        modifiedTime: post.modified,
        authors: [post.author.node.name],
        images: [
          {
            url: ogImage,
            width: 1200,
            height: 630,
            alt: cleanTitle,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: articleTitle,
        description: plainExcerpt,
        images: [ogImage],
      },
    }
  }

  // Blog Index
  const blogCanonical = `${SEO_CONFIG.canonicalOrigin}/blog`
  return {
    title: {
      absolute: "Memorial Guides & Stories | Theirs",
    },
    description: "Guides, reflections, and practical advice on honoring loved ones, preserving family stories, and creating meaningful online memorials.",
    alternates: {
      canonical: blogCanonical,
    },
    robots: isTemporarilyNoIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph: {
      title: "Memorial Guides & Stories | Theirs",
      description: "Guides, reflections, and practical advice on honoring loved ones, preserving family stories, and creating meaningful online memorials.",
      url: blogCanonical,
      siteName: SEO_CONFIG.siteName,
      locale: SEO_CONFIG.locale,
      type: "website",
      images: [
        {
          url: SEO_CONFIG.defaultOgImage,
          width: 1200,
          height: 630,
          alt: SEO_CONFIG.siteName,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Memorial Guides & Stories | Theirs",
      description: "Guides, reflections, and practical advice on honoring loved ones, preserving family stories, and creating meaningful online memorials.",
      images: [SEO_CONFIG.defaultOgImage],
    },
  }
}

/**
 * Builds strict noindex/nofollow metadata for private, auth, admin, and error routes.
 */
export function buildNoIndexMetadata(title: string, description?: string): Metadata {
  return {
    title: {
      absolute: `${title} | ${SEO_CONFIG.siteName}`,
    },
    description: description || "Internal page.",
    robots: { index: false, follow: false },
  }
}
