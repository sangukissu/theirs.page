"use client"

import { useState } from "react"
import { Users, Heart, Clock, Image as ImageIcon, Plus, X, ArrowRight } from "lucide-react"
import { ContributionType } from "./contribute-modal"

export interface PersonConnection {
  id: string
  name: string
  relationship: string
  circle?: "family" | "friends" | "workshop" | string
  notes?: string
  photoUrl?: string
  contributedMemories?: { title: string; year?: string }[]
  photosPictured?: { title: string; year?: string }[]
  timelineMoments?: { year: number; event: string }[]
}

export const DEFAULT_CONNECTIONS: PersonConnection[] = [
  // Family Circle
  {
    id: "meena",
    name: "Meena Carter",
    relationship: "Wife of 50 years",
    circle: "family",
    notes: "Met at Portobello Market in 1971. Shared half a century of mornings, rose gardening, and quiet devotion at Dartmoor Cottage.",
    contributedMemories: [
      { title: "Morning tea in chipped blue porcelain mugs", year: "1974 — 2024" },
    ],
    photosPictured: [
      { title: "First Summer in the Garden", year: "1976" },
      { title: "Golden Anniversary on the Moors", year: "2024" },
    ],
    timelineMoments: [
      { year: 1974, event: "Married at St. Jude’s Church" },
    ],
  },
  {
    id: "anita",
    name: "Anita Carter",
    relationship: "Daughter & Primary Caretaker",
    circle: "family",
    notes: "Taught by her father how to mend broken clocks and read Dartmoor trail markers. Preserved all family recordings.",
    contributedMemories: [
      { title: "The front tyre pressure voicemail", year: "2014" },
    ],
    photosPictured: [
      { title: "Building the wooden pram", year: "2004" },
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
      { title: "Fifty years of heather trails and autumn drystone walls", year: "1975 — 2024" },
    ],
    photosPictured: [
      { title: "Sunday walks across the tors", year: "2010" },
    ],
  },
  // Workshop & Apprentices
  {
    id: "sarah",
    name: "Sarah Jenkins",
    relationship: "Senior Apprentice & Successor",
    circle: "workshop",
    notes: "Trained under Robert from age 18. Took over high street workshop stewardship upon his retirement in 2018.",
    contributedMemories: [
      { title: "How much pressure it takes to break a clock spring", year: "1998" },
    ],
    photosPictured: [
      { title: "Calibrating the Church clock", year: "2002" },
    ],
    timelineMoments: [
      { year: 2018, event: "Handed over workshop keys to Sarah" },
    ],
  },
]

interface PeopleInLifeProps {
  fullName?: string
  people?: PersonConnection[]
  isDemo?: boolean
  onOpenContribute: (type?: ContributionType) => void
}

