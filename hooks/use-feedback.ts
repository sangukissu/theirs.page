"use client"

import { useState, useCallback } from "react"

export interface FeedbackInput {
  working_well?: string
  could_be_better?: string
  rating?: number
  memorial_id?: string
  feedback_text?: string
}

export interface UseFeedbackReturn {
  isModalOpen: boolean
  isLoading: boolean
  showFeedbackModal: () => void
  hideFeedbackModal: () => void
  submitFeedback: (inputOrRating: FeedbackInput | number, maybeFeedback?: string) => Promise<boolean>
  skipFeedback: () => Promise<void>
  trackRestoration: () => Promise<void>
  trackFirstDownload: () => Promise<void>
}

export function useFeedback(): UseFeedbackReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const showFeedbackModal = useCallback(() => {
    setIsModalOpen(true)
  }, [])

  const hideFeedbackModal = useCallback(() => {
    setIsModalOpen(false)
  }, [])

  const submitFeedback = useCallback(
    async (inputOrRating: FeedbackInput | number, maybeFeedback?: string) => {
      try {
        setIsLoading(true)
        const payload: Record<string, any> = {
          page_path: typeof window !== "undefined" ? window.location.pathname : undefined,
        }

        if (typeof inputOrRating === "number") {
          payload.rating = inputOrRating
          if (maybeFeedback) payload.feedback_text = maybeFeedback
        } else if (typeof inputOrRating === "object" && inputOrRating !== null) {
          Object.assign(payload, inputOrRating)
        }

        const response = await fetch("/api/feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
        return response.ok
      } catch (error) {
        console.error("Error submitting feedback:", error)
        return false
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  const skipFeedback = useCallback(async () => {}, [])
  const trackRestoration = useCallback(async () => {}, [])
  const trackFirstDownload = useCallback(async () => {}, [])

  return {
    isModalOpen,
    isLoading,
    showFeedbackModal,
    hideFeedbackModal,
    submitFeedback,
    skipFeedback,
    trackRestoration,
    trackFirstDownload,
  }
}