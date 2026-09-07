import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { getSupabaseAdminSafe } from "@/utils/supabase/admin"
import { getR2SignedUrl } from "@/lib/r2"
import { getAuthorizedUploadSession, UploadSessionError, verifyUploadedSessionObject } from "@/lib/uploads/upload-session"

interface RouteContext { params: Promise<{ id: string; sessionId: string }> }

export async function POST(_req: NextRequest, context: RouteContext) {
  const startedAt = Date.now()
  try {
    const { id, sessionId } = await context.params
    const auth = await createClient()
    const { data: { user } } = await auth.auth.getUser()
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 })
    const db = getSupabaseAdminSafe()
    if (!db) return NextResponse.json({ error: "Upload verification is temporarily unavailable." }, { status: 503 })
    const { session } = await getAuthorizedUploadSession(db, sessionId, user.id, id)
    const result = await verifyUploadedSessionObject(db, session)
    console.info("[media-upload] upload_verified", {
      purpose: session.purpose,
      media_type: session.media_type,
      bytes: Number(session.file_size),
      verify_ms: Date.now() - startedAt,
    })
    return NextResponse.json({
      success: true,
      mediaType: result.mediaType,
      contentType: result.detectedMime,
      size: result.contentLength,
      previewUrl: session.purpose === "member_contribution" ? await getR2SignedUrl(session.r2_key, 15 * 60) : undefined,
    })
  } catch (error) {
    if (error instanceof UploadSessionError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.status })
    }
    console.warn("[media-upload] upload_failed", {
      failure_stage: "verify",
      verify_ms: Date.now() - startedAt,
      error_code: "verification_retryable",
    })
    console.error("Upload verification error:", error)
    return NextResponse.json({ error: "The upload could not be verified. Retry verification without uploading again." }, { status: 503 })
  }
}
