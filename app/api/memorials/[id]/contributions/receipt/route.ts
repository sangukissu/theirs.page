import crypto from "crypto"
import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdminSafe } from "@/utils/supabase/admin"
import { checkDurableRateLimit } from "@/lib/turnstile"
import { extractManagedR2Key, getR2SignedUrl, resolveMediaUrl } from "@/lib/r2"

interface RouteContext {
  params: Promise<{ id: string }>
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const RECEIPT_REGEX = /^cr_[A-Za-z0-9_-]{43}$/

function clientIp(req: NextRequest): string {
  return req.headers.get("cf-connecting-ip") ||
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "127.0.0.1"
}

function noStoreJson(body: object, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "private, no-store" },
  })
}

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const token = req.nextUrl.searchParams.get("token") || ""
    if (!RECEIPT_REGEX.test(token)) {
      return noStoreJson({ error: "Invalid receipt token." }, 400)
    }

    const rateLimit = await checkDurableRateLimit(
      "contribution_receipt",
      `${clientIp(req)}:${id}`,
      60,
      600
    )
    if (!rateLimit.allowed) {
      return noStoreJson({ error: "Too many receipt checks. Please try again shortly." }, 429)
    }

    const admin = getSupabaseAdminSafe()
    if (!admin) return noStoreJson({ error: "Receipt checks are temporarily unavailable." }, 503)

    let memorialQuery = admin.from("memorials").select("id")
    memorialQuery = UUID_REGEX.test(id) ? memorialQuery.eq("id", id) : memorialQuery.eq("slug", id)
    const { data: memorial } = await memorialQuery.maybeSingle()
    if (!memorial) return noStoreJson({ status: "not_published", published: false }, 404)

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex")
    let { data: memory, error } = await admin
      .from("memories")
      .select("id, status, photo_urls")
      .eq("memorial_id", memorial.id)
      .eq("receipt_token", tokenHash)
      .maybeSingle()

    // Temporary compatibility for receipts created by the previous implementation.
    if (!memory && !error) {
      const legacy = await admin.from("memories")
        .select("id, status, photo_urls")
        .eq("memorial_id", memorial.id)
        .eq("receipt_token", token)
        .maybeSingle()
      memory = legacy.data
      error = legacy.error
    }

    if (error || !memory) {
      return noStoreJson({ status: "not_published", published: false }, 404)
    }

    if (memory.status === "approved") {
      return noStoreJson({ status: "published", published: true })
    }
    if (memory.status === "rejected" || memory.status === "blocked") {
      return noStoreJson({ status: "not_published", published: false })
    }

    const urls = Array.isArray(memory.photo_urls) ? memory.photo_urls : []
    const refreshedPhotoUrls = await Promise.all(urls.map(async (rawUrl: unknown) => {
      if (typeof rawUrl !== "string") return ""
      const key = extractManagedR2Key(rawUrl)
      if (key?.startsWith(`quarantine/${memorial.id}/display/`)) {
        return getR2SignedUrl(key, 60 * 60)
      }
      return resolveMediaUrl(rawUrl)
    }))

    return noStoreJson({
      status: "sent_to_family",
      published: false,
      photo_urls: refreshedPhotoUrls.filter(Boolean),
    })
  } catch (error) {
    console.error("Receipt status lookup error:", error)
    return noStoreJson({ error: "Unable to verify receipt status." }, 500)
  }
}
