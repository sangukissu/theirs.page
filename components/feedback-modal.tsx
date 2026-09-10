"use client"

import { HelpFeedbackModal } from "@/components/dashboard/help-feedback-modal"

export default function FeedbackModal({
  isOpen,
  onClose,
  userEmail = "",
  userId = "",
  memorialId,
}: {
  isOpen: boolean
  onClose: () => void
  userEmail?: string
  userId?: string
  memorialId?: string
  onSubmit?: (rating: number, feedback: string) => void
  onSkip?: () => void
}) {
  return (
    <HelpFeedbackModal
      isOpen={isOpen}
      onClose={onClose}
      userEmail={userEmail}
      userId={userId}
      memorialId={memorialId}
    />
  )
}