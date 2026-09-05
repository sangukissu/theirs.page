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
 * Serene Candle Flame Linocut Emblem
 * A reverent, peaceful flame and wax candle offering.
 */
export function CandleFlameEmblem({ className = "", size = 44 }: EmblemProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Candle lit"
    >
      {/* Radiating Light Aura Marks */}
      <path d="M32 6V9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.6" />
      <path d="M21 12L23.5 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.5" />
      <path d="M43 12L40.5 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.5" />
      <path d="M16 20H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.5" />
      <path d="M48 20H45" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.5" />

      {/* Flame Teardrop */}
      <path
        d="M32 11C28 17 26.5 22 28 25C29.5 28 34.5 28 36 25C37.5 22 36 17 32 11Z"
        fill="currentColor"
        fillOpacity="0.85"
      />
      {/* Inner Flame Core */}
      <path
        d="M32 16C30.5 19 30 22 31 24C31.8 25.5 33.2 25.5 33.8 24C34.5 22 34 19 32 16Z"
        fill="currentColor"
        fillOpacity="0.4"
      />

      {/* Candle Wick */}
      <path d="M32 25V28" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />

      {/* Candle Top Rim & Wax Melt */}
      <path
        d="M23 29C23 27.5 27 27 32 27C37 27 41 27.5 41 29C41 30.5 37 31 32 31C27 31 23 30.5 23 29Z"
        fill="currentColor"
        fillOpacity="0.75"
      />

      {/* Candle Pillar Body */}
      <path
        d="M23 29V49C23 50.5 27 51 32 51C37 51 41 50.5 41 49V29C39.5 30 36 30.5 32 30.5C28 30.5 24.5 30 23 29Z"
        fill="currentColor"
        fillOpacity="0.65"
      />

      {/* Subtle Linocut Wax Drip Accent */}
      <path
        d="M26 31V37C26 38.5 28 38.5 28 37V31"
        fill="currentColor"
        fillOpacity="0.8"
      />

      {/* Saucer / Pedestal Dish */}
      <path
        d="M17 50C17 48.5 23 48 32 48C41 48 47 48.5 47 50C47 53 41 55 32 55C23 55 17 53 17 50Z"
        fill="currentColor"
        fillOpacity="0.75"
      />
      <path
        d="M20 52C23 54.5 27.5 56 32 56C36.5 56 41 54.5 44 52"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeOpacity="0.5"
      />
    </svg>
  )
}

/**
 * Detailed keepsake emblems for real memorial tributes. Their muted pigments are
 * intentionally independent from the site's interactive blue.
 */
export function VintageBotanicalEmblem({ className = "", size = 44 }: EmblemProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="Flower offering">
      <path d="M35.8 60.5c.7-12.7 1.5-23.5 4.5-34.4" stroke="#515751" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M37.5 44.8c-7.3-5.3-13.5-3.4-16.9 2.7 6.6 2.9 12.7 1.7 16.9-2.7Z" fill="#74786f" />
      <path d="M38.8 38.4c7.5-4.8 13.2-2.3 15.8 4-6.5 2.3-12 .7-15.8-4Z" fill="#656c63" />
      <path d="M22 47.3c5.7-.1 10.5-1 14.4-2.8M40.2 38.9c4.7.4 9 .9 13.1 3" stroke="#444a45" strokeWidth="1" strokeLinecap="round" opacity=".72" />
      <path d="M39.8 27.6c-5.2-4.6-6.9-10-3.4-13.1 3.1-2.8 6.4.3 6.1 5.2 1.4-5.4 5.6-7.4 8.4-4.2 2.7 3.1-.1 7.1-5.3 8.4 5 .2 7.9 3.5 5.7 6.7-2.4 3.4-7.4 1.7-10-2.7-.9 4.5-4.8 6.9-7.8 4.2-2.7-2.5-.4-5.8 3.4-7.1-4.6-.2-7.5-3.5-5.2-6.6 2.3-3.1 6.5-1 8.1 3.3" fill="#7d7773" />
      <circle cx="41.2" cy="24.4" r="4.3" fill="#535653" />
      <circle cx="39.8" cy="23" r=".8" fill="#a19a8e" /><circle cx="42.8" cy="23.4" r=".8" fill="#a19a8e" /><circle cx="41.4" cy="26" r=".8" fill="#a19a8e" />
      <path d="M30.9 60.5h10.4" stroke="#3f4441" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}

