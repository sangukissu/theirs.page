import crypto from "crypto"
import { NextRequest, NextResponse } from "next/server"
import {
  copyR2Object,
  deleteR2Object,
  getR2ObjectPrefixBuffer,
  getR2SignedUrl,
  inspectR2Object,
} from "@/lib/r2"
import { validateMagicBytes, requireHumanMediaReview } from "@/lib/safety/moderation"
import {
  getGuestMediaRule,
  getUploadClientBinding,
  signUploadedMediaReference,
  verifyUploadIntent,
} from "@/lib/upload-intent"
import { getSupabaseAdminSafe } from "@/utils/supabase/admin"
import { releaseMemorialStorage } from "@/lib/storage-quota"

function getClientIp(req: NextRequest): string {
  return req.headers.get("cf-connecting-ip") || req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "127.0.0.1"
}

export async function POST(req: NextRequest) {
  let cleanup: { memorialId: string; key: string; displayKey?: string } | null = null
  try {
    const body = await req.json().catch(() => ({}))
    const authorization = typeof body.uploadIntentToken === "string"
      ? verifyUploadIntent(body.uploadIntentToken)
      : null
    if (!authorization || !authorization.directUploadKey) {
      return NextResponse.json({ error: "Upload authorization expired or invalid." }, { status: 403 })
    }
    if (authorization.clientBinding !== getUploadClientBinding(getClientIp(req))) {
      return NextResponse.json({ error: "This upload authorization belongs to a different browser session." }, { status: 403 })
    }
    if (body.key !== authorization.directUploadKey) {
      return NextResponse.json({ error: "The uploaded object does not match this upload session." }, { status: 403 })
    }
    cleanup = { memorialId: authorization.memorialId, key: authorization.directUploadKey }

    const rule = getGuestMediaRule(authorization.contributionType)
    if (rule.mediaType === "image") {
      return NextResponse.json({ error: "Photographs must use the inspected image upload path." }, { status: 400 })
    }

    const object = await inspectR2Object(authorization.directUploadKey)
    if (
      object.contentLength !== authorization.fileSize ||
      object.contentLength < 1 ||
      object.contentLength > authorization.maxBytes ||
      object.contentType !== authorization.contentType ||
      !rule.allowedMimeTypes.has(object.contentType)
    ) {
      throw new Error("UPLOADED_OBJECT_MISMATCH")
    }

    const prefix = await getR2ObjectPrefixBuffer(authorization.directUploadKey, 8192)
    const validation = validateMagicBytes(prefix, authorization.directUploadKey, object.contentType)
    if (!validation.valid || validation.mediaType !== rule.mediaType || validation.detectedMime !== object.contentType) {
      throw new Error("UPLOADED_OBJECT_MISMATCH")
    }

    const filename = authorization.directUploadKey.split("/").pop()
    if (!filename || !/^[a-f0-9-]+\.(?:mp3|wav|ogg|m4a|mp4|webm|mov)$/i.test(filename)) {
      throw new Error("UPLOADED_OBJECT_MISMATCH")
    }
    const displayKey = `contribution-staging/${authorization.memorialId}/${authorization.nonce}/display/${filename}`
    cleanup.displayKey = displayKey
    await copyR2Object(authorization.directUploadKey, displayKey, object.contentType)

    const mediaRef = signUploadedMediaReference({
      memorialId: authorization.memorialId,
      originalKey: authorization.directUploadKey,
      displayKey,
      detectedMime: validation.detectedMime,
      mediaType: validation.mediaType,
      contributionType: authorization.contributionType,
      intentNonce: authorization.nonce,
      safety: requireHumanMediaReview("Audio or video is held for caretaker approval; automated media analysis was not run."),
    })

    return NextResponse.json({
      success: true,
      mediaRef,
      previewUrl: await getR2SignedUrl(displayKey, 15 * 60),
      mediaType: validation.mediaType,
      contentType: validation.detectedMime,
      size: object.contentLength,
      isQuarantined: true,
    })
  } catch (error) {
    if (cleanup) {
      await deleteR2Object(cleanup.key).catch(() => {})
      if (cleanup.displayKey) await deleteR2Object(cleanup.displayKey).catch(() => {})
      const db = getSupabaseAdminSafe()
      if (db) await releaseMemorialStorage(db, cleanup.memorialId, cleanup.key).catch(() => {})
    }
    const invalid = error instanceof Error && error.message === "UPLOADED_OBJECT_MISMATCH"
    if (!invalid) console.error("Contribution upload completion failed:", error)
    return NextResponse.json(
      { error: invalid ? "The uploaded bytes do not match the authorized media file." : "The upload could not be verified. Please try again." },
      { status: invalid ? 400 : 500 }
    )
  }
}
