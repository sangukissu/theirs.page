import crypto from "crypto"
import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdminSafe } from "@/utils/supabase/admin"
import { createClient } from "@/utils/supabase/server"
import { verifyTurnstileToken, checkContributionRateLimit } from "@/lib/turnstile"
import { resend } from "@/lib/resend"
import { combineSafetyResults, screenTextWithGemini } from "@/lib/safety/moderation"
import {
  contributionInputSchema,
  parseApproxYear,
  type ContributionInput,
} from "@/lib/safety/contribution-input"
import {
  verifyUploadIntent,
  verifyUploadedMediaReference,
  getUploadClientBinding,
  type UploadedMediaReferencePayload,
} from "@/lib/upload-intent"
import {
  deleteR2Object,
  getR2SignedUrl,
  promoteQuarantinedMedia,
  resolveMediaUrl,
} from "@/lib/r2"
import { getMemorialPinCookieName, verifyPinAccessToken } from "@/lib/security/pin"
import type {
  ContributionSettings,
  ContributorRole,
  MemoryStatus,
} from "@/types/theirs"

interface RouteContext {
  params: Promise<{ id: string }>
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const MAX_BODY_BYTES = 64 * 1024

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("cf-connecting-ip") ||
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "127.0.0.1"
  )
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;",
  })[character] || character)
}

async function readContributionBody(req: NextRequest): Promise<unknown> {
  const declaredLength = Number(req.headers.get("content-length") || 0)
  if (declaredLength > MAX_BODY_BYTES) throw new Error("BODY_TOO_LARGE")
  const raw = await req.text()
  if (Buffer.byteLength(raw, "utf8") > MAX_BODY_BYTES) throw new Error("BODY_TOO_LARGE")
  try {
    return JSON.parse(raw)
  } catch {
    throw new Error("INVALID_JSON")
  }
}

function settingForType(
  type: ContributionInput["type"]
): keyof ContributionSettings {
  if (type === "tribute" || type === "message") return "tributes"
  if (type === "photo") return "photos"
  if (type === "voice") return "voice"
  if (type === "video") return "videos"
  if (type === "moment") return "moments"
  return "memories"
}

function defaultContent(input: ContributionInput): string {
  if (input.content) return input.content
  if (input.type === "photo") return `Photograph shared by ${input.author_name}`
  if (input.type === "tribute" || input.type === "message") {
    return input.tribute_type === "flower"
      ? `A flower was laid in remembrance by ${input.author_name}.`
      : input.tribute_type === "candle"
        ? `A candle was lit in remembrance by ${input.author_name}.`
        : ""
  }
  return ""
}

function destinationForMedia(memorialId: string, displayKey: string): string {
  const filename = displayKey.split("/").pop()
  if (!filename || !/^[a-f0-9-]+\.(?:jpg|png|webp)$/i.test(filename)) {
    throw new Error("Invalid quarantined media key")
  }
  return `memorials/${memorialId}/community/${filename}`
}

function destinationForOriginal(memorialId: string, originalKey: string): string {
  const filename = originalKey.split("/").pop()
  if (!filename || !/^[a-f0-9-]+\.(?:jpg|png|webp)$/i.test(filename)) {
    throw new Error("Invalid original media key")
  }
  return `originals/${memorialId}/community/${filename}`
}

