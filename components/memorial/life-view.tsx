"use client"

import { useState } from "react"
import { Calendar, MapPin, Plus, BookOpen, Clock, ChevronDown, ChevronUp, Image as ImageIcon } from "lucide-react"
import { TimelineMilestone } from "./life-timeline"
import { ContributionType } from "./contribute-modal"

interface LifeViewProps {
  fullName: string
  biography?: string | null
  onOpenContribute: (type?: ContributionType) => void
}

const DEFAULT_MILESTONES: TimelineMilestone[] = [
  {
    year: 1948,
    chapter: "Chapter I",
    title: "Born in Exeter, Devon",
    description: "Born in autumn at St. Leonard’s Hospital, the younger of two sons raised on the edge of the Devon moors. His childhood was spent exploring the riverbanks and dismantling mechanical tools in his father's shed.",
    location: "Exeter, Devon",
  },
  {
    year: 1968,
    chapter: "Chapter II",
    title: "Horological Apprenticeship in London",
    description: "Moved to Clerkenwell to study under master watchmakers, learning to carve mechanical balance wheels and calibrate clock pendulums by hand to the tenth of a millimeter.",
    location: "Clerkenwell, London",
    photoUrl: "/old-school-photo.webp",
  },
  {
    year: 1974,
    chapter: "Chapter III",
    title: "Married Meena at St. Jude’s",
    description: "Married Meena Sharma on a warm July afternoon. They bought a small stone cottage near Dartmoor and began their fifty-year life together.",
    location: "St. Jude’s Church, Oxford",
    photoUrl: "/historical-wedding-photo.webp",
  },
  {
    year: 1983,
    chapter: "Chapter IV",
    title: "Founded Carter Clocks & Woodworking",
    description: "Opened his independent workshop on the high street. Over 35 years, repaired thousands of family heirloom clocks and handcrafted wooden furniture for three generations.",
    location: "Devon High Street",
    photoUrl: "/vintage-family-portraits-colorized.webp",
  },
  {
    year: 2004,
    chapter: "Chapter V",
    title: "Welcomed Granddaughter Anita",
    description: "Became a grandfather. Spent weekends teaching Anita how to identify wild Dartmoor ponies, garden english roses, and repair wooden boxes.",
    location: "Devon Cottage",
    photoUrl: "/memorial-family-portrait-combined.jpg",
  },
  {
    year: 2018,
    chapter: "Chapter VI",
    title: "Retirement & The Heritage Rose Garden",
    description: "Handed over workshop keys to senior apprentice Sarah Jenkins and spent his golden years tending ninety varieties of heritage English roses.",
    location: "Dartmoor Cottage",
  },
  {
    year: 2024,
    chapter: "Chapter VII",
    title: "Passed Away Peacefully in Devon",
    description: "Surrounded by his wife Meena, daughter Anita, and close family at the cottage overlooking the moors he walked every day.",
    location: "Devon, England",
  },
]

