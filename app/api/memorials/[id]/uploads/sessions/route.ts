import crypto from "crypto"
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { getSupabaseAdminSafe } from "@/utils/supabase/admin"
import {
  isStorageQuotaError,
  releaseMemorialStorage,
  reserveUploadSessionStorage,
} from "@/lib/storage-quota"
import { isUploadSessionSchemaError } from "@/lib/uploads/schema-errors"
import { checkDurableRateLimit } from "@/lib/turnstile"
import { TEXT_LIMITS } from "@/lib/validation/text-limits"
import type { UploadPurpose } from "@/lib/uploads/capabilities"
import { detectMediaType } from "@/lib/uploads/constants"
import {
  authorizeUploadPurpose,
  createUploadObjectKey,
  extendUploadSession,
  getAuthorizedUploadSession,
  type MediaUploadSession,
  UploadSessionError,
  uploadReservationKey,
  uploadSessionExpiry,
  validateUploadRequest,
} from "@/lib/uploads/upload-session"

interface RouteContext { params: Promise<{ id: string }> }

function sessionResponse(session: MediaUploadSession) {
  return {
    id: session.id,
    memorialId: session.memorial_id,
    purpose: session.purpose,
    mediaType: session.media_type,
    filename: session.original_filename,
    mimeType: session.mime_type,
    fileSize: Number(session.file_size),
    fingerprint: session.file_fingerprint,
    key: session.r2_key,
    uploadId: session.multipart_upload_id,
    uploadMode: session.upload_mode,
    targetAlbum: session.target_album,
    status: session.status,
    resultMediaItemId: session.result_media_item_id,
    resultMemoryId: session.result_memory_id,
    expiresAt: session.expires_at,
  }
}

function errorResponse(error: unknown) {
  if (error instanceof UploadSessionError) {
    return NextResponse.json({ error: error.message, code: error.code }, { status: error.status })
  }
  if (isStorageQuotaError(error)) {
    return NextResponse.json({
      error: "This memorial has reached its 10 GB media limit.",
      code: "storage_quota_reached",
    }, { status: 413 })
  }
  if (isUploadSessionSchemaError(error)) {
    return NextResponse.json({
      error: "The upload database upgrade is not applied yet. Apply migration 23 and try again.",
      code: "upload_schema_outdated",
    }, { status: 503 })
  }
  console.error("Upload session API error:", error)
  return NextResponse.json({ error: "Unable to prepare this upload." }, { status: 500 })
}

