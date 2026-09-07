import crypto from "crypto"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createClient } from "@/utils/supabase/server"
import { getSupabaseAdminSafe } from "@/utils/supabase/admin"
import { deleteR2Object, getR2SignedUrl, resolveMediaUrl } from "@/lib/r2"
import { promoteStagedMemorialImage } from "@/lib/memorial-image-promotion"
import {
  combineSafetyResults,
  screenTextWithGemini,
} from "@/lib/safety/moderation"
import { contributionPlainText, sanitizeContributionHtml } from "@/lib/safety/contribution-html"
import { TEXT_LIMITS, MAX_RICH_TEXT_HTML_BYTES, utf8ByteLength } from "@/lib/validation/text-limits"
import {
  escapeEmailHtml,
  getTheirsAppUrl,
  notifyCaretakers,
} from "@/lib/email/caretaker-notifications"
import { emailNotice, emailQuoteCard, renderTheirsEmail } from "@/lib/email/templates"
import {
  prepareMemberContributionMedia,
  promotePreparedMemberMedia,
  type PreparedContributionMedia,
} from "@/lib/uploads/authenticated-media"
import {
  getAuthorizedUploadSession,
  type MediaUploadSession,
  UploadSessionError,
  verifyUploadedSessionObject,
} from "@/lib/uploads/upload-session"

interface RouteContext { params: Promise<{ id: string; sessionId: string }> }

const finalizeSchema = z.object({
  sessionIds: z.array(z.string().uuid()).min(1).max(3).optional(),
  caption: z.string().trim().max(TEXT_LIMITS.photoCaption).nullable().optional(),
  approxYear: z.number().int().min(1000).max(new Date().getUTCFullYear() + 1).nullable().optional(),
  location: z.string().trim().max(TEXT_LIMITS.location).nullable().optional(),
  album: z.string().trim().max(TEXT_LIMITS.albumName).nullable().optional(),
  authorName: z.string().trim().min(1).max(TEXT_LIMITS.contributorName).optional(),
  authorRelationship: z.string().trim().max(TEXT_LIMITS.relationship).nullable().optional(),
  content: z.string().max(MAX_RICH_TEXT_HTML_BYTES).optional(),
}).strict()

function uploadError(error: unknown) {
  if (error instanceof UploadSessionError) {
    return NextResponse.json({ error: error.message, code: error.code }, { status: error.status })
  }
  const code = error instanceof Error ? error.message : ""
  if (code === "IMAGE_SANITIZATION_FAILED" || code === "INVALID_IMAGE_DIMENSIONS") {
    return NextResponse.json({
      error: code === "INVALID_IMAGE_DIMENSIONS"
        ? "This photograph is damaged or has unusually large dimensions."
        : "We could not safely prepare this photograph. Please export it as a new JPEG and try again.",
      code: code.toLowerCase(),
    }, { status: 400 })
  }
  if (code === "Cloudflare Images binding is not configured") {
    return NextResponse.json({
      error: "The original HEIC file uploaded safely, but local development cannot create its browser preview. Resume this upload in Cloudflare preview or after deployment.",
      code: "image_runtime_unavailable",
    }, { status: 503 })
  }
  console.error("Upload finalization error:", error)
  return NextResponse.json({ error: "The uploaded file is safe, but could not be added yet. Retry finalization without uploading again." }, { status: 503 })
}

async function finalizeStudio(
  db: NonNullable<ReturnType<typeof getSupabaseAdminSafe>>,
  session: MediaUploadSession,
  userId: string,
  body: z.infer<typeof finalizeSchema>,
  startedAt: number,
) {
  if (session.status === "complete" && session.result_media_item_id) {
    const existing = await db.from("media_items").select("*").eq("id", session.result_media_item_id).single()
    if (existing.error) throw existing.error
    return NextResponse.json({
      success: true,
      alreadyComplete: true,
      mediaItem: { ...existing.data, url: resolveMediaUrl(existing.data.url) },
    })
  }

  await verifyUploadedSessionObject(db, session)
  let displayKey = session.r2_key
  let originalKey = session.r2_key
  if (session.media_type === "image") {
    const promoted = await promoteStagedMemorialImage(session.r2_key, session.memorial_id, "gallery", session.id)
    displayKey = promoted.displayKey
    originalKey = promoted.originalKey
  }

  const result = await db.rpc("finalize_studio_upload_session", {
    p_session_id: session.id,
    p_user_id: userId,
    p_media_url: displayKey,
    p_original_key: originalKey,
    p_caption: body.caption || null,
    p_approx_year: body.approxYear || null,
    p_location: body.location || null,
    p_album: body.album || null,
  })
  if (result.error) {
    if (session.media_type === "image") {
      await Promise.allSettled([...new Set([displayKey, originalKey])].map(deleteR2Object))
    }
    throw result.error
  }
  if (session.media_type === "image") await deleteR2Object(session.r2_key).catch(() => {})
  const mediaItem = (result.data as { media_item: Record<string, unknown> }).media_item
  console.info("[media-upload] upload_completed", {
    purpose: session.purpose, media_type: session.media_type, bytes: session.file_size,
    finalize_ms: Date.now() - startedAt,
  })
  return NextResponse.json({
    success: true,
    alreadyComplete: Boolean((result.data as { already_complete?: boolean }).already_complete),
    mediaItem: { ...mediaItem, url: resolveMediaUrl(String(mediaItem.url || displayKey)) },
  })
}

