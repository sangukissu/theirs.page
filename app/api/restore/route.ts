import { type NextRequest, NextResponse } from "next/server"
import { fal } from "@fal-ai/client"
import { createClient } from "@/utils/supabase/server"
import { getSupabaseAdminSafe } from "@/utils/supabase/admin"
import { getImageDimensions, validateMagicBytes } from "@/lib/safety/moderation"
import { assertMemorialAdmin } from "@/lib/memorial-auth"
import {
  buildRestorationInput,
  getWebhookBaseUrl,
  originalProxyUrl,
  preserveMemorialOriginalForComparison,
  uploadR2ObjectToFal,
  validateMemorialRestoreKey,
} from "@/lib/restore-helpers"

fal.config({
  credentials: process.env.FAL_KEY,
})

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
const MAX_FILE_SIZE = 15 * 1024 * 1024
const MAX_REQUEST_BYTES = 20 * 1024 * 1024

function sanitizeInput(input: any): any {
  if (typeof input === "string") {
    return input.trim().replace(/[<>]/g, "")
  }
  if (typeof input === "number") {
    return Math.max(0, Math.min(input, Number.MAX_SAFE_INTEGER))
  }
  return input
}

function validateFile(file: File): { valid: boolean; error?: string } {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: "Invalid file type. Only JPEG, PNG, and WebP images are allowed.",
    }
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: "File too large. Maximum size is 15MB.",
    }
  }

  if (file.name.length > 255) {
    return {
      valid: false,
      error: "File name too long.",
    }
  }

  return { valid: true }
}

