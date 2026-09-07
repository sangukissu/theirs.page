import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { getSupabaseAdminSafe } from "@/utils/supabase/admin"
import { getR2PresignedPartUrl, getR2PresignedUploadUrl } from "@/lib/r2"
import { extendUploadSession, getAuthorizedUploadSession, UploadSessionError } from "@/lib/uploads/upload-session"
import { canStartOrSignMultipart } from "@/lib/uploads/session-lifecycle"

interface RouteContext { params: Promise<{ id: string; sessionId: string }> }

async function assertSessionStillSignable(
  db: NonNullable<ReturnType<typeof getSupabaseAdminSafe>>,
  sessionId: string,
  expectedUploadId?: string | null,
) {
  const { data, error } = await db.from("media_upload_sessions")
    .select("status, multipart_upload_id")
    .eq("id", sessionId)
    .maybeSingle()
  if (error) throw error
  if (!data || !canStartOrSignMultipart(data.status)) {
    throw new UploadSessionError(
      "The upload has already completed; continue with verification.",
      409,
      "upload_already_completed",
    )
  }
  if (expectedUploadId && data.multipart_upload_id !== expectedUploadId) {
    throw new UploadSessionError("Multipart upload mismatch.", 403, "multipart_mismatch")
  }
}

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const { id, sessionId } = await context.params
    const auth = await createClient()
    const { data: { user } } = await auth.auth.getUser()
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 })
    const db = getSupabaseAdminSafe()
    if (!db) return NextResponse.json({ error: "Upload signing is temporarily unavailable." }, { status: 503 })
    const { session } = await getAuthorizedUploadSession(db, sessionId, user.id, id)
    const body = await req.json().catch(() => ({}))
    if (body.key !== session.r2_key) throw new UploadSessionError("Upload key mismatch.", 403, "key_mismatch")

    const method = String(body.method || "").toUpperCase()
    const uploadId = typeof body.uploadId === "string" ? body.uploadId : null
    if (method === "PUT" && uploadId) {
      if (!canStartOrSignMultipart(session.status)) {
        throw new UploadSessionError(
          "The upload has already completed; continue with verification.",
          409,
          "upload_already_completed",
        )
      }
      await extendUploadSession(db, session.id)
      await assertSessionStillSignable(db, session.id, uploadId)
      if (session.upload_mode !== "multipart" || !session.multipart_upload_id || uploadId !== session.multipart_upload_id) {
        throw new UploadSessionError("Multipart upload mismatch.", 403, "multipart_mismatch")
      }
      const partNumber = Number(body.partNumber)
      return NextResponse.json({ url: await getR2PresignedPartUrl(session.r2_key, uploadId, partNumber, 900) })
    }
    if (method === "PUT" && !uploadId) {
      if (!canStartOrSignMultipart(session.status)) {
        throw new UploadSessionError(
          "The upload has already completed; continue with verification.",
          409,
          "upload_already_completed",
        )
      }
      await extendUploadSession(db, session.id)
      await assertSessionStillSignable(db, session.id)
      if (session.upload_mode !== "single") throw new UploadSessionError("Multipart upload required.", 409, "multipart_required")
      return NextResponse.json({
        url: await getR2PresignedUploadUrl(session.r2_key, session.mime_type, 900, session.file_size),
      })
    }

    let operation: "create" | "list" | "complete" | "abort" | null = null
    if (method === "POST" && !uploadId) operation = "create"
    else if (method === "GET" && uploadId) operation = "list"
    else if (method === "POST" && uploadId) operation = "complete"
    else if (method === "DELETE") operation = "abort"
    if (!operation) throw new UploadSessionError("Unsupported upload operation.", 400, "invalid_operation")
    if (operation === "create" && !canStartOrSignMultipart(session.status)) {
      throw new UploadSessionError(
        "The upload has already completed; continue with verification.",
        409,
        "upload_already_completed",
      )
    }
    const origin = new URL(req.url).origin
    return NextResponse.json({
      url: `${origin}/api/memorials/${encodeURIComponent(id)}/uploads/sessions/${encodeURIComponent(sessionId)}/control?operation=${operation}`,
    })
  } catch (error) {
    if (error instanceof UploadSessionError) {
      console.warn("[media-upload] upload_failed", {
        failure_stage: "sign",
        http_status: error.status,
        error_code: error.code,
      })
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.status })
    }
    console.error("Upload signing error:", error)
    return NextResponse.json({ error: "Unable to authorize this upload operation." }, { status: 500 })
  }
}
