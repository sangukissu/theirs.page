import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdminSafe } from "@/utils/supabase/admin"
import { createClient } from "@/utils/supabase/server"
import { verifyTurnstileToken, checkContributionRateLimit } from "@/lib/turnstile"
import { resend } from "@/lib/resend"
import { screenTextWithGemini } from "@/lib/safety/moderation"
import { promoteQuarantinedMedia } from "@/lib/r2"
import type { ContributionSettings, ContributorRole, MemoryStatus, SafetyDecision } from "@/types/theirs"

interface RouteContext {
  params: Promise<{ id: string }>
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("cf-connecting-ip") ||
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "127.0.0.1"
  )
}

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const body = await req.json().catch(() => ({}))
    const {
      type, // "memory" | "story" | "tribute" | "photo" | "voice" | "video" | "moment"
      author_name,
      author_relationship,
      content,
      approx_year,
      location,
      photo_url,
      photo_urls,
      tribute_type,
      turnstile_token,
    } = body

    // 1. IP Rate Limiting
    const clientIp = getClientIp(req)
    const rateLimit = await checkContributionRateLimit(clientIp)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: `You are contributing very quickly. Please pause for ${rateLimit.remainingSeconds || 60} seconds before submitting another memory.`,
        },
        { status: 429 }
      )
    }

    // 2. Turnstile Captcha verification
    const isValidCaptcha = await verifyTurnstileToken(turnstile_token, clientIp)
    if (!isValidCaptcha) {
      return NextResponse.json(
        { error: "Security check failed. Please refresh and try again." },
        { status: 400 }
      )
    }

    // 3. Input validation
    if (!author_name || !author_name.trim()) {
      return NextResponse.json({ error: "Your name is required." }, { status: 400 })
    }

    const effectiveContent =
      (content && content.trim()) ||
      (photo_url
        ? type === "video"
          ? `Video clip shared by ${author_name.trim()}`
          : type === "voice"
          ? `Voice recording shared by ${author_name.trim()}`
          : `Photograph shared by ${author_name.trim()}`
        : "")

    if (!effectiveContent) {
      return NextResponse.json({ error: "Please write a memory or message to share." }, { status: 400 })
    }

    // 4. Resolve Memorial
    const adminClient = getSupabaseAdminSafe()
    const serverClient = await createClient()
    const db = adminClient || serverClient

    const isUuid = UUID_REGEX.test(id)
    let memorial: {
      id: string
      slug: string
      status: string
      privacy: string
      full_name?: string
      owner_id?: string
      contribution_settings?: ContributionSettings | null
    } | null = null

    try {
      let query = db
        .from("memorials")
        .select("id, slug, status, privacy, full_name, owner_id, contribution_settings")
      query = isUuid ? query.eq("id", id) : query.eq("slug", id)
      const res = await query.maybeSingle()
      if (res.data) memorial = res.data
    } catch (lookupErr) {
      console.error("Memorial lookup error:", lookupErr)
    }

    if (!memorial && adminClient) {
      try {
        let query = serverClient
          .from("memorials")
          .select("id, slug, status, privacy, full_name, owner_id, contribution_settings")
        query = isUuid ? query.eq("id", id) : query.eq("slug", id)
        const res = await query.maybeSingle()
        if (res.data) memorial = res.data
      } catch (fallbackErr) {
        console.error("Server client lookup error:", fallbackErr)
      }
    }

    if (!memorial) {
      return NextResponse.json({ error: "Memorial not found." }, { status: 404 })
    }

    // 5. Enforce Publication Status: Draft & Archived memorials cannot receive contributions
    if (memorial.status !== "published") {
      return NextResponse.json(
        { error: "This memorial is not currently open for contributions." },
        { status: 403 }
      )
    }

    // 6. Enforce Private Memorial PIN Gate
    if (memorial.privacy === "private") {
      const cookieKey = memorial.slug || memorial.id
      const isUnlocked = req.cookies.get(`theirs_pin_${cookieKey}`)?.value === "unlocked"
      if (!isUnlocked) {
        return NextResponse.json(
          { error: "This memorial is private. Please unlock it with the family PIN before contributing." },
          { status: 403 }
        )
      }
    }

    // 7. Enforce Caretaker Contribution Settings (Granular toggles)
    const settings: ContributionSettings = memorial.contribution_settings || {
      accept_contributions: true,
      tributes: true,
      memories: true,
      photos: true,
      voice: true,
      videos: true,
      moments: true,
    }

    if (settings.accept_contributions === false) {
      return NextResponse.json(
        { error: "This memorial is not currently accepting contributions." },
        { status: 403 }
      )
    }

    if ((type === "tribute" || type === "message") && settings.tributes === false) {
      return NextResponse.json(
        { error: "Tributes are currently turned off for this memorial." },
        { status: 403 }
      )
    }

    if ((type === "story" || type === "memory") && settings.memories === false) {
      return NextResponse.json(
        { error: "Memories and stories are currently turned off for this memorial." },
        { status: 403 }
      )
    }

    if (type === "photo" && settings.photos === false) {
      return NextResponse.json(
        { error: "Photographs are currently turned off for this memorial." },
        { status: 403 }
      )
    }

    if (type === "voice" && settings.voice === false) {
      return NextResponse.json(
        { error: "Voice recordings are currently turned off for this memorial." },
        { status: 403 }
      )
    }

    if (type === "video" && settings.videos === false) {
      return NextResponse.json(
        { error: "Video clips are currently turned off for this memorial." },
        { status: 403 }
      )
    }

    if (type === "moment" && settings.moments === false) {
      return NextResponse.json(
        { error: "Life moments are currently turned off for this memorial." },
        { status: 403 }
      )
    }

    // 8. Resolve Contributor Permission Level
    let contributorRole: ContributorRole = "anonymous"
    try {
      const { data: authData } = await serverClient.auth.getUser()
      const loggedInUser = authData?.user
      if (loggedInUser) {
        if (loggedInUser.id === memorial.owner_id) {
          contributorRole = "owner"
        } else {
          const { data: collab } = await db
            .from("collaborators")
            .select("role, invitation_accepted, is_trusted")
            .eq("memorial_id", memorial.id)
            .eq("user_id", loggedInUser.id)
            .maybeSingle()

          if (collab && collab.invitation_accepted) {
            if (collab.role === "co_admin") {
              contributorRole = "co_admin"
            } else if (collab.is_trusted) {
              contributorRole = "trusted"
            } else {
              contributorRole = "invited"
            }
          }
        }
      }
    } catch (roleErr) {
      console.warn("Could not determine contributor role, defaulting to anonymous:", roleErr)
    }

    // 9. Automated Safety Screening (Text screening with Gemini Flash Lite)
    const safetyResult = await screenTextWithGemini(effectiveContent, {
      authorName: author_name.trim(),
      memorialName: memorial.full_name,
    })

    // 10. Determine Media URLs & Types
    const resolvedPhotoUrls = Array.isArray(photo_urls) && photo_urls.length > 0
      ? photo_urls
      : photo_url
      ? [photo_url]
      : []
    let primaryPhotoUrl = resolvedPhotoUrls[0] || photo_url || null

    const safeTributeType = primaryPhotoUrl
      ? "photo"
      : ["flower", "note", "photo", "candle"].includes(tribute_type)
      ? tribute_type
      : "note"

    const isStory =
      (type === "story" || type === "memory" || resolvedPhotoUrls.length > 0 || Boolean(approx_year)) &&
      type !== "tribute"
    const contributionType = isStory ? "story" : "tribute"

    // 11. Permission & Moderation Matrix according to docs/security.md
    let status: MemoryStatus = "pending_approval"
    let isQuarantined = Boolean(primaryPhotoUrl)

    if (safetyResult.decision === "blocked") {
      // 🚨 Safety flagged -> Quarantine immediately! Never auto-publish
      status = "blocked"
      isQuarantined = true
    } else if (safetyResult.decision === "review") {
      // Ambiguous content -> Always goes to caretaker approval queue with review flags
      status = "pending_approval"
    } else {
      // Safety passed: 'safe'
      if (contributorRole === "owner" || contributorRole === "co_admin") {
        status = "approved"
        isQuarantined = false
      } else if (contributorRole === "trusted") {
        // Trusted contributor bypasses family approval, but NEVER automated safety
        status = "approved"
        isQuarantined = false
      } else {
        // Anonymous visitor or standard invited collaborator: MANDATORY caretaker approval
        status = "pending_approval"
      }
    }

    // 12. Promote media if directly approved (e.g. trusted collaborator or owner)
    if (status === "approved" && primaryPhotoUrl && primaryPhotoUrl.includes("/quarantine/")) {
      try {
        const urlObj = new URL(primaryPhotoUrl)
        const oldKey = urlObj.pathname.replace(/^\/+/, "")
        const newKey = oldKey.replace(/^quarantine\//, "memorials/")
        primaryPhotoUrl = await promoteQuarantinedMedia(oldKey, newKey)
      } catch (promoteErr) {
        console.warn("Could not promote quarantined media upon direct approval:", promoteErr)
      }
    }

    // 13. Generate cryptographically random receipt token
    const receiptToken = `cr_${crypto.randomUUID().replace(/-/g, "")}${Math.random().toString(36).slice(2, 10)}`

    // 14. Insert Real Backend Record (Never a dummy local record)
    const { data: insertedMemory, error } = await db
      .from("memories")
      .insert({
        memorial_id: memorial.id,
        author_name: author_name.trim(),
        author_relationship: author_relationship?.trim() || null,
        story: effectiveContent,
        approx_year: approx_year ? Number(approx_year) : null,
        location: location?.trim() || null,
        photo_url: primaryPhotoUrl,
        photo_urls: resolvedPhotoUrls,
        tribute_type: safeTributeType,
        contribution_type: contributionType,
        status,
        safety_decision: safetyResult.decision,
        safety_details: safetyResult,
        contributor_role: contributorRole,
        receipt_token: receiptToken,
        is_quarantined: isQuarantined,
        visibility: "everyone",
        approved_at: status === "approved" ? new Date().toISOString() : null,
      })
      .select()
      .maybeSingle()

    if (error) {
      console.error("Memory submission error:", error)
      return NextResponse.json(
        { error: "Unable to submit your memory right now. Please try again in a moment." },
        { status: 500 }
      )
    }

    // 15. Caretaker Notification: Send notification for safe/review submissions (Never spam for blocked attacks)
    if (
      status !== "blocked" &&
      memorial.owner_id &&
      process.env.RESEND_API_KEY &&
      process.env.RESEND_API_KEY !== "re_placeholder_for_build"
    ) {
      try {
        const { data: ownerProfile } = await db
          .from("user_profiles")
          .select("email, full_name")
          .eq("user_id", memorial.owner_id)
          .maybeSingle()

        if (ownerProfile?.email) {
          const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://theirs.page"
          const editorUrl = `${appUrl}/dashboard/memorials/${memorial.id}/editor?tab=contributions`
          const memorialName = memorial.full_name || "your memorial"
          const ritualLabel =
            safeTributeType === "flower"
              ? "laid a flower"
              : safeTributeType === "candle"
              ? "lit a candle"
              : safeTributeType === "photo"
              ? "shared a photograph"
              : "shared a memory"

          const statusBadge =
            status === "approved"
              ? "(Auto-published)"
              : safetyResult.decision === "review"
              ? "(Review recommended)"
              : "(Waiting for your approval)"

          await resend.emails.send({
            from: "Theirs <notifications@theirs.page>",
            to: ownerProfile.email,
            subject: `New contribution from ${author_name.trim()} for ${memorialName} ${statusBadge}`,
            html: `
              <div style="font-family: Georgia, serif; max-width: 520px; margin: 0 auto; padding: 40px 20px; color: #181925; line-height: 1.6;">
                <h2 style="font-size: 20px; font-weight: normal; margin-bottom: 16px; color: #181925;">A new remembrance has arrived</h2>
                <p style="font-size: 15px; color: #444;">
                  <strong>${author_name.trim()}</strong> ${ritualLabel} on <strong>${memorialName}</strong>.
                </p>
                <div style="background-color: #f7f7f8; border-left: 3px solid #305dde; padding: 16px 20px; margin: 20px 0; border-radius: 8px; font-style: italic; color: #333;">
                  “${effectiveContent.length > 300 ? effectiveContent.slice(0, 300) + '...' : effectiveContent}”
                </div>
                <div style="margin: 28px 0;">
                  <a href="${editorUrl}" style="background-color: #181925; color: #ffffff; padding: 11px 22px; border-radius: 22px; text-decoration: none; font-size: 13px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-weight: 500; display: inline-block;">
                    View in Contributions Dashboard &rarr;
                  </a>
                </div>
                <p style="font-size: 12px; color: #999; margin-top: 32px; border-top: 1px solid #eaeaea; padding-top: 16px;">
                  Sent from Theirs (theirs.page) · Quiet, permanent places for a human life
                </p>
              </div>
            `,
          })
        }
      } catch (notifyErr) {
        console.warn("Caretaker contribution notification error:", notifyErr)
      }
    }

    const firstName = memorial.full_name?.split(" ")[0] || "the"

    // 16. Return Optimistic Receipt Payload
    return NextResponse.json({
      success: true,
      contribution_id: insertedMemory.id,
      receipt_token: receiptToken,
      status: insertedMemory.status,
      message:
        insertedMemory.status === "approved"
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
        photo_url: insertedMemory.photo_url,
        photo_urls: insertedMemory.photo_urls,
        tribute_type: insertedMemory.tribute_type,
        contribution_type: insertedMemory.contribution_type,
        status: insertedMemory.status,
        receipt_token: receiptToken,
        created_at: insertedMemory.created_at,
      },
    })
  } catch (err: any) {
    console.error("Contribution submission unhandled error:", err)
    return NextResponse.json(
      { error: "Unable to submit your contribution right now. Please try again in a moment." },
      { status: 500 }
    )
  }
}
