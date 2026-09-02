"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"

export function TheirsFaq() {
  const [openIdx, setOpenIdx] = useState<number | null>(0)

  const faqs = [
    {
      q: "Do family members or friends need an account to contribute?",
      a: "No. Grieving family members and busy friends shouldn't have to fill out registration forms or remember passwords. Anyone with your invite link can submit a memory, voicemail, or photo in seconds.",
    },
    {
      q: "Can I approve memories before they appear on the page?",
      a: "Yes, completely. Every memory submitted by a guest goes into your private curator queue as 'Pending Approval'. Nothing goes public until you approve it.",
    },
    {
      q: "Are photographs kept in their original quality?",
      a: "Yes. Unlike social platforms that aggressively compress family memories, Theirs saves your full original high-resolution images untouched in Cloudflare R2 storage.",
    },
    {
      q: "How does privacy work?",
      a: "You choose between three modes: Public (searchable by name), Unlisted (accessible only via private link), or Private (requires a secure family PIN to unlock).",
    },
    {
      q: "What if I want to download all our photos and stories later?",
      a: "You can download your entire archive in one click anytime — uncompressed original photos, audio files, formatted stories, and an offline HTML viewer that works without internet.",
    },
  ]

  return (
    <section className="py-16 sm:py-24 px-4 max-w-3xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-balance text-3xl font-medium leading-[1.1] tracking-tight text-[#454545] sm:text-4xl">
          Frequently asked questions
        </h2>
      </div>

      <div className="divide-y divide-border rounded-md border border-border bg-white">
        {faqs.map((faq, i) => {
          const isOpen = openIdx === i
          return (
            <div key={i} className="px-5 py-4">
              <button
                type="button"
                onClick={() => setOpenIdx(isOpen ? null : i)}
                className="w-full flex items-center justify-between text-left gap-4"
              >
                <span className="text-sm font-medium text-[#454545] hover:text-primary transition-colors">
                  {faq.q}
                </span>
                <ChevronDown
                  className={`size-4 text-muted-foreground shrink-0 transition-transform duration-200 ${
                    isOpen ? "rotate-180 text-primary" : ""
                  }`}
                />
              </button>

              {isOpen && (
                <p className="mt-2.5 text-xs sm:text-sm text-muted-foreground leading-relaxed pr-6">
                  {faq.a}
                </p>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