async function existingMemberResult(
  db: NonNullable<ReturnType<typeof getSupabaseAdminSafe>>,
  sessions: MediaUploadSession[],
) {
  const memoryId = sessions[0]?.result_memory_id
  if (!memoryId || sessions.some((session) => session.status !== "complete" || session.result_memory_id !== memoryId)) return null
  const result = await db.from("memories").select("*").eq("id", memoryId).single()
  if (result.error) throw result.error
  return result.data
}

function contributionType(records: PreparedContributionMedia[]) {
  const type = records[0]?.media_type
  return type === "audio" ? "voice" : type === "video" ? "video" : "photo"
}

export async function POST(req: NextRequest, context: RouteContext) {
  const startedAt = Date.now()
  try {
    const { id, sessionId } = await context.params
    const auth = await createClient()
    const { data: { user } } = await auth.auth.getUser()
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 })
    const db = getSupabaseAdminSafe()
    if (!db) return NextResponse.json({ error: "Upload finalization is temporarily unavailable." }, { status: 503 })
    const parsed = finalizeSchema.safeParse(await req.json().catch(() => ({})))
    if (!parsed.success) return NextResponse.json({ error: "Please check the media details and try again." }, { status: 400 })
    const body = parsed.data
    const anchor = await getAuthorizedUploadSession(db, sessionId, user.id, id)
    if (anchor.session.purpose === "studio_gallery") {
      return finalizeStudio(db, anchor.session, user.id, body, startedAt)
    }

    const sessionIds = [...new Set(body.sessionIds || [sessionId])]
    if (!sessionIds.includes(sessionId)) sessionIds.unshift(sessionId)
    if (sessionIds.length > 3) throw new UploadSessionError("No more than three files can be attached.", 400, "too_many_files")
    const authorized = await Promise.all(sessionIds.map((value) => getAuthorizedUploadSession(db, value, user.id, id)))
    let sessions = authorized.map((value) => value.session)
    if (sessions.some((session) => session.purpose !== "member_contribution" || session.memorial_id !== anchor.session.memorial_id)) {
      throw new UploadSessionError("These uploads cannot be finalized together.", 403, "session_group_mismatch")
    }
    const existing = await existingMemberResult(db, sessions)
    if (existing) {
      return NextResponse.json({
        success: true, alreadyComplete: true, contribution_id: existing.id,
        status: existing.status === "approved" ? "approved" : "pending_approval",
        item: existing,
      })
    }

    if (!body.authorName) return NextResponse.json({ error: "Please add your name." }, { status: 400 })
    const defaultStory = `${sessions[0].media_type === "audio" ? "Voice recording" : sessions[0].media_type === "video" ? "Video clip" : "Photograph"} shared by ${body.authorName}`
    const effectiveStory = sanitizeContributionHtml((body.content || "").trim() || defaultStory)
    if (!contributionPlainText(effectiveStory) || utf8ByteLength(effectiveStory) > MAX_RICH_TEXT_HTML_BYTES) {
      return NextResponse.json({ error: "Please shorten this contribution and try again." }, { status: 400 })
    }

    await Promise.all(sessions.map((session) => verifyUploadedSessionObject(db, session)))
    const refreshed = await Promise.all(sessionIds.map((value) => getAuthorizedUploadSession(db, value, user.id, id)))
    sessions = refreshed.map((value) => value.session)
    let records = await Promise.all(sessions.map(prepareMemberContributionMedia))
    const textSafety = await screenTextWithGemini([
      body.authorName, body.authorRelationship, contributionPlainText(effectiveStory),
    ].filter(Boolean).join("\n"))
    const safety = combineSafetyResults([textSafety, ...records.map((record) => record.safety)])
    const access = anchor.access
    const contributorRole = access.role === "contributor" ? "invited" : access.role
    const canAutoPublish = ["owner", "co_admin", "trusted"].includes(access.role)
    const status = safety.decision === "blocked"
      ? "blocked"
      : safety.decision === "safe" && canAutoPublish
        ? "approved"
        : "pending_approval"

    if (status === "approved") {
      records = await Promise.all(records.map((record) => promotePreparedMemberMedia(record, anchor.session.memorial_id)))
    }
    const receiptToken = `cr_${crypto.randomBytes(32).toString("base64url")}`
    const receiptHash = crypto.createHash("sha256").update(receiptToken).digest("hex")
    const mediaRecords = records.map(({ temporary_keys: _temporary, safety: _safety, ...record }) => record)
    const rpc = await db.rpc("finalize_member_upload_sessions", {
      p_session_ids: sessionIds,
      p_user_id: user.id,
      p_author_name: body.authorName,
      p_author_relationship: body.authorRelationship || null,
      p_story: effectiveStory,
      p_approx_year: body.approxYear || null,
      p_location: body.location || null,
      p_contributor_role: contributorRole,
      p_status: status,
      p_safety_decision: safety.decision,
      p_safety_details: {
        ...safety,
        screening_version: 3,
        submission_type: contributionType(records),
        media: mediaRecords.map((record) => ({
          original_key: record.original_key,
          display_key: record.display_key,
          mime: record.mime,
          session_id: record.session_id,
        })),
      },
      p_media_records: mediaRecords,
      p_receipt_hash: receiptHash,
    })
    if (rpc.error) {
      if (status === "approved") {
        await Promise.allSettled(
          [...new Set(records.flatMap((record) => [record.display_key, record.original_key]))]
            .filter((key) => !key.startsWith("quarantine/") && !records.some((record) => record.source_key === key))
            .map(deleteR2Object),
        )
      }
      throw rpc.error
    }
    if (status === "approved") {
      await Promise.allSettled(records.flatMap((record) => record.temporary_keys).map(deleteR2Object))
    }
    const memory = (rpc.data as { memory: Record<string, unknown> }).memory
    if (status === "pending_approval") {
      const editorUrl = `${getTheirsAppUrl()}/dashboard/memorials/${anchor.session.memorial_id}/editor?tab=moderation`
      const plainStory = contributionPlainText(effectiveStory).slice(0, 500)
      await notifyCaretakers({
        db,
        memorialId: anchor.session.memorial_id,
        ownerId: access.memorial.owner_id,
        eventKey: `contribution/${String(memory.id)}`,
        subject: `${body.authorName} shared a remembrance of ${access.memorial.full_name}`,
        html: renderTheirsEmail({
          preheader: `${body.authorName} shared a remembrance of ${access.memorial.full_name}.`,
          eyebrow: "New remembrance",
          title: `Someone added to ${access.memorial.full_name}’s story`,
          bodyHtml: `<p style="margin:0"><strong style="color:#181925">${escapeEmailHtml(body.authorName)}</strong>${body.authorRelationship ? ` (${escapeEmailHtml(body.authorRelationship)})` : ""} shared this remembrance:</p>${emailQuoteCard(plainStory)}${emailNotice("Waiting for your approval. Nothing will appear publicly until you approve it.")}`,
          primaryAction: { label: "Review contribution", url: editorUrl },
        }),
      })
    }
    const displayUrls = await Promise.all(records.map((record) =>
      status === "approved"
        ? Promise.resolve(resolveMediaUrl(record.display_key, { publicDelivery: access.memorial.privacy !== "private" }))
        : getR2SignedUrl(record.display_key, 60 * 60)
    ))
    console.info("[media-upload] upload_completed", {
      purpose: anchor.session.purpose, actor_role: access.role,
      media_type: anchor.session.media_type, bytes: sessions.reduce((sum, item) => sum + Number(item.file_size), 0),
      finalize_ms: Date.now() - startedAt,
    })
    return NextResponse.json({
      success: true,
      contribution_id: memory.id,
      receipt_token: receiptToken,
      status: status === "approved" ? "approved" : "pending_approval",
      message: status === "approved" ? "Added to the memorial." : "Sent to the family.",
      item: {
        ...memory,
        photo_url: displayUrls[0] || null,
        photo_urls: displayUrls,
        contribution_type: contributionType(records),
        status: status === "approved" ? "approved" : "pending_approval",
      },
    })
  } catch (error) {
    console.warn("[media-upload] upload_failed", {
      failure_stage: "finalize",
      finalize_ms: Date.now() - startedAt,
      error_code: error instanceof UploadSessionError ? error.code : "finalization_retryable",
      http_status: error instanceof UploadSessionError ? error.status : 503,
    })
    return uploadError(error)
  }
}
