import type { Metadata } from "next"
import { JsonLd } from "@/components/seo/json-ld"
import {
  MemorialWebsiteExamplesView,
  MEMORIAL_EXAMPLES_FAQS,
} from "@/components/seo-pages/memorial-website-examples/memorial-website-examples-view"

export const metadata: Metadata = {
  title: "Memorial Website Examples & Design Ideas | Theirs",
  description:
    "Explore real memorial website examples and layout ideas. See how families bring together photos, life stories, chronological milestones, and tributes in a modern online memorial.",
  alternates: {
    canonical: "https://theirs.page/memorial-website-examples",
  },
  openGraph: {
    title: "Memorial Website Examples & Design Ideas | Theirs",
    description:
      "Explore real memorial website examples and layout ideas. See how families bring together photos, life stories, chronological milestones, and tributes in a modern online memorial.",
    url: "https://theirs.page/memorial-website-examples",
    type: "website",
    siteName: "Theirs",
  },
  twitter: {
    card: "summary_large_image",
    title: "Memorial Website Examples & Design Ideas | Theirs",
    description:
      "Explore real memorial website examples and layout ideas. See how families bring together photos, life stories, chronological milestones, and tributes in a modern online memorial.",
  },
}

export default function MemorialWebsiteExamplesPage() {
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
            name: "Memorial Website Examples",
            item: "https://theirs.page/memorial-website-examples",
          },
        ],
      },
      {
        "@type": "WebPage",
        "@id": "https://theirs.page/memorial-website-examples",
        name: "Memorial Website Examples & Design Ideas",
        description:
          "Explore real memorial website examples and layout ideas. See how families bring together photos, life stories, chronological milestones, and tributes in a modern online memorial.",
        url: "https://theirs.page/memorial-website-examples",
        publisher: {
          "@type": "Organization",
          name: "Theirs",
          url: "https://theirs.page",
          logo: "https://theirs.page/theirs-logo.svg",
        },
      },
      {
        "@type": "FAQPage",
        mainEntity: MEMORIAL_EXAMPLES_FAQS.map((faq) => ({
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
      <JsonLd schema={pageSchema} id="memorial-examples-schema" />
      <MemorialWebsiteExamplesView />
    </>
  )
}
