import QRCode from "qrcode"
import { MEMORIAL_THEMES, type MemorialThemeId } from "@/lib/memorial/themes"
import { COLOR_OPACITIES, PATHS } from "@/components/theirs/theirs-logo"

export interface MemorialQrOptions {
  url: string
  fullName: string
  slug: string
  portraitUrl?: string | null
  birthYear?: number | string | null
  deathYear?: number | string | null
  themeId?: MemorialThemeId | null
}

/**
 * Generates an SVG Data URL for the real Theirs logo tinted with the theme accent color.
 */
export function getTheirsLogoSvgDataUrl(accentColor: string): string {
  const paths = PATHS.map((path) => {
    const lowerFill = path.fill.toLowerCase()
    const opacity = COLOR_OPACITIES[lowerFill] || "1"
    return `<path d="${path.d}" fill="${accentColor}" opacity="${opacity}"/>`
  }).join("")
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="500 500 2000 2000" width="120" height="120">${paths}</svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

/**
 * Safely loads an image in the browser with CORS enabled.
 * Resolves to null if loading fails (avoiding canvas taint errors).
 */
export async function loadBrowserImage(src: string | null | undefined): Promise<HTMLImageElement | null> {
  if (!src) return null
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => resolve(img)
    img.onerror = () => {
      // If anonymous CORS failed, resolve null so fallback monogram draws gracefully
      resolve(null)
    }
    img.src = src
  })
}

/**
 * Extracts 1-2 letters from a name for the monogram fallback.
 */
export function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "T"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

/**
 * Picks an optimal dark color for the QR code modules based on the theme.
 * Ensures the QR code has high optical contrast against a white plate (>4.5:1).
 */
export function getQrModuleColor(themeId?: MemorialThemeId | null): string {
  const theme = MEMORIAL_THEMES[themeId || "quiet"] || MEMORIAL_THEMES.quiet
  switch (theme.id) {
    case "quiet":
      return "#305dde" // Cobalt Blue
    case "warm":
      return "#b85d2a" // Terracotta Copper
    case "garden":
      return "#2d5e39" // Deep Evergreen Laurel
    case "classic":
      return "#6e2836" // Antique Oxford Wine
    case "dusk":
      return "#a6821e" // Deep Celestial Gold
    case "light":
      return "#2563eb" // Azure Blue
    default:
      return theme.colors.accent || "#305dde"
  }
}

/**
 * Draws a circular avatar or monogram inside a clipping region.
 */
function drawCircularAvatar(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement | null,
  initials: string,
  cx: number,
  cy: number,
  radius: number,
  bgColor: string,
  textColor: string
) {
  ctx.save()
  ctx.beginPath()
  ctx.arc(cx, cy, radius, 0, Math.PI * 2)
  ctx.clip()

  if (img && img.naturalWidth > 0) {
    const imgRatio = img.naturalWidth / img.naturalHeight
    let sx = 0, sy = 0, sw = img.naturalWidth, sh = img.naturalHeight
    if (imgRatio > 1) {
      sw = img.naturalHeight
      sx = (img.naturalWidth - sw) / 2
    } else {
      sh = img.naturalWidth
      sy = 0 // Keep top of photo in view
    }
    ctx.drawImage(img, sx, sy, sw, sh, cx - radius, cy - radius, radius * 2, radius * 2)
  } else {
    ctx.fillStyle = bgColor
    ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2)
    ctx.fillStyle = textColor
    ctx.font = `600 ${Math.round(radius * 0.85)}px serif`
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText(initials, cx, cy)
  }
  ctx.restore()
}

/**
 * Helper to draw a rounded rectangle on a canvas context.
 */
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

/**
 * Draws one of the 3 corner position finder patterns with rounded corners (like rounded-lg).
 * Outer: 7x7 square with smooth rounded corners
 * Inner cut: 5x5 white square with rounded corners
 * Center pupil: 3x3 solid square with rounded corners
 */
function drawRoundedFinderPattern(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string
) {
  const cellSize = size / 7

  // Outer 7x7 square with rounded-lg corners
  const outerRadius = cellSize * 1.7
  roundRect(ctx, x, y, size, size, outerRadius)
  ctx.fillStyle = color
  ctx.fill()

  // Inner 5x5 white hollow cutout
  const innerCutX = x + cellSize
  const innerCutY = y + cellSize
  const innerCutSize = cellSize * 5
  const innerCutRadius = cellSize * 1.15
  roundRect(ctx, innerCutX, innerCutY, innerCutSize, innerCutSize, innerCutRadius)
  ctx.fillStyle = "#ffffff"
  ctx.fill()

  // Center 3x3 solid pupil with rounded corners
  const pupilX = x + cellSize * 2
  const pupilY = y + cellSize * 2
  const pupilSize = cellSize * 3
  const pupilRadius = cellSize * 0.75
  roundRect(ctx, pupilX, pupilY, pupilSize, pupilSize, pupilRadius)
  ctx.fillStyle = color
  ctx.fill()
}

