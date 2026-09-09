import type { Metadata } from "next"
import { TheirsNav } from '@/components/theirs/nav';
import { TheirsFooter } from '@/components/theirs/footer';
import BlogCard from "@/components/blog-card"
import { OfflineBanner } from "@/components/network-status"
import { CtaBanner } from '@/components/theirs/cta-banner';

import { Button } from "@/components/ui/button"
import { getAllPosts, formatDate, calculateReadingTime, extractExcerpt, type WordPressPost } from "@/lib/wordpress"
import { Suspense } from "react"

import { buildBlogMetadata } from "@/lib/seo/metadata"

export const metadata: Metadata = buildBlogMetadata()

// Transform WordPress post to blog card format
function transformWordPressPost(post: WordPressPost, index: number) {
  return {
    title: post.title,
    excerpt: post.excerpt ? extractExcerpt(post.excerpt, 160) : extractExcerpt(post.content, 160),
    slug: post.slug,
    publishedAt: formatDate(post.date),
    readTime: calculateReadingTime(post.content),
    category: post.categories.nodes[0]?.name || "Guides",
    image: post.featuredImage?.node?.sourceUrl || "/placeholder.svg?height=400&width=600&text=Blog+Post",
    featured: index === 0,
    author: post.author.node.name,
  }
}

async function BlogContent() {
  try {
    const { posts } = await getAllPosts(24)
    const blogPosts = posts.map(transformWordPressPost)

    return (
      <BlogPageContent blogPosts={blogPosts} />
    )
  } catch (error) {
    console.error('Error fetching blog posts:', error)
    return (
      <BlogPageContent blogPosts={[]} />
    )
  }
}

function BlogPageContent({ blogPosts }: { blogPosts: any[] }) {
  return (
    <div className="min-h-screen bg-white">
      <TheirsNav />

      <main className="pt-10 sm:pt-14 pb-20">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Offline Banner */}
          <OfflineBanner />

          {/* Editorial Header */}
          <div className="max-w-3xl mb-12 sm:mb-16">
            <div className="mb-4">
              <span className="inline-flex items-center justify-center font-medium border border-black/[0.06] bg-[#f7f7f8] text-[#666] h-[26px] text-xs px-3 rounded-full select-none">
                Stories &amp; Guides
              </span>
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-medium tracking-[-0.03em] text-[#181925] leading-[1.08] mb-4">
              Remembering well, <br className="hidden sm:inline" />
              <span className="text-primary">together.</span>
            </h1>
            <p className="text-base sm:text-lg text-[#666] leading-relaxed max-w-2xl">
              Thoughtful guidance on honoring loved ones, preserving family stories, and creating beautiful online memorials.
            </p>
          </div>

          {/* Blog Grid */}
          <div>
            {blogPosts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {blogPosts.map((post) => (
                  <BlogCard
                    key={post.slug}
                    title={post.title}
                    excerpt={post.excerpt}
                    slug={post.slug}
                    publishedAt={post.publishedAt}
                    readTime={post.readTime}
                    category={post.category}
                    image={post.image}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-[#fafafa] rounded-2xl border border-black/[0.06]">
                <p className="text-[#555] text-base font-medium">No published guides yet.</p>
                <p className="text-[#888] text-sm mt-1">Check back soon for new reflections and guides.</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-20">
          <CtaBanner />
        </div>
      </main>

      <TheirsFooter />
    </div>
  )
}

export default function BlogPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white">
        <TheirsNav />
        <main className="pt-10 sm:pt-14 pb-20">
          <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mb-12">
              <div className="h-6 w-32 bg-neutral-100 rounded-full mb-4 animate-pulse" />
              <div className="h-12 w-3/4 bg-neutral-100 rounded-lg mb-3 animate-pulse" />
              <div className="h-5 w-1/2 bg-neutral-100 rounded animate-pulse" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-neutral-50 border border-black/[0.05] rounded-2xl h-96 animate-pulse" />
              ))}
            </div>
          </div>
        </main>
        <TheirsFooter />
      </div>
    }>
      <BlogContent />
    </Suspense>
  )
}
