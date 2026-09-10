export interface FaqItem {
  id: string
  question: string
  answer: string
}

/**
 * Audited single source of truth for Theirs FAQs.
 * Consumed by both the visible UI (components/theirs/faq.tsx) and structured data schema (lib/seo/schema.ts).
 */
export const FAQS: readonly FaqItem[] = [
  {
    id: "what-is-an-online-memorial",
    question: "What is an online memorial website?",
    answer:
      "An online memorial is a dedicated place to remember someone who has died through their photos, stories, tributes and important moments. Unlike a traditional obituary, which is usually a short death notice or biography, a memorial on Theirs can grow over time as family and friends add their own memories.",
  },
  {
    id: "free-memorial",
    question: "Can I create an online memorial for free?",
    answer:
      "Yes. You can create and publish a memorial on Theirs for free, with their portrait, story, guest tributes and up to 5 gallery photos. No credit card is required to start. If your family later wants more photos, video, voice recordings, privacy controls and other complete memorial features, you can upgrade that memorial.",
  },
  {
    id: "family-contributions",
    question: "Can family and friends add their own memories and photos?",
    answer:
      "Yes. Share the memorial with the people who knew them and they can contribute tributes, stories, photos and other memories. Their contributions stay connected to who shared them, so the memorial becomes a collection of different perspectives on the same life. For ordinary tributes and photo memories, contributors don't need to create an account.",
  },
  {
    id: "control-and-moderation",
    question: "Do I control what other people add to the memorial?",
    answer:
      "Yes. You remain the caretaker of the memorial. Contributions from visitors can be reviewed before they appear, so sharing the page with a wider family doesn't mean giving up control of it. You can approve or decline contributions and choose what belongs on the memorial.",
  },
  {
    id: "privacy-controls",
    question: "Can an online memorial be private?",
    answer:
      "Yes. With Complete, you can choose how the memorial is shared: Public for anyone to visit, Unlisted so it isn't intended for search discovery but anyone with the link can open it, or Private for access-controlled sharing. You can change the setting as your family's needs change.",
  },
  {
    id: "pricing-no-subscription",
    question: "Is Theirs a subscription? How much does a memorial cost?",
    answer:
      "There is no monthly subscription. Theirs is free to start, and Complete costs $179 once per memorial. You don't need to keep a subscription active every month or year to retain the Complete features you've purchased.",
  },
  {
    id: "ownership-and-export",
    question: "Who owns the photos and memories we upload? Can we download them?",
    answer:
      "Your family's content remains yours. Theirs doesn't take ownership of the photos, stories or recordings you upload. With Complete, you can export the memorial and its original media into a family archive, so your memories aren't locked inside Theirs.",
  },
  {
    id: "successor-caretaker",
    question: "What happens to the memorial if I can no longer manage it?",
    answer:
      "You can choose another trusted person to help care for the memorial and designate a successor caretaker for the future. The goal is for responsibility for the memorial to be able to pass within the family rather than depend on one account holder indefinitely.",
  },
  {
    id: "lifespan-and-permanence",
    question: "How long will an online memorial stay online?",
    answer:
      "Theirs is built for long-term remembrance, but we don't think it is responsible to promise that any online service will exist “forever.” Complete memorials don't depend on an ongoing monthly subscription, and you can export your family's memorial and original files so Theirs never has to be the only copy of something irreplaceable.",
  },
  {
    id: "photo-restorations",
    question: "Can Theirs restore old or damaged photos?",
    answer:
      "Yes. Theirs Pro Plan includes 5 photo restorations for faded, scratched or damaged family photographs. Once restored, you can add the photo directly to the memorial."
  },
] as const
