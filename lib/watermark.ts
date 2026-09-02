import { getCloudflareContext } from "@opennextjs/cloudflare"
import { transformImage } from "@/lib/cloudflare-images"

function escapeXml(text: string) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

function buildTiledWatermarkSvg(width: number, height: number, text: string) {
  const fontSize = Math.max(20, Math.round(Math.min(width, height) * 0.06))
  const opacity = 0.18
  const rotate = -18

  const safeText = escapeXml(text)
  const approxCharWidth = 0.62
  const approxTextWidth = Math.round(fontSize * safeText.length * approxCharWidth)
  const padX = Math.round(fontSize * 2.2)
  const padY = Math.round(fontSize * 1.6)
  const density = 1.9
  const stepX = Math.round(Math.max(260, approxTextWidth + padX * 2) * density)
  const stepY = Math.round(Math.max(190, fontSize + padY * 2) * density)
  const cx = Math.round(stepX / 2)
  const cy = Math.round(stepY / 2)
  const strokeWidth = Math.max(1, Math.round(fontSize * 0.09))

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
  <defs>
    <pattern id="wm" patternUnits="userSpaceOnUse" width="${stepX}" height="${stepY}">
      <g transform="translate(${cx} ${cy}) rotate(${rotate}) translate(${-cx} ${-cy})">
        <text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="middle"
          fill="white" fill-opacity="${opacity}"
          stroke="black" stroke-opacity="0.22" stroke-width="${strokeWidth}" paint-order="stroke"
          font-family="Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial"
          font-size="${fontSize}" font-weight="800">
          ${safeText}
        </text>
      </g>
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#wm)" />
</svg>`
}

function buildCornerBadgeSvg(targetWidth: number, targetHeight: number, text: string) {
  const safeText = escapeXml(text)
  const fontSize = Math.max(14, Math.round(Math.min(targetWidth, targetHeight) * 0.032))
  const approxCharWidth = 0.62
  const approxTextWidth = Math.round(fontSize * safeText.length * approxCharWidth)
  const paddingX = Math.round(fontSize * 0.9)
  const paddingY = Math.round(fontSize * 0.55)
  const w = Math.max(120, approxTextWidth + paddingX * 2)
  const h = Math.max(44, Math.round(fontSize * 1.45 + paddingY * 2))
  const rx = Math.round(h * 0.28)
  const cx = Math.round(w / 2)
  const cy = Math.round(h / 2)
  const strokeWidth = Math.max(1, Math.round(fontSize * 0.08))

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
  <rect x="0" y="0" width="${w}" height="${h}" rx="${rx}" ry="${rx}" fill="black" fill-opacity="0.38" />
  <text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="middle"
    fill="white" fill-opacity="0.92"
    stroke="black" stroke-opacity="0.25" stroke-width="${strokeWidth}" paint-order="stroke"
    font-family="Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial"
    font-size="${fontSize}" font-weight="800">
    ${safeText}
  </text>
</svg>`

  return { svg, width: w, height: h }
}

function imageStream(input: Uint8Array | string) {
  if (typeof input === "string") {
    return new Blob([input], { type: "image/svg+xml" }).stream()
  }

  const bytes = new Uint8Array(input.byteLength)
  bytes.set(input)
  return new Blob([bytes]).stream()
}

export async function watermarkBringBack(input: Buffer, text = "BringBack.ai") {
  const { env } = await getCloudflareContext({ async: true })
  const images = env.IMAGES

  if (!images) {
    throw new Error("Cloudflare Images binding is not configured")
  }

  const meta = await images.info(imageStream(input))
  const width = "width" in meta && typeof meta.width === "number" ? meta.width : 1200
  const height = "height" in meta && typeof meta.height === "number" ? meta.height : 1200

  const tiled = buildTiledWatermarkSvg(width, height, text)
  const badge = buildCornerBadgeSvg(width, height, text)
  const margin = Math.max(12, Math.round(Math.min(width, height) * 0.03))
  const left = Math.max(0, width - badge.width - margin)
  const top = Math.max(0, height - badge.height - margin)

  const result = await images
    .input(imageStream(input))
    .draw(images.input(imageStream(tiled)), { left: 0, top: 0 })
    .draw(images.input(imageStream(badge.svg)), { left, top })
    .output({ format: "image/png" })

  const response = result.response()
  if (!response.ok) {
    throw new Error(`Cloudflare watermark transformation failed (${response.status})`)
  }

  return Buffer.from(await response.arrayBuffer())
}

export async function normalizeToPng(input: Buffer) {
  return transformImage(input, { format: "image/png" })
}
