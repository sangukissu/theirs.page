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

const DEFAULT_MILESTONES: TimelineMilestone[] = [
  {
    year: 1948,
    chapter: "Chapter I",
    title: "Born in Exeter, Devon",
    description: "Born in autumn at St. Leonard’s Hospital, the younger of two sons raised on the edge of the Devon moors.",
    location: "Exeter, Devon",
  },
  {
    year: 1968,
    chapter: "Chapter II",
    title: "Horological Apprenticeship in London",
    description: "Moved to Clerkenwell to study under master watchmakers, learning to craft mechanical balance wheels and clock pendulums by hand.",
    location: "Clerkenwell, London",
    photoUrl: "/old-school-photo.webp",
  },
  {
    year: 1974,
    chapter: "Chapter III",
    title: "Married Meena at St. Jude’s",
    description: "Married Meena Sharma on a warm July afternoon. They bought a small stone cottage near Dartmoor and began their fifty-year life together.",
    location: "St. Jude’s Church",
    photoUrl: "/historical-wedding-photo.webp",
  },
  {
    year: 1983,
    chapter: "Chapter IV",
    title: "Founded Carter Clocks & Woodworking",
    description: "Opened his independent workshop on the high street. Over 35 years, repaired thousands of family heirloom clocks for three generations.",
    location: "Devon High Street",
  },
  {
    year: 2004,
    chapter: "Chapter V",
    title: "Welcomed Granddaughter Anita",
    description: "Became a grandfather. Spent weekends teaching her how to identify wild Dartmoor ponies and repair wooden furniture.",
    location: "Devon Cottage",
    photoUrl: "/memorial-family-portrait-combined.jpg",
  },
  {
    year: 2018,
    chapter: "Chapter VI",
    title: "Retirement & The Rose Garden",
    description: "Handed over workshop keys to his senior apprentice and spent his days tending ninety varieties of heritage English roses.",
    location: "Dartmoor Cottage",
  },
  {
    year: 2024,
    chapter: "Chapter VII",
    title: "Laid to Rest on the Moors",
    description: "Passed away peacefully at home with Meena and his children by his side. Buried on the hillside overlooking the Devon moors he walked every morning.",
    location: "Dartmoor, Devon",
  },
]

interface LifeTimelineProps {
  milestones?: TimelineMilestone[]
}

export function LifeTimeline({ milestones = DEFAULT_MILESTONES }: LifeTimelineProps) {
  return (
    <section id="timeline" className="py-12 sm:py-16 px-4 max-w-4xl mx-auto">
      <div className="flex flex-col gap-8">
        
        {/* Section Heading */}
        <div className="flex flex-col gap-1.5 border-b border-black/[0.06] pb-6">
          <span className="text-xs font-mono font-medium text-primary uppercase tracking-wider">
            Chronology
          </span>
          <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-[#181925]">
            Life Timeline & Milestones
          </h2>
          <p className="text-xs sm:text-sm text-[#666]">
            Anchor every memory to the chapter of life when it happened.
          </p>
        </div>

        {/* Vertical Timeline Hairline Track */}
        <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-2 before:top-3 before:bottom-3 before:w-px before:bg-black/[0.08]">
          {milestones.map((item) => (
            <div key={item.year} className="relative flex flex-col gap-2">
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

                <span className="text-[10px] font-mono text-[#888] uppercase tracking-wider bg-neutral-100 px-2 py-0.5 rounded-full">
                  {item.chapter}
                </span>
              </div>

              {/* Location Tag */}
              {item.location && (
                <div className="flex items-center gap-1.5 text-[11px] text-[#888]">
                  <MapPin className="size-3 text-[#aaa]" />
                  <span>{item.location}</span>
                </div>
              )}

              {/* Description */}
              <p className="text-xs sm:text-sm text-[#555] leading-relaxed max-w-xl">
                {item.description}
              </p>

              {/* Optional Milestone Photograph */}
              {item.photoUrl && (
                <div className="mt-1 w-full max-w-md rounded-2xl overflow-hidden bg-neutral-100 border border-black/[0.06] p-1.5 bg-white">
                  <div className="aspect-16/9 rounded-xl overflow-hidden">
                    <img
                      src={item.photoUrl}
                      alt={item.title}
                      className="size-full object-cover grayscale"
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
