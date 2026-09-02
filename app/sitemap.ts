import { MetadataRoute } from "next"

const BASE = process.env.NEXT_PUBLIC_APP_URL || "https://theirs.page"

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()

  return [
    {
      url: `${BASE}`,
      lastModified,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${BASE}/login`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE}/privacy`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${BASE}/terms`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ]
}
