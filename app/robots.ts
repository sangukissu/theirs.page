import type { MetadataRoute } from "next"
import { SEO_CONFIG } from "@/lib/seo/config"

export default function robots(): MetadataRoute.Robots {
  const { searchDiscoveryBots, blockedAiTrainingBots, blockedScraperBots, privatePaths } =
    SEO_CONFIG.crawlers

  return {
    rules: [
      // 1. Default crawl policy for ordinary search engines
      {
        userAgent: "*",
        allow: "/",
        disallow: [...privatePaths],
      },
      // 2. Specific search & discovery / live retrieval answer engines
      ...searchDiscoveryBots.map((userAgent) => ({
        userAgent,
        allow: "/",
        disallow: [...privatePaths],
      })),
      // 3. AI Model-Training crawlers: blocked site-wide to protect family memories from scraping
      ...blockedAiTrainingBots.map((userAgent) => ({
        userAgent,
        disallow: "/",
      })),
      // 4. Commercial scrapers and zero-ROI bots: blocked site-wide
      ...blockedScraperBots.map((userAgent) => ({
        userAgent,
        disallow: "/",
      })),
    ],
    sitemap: `${SEO_CONFIG.canonicalOrigin}/sitemap.xml`,
  }
}