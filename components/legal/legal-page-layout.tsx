"use client"

import type React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { TheirsNav } from "@/components/theirs/nav"
import { TheirsFooter } from "@/components/theirs/footer"
import { ShieldCheck, Scale, HeartHandshake, RefreshCw } from "lucide-react"

interface HighlightItem {
  title: string
  description: string
}

interface LegalPageLayoutProps {
  title: string
  description: string
  lastUpdated?: string
  highlights?: HighlightItem[]
  children: React.ReactNode
}

const POLICY_TABS = [
  { href: "/privacy", label: "Privacy Policy", icon: ShieldCheck },
  { href: "/terms", label: "Terms of Service", icon: Scale },
  { href: "/guidelines", label: "Memorial & Content Guidelines", icon: HeartHandshake },
  { href: "/refunds", label: "Refund Policy", icon: RefreshCw },
]

export function LegalPageLayout({
  title,
  description,
  lastUpdated = "March 2026",
  highlights = [],
  children,
}: LegalPageLayoutProps) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between selection:bg-primary/10 selection:text-primary">
      {/* Floating Pill Nav */}
      <TheirsNav />

      {/* Main Reading Container */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14 pb-20">

        {/* Editorial Header */}
        <div className="flex flex-col gap-3 pb-8 border-b border-black/[0.06]">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-black/[0.06] bg-[#fafafb] px-3.5 py-1 text-xs text-[#666] select-none shadow-2xs">
              <span className="size-1.5 rounded-full bg-primary" />
              <span className="font-mono uppercase text-[11px] tracking-wider text-[#555]">
                Platform Policy & Legal
              </span>
            </div>

            <span className="text-xs font-mono text-[#888]">
              {lastUpdated}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-[#181925] mt-1">
            {title}
          </h1>

          <p className="text-base sm:text-lg text-[#666] leading-relaxed max-w-2xl">
            {description}
          </p>
        </div>

        {/* Policy Quick-Switcher Navigation Bar */}
        <nav aria-label="Legal Documents" className="my-8 overflow-x-auto pb-1 scrollbar-none">
          <div className="inline-flex items-center gap-1.5 p-1 rounded-full bg-[#f4f4f6] border border-black/[0.06]">
            {POLICY_TABS.map((tab) => {
              const isActive = pathname === tab.href
              const Icon = tab.icon
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`inline-flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all select-none whitespace-nowrap ${isActive
                      ? "bg-white text-[#181925] shadow-xs"
                      : "text-[#666] hover:text-[#181925] hover:bg-black/[0.03]"
                    }`}
                >
                  <Icon className={`size-3.5 shrink-0 ${isActive ? "text-primary" : "text-[#888]"}`} />
                  <span>{tab.label}</span>
                </Link>
              )
            })}
          </div>
        </nav>

        {/* Core Highlights Box */}
        {highlights.length > 0 && (
          <div className="mb-12 p-5 sm:p-6 rounded-3xl bg-[#fafafb] border border-black/[0.07] flex flex-col gap-4">
            <span className="text-xs font-mono font-medium uppercase tracking-wider text-primary">
              Core Commitments & Summary
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 pt-2 border-t border-black/[0.05]">
              {highlights.map((h, i) => (
                <div key={i} className="flex flex-col gap-1.5">
                  <h2 className="text-xs sm:text-sm font-medium text-[#181925]">
                    {h.title}
                  </h2>
                  <p className="text-xs text-[#71717a] leading-relaxed">
                    {h.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Legal Prose Body */}
        <article className="legal-prose flex flex-col gap-10 text-sm sm:text-base text-[#454545] leading-relaxed">
          {children}
        </article>


      </main>

      {/* Footer */}
      <TheirsFooter />
    </div>
  )
}
