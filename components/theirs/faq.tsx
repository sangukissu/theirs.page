"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown } from "lucide-react"

interface FaqItem {
  id: string
  question: string
  answer: string
}

const FAQS: FaqItem[] = [
  {
    id: "what-is-an-online-memorial",
    question: "What is an online memorial website?",
    answer:
      "An online memorial is a dedicated place to remember someone who has died through their photos, stories, tributes and important moments. Unlike a traditional obituary, which is usually a short death notice or biography, a memorial on Theirs can grow over time as family and friends add their own memories.",
  },
  {
    id: "free-memorial",
    question: "Can I create an online memorial for free?",
    answer:
      "Yes. You can create and publish a memorial on Theirs for free, with their portrait, story, guest tributes and up to 5 gallery photos. No credit card is required to start. If your family later wants more photos, video, voice recordings, privacy controls and other complete memorial features, you can upgrade that memorial.",
  },
  {
    id: "family-contributions",
    question: "Can family and friends add their own memories and photos?",
    answer:
      "Yes. Share the memorial with the people who knew them and they can contribute tributes, stories, photos and other memories. Their contributions stay connected to who shared them, so the memorial becomes a collection of different perspectives on the same life. For ordinary tributes and photo memories, contributors don't need to create an account.",
  },
  {
    id: "control-and-moderation",
    question: "Do I control what other people add to the memorial?",
    answer:
      "Yes. You remain the caretaker of the memorial. Contributions from visitors can be reviewed before they appear, so sharing the page with a wider family doesn't mean giving up control of it. You can approve or decline contributions and choose what belongs on the memorial.",
  },
  {
    id: "privacy-controls",
    question: "Can an online memorial be private?",
    answer:
      "Yes. With Complete, you can choose how the memorial is shared: Public for anyone to visit, Unlisted so it isn't intended for search discovery but anyone with the link can open it, or Private for access-controlled sharing. You can change the setting as your family's needs change.",
  },
  {
    id: "pricing-no-subscription",
    question: "Is Theirs a subscription? How much does a memorial cost?",
    answer:
      "There is no monthly subscription. Theirs is free to start, and Complete costs $179 once per memorial. You don't need to keep a subscription active every month or year to retain the Complete features you've purchased.",
  },
  {
    id: "ownership-and-export",
    question: "Who owns the photos and memories we upload? Can we download them?",
    answer:
      "Your family's content remains yours. Theirs doesn't take ownership of the photos, stories or recordings you upload. With Complete, you can export the memorial and its original media into a family archive, so your memories aren't locked inside Theirs.",
  },
  {
    id: "successor-caretaker",
    question: "What happens to the memorial if I can no longer manage it?",
    answer:
      "You can choose another trusted person to help care for the memorial and designate a successor caretaker for the future. The goal is for responsibility for the memorial to be able to pass within the family rather than depend on one account holder indefinitely.",
  },
  {
    id: "lifespan-and-permanence",
    question: "How long will an online memorial stay online?",
    answer:
      "Theirs is built for long-term remembrance, but we don't think it is responsible to promise that any online service will exist “forever.” Complete memorials don't depend on an ongoing monthly subscription, and you can export your family's memorial and original files so Theirs never has to be the only copy of something irreplaceable.",
  },
]

import { SectionHeader } from "@/components/theirs/section-header"

export function TheirsFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggle = (idx: number) => {
    setOpenIndex((prev) => (prev === idx ? null : idx))
  }

  // Schema.org FAQPage structured data for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  }

  return (
    <section
      id="faq"
      className="scroll-mt-16 overflow-visible rounded-none bg-transparent p-0 sm:p-0"
    >
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="py-12 sm:py-20">
        {/* Section Heading */}
        <SectionHeader
          badge="FAQ"
          title="Fair questions, straight answers."
          description={
            <>
              Everything you need to know about preservation, privacy, and contributions,{" "}
              <span className="rounded-md bg-primary/10 box-decoration-clone px-1 py-0.5 text-primary">
                without the complexity
              </span>
              .
            </>
          }
          className="px-4 sm:px-6"
        />

        {/* Dynamic Morphing Accordion Stack (Exact physics & layout from getopen.so) */}
        <div className="mx-auto mt-12 w-full max-w-2xl px-4 sm:mt-16 sm:px-0">
          <div className="flex flex-col">
            {FAQS.map((item, index) => {
              const isOpen = openIndex === index
              const total = FAQS.length

              // Calculate exact border-radius and margins based on open neighbor states
              const prevIsOpen = index > 0 && index - 1 === openIndex
              const nextIsOpen = index < total - 1 && index + 1 === openIndex

              const isStartOfClosedGroup = index === 0 || prevIsOpen
              const isEndOfClosedGroup = index === total - 1 || nextIsOpen

              let borderRadius = "0px"
              if (isOpen) {
                borderRadius = "28px"
              } else if (isStartOfClosedGroup && isEndOfClosedGroup) {
                borderRadius = "28px"
              } else if (isStartOfClosedGroup) {
                borderRadius = "28px 28px 0px 0px"
              } else if (isEndOfClosedGroup) {
                borderRadius = "0px 0px 28px 28px"
              }

              // Margin calculations
              let marginTop = 0
              if (isOpen && index > 0) {
                marginTop = 12
              } else if (!isOpen && isStartOfClosedGroup && index > 0) {
                marginTop = 12
              }

              return (
                <motion.div
                  key={item.id}
                  layout
                  transition={{
                    type: "spring",
                    stiffness: 380,
                    damping: 32,
                  }}
                  style={{
                    marginTop,
                    borderRadius,
                  }}
                  className="overflow-hidden bg-[#f6f6f6] text-card-foreground will-change-transform"
                >
                  <button
                    type="button"
                    onClick={() => toggle(index)}
                    aria-expanded={isOpen}
                    className="flex min-h-[54px] w-full items-center gap-4 px-6 py-4 text-left outline-none transition-colors hover:bg-black/[0.02] focus-visible:bg-muted/25 cursor-pointer select-none"
                  >
                    <span className="min-w-0 flex-1 text-[15px] font-medium text-foreground">
                      {item.question}
                    </span>
                    <motion.span
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                      className="grid h-6 w-6 shrink-0 place-items-center text-muted-foreground"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </motion.span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        key="content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{
                          height: "auto",
                          opacity: 1,
                          transition: {
                            height: {
                              type: "spring",
                              stiffness: 380,
                              damping: 32,
                            },
                            opacity: { duration: 0.2, delay: 0.05 },
                          },
                        }}
                        exit={{
                          height: 0,
                          opacity: 0,
                          transition: {
                            height: { duration: 0.2, ease: "easeInOut" },
                            opacity: { duration: 0.15 },
                          },
                        }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-6 pt-0">
                          <div className="text-[15px] leading-relaxed text-muted-foreground">
                            {item.answer}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
