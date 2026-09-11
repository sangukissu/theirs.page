import type { Metadata } from "next"
import { JsonLd } from "@/components/seo/json-ld"
import {
  BestOnlineMemorialWebsitesView,
  BEST_MEMORIALS_FAQS,
} from "@/components/seo-pages/best-online-memorial-websites/best-online-memorial-websites-view"

export const metadata: Metadata = {
  title: "Best Online Memorial Websites of 2026 | Comprehensive Guide | Theirs",
  description:
    "An objective comparison of the best online memorial websites in 2026. Compare pricing, advertising policies, guest access, and longevity across top memorial platforms.",
  alternates: {
    canonical: "https://theirs.page/best-online-memorial-websites",
  },
  openGraph: {
    title: "Best Online Memorial Websites of 2026 | Comprehensive Guide | Theirs",
    description:
      "An objective comparison of the best online memorial websites in 2026. Compare pricing, advertising policies, guest access, and longevity across top memorial platforms.",
    url: "https://theirs.page/best-online-memorial-websites",
    type: "website",
    siteName: "Theirs",
  },
  twitter: {
    card: "summary_large_image",
    title: "Best Online Memorial Websites of 2026 | Comprehensive Guide | Theirs",
    description:
      "An objective comparison of the best online memorial websites in 2026. Compare pricing, advertising policies, guest access, and longevity across top memorial platforms.",
  },
}

export default function BestMemorialWebsitesPage() {
  const pageSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: "https://theirs.page",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Best Online Memorial Websites",
            item: "https://theirs.page/best-online-memorial-websites",
          },
        ],
      },
      {
        "@type": "WebPage",
        "@id": "https://theirs.page/best-online-memorial-websites",
        name: "Best Online Memorial Websites of 2026",
        description:
          "An objective comparison of the best online memorial websites in 2026. Compare pricing, advertising policies, guest access, and longevity across top memorial platforms.",
        url: "https://theirs.page/best-online-memorial-websites",
        publisher: {
          "@type": "Organization",
          name: "Theirs",
          url: "https://theirs.page",
          logo: "https://theirs.page/theirs-logo.svg",
        },
      },
      {
        "@type": "FAQPage",
        mainEntity: BEST_MEMORIALS_FAQS.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
          },
        })),
      },
    ],
  }

  return (
    <>
      <JsonLd schema={pageSchema} id="best-memorials-schema" />
      <BestOnlineMemorialWebsitesView />
    </>
  )
}
