"use client"

import { useState } from "react"
import { Upload, AlertCircle } from "lucide-react"
import { PortraitPlaceholder } from "@/components/memorial/portrait-placeholder"
import { TEXT_LIMITS } from "@/lib/validation/text-limits"

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
          <label className="text-xs font-medium text-[#181925]">
            Full Name *
          </label>
          <input
            type="text"
            required
            maxLength={TEXT_LIMITS.personFullName}
            value={fullName}
            onChange={(e) => onChange("full_name", e.target.value)}
            placeholder="e.g. Robert Edward Carter"
            className="px-3.5 py-2 rounded-xl bg-white border border-black/[0.08] text-xs sm:text-sm text-[#181925] outline-none focus:border-primary/60 transition-colors"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-[#181925]">
            What people called them
          </label>
          <input
            type="text"
            maxLength={TEXT_LIMITS.preferredName}
            value={preferredName}
            onChange={(e) => onChange("preferred_name", e.target.value)}
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
              <select
                value={birthMonth || ""}
                onChange={(e) => onChange("birth_month", e.target.value)}
                className="w-1/2 px-2.5 py-1.5 rounded-lg bg-neutral-50 border border-black/[0.08] text-xs text-[#181925] outline-none focus:border-primary/60"
              >
                <option value="">Month</option>
                {MONTH_NAMES.map((m, idx) => (
                  <option key={idx + 1} value={String(idx + 1)}>
                    {m}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min={1}
                max={31}
                value={birthDay || ""}
                onChange={(e) => onChange("birth_day", e.target.value)}
                placeholder="Day"
                className="w-1/2 px-2.5 py-1.5 rounded-lg bg-neutral-50 border border-black/[0.08] text-xs text-[#181925] font-mono outline-none focus:border-primary/60"
              />
              <button
                type="button"
                onClick={() => {
                  onChange("birth_month", "")
                  onChange("birth_day", "")
                  setShowExactBirth(false)
                }}
                className="text-xs text-[#888] hover:text-rose-600 px-1 py-0.5 rounded cursor-pointer"
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
              <select
                value={deathMonth || ""}
                onChange={(e) => onChange("death_month", e.target.value)}
                className="w-1/2 px-2.5 py-1.5 rounded-lg bg-neutral-50 border border-black/[0.08] text-xs text-[#181925] outline-none focus:border-primary/60"
              >
                <option value="">Month</option>
                {MONTH_NAMES.map((m, idx) => (
                  <option key={idx + 1} value={String(idx + 1)}>
                    {m}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min={1}
                max={31}
                value={deathDay || ""}
                onChange={(e) => onChange("death_day", e.target.value)}
                placeholder="Day"
                className="w-1/2 px-2.5 py-1.5 rounded-lg bg-neutral-50 border border-black/[0.08] text-xs text-[#181925] font-mono outline-none focus:border-primary/60"
              />
              <button
                type="button"
                onClick={() => {
                  onChange("death_month", "")
                  onChange("death_day", "")
                  setShowExactDeath(false)
                }}
                className="text-xs text-[#888] hover:text-rose-600 px-1 py-0.5 rounded cursor-pointer"
                title="Remove exact date"
              >
                ×
              </button>
            </div>
          )}
        </div>

        {/* Where they called home */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-[#181925]">
            Where they called home
          </label>
          <input
            type="text"
            maxLength={TEXT_LIMITS.location}
            value={location}
            onChange={(e) => onChange("location", e.target.value)}
            placeholder="e.g. Devon, England"
            className="px-3.5 py-2 rounded-xl bg-white border border-black/[0.08] text-xs sm:text-sm text-[#181925] outline-none focus:border-primary/60 transition-colors"
          />
        </div>
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
        <select
          value={creatorRelationship || ""}
          onChange={(e) => onChange("creator_relationship", e.target.value)}
          className="px-3.5 py-2 rounded-xl bg-white border border-black/[0.08] text-xs sm:text-sm text-[#181925] outline-none focus:border-primary/60 transition-colors"
        >
          <option value="">Select relationship (optional)...</option>
          {RELATIONSHIP_CHOICES.map((rel) => (
            <option key={rel} value={rel}>{rel}</option>
          ))}
        </select>
        <span className="text-[11px] text-[#888]">
          Used gently in the memorial footer (e.g. &ldquo;Created by Anita &middot; Robert’s granddaughter&rdquo;).
        </span>
      </div>
    </div>
  )
}
