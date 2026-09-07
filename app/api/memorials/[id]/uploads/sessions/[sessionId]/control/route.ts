import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { getSupabaseAdminSafe } from "@/utils/supabase/admin"
import {
  abortR2MultipartUpload,
  completeR2MultipartUpload,
  deleteR2Object,
  listR2MultipartParts,
} from "@/lib/r2"
import { releaseMemorialStorage } from "@/lib/storage-quota"
import { escapeS3Xml, s3XmlResponse } from "@/lib/uploads/s3-control-response"
import {
  ensureMultipartUpload,
  getAuthorizedUploadSession,
  UploadSessionError,
  uploadReservationKey,
  verifyUploadedSessionObject,
} from "@/lib/uploads/upload-session"

interface RouteContext { params: Promise<{ id: string; sessionId: string }> }

function completedResultXml(key: string) {
  return s3XmlResponse(
    `<CompleteMultipartUploadResult><Location>/api/media?key=${encodeURIComponent(key)}</Location><Key>${escapeS3Xml(key)}</Key></CompleteMultipartUploadResult>`,
  )
}

async function reconcileCompletedObject(
  db: NonNullable<ReturnType<typeof getSupabaseAdminSafe>>,
  session: Awaited<ReturnType<typeof getAuthorizedUploadSession>>["session"],
) {
  try {
    await verifyUploadedSessionObject(db, session)
    return true
  } catch (error) {
    if (error instanceof UploadSessionError && error.code === "upload_not_complete") return false
    throw error
  }
}

async function contextFor(reqContext: RouteContext) {
  const params = await reqContext.params
  const auth = await createClient()
  const { data: { user } } = await auth.auth.getUser()
  if (!user) throw new UploadSessionError("Authentication required.", 401, "unauthorized")
  const db = getSupabaseAdminSafe()
  if (!db) throw new UploadSessionError("Uploads are temporarily unavailable.", 503, "service_unavailable")
  const result = await getAuthorizedUploadSession(db, params.sessionId, user.id, params.id)
  return { ...params, ...result, db }
}

function controlError(error: unknown) {
  const status = error instanceof UploadSessionError ? error.status : 500
  const code = error instanceof UploadSessionError ? error.code : "UploadControlError"
  const message = error instanceof Error ? error.message : "Upload control failed."
  if (status >= 500) console.error("Multipart control error:", error)
  return s3XmlResponse(`<Error><Code>${escapeS3Xml(code)}</Code><Message>${escapeS3Xml(message)}</Message></Error>`, status)
}