export async function POST(request: NextRequest) {
  try {
    const declaredLength = Number(request.headers.get("content-length") || 0)
    if (declaredLength > MAX_REQUEST_BYTES) {
      return NextResponse.json({ error: "The uploaded photograph is too large." }, { status: 413 })
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    if (!process.env.FAL_KEY) {
      return NextResponse.json({ error: "Fal AI API key not configured" }, { status: 500 })
    }

    const contentTypeHeader = request.headers.get("content-type") || ""
    let uploadedFile: string
    let outputFormat = "png"
    let seed: string | undefined
    let preserveOriginalColors = false
    let originalImageKey: string | null = null
    let memorialId: string | undefined
    let inputKey: string | undefined
    let filename = "original.png"

    if (contentTypeHeader.includes("application/json")) {
      const body = await request.json().catch(() => ({}))
      memorialId = typeof body?.memorial_id === "string" ? body.memorial_id : typeof body?.memorialId === "string" ? body.memorialId : undefined
      inputKey = typeof body?.key === "string" ? body.key : undefined
      const bodyOutputFormat = typeof body?.output_format === "string" ? body.output_format : undefined
      const bodySeed = typeof body?.seed === "string" ? body.seed : undefined
      preserveOriginalColors = body?.preserveOriginalColors === true || body?.preserve_original_colors === true
      filename = typeof body?.filename === "string" ? body.filename : inputKey?.split("/").pop() || "original.png"

      if (!memorialId) {
        return NextResponse.json({ error: "Memorial ID is required" }, { status: 400 })
      }
      if (!inputKey) {
        return NextResponse.json({ error: "No image key provided" }, { status: 400 })
      }
      if (!validateMemorialRestoreKey(inputKey, memorialId, user.id)) {
        return NextResponse.json({ error: "Invalid image key" }, { status: 400 })
      }
      if (bodyOutputFormat) {
        if (!["jpeg", "jpg", "png", "webp"].includes(bodyOutputFormat)) {
          return NextResponse.json({ error: "Invalid output format" }, { status: 400 })
        }
        outputFormat = bodyOutputFormat
      }
      if (bodySeed) seed = bodySeed
    } else if (contentTypeHeader.includes("multipart/form-data")) {
      const formData = await request.formData()
      memorialId = (formData.get("memorial_id") as string) || (formData.get("memorialId") as string) || undefined
      const file = formData.get("image") as File
      seed = (formData.get("seed") as string) || undefined
      const requestedOutput = formData.get("output_format")
      if (
        requestedOutput !== null &&
        (typeof requestedOutput !== "string" || !["jpeg", "jpg", "png", "webp"].includes(requestedOutput))
      ) {
        return NextResponse.json({ error: "Invalid output format" }, { status: 400 })
      }
      outputFormat = typeof requestedOutput === "string" ? requestedOutput : "png"
      preserveOriginalColors = formData.get("preserve_original_colors") === "true" || formData.get("preserveOriginalColors") === "true"

      if (!memorialId) {
        return NextResponse.json({ error: "Memorial ID is required" }, { status: 400 })
      }
      if (!file) {
        return NextResponse.json({ error: "No image file provided" }, { status: 400 })
      }

      filename = file.name || "original.png"
      const fileValidation = validateFile(file)
      if (!fileValidation.valid) {
        return NextResponse.json({ error: fileValidation.error }, { status: 400 })
      }

      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const validation = validateMagicBytes(buffer, file.name, file.type)
      const claimedMime = file.type === "image/jpg" ? "image/jpeg" : file.type
      const dimensions = validation.valid
        ? getImageDimensions(buffer, validation.detectedMime)
        : null
      if (
        !validation.valid ||
        !["image/jpeg", "image/png", "image/webp"].includes(validation.detectedMime) ||
        validation.detectedMime !== claimedMime ||
        !dimensions ||
        dimensions.width < 1 ||
        dimensions.height < 1 ||
        dimensions.width > 12000 ||
        dimensions.height > 12000 ||
        dimensions.width * dimensions.height > 40_000_000
      ) {
        return NextResponse.json(
          { error: "The uploaded bytes are not a valid supported photograph." },
          { status: 400 }
        )
      }
      const blob = new Blob([buffer], { type: validation.detectedMime })
      uploadedFile = await fal.storage.upload(blob)
    } else {
      return NextResponse.json(
        { error: "Unsupported request format. Send JSON with an image key or multipart/form-data." },
        { status: 415 }
      )
    }

    // 1. Authorization check: user must be caretaker or editor for this memorial
    const authCheck = await assertMemorialAdmin(memorialId, user.id)
    if (!authCheck.authorized || !authCheck.memorial) {
      return authCheck.errorResponse || NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // 2. Paywall check: Memorial must be Complete
    if (!authCheck.memorial.is_paid) {
      return NextResponse.json(
        { error: "Photo restoration is included with Theirs Complete." },
        { status: 402 }
      )
    }

    // 3. Atomically reserve slot and create restoration record with serialized lock
    const db = getSupabaseAdminSafe() || supabase
    const { data: restorationId, error: reserveError } = await db.rpc("reserve_memorial_restoration", {
      p_memorial_id: memorialId,
      p_user_id: user.id,
    })

    if (reserveError || !restorationId) {
      const msg = reserveError?.message || "All 5 photo restorations included with Theirs Complete have been used."
      const status = reserveError?.code === "P0001" ? 402 : reserveError?.code === "P0003" ? 403 : 400
      return NextResponse.json({ error: msg }, { status })
    }

    // 4. Preserve original image file under memorial restoration namespace
    if (inputKey) {
      try {
        originalImageKey = await preserveMemorialOriginalForComparison(inputKey, memorialId, restorationId, filename)
        uploadedFile = await uploadR2ObjectToFal(inputKey)
      } catch (fetchErr) {
        await db.from("image_restorations").update({
          status: "failed",
          error_message: fetchErr instanceof Error ? fetchErr.message : "Failed to read uploaded image",
          updated_at: new Date().toISOString(),
        }).eq("id", restorationId)

        return NextResponse.json(
          { error: fetchErr instanceof Error ? fetchErr.message : "Failed to read uploaded image" },
          { status: 400 }
        )
      }
    }

    const sanitizedSeed = seed ? sanitizeInput(Number.parseInt(seed)) : undefined
    const input = buildRestorationInput(uploadedFile!, {
      outputFormat,
      seed: typeof sanitizedSeed === "number" && !isNaN(sanitizedSeed) ? sanitizedSeed : undefined,
      preserveOriginalColors,
    })

    // 5. Submit to Fal Queue
    try {
      const queueResult = await fal.queue.submit("fal-ai/nano-banana-2/edit", {
        input,
        webhookUrl: `${getWebhookBaseUrl(request)}/api/fal/webhook?generationId=${restorationId}&type=restoration`,
      })

      const requestId = queueResult.request_id
      await db
        .from("image_restorations")
        .update({
          fal_request_id: requestId,
          original_image_url: originalImageKey,
          updated_at: new Date().toISOString(),
        })
        .eq("id", restorationId)

      return NextResponse.json({
        success: true,
        restorationId,
        requestId,
        status: "processing",
        originalImageUrl: originalImageKey ? originalProxyUrl(originalImageKey) : undefined,
        message: "Image restoration started.",
      })
    } catch (falError) {
      const rawMessage = falError instanceof Error ? falError.message : "Restoration service error"
      await db.from("image_restorations").update({
        status: "failed",
        error_message: rawMessage,
        original_image_url: originalImageKey,
        updated_at: new Date().toISOString(),
      }).eq("id", restorationId)

      if (rawMessage.includes("rate limit") || rawMessage.includes("429")) {
        return NextResponse.json({ error: "Restoration service is busy. Please wait a moment." }, { status: 429 })
      }
      return NextResponse.json({ error: "Restoration service is temporarily unavailable. Please try again." }, { status: 503 })
    }
  } catch (error) {
    console.error("[restore POST error]", error)
    return NextResponse.json({ error: "Failed to restore image. Please try again." }, { status: 500 })
  }
}

export async function GET() {
  const hasKey = !!process.env.FAL_KEY
  const keyPreview = hasKey ? `${process.env.FAL_KEY?.substring(0, 8)}...` : "Not set"

  return NextResponse.json({
    status: "healthy",
    service: "Theirs Restoration API",
    timestamp: new Date().toISOString(),
    falConfigured: hasKey,
    keyPreview,
    environment: process.env.NODE_ENV || "development",
  })
}
