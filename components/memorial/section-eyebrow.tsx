"use client"

import React from "react"

export type SectionEyebrowKind = "story" | "tributes" | "timeline" | "gallery" | "memories"

export const SECTION_EMBLEM_ICONS: Record<SectionEyebrowKind, (className?: string) => React.ReactNode> = {
  story: (className = "size-5 sm:size-6") => (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20.5 3.5c-4.5.5-9 3.5-12 8.5-2 3.3-2.8 7-3.5 10 3-.7 6.7-1.5 10-3.5 5-3 8-7.5 8.5-12-1-.5-2-.5-3-3Z" />
      <path d="M8.5 12c2.5 1 5 3.5 6 6" />
      <path d="M5 22l3-3" />
    </svg>
  ),
  tributes: (className = "size-5 sm:size-6") => (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 22v-9" />
      <path d="M12 13c-3-1-4.5-4.5-2-6.5 1.5-.5 3 1 2 2.5 0-2 2-3.5 3.5-2.5 2 2 .5 5.5-2 6.5" />
      <path d="M12 17c-2.5-2-5-1.5-6 .5 2 .8 4.5.5 6-.5Z" />
      <path d="M12 19c2.5-2 5-1.5 6 .5-2 .8-4.5.5-6-.5Z" />
    </svg>
  ),
  timeline: (className = "size-5 sm:size-6") => (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 17c3.5-7 7 3 11-4s4.5-5 7-4" />
      <circle cx="3" cy="17" r="1.75" fill="currentColor" />
      <circle cx="14" cy="13" r="1.75" fill="currentColor" />
      <circle cx="21" cy="9" r="1.75" fill="currentColor" />
    </svg>
  ),
  gallery: (className = "size-5 sm:size-6") => (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="4" width="18" height="16" rx="2.5" />
      <circle cx="8.5" cy="9.5" r="1.5" />
      <path d="m21 16-5-5-6 6-3-3-4 4" />
    </svg>
  ),
  memories: (className = "size-5 sm:size-6") => (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
      <path d="M8 7h8M8 11h8M8 15h4" />
    </svg>
  ),
}

export function SectionEmblem({
  kind,
  className = "size-5 sm:size-6",
}: {
  kind: SectionEyebrowKind
  className?: string
}) {
  const iconRender = SECTION_EMBLEM_ICONS[kind]
  if (!iconRender) return null

  return (
    <span
      className={`inline-flex items-center justify-center text-[var(--theme-accent)] shrink-0 select-none opacity-90 ${className}`}
      aria-hidden="true"
    >
      {iconRender(className)}
    </span>
  )
}

const SHORT_LABELS: Record<SectionEyebrowKind, string> = {
  story: "Life",
  tributes: "Honor",
  timeline: "Journey",
  gallery: "Archive",
  memories: "Reflections",
}

interface SectionEyebrowProps {
  kind: SectionEyebrowKind
  customLabel?: string
  className?: string
}

export function SectionEyebrow({
  kind,
  customLabel,
  className = "",
}: SectionEyebrowProps) {
  const iconRender = SECTION_EMBLEM_ICONS[kind]
  const label = customLabel || SHORT_LABELS[kind]

  return (
    <div
      className={`inline-flex items-center gap-1.5 text-[var(--theme-accent)] select-none opacity-90 whitespace-nowrap ${className}`}
      aria-hidden="true"
    >
      <span className="shrink-0">{iconRender("size-3.5 sm:size-4")}</span>
      <span className="text-[10px] sm:text-[11px] font-semibold tracking-[0.12em] uppercase text-[var(--theme-accent)]">
        {label}
      </span>
    </div>
  )
}
