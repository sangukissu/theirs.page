import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { getR2PresignedUploadUrl } from "@/lib/r2"

const ALLOWED_CONTENT_TYPES = [
  // Images
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/gif",
  "image/avif",
  // Audio
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/m4a",
  "audio/x-m4a",
  "audio/mp4",
  "audio/aac",
  "audio/ogg",
  "audio/webm",
  // Video
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-matroska",
  "video/ogg",
]

const ALLOWED_FOLDERS = [
  "memorials",
  "gallery",
  "portraits",
  "voice",
  "family-portraits",
  "restorations",
  "add-person",
  "remove-person",
  "temp",
]

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate the user
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // 2. Parse request body
    const body = await req.json()
    const { filename, contentType, folder, memorialId } = body

    if (!filename || !contentType) {
      return NextResponse.json({ error: "filename and contentType are required" }, { status: 400 })
    }

    if (!ALLOWED_CONTENT_TYPES.includes(contentType)) {
      return NextResponse.json(
        { error: `Unsupported file type (${contentType}). Supported: images, audio, and video.` },
        { status: 400 }
      )
    }

    // 3. Generate a clean storage key
    const safeFolder = typeof folder === "string" && ALLOWED_FOLDERS.includes(folder)
      ? folder
      : "gallery"
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(2, 10)
    const cleanFilename = filename.replace(/[^a-zA-Z0-9.-]/g, "_")
    
    // Key format: memorials/{memorialId}/{folder}/{timestamp}_{randomId}_{filename}
    const key = memorialId
      ? `memorials/${memorialId}/${safeFolder}/${timestamp}_${randomId}_${cleanFilename}`
      : `uploads/${user.id}/${safeFolder}/${timestamp}_${randomId}_${cleanFilename}`

    // 4. Generate presigned upload URL (valid for 15 minutes)
    const uploadUrl = await getR2PresignedUploadUrl(key, contentType, 900)

    return NextResponse.json({
      success: true,
      uploadUrl,
      key,
    })
  } catch (error: any) {
    console.error("Presigned URL generation error:", error)
    return NextResponse.json({ error: error?.message || "Internal Server Error" }, { status: 500 })
  }
}
