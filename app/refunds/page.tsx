import type { Metadata } from "next"
import Link from "next/link"
import { LegalPageLayout } from "@/components/legal/legal-page-layout"

export const metadata: Metadata = {
  title: "Refund Policy",
  description:
    "Fair, transparent 14-day money-back guarantee for Theirs Complete memorial upgrades.",
  alternates: {
    canonical: "/refunds",
  },
}

export default function RefundsPage() {
  return (
    <LegalPageLayout
      title="Refund Policy"
      description="We believe in fair, dignified pricing. You can try Theirs completely free before paying, and all purchases of Theirs Complete are protected by our 14-day money-back guarantee."
      lastUpdated="March 2026"
      highlights={[
        {
          title: "Try Free First",
          description:
            "Create a memorial, add stories, invite family, and publish up to 5 photos without paying anything or entering a credit card.",
        },
        {
          title: "14-Day Guarantee",
          description:
            "If Theirs Complete ($179) is not right for your family, contact us within 14 days of purchase for a complete refund.",
        },
        {
          title: "Never Deleted",
          description:
            "If you request a refund, we never delete your memorial. It simply reverts gracefully to our permanent Free tier.",
        },
      ]}
    >
      {/* 1. Try Free First */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xl sm:text-2xl font-medium text-[#181925]">
          1. Free Tier by Design
        </h2>
        <p>
          We want every family to feel confident before spending a single dollar. Theirs provides a fully functional Free Plan that includes:
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-[#555]">
          <li>Creating and publishing a dedicated memorial page with a clean, custom web link (e.g. <code>theirs.page/first-last</code>);</li>
          <li>Adding a primary portrait photo and up to 5 high-resolution gallery photographs;</li>
          <li>Unlimited written stories, anecdotes, and milestones;</li>
          <li>Unlimited visitor condolence tributes, guestbook notes, and virtual flower gestures;</li>
          <li>Full visitor contribution workflows and caretaker approval moderation.</li>
        </ul>
        <p>
          You only pay for <strong className="font-medium text-[#181925]">Theirs Complete</strong> ($179 one-time activation) when you want unlimited photographs, original audio voice notes, video clips, interactive decade milestones, and the complete downloadable family archive package.
        </p>
      </section>

      {/* 2. 14-Day Money-Back Guarantee */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xl sm:text-2xl font-medium text-[#181925]">
          2. The 14-Day Money-Back Guarantee
        </h2>
        <p>
          If you purchase Theirs Complete and feel it does not meet your family&apos;s expectations, simply contact us within <strong className="text-[#181925]">14 days of purchase</strong>:
        </p>
        <div className="p-4 rounded-2xl bg-[#fafafb] border border-black/[0.06] text-xs sm:text-sm text-[#454545] leading-relaxed flex flex-col gap-1.5">
          <span className="font-medium text-[#181925]">How to Request a Refund:</span>
          <span>Email our support team at <a href="mailto:support@theirs.page" className="text-primary underline font-medium">support@theirs.page</a> with your memorial URL or the email address used at checkout.</span>
          <span>We will process your refund without interrogation, delay, or unnecessary hurdles.</span>
        </div>
        <p className="text-xs text-[#71717a]">
          This 14-day policy complies with and honors statutory consumer cancellation and withdrawal rights in the European Union, United Kingdom, and international consumer protection jurisdictions.
        </p>
      </section>

      {/* 3. Post-Refund Memorial Status */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xl sm:text-2xl font-medium text-[#181925]">
          3. What Happens to Your Memorial After a Refund
        </h2>
        <p>
          A family memorial is sacred. <strong>A refund will never result in the sudden destruction or deletion of your loved one&apos;s memorial.</strong>
        </p>
        <p>
          Instead, your memorial transitions gracefully:
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-[#555]">
          <li>The memorial transitions from Complete back to the Free Plan;</li>
          <li>The memorial page and custom web link remain active and accessible online;</li>
          <li>All written stories, biography, tributes, and the first 5 gallery photos remain publicly published;</li>
          <li>Complete-exclusive features (such as audio voice notes and video clips) become inactive on the public view;</li>
          <li>You are provided a 7-day grace period to download your full archive before inactive Pro media is scheduled for archival storage.</li>
        </ul>
      </section>

      {/* 4. Duplicate or Unauthorized Charges */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xl sm:text-2xl font-medium text-[#181925]">
          4. Accidental Duplicates &amp; Unauthorized Charges
        </h2>
        <p>
          If you experience a technical error resulting in a duplicate transaction, or suspect an unauthorized charge made in error, contact us immediately at{" "}
          <a href="mailto:support@theirs.page" className="text-primary underline font-medium">
            support@theirs.page
          </a>
          . We promptly verify and reverse duplicate charges in full.
        </p>
      </section>

      {/* 5. Processing & Bank Timelines */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xl sm:text-2xl font-medium text-[#181925]">
          5. Payout Mechanics &amp; Bank Timelines
        </h2>
        <p>
          All refunds are credited back to the original payment method used during checkout via our payment processor, Dodo Payments.
        </p>
        <p>
          Once we issue the refund from our dashboard, funds typically reflect in your bank account or credit card statement within <strong className="text-[#181925]">5 to 10 business days</strong>, depending on your card issuer&apos;s settlement schedule. Third-party foreign exchange rates or non-refundable bank processing fees levied by your financial institution are governed by your bank.
        </p>
      </section>

      {/* 6. Disputes & Chargebacks */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xl sm:text-2xl font-medium text-[#181925]">
          6. Resolving Disputes Directly
        </h2>
        <p>
          If you have any questions or concerns about a charge, we encourage you to contact us directly at{" "}
          <a href="mailto:support@theirs.page" className="text-primary underline font-medium">
            support@theirs.page
          </a>{" "}
          before initiating a bank dispute or chargeback. We resolve requests within 24 to 48 hours. When a bank dispute or chargeback is filed, the payment network automatically freezes the transaction and related Pro entitlements until the review is closed.
        </p>
      </section>

      {/* 7. Contact */}
      <section className="flex flex-col gap-2">
        <h2 className="text-xl sm:text-2xl font-medium text-[#181925]">
          7. Questions &amp; Support
        </h2>
        <div className="p-4 rounded-2xl bg-[#fafafb] border border-black/[0.06] text-xs sm:text-sm font-mono text-[#555] flex flex-col gap-1">
          <span>Theirs Billing &amp; Customer Care</span>
          <span>Email: support@theirs.page</span>
          <span>Response Window: Typically within 24 hours on business days</span>
        </div>
      </section>
    </LegalPageLayout>
  )
}