function filenameFromStagedKey(key: string): string {
  const filename = key.split("/").pop()
  if (!filename || !/^[a-f0-9-]+\.(?:jpg|png|webp)$/i.test(filename)) {
    throw new Error("Invalid staged media key")
  }
  return filename
}

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    let rawBody: unknown
    try {
      rawBody = await readContributionBody(req)
    } catch (error) {
      const code = error instanceof Error ? error.message : ""
      return NextResponse.json(
        { error: code === "BODY_TOO_LARGE" ? "This contribution is too large." : "Invalid request." },
        { status: code === "BODY_TOO_LARGE" ? 413 : 400 }
      )
    }

    const parsed = contributionInputSchema.safeParse(rawBody)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Please check the contribution details and try again." },
        { status: 400 }
      )
    }
    const input = parsed.data
    if (input.type === "voice" || input.type === "video") {
      return NextResponse.json(
        { error: "Voice and video contributions are not available until their safety review pipeline is enabled." },
        { status: 501 }
      )
    }

    const effectiveContent = defaultContent(input)
    if (!effectiveContent) {
      return NextResponse.json({ error: "Please write a memory or message to share." }, { status: 400 })
    }
    if (
      input.type === "photo" &&
      input.media_refs.length === 0 &&
      !input.existing_media_id
    ) {
      return NextResponse.json({ error: "Please choose a photograph to share." }, { status: 400 })
    }

    const approxYear = parseApproxYear(input.approx_year)
    if (input.approx_year !== null && input.approx_year !== undefined && input.approx_year !== "" && !approxYear) {
      return NextResponse.json({ error: "Please enter a valid four-digit year." }, { status: 400 })
    }

    const clientIp = getClientIp(req)
    const rateLimit = await checkContributionRateLimit(clientIp, id)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: `You are contributing very quickly. Please wait ${rateLimit.remainingSeconds || 60} seconds and try again.` },
        { status: 429 }
      )
    }

    const admin = getSupabaseAdminSafe()
    if (!admin) {
      return NextResponse.json({ error: "Contributions are temporarily unavailable." }, { status: 503 })
    }
    const serverClient = await createClient()

    const isUuid = UUID_REGEX.test(id)
    let memorialQuery = admin
      .from("memorials")
      .select("id, slug, status, privacy, full_name, owner_id, access_pin_hash, contribution_settings")
    memorialQuery = isUuid ? memorialQuery.eq("id", id) : memorialQuery.eq("slug", id)
    const { data: memorial } = await memorialQuery.maybeSingle()

    if (!memorial) return NextResponse.json({ error: "Memorial not found." }, { status: 404 })
    if (memorial.status !== "published") {
      return NextResponse.json({ error: "This memorial is not currently open for contributions." }, { status: 403 })
    }

    if (memorial.privacy === "private") {
      const cookieName = getMemorialPinCookieName(memorial.slug || memorial.id)
      const hasPinAccess = verifyPinAccessToken(
        req.cookies.get(cookieName)?.value,
        memorial.id,
        memorial.access_pin_hash
      )
      if (!hasPinAccess) {
        const { data: { user } } = await serverClient.auth.getUser()
        const isOwner = user?.id === memorial.owner_id
        let isAcceptedCollaborator = false
        if (user && !isOwner) {
          const { data: collaborator } = await admin.from("collaborators")
            .select("id")
            .eq("memorial_id", memorial.id)
            .eq("user_id", user.id)
            .eq("invitation_accepted", true)
            .maybeSingle()
          isAcceptedCollaborator = Boolean(collaborator)
        }
        if (!isOwner && !isAcceptedCollaborator) {
          return NextResponse.json(
            { error: "Please unlock this private memorial before contributing." },
            { status: 403 }
          )
        }
      }
    }

    const settings = (memorial.contribution_settings || {}) as ContributionSettings
    if (settings.accept_contributions === false || settings[settingForType(input.type)] === false) {
      return NextResponse.json(
        { error: "The family is not currently accepting this type of contribution." },
        { status: 403 }
      )
    }

    const uploadAuthorization = input.upload_authorization
      ? verifyUploadIntent(input.upload_authorization)
      : null
    if (
      input.upload_authorization &&
      (!uploadAuthorization || uploadAuthorization.memorialId !== memorial.id)
    ) {
      return NextResponse.json({ error: "The upload authorization is invalid or expired." }, { status: 403 })
    }
    if (
      uploadAuthorization &&
      (
        uploadAuthorization.contributionType !== (input.type === "photo" ? "photo" : "memory") ||
        uploadAuthorization.clientBinding !== getUploadClientBinding(clientIp) ||
        input.media_refs.length === 0
      )
    ) {
      return NextResponse.json({ error: "The upload authorization does not match this contribution." }, { status: 403 })
    }

    const media = input.media_refs.map(verifyUploadedMediaReference)
    if (
      media.some((item) => !item || item.memorialId !== memorial.id) ||
      (media.length > 0 && !uploadAuthorization)
    ) {
      return NextResponse.json({ error: "One or more photograph references are invalid or expired." }, { status: 403 })
    }
    const verifiedMedia = media as UploadedMediaReferencePayload[]
    if (
      uploadAuthorization &&
      verifiedMedia.some((item) =>
        item.intentNonce !== uploadAuthorization.nonce ||
        item.contributionType !== uploadAuthorization.contributionType
      )
    ) {
      return NextResponse.json({ error: "A photograph does not belong to this upload session." }, { status: 403 })
    }
    if (new Set(verifiedMedia.map((item) => item.displayKey)).size !== verifiedMedia.length) {
      return NextResponse.json({ error: "The same photograph was attached more than once." }, { status: 400 })
    }

    if (!uploadAuthorization) {
      const captchaValid = await verifyTurnstileToken(
        input.turnstile_token,
        clientIp,
        "contribution"
      )
      if (!captchaValid) {
        return NextResponse.json(
          { error: "Security check expired or failed. Please try again." },
          { status: 400 }
        )
      }
    }

    let contributorRole: ContributorRole = "anonymous"
    const { data: { user } } = await serverClient.auth.getUser()
    if (user?.id === memorial.owner_id) {
      contributorRole = "owner"
    } else if (user) {
      const { data: collaborator } = await admin
        .from("collaborators")
        .select("role, invitation_accepted, is_trusted")
        .eq("memorial_id", memorial.id)
        .eq("user_id", user.id)
        .maybeSingle()
      if (collaborator?.invitation_accepted) {
        contributorRole = collaborator.role === "co_admin"
          ? "co_admin"
          : collaborator.is_trusted
            ? "trusted"
            : "invited"
      }
    }

    const textForScreening = [input.author_name, input.author_relationship, effectiveContent]
      .filter(Boolean)
      .join("\n")
    const textSafety = await screenTextWithGemini(textForScreening)
    const safety = combineSafetyResults([
      textSafety,
      ...verifiedMedia.map((item) => item.safety),
    ])

    let status: MemoryStatus = "pending_approval"
    if (safety.decision === "blocked") status = "blocked"
    else if (
      safety.decision === "safe" &&
      ["owner", "co_admin", "trusted"].includes(contributorRole)
    ) status = "approved"

    // Uploaded bytes begin in a short-lived staging prefix. Once the real DB
    // contribution is ready, move them either into private moderation storage
    // or the live memorial prefix. This lets the cleanup job safely remove
    // abandoned uploads without touching legitimate pending contributions.
    const finalDisplayKeys: string[] = []
    const finalOriginalKeys: string[] = []
    try {
      for (const item of verifiedMedia) {
        const filename = filenameFromStagedKey(item.displayKey)
        const originalFilename = filenameFromStagedKey(item.originalKey)
        const displayDestination = status === "approved"
          ? destinationForMedia(memorial.id, item.displayKey)
          : `quarantine/${memorial.id}/display/${filename}`
        const originalDestination = status === "approved"
          ? destinationForOriginal(memorial.id, item.originalKey)
          : `quarantine/${memorial.id}/original/${originalFilename}`

        await promoteQuarantinedMedia(item.displayKey, displayDestination)
        finalDisplayKeys.push(displayDestination)
        await promoteQuarantinedMedia(item.originalKey, originalDestination)
        finalOriginalKeys.push(originalDestination)
      }
    } catch (promotionError) {
      console.error("Contribution media finalization failed:", promotionError)
      await Promise.allSettled(
        [...finalDisplayKeys, ...finalOriginalKeys].map(deleteR2Object)
      )
      return NextResponse.json(
        { error: "The photograph could not be safely attached. Please upload it again." },
        { status: 503 }
      )
    }

    let existingPhotoKey: string | null = null
    if (input.existing_media_id) {
      const { data: existingMedia } = await admin
        .from("media_items")
        .select("url, media_type")
        .eq("id", input.existing_media_id)
        .eq("memorial_id", memorial.id)
        .maybeSingle()
      if (!existingMedia || existingMedia.media_type !== "image") {
        await Promise.allSettled(
          [...finalDisplayKeys, ...finalOriginalKeys].map(deleteR2Object)
        )
        return NextResponse.json({ error: "The selected memorial photograph was not found." }, { status: 400 })
      }
      existingPhotoKey = existingMedia.url
    }

    const storedPhotoUrls = [
      ...(existingPhotoKey ? [existingPhotoKey] : []),
      ...finalDisplayKeys,
    ]
    const receiptToken = `cr_${crypto.randomBytes(32).toString("base64url")}`
    const receiptHash = crypto.createHash("sha256").update(receiptToken).digest("hex")

    const { data: insertedMemory, error: insertError } = await admin
      .from("memories")
      .insert({
        memorial_id: memorial.id,
        author_name: input.author_name,
        author_relationship: input.author_relationship,
        story: effectiveContent,
        approx_year: approxYear,
        location: input.location,
        photo_url: storedPhotoUrls[0] || null,
        photo_urls: storedPhotoUrls,
        tribute_type: storedPhotoUrls.length > 0 ? "photo" : input.tribute_type,
        contribution_type:
          input.type === "tribute" || input.type === "message" ? "tribute" : "story",
        status,
        safety_decision: safety.decision,
        safety_details: {
          ...safety,
          screening_version: 2,
          media: verifiedMedia.map((item, index) => ({
            original_key: finalOriginalKeys[index],
            display_key: finalDisplayKeys[index],
            mime: item.detectedMime,
          })),
        },
        contributor_role: contributorRole,
        receipt_token: receiptHash,
        is_quarantined: status !== "approved" && verifiedMedia.length > 0,
        visibility: "everyone",
        approved_at: status === "approved" ? new Date().toISOString() : null,
      })
      .select()
      .single()

    if (insertError || !insertedMemory) {
      console.error("Memory submission error:", insertError)
      await Promise.allSettled(
        [...finalDisplayKeys, ...finalOriginalKeys].map(deleteR2Object)
      )
      return NextResponse.json(
        { error: "Unable to submit your memory right now. Please try again in a moment." },
        { status: 500 }
      )
    }

    if (status === "approved" && finalDisplayKeys.length > 0) {
      const rows = finalDisplayKeys.map((key) => ({
        memorial_id: memorial.id,
        media_type: "image",
        url: key,
        caption: `Shared by ${input.author_name}`,
        approx_year: approxYear,
        album: "Community Memories",
      }))
      const { error: galleryError } = await admin.from("media_items").insert(rows)
      if (galleryError) console.error("Approved contribution gallery sync failed:", galleryError)
    }

    if (status === "pending_approval" && memorial.owner_id && process.env.RESEND_API_KEY) {
      try {
        const { data: ownerProfile } = await admin
          .from("user_profiles")
          .select("email")
          .eq("user_id", memorial.owner_id)
          .maybeSingle()
        if (ownerProfile?.email) {
          const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://theirs.page"
          const editorUrl = `${appUrl}/dashboard/memorials/${memorial.id}/editor?tab=contributions`
          const statusLabel = safety.decision === "review" ? "Review recommended" : "Waiting for your approval"
          await resend.emails.send({
            from: "Theirs <notifications@theirs.page>",
            to: ownerProfile.email,
            subject: `${input.author_name} shared a remembrance of ${memorial.full_name}`,
            html: `<div style="font-family:Georgia,serif;max-width:520px;margin:0 auto;padding:40px 20px;color:#181925;line-height:1.6"><h2 style="font-size:20px;font-weight:normal">A new remembrance has arrived</h2><p><strong>${escapeHtml(input.author_name)}</strong> shared something about <strong>${escapeHtml(memorial.full_name)}</strong>.</p><div style="background:#f7f7f8;border-left:3px solid #305dde;padding:16px 20px;margin:20px 0;border-radius:8px;color:#333">${escapeHtml(effectiveContent.slice(0, 300))}</div><p style="font:12px sans-serif;color:#777">${escapeHtml(statusLabel)}</p><a href="${escapeHtml(editorUrl)}" style="background:#181925;color:#fff;padding:11px 22px;border-radius:22px;text-decoration:none;font:500 13px sans-serif;display:inline-block">Review contribution</a></div>`,
          })
        }
      } catch (notificationError) {
        console.warn("Caretaker contribution notification error:", notificationError)
      }
    }

    const optimisticUrls = await Promise.all(
      storedPhotoUrls.map((key) =>
        status === "approved" || key === existingPhotoKey
          ? Promise.resolve(resolveMediaUrl(key, {
              publicDelivery:
                status === "approved" && memorial.privacy !== "private",
            }))
          : getR2SignedUrl(key, 60 * 60)
      )
    )
    const firstName = memorial.full_name?.split(" ")[0] || "their"

    return NextResponse.json({
      success: true,
      contribution_id: insertedMemory.id,
      receipt_token: receiptToken,
      status: status === "approved" ? "approved" : "pending_approval",
      message: status === "approved"
        ? `Added. Thank you for sharing this memory of ${firstName}.`
        : `Sent to ${firstName}'s family.`,
      item: {
        id: insertedMemory.id,
        memorial_id: memorial.id,
        author_name: insertedMemory.author_name,
        author_relationship: insertedMemory.author_relationship,
        story: insertedMemory.story,
        approx_year: insertedMemory.approx_year,
        location: insertedMemory.location,
        photo_url: optimisticUrls[0] || null,
        photo_urls: optimisticUrls,
        tribute_type: insertedMemory.tribute_type,
        contribution_type: insertedMemory.contribution_type,
        status: status === "approved" ? "approved" : "pending_approval",
        created_at: insertedMemory.created_at,
      },
    })
  } catch (error) {
    console.error("Contribution submission error:", error)
    return NextResponse.json(
      { error: "Unable to submit your contribution right now. Please try again in a moment." },
      { status: 500 }
    )
  }
}
