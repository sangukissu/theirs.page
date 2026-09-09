import Link from "next/link"
import { cn } from "@/lib/utils"
import { Calendar, Clock, ArrowRight } from "lucide-react"
import Image from "next/image"

interface BlogCardProps {
  title: string
  excerpt: string
  slug: string
  publishedAt: string
  readTime: string
  category: string
  image: string
  featured?: boolean
}

export default function BlogCard({
  title,
  excerpt,
  slug,
  publishedAt,
  readTime,
  category,
  image,
  featured = false,
}: BlogCardProps) {
  return (
    <article className="group h-full">
      <Link href={`/blog/${slug}`} className="block h-full">
        <div className="bg-white rounded-2xl p-4 sm:p-5 flex flex-col h-full transition-all duration-200 border border-black/[0.08] hover:border-black/[0.16] hover:shadow-[0_8px_24px_rgba(0,0,0,0.04)]">
          {/* Image Container */}
          <div className="relative overflow-hidden aspect-[16/10] w-full rounded-xl bg-neutral-100 mb-4 border border-black/[0.04]">
            <Image
              src={image || "/placeholder.svg"}
              alt={title}
              fill
              priority={featured}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
            />
            {category && (
              <div className="absolute top-3 left-3">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-white/95 text-[#444] shadow-xs backdrop-blur-xs border border-black/[0.08]">
                  {category}
                </span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex flex-col flex-grow">
            {/* Meta */}
            <div className="flex items-center text-xs text-[#888] mb-2.5 gap-3">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#aaa]" />
                <span>{publishedAt}</span>
              </div>
              <span className="text-[#ccc]">•</span>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#aaa]" />
                <span>{readTime}</span>
              </div>
            </div>

            {/* Title */}
            <h2 className="text-lg sm:text-xl font-medium text-[#181925] mb-2.5 leading-snug group-hover:text-primary transition-colors line-clamp-2">
              {title}
            </h2>

            {/* Excerpt */}
            {excerpt && (
              <p className="text-[#666] text-sm leading-relaxed line-clamp-3 mb-5 flex-grow">
                {excerpt}
              </p>
            )}

            {/* Read Story */}
            <div className="flex items-center text-xs font-medium text-[#181925] group-hover:text-primary transition-colors mt-auto pt-3 border-t border-black/[0.05]">
              <span>Read guide</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1.5 transition-transform duration-200 group-hover:translate-x-1" />
            </div>
          </div>
        </div>
      </Link>
    </article>
  )
}
