import type { Metadata } from "next"
import { TheirsNav } from '@/components/theirs/nav';
import { TheirsFooter } from '@/components/theirs/footer';
import BlogContentRenderer from "@/components/blog-content-renderer"
import ShareButton from "@/components/share-button"
import { Calendar, Clock, ArrowLeft, User, ChevronDown } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { getPostBySlug, getAllPostSlugs, formatDate, calculateReadingTime, type WordPressPost } from "@/lib/wordpress"
import { notFound } from "next/navigation"
import Image from "next/image"
import { CtaBanner } from '@/components/theirs/cta-banner';
import { TableOfContents, type TocItem } from "@/components/blog/table-of-contents"
import { AuthorBox } from "@/components/blog/author-box"

export const revalidate = 3600

function decodeHtmlEntities(value: string) {
  return value.replace(/&(#x?[0-9a-fA-F]+|\w+);/g, (match, code) => {
    if (code.startsWith("#x")) {
      const parsed = parseInt(code.slice(2), 16)
      return Number.isNaN(parsed) ? match : String.fromCharCode(parsed)
    }
    if (code.startsWith("#")) {
      const parsed = parseInt(code.slice(1), 10)
      return Number.isNaN(parsed) ? match : String.fromCharCode(parsed)
    }
    const named: Record<string, string> = {
      amp: "&",
      lt: "<",
      gt: ">",
      quot: "\"",
      apos: "'",
      nbsp: " "
    }
    return named[code] ?? match
  })
}

function buildToc(content: string) {
  const toc: TocItem[] = []
  const used = new Map<string, number>()
  const withIds = content.replace(/<h([2-3])([^>]*)>([\s\S]*?)<\/h\1>/gi, (match, level, attrs, inner) => {
    const existingIdMatch = attrs.match(/id="([^"]+)"/i)
    const rawText = decodeHtmlEntities(inner.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim())
    if (!rawText) return match
    let base = rawText
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
    if (!base) base = `section-${toc.length + 1}`
    const count = used.get(base) ?? 0
    used.set(base, count + 1)
    const id = existingIdMatch?.[1] || (count > 0 ? `${base}-${count + 1}` : base)
    toc.push({ id, text: rawText, level: Number(level) })
    if (existingIdMatch) return match
    const nextAttrs = attrs.trim().length > 0 ? `${attrs} id="${id}"` : ` id="${id}"`
    return `<h${level}${nextAttrs}>${inner}<a href="#${id}" class="blog-heading-anchor" aria-label="Link to this section">#</a></h${level}>`
  })
  return { toc, content: withIds }
}
// Generate static paths for all blog posts.
// Filter out any slug that contains a fragment (#) or query (?) so we never
// pre-render or emit indexable fragment-style URLs (prevents index bloat).
export async function generateStaticParams(): Promise<{ slug: string }[]> {
  try {
    const slugs = await getAllPostSlugs()
    return slugs
      .filter((slug) => !slug.includes('#') && !slug.includes('?') && slug.trim() === slug)
      .map((slug) => ({ slug }))
  } catch (error) {
    console.error('Error generating static params:', error)
    return []
  }
}

import { buildBlogMetadata, buildNoIndexMetadata } from "@/lib/seo/metadata"
import { buildBlogArticleSchemaGraph } from "@/lib/seo/schema"
import { JsonLd } from "@/components/seo/json-ld"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  try {
    const post = await getPostBySlug(slug)

    if (!post) {
      return buildNoIndexMetadata("Post Not Found")
    }

    return buildBlogMetadata({ post, isArticle: true })
  } catch (error) {
    console.error('Error generating metadata:', error)
    return buildNoIndexMetadata("Blog Post")
  }
}

export default async function BlogArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  try {
    const post = await getPostBySlug(slug)

    if (!post) {
      notFound()
    }

    return <BlogPostContent post={post} />
  } catch (error) {
    console.error('Error fetching blog post:', error)
    notFound()
  }
}