export async function POST(req: NextRequest, context: RouteContext) {
  let reservation: { db: ReturnType<typeof getSupabaseAdminSafe>; memorialId: string; key: string } | null = null
  try {
    const { id } = await context.params
    const auth = await createClient()
    const { data: { user } } = await auth.auth.getUser()
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 })
    const db = getSupabaseAdminSafe()
    if (!db) return NextResponse.json({ error: "Media uploads are temporarily unavailable." }, { status: 503 })

    const body = await req.json().catch(() => ({}))
    const purpose = body.purpose as UploadPurpose
    if (!(["studio_gallery", "member_contribution"] as const).includes(purpose)) {
      return NextResponse.json({ error: "Invalid upload purpose." }, { status: 400 })
    }
    const access = await authorizeUploadPurpose(id, user.id, purpose)
    const requestedMediaType = detectMediaType(typeof body.mimeType === "string" ? body.mimeType : "")
    let existingImageCount = 0
    if (requestedMediaType === "image") {
      const imageCountResult = await db.from("media_items").select("id", { count: "exact", head: true })
        .eq("memorial_id", access.memorial.id).eq("media_type", "image")
      if (imageCountResult.error || typeof imageCountResult.count !== "number") {
        throw new UploadSessionError("Media quota is temporarily unavailable.", 503, "quota_unavailable")
      }
      existingImageCount = imageCountResult.count
    }
    const validated = validateUploadRequest({
      access,
      purpose,
      filename: typeof body.filename === "string" ? body.filename : "",
      mimeType: typeof body.mimeType === "string" ? body.mimeType : "",
      fileSize: Number(body.fileSize),
      existingMediaCounts: { image: existingImageCount },
    })
    const clientUploadId = typeof body.clientUploadId === "string" ? body.clientUploadId.trim() : ""
    const fingerprint = typeof body.fingerprint === "string" ? body.fingerprint.trim() : ""
    const targetAlbum = purpose === "studio_gallery" && typeof body.album === "string"
      ? body.album.trim() || null
      : null
    if (targetAlbum && targetAlbum.length > TEXT_LIMITS.albumName) {
      return NextResponse.json({ error: "Album name is too long." }, { status: 400 })
    }
    if (clientUploadId.length < 8 || clientUploadId.length > 200 || fingerprint.length < 8 || fingerprint.length > 500) {
      return NextResponse.json({ error: "Invalid upload identity." }, { status: 400 })
    }

    const existing = await db.from("media_upload_sessions").select("*")
      .eq("memorial_id", access.memorial.id)
      .eq("user_id", user.id)
      .eq("purpose", purpose)
      .eq("file_fingerprint", fingerprint)
      .eq("file_size", Number(body.fileSize))
      .in("status", ["created", "uploading", "uploaded", "verifying", "finalizing"])
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()
    if (existing.error) throw existing.error
    if (existing.data) {
      const authorized = await getAuthorizedUploadSession(db, existing.data.id, user.id, access.memorial.id)
      const expiresAt = await extendUploadSession(db, authorized.session.id)
      return NextResponse.json({
        session: sessionResponse({ ...authorized.session, expires_at: expiresAt }),
        recovered: true,
      })
    }

    const rate = await checkDurableRateLimit(
      "authenticated_media_session", `${user.id}:${access.memorial.id}`, 120, 3600,
    )
    if (!rate.allowed) throw new UploadSessionError("Too many uploads were attempted. Please wait before trying again.", 429, "rate_limited")

    const sessionId = crypto.randomUUID()
    const reservationKey = uploadReservationKey(sessionId)
    const expiresAt = uploadSessionExpiry()
    reservation = { db, memorialId: access.memorial.id, key: reservationKey }
    await reserveUploadSessionStorage(
      db,
      access.memorial.id,
      reservationKey,
      Number(body.fileSize),
      expiresAt,
    )
    const r2Key = createUploadObjectKey(
      access.memorial.id, sessionId, purpose, validated.mediaType, validated.mimeType,
    )
    const insert = await db.from("media_upload_sessions").insert({
      id: sessionId,
      memorial_id: access.memorial.id,
      user_id: user.id,
      purpose,
      media_type: validated.mediaType,
      original_filename: String(body.filename).trim(),
      mime_type: validated.mimeType,
      file_size: Number(body.fileSize),
      client_upload_id: clientUploadId,
      file_fingerprint: fingerprint,
      r2_key: r2Key,
      upload_mode: validated.uploadMode,
      target_album: targetAlbum,
      status: "created",
      reserved_bytes: Number(body.fileSize),
      expires_at: expiresAt,
    }).select("*").single()
    if (insert.error) throw insert.error
    reservation = null

    console.info("[media-upload] upload_session_created", {
      transport: `${validated.uploadMode}_direct`, actor_role: access.role,
      purpose, media_type: validated.mediaType, bytes: Number(body.fileSize),
    })
    return NextResponse.json({ session: sessionResponse(insert.data as MediaUploadSession), recovered: false })
  } catch (error) {
    if (reservation?.db) {
      await releaseMemorialStorage(reservation.db, reservation.memorialId, reservation.key).catch(() => {})
    }
    console.warn("[media-upload] upload_failed", {
      failure_stage: isStorageQuotaError(error)
        ? "quota"
        : error instanceof UploadSessionError && ["pro_required", "membership_revoked", "studio_access_required", "contribution_access_required", "media_type_disabled"].includes(error.code)
          ? "capability"
          : "create",
      http_status: error instanceof UploadSessionError ? error.status : isStorageQuotaError(error) ? 413 : 500,
      error_code: error instanceof UploadSessionError
        ? error.code
        : isStorageQuotaError(error) ? "storage_quota_reached" : "session_create_failed",
    })
    return errorResponse(error)
  }
}

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const auth = await createClient()
    const { data: { user } } = await auth.auth.getUser()
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 })
    const db = getSupabaseAdminSafe()
    if (!db) return NextResponse.json({ error: "Upload recovery is temporarily unavailable." }, { status: 503 })
    const purpose = new URL(req.url).searchParams.get("purpose") as UploadPurpose
    if (!(["studio_gallery", "member_contribution"] as const).includes(purpose)) {
      return NextResponse.json({ error: "Invalid upload purpose." }, { status: 400 })
    }
    const access = await authorizeUploadPurpose(id, user.id, purpose)
    const result = await db.from("media_upload_sessions").select("*")
      .eq("memorial_id", access.memorial.id).eq("user_id", user.id).eq("purpose", purpose)
      .in("status", ["created", "uploading", "uploaded", "verifying", "finalizing"])
      .gt("expires_at", new Date().toISOString()).order("updated_at", { ascending: false }).limit(20)
    if (result.error) throw result.error
    return NextResponse.json({ sessions: (result.data || []).map((row) => sessionResponse(row as MediaUploadSession)) })
  } catch (error) {
    return errorResponse(error)
  }
}
