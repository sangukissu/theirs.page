import type { MetadataRoute } from "next"
import { SEO_CONFIG } from "@/lib/seo/config"
import { getSitemapStaticPages } from "@/lib/seo/pages"
import { getSupabaseAdminSafe } from "@/utils/supabase/admin"
import { getAllPosts } from "@/lib/wordpress"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const items: MetadataRoute.Sitemap = []

  // 1. Static Pages defined in the central registry (e.g. /, /privacy, /terms, /guidelines, /refunds, /blog)
  const staticPages = getSitemapStaticPages()
  for (const page of staticPages) {
    items.push({
      url: `${SEO_CONFIG.canonicalOrigin}${page.path === "/" ? "" : page.path}`,
      lastModified: page.updatedAt ? new Date(page.updatedAt) : undefined,
    })
  }

  // 2. Dynamic Public Memorials: ONLY status = 'published' AND privacy = 'public'
  // Private, unlisted, draft, and archived memorials are strictly excluded.
  // Memorial subpages (/gallery, /timeline, /memories, /tributes) are strictly excluded.
  try {
    const admin = getSupabaseAdminSafe()
    if (admin) {
      const { data: memorials, error } = await admin
        .from("memorials")
        .select("slug, updated_at")
        .eq("status", "published")
        .eq("privacy", "public")

      if (error) {
        console.error("Sitemap: Failed to query public memorials:", error)
      } else if (memorials) {
        for (const memorial of memorials) {
          if (!memorial.slug) continue
          items.push({
            url: `${SEO_CONFIG.canonicalOrigin}/${memorial.slug}`,
            lastModified: memorial.updated_at ? new Date(memorial.updated_at) : undefined,
          })
        }
      }
    }
  } catch (err) {
    console.error("Sitemap: Error generating memorial entries:", err)
  }

  // 3. Dynamic Blog Articles from WordPress
  try {
    const { posts } = await getAllPosts(100)
    for (const post of posts) {
      if (!post.slug || post.slug.includes("#") || post.slug.includes("?")) continue
      const dateStr = post.modified || post.date
      items.push({
        url: `${SEO_CONFIG.canonicalOrigin}/blog/${post.slug}`,
        lastModified: dateStr ? new Date(dateStr) : undefined,
      })
    }
  } catch (err) {
    console.warn("Sitemap: Failed to query blog posts:", err)
  }

  return items
}
