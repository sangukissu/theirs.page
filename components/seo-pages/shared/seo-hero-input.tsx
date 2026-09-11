"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface SeoHeroInputProps {
  buttonLabel?: string
  placeholder?: string
  autoFocus?: boolean
  source?: string
}

export function SeoHeroInput({
  buttonLabel = "Create their memorial",
  placeholder = "e.g. Robert Carter",
  autoFocus = false,
}: SeoHeroInputProps) {
  const router = useRouter()
  const [name, setName] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return

    const simpleSlug = trimmed
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")

    try {
      localStorage.setItem(
        "theirs_pending_memorial",
        JSON.stringify({ name: trimmed, slug: simpleSlug })
      )
      document.cookie = `theirs_pending_name=${encodeURIComponent(trimmed)}; path=/; max-age=86400; SameSite=Lax`
      document.cookie = `theirs_pending_slug=${encodeURIComponent(simpleSlug)}; path=/; max-age=86400; SameSite=Lax`
    } catch {}

    router.push(`/login?name=${encodeURIComponent(trimmed)}&slug=${encodeURIComponent(simpleSlug)}`)
  }

  return (
    <div className="w-full max-w-lg flex flex-col items-center gap-2">
      <form
        onSubmit={handleSubmit}
        className="w-full flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2 sm:p-1.5 sm:rounded-full sm:bg-[#f7f7f8] sm:border sm:border-black/[0.08] sm:shadow-2xs transition-colors sm:focus-within:border-primary/50"
      >
        {/* Left Input Field */}
        <div className="flex-1 flex items-center gap-2 px-4 py-2.5 sm:py-1.5 text-sm rounded-full bg-[#f7f7f8] border border-black/[0.08] sm:border-none sm:bg-transparent shadow-2xs sm:shadow-none focus-within:border-primary/50 transition-colors">
          <span className="text-xs sm:text-sm text-[#888] font-medium shrink-0 select-none">
            Their name
          </span>
          <input
            type="text"
            value={name}
            autoFocus={autoFocus}
            maxLength={100}
            onChange={(e) => setName(e.target.value)}
            onFocus={() => router.prefetch("/login")}
            placeholder={placeholder}
            className="w-full bg-transparent font-medium text-[#181925] outline-none placeholder:text-[#aaa] text-sm"
          />
        </div>

        {/* Right Action Button */}
        <button
          type="submit"
          className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap !rounded-full font-medium transition-all cursor-pointer border border-[color-mix(in_srgb,var(--primary)_80%,#8c3a10)] bg-[color-mix(in_srgb,var(--primary)_90%,#8c3a10)] text-primary-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.22),inset_0_-1px_0_rgba(140,58,16,0.35)] transform-gpu hover:bg-primary active:scale-[0.98] h-11 sm:h-10 px-5 text-sm group shrink-0 select-none w-full sm:w-auto"
        >
          <span>{buttonLabel}</span>
          <span className="relative size-3.5 overflow-hidden inline-flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="absolute inset-0 size-3.5 transition-transform duration-200 group-hover:translate-x-3 group-hover:opacity-0"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="absolute inset-0 size-3.5 -translate-x-3 opacity-0 transition-transform duration-200 group-hover:translate-x-0 group-hover:opacity-100"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </span>
        </button>
      </form>
    </div>
  )
}
