"use client"

import { MapPin, Calendar, Image as ImageIcon } from "lucide-react"
import { SectionEyebrow } from "./section-eyebrow"

export interface TimelineMilestone {
  year: number
  title: string
  description: string
  chapter: string
  location?: string
  photoUrl?: string
}

interface LifeTimelineProps {
  milestones?: TimelineMilestone[]
  isDemo?: boolean
}

export function LifeTimeline({ milestones, isDemo = false }: LifeTimelineProps) {
  const activeMilestones = milestones || []

  return (
    <section id="timeline" className="py-12 px-4 max-w-4xl mx-auto scroll-mt-24">
      <div className="flex flex-col gap-4">

        {/* Section Heading */}
        <div className="flex flex-col gap-0.5 border-b border-[var(--theme-border)] pb-3.5 sm:pb-4">
          <SectionEyebrow kind="timeline" />
          <h2 className="text-xl sm:text-2xl md:text-3xl font-medium tracking-tight text-[var(--theme-text-primary)] leading-tight">
            Life Timeline & Milestones
          </h2>
        </div>

        {/* Vertical Timeline Hairline Track / Empty State */}
        {activeMilestones.length === 0 ? (
          <div className="py-12 text-center text-sm text-[var(--theme-text-muted)] rounded-3xl bg-[var(--theme-bg-surface-subtle)] border border-[var(--theme-border)]">
            No timeline milestones added yet.
          </div>
        ) : (
          <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-2 before:top-3 before:bottom-3 before:w-px before:bg-[var(--theme-border)]">
            {activeMilestones.map((item, idx) => (
              <div key={item.year ? `${item.year}-${idx}` : idx} className="relative flex flex-col gap-2">
                {/* Timeline Node Dot */}
                <span className="absolute -left-[21px] sm:-left-[29px] top-1 size-2.5 rounded-full bg-[var(--theme-accent)] ring-4 ring-[var(--theme-bg-page)]" />

                {/* Header Info */}
                <div className="flex items-baseline justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-sm font-semibold text-[var(--theme-accent)]">
                      {item.year}
                    </span>
                    <h3 className="text-sm sm:text-base font-medium text-[var(--theme-text-primary)]">
                      {item.title}
                    </h3>
                  </div>

                  {item.chapter && (
                    <span className="text-[10px] font-mono text-[var(--theme-text-muted)] uppercase tracking-wider bg-[var(--theme-bg-surface-subtle)] border border-[var(--theme-border)] px-2 py-0.5 rounded-full">
                      {item.chapter}
                    </span>
                  )}
                </div>

                {/* Body Text */}
                {item.description && (
                  <p className="text-xs sm:text-sm text-[var(--theme-text-body)] leading-relaxed max-w-2xl">
                    {item.description}
                  </p>
                )}

                {/* Optional Attached Photograph Preview */}
                {item.photoUrl && (
                  <div className="mt-2 max-w-sm rounded-2xl overflow-hidden border border-[var(--theme-border)] bg-[var(--theme-bg-surface-subtle)]">
                    <img
                      src={item.photoUrl}
                      alt={item.title}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-44 object-cover"
                    />
                  </div>
                )}

                {/* Optional Location Badge */}
                {item.location && (
                  <div className="flex items-center gap-1 text-[11px] font-mono text-[var(--theme-text-muted)] mt-1">
                    <MapPin className="size-3" />
                    <span>{item.location}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  )
}
