"use client"

import { useState } from "react"
import { Users, Heart, Plus, ChevronRight, Image as ImageIcon, BookOpen, Clock, X } from "lucide-react"
import { ContributionType } from "./contribute-modal"

export interface PersonConnection {
  id: string
  name: string
  relationship: string
  circle: "family" | "friends" | "workshop"
  notes: string
  contributedMemories?: { title: string; year: string }[]
  photosPictured?: { title: string; year: string }[]
  timelineMoments?: { year: number; event: string }[]
}

const PEOPLE_DATA: PersonConnection[] = [
  // Family
  {
    id: "meena",
    name: "Meena Carter",
    relationship: "Wife of 50 years",
    circle: "family",
    notes: "Met at Portobello Market in 1972. Shared fifty years of morning tea, Dartmoor walks, and quiet laughter in their Devon cottage.",
    contributedMemories: [
      { title: "Morning Assam tea in blue porcelain mugs", year: "1974–2024" },
    ],
    photosPictured: [
      { title: "Wedding at St. Jude’s", year: "1974" },
      { title: "Three Generations in the Rose Garden", year: "1998" },
    ],
    timelineMoments: [
      { year: 1974, event: "Married Meena at St. Jude’s Church, Oxford" },
    ],
  },
  {
    id: "anita",
    name: "Anita Carter",
    relationship: "Daughter & Primary Caretaker",
    circle: "family",
    notes: "Designated successor to safeguard this memorial and family archive across generations. Learned to garden English roses and identify Devon songbirds under Robert's guidance.",
    contributedMemories: [
      { title: "Dad fixing Mrs. Higgins’ washing machine on Christmas Day", year: "1994" },
    ],
    photosPictured: [
      { title: "Three Generations in the Rose Garden", year: "1998" },
    ],
    timelineMoments: [
      { year: 2004, event: "Welcomed Granddaughter Anita" },
    ],
  },
  {
    id: "david",
    name: "David Carter",
    relationship: "Older Brother",
    circle: "family",
    notes: "Lifelong companion on Dartmoor hikes and co-conspirator in repairing old Morris Minor engines behind Grandad's shed.",
    contributedMemories: [
      { title: "Taking the old Morris Minor across the moors in dense fog", year: "1968" },
    ],
    photosPictured: [
      { title: "The High Street Storefront", year: "1988" },
    ],
    timelineMoments: [
      { year: 1948, event: "Raised together on the edge of the Devon moors" },
    ],
  },
  {
    id: "rahul",
    name: "Rahul Carter",
    relationship: "Grandson",
    circle: "family",
    notes: "Gifted a hand-carved miniature oak chess set for his tenth birthday, carved entirely from clock offcuts.",
    contributedMemories: [
      { title: "Miniature hand-carved oak chess set", year: "2012" },
    ],
    photosPictured: [
      { title: "Summer on the Moors", year: "2015" },
    ],
  },

  // Friends & Community
  {
    id: "thomas",
    name: "Thomas Bradley",
    relationship: "Lifelong Friend & Beekeeper",
    circle: "friends",
    notes: "Fifty years of walking the heather trails. Thomas and Robert shared honey jars and repaired drystone walls every autumn.",
    contributedMemories: [
      { title: "Walking the wild bees down into the valley", year: "2001" },
    ],
    photosPictured: [
      { title: "Walking the Moorland Trails", year: "2015" },
    ],
  },
  {
    id: "arthur",
    name: "Arthur Pendleton",
    relationship: "Grammar School Companion",
    circle: "friends",
    notes: "Shared the Exeter school benches in 1960. Remained pen pals and annual visitors for six decades.",
    photosPictured: [
      { title: "Exeter Grammar School Cricket XI", year: "1960" },
    ],
  },

  // Workshop & Apprentices
  {
    id: "sarah",
    name: "Sarah Jenkins",
    relationship: "Senior Apprentice & Successor",
    circle: "workshop",
    notes: "Trained under Robert for 25 years at Carter Clocks. Took over the workshop keys in 2018, continuing his patient watchmaking tradition.",
    contributedMemories: [
      { title: "‘Now you know how much pressure breaks a clock spring’", year: "1998" },
    ],
    timelineMoments: [
      { year: 2018, event: "Handed over workshop keys upon retirement" },
    ],
  },
]

interface PeopleInLifeProps {
  fullName?: string
  onOpenContribute: (type?: ContributionType) => void
}

