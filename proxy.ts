import { NextResponse, type NextRequest } from "next/server"
import { updateSession } from "@/utils/supabase/middleware"
import {
  securityMiddleware,
  validateOrigin,
  isMaliciousProbe,
  isZeroRoiScraper,
  detectSuspiciousActivity,
} from "@/middleware/security"

/**
 * Legacy BringBack photo restoration product routes to retire.
 * Redirects visitors permanently to https://theirs.page/ so old links
 * and search indices are smoothly onboarded, while preventing these paths
 * from falling through to the dynamic memorial lookup app/[slug]/page.tsx.
 */
const RETIRED_BRINGBACK_PAGES = [
  "/old-photo-restoration",
  "/colorize-photos",
  "/denoise-photos",
  "/ai-photo-animation",
  "/ai-family-portrait",
  "/add-person-to-photo",
  "/remove-person-from-photo",
  "/family-memory-book",
  "/restoration-benchmark",
  "/restore",
  "/m",
  "/features",
  "/compare",
  "/guides",
  "/examples",
  "/blog",
  "/app",
  "/referral",
  "/refunds",
]

/**
 * Retired BringBack backend API endpoints.
 * Responds with HTTP 410 Gone to cleanly inform obsolete clients.
 */
const RETIRED_BRINGBACK_APIS = [
  "/api/memory-books",
  "/api/referrals",
  "/api/add-person",
  "/api/remove-person",
  "/api/christmas-portrait",
  "/api/family-portrait",
  "/api/rerestore",
  "/api/fal/animate",
  "/api/fal/enhance",
  "/api/nostalgic-hug",
  "/api/video-proxy",
]

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // media.theirs.page is an application-controlled delivery hostname, not a
  // direct public R2 bucket. Only canonical memorial display keys enter the
  // media authorization route; quarantine, originals, temp and restoration
  // paths never do.
  if (request.nextUrl.hostname.toLowerCase() === "media.theirs.page") {
    if (!["GET", "HEAD", "OPTIONS"].includes(request.method)) {
      return new Response("Method Not Allowed", {
        status: 405,
        headers: { Allow: "GET, HEAD, OPTIONS" },
      })
    }
    let key: string
    try {
      key = decodeURIComponent(pathname).replace(/^\/+/, "")
    } catch {
      return new Response("Not Found", { status: 404 })
    }
    if (
      !/^memorials\/[a-z0-9_-]+\/.+/i.test(key) ||
      key.length > 1024 ||
      key.includes("\\") ||
      key.split("/").some((segment) => segment === "." || segment === "..") ||
      /[\u0000-\u001f\u007f]/.test(key)
    ) {
      return new Response("Not Found", { status: 404 })
    }

    const mediaUrl = request.nextUrl.clone()
    mediaUrl.pathname = "/api/media"
    mediaUrl.search = ""
    mediaUrl.searchParams.set("key", key)
    return NextResponse.rewrite(mediaUrl)
  }

  // 1. Block malicious vulnerability scanner probes & path traversal early
  if (isMaliciousProbe(pathname)) {
    return new Response("Not Found", {
      status: 404,
      headers: {
        "Content-Type": "text/plain",
        "X-Robots-Tag": "noindex, nofollow, noarchive",
      },
    })
  }

  // 2. Block aggressive zero-ROI scrapers from consuming serverless capacity
  const userAgent = request.headers.get("user-agent") || ""
  if (isZeroRoiScraper(userAgent)) {
    return new Response("Access Denied", {
      status: 403,
      headers: {
        "Content-Type": "text/plain",
        "X-Robots-Tag": "noindex, nofollow, noarchive",
      },
    })
  }

  // 3. Handle retired BringBack APIs -> return HTTP 410 Gone
  const isRetiredApi = RETIRED_BRINGBACK_APIS.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  )
  if (isRetiredApi) {
    return NextResponse.json(
      { error: "This legacy BringBack endpoint has been retired." },
      {
        status: 410,
        headers: {
          "Cache-Control": "public, max-age=86400",
          "X-Robots-Tag": "noindex, nofollow",
        },
      }
    )
  }

  // 4. Handle retired BringBack web pages -> 301 Permanent Redirect to homepage
  const isRetiredPage = RETIRED_BRINGBACK_PAGES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  )
  if (isRetiredPage) {
    const destination = new URL("/", request.url)
    return NextResponse.redirect(destination, {
      status: 301,
      headers: {
        "Cache-Control": "public, max-age=86400",
      },
    })
  }

  // 5. Apply core security headers & production HTTPS redirection
  const securityResponse = securityMiddleware(request)
  if (securityResponse.status !== 200) {
    return securityResponse
  }

  // 6. Security controls for API routes
  if (pathname.startsWith("/api/")) {
    const isWebhook =
      pathname.startsWith("/api/webhooks/") ||
      pathname.includes("/webhook")

    // For non-webhook APIs, reject automated exploit tools / blank user agents
    if (!isWebhook && detectSuspiciousActivity(request)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Origin validation for state-changing operations (CSRF mitigation)
    if (["POST", "PUT", "DELETE", "PATCH"].includes(request.method) && !isWebhook) {
      if (!validateOrigin(request)) {
        return NextResponse.json({ error: "Invalid origin" }, { status: 403 })
      }
    }
  }

  // 7. Supabase session handling and defense-in-depth for authenticated areas
  const isProtectedArea =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api/admin") ||
    pathname === "/login"

  if (isProtectedArea) {
    const authResponse = await updateSession(request)

    // Ensure protected surfaces are never indexed or cached
    authResponse.headers.set(
      "X-Robots-Tag",
      "noindex, nofollow, noarchive, nosnippet, noimageindex, notranslate"
    )
    authResponse.headers.set(
      "Cache-Control",
      "private, no-store, max-age=0, must-revalidate"
    )
    authResponse.headers.set("Referrer-Policy", "no-referrer")

    return authResponse
  }

  return securityResponse
}

// Intercept application routes and APIs, excluding static assets and media files
export const config = {
  matcher: [
    {
      source: "/:path*",
      has: [{ type: "host", value: "media.theirs.page" }],
    },
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|mp3|mp4|webm|woff|woff2|ttf|otf|css|js)$).*)",
  ],
}

export default proxy
