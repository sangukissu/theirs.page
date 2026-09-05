"use client"

import { useState } from "react"
import { Upload, Image as ImageIcon, CheckCircle2, AlertCircle } from "lucide-react"

interface IdentityTabProps {
  memorialId: string
  fullName: string
  preferredName: string
  birthYear: string
  deathYear: string
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
  location,
  headline,
  portraitUrl,
  onChange,
}: IdentityTabProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  // Direct upload handler for portrait photo
  const handlePortraitUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setUploadError(null)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("folder", "portraits")
      formData.append("memorialId", memorialId)

      const uploadRes = await fetch("/api/r2/upload", {
        method: "POST",
        body: formData,
      })

      const uploadData = await uploadRes.json()
      if (!uploadRes.ok) {
        throw new Error(uploadData.error || "Failed to upload photo")
      }

      onChange("portrait_photo_url", uploadData.publicUrl)
    } catch (err: any) {
      console.error("Portrait upload error:", err)
      setUploadError(err.message || "Upload failed")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="flex flex-col gap-8 max-w-2xl">
      <div className="flex flex-col gap-1 border-b border-black/[0.06] pb-4">
        <h2 className="text-lg sm:text-xl font-medium text-[#181925]">
          This memorial is dedicated to:
        </h2>
       
      </div>

      {/* 1. Portrait Photo Upload */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-5 rounded-2xl bg-white border border-black/[0.07]">
        <div className="size-24 rounded-2xl overflow-hidden bg-neutral-100 border border-black/[0.08] relative shrink-0 shadow-xs">
          <img
            src={portraitUrl || "/memorial-family-portrait-grandfather.jpg"}
            alt={fullName || "Portrait"}
            className="size-full object-cover"
          />
          {isUploading && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-xs">
              Uploading...
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 flex-1">
          <span className="text-xs font-medium text-[#181925]">Primary Portrait</span>
          <p className="text-[11px] text-[#71717a]">
            Choose a photo that captures their everyday warmth or spirit. High-resolution photos are preserved untouched.
          </p>

          <label className="self-start inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#f4f4f6] hover:bg-neutral-200 text-[#181925] text-xs font-medium transition-colors cursor-pointer select-none">
            <Upload className="size-3" />
            <span>{isUploading ? "Uploading photo..." : "Upload portrait"}</span>
            <input
              type="file"
              accept="image/*"
              disabled={isUploading}
              onChange={handlePortraitUpload}
              className="hidden"
            />
          </label>

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
            value={fullName}
            onChange={(e) => onChange("full_name", e.target.value)}
            placeholder="e.g. Robert Edward Carter"
            className="px-3.5 py-2 rounded-xl bg-white border border-black/[0.08] text-xs sm:text-sm text-[#181925] outline-none focus:border-primary/60 transition-colors"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-[#181925]">
            Preferred / Nickname
          </label>
          <input
            type="text"
            value={preferredName}
            onChange={(e) => onChange("preferred_name", e.target.value)}
            placeholder="e.g. Bob, Nana"
            className="px-3.5 py-2 rounded-xl bg-white border border-black/[0.08] text-xs sm:text-sm text-[#181925] outline-none focus:border-primary/60 transition-colors"
          />
        </div>
      </div>

      {/* 3. Lifespan Years & Location */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-[#181925]">
            Born
          </label>
          <input
            type="number"
            value={birthYear}
            onChange={(e) => onChange("birth_year", e.target.value)}
            placeholder="1948"
            className="px-3.5 py-2 rounded-xl bg-white border border-black/[0.08] text-xs sm:text-sm text-[#181925] font-mono outline-none focus:border-primary/60 transition-colors"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-[#181925]">
            Passed Away
          </label>
          <input
            type="number"
            value={deathYear}
            onChange={(e) => onChange("death_year", e.target.value)}
            placeholder="2024"
            className="px-3.5 py-2 rounded-xl bg-white border border-black/[0.08] text-xs sm:text-sm text-[#181925] font-mono outline-none focus:border-primary/60 transition-colors"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-[#181925]">
            Home / Region
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => onChange("location", e.target.value)}
            placeholder="e.g. Devon, England"
            className="px-3.5 py-2 rounded-xl bg-white border border-black/[0.08] text-xs sm:text-sm text-[#181925] outline-none focus:border-primary/60 transition-colors"
          />
        </div>
      </div>

      {/* 4. Defining Quote / Epitaph */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-baseline justify-between">
          <label className="text-xs font-medium text-[#181925]">
            Defining Quote or Epitaph
          </label>
          <span className="text-[11px] text-[#888]">1–2 sentences</span>
        </div>
        <textarea
          rows={2}
          value={headline}
          onChange={(e) => onChange("headline", e.target.value)}
          placeholder="e.g. “He could fix almost anything with a brass gear and an hour of quiet.”"
          className="px-3.5 py-2.5 rounded-xl bg-white border border-black/[0.08] text-xs sm:text-sm text-[#181925] outline-none focus:border-primary/60 transition-colors resize-none leading-relaxed"
        />
        <span className="text-[11px] text-[#888]">
          Appears in large serif text below their name on the live memorial.
        </span>
      </div>
    </div>
  )
}