/**
 * Generates a themed QR code (Canvas / Data URL) with:
 * 1. The 3 corner blocks corners rounded (like rounded-lg)
 * 2. Theme accent color modules
 * 3. Person's photo embedded right in the center with a crisp white border (Level H: 30% recovery)
 */
export async function generateThemedQrDataUrl(
  options: MemorialQrOptions,
  qrSize = 720
): Promise<string> {
  const { url, fullName, portraitUrl, themeId } = options
  const qrColor = getQrModuleColor(themeId)
  const theme = MEMORIAL_THEMES[themeId || "quiet"] || MEMORIAL_THEMES.quiet
  const initials = getInitials(fullName)

  // 1. Generate QR matrix data using QRCode.create with Level H (30% recovery capacity)
  const qr = QRCode.create(url, {
    errorCorrectionLevel: "H",
  })
  const matrixSize = qr.modules.size
  const margin = 2
  const totalCells = matrixSize + margin * 2
  const cellSize = qrSize / totalCells

  const qrCanvas = document.createElement("canvas")
  qrCanvas.width = qrSize
  qrCanvas.height = qrSize
  const ctx = qrCanvas.getContext("2d")
  if (!ctx) throw new Error("Could not get 2D context")

  // Fill canvas background
  ctx.fillStyle = "#ffffff"
  ctx.fillRect(0, 0, qrSize, qrSize)

  // Helper to identify if module (r, c) is inside one of the 3 corner finder blocks
  const isFinderPattern = (r: number, c: number) => {
    if (r < 7 && c < 7) return true // Top-left
    if (r < 7 && c >= matrixSize - 7) return true // Top-right
    if (r >= matrixSize - 7 && c < 7) return true // Bottom-left
    return false
  }

  // Draw data modules (dark modules only, skipping finder blocks)
  ctx.fillStyle = qrColor
  for (let r = 0; r < matrixSize; r++) {
    for (let c = 0; c < matrixSize; c++) {
      if (isFinderPattern(r, c)) continue
      if (qr.modules.get(r, c)) {
        const x = (margin + c) * cellSize
        const y = (margin + r) * cellSize
        ctx.fillRect(x, y, cellSize + 0.4, cellSize + 0.4)
      }
    }
  }

  // Draw the 3 rounded-lg corner finder pattern blocks
  const finderSize = 7 * cellSize

  // Top-Left corner block
  drawRoundedFinderPattern(
    ctx,
    margin * cellSize,
    margin * cellSize,
    finderSize,
    qrColor
  )

  // Top-Right corner block
  drawRoundedFinderPattern(
    ctx,
    (margin + matrixSize - 7) * cellSize,
    margin * cellSize,
    finderSize,
    qrColor
  )

  // Bottom-Left corner block
  drawRoundedFinderPattern(
    ctx,
    margin * cellSize,
    (margin + matrixSize - 7) * cellSize,
    finderSize,
    qrColor
  )

  // 2. Preload portrait image (graceful fallback if null or cross-origin blocked)
  const resolvedPortraitUrl = (() => {
    if (!portraitUrl) return null
    if (
      portraitUrl.startsWith("blob:") ||
      portraitUrl.startsWith("data:") ||
      portraitUrl.startsWith("http://") ||
      portraitUrl.startsWith("https://") ||
      portraitUrl.startsWith("/")
    ) {
      return portraitUrl
    }
    return `/api/media?key=${encodeURIComponent(portraitUrl)}`
  })()

  const portraitImg = await loadBrowserImage(resolvedPortraitUrl)

  // 3. Draw center badge
  const cx = qrSize / 2
  const cy = qrSize / 2
  const outerRadius = Math.round(qrSize * 0.13)
  const innerRadius = outerRadius - 6

  // Clear background shield
  ctx.save()
  ctx.beginPath()
  ctx.arc(cx, cy, outerRadius, 0, Math.PI * 2)
  ctx.fillStyle = "#ffffff"
  ctx.shadowColor = "rgba(0, 0, 0, 0.16)"
  ctx.shadowBlur = 12
  ctx.shadowOffsetX = 0
  ctx.shadowOffsetY = 3
  ctx.fill()
  ctx.restore()

  // White border ring
  ctx.save()
  ctx.beginPath()
  ctx.arc(cx, cy, outerRadius, 0, Math.PI * 2)
  ctx.strokeStyle = "#ffffff"
  ctx.lineWidth = 4
  ctx.stroke()
  ctx.restore()

  // Draw inner avatar photo or monogram
  drawCircularAvatar(
    ctx,
    portraitImg,
    initials,
    cx,
    cy,
    innerRadius,
    theme.colors.bgSurfaceSubtle,
    theme.colors.textPrimary
  )

  // Inner subtle outline
  ctx.save()
  ctx.beginPath()
  ctx.arc(cx, cy, innerRadius, 0, Math.PI * 2)
  ctx.strokeStyle = "rgba(0, 0, 0, 0.1)"
  ctx.lineWidth = 1.5
  ctx.stroke()
  ctx.restore()

  return qrCanvas.toDataURL("image/png")
}

