import type { Metadata } from "next"
import { JsonLd } from "@/components/seo/json-ld"
import {
  CreateOnlineMemorialView,
  CREATE_MEMORIAL_FAQS,
} from "@/components/seo-pages/create-online-memorial/create-online-memorial-view"

export const metadata: Metadata = {
  title: "Create an Online Memorial for Someone You Love | Theirs",
  description:
    "Create a beautiful online memorial website for someone you love in minutes. Gather original photos, stories, and voice notes, and invite family to contribute memories.",
  alternates: {
    canonical: "https://theirs.page/create-online-memorial",
  },
  openGraph: {
    title: "Create an Online Memorial for Someone You Love | Theirs",
    description:
      "Bring together their photos, stories, voice notes, and tributes in one lasting place. Invite family and friends to contribute without account sign-ups.",
    url: "https://theirs.page/create-online-memorial",
    type: "website",
    siteName: "Theirs",
  },
  twitter: {
    card: "summary_large_image",
    title: "Create an Online Memorial for Someone You Love | Theirs",
    description:
      "Bring together their photos, stories, voice notes, and tributes in one lasting place. Invite family and friends to contribute without account sign-ups.",
  },
}

export default function Page() {
  // Structured Data (JSON-LD) for SEO: BreadcrumbList, WebPage, HowTo, FAQPage
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
            name: "Create an Online Memorial",
            item: "https://theirs.page/create-online-memorial",
          },
        ],
      },
      {
        "@type": "WebPage",
        "@id": "https://theirs.page/create-online-memorial",
        name: "Create an Online Memorial for Someone You Love",
        description:
          "Create a beautiful online memorial website for someone you love in minutes. Gather original photos, stories, and voice notes, and invite family to contribute memories.",
        url: "https://theirs.page/create-online-memorial",
        publisher: {
          "@type": "Organization",
          name: "Theirs",
          url: "https://theirs.page",
          logo: "https://theirs.page/theirs-logo.svg",
        },
      },
      {
        "@type": "HowTo",
        name: "How to Create an Online Memorial Website on Theirs",
        description:
          "Follow these three simple steps to create a beautiful, lasting online memorial website for someone you love.",
        totalTime: "PT2M",
        step: [
          {
            "@type": "HowToStep",
            position: 1,
            name: "Reserve Their Address and Enter Life Dates",
            text: "Type your loved one's name to claim a clean address (such as theirs.page/robert-carter) and add their birth and passing years.",
            url: "https://theirs.page/create-online-memorial#steps",
          },
          {
            "@type": "HowToStep",
            position: 2,
            name: "Add Portrait Photographs and Initial Life Story",
            text: "Upload favorite portraits in full original resolution without compression, and write a personal summary of who they were.",
            url: "https://theirs.page/create-online-memorial#steps",
          },
          {
            "@type": "HowToStep",
            position: 3,
            name: "Invite Family and Friends to Contribute Memories",
            text: "Share the link or QR code with relatives and friends. They can submit written tributes, photos, and voice notes from any device without creating an account.",
            url: "https://theirs.page/create-online-memorial#steps",
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: CREATE_MEMORIAL_FAQS.map((faq) => ({
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
      <JsonLd schema={pageSchema} id="create-memorial-schema" />
      <CreateOnlineMemorialView />
    </>
  )
}
