"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown } from "lucide-react"

import { GIFT_FAQS, type GiftFaqItem } from "@/lib/gift-faqs"
export { GIFT_FAQS, type GiftFaqItem }

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
