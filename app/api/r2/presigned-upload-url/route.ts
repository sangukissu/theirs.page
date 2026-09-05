import crypto from "crypto"
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { getR2PresignedUploadUrl } from "@/lib/r2"
import { checkDurableRateLimit } from "@/lib/turnstile"

const ALLOWED_CONTENT_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]

const ALLOWED_FOLDERS = ["restorations"]

const MAX_TRANSIENT_UPLOAD_BYTES = 15 * 1024 * 1024

function extensionForContentType(contentType: string): string {
  if (contentType === "image/png") return "png"
  if (contentType === "image/webp") return "webp"
  return "jpg"
}

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("cf-connecting-ip") ||
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "127.0.0.1"
  )
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const body = await req.json().catch(() => ({}))
    const filename = body.filename
    const contentType = body.contentType
    const folder = body.folder
    const fileSize = Number(body.fileSize ?? body.file_size)

    if (
      typeof filename !== "string" ||
      typeof contentType !== "string" ||
      typeof folder !== "string" ||
      !Number.isSafeInteger(fileSize)
    ) {
      return NextResponse.json(
        { error: "filename, contentType, folder, and fileSize are required" },
        { status: 400 }
      )
    }
    if (!ALLOWED_CONTENT_TYPES.includes(contentType)) {
      return NextResponse.json({ error: "Only supported image files may be uploaded." }, { status: 400 })
    }
    if (!ALLOWED_FOLDERS.includes(folder)) {
      return NextResponse.json({ error: "Invalid transient upload purpose." }, { status: 400 })
    }
    if (fileSize < 1 || fileSize > MAX_TRANSIENT_UPLOAD_BYTES) {
      return NextResponse.json({ error: "Upload must be 15MB or smaller." }, { status: 400 })
    }
    if (body.memorialId) {
      return NextResponse.json(
        { error: "Memorial media must use the validated upload endpoint." },
        { status: 400 }
      )
    }

    const rateLimit = await checkDurableRateLimit(
      "presigned_upload",
      `${user.id}:${getClientIp(req)}`,
      10,
      3600
    )
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many uploads. Please wait before trying again." },
        { status: 429 }
      )
    }

    // This bypass path is restricted to private, short-lived processing input.
    // Public memorial uploads use /api/r2/upload so bytes can be inspected.
    const key = `temp/${folder}/${user.id}/${crypto.randomUUID()}.${extensionForContentType(contentType)}`
    const uploadUrl = await getR2PresignedUploadUrl(key, contentType, 300, fileSize)

    return NextResponse.json({ success: true, uploadUrl, key })
  } catch (error) {
    console.error("Presigned URL generation error:", error)
    return NextResponse.json({ error: "Unable to prepare upload." }, { status: 500 })
  }
}
