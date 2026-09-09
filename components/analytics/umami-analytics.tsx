import Script from "next/script"
import { SEO_CONFIG } from "@/lib/seo/config"

interface UmamiAnalyticsProps {
  websiteId?: string
  src?: string
}

export function UmamiAnalytics({
  websiteId = SEO_CONFIG.analytics.umamiWebsiteId,
  src = SEO_CONFIG.analytics.umamiScriptUrl,
}: UmamiAnalyticsProps = {}) {
  const effectiveWebsiteId =
    websiteId || process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID || "ed3a82b5-8b9e-44f5-8a8a-aa2cc5e31783"
  const effectiveSrc =
    src || process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL || "https://cloud.umami.is/script.js"

  if (!effectiveWebsiteId) return null

  return (
    <Script
      defer
      src={effectiveSrc}
      data-website-id={effectiveWebsiteId}
      strategy="afterInteractive"
    />
  )
}
