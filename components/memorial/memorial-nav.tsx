"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { Share2, Plus, Check } from "lucide-react"
import type { ContributionType } from "./contribute-modal"
import type { SectionSettings } from "@/types/theirs"

interface MemorialNavProps {
  slug: string
  fullName: string
  birthYear?: number | null
  deathYear?: number | null
  sectionSettings?: SectionSettings | null
  onOpenContribute: (type?: ContributionType) => void
}

export function MemorialNav({
  slug,
  fullName,
  birthYear: _birthYear,
  deathYear: _deathYear,
  sectionSettings,
  onOpenContribute,
}: MemorialNavProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [copied, setCopied] = useState(false)
  const [activeSection, setActiveSection] = useState<string>("about")

  const firstName = fullName.split(" ")[0] || fullName
  const rootPath = `/${slug}`
  const isHome = pathname === rootPath
  const previewSuffix = searchParams.get("preview") === "visitor" ? "?preview=visitor" : ""
  const withPreview = (path: string) => {
    if (!previewSuffix) return path
    const [base, hash] = path.split("#")
    return `${base}${previewSuffix}${hash ? `#${hash}` : ""}`
  }
  const navItems = useMemo(() => [
    { id: "about", label: "About", href: `${rootPath}#about`, enabled: true },
    { id: "tributes", label: "Tributes", href: `${rootPath}/tributes`, enabled: sectionSettings?.tributes !== false },
    { id: "timeline", label: "Timeline", href: `${rootPath}/timeline`, enabled: sectionSettings?.timeline !== false },
    { id: "gallery", label: "Gallery", href: `${rootPath}/gallery`, enabled: sectionSettings?.gallery !== false },
    { id: "memories", label: "Stories", href: `${rootPath}/memories`, enabled: sectionSettings?.stories !== false },
  ].filter((item) => item.enabled), [rootPath, sectionSettings])

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : `https://theirs.page/${slug}`
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) element.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    if (!isHome) {
      const syncRouteSection = () => {
        if (pathname.endsWith("/tributes")) setActiveSection("tributes")
        else if (pathname.endsWith("/gallery")) setActiveSection("gallery")
        else if (pathname.endsWith("/memories")) setActiveSection("memories")
        else if (pathname.endsWith("/timeline")) setActiveSection("timeline")
      }
      syncRouteSection()
      window.addEventListener("hashchange", syncRouteSection)
      return () => window.removeEventListener("hashchange", syncRouteSection)
    }

    const handleScroll = () => {
      const scrollPos = window.scrollY + 180
      let nextActive = navItems[0]?.id || "about"
      for (let index = navItems.length - 1; index >= 0; index--) {
        const item = navItems[index]
        const element = document.getElementById(item.id)
        if (element && scrollPos >= element.offsetTop) {
          nextActive = item.id
          break
        }
      }
      setActiveSection(nextActive)
    }

    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [isHome, pathname, navItems])

  return (
    <>
      <nav className="fixed top-3 inset-x-0 z-40 flex justify-center px-2.5 sm:px-4 pointer-events-none">
        <div className="pointer-events-auto flex items-center justify-between gap-1 sm:gap-3 px-2.5 sm:px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-xl border border-black/[0.08] shadow-[0_4px_24px_rgba(0,0,0,0.06)] max-w-xl w-full transition-all">
          <Link
            href={withPreview(rootPath)}
            prefetch
            className="flex items-center gap-1.5 text-xs font-semibold tracking-tight text-[#181925] hover:opacity-80 transition-opacity select-none shrink-0 pl-1"
            title="Return to memorial home"
          >
            <span className="size-1.5 rounded-full bg-primary" />
            <span className="truncate max-w-[70px] sm:max-w-[100px]">{firstName}</span>
          </Link>

          <div className="flex items-center gap-0.5 sm:gap-1 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden py-0.5 px-0.5">
            {navItems.map((item) => {
              const isActive = activeSection === item.id
              const className = `px-2 sm:px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-medium whitespace-nowrap transition-all select-none cursor-pointer shrink-0 ${isActive
                ? "text-[#181925] bg-[#f0f0f2] font-semibold"
                : "text-[#666] hover:text-[#181925] hover:bg-neutral-50"
                }`

              return isHome ? (
                <button key={item.id} type="button" onClick={() => scrollToSection(item.id)} className={className}>
                  {item.label}
                </button>
              ) : (
                <Link key={item.id} href={withPreview(item.href)} prefetch className={className}>
                  {item.label}
                </Link>
              )
            })}
          </div>

          <div className="flex items-center gap-1 shrink-0 pr-0.5">
            <button
              type="button"
              onClick={handleShare}
              className="size-7 rounded-full text-[#666] hover:text-[#181925] hover:bg-neutral-100 flex items-center justify-center transition-colors cursor-pointer"
              title="Share memorial link"
              aria-label="Share memorial link"
            >
              {copied ? <Check className="size-3.5 text-emerald-600" /> : <Share2 className="size-3.5" />}
            </button>

            <button
              type="button"
              onClick={() => onOpenContribute()}
              className="hidden sm:inline-flex items-center justify-center gap-1 whitespace-nowrap !rounded-full font-medium transition-all cursor-pointer border border-[color-mix(in_srgb,var(--primary)_80%,#3a3480)] bg-[color-mix(in_srgb,var(--primary)_90%,#3a3480)] text-primary-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.22),inset_0_-1px_0_rgba(58,52,128,0.30)] transform-gpu hover:bg-primary hover:border-[color-mix(in_srgb,var(--primary)_70%,#3a3480)] active:translate-y-px active:scale-[0.98] h-7.5 px-3.5 text-xs select-none"
            >
              <Plus className="size-3" />
              <span>Add</span>
            </button>
          </div>
        </div>
      </nav>

      <button
        type="button"
        onClick={() => onOpenContribute()}
        className="sm:hidden fixed bottom-6 right-5 z-50 size-12 rounded-full border border-[color-mix(in_srgb,var(--primary)_80%,#3a3480)] bg-[color-mix(in_srgb,var(--primary)_90%,#3a3480)] text-primary-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.22),inset_0_-1px_0_rgba(58,52,128,0.30),0_8px_24px_rgba(48,93,222,0.35)] flex items-center justify-center active:scale-90 transition-all cursor-pointer hover:bg-primary"
        aria-label="Add to memorial"
        title="Add to memorial"
      >
        <Plus className="size-5" />
      </button>
    </>
  )
}
