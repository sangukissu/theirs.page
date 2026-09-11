export interface GiftFaqItem {
  id: string
  question: string
  answer: string
}

export const GIFT_FAQS: GiftFaqItem[] = [
  {
    id: "details-needed",
    question: "What information do I need to gift an online memorial?",
    answer:
      "You only need your name and email, and the recipient’s name and email address. You do not need to know the dates of birth and passing, write an obituary, or upload photos. The recipient personalizes everything at their own pace when they feel ready.",
  },
  {
    id: "does-it-expire",
    question: "Does the memorial gift entitlement ever expire?",
    answer:
      "Never. Grief does not follow a strict timetable. Whether the recipient claims their gift this week, next month, or a year from now, their Complete memorial entitlement remains permanently active and waiting for them.",
  },
  {
    id: "flowers-comparison",
    question: "Why is an online memorial website a meaningful sympathy gift?",
    answer:
      "Sympathy flowers are thoughtful but typically wither within four or five days. A Complete memorial website provides an enduring sanctuary where the entire family can gather original-resolution photos, hear voice recordings, read heartfelt tributes from across the world, and preserve their loved one’s full story for future generations.",
  },
  {
    id: "privacy-and-access",
    question: "Will I have administrative access or edit rights to their memorial?",
    answer:
      "No. For privacy, dignity, and emotional boundaries, the memorial belongs entirely to the recipient once claimed. You will not have access to edit or manage their memorial unless the recipient specifically invites you as a co-admin or collaborator from their dashboard.",
  },
  {
    id: "existing-memorial",
    question: "Can they apply this gift to a memorial they have already started?",
    answer:
      "Yes. When claiming the gift, the recipient can choose to either create a brand-new memorial or apply the Complete upgrade to any free or draft memorial already present in their Theirs account.",
  },
  {
    id: "subscriptions",
    question: "Are there any recurring subscriptions or maintenance fees?",
    answer:
      "None. Gifting a Complete memorial is a single, one-time payment of $179. The memorial is permanently ad-free, with no renewal fees, storage limits, or hidden subscriptions ever charged to either you or the family.",
  },
  {
    id: "delivery-methods",
    question: "Can I deliver the claim link personally in a card or message?",
    answer:
      "Yes. In addition to the automated email invitation sent to the recipient, you will receive an immediate receipt containing the private backup claim link. You can easily copy this link into a physical sympathy card, letter, or text message.",
  },
  {
    id: "refund-policy",
    question: "What if the family already created a paid memorial?",
    answer:
      "If the recipient already has a Complete memorial or prefers not to use the gift, we offer a hassle-free refund within 30 days of purchase or can reassign the entitlement. Simply contact us at support@theirs.page.",
  },
]
