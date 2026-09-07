import "server-only"

import crypto from "crypto"
import type { SupabaseClient } from "@supabase/supabase-js"
import { getMemorialAccess, type MemorialAccess } from "@/lib/memorial-auth"
import {
  createR2MultipartUpload,
  deleteR2Object,
  getR2ObjectPrefixBuffer,
  inspectR2Object,
} from "@/lib/r2"
import { validateMagicBytes, type MediaValidationResult } from "@/lib/safety/moderation"
import { releaseMemorialStorage } from "@/lib/storage-quota"
import { isUploadSessionSchemaError } from "./schema-errors"
import type { MediaType } from "@/types/theirs"
import {
  detectMediaType,
  extensionForMime,
  isDetectedMediaMimeCompatible,
  normalizeMediaMime,
  shouldUseMultipart,
  UPLOAD_SESSION_TTL_MS,
} from "./constants"
import {
  isMediaAllowed,
  mediaLimit,
  resolveMediaCapabilities,
  type MediaCountState,
  type UploadPurpose,
} from "./capabilities"

export type UploadSessionStatus =
  | "created" | "uploading" | "uploaded" | "verifying" | "finalizing"
  | "complete" | "failed" | "aborted" | "expired"

export interface MediaUploadSession {
  id: string
  memorial_id: string
  user_id: string
  purpose: UploadPurpose
  media_type: MediaType
  original_filename: string
  mime_type: string
  file_size: number
  client_upload_id: string
  file_fingerprint: string | null
  r2_key: string
  multipart_upload_id: string | null
  upload_mode: "single" | "multipart"
  target_album: string | null
  status: UploadSessionStatus
  reserved_bytes: number
  result_media_item_id: string | null
  result_memory_id: string | null
  error_code: string | null
  created_at: string
  updated_at: string
  expires_at: string
  completed_at: string | null
}

export class UploadSessionError extends Error {
  constructor(
    message: string,
    public status: number,
    public code: string,
  ) {
    super(message)
  }
}

export function uploadReservationKey(sessionId: string): string {
  return `upload-session:${sessionId}`
}

export function uploadSessionExpiry(): string {
  return new Date(Date.now() + UPLOAD_SESSION_TTL_MS).toISOString()
}

export function createUploadObjectKey(
  memorialId: string,
  sessionId: string,
  purpose: UploadPurpose,
  mediaType: MediaType,
  mimeType: string,
): string {
  const extension = extensionForMime(mimeType)
  const objectId = crypto.randomUUID()
  if (purpose === "member_contribution") {
    return `quarantine/${memorialId}/original/${sessionId}-${objectId}.${extension}`
  }
  if (mediaType === "image") {
    return `dashboard-staging/${memorialId}/${sessionId}/${objectId}.${extension}`
  }
  return `memorials/${memorialId}/uploads/${sessionId}/${objectId}.${extension}`
}

export async function authorizeUploadPurpose(
  memorialId: string,
  userId: string,
  purpose: UploadPurpose,
): Promise<MemorialAccess> {
  const access = await getMemorialAccess(memorialId, userId)
  if (!access) {
    throw new UploadSessionError(
      "You no longer have permission to upload to this memorial.",
      403,
      "membership_revoked",
    )
  }
  if (purpose === "studio_gallery" && (!access.canOpenStudio || !access.canEditEditorial)) {
    throw new UploadSessionError("Studio upload access is required.", 403, "studio_access_required")
  }
  if (purpose === "member_contribution" && !access.canContribute) {
    throw new UploadSessionError("Contribution access is required.", 403, "contribution_access_required")
  }
  return access
}