export function PeopleInLife({
  fullName = "Robert Carter",
  people,
  isDemo = false,
  onOpenContribute,
}: PeopleInLifeProps) {
  const [selectedPerson, setSelectedPerson] = useState<PersonConnection | null>(null)
  const firstName = fullName.split(" ")[0] || fullName

  const activePeople = isDemo
    ? (people && people.length > 0 ? people : DEFAULT_CONNECTIONS)
    : (people || [])

  const circles = [
    { key: "family", title: "Family", subtitle: "Spouse, children, grandchildren & relatives" },
    { key: "friends", title: "Friends & Community", subtitle: "Lifelong companions and neighbours" },
    { key: "workshop", title: "Colleagues & Mentors", subtitle: "People who shared their work and craft" },
  ]

  return (
    <section id="people" className="py-12 sm:py-16 px-4 max-w-4xl mx-auto flex flex-col gap-10 scroll-mt-24">
      
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
            The loved ones, friends, and family who shaped their story.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onOpenContribute("message")}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#181925] hover:bg-[#252736] text-white text-xs font-medium transition-all self-start sm:self-auto cursor-pointer shadow-xs active:scale-95"
        >
          <Plus className="size-3.5" />
          <span>Add someone who knew them</span>
        </button>
      </div>

      {/* Relationship Circles / Empty State */}
      {activePeople.length === 0 ? (
        <div className="py-12 text-center text-sm text-[#71717a] rounded-3xl bg-[#fafafb] border border-black/[0.06] flex flex-col items-center justify-center gap-3">
          <p>No family or friends added to this memorial yet.</p>
          <button
            type="button"
            onClick={() => onOpenContribute("message")}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline cursor-pointer"
          >
            <Plus className="size-3.5" />
            <span>Add the first person</span>
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-10">
          {circles.map((circle) => {
            const groupPeople = activePeople.filter((p) => {
              if (circle.key === "family") {
                return p.circle === "family" || !p.circle
              }
              return p.circle === circle.key
            })

            if (groupPeople.length === 0) return null

            return (
              <div key={circle.key} className="flex flex-col gap-4">
                <div className="flex items-baseline justify-between border-b border-black/[0.04] pb-2">
                  <h3 className="text-base sm:text-lg font-medium text-[#181925]">
                    {circle.title}
                  </h3>
                  <span className="text-xs text-[#888]">
                    {circle.subtitle}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {groupPeople.map((person) => (
                    <button
                      key={person.id}
                      type="button"
                      onClick={() => setSelectedPerson(person)}
                      className="p-4 rounded-2xl bg-white border border-black/[0.06] hover:border-black/[0.15] transition-all text-left flex flex-col gap-3 group cursor-pointer shadow-2xs select-none"
                    >
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-neutral-100 border border-black/[0.06] flex items-center justify-center text-[#181925] font-serif font-medium overflow-hidden shrink-0">
                          {person.photoUrl ? (
                            <img
                              src={person.photoUrl}
                              alt={person.name}
                              className="size-full object-cover grayscale"
                            />
                          ) : (
                            person.name.charAt(0)
                          )}
                        </div>

                        <div className="flex flex-col min-w-0">
                          <h4 className="text-sm font-medium text-[#181925] truncate group-hover:text-primary transition-colors">
                            {person.name}
                          </h4>
                          <span className="text-xs text-[#71717a] truncate">
                            {person.relationship}
                          </span>
                        </div>
                      </div>

                      {person.notes && (
                        <p className="text-xs text-[#666] line-clamp-2 leading-relaxed">
                          {person.notes}
                        </p>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Person Detail Drawer Modal */}
      {selectedPerson && (
        <div
          onClick={() => setSelectedPerson(null)}
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 select-none"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-white rounded-3xl p-6 flex flex-col gap-6 shadow-2xl border border-black/[0.08]"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="size-14 rounded-full bg-neutral-100 border border-black/[0.06] flex items-center justify-center text-xl font-serif font-medium text-[#181925] overflow-hidden shrink-0">
                  {selectedPerson.photoUrl ? (
                    <img
                      src={selectedPerson.photoUrl}
                      alt={selectedPerson.name}
                      className="size-full object-cover grayscale"
                    />
                  ) : (
                    selectedPerson.name.charAt(0)
                  )}
                </div>

                <div className="flex flex-col">
                  <h3 className="text-lg font-medium text-[#181925]">
                    {selectedPerson.name}
                  </h3>
                  <span className="text-xs font-mono text-primary font-medium">
                    {selectedPerson.relationship}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedPerson(null)}
                className="size-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-[#666] flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            {selectedPerson.notes && (
              <p className="text-sm text-[#555] leading-relaxed italic bg-[#fafafb] p-4 rounded-2xl border border-black/[0.04]">
                “{selectedPerson.notes}”
              </p>
            )}

            <button
              type="button"
              onClick={() => setSelectedPerson(null)}
              className="w-full py-2.5 rounded-full bg-[#181925] hover:bg-[#252736] text-white text-xs font-medium transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </section>
  )
}
