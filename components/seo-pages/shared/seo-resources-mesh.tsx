import Link from "next/link"
import { SectionHeader } from "@/components/theirs/section-header"

interface ResourceItem {
  href: string
  badge: string
  title: string
  description: string
}

const ALL_RESOURCES: ResourceItem[] = [
  {
    href: "/create-online-memorial",
    badge: "Step-by-step",
    title: "Create an Online Memorial →",
    description: "How to set up a lasting memorial page for someone you love in minutes.",
  },
  {
    href: "/free-online-memorial",
    badge: "Free Option",
    title: "Free Online Memorial →",
    description: "Learn what $0 includes and publish a free memorial page without a credit card.",
  },
  {
    href: "/memorial-website-examples",
    badge: "Showcase",
    title: "Memorial Website Examples →",
    description: "Explore real memorials, layout ideas, and collaborative family pages.",
  },
  {
    href: "/best-online-memorial-websites",
    badge: "Comparison",
    title: "Best Online Memorial Websites →",
    description: "An honest 2026 comparison of pricing, features, ads, and privacy across platforms.",
  },
  {
    href: "/memorial-website-cost",
    badge: "Pricing Guide",
    title: "Memorial Website Cost →",
    description: "What memorial websites cost and how to avoid indefinite monthly subscriptions.",
  },
  {
    href: "/private-online-memorial",
    badge: "Privacy",
    title: "Private Online Memorial →",
    description: "How password protection and unlisted URLs safeguard private family memories.",
  },
  {
    href: "/online-memorial-vs-obituary",
    badge: "Guide",
    title: "Online Memorial vs Obituary →",
    description: "Understand the key differences between a static death notice and an alive memorial.",
  },
  {
    href: "/gift-a-memorial",
    badge: "Memorial Gift",
    title: "Gift an Online Memorial →",
    description: "A lasting prepaid memorial for a grieving family instead of flowers that wilt.",
  },
  {
    href: "/what-to-include-in-online-memorial",
    badge: "Memorial Ideas",
    title: "What to Include in a Memorial →",
    description: "Checklist of photographs, stories, milestones, and audio tributes to gather.",
  },
]

interface SeoResourcesMeshProps {
  currentPath: string
  title?: string
  description?: string
  limit?: number
}

export function SeoResourcesMesh({
  currentPath,
  title = "Helpful guides and resources for remembering loved ones.",
  description = "Browse examples, compare pricing models, and learn how to create a meaningful family archive.",
  limit = 4,
}: SeoResourcesMeshProps) {
  const filtered = ALL_RESOURCES.filter((r) => r.href !== currentPath).slice(0, limit)

  return (
    <section className="py-16 sm:py-24 px-4 max-w-5xl mx-auto border-t border-black/[0.06]">
      <SectionHeader
        badge="Explore Resources"
        title={title}
        description={description}
      />

      <div className="mt-12 sm:mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filtered.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group p-5 rounded-2xl bg-[#fafafa] border border-black/[0.06] hover:border-black/20 hover:bg-white transition-all flex flex-col justify-between"
          >
            <div>
              <div className="font-mono text-[10px] text-primary uppercase tracking-wider mb-2 font-semibold">
                {item.badge}
              </div>
              <h4 className="text-sm font-medium text-[#181925] group-hover:text-primary transition-colors">
                {item.title}
              </h4>
              <p className="mt-1.5 text-xs text-[#666] leading-relaxed">
                {item.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