export function validateUploadRequest(input: {
  access: MemorialAccess
  purpose: UploadPurpose
  filename: string
  mimeType: string
  fileSize: number
  existingMediaCounts: MediaCountState
}): { mediaType: MediaType; mimeType: string; uploadMode: "single" | "multipart" } {
  const filename = input.filename.trim()
  const mimeType = normalizeMediaMime(input.mimeType)
  const mediaType = detectMediaType(mimeType)
  if (!filename || filename.length > 240) {
    throw new UploadSessionError("Please choose a file with a shorter name.", 400, "invalid_filename")
  }
  if (!mediaType) {
    throw new UploadSessionError("This media format is not supported.", 400, "unsupported_media_type")
  }
  if (!Number.isSafeInteger(input.fileSize) || input.fileSize < 1) {
    throw new UploadSessionError("The file size is invalid.", 400, "invalid_file_size")
  }

  const context = input.purpose === "studio_gallery" ? "studio" : "member_contribution"
  const capabilities = resolveMediaCapabilities({
    context,
    isPaid: Boolean(input.access.memorial.is_paid),
    accessRole: input.access.role,
    contributionSettings: input.access.memorial.contribution_settings || null,
    existingMediaCounts: input.existingMediaCounts,
  })
  if (mediaType === "image" && capabilities.imageQuotaReached) {
    throw new UploadSessionError(
      `This memorial has reached its ${capabilities.maxImageItems}-photo limit on the free plan.`,
      403,
      "photo_limit_reached",
    )
  }
  if (!isMediaAllowed(capabilities, mediaType)) {
    if ((mediaType === "audio" || mediaType === "video") && !input.access.memorial.is_paid) {
      throw new UploadSessionError(
        "Original audio and video are available on the Pro plan.",
        403,
        "pro_required",
      )
    }
    throw new UploadSessionError(
      "The family is not currently accepting this type of contribution.",
      403,
      "media_type_disabled",
    )
  }
  const limit = mediaLimit(capabilities, mediaType)
  if (!limit || input.fileSize > limit) {
    throw new UploadSessionError(
      `This ${mediaType} must be ${Math.floor((limit || 0) / 1024 / 1024)}MB or smaller.`,
      413,
      "file_too_large",
    )
  }
  return {
    mediaType,
    mimeType,
    uploadMode: shouldUseMultipart(mediaType, input.fileSize) ? "multipart" : "single",
  }
}

export async function getAuthorizedUploadSession(
  db: SupabaseClient,
  sessionId: string,
  userId: string,
  memorialId?: string,
): Promise<{ session: MediaUploadSession; access: MemorialAccess }> {
  const { data, error } = await db
    .from("media_upload_sessions")
    .select("*")
    .eq("id", sessionId)
    .eq("user_id", userId)
    .maybeSingle()
  if (error) throw error
  if (!data || (memorialId && data.memorial_id !== memorialId)) {
    throw new UploadSessionError("Upload session not found.", 404, "session_not_found")
  }
  const session = data as MediaUploadSession
  const access = await authorizeUploadPurpose(session.memorial_id, userId, session.purpose)
  if (["aborted", "expired", "failed"].includes(session.status)) {
    throw new UploadSessionError("This upload session can no longer be resumed.", 409, session.status)
  }
  if (session.status !== "complete" && new Date(session.expires_at).getTime() <= Date.now()) {
    throw new UploadSessionError("This upload session has expired.", 410, "expired")
  }
  return { session, access }
}

export async function extendUploadSession(db: SupabaseClient, sessionId: string) {
  const expiresAt = uploadSessionExpiry()
  const { error } = await db.rpc("extend_media_upload_session", {
    p_session_id: sessionId,
    p_expires_at: expiresAt,
  })
  if (error) {
    if (isUploadSessionSchemaError(error)) {
      throw new UploadSessionError(
        "The upload database upgrade is not applied yet. Apply migration 23 and try again.",
        503,
        "upload_schema_outdated",
      )
    }
    throw error
  }
  return expiresAt
}

export async function ensureMultipartUpload(
  db: SupabaseClient,
  session: MediaUploadSession,
): Promise<string> {
  if (session.upload_mode !== "multipart") {
    throw new UploadSessionError("This is not a multipart upload.", 409, "not_multipart")
  }
  if (session.multipart_upload_id) return session.multipart_upload_id
  const expiresAt = await extendUploadSession(db, session.id)
  const multipart = await createR2MultipartUpload(session.r2_key, session.mime_type)
  const { data, error } = await db.from("media_upload_sessions").update({
    multipart_upload_id: multipart.uploadId,
    status: "uploading",
    expires_at: expiresAt,
  }).eq("id", session.id).is("multipart_upload_id", null).select("multipart_upload_id").maybeSingle()
  if (error) throw error
  if (data?.multipart_upload_id) return data.multipart_upload_id

  const refreshed = await db.from("media_upload_sessions")
    .select("multipart_upload_id").eq("id", session.id).single()
  if (refreshed.data?.multipart_upload_id) {
    // A concurrent request won the race; do not leave the losing R2 upload open.
    const { abortR2MultipartUpload } = await import("@/lib/r2")
    await abortR2MultipartUpload(session.r2_key, multipart.uploadId).catch(() => {})
    return refreshed.data.multipart_upload_id
  }
  throw new Error("Failed to persist multipart upload ID")
}

