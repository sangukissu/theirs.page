import { NextRequest, NextResponse } from "next/server"
import { getR2ObjectStream } from "@/lib/r2"
import { getSupabaseAdminSafe } from "@/utils/supabase/admin"
import { createClient } from "@/utils/supabase/server"
import { getMemorialPinCookieName, verifyPinAccessToken } from "@/lib/security/pin"
import { assertMemorialAdmin } from "@/lib/memorial-auth"

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function getAccurateContentType(key: string, detectedType?: string): string {
  if (detectedType && detectedType !== "application/octet-stream") {
    return detectedType
  }
  const ext = key.split(".").pop()?.toLowerCase()
  switch (ext) {
    case "mp4":
      return "video/mp4"
    case "webm":
      return "video/webm"
    case "mov":
      return "video/quicktime"
    case "mp3":
      return "audio/mpeg"
    case "wav":
      return "audio/wav"
    case "m4a":
      return "audio/m4a"
    case "ogg":
    case "oga":
      return "audio/ogg"
    case "flac":
      return "audio/flac"
    case "aac":
      return "audio/aac"
    case "jpg":
    case "jpeg":
      return "image/jpeg"
    case "png":
      return "image/png"
    case "webp":
      return "image/webp"
    case "gif":
      return "image/gif"
    default:
      return detectedType || "application/octet-stream"
  }
}

function safeResponseContentType(contentType: string): string {
  return /^(?:image\/(?:jpeg|png|webp|gif|avif)|audio\/[a-z0-9.+-]+|video\/[a-z0-9.+-]+)$/i.test(contentType)
    ? contentType
    : "application/octet-stream"
}

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
  "Access-Control-Allow-Headers": "Range, Content-Type",
  "Access-Control-Expose-Headers": "Content-Range, Content-Length, Accept-Ranges",
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      ...CORS_HEADERS,
      "Access-Control-Max-Age": "86400",
    },
  })
}

export async function HEAD(req: NextRequest) {
  return handleMediaRequest(req, true)
}

export async function GET(req: NextRequest) {
  return handleMediaRequest(req, false)
}

