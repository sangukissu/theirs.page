import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { putR2Object } from "@/lib/r2"

const R2_PUBLIC_ENDPOINT =
  process.env.R2_MEDIA_ENDPOINT || "https://pub-3511ae96b3594eecbde1632d4cca06b6.r2.dev"

function detectMediaType(filename: string, mime: string): "image" | "audio" | "video" {
  const lower = filename.toLowerCase()
  if (
    mime.startsWith("video/") ||
    lower.endsWith(".mp4") ||
    lower.endsWith(".webm") ||
    lower.endsWith(".mov") ||
    lower.endsWith(".mkv") ||
    lower.endsWith(".ogv")
  ) {
    return "video"
  }

  if (
    mime.startsWith("audio/") ||
    lower.endsWith(".mp3") ||
    lower.endsWith(".wav") ||
    lower.endsWith(".m4a") ||
    lower.endsWith(".aac") ||
    lower.endsWith(".ogg") ||
    lower.endsWith(".oga") ||
    lower.endsWith(".opus") ||
    lower.endsWith(".flac")
  ) {
    return "audio"
  }

  return "image"
}

function resolveContentType(filename: string, mime: string): string {
  if (mime && mime !== "application/octet-stream") return mime
  const lower = filename.toLowerCase()
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg"
  if (lower.endsWith(".png")) return "image/png"
  if (lower.endsWith(".webp")) return "image/webp"
  if (lower.endsWith(".gif")) return "image/gif"
  if (lower.endsWith(".mp3")) return "audio/mpeg"
  if (lower.endsWith(".wav")) return "audio/wav"
  if (lower.endsWith(".m4a")) return "audio/m4a"
  if (lower.endsWith(".ogg") || lower.endsWith(".oga")) return "audio/ogg"
  if (lower.endsWith(".mp4")) return "video/mp4"
  if (lower.endsWith(".webm")) return "video/webm"
  if (lower.endsWith(".mov")) return "video/quicktime"
  return "application/octet-stream"
}

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate user
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // 2. Extract file and metadata from FormData
    const formData = await req.formData()
    const file = formData.get("file") as File | null
    const folder = (formData.get("folder") as string) || "gallery"
    const memorialId = formData.get("memorialId") as string | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const mediaType = detectMediaType(file.name, file.type)
    const contentType = resolveContentType(file.name, file.type)

    // 3. Read file into buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // 4. Generate clean storage key
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(2, 9)
    const cleanFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, "_")
    const safeFolder = folder.replace(/[^a-zA-Z0-9_-]/g, "")

    const key = memorialId
      ? `memorials/${memorialId}/${safeFolder}/${timestamp}_${randomId}_${cleanFilename}`
      : `uploads/${user.id}/${safeFolder}/${timestamp}_${randomId}_${cleanFilename}`

    // 5. Upload directly to Cloudflare R2 (server-side, zero CORS issues)
    await putR2Object(key, buffer, contentType, "public, max-age=31536000, immutable")

    const publicUrl = `${R2_PUBLIC_ENDPOINT.replace(/\/$/, "")}/${key}`

    return NextResponse.json({
      success: true,
      key,
      publicUrl,
      mediaType,
      filename: file.name,
      contentType,
      size: file.size,
    })
  } catch (err: any) {
    console.error("Server upload error:", err)
    return NextResponse.json(
      { error: err?.message || "Failed to upload file to storage" },
      { status: 500 }
    )
  }
}
