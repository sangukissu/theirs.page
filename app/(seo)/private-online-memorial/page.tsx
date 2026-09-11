import type { Metadata } from "next"
import { JsonLd } from "@/components/seo/json-ld"
import {
  PrivateOnlineMemorialView,
  PRIVATE_MEMORIAL_FAQS,
} from "@/components/seo-pages/private-online-memorial/private-online-memorial-view"

export const metadata: Metadata = {
  title: "Private Online Memorial Websites & Password Protection | Theirs",
  description:
    "Create a private, password-protected online memorial for your loved one. Safeguard family memories with unlisted URLs, 4-digit PIN protection, and caretaker moderation.",
  alternates: {
    canonical: "https://theirs.page/private-online-memorial",
  },
  openGraph: {
    title: "Private Online Memorial Websites & Password Protection | Theirs",
    description:
      "Create a private, password-protected online memorial for your loved one. Safeguard family memories with unlisted URLs, 4-digit PIN protection, and caretaker moderation.",
    url: "https://theirs.page/private-online-memorial",
    type: "website",
    siteName: "Theirs",
  },
  twitter: {
    card: "summary_large_image",
    title: "Private Online Memorial Websites & Password Protection | Theirs",
    description:
      "Create a private, password-protected online memorial for your loved one. Safeguard family memories with unlisted URLs, 4-digit PIN protection, and caretaker moderation.",
  },
}

export default function PrivateMemorialPage() {
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
            name: "Private Online Memorial",
            item: "https://theirs.page/private-online-memorial",
          },
        ],
      },
      {
        "@type": "WebPage",
        "@id": "https://theirs.page/private-online-memorial",
        name: "Private Online Memorial Websites & Password Protection",
        description:
          "Create a private, password-protected online memorial for your loved one. Safeguard family memories with unlisted URLs, 4-digit PIN protection, and caretaker moderation.",
        url: "https://theirs.page/private-online-memorial",
        publisher: {
          "@type": "Organization",
          name: "Theirs",
          url: "https://theirs.page",
          logo: "https://theirs.page/theirs-logo.svg",
        },
      },
      {
        "@type": "FAQPage",
        mainEntity: PRIVATE_MEMORIAL_FAQS.map((faq) => ({
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
      <JsonLd schema={pageSchema} id="private-memorial-schema" />
      <PrivateOnlineMemorialView />
    </>
  )
}
