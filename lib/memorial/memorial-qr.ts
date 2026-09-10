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

  // 2. Preload Theirs logo SVG in theme module color
  const logoDataUrl = getTheirsLogoSvgDataUrl(qrColor)
  const logoImg = await loadBrowserImage(logoDataUrl)

  // 3. Draw center badge with Theirs logo
  const cx = qrSize / 2
  const cy = qrSize / 2
  const outerRadius = Math.round(qrSize * 0.125)
  const innerRadius = outerRadius - 4

  // Clear background shield (crisp white circular disc with subtle shadow)
  ctx.save()
  ctx.beginPath()
  ctx.arc(cx, cy, outerRadius, 0, Math.PI * 2)
  ctx.fillStyle = "#ffffff"
  ctx.shadowColor = "rgba(0, 0, 0, 0.14)"
  ctx.shadowBlur = 10
  ctx.shadowOffsetX = 0
  ctx.shadowOffsetY = 2
  ctx.fill()
  ctx.restore()

  // White border ring to isolate cleanly from QR modules
  ctx.save()
  ctx.beginPath()
  ctx.arc(cx, cy, outerRadius, 0, Math.PI * 2)
  ctx.strokeStyle = "#ffffff"
  ctx.lineWidth = 4
  ctx.stroke()
  ctx.restore()

  // Draw Theirs logo in center
  if (logoImg) {
    const logoDrawSize = Math.round(innerRadius * 1.35)
    ctx.drawImage(
      logoImg,
      cx - logoDrawSize / 2,
      cy - logoDrawSize / 2,
      logoDrawSize,
      logoDrawSize
    )
  }

  // Subtle outer outline ring
  ctx.save()
  ctx.beginPath()
  ctx.arc(cx, cy, outerRadius, 0, Math.PI * 2)
  ctx.strokeStyle = "rgba(0, 0, 0, 0.08)"
  ctx.lineWidth = 1.5
  ctx.stroke()
  ctx.restore()

  return qrCanvas.toDataURL("image/png")
}