function BlogPostContent({ post }: { post: WordPressPost }) {
  const readTime = calculateReadingTime(post.content)
  const publishedDate = formatDate(post.date)
  const category = post.categories.nodes[0]?.name || "Guides"
  const { toc, content } = buildToc(post.content)

  const blogPostJsonLd = buildBlogArticleSchemaGraph(post)

  return (
    <div className="min-h-screen bg-white">
      <JsonLd schema={blogPostJsonLd} id={`blog-post-schema-${post.slug}`} />
      <TheirsNav />

      <main className="pt-8 sm:pt-12 pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">

          {/* Semantic Breadcrumbs (matches Schema.org BreadcrumbList) */}
          <nav aria-label="Breadcrumb" className="mb-6 sm:mb-8 flex items-center gap-2 text-xs sm:text-sm text-[#777]">
            <Link href="/" className="hover:text-[#181925] transition-colors">
              Home
            </Link>
            <span className="text-[#bbb]">/</span>
            <Link href="/blog" className="hover:text-[#181925] transition-colors">
              Stories &amp; Guides
            </Link>
            <span className="text-[#bbb]">/</span>
            <span className="text-[#181925] font-medium truncate max-w-[200px] sm:max-w-md">
              {post.title}
            </span>
          </nav>

          {/* Article Header */}
          <header className="mb-8 sm:mb-10">
            {/* Category & Meta */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#f7f7f8] text-[#555] border border-black/[0.08]">
                {category}
              </span>
              <div className="flex items-center gap-1.5 text-xs text-[#777]">
                <Calendar className="w-3.5 h-3.5 text-[#999]" />
                <span>{publishedDate}</span>
              </div>
              <span className="text-[#ccc]">•</span>
              <div className="flex items-center gap-1.5 text-xs text-[#777]">
                <Clock className="w-3.5 h-3.5 text-[#999]" />
                <span>{readTime}</span>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-5xl lg:text-[52px] font-medium tracking-tight text-[#181925] leading-[1.12] mb-6">
              {post.title}
            </h1>

            {/* Excerpt */}
            {post.excerpt && (
              <div
                className="text-lg sm:text-xl text-[#555] leading-relaxed mb-6 font-serif italic"
                dangerouslySetInnerHTML={{ __html: post.excerpt }}
                suppressHydrationWarning
              />
            )}

            {/* Author & Share Bar */}
            <div className="flex items-center justify-between gap-4 py-4 border-y border-black/[0.08]">
              <div className="flex items-center gap-3">
                {post.author.node.avatar?.url ? (
                  <Image
                    src={post.author.node.avatar.url}
                    alt={post.author.node.name}
                    width={40}
                    height={40}
                    className="rounded-full border border-black/[0.08] object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 bg-neutral-100 rounded-full flex items-center justify-center border border-black/[0.08]">
                    <User className="w-5 h-5 text-[#888]" />
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-[#181925] leading-none">{post.author.node.name}</p>
                  <p className="text-xs text-[#777] mt-1">Editorial Contributor</p>
                </div>
              </div>

              <ShareButton
                title={post.title}
                url={`https://theirs.page/blog/${post.slug}`}
                text={post.excerpt || `Read this guide on Theirs: ${post.title}`}
              />
            </div>
          </header>

          {/* Featured Image */}
          {post.featuredImage?.node?.sourceUrl && (
            <div className="w-full mb-10">
              <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] bg-neutral-100 rounded-2xl sm:rounded-3xl overflow-hidden border border-black/[0.06] shadow-xs">
                <Image
                  src={post.featuredImage.node.sourceUrl}
                  alt={post.featuredImage.node.altText || post.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 800px) 100vw, 800px"
                  priority
                />
              </div>
            </div>
          )}

          {/* Table of Contents (collapsible drawer on mobile, inline guide on tablet/desktop, plus wide floating rail) */}
          <TableOfContents items={toc} />

          {/* Prose Content */}
          <article className="min-w-0">
            <BlogContentRenderer
              content={content}
              className="blog-prose"
            />
          </article>

          {/* Premium Author & Editorial E-E-A-T Box */}
          <AuthorBox
            author={post.author.node}
            publishedDate={publishedDate}
            category={category}
          />

        </div>

        {/* Global Conversion CTA */}
        <div className="mt-20">
          <CtaBanner />
        </div>
      </main>

      <TheirsFooter />
    </div>
  )
}