export function LifeView({ fullName, biography, onOpenContribute }: LifeViewProps) {
  const [subTab, setSubTab] = useState<"story" | "timeline">("story")
  const [expandedMilestones, setExpandedMilestones] = useState<Record<number, boolean>>({
    1974: true,
    1983: true,
  })

  const firstName = fullName.split(" ")[0] || fullName

  const toggleMilestone = (year: number) => {
    setExpandedMilestones((prev) => ({ ...prev, [year]: !prev[year] }))
  }

  return (
    <div className="py-8 sm:py-12 px-4 max-w-4xl mx-auto flex flex-col gap-8">
      
      {/* Header & Sub-Toggle Bar */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-black/[0.06] pb-6">
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-mono font-medium text-primary uppercase tracking-wider">
            Biography & Milestones
          </span>
          <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-[#181925]">
            The Life of {firstName}
          </h2>
          <p className="text-xs sm:text-sm text-[#666]">
            The full chronological arc of his days, craftsmanship, and milestones.
          </p>
        </div>

        {/* Local Toggle: Story | Timeline */}
        <div className="inline-flex items-center p-1 rounded-full bg-[#f4f4f6] border border-black/[0.05] self-start sm:self-auto shrink-0">
          <button
            type="button"
            onClick={() => setSubTab("story")}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all select-none cursor-pointer ${
              subTab === "story"
                ? "bg-white text-[#181925] shadow-xs"
                : "text-[#71717a] hover:text-[#181925]"
            }`}
          >
            <BookOpen className="size-3.5" />
            <span>His story</span>
          </button>
          <button
            type="button"
            onClick={() => setSubTab("timeline")}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all select-none cursor-pointer ${
              subTab === "timeline"
                ? "bg-white text-[#181925] shadow-xs"
                : "text-[#71717a] hover:text-[#181925]"
            }`}
          >
            <Clock className="size-3.5" />
            <span>Timeline</span>
          </button>
        </div>
      </div>

      {/* SUB-VIEW 1: HIS STORY */}
      {subTab === "story" && (
        <div className="flex flex-col gap-8">
          <div className="prose prose-neutral max-w-none text-[15px] sm:text-[17px] leading-7 sm:leading-8 text-[#444] flex flex-col gap-6">
            {biography ? (
              <p className="whitespace-pre-line">{biography}</p>
            ) : (
              <>
                <p>
                  Robert was born in Exeter during the autumn of 1948, the younger of two brothers raised on the edge of the Devon moors. From his earliest years, he showed an almost mechanical curiosity about the inner workings of things. While other boys were playing football in the lane, Robert could reliably be found on his knees behind his father’s shed, methodically dismantling an old bicycle hub or winding the spring of a broken mantel clock.
                </p>

                <p>
                  In 1968, he took an apprenticeship in horology in London’s Clerkenwell district. He spent five years learning how to carve balance wheels by hand under master watchmakers who measured patience in tenths of a millimeter. It was during this period, on an uncharacteristically sunny afternoon in Portobello Market, that he met Meena. They married in 1974 at St. Jude’s Church and settled in a small stone cottage near Dartmoor, where they would spend the next fifty years.
                </p>

                {/* Editorial Pull Quote */}
                <div className="my-2 p-6 sm:p-7 rounded-2xl bg-[#f7f7f8] border-l-2 border-primary border-y border-r border-black/[0.04]">
                  <p className="text-base sm:text-lg font-normal italic text-[#181925] leading-relaxed m-0">
                    “If you give someone an unhurried hour and a proper pot of tea, there isn’t a single disagreement in this world you can’t unravel.”
                  </p>
                  <span className="block mt-2.5 text-xs font-mono text-[#888] not-italic">
                    — Robert’s favourite saying in the workshop
                  </span>
                </div>

                <p>
                  In 1983, he opened Carter Clocks & Woodworking on the high street. For over three decades, his workshop became the unofficial town square for anyone who needed a hinge repaired, a pendulum calibrated, or simply twenty minutes of quiet conversation without judgment. He retired in 2018 to tend his rose garden and teach his granddaughter Anita how to identify every native songbird of Devon.
                </p>
              </>
            )}
          </div>

          {/* Contextual Action */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-[#f9f9fa] border border-black/[0.06] mt-4">
            <span className="text-xs text-[#666]">
              Know something else about {firstName}&apos;s life or career?
            </span>
            <button
              type="button"
              onClick={() => onOpenContribute("moment")}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-black/[0.08] hover:bg-neutral-50 text-xs font-medium text-[#181925] transition-colors cursor-pointer"
            >
              <Plus className="size-3 text-primary" />
              <span>Suggest an addition</span>
            </button>
          </div>
        </div>
      )}

      {/* SUB-VIEW 2: CHRONOLOGICAL TIMELINE */}
      {subTab === "timeline" && (
        <div className="flex flex-col gap-6">
          {/* Timeline Cards Stream */}
          <div className="relative pl-6 sm:pl-8 border-l border-black/[0.08] flex flex-col gap-6 ml-2 sm:ml-4">
            {DEFAULT_MILESTONES.map((milestone) => {
              const isExpanded = !!expandedMilestones[milestone.year]
              return (
                <div key={milestone.year} className="relative group">
                  {/* Timeline Dot Anchor */}
                  <div className="absolute -left-[31px] sm:-left-[39px] top-4 size-3.5 rounded-full bg-white border-2 border-primary group-hover:scale-110 transition-transform shadow-xs" />

                  {/* Milestone Card */}
                  <div
                    onClick={() => toggleMilestone(milestone.year)}
                    className="p-5 sm:p-6 rounded-2xl bg-[#f7f7f8] border border-black/[0.06] hover:border-black/[0.12] transition-all cursor-pointer flex flex-col gap-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <span className="px-2.5 py-1 rounded-full bg-white border border-black/[0.06] font-mono text-xs font-semibold text-primary">
                          {milestone.year}
                        </span>
                        <span className="text-xs font-mono uppercase tracking-wider text-[#888]">
                          {milestone.chapter}
                        </span>
                      </div>

                      <button
                        type="button"
                        aria-label="Toggle milestone details"
                        className="text-[#888] hover:text-[#181925] transition-colors"
                      >
                        {isExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                      </button>
                    </div>

                    <div className="flex flex-col gap-1">
                      <h3 className="text-base sm:text-lg font-medium text-[#181925]">
                        {milestone.title}
                      </h3>
                      {milestone.location && (
                        <div className="flex items-center gap-1.5 text-xs text-[#71717a]">
                          <MapPin className="size-3 text-[#999]" />
                          <span>{milestone.location}</span>
                        </div>
                      )}
                    </div>

                    <p className={`text-xs sm:text-sm text-[#555] leading-relaxed ${isExpanded ? "" : "line-clamp-2"}`}>
                      {milestone.description}
                    </p>

                    {/* Expandable Image if present */}
                    {isExpanded && milestone.photoUrl && (
                      <div className="mt-2 rounded-xl overflow-hidden border border-black/[0.06] max-h-60 bg-neutral-100">
                        <img
                          src={milestone.photoUrl}
                          alt={milestone.title}
                          className="w-full h-full object-cover grayscale contrast-105"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Contextual Action Button */}
          <div className="flex justify-center pt-4">
            <button
              type="button"
              onClick={() => onOpenContribute("moment")}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#f4f4f6] hover:bg-neutral-200 border border-black/[0.06] text-xs font-medium text-[#181925] transition-colors cursor-pointer"
            >
              <Plus className="size-3.5 text-primary" />
              <span>Add a life milestone for {firstName}</span>
            </button>
          </div>
        </div>
      )}

    </div>
  )
}
