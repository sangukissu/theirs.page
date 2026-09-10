"use client"

import React, { useState } from "react"
import { usePathname } from "next/navigation"
import { LifeBuoy } from "lucide-react"
import { HelpFeedbackModal } from "./help-feedback-modal"

interface SupportFeedbackBadgeProps {
  userEmail: string
  userId?: string
}

export function SupportFeedbackBadge({ userEmail, userId }: SupportFeedbackBadgeProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  // Extract memorialId from pathname if in editor or memorial subpage
  const memorialMatch = pathname.match(/\/memorials\/([0-9a-fA-F-]{36})/)
  const memorialId = memorialMatch ? memorialMatch[1] : undefined

  return (
    <>
      {/* Sticky Right-Wall Badge */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Support and Feedback"
        className="fixed right-0 bottom-16 sm:bottom-20 z-40 flex flex-col items-center gap-1 py-1.5 px-1 sm:py-2 sm:px-1.5 bg-neutral-200 hover:bg-neutral-300 text-neutral-700 rounded-l-lg border-t border-b border-l border-neutral-300 cursor-pointer select-none"
      >
        <LifeBuoy className="size-3 sm:size-3.5 text-neutral-600" />
        <span className="text-[8px] sm:text-[9px] font-medium [writing-mode:vertical-rl] select-none text-neutral-700">
          Support / Feedback
        </span>
      </button>

      {/* Modal */}
      <HelpFeedbackModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        userEmail={userEmail}
        userId={userId}
        memorialId={memorialId}
      />
    </>
  )
}
