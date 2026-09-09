import type React from "react"
import type { Metadata } from "next"
import { Inter_Tight, Inter } from "next/font/google"
import { GeistMono } from "geist/font/mono"
import { Toaster } from "@/components/ui/toast"
import NetworkStatus from "@/components/network-status"
import { Suspense } from "react"
import { NavigationProgress } from "@/components/navigation-progress"
import "./globals.css"

const interTight = Inter_Tight({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-heading",
  weight: ["400", "500", "600"],
})

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
  weight: ["400", "500"],
})

import { SEO_CONFIG } from "@/lib/seo/config"

export const metadata: Metadata = {
  title: {
    default: SEO_CONFIG.defaultTitle,
    template: SEO_CONFIG.titleTemplate,
  },
  description: SEO_CONFIG.defaultDescription,
  metadataBase: new URL(SEO_CONFIG.canonicalOrigin),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: SEO_CONFIG.defaultTitle,
    description: SEO_CONFIG.defaultDescription,
    url: SEO_CONFIG.canonicalOrigin,
    siteName: SEO_CONFIG.siteName,
    locale: SEO_CONFIG.locale,
    type: "website",
    images: [
      {
        url: SEO_CONFIG.defaultOgImage,
        width: 1200,
        height: 630,
        alt: SEO_CONFIG.siteName,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SEO_CONFIG.defaultTitle,
    description: SEO_CONFIG.defaultDescription,
    images: [SEO_CONFIG.defaultOgImage],
  },
  robots: {
    index: true,
    follow: true,
  },
  appleWebApp: {
    title: SEO_CONFIG.siteName,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${interTight.variable} ${inter.variable} ${GeistMono.variable}`}
    >
      <head>
        <meta name="apple-mobile-web-app-title" content="Theirs" />
        <meta name="theme-color" content="#f6f6f6" />
        <meta name="color-scheme" content="light" />
        <link rel="icon" type="image/svg+xml" href="/placeholder-logo.svg" />
      </head>
      <body className="antialiased bg-white text-[#292929] selection:bg-[#305dde]/15 selection:text-[#305dde]">
        <Suspense fallback={null}>
          <NavigationProgress />
        </Suspense>
        {children}
        <NetworkStatus />
        <Toaster />
      </body>
    </html>
  )
}
