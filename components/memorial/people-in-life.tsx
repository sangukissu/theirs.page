"use client"

import { Users, Heart } from "lucide-react"

export interface PersonRelation {
  name: string
  relationship: string
  notes?: string
}

const DEFAULT_PEOPLE: PersonRelation[] = [
  {
    name: "Meena Carter",
    relationship: "Wife of 50 years",
    notes: "Met at Portobello Market in 1972. Shared fifty years of morning tea in their Devon cottage.",
  },
  {
    name: "Anita Carter",
    relationship: "Daughter & Primary Caretaker",
    notes: "Designated successor to safeguard this memorial and family archive across generations.",
  },
  {
    name: "David Carter",
    relationship: "Older Brother",
    notes: "Lifelong companion on Dartmoor hikes and partner in repairing old Morris Minor engines.",
  },
  {
    name: "Rahul Carter",
    relationship: "Grandson",
    notes: "Gifted a hand-carved miniature oak chess set for his tenth birthday.",
  },
  {
    name: "Sarah Jenkins",
    relationship: "Senior Horologist & Apprentice",
    notes: "Trained under Robert for 25 years, now carrying on the Carter Workshop tradition.",
  },
]

export function PeopleInLife() {
  return (
    <section id="people" className="py-12 sm:py-16 px-4 max-w-4xl mx-auto">
      <div className="flex flex-col gap-8">
        
        {/* Section Heading */}
        <div className="flex flex-col gap-1.5 border-b border-black/[0.06] pb-6">
          <span className="text-xs font-mono font-medium text-primary uppercase tracking-wider">
            Relationships
          </span>
          <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-[#181925]">
            People in His Life
          </h2>
          <p className="text-xs sm:text-sm text-[#666]">
            The web of loved ones, apprentices, and lifelong friends who shaped his story.
          </p>
        </div>

        {/* Relationship Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {DEFAULT_PEOPLE.map((person) => (
            <div
              key={person.name}
              className="p-4 rounded-2xl bg-white border border-black/[0.06] flex flex-col justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-full bg-neutral-100 border border-black/[0.06] text-[#181925] text-xs font-medium flex items-center justify-center shrink-0">
                  {person.name.charAt(0)}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-medium text-[#181925] truncate">
                    {person.name}
                  </span>
                  <span className="text-[11px] text-[#888] truncate">
                    {person.relationship}
                  </span>
                </div>
              </div>

              {person.notes && (
                <p className="text-xs text-[#666] leading-relaxed">
                  {person.notes}
                </p>
              )}
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
