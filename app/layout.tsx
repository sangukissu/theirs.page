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

export const metadata: Metadata = {
  title: {
    default: "Theirs — A place on the internet dedicated to a human life",
    template: "%s | Theirs",
  },
  description:
    "A life archive preserving the stories, voice, memories, and relationships of the people we love.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://theirs.page"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Theirs — A place on the internet dedicated to a human life",
    description:
      "A life archive preserving the stories, voice, memories, and relationships of the people we love.",
    url: "https://theirs.page",
    siteName: "Theirs",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Theirs — A place on the internet dedicated to a human life",
    description:
      "A life archive preserving the stories, voice, memories, and relationships of the people we love.",
  },
  robots: {
    index: true,
    follow: true,
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
