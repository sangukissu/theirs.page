"use client"

interface MemorialStoryProps {
  fullName: string
  biography?: string | null
}

export function MemorialStory({ fullName, biography }: MemorialStoryProps) {
  const firstName = fullName.split(" ")[0] || fullName

  return (
    <section id="story" className="py-12 sm:py-16 px-4 max-w-4xl mx-auto scroll-mt-24">
      <div className="flex flex-col gap-8">
        
        {/* Section Heading */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-mono font-medium text-primary uppercase tracking-wider">
            Life & Memory
          </span>
          <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-[#181925]">
            The Story of {firstName}
          </h2>
        </div>

        {/* Narrative Body with Generous Editorial Leading */}
        <div className="prose prose-neutral max-w-none text-[15px] sm:text-[17px] leading-7 sm:leading-8 text-[#444] flex flex-col gap-5">
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
              <div className="my-3 p-6 rounded-2xl bg-[#f7f7f8] border-l-2 border-primary border-y border-r border-black/[0.04]">
                <p className="text-base sm:text-lg font-normal italic text-[#181925] leading-relaxed m-0">
                  “If you give someone an unhurried hour and a proper pot of tea, there isn’t a single disagreement in this world you can’t unravel.”
                </p>
                <span className="block mt-2 text-xs font-mono text-[#888] not-italic">
                  — Robert’s favourite saying in the workshop
                </span>
              </div>

              <p>
                In 1983, he opened Carter Clocks & Woodworking on the high street. For over three decades, his workshop became the unofficial town square for anyone who needed a hinge repaired, a pendulum calibrated, or simply twenty minutes of quiet conversation without judgment. He retired in 2018 to tend his rose garden and teach his granddaughter Anita how to identify every native songbird of Devon.
              </p>
            </>
          )}
        </div>

      </div>
    </section>
  )
}
