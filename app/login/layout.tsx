import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sign In — Theirs | Preserve a Life Story",
  description: "Sign in to Theirs to preserve, steward, and curate memorial pages for the people you love.",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  alternates: {
    canonical: "/login",
  },
  openGraph: {
    title: "Sign In — Theirs",
    description: "Sign in to Theirs to preserve, steward, and curate memorial pages for the people you love.",
    url: "https://theirs.page/login",
    siteName: "Theirs",
    type: "website",
  },
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Sign In",
    description: "Sign in to Theirs to preserve and curate memorial pages.",
    isPartOf: { "@type": "WebSite", name: "Theirs" },
    url: "https://theirs.page/login",
  }

  return (
    <section>
      {/* Route-scoped JSON-LD with standard script tag (never crashes nested layouts) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </section>
  )
}