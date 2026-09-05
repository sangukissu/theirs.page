"use client"

import { useState } from "react"
import { Sparkles, AlertCircle } from "lucide-react"
import { RichStoryEditor } from "../rich-story-editor"

interface StoryTabProps {
  fullName: string
  biography: string
  onChange: (value: string) => void
}

export function StoryTab({
  fullName,
  biography,
  onChange,
}: StoryTabProps) {
  const [isPolishing, setIsPolishing] = useState(false)
  const [polishError, setPolishError] = useState<string | null>(null)
  const firstName = fullName.split(" ")[0] || "them"

  const handleAiPolish = async () => {
    // Strip tags to check length
    const plainText = biography.replace(/<[^>]*>/g, "").trim()
    if (!plainText || plainText.length < 20) {
      setPolishError("Please write at least a sentence or two of rough notes first.")
      return
    }

    setIsPolishing(true)
    setPolishError(null)

    try {
      const res = await fetch("/api/story/polish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: biography,
          personName: fullName,
        }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || "Unable to connect to editor service right now.")
      }

      const data = await res.json()
      if (data.polishedText) {
        onChange(data.polishedText)
      }
    } catch (err: any) {
      setPolishError(err.message || "Polish failed")
    } finally {
      setIsPolishing(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div className="flex flex-col gap-1 border-b border-black/[0.06] pb-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg sm:text-xl font-medium text-[#181925]">
            Their Life Story
          </h2>

          <button
            type="button"
            onClick={handleAiPolish}
            disabled={isPolishing}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 hover:bg-primary/20 text-primary text-xs font-medium transition-colors cursor-pointer select-none disabled:opacity-50"
            title="Clean up grammar and structure while preserving your authentic voice"
          >
            <Sparkles className="size-3" />
            <span>{isPolishing ? "Polishing..." : "Polish with AI"}</span>
          </button>
        </div>
        <p className="text-xs sm:text-sm text-[#71717a]">
          Write about {firstName} in your own words. Use headings for life chapters, bold for emphasis, and pull quotes for their favorite sayings.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {polishError && (
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
            <AlertCircle className="size-3.5 shrink-0 text-amber-600" />
            <span>{polishError}</span>
          </div>
        )}

        <RichStoryEditor
          value={biography}
          onChange={onChange}
          placeholder={`Write ${firstName}’s story here...\n\ne.g. ${firstName} was born during the autumn of 1948, the younger of two brothers raised on the edge of the Devon moors. They spent fifty years repairing antique clocks on the high street, but their true joy was Sunday afternoon tea in the garden...`}
        />
      </div>
    </div>
  )
}
