import Image from "next/image"
import Link from "next/link"
import { ShieldCheck, Sparkles, BookOpen, ArrowRight, User } from "lucide-react"

interface AuthorBoxProps {
  author: {
    name: string
    avatar?: {
      url: string
    }
  }
  publishedDate?: string
  category?: string
}

export function AuthorBox({ author, publishedDate, category = "Guides" }: AuthorBoxProps) {
  const authorName = author.name && author.name.includes("@")
    ? "Theirs Editorial Team"
    : author.name || "Theirs Editorial Team"

  return (
    <section
      aria-label="Author and editorial information"
      className="mt-14 pt-8 border-t border-black/[0.08]"
    >
      <div className="rounded-2xl border border-black/[0.08] bg-[#fafafb] p-6 sm:p-8">

        {/* Top: Author profile */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 mb-6">
          {/* Avatar */}
          <div className="relative size-16 sm:size-18 shrink-0 rounded-full overflow-hidden border border-black/[0.08] bg-neutral-100 shadow-xs">
            {author.avatar?.url ? (
              <Image
                src={author.avatar.url}
                alt={authorName}
                fill
                className="object-cover"
                sizes="72px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-neutral-100 text-[#888]">
                <User className="w-8 h-8 text-[#999]" />
              </div>
            )}
          </div>

          {/* Identity & Role */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-xs uppercase tracking-wider font-semibold text-[#888]">
                Written by
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                <ShieldCheck className="w-3 h-3" />
                Verified Contributor
              </span>
            </div>

            <h3 className="text-xl font-medium text-[#181925] tracking-tight">
              {authorName}
            </h3>

            <p className="text-xs text-[#666] mt-0.5">
              Memorial Archivist &amp; Editorial Contributor at Theirs
            </p>
          </div>
        </div>

        {/* Bio */}
        <p className="text-sm text-[#555] leading-relaxed mb-6">
          Dedicated to helping families celebrate and preserve the authentic lives of those they love.
          Focuses on collaborative storytelling, high-resolution media preservation, and gentle,
          ad-free memorial archiving that keeps family legacies alive across generations.
        </p>



      </div>
    </section>
  )
}
