/**
 * Central SEO Configuration for Theirs (theirs.page)
 * Single source of truth for site identity, positioning, canonical URLs, pricing, and crawler policies.
 */

export const SEO_CONFIG = {
  canonicalOrigin: process.env.NEXT_PUBLIC_APP_URL || "https://theirs.page",
  siteName: "Theirs",
  siteCategory: "Online memorial website",
  defaultTitle: "Online Memorial Website for Loved Ones | Theirs",
  titleTemplate: "%s | Theirs",
  defaultDescription:
    "Create a beautiful online memorial website for someone you love. Share photos, stories and tributes, and invite family and friends to add their memories.",
  logoUrl: "https://theirs.page/theirs-logo.svg",
  defaultOgImage: "https://theirs.page/opengraph-image",
  locale: "en_US",
  supportEmail: "support@theirs.page",
  // Verification codes for search consoles (can be set here or via environment variables)
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "",
    bing: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION || "",
    yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION || "",
  },
  // Web analytics configuration (Self-hosted Open Analytics)
  analytics: {
    openAnalyticsKey: process.env.NEXT_PUBLIC_OA_TRACKING_KEY || "oa_pk_k1j2WPtzPgJye7wIeOfXmvydcUwpAG0u",
    openAnalyticsCollectorUrl: process.env.NEXT_PUBLIC_OA_COLLECTOR_URL || "https://c.ecompin.com",
  },
  pricing: {
    free: {
      name: "Free Memorial",
      price: 0,
      currency: "USD",
      billingType: "free",
      description: "Create and publish a memorial with portrait, story, tributes, and up to 5 gallery photos.",
    },
    complete: {
      name: "Theirs Pro",
      price: 179,
      currency: "USD",
      billingType: "one-time",
      description: "Complete memorial with unlimited photos, video, audio recordings, family archive export, and privacy controls. One-time payment, no monthly subscription.",
    },
  },
  crawlers: {
    // Search engines and live retrieval query bots (answer engines fetching live public data)
    searchDiscoveryBots: [
      "Googlebot",
      "Bingbot",
      "OAI-SearchBot",
      "PerplexityBot",
      "Perplexity-User",
      "ChatGPT-User",
      "Claude-Web",
      "ClaudeBot",
      "Applebot",
    ],
    // Model-training crawlers blocked from scraping memorial content
    blockedAiTrainingBots: [
      "GPTBot",
      "anthropic-ai",
      "CCBot",
      "cohere-ai",
      "Google-Extended",
      "Applebot-Extended",
      "meta-externalagent",
      "Amazonbot",
    ],
    // Aggressive scrapers and zero-value crawlers blocked site-wide
    blockedScraperBots: [
      "Bytespider",
      "Diffbot",
      "ImagesiftBot",
    ],
    // Private paths that search and discovery bots may not crawl
    privatePaths: [
      "/api/",
      "/dashboard/",
      "/admin/",
      "/auth/",
      "/invitation/",
      "/_next/",
      "/private/",
    ],
  },
} as const