export function VintageCandleEmblem({ className = "", size = 44 }: EmblemProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="Candle lit">
      <path d="M36 9.5c-5.2 6.9-7.2 12.6-4.2 17.2 2.1 3.2 7 3.3 9.3.1 3.2-4.4.4-10.4-5.1-17.3Z" fill="#9a714d" />
      <path d="M36.3 16.5c-2.2 3.3-2.8 6.2-1.1 8.2 1 1.2 2.7 1.1 3.6-.3 1.3-2.2.1-4.9-2.5-7.9Z" fill="#d5b07a" />
      <path d="M36 27.4v5.2" stroke="#464845" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M23.5 34c0-2.2 5.6-3.9 12.5-3.9S48.5 31.8 48.5 34v22.2c0 2.2-5.6 4-12.5 4s-12.5-1.8-12.5-4V34Z" fill="#6c6962" />
      <ellipse cx="36" cy="34" rx="12.5" ry="3.9" fill="#858078" />
      <path d="M27.5 34.7v9.1c0 2.1 3 2.1 3 0v-8.4M44.5 34.7v5.6" stroke="#b1a99c" strokeWidth="1.6" strokeLinecap="round" opacity=".75" />
      <path d="M18 57.2c0-2.2 8.1-3.9 18-3.9s18 1.7 18 3.9c0 4.2-8.1 7.1-18 7.1s-18-2.9-18-7.1Z" fill="#50534f" />
      <path d="M23 59c4.4 2.4 8.7 3.1 13 3.1s8.7-.7 13-3.1" stroke="#89877f" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M22.5 18.5 19 15M49.5 18.5 53 15M20.5 28h-5M51.5 28h5M36 6V2.5" stroke="#777971" strokeWidth="1.6" strokeLinecap="round" opacity=".65" />
    </svg>
  )
}

export function VintageQuillEmblem({ className = "", size = 44 }: EmblemProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="Note left">
      <path d="M57.5 10.5C44 13.4 28.4 23.6 21.2 43.8c-1.5 4.3-1.7 8.8-1.5 13 4.5-1.4 8.8-3.8 12.2-7.1 15.4-15 22-29.6 25.6-39.2Z" fill="#616561" />
      <path d="M54 13.8c-11.6 9-21.5 20.4-29.7 34.3M42.7 23l-1.9 11.1 9.1-4.4M34.4 31.6l-2.1 11.6 9.5-4.4M27.2 40l-1.9 10.5 7.9-3.4" stroke="#a4a19a" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M54 13.8c-8 1.9-13.4 4.2-17.4 7.1l6.1 2.1M21.5 55.4c-2.9 2.8-5 5.4-6.3 8" stroke="#454946" strokeWidth="2" strokeLinecap="round" />
      <path d="M14.5 64h27" stroke="#70736e" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}

/**
 * Universal Tribute Emblem Dispatcher
 */
export function TributeEmblem({
  type = "flower",
  className = "text-primary",
  size = 46,
  variant = "classic",
}: {
  type?: TributeType
  className?: string
  size?: number
  variant?: "classic" | "vintage"
}) {
  if (variant === "vintage") {
    if (type === "candle") return <VintageCandleEmblem className={className} size={size} />
    if (type === "note") return <VintageQuillEmblem className={className} size={size} />
    if (type === "photo") return <CameraHeirloomEmblem className="text-[#595d5a]" size={size} />
    return <VintageBotanicalEmblem className={className} size={size} />
  }
  switch (type) {
    case "candle":
      return <CandleFlameEmblem className={className} size={size} />
    case "photo":
      return <CameraHeirloomEmblem className={className} size={size} />
    case "note":
      return <QuillFeatherEmblem className={className} size={size} />
    case "flower":
    default:
      return <BotanicalFlowerEmblem className={className} size={size} />
  }
}