export async function POST(req: NextRequest, context: RouteContext) {
  const operation = new URL(req.url).searchParams.get("operation")
  try {
    const current = await contextFor(context)
    if (operation === "create") {
      const uploadId = await ensureMultipartUpload(current.db, current.session)
      return s3XmlResponse(`<InitiateMultipartUploadResult><Key>${escapeS3Xml(current.session.r2_key)}</Key><UploadId>${escapeS3Xml(uploadId)}</UploadId></InitiateMultipartUploadResult>`)
    }
    if (operation !== "complete") throw new UploadSessionError("Invalid multipart operation.", 400, "invalid_operation")
    const refreshed = await getAuthorizedUploadSession(current.db, current.sessionId, current.session.user_id, current.id)
    if (await reconcileCompletedObject(current.db, refreshed.session)) {
      return completedResultXml(refreshed.session.r2_key)
    }
    const uploadId = refreshed.session.multipart_upload_id
    if (!uploadId) throw new UploadSessionError("Multipart upload has not started.", 409, "multipart_not_started")
    const raw = await req.text()
    if (raw.length > 250_000) throw new UploadSessionError("Multipart completion body is too large.", 413, "completion_too_large")
    const parts = Array.from(raw.matchAll(/<Part>\s*<PartNumber>(\d+)<\/PartNumber>\s*<ETag>([^<]+)<\/ETag>\s*<\/Part>/g))
      .map((match) => ({ partNumber: Number(match[1]), etag: match[2].replace(/&quot;/g, '"') }))
    if (parts.length < 1 || parts.some((part) => !Number.isSafeInteger(part.partNumber) || part.partNumber < 1)) {
      throw new UploadSessionError("Invalid multipart completion data.", 400, "invalid_parts")
    }
    const completing = await current.db.from("media_upload_sessions").update({
      status: "verifying",
      error_code: "multipart_completion_started",
    }).eq("id", refreshed.session.id).in("status", ["created", "uploading", "uploaded", "verifying"])
    if (completing.error) throw completing.error

    let result: Awaited<ReturnType<typeof completeR2MultipartUpload>>
    try {
      result = await completeR2MultipartUpload(current.session.r2_key, uploadId, parts)
    } catch (completionError) {
      if (await reconcileCompletedObject(current.db, refreshed.session)) {
        return completedResultXml(refreshed.session.r2_key)
      }
      await current.db.from("media_upload_sessions").update({
        status: "uploading",
        error_code: "multipart_completion_retryable",
      }).eq("id", refreshed.session.id).eq("status", "verifying")
      throw completionError
    }
    await verifyUploadedSessionObject(current.db, refreshed.session)
    return s3XmlResponse(`<CompleteMultipartUploadResult><Location>${escapeS3Xml(result.location)}</Location><Key>${escapeS3Xml(result.key)}</Key>${result.etag ? `<ETag>${escapeS3Xml(result.etag)}</ETag>` : ""}</CompleteMultipartUploadResult>`)
  } catch (error) {
    console.warn("[media-upload] upload_failed", {
      failure_stage: operation === "complete" ? "complete" : "create",
      http_status: error instanceof UploadSessionError ? error.status : 500,
      error_code: error instanceof UploadSessionError ? error.code : "multipart_control_failed",
    })
    return controlError(error)
  }
}

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const current = await contextFor(context)
    if (new URL(req.url).searchParams.get("operation") !== "list") {
      throw new UploadSessionError("Invalid multipart operation.", 400, "invalid_operation")
    }
    if (await reconcileCompletedObject(current.db, current.session)) {
      throw new UploadSessionError(
        "The multipart object is already complete; continue with finalization.",
        409,
        "upload_already_completed",
      )
    }
    if (!current.session.multipart_upload_id) return s3XmlResponse("<ListPartsResult></ListPartsResult>")
    const parts = await listR2MultipartParts(current.session.r2_key, current.session.multipart_upload_id)
    const entries = parts.map((part) => `<Part><PartNumber>${part.partNumber}</PartNumber><ETag>&quot;${escapeS3Xml(part.etag)}&quot;</ETag><Size>${part.size}</Size></Part>`).join("")
    console.info("[media-upload] upload_resumed", { purpose: current.session.purpose, media_type: current.session.media_type, parts: parts.length })
    return s3XmlResponse(`<ListPartsResult>${entries}</ListPartsResult>`)
  } catch (error) {
    return controlError(error)
  }
}

export async function DELETE(_req: NextRequest, context: RouteContext) {
  try {
    const current = await contextFor(context)
    if (current.session.status === "complete") return new Response(null, { status: 204 })
    const cancelled = await current.db.from("media_upload_sessions").update({
      status: "aborted",
      error_code: "cleanup_pending",
      expires_at: new Date().toISOString(),
    }).eq("id", current.session.id)
      .in("status", ["created", "uploading", "uploaded", "verifying"])
      .select("id")
      .maybeSingle()
    if (cancelled.error) throw cancelled.error
    if (!cancelled.data) {
      throw new UploadSessionError("This upload is already being finalized and can no longer be cancelled.", 409, "finalization_in_progress")
    }
    if (current.session.multipart_upload_id) {
      await abortR2MultipartUpload(current.session.r2_key, current.session.multipart_upload_id).catch(() => {})
    }
    await deleteR2Object(current.session.r2_key).catch(() => {})
    await releaseMemorialStorage(current.db, current.session.memorial_id, uploadReservationKey(current.session.id))
    await current.db.from("media_upload_sessions").update({ error_code: null }).eq("id", current.session.id)
    console.info("[media-upload] upload_cancelled", { purpose: current.session.purpose, media_type: current.session.media_type })
    return new Response(null, { status: 204 })
  } catch (error) {
    if (error instanceof UploadSessionError && ["aborted", "expired", "failed"].includes(error.code)) {
      return new Response(null, { status: 204 })
    }
    return controlError(error)
  }
}
