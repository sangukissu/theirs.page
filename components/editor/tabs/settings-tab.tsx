"use client"

import { useState, useRef } from "react"
import { Globe, Lock, Shield, Trash2, AlertTriangle, CheckCircle2, AlertCircle } from "lucide-react"

interface SettingsTabProps {
  memorialId: string
  slug: string
  privacy: "public" | "unlisted" | "private"
  successorName: string
  successorEmail: string
  onChange: (field: string, value: any) => void
  onDeleteMemorial: () => void
}

export function SettingsTab({
  memorialId,
  slug,
  privacy,
  successorName,
  successorEmail,
  onChange,
  onDeleteMemorial,
}: SettingsTabProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [confirmText, setConfirmText] = useState("")

  // Live slug checking state
  const [slugChecking, setSlugChecking] = useState(false)
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null)
  const [slugMessage, setSlugMessage] = useState<string | null>(null)
  const [slugSuggestions, setSlugSuggestions] = useState<string[]>([])
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  const handleSlugChange = (raw: string) => {
    const cleaned = raw.toLowerCase().replace(/[^a-z0-9-]/g, "").replace(/-{2,}/g, "-")
    onChange("slug", cleaned)

    if (!cleaned || cleaned.length < 3) {
      setSlugAvailable(null)
      setSlugMessage(null)
      setSlugSuggestions([])
      return
    }

    setSlugChecking(true)
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)
    debounceTimerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/memorials/check-slug?slug=${encodeURIComponent(cleaned)}&excludeId=${encodeURIComponent(memorialId)}`
        )
        const data = await res.json()
        setSlugChecking(false)
        setSlugAvailable(data.available)
        setSlugMessage(data.message)
        setSlugSuggestions(data.suggestions || [])
      } catch (err) {
        setSlugChecking(false)
      }
    }, 300)
  }

  const handleDelete = async () => {
    if (confirmText !== "DELETE") return

    setIsDeleting(true)
    try {
      const res = await fetch(`/api/memorials/${memorialId}`, {
        method: "DELETE",
      })
      if (res.ok) {
        onDeleteMemorial()
      }
    } catch (err) {
      console.error("Failed to delete memorial:", err)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="flex flex-col gap-8 max-w-2xl">
      <div className="flex flex-col gap-1 border-b border-black/[0.06] pb-4">
        <h2 className="text-lg sm:text-xl font-medium text-[#181925]">
          Memorial Settings & Privacy
        </h2>
        <p className="text-xs sm:text-sm text-[#71717a]">
          Manage your shareable web address, privacy level, and long-term stewardship.
        </p>
      </div>

      {/* 1. Web Address (Slug) with Live Availability Check */}
      <div className="flex flex-col gap-2 p-5 rounded-2xl bg-white border border-black/[0.07]">
        <label className="text-xs font-medium text-[#181925]">
          Permanent Web Address
        </label>
        <div className="flex items-center px-4 py-2 rounded-xl bg-[#fafafb] border border-black/[0.08] text-xs text-[#888] font-mono">
          <span>theirs.page/</span>
          <input
            type="text"
            value={slug}
            onChange={(e) => handleSlugChange(e.target.value)}
            className="flex-1 bg-transparent text-xs text-[#181925] font-mono outline-none ml-0.5"
          />
          {slugChecking && (
            <span className="text-[10px] text-[#888] font-sans">Checking...</span>
          )}
          {!slugChecking && slugAvailable === true && (
            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-sans font-medium">
              <CheckCircle2 className="size-3.5" />
              <span>Available</span>
            </span>
          )}
          {!slugChecking && slugAvailable === false && (
            <span className="inline-flex items-center gap-1 text-[11px] text-amber-600 font-sans font-medium">
              <AlertCircle className="size-3.5" />
              <span>Taken</span>
            </span>
          )}
        </div>

        {/* Suggestion Pills */}
        {slugAvailable === false && slugSuggestions.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            <span className="text-[11px] text-[#71717a]">Suggested:</span>
            {slugSuggestions.map((sug) => (
              <button
                key={sug}
                type="button"
                onClick={() => handleSlugChange(sug)}
                className="px-2.5 py-0.5 rounded-full bg-primary/10 hover:bg-primary/20 text-primary text-[11px] font-mono font-medium transition-colors cursor-pointer"
              >
                {sug}
              </button>
            ))}
          </div>
        )}

        {slugMessage && slugAvailable === false && (
          <span className="text-[11px] text-amber-700">{slugMessage}</span>
        )}

        <span className="text-[11px] text-[#888]">
          You can customize this address anytime.
        </span>
      </div>

      {/* 2. Privacy Mode */}
      <div className="flex flex-col gap-3 p-5 rounded-2xl bg-white border border-black/[0.07]">
        <label className="text-xs font-medium text-[#181925]">
          Privacy Level
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              id: "public",
              title: "Public",
              desc: "Visible to anyone and indexed by search engines so distant friends can find it.",
              icon: Globe,
            },
            {
              id: "unlisted",
              title: "Unlisted",
              desc: "Only people who have the link can visit. Hidden from Google.",
              icon: Shield,
            },
            {
              id: "private",
              title: "Private PIN",
              desc: "Requires a 4-digit PIN code to view memories and stories.",
              icon: Lock,
            },
          ].map((mode) => {
            const Icon = mode.icon
            const isSelected = privacy === mode.id
            return (
              <div
                key={mode.id}
                onClick={() => onChange("privacy", mode.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5 select-none ${
                  isSelected
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-black/[0.08] bg-[#fafafb] text-[#555] hover:border-black/[0.15]"
                }`}
              >
                <div className="flex items-center gap-1.5 font-medium text-xs">
                  <Icon className="size-3.5" />
                  <span>{mode.title}</span>
                </div>
                <p className="text-[10px] leading-relaxed text-[#777]">{mode.desc}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* 3. Long-Term Stewardship Successor */}
      <div className="flex flex-col gap-3 p-5 rounded-2xl bg-white border border-black/[0.07]">
        <div className="flex flex-col gap-0.5">
          <label className="text-xs font-medium text-[#181925]">
            Successor Caretaker (Optional)
          </label>
          <p className="text-[11px] text-[#71717a]">
            If you are ever unable to manage this memorial, who in your family should have ownership?
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="text"
            value={successorName}
            onChange={(e) => onChange("successor_name", e.target.value)}
            placeholder="Caretaker Name (e.g. Anita Carter)"
            className="px-3.5 py-2 rounded-xl bg-[#fafafb] border border-black/[0.08] text-xs text-[#181925] outline-none focus:border-primary/50"
          />

          <input
            type="email"
            value={successorEmail}
            onChange={(e) => onChange("successor_email", e.target.value)}
            placeholder="Caretaker Email"
            className="px-3.5 py-2 rounded-xl bg-[#fafafb] border border-black/[0.08] text-xs text-[#181925] outline-none focus:border-primary/50"
          />
        </div>
      </div>

      {/* 4. Danger Zone */}
      <div className="flex flex-col gap-3 p-5 rounded-2xl bg-rose-50/50 border border-rose-200/80">
        <div className="flex items-center gap-2 text-rose-800 text-xs font-semibold">
          <AlertTriangle className="size-4 text-rose-600" />
          <span>Danger Zone</span>
        </div>
        <p className="text-[11px] text-rose-700 leading-relaxed">
          Permanently delete this memorial, all uploaded media, timelines, and contributed memories. This action cannot be undone.
        </p>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="Type DELETE to confirm"
            className="px-3 py-1.5 rounded-xl bg-white border border-rose-300 text-xs text-rose-900 outline-none focus:border-rose-500"
          />

          <button
            type="button"
            disabled={confirmText !== "DELETE" || isDeleting}
            onClick={handleDelete}
            className="px-4 py-1.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium transition-colors cursor-pointer disabled:opacity-40"
          >
            {isDeleting ? "Deleting..." : "Delete memorial"}
          </button>
        </div>
      </div>
    </div>
  )
}
