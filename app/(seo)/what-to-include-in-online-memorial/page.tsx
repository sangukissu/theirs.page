import type { Metadata } from "next"
import { JsonLd } from "@/components/seo/json-ld"
import {
  WhatToIncludeInOnlineMemorialView,
  WHAT_TO_INCLUDE_FAQS,
} from "@/components/seo-pages/what-to-include-in-online-memorial/what-to-include-in-online-memorial-view"

export const metadata: Metadata = {
  title: "What to Include in an Online Memorial Website: Checklist & Guide | Theirs",
  description:
    "A gentle, comprehensive guide on what to include in an online memorial website. Practical checklist for photos, life stories, voicemails, timeline milestones, and family tributes.",
  alternates: {
    canonical: "https://theirs.page/what-to-include-in-online-memorial",
  },
  openGraph: {
    title: "What to Include in an Online Memorial Website: Checklist & Guide | Theirs",
    description:
      "A gentle, comprehensive guide on what to include in an online memorial website. Practical checklist for photos, life stories, voicemails, timeline milestones, and family tributes.",
    url: "https://theirs.page/what-to-include-in-online-memorial",
    type: "website",
    siteName: "Theirs",
  },
  twitter: {
    card: "summary_large_image",
    title: "What to Include in an Online Memorial Website: Checklist & Guide | Theirs",
    description:
      "A gentle, comprehensive guide on what to include in an online memorial website. Practical checklist for photos, life stories, voicemails, timeline milestones, and family tributes.",
  },
}

export default function WhatToIncludePage() {
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
            name: "What to Include in an Online Memorial",
            item: "https://theirs.page/what-to-include-in-online-memorial",
          },
        ],
      },
      {
        "@type": "WebPage",
        "@id": "https://theirs.page/what-to-include-in-online-memorial",
        name: "What to Include in an Online Memorial Website: Checklist & Guide",
        description:
          "A gentle, comprehensive guide on what to include in an online memorial website. Practical checklist for photos, life stories, voicemails, timeline milestones, and family tributes.",
        url: "https://theirs.page/what-to-include-in-online-memorial",
        publisher: {
          "@type": "Organization",
          name: "Theirs",
          url: "https://theirs.page",
          logo: "https://theirs.page/theirs-logo.svg",
        },
      },
      {
        "@type": "FAQPage",
        mainEntity: WHAT_TO_INCLUDE_FAQS.map((faq) => ({
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
      <JsonLd schema={pageSchema} id="what-to-include-schema" />
      <WhatToIncludeInOnlineMemorialView />
    </>
  )
}
