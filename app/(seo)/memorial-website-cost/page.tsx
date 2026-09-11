import type { Metadata } from "next"
import { JsonLd } from "@/components/seo/json-ld"
import {
  MemorialWebsiteCostView,
  MEMORIAL_COST_FAQS,
} from "@/components/seo-pages/memorial-website-cost/memorial-website-cost-view"

export const metadata: Metadata = {
  title: "Memorial Website Cost & Pricing Guide (2026) | Theirs",
  description:
    "How much does an online memorial website cost? Compare free plans, one-time lifetime fees, and subscription costs. Learn why families avoid recurring monthly renewals.",
  alternates: {
    canonical: "https://theirs.page/memorial-website-cost",
  },
  openGraph: {
    title: "Memorial Website Cost & Pricing Guide (2026) | Theirs",
    description:
      "How much does an online memorial website cost? Compare free plans, one-time lifetime fees, and subscription costs. Learn why families avoid recurring monthly renewals.",
    url: "https://theirs.page/memorial-website-cost",
    type: "website",
    siteName: "Theirs",
  },
  twitter: {
    card: "summary_large_image",
    title: "Memorial Website Cost & Pricing Guide (2026) | Theirs",
    description:
      "How much does an online memorial website cost? Compare free plans, one-time lifetime fees, and subscription costs. Learn why families avoid recurring monthly renewals.",
  },
}

export default function MemorialCostPage() {
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
            name: "Memorial Website Cost",
            item: "https://theirs.page/memorial-website-cost",
          },
        ],
      },
      {
        "@type": "WebPage",
        "@id": "https://theirs.page/memorial-website-cost",
        name: "Memorial Website Cost & Pricing Guide",
        description:
          "How much does an online memorial website cost? Compare free plans, one-time lifetime fees, and subscription costs. Learn why families avoid recurring monthly renewals.",
        url: "https://theirs.page/memorial-website-cost",
        publisher: {
          "@type": "Organization",
          name: "Theirs",
          url: "https://theirs.page",
          logo: "https://theirs.page/theirs-logo.svg",
        },
      },
      {
        "@type": "FAQPage",
        mainEntity: MEMORIAL_COST_FAQS.map((faq) => ({
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
      <JsonLd schema={pageSchema} id="memorial-cost-schema" />
      <MemorialWebsiteCostView />
    </>
  )
}
