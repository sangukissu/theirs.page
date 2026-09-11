import type { Metadata } from "next"
import { JsonLd } from "@/components/seo/json-ld"
import {
  OnlineMemorialVsObituaryView,
  MEMORIAL_VS_OBITUARY_FAQS,
} from "@/components/seo-pages/online-memorial-vs-obituary/online-memorial-vs-obituary-view"

export const metadata: Metadata = {
  title: "Online Memorial vs Obituary: Key Differences & Comparison | Theirs",
  description:
    "Understand the key differences between an obituary and an online memorial website. Compare costs, collaboration, lifespan, media limits, and how families use both.",
  alternates: {
    canonical: "https://theirs.page/online-memorial-vs-obituary",
  },
  openGraph: {
    title: "Online Memorial vs Obituary: Key Differences & Comparison | Theirs",
    description:
      "Understand the key differences between an obituary and an online memorial website. Compare costs, collaboration, lifespan, media limits, and how families use both.",
    url: "https://theirs.page/online-memorial-vs-obituary",
    type: "website",
    siteName: "Theirs",
  },
  twitter: {
    card: "summary_large_image",
    title: "Online Memorial vs Obituary: Key Differences & Comparison | Theirs",
    description:
      "Understand the key differences between an obituary and an online memorial website. Compare costs, collaboration, lifespan, media limits, and how families use both.",
  },
}

export default function OnlineMemorialVsObituaryPage() {
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
            name: "Online Memorial vs Obituary",
            item: "https://theirs.page/online-memorial-vs-obituary",
          },
        ],
      },
      {
        "@type": "WebPage",
        "@id": "https://theirs.page/online-memorial-vs-obituary",
        name: "Online Memorial vs Obituary: Key Differences & Comparison",
        description:
          "Understand the key differences between an obituary and an online memorial website. Compare costs, collaboration, lifespan, media limits, and how families use both.",
        url: "https://theirs.page/online-memorial-vs-obituary",
        publisher: {
          "@type": "Organization",
          name: "Theirs",
          url: "https://theirs.page",
          logo: "https://theirs.page/theirs-logo.svg",
        },
      },
      {
        "@type": "FAQPage",
        mainEntity: MEMORIAL_VS_OBITUARY_FAQS.map((faq) => ({
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
      <JsonLd schema={pageSchema} id="memorial-vs-obituary-schema" />
      <OnlineMemorialVsObituaryView />
    </>
  )
}
