"use client"

import { useEffect, useState } from "react"
import { ChevronDown, List } from "lucide-react"

export interface TocItem {
  id: string
  text: string
  level: number
}

interface TableOfContentsProps {
  items: TocItem[]
}

export function TableOfContents({ items }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("")
  const [readingProgress, setReadingProgress] = useState<number>(0)
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false)

  // 1. Scrollspy: Track active heading with IntersectionObserver
  useEffect(() => {
    if (!items.length) return

    const headingElements = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => Boolean(el))

    if (!headingElements.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries.filter((e) => e.isIntersecting)
        if (visibleEntries.length > 0) {
          setActiveId(visibleEntries[0].target.id)
        }
      },
      {
        rootMargin: "-90px 0px -60% 0px",
        threshold: 0.1,
      }
    )

    headingElements.forEach((el) => observer.observe(el))

    if (!activeId && items[0]) {
      setActiveId(items[0].id)
    }

    return () => observer.disconnect()
  }, [items, activeId])

  // 2. Reading Progress Tracker
  useEffect(() => {
    const handleScroll = () => {
      const article = document.querySelector("article")
      if (!article) return

      const rect = article.getBoundingClientRect()
      const totalHeight = rect.height - window.innerHeight
      if (totalHeight <= 0) return

      const current = Math.max(0, -rect.top)
      const progress = Math.min(100, Math.round((current / totalHeight) * 100))
      setReadingProgress(progress)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // 3. Smooth scroll handler
  const handleItemClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault()
    const target = document.getElementById(id)
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" })
      window.history.pushState(null, "", `#${id}`)
      setActiveId(id)
      setIsMobileOpen(false)
    }
  }

  if (!items || items.length <= 1) return null

  return (
    <nav
      aria-label="Table of contents"
      className="rounded-2xl border border-black/[0.08] bg-[#fafafb] p-4 sm:p-5 mb-10 transition-all"
    >
      {/* Header Row */}
      <div
        className={`flex items-center justify-between transition-all ${
          isMobileOpen
            ? "pb-3 border-b border-black/[0.06]"
            : "sm:pb-3 sm:border-b sm:border-black/[0.06]"
        }`}
      >
        <div className="flex items-center gap-2">
          <List className="w-3.5 h-3.5 text-[#666]" />
          <span className="text-xs font-semibold text-[#181925] tracking-tight">
            In this guide
          </span>
          <span className="text-[11px] bg-neutral-100 text-[#666] border border-black/[0.06] px-2 py-0.5 rounded-full font-medium ml-1 select-none">
            {items.length} sections
          </span>
        </div>

        <div className="flex items-center gap-3">
          {readingProgress > 0 && (
            <span className="text-xs font-mono text-[#888] select-none">
              {readingProgress}% read
            </span>
          )}

          {/* Mobile toggle button */}
          <button
            type="button"
            onClick={() => setIsMobileOpen((prev) => !prev)}
            className="sm:hidden flex items-center gap-1 text-xs text-[#666] hover:text-[#181925] cursor-pointer select-none"
            aria-expanded={isMobileOpen}
          >
            <span>{isMobileOpen ? "Hide" : "Show"}</span>
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform duration-200 ${
                isMobileOpen ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {/* Links List: Always open on sm+, expandable on mobile */}
      <div className={`${isMobileOpen ? "block" : "hidden sm:block"} pt-3`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-1.5">
          {items.map((item, index) => {
            const isActive = activeId === item.id
            const isH3 = item.level === 3

            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => handleItemClick(e, item.id)}
                className={`group text-xs py-1.5 px-2.5 rounded-lg transition-colors flex items-start gap-2 ${
                  isActive
                    ? "bg-neutral-200/60 text-[#181925] font-medium"
                    : "text-[#555] hover:text-[#181925] hover:bg-black/[0.03]"
                } ${isH3 ? "pl-5 text-[11px]" : ""}`}
              >
                <span
                  className={`text-[10px] pt-0.5 font-mono shrink-0 select-none ${
                    isActive ? "text-primary font-semibold" : "text-[#aaa] group-hover:text-[#777]"
                  }`}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="leading-snug truncate">{item.text}</span>
              </a>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
