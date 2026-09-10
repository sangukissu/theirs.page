import type { MemorialCoverSettings } from "@/types/theirs"

export interface DemoCoverPreset {
  id: string
  name: string
  kind: "pattern" | "image"
  settings: MemorialCoverSettings
}

export const DEMO_COVER_PRESETS: DemoCoverPreset[] = [
  {
    id: "heritage_lines",
    name: "Heritage Lines",
    kind: "pattern",
    settings: {
      type: "pattern",
      pattern_style: "heritage_lines",
    },
  },
  {
    id: "sanctuary_arch",
    name: "Sanctuary Arch",
    kind: "pattern",
    settings: {
      type: "pattern",
      pattern_style: "sanctuary_arch",
    },
  },
  {
    id: "dither",
    name: "Dither",
    kind: "pattern",
    settings: {
      type: "pattern",
      pattern_style: "dither",
    },
  },
  {
    id: "soft_aura",
    name: "Soft Aura",
    kind: "pattern",
    settings: {
      type: "pattern",
      pattern_style: "soft_aura",
    },
  },
  {
    id: "misty_coast",
    name: "Misty Coastline",
    kind: "image",
    settings: {
      type: "their_world",
      cover_url:
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80",
      focal_x: 50,
      focal_y: 35,
    },
  },
  {
    id: "highland_mist",
    name: "Highland Heather",
    kind: "image",
    settings: {
      type: "their_world",
      cover_url:
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80",
      focal_x: 50,
      focal_y: 40,
    },
  },
  {
    id: "still_waters",
    name: "Still Waters",
    kind: "image",
    settings: {
      type: "their_world",
      cover_url: "/theirs/still-waters.webp",
      focal_x: 50,
      focal_y: 45,
    },
  },
  {
    id: "wood_workshop",
    name: "Artisan Workshop",
    kind: "image",
    settings: {
      type: "their_world",
      cover_url: "/theirs/wooden-work.webp",
      focal_x: 50,
      focal_y: 35,
    },
  },
]

export function getRandomCoverPreset(currentId?: string): DemoCoverPreset {
  const pool = DEMO_COVER_PRESETS.filter((p) => p.id !== currentId)
  return pool[Math.floor(Math.random() * pool.length)] || DEMO_COVER_PRESETS[0]
}
