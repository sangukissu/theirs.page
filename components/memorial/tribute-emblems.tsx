import React from "react"

export type TributeType = "flower" | "note" | "photo" | "candle"

interface EmblemProps {
  className?: string
  size?: number
}

/**
 * Botanical Wildflower Stem Linocut Emblem
 * Warm, peaceful illustration of a living wild blossom with leaves.
 */
export function BotanicalFlowerEmblem({ className = "", size = 44 }: EmblemProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Flower offering"
    >
      {/* Blossom Petals */}
      <circle cx="32" cy="22" r="5" fill="currentColor" fillOpacity="0.85" />
      <path
        d="M32 10C34.5 14 34.5 17 32 17C29.5 17 29.5 14 32 10Z"
        fill="currentColor"
        fillOpacity="0.75"
      />
      <path
        d="M44 22C40 24.5 37 24.5 37 22C37 19.5 40 19.5 44 22Z"
        fill="currentColor"
        fillOpacity="0.75"
      />
      <path
        d="M32 34C29.5 30 29.5 27 32 27C34.5 27 34.5 30 32 34Z"
        fill="currentColor"
        fillOpacity="0.75"
      />
      <path
        d="M20 22C24 19.5 27 19.5 27 22C27 24.5 24 24.5 20 22Z"
        fill="currentColor"
        fillOpacity="0.75"
      />
      <path
        d="M40.5 13.5C38 17.5 35.8 19 34 17.5C32.2 16 34 13.8 38 11.5L40.5 13.5Z"
        fill="currentColor"
        fillOpacity="0.7"
      />
      <path
        d="M40.5 30.5C36.5 28 35 25.8 36.5 24C38 22.2 40.2 24 42.5 28L40.5 30.5Z"
        fill="currentColor"
        fillOpacity="0.7"
      />
      <path
        d="M23.5 30.5C26 26.5 28.2 25 30 26.5C31.8 28 30 30.2 26 32.5L23.5 30.5Z"
        fill="currentColor"
        fillOpacity="0.7"
      />
      <path
        d="M23.5 13.5C27.5 16 29 18.2 27.5 20C26 21.8 23.8 20 21.5 16L23.5 13.5Z"
        fill="currentColor"
        fillOpacity="0.7"
      />

      {/* Elegant Curved Stem */}
      <path
        d="M32 26C31.5 35 28 44 22 53"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Organic Leaves */}
      <path
        d="M30 35C35 34 40 37 42 42C37 43 32 40 30 35Z"
        fill="currentColor"
        fillOpacity="0.7"
      />
      <path
        d="M27 43C21 41 17 44 15 48C20 49 25 47 27 43Z"
        fill="currentColor"
        fillOpacity="0.65"
      />
    </svg>
  )
}

/**
 * Archival Quill / Feather Linocut Emblem
 * An intimate, handwritten reflection token.
 */
export function QuillFeatherEmblem({ className = "", size = 44 }: EmblemProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Story written"
    >
      {/* Central Quill Shaft */}
      <path
        d="M48 12C36 24 24 38 18 52"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Feather Vane (Top / Outer) */}
      <path
        d="M48 12C45 22 36 30 28 38C26 35 28 30 35 21C40 15 45 13 48 12Z"
        fill="currentColor"
        fillOpacity="0.75"
      />

      {/* Feather Vane (Inner Flukes with Linocut Slits) */}
      <path
        d="M43 17C40 26 31 34 23 42C21 40 23 35 30 27C35 21 40 18 43 17Z"
        fill="currentColor"
        fillOpacity="0.7"
      />
      <path
        d="M37 23C34 32 26 39 19 46C18 44 19 40 25 33C29 28 34 24 37 23Z"
        fill="currentColor"
        fillOpacity="0.6"
      />

      {/* Nib Tip */}
      <path
        d="M18 52L16 56L20 54L18 52Z"
        fill="currentColor"
      />
    </svg>
  )
}

/**
 * Heirloom Keepsake Photo Frame Emblem
 * Used when the tribute features a photograph or captured moment.
 */
export function CameraHeirloomEmblem({ className = "", size = 44 }: EmblemProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Photograph shared"
    >
      {/* Outer Archival Mat */}
      <rect
        x="12"
        y="14"
        width="40"
        height="36"
        rx="5"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Inner Image Aperture */}
      <circle cx="32" cy="32" r="9" stroke="currentColor" strokeWidth="2" strokeDasharray="3 2" />
      <circle cx="32" cy="32" r="4" fill="currentColor" fillOpacity="0.8" />

      {/* Corner Mounting Flanges */}
      <path d="M16 19L19 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M48 19L45 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M16 45L19 48" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M48 45L45 48" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

/**
 * Universal Tribute Emblem Dispatcher
 */
export function TributeEmblem({
  type = "flower",
  className = "text-[#8b5a45]",
  size = 46,
}: {
  type?: TributeType
  className?: string
  size?: number
}) {
  switch (type) {
    case "photo":
      return <CameraHeirloomEmblem className={className} size={size} />
    case "note":
      return <QuillFeatherEmblem className={className} size={size} />
    case "flower":
    case "candle":
    default:
      return <BotanicalFlowerEmblem className={className} size={size} />
  }
}
