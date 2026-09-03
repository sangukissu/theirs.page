"use client"

import { useState } from "react"
import { Sparkles, Check, AlertCircle } from "lucide-react"

interface StoryTabProps {
  fullName: string
  biography: string
  onChange: (value: string) => void
}

export function StoryTab({ fullName, biography, onChange }: StoryTabProps) {
  const [isPolishing, setIsPolishing] = useState(false)
  const [polishError, setPolishError] = useState<string | null>(null)
  const firstName = fullName.split(" ")[0] || "them"

  const handleAiPolish = async () => {
    if (!biography || biography.trim().length < 20) {
      setPolishError("Please write at least a sentence or two of rough notes first.")
      return
    }

    setIsPolishing(true)
    setPolishError(null)

    try {
      const res = await fetch("/api/memory-books/polish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: biography,
          personName: fullName,
        }),
      })

      if (!res.ok) {
        // Fallback: simple client-side gentle formatting if endpoint not available
        throw new Error("Unable to connect to editor service right now.")
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
        <div className="flex items-center justify-between">
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
          Write about {firstName} in your own words. Focus on the quirks, values, and memories that made them who they were.
        </p>
      </div>

      {polishError && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
          <AlertCircle className="size-3.5 shrink-0 text-amber-600" />
          <span>{polishError}</span>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <textarea
          rows={14}
          value={biography}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`Write ${firstName}’s story here...\n\ne.g. Robert was born in Exeter during the autumn of 1948, the younger of two brothers raised on the edge of the Devon moors. He spent fifty years repairing antique clocks on the high street, but his true joy was Sunday afternoon tea in the garden with Meena...`}
          className="w-full px-4 py-3 rounded-2xl bg-white border border-black/[0.08] text-sm text-[#222] placeholder:text-[#aaa] outline-none focus:border-primary/60 transition-colors resize-y leading-relaxed font-sans"
        />

        <div className="flex items-center justify-between text-[11px] text-[#888] px-1">
          <span>Formatted into readable editorial paragraphs on the live page.</span>
          <span>{biography ? biography.split(/\s+/).filter(Boolean).length : 0} words</span>
        </div>
      </div>
    </div>
  )
}
