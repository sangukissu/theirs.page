import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseAdminSafe } from "@/utils/supabase/admin"
import { uploadImageToR2 } from "@/lib/r2"
import { normalizeToPng } from "@/lib/watermark"
import { logError } from "@/lib/error-handling"
import { verifyFalWebhook } from "@/lib/fal-webhook"

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const MAX_WEBHOOK_BYTES = 1024 * 1024
const MAX_RESULT_IMAGE_BYTES = 25 * 1024 * 1024

interface FalWebhookBody {
  requestId: string
  status: "OK" | "ERROR"
  payload: Record<string, unknown> | null
  error?: string
  payloadError?: string
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function shortMessage(value: unknown): string | undefined {
  if (typeof value === "string") return value.slice(0, 500)
  if (isRecord(value) && typeof value.message === "string") {
    return value.message.slice(0, 500)
  }
  return undefined
}

function parseWebhookBody(value: unknown): FalWebhookBody | null {
  if (!isRecord(value)) return null
  if (typeof value.request_id !== "string" || value.request_id.length > 200) return null
  if (value.status !== "OK" && value.status !== "ERROR") return null
  if (value.payload !== null && value.payload !== undefined && !isRecord(value.payload)) return null
  return {
    requestId: value.request_id,
    status: value.status,
    payload: isRecord(value.payload) ? value.payload : null,
    error: shortMessage(value.error),
    payloadError: shortMessage(value.payload_error),
  }
}

function getRestorationImageUrl(payload: Record<string, unknown> | null): string | null {
  if (
    Array.isArray(payload?.images) &&
    isRecord(payload.images[0]) &&
    typeof payload.images[0].url === "string"
  ) return payload.images[0].url
  if (isRecord(payload?.image) && typeof payload.image.url === "string") {
    return payload.image.url
  }
  return null
}

function isAllowedResultHost(hostname: string): boolean {
  const host = hostname.toLowerCase()
  const configured = (process.env.FAL_MEDIA_ALLOWED_HOSTS || "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean)
  return host === "fal.media" || host.endsWith(".fal.media") || configured.includes(host)
}

async function downloadFalImage(imageUrl: string): Promise<Buffer> {
  const parsed = new URL(imageUrl)
  if (parsed.protocol !== "https:" || !isAllowedResultHost(parsed.hostname)) {
    throw new Error("FAL returned an untrusted result URL")
  }
  const response = await fetch(parsed, {
    redirect: "error",
    signal: AbortSignal.timeout(20_000),
  })
  if (!response.ok) throw new Error(`Failed to download FAL result (${response.status})`)
  const declaredLength = Number(response.headers.get("content-length") || 0)
  if (declaredLength > MAX_RESULT_IMAGE_BYTES) throw new Error("FAL result image is too large")
  const result = Buffer.from(await response.arrayBuffer())
  if (result.length < 1 || result.length > MAX_RESULT_IMAGE_BYTES) {
    throw new Error("FAL result image is empty or too large")
  }
  return result
}

export async function POST(request: NextRequest) {
  const generationId = request.nextUrl.searchParams.get("generationId")
  const type = request.nextUrl.searchParams.get("type")
  if (!generationId || !UUID_REGEX.test(generationId) || type !== "restoration") {
    return NextResponse.json({ error: "Invalid restoration callback." }, { status: 400 })
  }
  if (Number(request.headers.get("content-length") || 0) > MAX_WEBHOOK_BYTES) {
    return NextResponse.json({ error: "Webhook payload is too large." }, { status: 413 })
  }

  try {
    const rawBody = Buffer.from(await request.arrayBuffer())
    if (rawBody.length < 1 || rawBody.length > MAX_WEBHOOK_BYTES) {
      return NextResponse.json({ error: "Invalid webhook payload." }, { status: 400 })
    }
    const signature = await verifyFalWebhook(request, rawBody)
    if (!signature.valid) {
      return NextResponse.json({ error: "Invalid webhook signature." }, { status: 401 })
    }

    const webhook = parseWebhookBody(JSON.parse(rawBody.toString("utf8")))
    if (!webhook || webhook.requestId !== signature.requestId) {
      return NextResponse.json({ error: "Invalid webhook payload." }, { status: 400 })
    }

    const supabase = getSupabaseAdminSafe()
    if (!supabase) {
      return NextResponse.json({ error: "Database service unavailable." }, { status: 503 })
    }
    const { data: restoration, error: fetchError } = await supabase
      .from("image_restorations")
      .select("id, user_id, status, restored_image_url, fal_request_id")
      .eq("id", generationId)
      .single()

    if (fetchError || !restoration) {
      return NextResponse.json({ error: "Restoration not found." }, { status: 404 })
    }
    if (!restoration.fal_request_id || restoration.fal_request_id !== webhook.requestId) {
      return NextResponse.json({ error: "Callback does not match this restoration." }, { status: 409 })
    }
    if (restoration.status === "completed" || restoration.restored_image_url) {
      return NextResponse.json({ success: true, message: "Already completed" })
    }
    if (restoration.status !== "processing") {
      return NextResponse.json({ success: true, message: "Restoration already finalized" })
    }

    if (webhook.payloadError || webhook.status === "ERROR") {
      const { error } = await supabase.rpc("fail_restoration_and_refund", {
        p_restoration_id: restoration.id,
        p_error_message: webhook.payloadError || webhook.error || "Image restoration failed at FAL",
      })
      if (error) throw error
      return NextResponse.json({ success: true, message: "Restoration failed and credits refunded" })
    }

    const restoredImageUrl = getRestorationImageUrl(webhook.payload)
    if (!restoredImageUrl) {
      const { error } = await supabase.rpc("fail_restoration_and_refund", {
        p_restoration_id: restoration.id,
        p_error_message: "Restoration payload did not contain an image URL",
      })
      if (error) throw error
      return NextResponse.json({ success: true, message: "Restoration failed and credits refunded" })
    }

    const imageBuffer = await downloadFalImage(restoredImageUrl)
    const pngBuffer = await normalizeToPng(imageBuffer)
    const r2Key = await uploadImageToR2(
      pngBuffer,
      `restored-${restoration.id}.png`,
      restoration.user_id,
      "image/png"
    )
    const { error: updateError } = await supabase
      .from("image_restorations")
      .update({
        status: "completed",
        restored_image_url: r2Key,
        updated_at: new Date().toISOString(),
      })
      .eq("id", restoration.id)
      .eq("fal_request_id", webhook.requestId)
    if (updateError) throw updateError

    return NextResponse.json({ success: true })
  } catch (error) {
    logError(error instanceof Error ? error : new Error(String(error)), {
      context: "FAL restoration webhook handler",
      generationId,
    })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
