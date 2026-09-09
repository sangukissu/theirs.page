"use client"

import Script from "next/script"
import { usePathname, useSearchParams } from "next/navigation"
import { useEffect, Suspense } from "react"
import { SEO_CONFIG } from "@/lib/seo/config"

interface AnalyticsProps {
  gaId?: string
  gtmId?: string
  clarityId?: string
}

function AnalyticsPageTracker({ gaId }: { gaId?: string }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!gaId || typeof window === "undefined" || !(window as any).gtag) return

    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "")
    ;(window as any).gtag("config", gaId, {
      page_path: url,
    })
  }, [pathname, searchParams, gaId])

  return null
}

export function GoogleAnalytics({
  gaId = SEO_CONFIG.analytics.gaMeasurementId,
  gtmId = SEO_CONFIG.analytics.gtmId,
  clarityId = SEO_CONFIG.analytics.clarityId,
}: AnalyticsProps) {
  const effectiveGaId = gaId || process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || ""
  const effectiveGtmId = gtmId || process.env.NEXT_PUBLIC_GTM_ID || ""
  const effectiveClarityId = clarityId || process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID || ""

  return (
    <>
      {/* Route change pageview tracker */}
      {effectiveGaId && (
        <Suspense fallback={null}>
          <AnalyticsPageTracker gaId={effectiveGaId} />
        </Suspense>
      )}

      {/* Google Analytics 4 (gtag.js) */}
      {effectiveGaId && (
        <>
          <Script
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${effectiveGaId}`}
          />
          <Script
            id="google-analytics-init"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${effectiveGaId}', {
                  page_path: window.location.pathname,
                  send_page_view: true
                });
              `,
            }}
          />
        </>
      )}

      {/* Google Tag Manager (GTM) */}
      {effectiveGtmId && (
        <Script
          id="google-tag-manager"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${effectiveGtmId}');
            `,
          }}
        />
      )}

      {/* Microsoft Clarity */}
      {effectiveClarityId && (
        <Script
          id="microsoft-clarity"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "${effectiveClarityId}");
            `,
          }}
        />
      )}
    </>
  )
}