/**
 * Generates an ultra-sharp (1200 x 1480 px) Memorial Keepsake Card PNG
 * that is an exact 1:1 match of the modal preview card:
 * - Single rounded card with theme bgSurface and border (no double mat frames)
 * - Prominent portrait avatar with theme accent ring and soft shadow
 * - Full name in warm editorial Georgia serif (font-medium)
 * - Lifespan in clean monospace directly below
 * - Crisp white rounded QR plate with center Theirs logo
 * - Two-line caption matching modal phrasing and bold link
 * - Full-width border-t divider line
 * - Themed Theirs logo + theirs.page branding
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

  // Preload portrait image, themed QR (with center Theirs logo), and brand logo concurrently
  const [portraitImg, qrDataUrl, logoImg] = await Promise.all([
    loadBrowserImage(resolvedPortraitUrl),
    generateThemedQrDataUrl(options, 700),
    loadBrowserImage(logoDataUrl),
  ])

  const qrImg = await loadBrowserImage(qrDataUrl)

  // Master card canvas dimensions (1200 x 1480 px, exact proportion of the preview card)
  const W = 1200
  const H = 1480
  const canvas = document.createElement("canvas")
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("Could not get 2D context")

  // 1. Draw Card Background & Single Rounded Border (Matches modal card exactly)
  ctx.clearRect(0, 0, W, H)
  const cardRadius = 44
  ctx.save()
  roundRect(ctx, 2, 2, W - 4, H - 4, cardRadius)
  ctx.fillStyle = theme.colors.bgSurface || "#f5eee4"
  ctx.fill()
  ctx.strokeStyle = theme.colors.border || "rgba(0, 0, 0, 0.08)"
  ctx.lineWidth = 3
  ctx.stroke()
  ctx.restore()

  const centerX = W / 2

  // 2. Person Portrait Header (Large, prominent, matching size-17 / 19% card width)
  const portraitY = 175
  const portraitRadius = 112

  // Outer portrait frame shadow
  ctx.save()
  ctx.beginPath()
  ctx.arc(centerX, portraitY, portraitRadius + 4, 0, Math.PI * 2)
  ctx.fillStyle = "#ffffff"
  ctx.shadowColor = "rgba(0, 0, 0, 0.10)"
  ctx.shadowBlur = 18
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
  ctx.lineWidth = 5
  ctx.stroke()
  ctx.restore()

  // 3. Full Name (Matching font-serif font-medium tracking-tight)
  ctx.save()
  ctx.fillStyle = theme.colors.textPrimary || "#181925"
  ctx.font = `500 60px Georgia, Cambria, "Times New Roman", serif`
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  if ("letterSpacing" in ctx) {
    ;(ctx as unknown as { letterSpacing: string }).letterSpacing = "-0.8px"
  }
  ctx.fillText(fullName, centerX, 344)
  ctx.restore()

  // 4. Lifespan Dates (Matching text-xs font-mono with comfortable gap)
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
  ctx.font = `400 32px "SF Mono", "Geist Mono", Menlo, Consolas, monospace`
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  ctx.fillText(yearsSpan, centerX, 410)
  ctx.restore()

  // 5. Themed QR Code Plate (White rounded plate with soft shadow, matching modal plate)
  const plateW = 740
  const plateH = 740
  const plateX = (W - plateW) / 2
  const plateY = 466

  ctx.save()
  roundRect(ctx, plateX, plateY, plateW, plateH, 36)
  ctx.fillStyle = "#ffffff"
  ctx.shadowColor = "rgba(0, 0, 0, 0.08)"
  ctx.shadowBlur = 24
  ctx.shadowOffsetY = 8
  ctx.fill()
  ctx.strokeStyle = "rgba(0, 0, 0, 0.06)"
  ctx.lineWidth = 2
  ctx.stroke()
  ctx.restore()

  // Draw the QR image onto the plate
  if (qrImg) {
    const qrDrawSize = 660
    const qrX = (W - qrDrawSize) / 2
    const qrY = plateY + (plateH - qrDrawSize) / 2
    ctx.drawImage(qrImg, qrX, qrY, qrDrawSize, qrDrawSize)
  }

  // 6. Scan Instructions & Short Link (2 lines, exact modal phrasing & bold styling)
  ctx.save()
  ctx.fillStyle = theme.colors.textMuted || "#71717a"
  ctx.font = `400 31px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  ctx.fillText("Scan with any phone camera to visit & share", centerX, 1252)

  const line2Muted = "memories at "
  const line2Bold = `theirs.page/${slug}`

  ctx.font = `400 31px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
  const wMuted = ctx.measureText(line2Muted).width

  ctx.font = `600 31px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
  const wBold = ctx.measureText(line2Bold).width

  const startX = centerX - (wMuted + wBold) / 2

  ctx.font = `400 31px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
  ctx.fillStyle = theme.colors.textMuted || "#71717a"
  ctx.textAlign = "left"
  ctx.fillText(line2Muted, startX, 1294)

  ctx.font = `600 31px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
  ctx.fillStyle = theme.colors.textPrimary || "#181925"
  ctx.fillText(line2Bold, startX + wMuted, 1294)
  ctx.restore()

  // 7. Full-width Divider Line (Matches border-t w-full in modal container)
  ctx.save()
  const lineY = 1352
  ctx.beginPath()
  ctx.moveTo(64, lineY)
  ctx.lineTo(W - 64, lineY)
  ctx.strokeStyle = theme.colors.border || "rgba(0, 0, 0, 0.08)"
  ctx.lineWidth = 2
  ctx.stroke()
  ctx.restore()

  // 8. Footer Branding (Matches size-3.5 logo + text-xs font-semibold theirs.page)
  ctx.save()
  const footerY = 1400
  const logoSize = 42
  const logoGap = 16

  ctx.font = `600 36px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
  ctx.textAlign = "left"
  ctx.textBaseline = "middle"

  const theirsText = "theirs"
  const pageText = ".page"
  const theirsWidth = ctx.measureText(theirsText).width
  const pageWidth = ctx.measureText(pageText).width
  const totalBrandWidth = logoSize + logoGap + theirsWidth + pageWidth
  const brandStartX = centerX - (totalBrandWidth / 2)

  if (logoImg) {
    ctx.drawImage(logoImg, brandStartX, footerY - (logoSize / 2), logoSize, logoSize)
  }

  ctx.fillStyle = "#181925"
  ctx.fillText(theirsText, brandStartX + logoSize + logoGap, footerY)

  ctx.fillStyle = theme.colors.accent || "#305dde"
  ctx.fillText(pageText, brandStartX + logoSize + logoGap + theirsWidth, footerY)
  ctx.restore()

  return canvas.toDataURL("image/png")
}
