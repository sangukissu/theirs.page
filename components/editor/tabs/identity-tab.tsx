"use client"

import { useState } from "react"
import { Upload, AlertCircle } from "lucide-react"
import { PortraitPlaceholder } from "@/components/memorial/portrait-placeholder"
import { TEXT_LIMITS, formatMemorialLocation } from "@/lib/validation/text-limits"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const RELATIONSHIP_CHOICES = [
  "Daughter",
  "Son",
  "Child",
  "Spouse / Partner",
  "Grandchild",
  "Parent",
  "Sibling",
  "Friend",
  "Other",
]

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
]

interface IdentityTabProps {
  memorialId: string
  fullName: string
  preferredName: string
  birthYear: string
  deathYear: string
  birthMonth?: string
  birthDay?: string
  deathMonth?: string
  deathDay?: string
  creatorRelationship?: string
  location: string
  headline: string
  portraitUrl: string
  onChange: (field: string, value: string) => void
}

export function IdentityTab({
  memorialId,
  fullName,
  preferredName,
  birthYear,
  deathYear,
  birthMonth = "",
  birthDay = "",
  deathMonth = "",
  deathDay = "",
  creatorRelationship = "",
  location,
  headline,
  portraitUrl,
  onChange,
}: IdentityTabProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null)
  const [showExactBirth, setShowExactBirth] = useState(() => Boolean(birthMonth || birthDay))
  const [showExactDeath, setShowExactDeath] = useState(() => Boolean(deathMonth || deathDay))

  // Direct upload handler for portrait photo
  const handlePortraitUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setUploadError(null)

    const preview = URL.createObjectURL(file)
    setLocalPreviewUrl(preview)

    try {
      const presignedRes = await fetch("/api/r2/presigned-upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type || "application/octet-stream",
          fileSize: file.size,
          folder: "portraits",
          memorialId,
        }),
      })
      const presignedData = await presignedRes.json().catch(() => ({}))
      if (!presignedRes.ok) throw new Error(presignedData.error || "Failed to prepare portrait upload")

      let uploadKey = presignedData.stagingKey || presignedData.key
      try {
        const directRes = await fetch(presignedData.uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": presignedData.contentType || file.type },
          body: file,
        })
        if (!directRes.ok) throw new Error(`Direct upload returned ${directRes.status}`)
      } catch (directError) {
        console.warn("Direct portrait upload failed; using the bounded server fallback:", directError)
        const formData = new FormData()
        formData.append("file", file)
        formData.append("folder", "portraits")
        formData.append("memorialId", memorialId)
        const fallbackRes = await fetch("/api/r2/upload", { method: "POST", body: formData })
        const fallbackData = await fallbackRes.json().catch(() => ({}))
        if (!fallbackRes.ok) throw new Error(fallbackData.error || "Failed to upload portrait photo")
        uploadKey = fallbackData.key
      }
      onChange("portrait_photo_url", uploadKey)
    } catch (err: any) {
      console.error("Portrait upload error:", err)
      setUploadError(err.message || "Upload failed")
      setLocalPreviewUrl(null)
    } finally {
      setIsUploading(false)
      if (e.target) {
        e.target.value = ""
      }
    }
  }

  return (
    <div className="flex flex-col gap-4 max-w-2xl">
      <div className="flex flex-col gap-1 border-b border-black/[0.06] pb-4">
        <h2 className="text-lg sm:text-xl font-medium text-[#181925]">
          This memorial is dedicated to:
        </h2>

      </div>

      {/* 1. Portrait Photo Upload */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-5 rounded-2xl bg-white border border-black/[0.07]">
        <div className="size-24 rounded-2xl overflow-hidden bg-neutral-100 border border-black/[0.08] relative shrink-0 shadow-xs">
          {localPreviewUrl || portraitUrl ? (
            <img
              src={
                localPreviewUrl ||
                (portraitUrl.startsWith("http://") ||
                  portraitUrl.startsWith("https://") ||
                  portraitUrl.startsWith("/")
                  ? portraitUrl
                  : `/api/media?key=${encodeURIComponent(portraitUrl)}`)
              }
              alt={fullName || "Portrait"}
              className="size-full object-cover"
            />
          ) : (
            <PortraitPlaceholder fullName={fullName} prompt="Add a portrait" />
          )}
          {isUploading && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-xs">
              Uploading...
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 flex-1">
          <span className="text-xs font-medium text-[#181925]">Their photo</span>
          <p className="text-[11px] text-[#71717a]">
            Choose a photo that captures their everyday warmth or spirit. High-resolution photos are preserved untouched.
          </p>

          <div className="flex items-center gap-2">
            <label className="self-start inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#f4f4f6] hover:bg-neutral-200 text-[#181925] text-xs font-medium transition-colors cursor-pointer select-none">
              <Upload className="size-3" />
              <span>{isUploading ? "Uploading photo..." : (portraitUrl ? "Change photo" : "Upload portrait")}</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif"
                disabled={isUploading}
                onChange={handlePortraitUpload}
                className="hidden"
              />
            </label>
            {portraitUrl && (
              <button
                type="button"
                disabled={isUploading}
                onClick={() => {
                  setLocalPreviewUrl(null)
                  onChange("portrait_photo_url", "")
                }}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs text-rose-600 hover:bg-rose-50 transition-colors"
              >
                Remove
              </button>
            )}
          </div>

          {uploadError && (
            <span className="text-[11px] text-rose-600 flex items-center gap-1">
              <AlertCircle className="size-3" />
              <span>{uploadError}</span>
            </span>
          )}
        </div>
      </div>

      {/* 2. Full Name & Nickname */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2 flex flex-col gap-1.5">
          <div className="flex items-baseline justify-between">
            <label htmlFor="identity-fullname" className="text-xs font-medium text-[#181925]">
              Full Name *
            </label>
            <span className={`text-[11px] font-mono ${(fullName || "").length >= TEXT_LIMITS.personFullName ? "text-amber-600 font-semibold" : "text-[#888]"}`}>
              {(fullName || "").length}/{TEXT_LIMITS.personFullName}
            </span>
          </div>
          <input
            id="identity-fullname"
            type="text"
            required
            maxLength={TEXT_LIMITS.personFullName}
            value={fullName || ""}
            onChange={(e) => {
              onChange("full_name", e.target.value.slice(0, TEXT_LIMITS.personFullName))
            }}
            onPaste={(e) => {
              e.preventDefault()
              const pasted = e.clipboardData.getData("text")
              const clamped = pasted.slice(0, TEXT_LIMITS.personFullName)
              onChange("full_name", clamped)
            }}
            placeholder="e.g. Robert Edward Carter"
            className="px-3.5 py-2 rounded-xl bg-white border border-black/[0.08] text-xs sm:text-sm text-[#181925] outline-none focus:border-primary/60 transition-colors"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-baseline justify-between">
            <label htmlFor="identity-nickname" className="text-xs font-medium text-[#181925]">
              What people called them
            </label>
            <span className="text-[11px] font-mono text-[#888]">
              {(preferredName || "").length}/{TEXT_LIMITS.preferredName}
            </span>
          </div>
          <input
            id="identity-nickname"
            type="text"
            maxLength={TEXT_LIMITS.preferredName}
            value={preferredName || ""}
            onChange={(e) => {
              let val = e.target.value.slice(0, TEXT_LIMITS.preferredName)
              e.target.value = val
              onChange("preferred_name", val)
            }}
            placeholder="e.g. Bob, Nana"
            className="px-3.5 py-2 rounded-xl bg-white border border-black/[0.08] text-xs sm:text-sm text-[#181925] outline-none focus:border-primary/60 transition-colors"
          />
        </div>
      </div>

      {/* 3. Lifespan & Location */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Born */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-[#181925]">
              Born
            </label>
            {!showExactBirth && (
              <button
                type="button"
                onClick={() => setShowExactBirth(true)}
                className="text-[11px] text-primary hover:underline cursor-pointer"
              >
                + Add exact date
              </button>
            )}
          </div>
          <input
            type="number"
            value={birthYear}
            onChange={(e) => onChange("birth_year", e.target.value)}
            placeholder="1948"
            className="px-3.5 py-2 rounded-xl bg-white border border-black/[0.08] text-xs sm:text-sm text-[#181925] font-mono outline-none focus:border-primary/60 transition-colors"
          />
          {showExactBirth && (
            <div className="flex items-center gap-2 pt-1 animate-in fade-in">
              <div className="w-1/2">
                <Select
                  value={birthMonth || undefined}
                  onValueChange={(val) => onChange("birth_month", val === "clear" ? "" : val)}
                >
                  <SelectTrigger className="w-full h-8.5 px-3 rounded-lg bg-neutral-50 border border-black/[0.08] text-xs text-[#181925] outline-none focus:border-primary/60">
                    <SelectValue placeholder="Month" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="clear" className="text-[#888]">
                      Month
                    </SelectItem>
                    {MONTH_NAMES.map((m, idx) => (
                      <SelectItem key={idx + 1} value={String(idx + 1)}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <input
                type="number"
                min={1}
                max={31}
                value={birthDay || ""}
                onChange={(e) => onChange("birth_day", e.target.value)}
                placeholder="Day"
                className="w-1/2 h-8.5 px-3 rounded-lg bg-neutral-50 border border-black/[0.08] text-xs text-[#181925] font-mono outline-none focus:border-primary/60"
              />
              <button
                type="button"
                onClick={() => {
                  onChange("birth_month", "")
                  onChange("birth_day", "")
                  setShowExactBirth(false)
                }}
                className="text-xs text-[#888] hover:text-rose-600 px-1 py-0.5 rounded cursor-pointer shrink-0"
                title="Remove exact date"
              >
                ×
              </button>
            </div>
          )}
        </div>

        {/* Passed Away */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-[#181925]">
              Passed away
            </label>
            {!showExactDeath && (
              <button
                type="button"
                onClick={() => setShowExactDeath(true)}
                className="text-[11px] text-primary hover:underline cursor-pointer"
              >
                + Add exact date
              </button>
            )}
          </div>
          <input
            type="number"
            value={deathYear}
            onChange={(e) => onChange("death_year", e.target.value)}
            placeholder="2024"
            className="px-3.5 py-2 rounded-xl bg-white border border-black/[0.08] text-xs sm:text-sm text-[#181925] font-mono outline-none focus:border-primary/60 transition-colors"
          />
          {showExactDeath && (
            <div className="flex items-center gap-2 pt-1 animate-in fade-in">
              <div className="w-1/2">
                <Select
                  value={deathMonth || undefined}
                  onValueChange={(val) => onChange("death_month", val === "clear" ? "" : val)}
                >
                  <SelectTrigger className="w-full h-8.5 px-3 rounded-lg bg-neutral-50 border border-black/[0.08] text-xs text-[#181925] outline-none focus:border-primary/60">
                    <SelectValue placeholder="Month" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="clear" className="text-[#888]">
                      Month
                    </SelectItem>
                    {MONTH_NAMES.map((m, idx) => (
                      <SelectItem key={idx + 1} value={String(idx + 1)}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <input
                type="number"
                min={1}
                max={31}
                value={deathDay || ""}
                onChange={(e) => onChange("death_day", e.target.value)}
                placeholder="Day"
                className="w-1/2 h-8.5 px-3 rounded-lg bg-neutral-50 border border-black/[0.08] text-xs text-[#181925] font-mono outline-none focus:border-primary/60"
              />
              <button
                type="button"
                onClick={() => {
                  onChange("death_month", "")
                  onChange("death_day", "")
                  setShowExactDeath(false)
                }}
                className="text-xs text-[#888] hover:text-rose-600 px-1 py-0.5 rounded cursor-pointer shrink-0"
                title="Remove exact date"
              >
                ×
              </button>
            </div>
          )}
        </div>

        {/* Where they called home */}
        {(() => {
          const locWords = (location || "").trim().split(/\s+/).filter(Boolean)
          const isAtLimit = locWords.length >= TEXT_LIMITS.locationMaxWords
          const previewLocation = formatMemorialLocation(location)

          return (
            <div className="flex flex-col gap-1.5">
              <div className="flex items-baseline justify-between">
                <label htmlFor="identity-location" className="text-xs font-medium text-[#181925]">
                  Where they called home
                </label>
                <span className={`text-[11px] font-mono ${isAtLimit ? "text-amber-600 font-medium" : "text-[#888]"}`}>
                  {locWords.length}/{TEXT_LIMITS.locationMaxWords} words
                </span>
              </div>
              <input
                id="identity-location"
                type="text"
                maxLength={TEXT_LIMITS.location}
                value={location || ""}
                onKeyDown={(e) => {
                  if (
                    e.key === "Backspace" ||
                    e.key === "Delete" ||
                    e.key === "ArrowLeft" ||
                    e.key === "ArrowRight" ||
                    e.key === "Tab" ||
                    e.key === "Escape" ||
                    e.key === "Enter" ||
                    e.ctrlKey ||
                    e.metaKey ||
                    e.altKey
                  ) {
                    return
                  }

                  const input = e.currentTarget
                  const currentVal = input.value || ""
                  const selStart = input.selectionStart ?? currentVal.length
                  const selEnd = input.selectionEnd ?? currentVal.length

                  if (selStart !== selEnd) return

                  const words = currentVal.trim().split(/\s+/).filter(Boolean)

                  // Block Space if already at 5 words
                  if (e.key === " " && words.length >= TEXT_LIMITS.locationMaxWords) {
                    e.preventDefault()
                    return
                  }

                  // Block typing letters for 6th word if preceded by space
                  if (
                    words.length >= TEXT_LIMITS.locationMaxWords &&
                    /\s$/.test(currentVal) &&
                    selStart >= currentVal.length &&
                    e.key.length === 1
                  ) {
                    e.preventDefault()
                    return
                  }
                }}
                onChange={(e) => {
                  let val = e.target.value
                  if (val.length > TEXT_LIMITS.location) {
                    val = val.slice(0, TEXT_LIMITS.location)
                  }
                  const words = val.trim().split(/\s+/).filter(Boolean)
                  if (words.length > TEXT_LIMITS.locationMaxWords) {
                    val = words.slice(0, TEXT_LIMITS.locationMaxWords).join(" ").slice(0, TEXT_LIMITS.location)
                  }
                  e.target.value = val
                  onChange("location", val)
                }}
                onPaste={(e) => {
                  e.preventDefault()
                  const pasted = e.clipboardData.getData("text")
                  const words = pasted.trim().split(/\s+/).filter(Boolean)
                  const clamped = words.slice(0, TEXT_LIMITS.locationMaxWords).join(" ").slice(0, TEXT_LIMITS.location)
                  e.currentTarget.value = clamped
                  onChange("location", clamped)
                }}
                placeholder="e.g. Devon, England or Devon Jinga, Delhi"
                className="px-3.5 py-2 rounded-xl bg-white border border-black/[0.08] text-xs sm:text-sm text-[#181925] outline-none focus:border-primary/60 transition-colors"
              />


            </div>
          )
        })()}
      </div>

      {/* 4. Defining Quote / Line that feels like them */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-baseline justify-between">
          <label className="text-xs font-medium text-[#181925]">
            A line that feels like them
          </label>
          <span className="text-[11px] text-[#888]">1–2 sentences</span>
        </div>
        <textarea
          rows={2}
          maxLength={TEXT_LIMITS.headline}
          value={headline}
          onChange={(e) => onChange("headline", e.target.value)}
          placeholder="e.g. “He could fix almost anything with a brass gear and an hour of quiet.”"
          className="px-3.5 py-2.5 rounded-xl bg-white border border-black/[0.08] text-xs sm:text-sm text-[#181925] outline-none focus:border-primary/60 transition-colors resize-none leading-relaxed"
        />
        <span className="text-[11px] text-[#888]">
          Appears in large serif text below their name on the live memorial.
        </span>
      </div>

      {/* 5. Connection to them */}
      <div className="flex flex-col gap-1.5 pt-3 border-t border-black/[0.06]">
        <label className="text-xs font-medium text-[#181925]">
          Your connection to {fullName.trim().split(/\s+/)[0] || "them"}
        </label>
        <Select
          value={creatorRelationship || undefined}
          onValueChange={(val) => onChange("creator_relationship", val === "clear" ? "" : val)}
        >
          <SelectTrigger className="w-full h-10 px-3.5 rounded-xl bg-white border border-black/[0.08] text-xs sm:text-sm text-[#181925] outline-none focus:border-primary/60 transition-colors">
            <SelectValue placeholder="Select relationship (optional)..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="clear" className="text-[#888]">
              Select relationship (optional)...
            </SelectItem>
            {RELATIONSHIP_CHOICES.map((rel) => (
              <SelectItem key={rel} value={rel}>{rel}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-[11px] text-[#888]">
          Used gently in the memorial footer (e.g. &ldquo;Created by Anita &middot; Robert’s granddaughter&rdquo;).
        </span>
      </div>
    </div>
  )
}