async function handleMediaRequest(req: NextRequest, isHead: boolean) {
  try {
    const { searchParams } = new URL(req.url)
    const rawKey = searchParams.get("key") || searchParams.get("path")

    if (!rawKey) {
      return NextResponse.json({ error: "Missing media path" }, { status: 400 })
    }

    // Accept canonical R2 keys only. Do not "repair" traversal attempts.
    const key = rawKey.replace(/^\/+/, "")
    if (
      !key ||
      key.length > 1024 ||
      key.includes("\\") ||
      key.split("/").some((segment) => segment === ".." || segment === ".") ||
      /[\u0000-\u001f\u007f]/.test(key)
    ) {
      return NextResponse.json({ error: "Invalid media path" }, { status: 400 })
    }

    // Verify key targets memorials
    const memorialMatch = key.match(/^memorials\/([^/]+)\//)
    const quarantineMatch = key.match(/^quarantine\/([^/]+)\/(?:original|display)\//)
    const stagingMatch = key.match(/^contribution-staging\/([^/]+)\/[a-f0-9]{32}\/(?:original|display)\//i)
    const originalMatch = key.match(/^originals\/([^/]+)\//)
    const protectedMatch = quarantineMatch || stagingMatch || originalMatch
    const tempMatch = key.match(/^temp\/[^/]+\/([^/]+)\//)
    const range = req.headers.get("range")

    if (protectedMatch) {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      const { errorResponse } = await assertMemorialAdmin(protectedMatch[1], user.id)
      if (errorResponse) return errorResponse

      const stream = await getR2ObjectStream(key, range)
      const contentType = safeResponseContentType(getAccurateContentType(key, stream.contentType))
      const status = range && stream.contentRange ? 206 : 200
      const headers: Record<string, string> = {
        "Content-Type": contentType,
        "X-Content-Type-Options": "nosniff",
        "Accept-Ranges": "bytes",
        "Cache-Control": "private, no-store, must-revalidate",
      }
      if (stream.contentLength) headers["Content-Length"] = String(stream.contentLength)
      if (stream.contentRange) headers["Content-Range"] = stream.contentRange
      return new Response(isHead ? null : stream.body as any, { status, headers })
    }


    if (tempMatch) {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || user.id !== tempMatch[1]) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }
      const stream = await getR2ObjectStream(key, range)
      const contentType = safeResponseContentType(getAccurateContentType(key, stream.contentType))
      const headers: Record<string, string> = {
        "Content-Type": contentType,
        "X-Content-Type-Options": "nosniff",
        "Accept-Ranges": "bytes",
        "Cache-Control": "private, no-store, must-revalidate",
      }
      if (stream.contentLength) headers["Content-Length"] = String(stream.contentLength)
      if (stream.contentRange) headers["Content-Range"] = stream.contentRange
      return new Response(isHead ? null : stream.body as any, {
        status: range && stream.contentRange ? 206 : 200,
        headers,
      })
    }

    if (!memorialMatch) {
      if (
        key.startsWith("quarantine/") ||
        key.startsWith("contribution-staging/") ||
        key.startsWith("originals/")
      ) {
        return NextResponse.json({ error: "Media not found" }, { status: 404 })
      }
      // Non-memorial public assets
      const stream = await getR2ObjectStream(key, range)
      const contentType = safeResponseContentType(getAccurateContentType(key, stream.contentType))
      const status = range && stream.contentRange ? 206 : 200

      const headers: Record<string, string> = {
        "Content-Type": contentType,
        "X-Content-Type-Options": "nosniff",
        "Accept-Ranges": "bytes",
        "Cache-Control": "public, max-age=31536000, immutable",
        ...CORS_HEADERS,
      }

      if (stream.contentLength) {
        headers["Content-Length"] = String(stream.contentLength)
      }
      if (stream.contentRange) {
        headers["Content-Range"] = stream.contentRange
      }

      if (isHead) {
        return new Response(null, { status, headers })
      }

      return new Response(stream.body as any, { status, headers })
    }

    const memorialIdOrSlug = memorialMatch[1]
    const isUuid = UUID_REGEX.test(memorialIdOrSlug)

    const admin = getSupabaseAdminSafe() || (await createClient())
    let query = admin.from("memorials").select("id, slug, privacy, status, owner_id, access_pin_hash")
    query = isUuid ? query.eq("id", memorialIdOrSlug) : query.eq("slug", memorialIdOrSlug)
    const { data: memorial } = await query.maybeSingle()

    if (!memorial) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 })
    }

    // Access Control: private and unpublished memorial media requires a valid
    // PIN grant or an authenticated memorial administrator.
    if (memorial.privacy === "private" || memorial.status !== "published") {
      const cookieKey = memorial.slug || memorial.id
      const isPinUnlocked = verifyPinAccessToken(
        req.cookies.get(getMemorialPinCookieName(cookieKey))?.value,
        memorial.id,
        memorial.access_pin_hash
      )

      let isOwnerOrAdmin = false
      if (!isPinUnlocked || memorial.status !== "published") {
        const supabase = await createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          if (memorial.owner_id === user.id) {
            isOwnerOrAdmin = true
          } else {
            const { data: collab } = await admin
              .from("collaborators")
              .select("id, role")
              .eq("memorial_id", memorial.id)
              .eq("user_id", user.id)
              .eq("invitation_accepted", true)
              .maybeSingle()
            if (collab && (memorial.status === "published" || collab.role === "co_admin")) {
              isOwnerOrAdmin = true
            }
          }
        }
      }

      if (
        (memorial.status !== "published" && !isOwnerOrAdmin) ||
        (memorial.privacy === "private" && !isPinUnlocked && !isOwnerOrAdmin)
      ) {
        return NextResponse.json(
          { error: "Access to private memorial media requires unlocking with the family PIN." },
          { status: 403 }
        )
      }
    }

    const stream = await getR2ObjectStream(key, range)
    const contentType = safeResponseContentType(getAccurateContentType(key, stream.contentType))
    const status = range && stream.contentRange ? 206 : 200

    const headers: Record<string, string> = {
      "Content-Type": contentType,
      "X-Content-Type-Options": "nosniff",
      "Accept-Ranges": "bytes",
      ...CORS_HEADERS,
    }

    if (stream.contentLength) {
      headers["Content-Length"] = String(stream.contentLength)
    }

    if (stream.contentRange) {
      headers["Content-Range"] = stream.contentRange
    }

    // Private memorials must not be cached by public intermediate CDNs
    if (memorial.privacy === "private") {
      headers["Cache-Control"] = "private, no-cache, no-store, must-revalidate"
    } else {
      headers["Cache-Control"] = "public, max-age=31536000, immutable"
    }

    if (isHead) {
      return new Response(null, { status, headers })
    }

    return new Response(stream.body as any, {
      status,
      headers,
    })
  } catch (err: any) {
    if (err.name === "InvalidRange" || err.$metadata?.httpStatusCode === 416) {
      return new Response(null, {
        status: 416,
        headers: {
          "Content-Range": `bytes */${err.actualObjectSize || 0}`,
          "Accept-Ranges": "bytes",
          ...CORS_HEADERS,
        },
      })
    }
    console.error("Media delivery error:", err)
    return NextResponse.json({ error: "Failed to load media" }, { status: 500 })
  }
}
