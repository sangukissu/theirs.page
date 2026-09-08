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
    id: "memorial-vs-obituary",
    question: "How is an online memorial different from an obituary?",
    answer:
      "A traditional obituary is a brief, static announcement centered on dates and funeral services. An online memorial is living, rich, and collaborative — bringing together photos, voice recordings, personal stories, and milestones contributed by the family and friends who knew them.",
  },
  {
    id: "pricing-cost",
    question: "How much does an online memorial cost? Are there monthly fees?",
    answer:
      "It is completely free to create and share a memorial. The Free plan includes up to 5 photos, tributes, and full privacy controls with no commitment. If your family wants to add unlimited photos, voice notes, video clips, and a life story timeline, you can upgrade for a one-time payment of $179. There are never any recurring monthly subscriptions or renewal fees.",
  },
  {
    id: "contribute-no-login",
    question: "Do family and friends need an account to contribute?",
    answer:
      "No, never. Anyone with your memorial link can write a tribute, share a story, or upload a photo directly from their phone or computer. No app downloads, sign-up forms, or passwords required. You control their visibility.",
  },
  {
    id: "approval-queue",
    question: "Can I approve stories and photos before they appear?",
    answer:
      "Yes, you have complete moderation control. Every tribute, photo, and memory submitted by visitors lands in your private approval queue first. Nothing goes live on the memorial until you review and approve it.",
  },
  {
    id: "privacy-tiers",
    question: "Who can view the memorial? Can we keep it private?",
    answer:
      "You choose your privacy setting: Public (searchable for distant friends and colleagues), Unlisted (only accessible to people with your private link), or Private (restricted strictly to invited family members with secure PIN). You can change this at any time.",
  },
  {
    id: "permanence-lifespan",
    question: "How long does the memorial stay online?",
    answer:
      "Permanently. We believe remembrance should never have an expiration date. Once created, your loved one’s memorial remains online without renewal fees or surprise charges, providing a lasting home for memories across generations.",
  },
  {
    id: "voice-video",
    question: "Can we upload voicemails, voice notes, and videos?",
    answer:
      "Yes. You can preserve audio recordings — like saved voicemails or spoken memories — with an integrated audio waveform player that lets visitors hear their voice. You can also add family videos alongside photographs and stories.",
  },
  {
    id: "caretaker-delegation",
    question: "What happens if I can no longer manage the memorial myself?",
    answer:
      "You can name a trusted successor caretaker or co-admin at any time. If you ever need to pass on stewardship, they can manage settings, approve incoming memories, and look after the memorial for your family.",
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
