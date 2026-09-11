"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown } from "lucide-react"

export interface GiftFaqItem {
  id: string
  question: string
  answer: string
}

export const GIFT_FAQS: GiftFaqItem[] = [
  {
    id: "details-needed",
    question: "What information do I need to gift an online memorial?",
    answer:
      "You only need your name and email, and the recipient’s name and email address. You do not need to know the dates of birth and passing, write an obituary, or upload photos. The recipient personalizes everything at their own pace when they feel ready.",
  },
  {
    id: "does-it-expire",
    question: "Does the memorial gift entitlement ever expire?",
    answer:
      "Never. Grief does not follow a strict timetable. Whether the recipient claims their gift this week, next month, or a year from now, their Complete memorial entitlement remains permanently active and waiting for them.",
  },
  {
    id: "flowers-comparison",
    question: "Why is an online memorial website a meaningful sympathy gift?",
    answer:
      "Sympathy flowers are thoughtful but typically wither within four or five days. A Complete memorial website provides an enduring sanctuary where the entire family can gather original-resolution photos, hear voice recordings, read heartfelt tributes from across the world, and preserve their loved one’s full story for future generations.",
  },
  {
    id: "privacy-and-access",
    question: "Will I have administrative access or edit rights to their memorial?",
    answer:
      "No. For privacy, dignity, and emotional boundaries, the memorial belongs entirely to the recipient once claimed. You will not have access to edit or manage their memorial unless the recipient specifically invites you as a co-admin or collaborator from their dashboard.",
  },
  {
    id: "existing-memorial",
    question: "Can they apply this gift to a memorial they have already started?",
    answer:
      "Yes. When claiming the gift, the recipient can choose to either create a brand-new memorial or apply the Complete upgrade to any free or draft memorial already present in their Theirs account.",
  },
  {
    id: "subscriptions",
    question: "Are there any recurring subscriptions or maintenance fees?",
    answer:
      "None. Gifting a Complete memorial is a single, one-time payment of $179. The memorial is permanently ad-free, with no renewal fees, storage limits, or hidden subscriptions ever charged to either you or the family.",
  },
  {
    id: "delivery-methods",
    question: "Can I deliver the claim link personally in a card or message?",
    answer:
      "Yes. In addition to the automated email invitation sent to the recipient, you will receive an immediate receipt containing the private backup claim link. You can easily copy this link into a physical sympathy card, letter, or text message.",
  },
  {
    id: "refund-policy",
    question: "What if the family already created a paid memorial?",
    answer:
      "If the recipient already has a Complete memorial or prefers not to use the gift, we offer a hassle-free refund within 30 days of purchase or can reassign the entitlement. Simply contact us at support@theirs.page.",
  },
]

export function GiftFaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggle = (idx: number) => {
    setOpenIndex((prev) => (prev === idx ? null : idx))
  }

  return (
    <div className="mx-auto mt-10 w-full max-w-2xl px-4 sm:px-0">
      <div className="flex flex-col">
        {GIFT_FAQS.map((item, index) => {
          const isOpen = openIndex === index
          const total = GIFT_FAQS.length

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
              className="overflow-hidden bg-[#f6f6f6] border border-black/[0.04] text-card-foreground will-change-transform"
            >
              <button
                type="button"
                onClick={() => toggle(index)}
                aria-expanded={isOpen}
                className="flex min-h-[54px] w-full items-center gap-4 px-6 py-4 text-left outline-none transition-colors hover:bg-black/[0.02] cursor-pointer select-none"
              >
                <span className="min-w-0 flex-1 text-base font-medium text-[#181925]">
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
                        height: {
                          type: "spring",
                          stiffness: 380,
                          damping: 32,
                        },
                        opacity: { duration: 0.15 },
                      },
                    }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pt-1 pb-5 text-sm leading-6 text-[#666]">
                      {item.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
