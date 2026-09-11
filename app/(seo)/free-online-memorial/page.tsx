import type { Metadata } from "next"
import { JsonLd } from "@/components/seo/json-ld"
import {
  FreeOnlineMemorialView,
  FREE_MEMORIAL_FAQS,
} from "@/components/seo-pages/free-online-memorial/free-online-memorial-view"

export const metadata: Metadata = {
  title: "Free Online Memorial Website | Create a Memorial | Theirs",
  description:
    "Create and publish a free online memorial with their portrait, story, up to 5 photographs and tributes from family and friends. No credit card required, ad-free.",
  alternates: {
    canonical: "https://theirs.page/free-online-memorial",
  },
  openGraph: {
    title: "Free Online Memorial Website | Create a Memorial | Theirs",
    description:
      "Create and publish a free online memorial with their portrait, story, up to 5 photographs and tributes from family and friends. No credit card required, ad-free.",
    url: "https://theirs.page/free-online-memorial",
    type: "website",
    siteName: "Theirs",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Online Memorial Website | Create a Memorial | Theirs",
    description:
      "Create and publish a free online memorial with their portrait, story, up to 5 photographs and tributes from family and friends. No credit card required, ad-free.",
  },
}

export default function FreeMemorialPage() {
  // Structured Data (JSON-LD) for SEO: BreadcrumbList, WebPage, FAQPage
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
            name: "Free Online Memorial",
            item: "https://theirs.page/free-online-memorial",
          },
        ],
      },
      {
        "@type": "WebPage",
        "@id": "https://theirs.page/free-online-memorial",
        name: "Free Online Memorial Website",
        description:
          "Create and publish a free online memorial with their portrait, story, up to 5 photographs and tributes from family and friends. No credit card required, ad-free.",
        url: "https://theirs.page/free-online-memorial",
        publisher: {
          "@type": "Organization",
          name: "Theirs",
          url: "https://theirs.page",
          logo: "https://theirs.page/theirs-logo.svg",
        },
      },
      {
        "@type": "FAQPage",
        mainEntity: FREE_MEMORIAL_FAQS.map((faq) => ({
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
      <JsonLd schema={pageSchema} id="free-memorial-schema" />
      <FreeOnlineMemorialView />
    </>
  )
}