export async function verifyUploadedSessionObject(
  db: SupabaseClient,
  session: MediaUploadSession,
): Promise<MediaValidationResult & { contentLength: number }> {
  if (session.status === "complete") {
    return {
      valid: true,
      detectedMime: session.mime_type,
      mediaType: session.media_type,
      contentLength: session.file_size,
    }
  }
  const expiresAt = await extendUploadSession(db, session.id)
  let object: Awaited<ReturnType<typeof inspectR2Object>>
  try {
    object = await inspectR2Object(session.r2_key)
  } catch (error) {
    const candidate = error as { name?: string; code?: string; $metadata?: { httpStatusCode?: number } }
    const missing = candidate?.name === "NotFound" || candidate?.name === "NoSuchKey" ||
      candidate?.code === "NotFound" || candidate?.code === "NoSuchKey" ||
      candidate?.$metadata?.httpStatusCode === 404
    if (missing) {
      throw new UploadSessionError(
        "The object has not finished uploading yet.",
        409,
        "upload_not_complete",
      )
    }
    throw error
  }
  await db.from("media_upload_sessions").update({
    status: "verifying",
    expires_at: expiresAt,
  }).eq("id", session.id).in("status", ["created", "uploading", "uploaded", "verifying"])

  try {
    let mismatchReason: string | null = null
    if (object.contentLength !== session.file_size) mismatchReason = "content_length"
    else if (normalizeMediaMime(object.contentType) !== normalizeMediaMime(session.mime_type)) mismatchReason = "content_type"

    const prefix = await getR2ObjectPrefixBuffer(session.r2_key, 8192)
    const validation = validateMagicBytes(prefix, session.original_filename, object.contentType)
    if (!mismatchReason && !validation.valid) mismatchReason = "magic_bytes"
    else if (!mismatchReason && validation.mediaType !== session.media_type) mismatchReason = "media_category"
    else if (!mismatchReason && !isDetectedMediaMimeCompatible(session.mime_type, validation.detectedMime)) mismatchReason = "detected_mime"
    if (mismatchReason) {
      console.warn("[media-upload] uploaded_object_mismatch", {
        session_id: session.id,
        reason: mismatchReason,
        expected_bytes: session.file_size,
        actual_bytes: object.contentLength,
        expected_mime: session.mime_type,
        object_mime: object.contentType,
        detected_mime: validation.detectedMime,
      })
      throw new Error("UPLOADED_OBJECT_MISMATCH")
    }

    await db.from("media_upload_sessions").update({
      status: "uploaded",
      error_code: null,
      expires_at: expiresAt,
    }).eq("id", session.id).in("status", ["verifying", "uploaded"])
    return { ...validation, contentLength: object.contentLength }
  } catch (error) {
    const invalid = error instanceof Error && error.message === "UPLOADED_OBJECT_MISMATCH"
    if (invalid) {
      await deleteR2Object(session.r2_key).catch(() => {})
      await releaseMemorialStorage(db, session.memorial_id, uploadReservationKey(session.id)).catch(() => {})
      await db.from("media_upload_sessions").update({
        status: "failed",
        error_code: "invalid_uploaded_bytes",
      }).eq("id", session.id).in("status", ["verifying", "uploaded"])
      throw new UploadSessionError(
        `This file does not match the expected ${session.media_type} format. Choose another file.`,
        400,
        "invalid_uploaded_bytes",
      )
    }
    await db.from("media_upload_sessions").update({
      status: "uploaded",
      error_code: "verification_retryable",
      expires_at: expiresAt,
    }).eq("id", session.id).eq("status", "verifying")
    throw error
  }
}
