"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown } from "lucide-react"

export interface SeoFaqItem {
  id: string
  question: string
  answer: string
}

interface SeoFaqAccordionProps {
  items: SeoFaqItem[]
}

export function SeoFaqAccordion({ items }: SeoFaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggle = (idx: number) => {
    setOpenIndex((prev) => (prev === idx ? null : idx))
  }

  return (
    <div className="w-full flex flex-col">
      {items.map((item, index) => {
        const isOpen = openIndex === index
        const total = items.length

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
              <span className="min-w-0 flex-1 text-[15px] font-medium text-[#181925]">
                {item.question}
              </span>
              <motion.span
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="grid h-6 w-6 shrink-0 place-items-center text-[#888]"
              >
                <ChevronDown className="h-4 w-4" />
              </motion.span>
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{
                    height: "auto",
                    opacity: 1,
                    transition: {
                      height: { duration: 0.25, ease: [0.16, 1, 0.3, 1] },
                      opacity: { duration: 0.2, delay: 0.05 },
                    },
                  }}
                  exit={{
                    height: 0,
                    opacity: 0,
                    transition: {
                      height: { duration: 0.2, ease: [0.16, 1, 0.3, 1] },
                      opacity: { duration: 0.1 },
                    },
                  }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-5 pt-1 text-[14px] leading-relaxed text-[#666]">
                    <p>{item.answer}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )
      })}
    </div>
  )
}