export function PeopleInLife({
  fullName = "Robert Carter",
  onOpenContribute,
}: PeopleInLifeProps) {
  const [selectedPerson, setSelectedPerson] = useState<PersonConnection | null>(null)
  const firstName = fullName.split(" ")[0] || fullName

  const circles = [
    { key: "family", title: "Family", subtitle: "Wife, children & grandchildren" },
    { key: "friends", title: "Friends & Community", subtitle: "Lifelong companions and neighbours" },
    { key: "workshop", title: "Workshop & Apprentices", subtitle: "Craftspeople trained under Robert" },
  ]

  return (
    <div className="py-8 sm:py-12 px-4 max-w-4xl mx-auto flex flex-col gap-10">
      
      {/* Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-black/[0.06] pb-6">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-mono font-medium text-primary uppercase tracking-wider">
            Relationships
          </span>
          <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-[#181925]">
            People in {firstName}&apos;s life
          </h2>
          <p className="text-xs sm:text-sm text-[#71717a]">
            The loved ones, apprentices, and lifelong friends who shaped his story.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onOpenContribute("message")}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#181925] hover:bg-[#252736] text-white text-xs font-medium transition-all self-start sm:self-auto cursor-pointer shadow-xs active:scale-95"
        >
          <Plus className="size-3.5" />
          <span>Add someone who knew him</span>
        </button>
      </div>

      {/* Relationship Circles */}
      <div className="flex flex-col gap-10">
        {circles.map((circle) => {
          const groupPeople = PEOPLE_DATA.filter((p) => p.circle === circle.key)
          if (groupPeople.length === 0) return null

          return (
            <div key={circle.key} className="flex flex-col gap-4">
              <div className="flex items-baseline justify-between border-b border-black/[0.04] pb-2">
                <h3 className="text-base sm:text-lg font-medium text-[#181925]">
                  {circle.title}
                </h3>
                <span className="text-xs font-mono text-[#888]">
                  {circle.subtitle}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                {groupPeople.map((person) => (
                  <div
                    key={person.id}
                    onClick={() => setSelectedPerson(person)}
                    className="p-4 rounded-2xl bg-[#f7f7f8] border border-black/[0.05] hover:border-black/[0.12] hover:bg-white transition-all cursor-pointer flex flex-col justify-between gap-3 group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="size-10 rounded-full bg-white border border-black/[0.08] flex items-center justify-center font-serif text-sm font-semibold text-[#181925] shrink-0 group-hover:bg-primary/5 transition-colors">
                        {person.name.charAt(0)}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-medium text-[#181925] truncate group-hover:text-primary transition-colors">
                          {person.name}
                        </span>
                        <span className="text-xs text-[#71717a] truncate">
                          {person.relationship}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-[#555] leading-relaxed line-clamp-2">
                      {person.notes}
                    </p>

                    <div className="pt-2 border-t border-black/[0.04] flex items-center justify-between text-[11px] text-[#888]">
                      <span>View connections</span>
                      <ChevronRight className="size-3 text-[#aaa] group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Person Detail Drawer / Modal */}
      {selectedPerson && (
        <div
          onClick={() => setSelectedPerson(null)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs p-4 flex items-center justify-center select-none"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-lg w-full bg-white rounded-3xl p-6 sm:p-8 flex flex-col gap-5 overflow-hidden shadow-2xl relative"
          >
            <button
              type="button"
              onClick={() => setSelectedPerson(null)}
              className="absolute top-5 right-5 size-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-[#666] flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close details"
            >
              <X className="size-4" />
            </button>

            {/* Profile Header */}
            <div className="flex items-center gap-4 pr-8">
              <div className="size-14 rounded-2xl bg-neutral-100 border border-black/[0.08] flex items-center justify-center font-serif text-xl font-medium text-[#181925] shrink-0">
                {selectedPerson.name.charAt(0)}
              </div>
              <div className="flex flex-col">
                <h3 className="text-xl font-medium text-[#181925]">
                  {selectedPerson.name}
                </h3>
                <span className="text-xs text-primary font-medium">
                  {selectedPerson.relationship}
                </span>
              </div>
            </div>

            <p className="text-sm text-[#444] leading-relaxed">
              {selectedPerson.notes}
            </p>

            {/* Connected Memories */}
            {selectedPerson.contributedMemories && selectedPerson.contributedMemories.length > 0 && (
              <div className="flex flex-col gap-2 pt-2 border-t border-black/[0.06]">
                <div className="flex items-center gap-1.5 text-xs font-mono font-medium text-[#71717a] uppercase tracking-wider">
                  <BookOpen className="size-3 text-primary" />
                  <span>Memories Contributed</span>
                </div>
                <div className="flex flex-col gap-1.5">
                  {selectedPerson.contributedMemories.map((mem, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-xl bg-[#f9f9fa] border border-black/[0.04] flex items-center justify-between text-xs"
                    >
                      <span className="font-medium text-[#181925] truncate">“{mem.title}”</span>
                      <span className="text-[10px] font-mono text-[#888] shrink-0">{mem.year}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Photos Together */}
            {selectedPerson.photosPictured && selectedPerson.photosPictured.length > 0 && (
              <div className="flex flex-col gap-2 pt-2 border-t border-black/[0.06]">
                <div className="flex items-center gap-1.5 text-xs font-mono font-medium text-[#71717a] uppercase tracking-wider">
                  <ImageIcon className="size-3 text-primary" />
                  <span>Pictured in Photographs</span>
                </div>
                <div className="flex flex-col gap-1.5">
                  {selectedPerson.photosPictured.map((photo, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-xl bg-[#f9f9fa] border border-black/[0.04] flex items-center justify-between text-xs"
                    >
                      <span className="font-medium text-[#181925] truncate">{photo.title}</span>
                      <span className="text-[10px] font-mono text-[#888] shrink-0">{photo.year}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Shared Milestones */}
            {selectedPerson.timelineMoments && selectedPerson.timelineMoments.length > 0 && (
              <div className="flex flex-col gap-2 pt-2 border-t border-black/[0.06]">
                <div className="flex items-center gap-1.5 text-xs font-mono font-medium text-[#71717a] uppercase tracking-wider">
                  <Clock className="size-3 text-primary" />
                  <span>Timeline Milestones</span>
                </div>
                <div className="flex flex-col gap-1.5">
                  {selectedPerson.timelineMoments.map((moment, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-xl bg-[#f9f9fa] border border-black/[0.04] flex items-baseline gap-2 text-xs"
                    >
                      <span className="font-mono font-semibold text-primary">{moment.year}</span>
                      <span className="text-[#333]">{moment.event}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  )
}
