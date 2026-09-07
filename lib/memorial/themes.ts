import type { MemorialTheme } from "@/types/theirs"

export type MemorialThemeId = MemorialTheme

export interface MemorialThemeDefinition {
  id: MemorialThemeId
  name: string
  subtitle: string
  feeling: string
  description: string
  isDark: boolean
  colors: {
    bgPage: string
    bgSurface: string
    bgSurfaceSubtle: string
    bgSurfaceElevated: string
    textPrimary: string
    textBody: string
    textMuted: string
    accent: string
    accentHover: string
    accentForeground: string
    accentSubtle: string
    border: string
    borderSubtle: string
    quoteBorder: string
  }
  typography: {
    displayClass: string
    serifClass: string
    fontHeadingName: string
    fontSerifName: string
  }
  hero: {
    frameClass: string
    badgeBgClass: string
  }
  divider: {
    mark: "dash" | "sunburst" | "botanical" | "diamond" | "star" | "horizon"
    symbol: string
  }
}

export const MEMORIAL_THEMES: Record<MemorialThemeId, MemorialThemeDefinition> = {
  quiet: {
    id: "quiet",
    name: "Quiet",
    subtitle: "Calm & Minimal",
    feeling: "Clean, minimal, modern editorial design. Default.",
    description: "Our signature calm aesthetic. Pure museum-white canvas, crisp ink typography, and understated cobalt accents.",
    isDark: false,
    colors: {
      bgPage: "#ffffff",
      bgSurface: "#f7f7f8",
      bgSurfaceSubtle: "#efeff1",
      bgSurfaceElevated: "rgba(247, 247, 248, 0.95)",
      textPrimary: "#181925",
      textBody: "#3a3a40",
      textMuted: "#71717a",
      accent: "#305dde",
      accentHover: "#2548b8",
      accentForeground: "#ffffff",
      accentSubtle: "rgba(48, 93, 222, 0.08)",
      border: "rgba(0, 0, 0, 0.06)",
      borderSubtle: "rgba(0, 0, 0, 0.04)",
      quoteBorder: "rgba(48, 93, 222, 0.4)",
    },
    typography: {
      displayClass: "font-medium tracking-tight",
      serifClass: "font-serif italic",
      fontHeadingName: "Modern Grotesque",
      fontSerifName: "Editorial Serif",
    },
    hero: {
      frameClass: "border-black/[0.08] bg-white",
      badgeBgClass: "bg-[#f7f7f8] text-[#666] border-black/[0.06]",
    },
    divider: {
      mark: "dash",
      symbol: "\u2014",
    },
  },

  warm: {
    id: "warm",
    name: "Warm",
    subtitle: "Ivory & Warm Neutrals",
    feeling: "Ivory, warm neutrals, softer photography treatment.",
    description: "Tones of unbleached linen, roasted espresso ink, and glowing terracotta amber that feels like a sunlit room.",
    isDark: false,
    colors: {
      bgPage: "#fcf9f5",
      bgSurface: "#f5eee4",
      bgSurfaceSubtle: "#ede2d3",
      bgSurfaceElevated: "rgba(245, 238, 228, 0.95)",
      textPrimary: "#2c231d",
      textBody: "#4d3f34",
      textMuted: "#887566",
      accent: "#b85d2a",
      accentHover: "#9c4d20",
      accentForeground: "#ffffff",
      accentSubtle: "rgba(184, 93, 42, 0.10)",
      border: "rgba(110, 80, 50, 0.08)",
      borderSubtle: "rgba(110, 80, 50, 0.05)",
      quoteBorder: "rgba(184, 93, 42, 0.4)",
    },
    typography: {
      displayClass: "font-serif font-medium tracking-tight",
      serifClass: "font-serif italic",
      fontHeadingName: "Literary Serif",
      fontSerifName: "Warm Serif",
    },
    hero: {
      frameClass: "border-[#b85d2a]/20 bg-[#fffdfa] shadow-[0_4px_24px_rgba(184,93,42,0.06)]",
      badgeBgClass: "bg-[#f5ede2] text-[#6e5845] border-[#b85d2a]/15",
    },
    divider: {
      mark: "sunburst",
      symbol: "\u2600",
    },
  },

  garden: {
    id: "garden",
    name: "Garden",
    subtitle: "Sage & Botanical",
    feeling: "Sage/cream with extremely restrained botanical detail.",
    description: "Gentle morning mist, woodland moss, and deep rosemary laurel accents inspired by quiet heritage gardens.",
    isDark: false,
    colors: {
      bgPage: "#f3f6f2",
      bgSurface: "#eaf0e8",
      bgSurfaceSubtle: "#dfe8dc",
      bgSurfaceElevated: "rgba(234, 240, 232, 0.95)",
      textPrimary: "#1b281e",
      textBody: "#344538",
      textMuted: "#6b8070",
      accent: "#3d6c4a",
      accentHover: "#30563b",
      accentForeground: "#ffffff",
      accentSubtle: "rgba(61, 108, 74, 0.10)",
      border: "rgba(40, 70, 48, 0.08)",
      borderSubtle: "rgba(40, 70, 48, 0.05)",
      quoteBorder: "rgba(61, 108, 74, 0.4)",
    },
    typography: {
      displayClass: "font-serif font-medium tracking-tight",
      serifClass: "font-serif italic",
      fontHeadingName: "Botanical Serif",
      fontSerifName: "Organic Serif",
    },
    hero: {
      frameClass: "border-[#3d6c4a]/20 bg-[#fafcf9] shadow-[0_4px_24px_rgba(61,108,74,0.06)]",
      badgeBgClass: "bg-[#e8efe6] text-[#425a47] border-[#3d6c4a]/15",
    },
    divider: {
      mark: "botanical",
      symbol: "\u2740",
    },
  },

  classic: {
    id: "classic",
    name: "Classic",
    subtitle: "Stone & Heritage Serif",
    feeling: "Traditional serif, stone/parchment tones, subtle borders.",
    description: "Fine library vellum, Oxford charcoal ink, and deep antique wine accents crafted with stately Roman proportions.",
    isDark: false,
    colors: {
      bgPage: "#f7f5f0",
      bgSurface: "#efeae0",
      bgSurfaceSubtle: "#e2dacf",
      bgSurfaceElevated: "rgba(239, 234, 224, 0.95)",
      textPrimary: "#1a1a1d",
      textBody: "#39383f",
      textMuted: "#75736d",
      accent: "#6e2836",
      accentHover: "#571f2a",
      accentForeground: "#ffffff",
      accentSubtle: "rgba(110, 40, 54, 0.10)",
      border: "rgba(60, 50, 40, 0.09)",
      borderSubtle: "rgba(60, 50, 40, 0.05)",
      quoteBorder: "rgba(110, 40, 54, 0.4)",
    },
    typography: {
      displayClass: "font-serif font-semibold tracking-normal",
      serifClass: "font-serif italic",
      fontHeadingName: "Heritage Roman",
      fontSerifName: "Classic Garamond",
    },
    hero: {
      frameClass: "border-[#6e2836]/25 bg-[#faf8f4] shadow-[0_4px_20px_rgba(0,0,0,0.04)]",
      badgeBgClass: "bg-[#ece6db] text-[#544d44] border-[#6e2836]/15",
    },
    divider: {
      mark: "diamond",
      symbol: "\u2726",
    },
  },

  dusk: {
    id: "dusk",
    name: "Dusk",
    subtitle: "Midnight Slate & Gold",
    feeling: "Deep charcoal/navy, elegant light typography.",
    description: "Deep starlight charcoal slate, elevated night surfaces, and luminous celestial gold inspired by quiet evening vigils.",
    isDark: true,
    colors: {
      bgPage: "#0f1218",
      bgSurface: "#181c24",
      bgSurfaceSubtle: "#222734",
      bgSurfaceElevated: "rgba(24, 28, 36, 0.95)",
      textPrimary: "#f0f3f8",
      textBody: "#b3bccb",
      textMuted: "#6e7889",
      accent: "#d4af37",
      accentHover: "#b89528",
      accentForeground: "#0f1218",
      accentSubtle: "rgba(212, 175, 55, 0.14)",
      border: "rgba(255, 255, 255, 0.08)",
      borderSubtle: "rgba(255, 255, 255, 0.05)",
      quoteBorder: "rgba(212, 175, 55, 0.5)",
    },
    typography: {
      displayClass: "font-serif font-light tracking-wide",
      serifClass: "font-serif italic",
      fontHeadingName: "Ethereal Serif",
      fontSerifName: "Starlight Serif",
    },
    hero: {
      frameClass: "border-[#d4af37]/30 bg-[#161a24] shadow-[0_0_35px_rgba(212,175,55,0.12)]",
      badgeBgClass: "bg-[#1f2430] text-[#c2cad8] border-white/10",
    },
    divider: {
      mark: "star",
      symbol: "\u2727",
    },
  },

  light: {
    id: "light",
    name: "Light",
    subtitle: "Airy Whites & Morning Sky",
    feeling: "Airy whites, pale sky/stone tones, gentle and optimistic.",
    description: "Radiant morning cloud white, gentle cerulean breezes, and feather-light translucency that feels open and peaceful.",
    isDark: false,
    colors: {
      bgPage: "#f8fafd",
      bgSurface: "#eef3f8",
      bgSurfaceSubtle: "#e0ebf5",
      bgSurfaceElevated: "rgba(238, 243, 248, 0.95)",
      textPrimary: "#1b222c",
      textBody: "#404a58",
      textMuted: "#758396",
      accent: "#2c78b8",
      accentHover: "#226196",
      accentForeground: "#ffffff",
      accentSubtle: "rgba(44, 120, 184, 0.09)",
      border: "rgba(30, 60, 90, 0.08)",
      borderSubtle: "rgba(30, 60, 90, 0.04)",
      quoteBorder: "rgba(44, 120, 184, 0.4)",
    },
    typography: {
      displayClass: "font-sans font-medium tracking-tight",
      serifClass: "font-serif italic",
      fontHeadingName: "Airy Humanist",
      fontSerifName: "Morning Serif",
    },
    hero: {
      frameClass: "border-[#2c78b8]/20 bg-white shadow-[0_4px_28px_rgba(44,120,184,0.08)]",
      badgeBgClass: "bg-[#eaf1f9] text-[#415e79] border-[#2c78b8]/15",
    },
    divider: {
      mark: "horizon",
      symbol: "?",
    },
  },
}

export const MEMORIAL_THEMES_LIST: MemorialThemeDefinition[] = Object.values(MEMORIAL_THEMES)

export const DEFAULT_MEMORIAL_THEME: MemorialThemeId = "quiet"

export function isValidThemeId(value: unknown): value is MemorialThemeId {
  return typeof value === "string" && value in MEMORIAL_THEMES
}

export function getMemorialTheme(themeId?: string | null): MemorialThemeDefinition {
  if (themeId && isValidThemeId(themeId)) {
    return MEMORIAL_THEMES[themeId]
  }
  return MEMORIAL_THEMES[DEFAULT_MEMORIAL_THEME]
}
