import { getCloudflareContext } from "@opennextjs/cloudflare"

type SupportedImageFormat = "image/jpeg" | "image/png" | "image/webp"

interface TransformImageOptions {
  width?: number
  height?: number
  format: SupportedImageFormat
  quality?: number
}

/**
 * Resize image bytes with Cloudflare's Images binding.
 *
 * Native Node.js addons such as Sharp cannot run inside Cloudflare Workers.
 * The binding accepts the same private bytes already fetched from R2, so no
 * public source URL or additional copy of the original is required.
 */
export async function transformImage(
  input: Uint8Array,
  options: TransformImageOptions,
) {
  const { env } = await getCloudflareContext({ async: true })
  const images = env.IMAGES

  if (!images) {
    throw new Error("Cloudflare Images binding is not configured")
  }

  const bytes = new Uint8Array(input.byteLength)
  bytes.set(input)

  const source = images.input(new Blob([bytes]).stream())
  const transformed = options.width || options.height
    ? source.transform({
        ...(options.width ? { width: options.width } : {}),
        ...(options.height ? { height: options.height } : {}),
        fit: "scale-down",
      })
    : source

  const result = await transformed.output({
      format: options.format,
      ...(options.quality ? { quality: options.quality } : {}),
    })

  const response = result.response()
  if (!response.ok) {
    throw new Error(`Cloudflare image transformation failed (${response.status})`)
  }

  return Buffer.from(await response.arrayBuffer())
}
