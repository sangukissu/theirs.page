"use client"

import { MapPin, Calendar, Image as ImageIcon } from "lucide-react"

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
        <div className="flex flex-col gap-1.5 border-b border-black/[0.06] pb-4">
          <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-[#181925]">
            Life Timeline & Milestones
          </h2>
        </div>

        {/* Vertical Timeline Hairline Track / Empty State */}
        {activeMilestones.length === 0 ? (
          <div className="py-12 text-center text-sm text-[#71717a] rounded-3xl bg-[#fafafb] border border-black/[0.06]">
            No timeline milestones added yet.
          </div>
        ) : (
          <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-2 before:top-3 before:bottom-3 before:w-px before:bg-black/[0.08]">
            {activeMilestones.map((item, idx) => (
              <div key={item.year ? `${item.year}-${idx}` : idx} className="relative flex flex-col gap-2">
                {/* Timeline Node Dot */}
                <span className="absolute -left-[21px] sm:-left-[29px] top-1 size-2.5 rounded-full bg-primary ring-4 ring-white" />

                {/* Header Info */}
                <div className="flex items-baseline justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-sm font-semibold text-primary">
                      {item.year}
                    </span>
                    <h3 className="text-sm sm:text-base font-medium text-[#181925]">
                      {item.title}
                    </h3>
                  </div>

                  {item.chapter && (
                    <span className="text-[10px] font-mono text-[#888] uppercase tracking-wider bg-neutral-100 px-2 py-0.5 rounded-full">
                      {item.chapter}
                    </span>
                  )}
                </div>

                {/* Body Text */}
                {item.description && (
                  <p className="text-xs sm:text-sm text-[#555] leading-relaxed max-w-2xl">
                    {item.description}
                  </p>
                )}

                {/* Optional Attached Photograph Preview */}
                {item.photoUrl && (
                  <div className="mt-2 max-w-sm rounded-2xl overflow-hidden border border-black/[0.06] bg-neutral-100">
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
                  <div className="flex items-center gap-1 text-[11px] font-mono text-[#888] mt-1">
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
