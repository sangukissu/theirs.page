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
    id: "contribute-no-login",
    question: "Can relatives and friends contribute without creating an account?",
    answer:
      "Yes, completely. One share link lets anyone write a story, upload a photo, or record a voice note directly from their phone or browser. No app download, no sign-up forms, and no passwords required.",
  },
  {
    id: "approval-queue",
    question: "Do memories appear automatically, or can I review them first?",
    answer:
      "Nothing goes live without your explicit approval. Every contributed memory, photo, and voice memo lands in your private moderation queue first, giving you full control over what is published.",
  },
  {
    id: "photo-preservation",
    question: "Are original high-resolution photos preserved, or compressed?",
    answer:
      "Always preserved untouched. Unlike social media platforms that compress photos into blurry thumbnails, we store your original 4K and RAW files securely in dedicated Cloudflare R2 object storage with zero data loss.",
  },
  {
    id: "pricing-subscription",
    question: "Is there a recurring monthly subscription?",
    answer:
      "Never. We believe charging a recurring subscription for remembrance is wrong. Pro Plan is a one-time $179 payment per memorial, with zero monthly fees. It is completely free to start and share with up to 5 photos, and you only upgrade when your family is ready.",
  },
  {
    id: "offline-export",
    question: "Can I download an offline copy if I ever want to leave?",
    answer:
      "Yes, at any moment. One click exports a self-contained ZIP archive containing all your original high-resolution photographs, audio recordings, and a standalone offline HTML reader that opens in any browser without an internet connection.",
  },
  {
    id: "privacy-tiers",
    question: "Who can view their memorial?",
    answer:
      "You choose between three privacy tiers: Public (discoverable for old friends, colleagues, and acquaintances), Unlisted (only accessible to people with your private link), or PIN-protected (requiring a family access code).",
  },
  {
    id: "caretaker-delegation",
    question: "What happens if the creator passes away or can no longer manage the page?",
    answer:
      "You can designate a successor caretaker at any time. They receive secondary administrative privileges to approve incoming memories and safeguard the archive across generations.",
  },
  {
    id: "voice-notes",
    question: "Can we record or upload voice notes and voicemails?",
    answer:
      "Yes. Visitors can listen to their actual voice with an integrated audio waveform player. You can upload existing voicemails or voice memos directly from your phone in seconds.",
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