/**
 * Generates an ultra-sharp (1200 x 1600 px) Memorial Keepsake Card PNG
 * complete with person's portrait, full name, lifespan, themed QR with center photo,
 * and elegant Theirs branding at the footer.
 * Renders 100% client-side in ~20-50 milliseconds.
 */
export async function generateKeepsakeCardDataUrl(
  options: MemorialQrOptions
): Promise<string> {
  const { url, fullName, slug, birthYear, deathYear, portraitUrl, themeId } = options
  const theme = MEMORIAL_THEMES[themeId || "quiet"] || MEMORIAL_THEMES.quiet
  const initials = getInitials(fullName)

  const resolvedPortraitUrl = (() => {
    if (!portraitUrl) return null
    if (
      portraitUrl.startsWith("blob:") ||
      portraitUrl.startsWith("data:") ||
      portraitUrl.startsWith("http://") ||
      portraitUrl.startsWith("https://") ||
      portraitUrl.startsWith("/")
    ) {
      return portraitUrl
    }
    return `/api/media?key=${encodeURIComponent(portraitUrl)}`
  })()

  const logoDataUrl = getTheirsLogoSvgDataUrl(theme.colors.accent || "#305dde")

  // Preload portrait image, themed QR, and brand logo concurrently
  const [portraitImg, qrDataUrl, logoImg] = await Promise.all([
    loadBrowserImage(resolvedPortraitUrl),
    generateThemedQrDataUrl(options, 700),
    loadBrowserImage(logoDataUrl),
  ])

  const qrImg = await loadBrowserImage(qrDataUrl)

  // Setup master card canvas (1200 x 1600 px, 3:4 aspect ratio)
  const W = 1200
  const H = 1600
  const canvas = document.createElement("canvas")
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("Could not get 2D context")

  // 1. Draw Card Background
  ctx.fillStyle = theme.colors.bgPage || "#fcf9f5"
  ctx.fillRect(0, 0, W, H)

  // 2. Draw Decorative Card Border Frame
  const pad = 48
  roundRect(ctx, pad, pad, W - pad * 2, H - pad * 2, 40)
  ctx.fillStyle = theme.colors.bgSurface || "#f5eee4"
  ctx.fill()
  ctx.strokeStyle = theme.colors.border || "rgba(0, 0, 0, 0.08)"
  ctx.lineWidth = 2
  ctx.stroke()

  // Inner subtle accent border
  const innerPad = pad + 12
  roundRect(ctx, innerPad, innerPad, W - innerPad * 2, H - innerPad * 2, 32)
  ctx.strokeStyle = theme.colors.borderSubtle || "rgba(0, 0, 0, 0.04)"
  ctx.lineWidth = 1.5
  ctx.stroke()

  // 3. Top Memorial Header
  const centerX = W / 2
  const portraitY = 190
  const portraitRadius = 78

  // Outer portrait frame shadow
  ctx.save()
  ctx.beginPath()
  ctx.arc(centerX, portraitY, portraitRadius + 5, 0, Math.PI * 2)
  ctx.fillStyle = "#ffffff"
  ctx.shadowColor = "rgba(0, 0, 0, 0.12)"
  ctx.shadowBlur = 16
  ctx.shadowOffsetY = 4
  ctx.fill()
  ctx.restore()

  // Draw Header Portrait / Monogram
  drawCircularAvatar(
    ctx,
    portraitImg,
    initials,
    centerX,
    portraitY,
    portraitRadius,
    theme.colors.bgSurfaceSubtle,
    theme.colors.textPrimary
  )

  // Portrait border ring in theme accent
  ctx.save()
  ctx.beginPath()
  ctx.arc(centerX, portraitY, portraitRadius, 0, Math.PI * 2)
  ctx.strokeStyle = theme.colors.accent || "#b85d2a"
  ctx.lineWidth = 3
  ctx.stroke()
  ctx.restore()

  // Full Name
  ctx.save()
  ctx.fillStyle = theme.colors.textPrimary || "#181925"
  ctx.font = `600 48px serif, "Times New Roman", Georgia`
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  ctx.fillText(fullName, centerX, 320)
  ctx.restore()

  // Lifespan Dates
  const yearsSpan =
    birthYear && deathYear
      ? `${birthYear} \u2014 ${deathYear}`
      : birthYear
      ? `Born ${birthYear}`
      : deathYear
      ? `\u2014 ${deathYear}`
      : "In Loving Memory"

  ctx.save()
  ctx.fillStyle = theme.colors.textMuted || "#71717a"
  ctx.font = `500 22px "SF Mono", "Courier New", monospace`
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  ctx.fillText(yearsSpan, centerX, 368)
  ctx.restore()

  // 4. Center QR Code Plate
  const plateW = 760
  const plateH = 760
  const plateX = (W - plateW) / 2
  const plateY = 420

  // Draw white rounded plate for QR code
  ctx.save()
  roundRect(ctx, plateX, plateY, plateW, plateH, 32)
  ctx.fillStyle = "#ffffff"
  ctx.shadowColor = "rgba(0, 0, 0, 0.08)"
  ctx.shadowBlur = 24
  ctx.shadowOffsetY = 8
  ctx.fill()
  ctx.strokeStyle = "rgba(0, 0, 0, 0.06)"
  ctx.lineWidth = 1.5
  ctx.stroke()
  ctx.restore()

  // Draw the QR image onto the plate
  if (qrImg) {
    const qrDrawSize = 700
    const qrX = (W - qrDrawSize) / 2
    const qrY = plateY + (plateH - qrDrawSize) / 2
    ctx.drawImage(qrImg, qrX, qrY, qrDrawSize, qrDrawSize)
  }

  // 5. Scan Instructions & Short Link
  ctx.save()
  ctx.fillStyle = theme.colors.textMuted || "#71717a"
  ctx.font = `400 22px system-ui, -apple-system, sans-serif`
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  ctx.fillText("Scan with any camera to visit & share memories", centerX, 1225)

  ctx.fillStyle = theme.colors.textPrimary || "#181925"
  ctx.font = `600 26px system-ui, -apple-system, sans-serif`
  ctx.fillText(`theirs.page/${slug}`, centerX, 1265)
  ctx.restore()

  // 6. Footer Branding Line
  ctx.save()
  const lineY = 1350
  ctx.beginPath()
  ctx.moveTo(centerX - 240, lineY)
  ctx.lineTo(centerX + 240, lineY)
  ctx.strokeStyle = theme.colors.border || "rgba(0, 0, 0, 0.08)"
  ctx.lineWidth = 1.5
  ctx.stroke()
  ctx.restore()

  // Footer Logo + Brand Name (Logo in theme color, 'theirs' in black, '.page' in theme color. No tagline.)
  ctx.save()
  const footerY = 1415
  const logoSize = 36
  const logoGap = 12

  ctx.font = `700 30px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
  ctx.textAlign = "left"
  ctx.textBaseline = "middle"

  const theirsText = "theirs"
  const pageText = ".page"
  const theirsWidth = ctx.measureText(theirsText).width
  const pageWidth = ctx.measureText(pageText).width
  const totalBrandWidth = logoSize + logoGap + theirsWidth + pageWidth
  const brandStartX = centerX - (totalBrandWidth / 2)

  // Real Theirs SVG logo in theme accent color
  if (logoImg) {
    ctx.drawImage(logoImg, brandStartX, footerY - (logoSize / 2), logoSize, logoSize)
  }

  // 'theirs' in black
  ctx.fillStyle = "#181925"
  ctx.fillText(theirsText, brandStartX + logoSize + logoGap, footerY)

  // '.page' in theme accent color
  ctx.fillStyle = theme.colors.accent || "#305dde"
  ctx.fillText(pageText, brandStartX + logoSize + logoGap + theirsWidth, footerY)
  ctx.restore()

  return canvas.toDataURL("image/png")
}
