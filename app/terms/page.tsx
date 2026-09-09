import type { Metadata } from "next"
import Link from "next/link"
import { LegalPageLayout } from "@/components/legal/legal-page-layout"
import { JsonLd } from "@/components/seo/json-ld"
import { buildStaticMetadata } from "@/lib/seo/metadata"
import { buildLegalPageSchemaGraph } from "@/lib/seo/schema"

export const metadata: Metadata = buildStaticMetadata("/terms")

export default function TermsPage() {
  const schema = buildLegalPageSchemaGraph(
    "/terms",
    "Terms of Service",
    "The legal agreement between Theirs and memorial creators, contributors, and visitors."
  )

  return (
    <>
      <JsonLd schema={schema} id="terms-schema" />
      <LegalPageLayout
        title="Terms of Service"
        description="These terms govern your use of Theirs, establishing content ownership, guidelines for memorial creators and contributors, and our commitments to lasting preservation."
        lastUpdated="September 2026"
        highlights={[
          {
            title: "You Own Your Content",
            description:
              "You retain full ownership and copyright of all uploaded photographs, audio recordings, video clips, and stories. Theirs receives only permission to host and display them on your memorial.",
          },
          {
            title: "Family Stewardship",
            description:
              "The memorial creator maintains editorial stewardship over contributions to ensure a consistent, respectful celebration of their loved one’s life.",
          },
          {
            title: "Lasting Preservation",
            description:
              "We protect your memories in resilient cloud storage and provide complete, uncompressed family archive downloads at any time without platform lock-in.",
          },
        ]}
      >
        {/* 1. Acceptance of Terms */}
        <section className="flex flex-col gap-3">
          <h2 className="text-xl sm:text-2xl font-medium text-[#181925]">
            1. Agreement to Terms
          </h2>
          <p>
            By visiting, accessing, or using <strong className="font-medium text-[#181925]">theirs.page</strong> (&ldquo;Theirs&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;), or creating or contributing to a memorial, you agree to these Terms of Service (&ldquo;Terms&rdquo;) and our associated policies, including our{" "}
            <Link href="/privacy" className="text-primary underline font-medium">
              Privacy Policy
            </Link>
            ,{" "}
            <Link href="/guidelines" className="text-primary underline font-medium">
              Memorial &amp; Content Guidelines
            </Link>
            , and{" "}
            <Link href="/refunds" className="text-primary underline font-medium">
              Refund Policy
            </Link>
            .
          </p>
          <p>
            If you do not agree to these Terms, please do not use the platform. You must be at least 18 years of age or the age of legal majority in your jurisdiction to create an account or purchase paid features on Theirs.
          </p>
        </section>

        {/* 2. Memorial Creation & Good Faith */}
        <section className="flex flex-col gap-3">
          <h2 className="text-xl sm:text-2xl font-medium text-[#181925]">
            2. Creating a Memorial in Good Faith
          </h2>
          <p>
            Theirs is dedicated to celebrating and honoring lives. When you create a memorial, you agree that:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-md text-[#555]">
            <li>The memorial is created in good faith to honor and remember someone who has passed away;</li>
            <li>The information you share is truthful and accurate to the best of your knowledge;</li>
            <li>The memorial is not created to mock, harass, defame, or exploit any person, living or deceased;</li>
            <li>The memorial is not used for commercial advertising, spam, or deceptive fundraising;</li>
            <li>You have the right or permission to share the photographs, stories, audio notes, and videos you upload.</li>
          </ul>
        </section>

        {/* 3. Family Representation */}
        <section className="flex flex-col gap-3">
          <h2 className="text-xl sm:text-2xl font-medium text-[#181925]">
            3. Family Representation &amp; Good-Faith Creation
          </h2>
          <div className="p-4 rounded-2xl bg-[#fafafb] border border-black/[0.06] text-xs sm:text-sm text-[#454545] leading-relaxed">
            <strong>Important Clarification:</strong> Creating a memorial on Theirs does not establish you as a legal estate executor, court-appointed representative, or exclusive family spokesperson under the law. We welcome families, friends, colleagues, and communities to celebrate lives in good faith.
          </div>
          <p>
            If a genuine disagreement or ownership dispute arises regarding a memorial, we reserve the right to request identity verification or documentation to resolve the matter fairly.
          </p>
        </section>

        {/* 4. Content Ownership & Limited License */}
        <section className="flex flex-col gap-3">
          <h2 className="text-xl sm:text-2xl font-medium text-[#181925]">
            4. Content Ownership &amp; Your License to Theirs
          </h2>
          <p>
            <strong>You own your content.</strong> Theirs does not claim ownership or copyright over any photographs, audio recordings, video clips, stories, or tributes that you upload or contribute.
          </p>
          <p>
            To display and protect your memorial, you grant Theirs permission to host, store, format, and display your media <em>solely as necessary to operate the memorial in accordance with your chosen privacy settings</em>. This includes creating web-optimized images so your pages load quickly and beautifully on all devices.
          </p>
          <p>
            This permission ends when you delete your content or delete your memorial, with residual backup copies clearing on a standard 30-day security cycle.
          </p>
        </section>

        {/* 5. Memorial Management & Community Stewardship */}
        <section className="flex flex-col gap-3">
          <h2 className="text-xl sm:text-2xl font-medium text-[#181925]">
            5. Memorial Management &amp; Approving Contributions
          </h2>
          <p>
            Family memories are deeply personal. To keep every memorial a peaceful and respectful space, Theirs follows clear principles of stewardship:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-md text-[#555]">
            <li>
              <strong>Memorial Creator Stewardship:</strong> The person who creates the memorial (and any co-organizers they designate) manages page settings, visual design, and which visitor contributions are approved for display.
            </li>
            <li>
              <strong>Approving Memories:</strong> Memorial creators have full discretion to accept, decline, or unpublish contributions according to the family&apos;s wishes. Submitting a tribute does not grant administrative control over the page.
            </li>
            <li>
              <strong>Neutral Platform Role:</strong> Theirs is a hosting and preservation service. We do not take sides in private family disagreements or personal recollections.
            </li>
            <li>
              <strong>Safety Intervention:</strong> We intervene only when content violates our safety standards—such as harassment, unauthorized personal details of living individuals, impersonation, or copyright infringement.
            </li>
          </ul>
        </section>

        {/* 6. Successor Stewards */}
        <section className="flex flex-col gap-3">
          <h2 className="text-xl sm:text-2xl font-medium text-[#181925]">
            6. Passing On Memorial Stewardship
          </h2>
          <p>
            Theirs Complete allows the primary memorial creator to name a trusted successor. Designating a successor ensures that another family member can care for the memorial in the future if the original creator passes away or can no longer manage the page.
          </p>
          <p>
            Successor designation applies solely to managing the memorial on Theirs and does not constitute a legal will or alter estate law.
          </p>
        </section>

        {/* 7. Lasting Preservation & Freedom From Lock-in */}
        <section className="flex flex-col gap-3">
          <h2 className="text-xl sm:text-2xl font-medium text-[#181925]">
            7. Lasting Preservation &amp; Freedom From Lock-in
          </h2>
          <p>
            We design Theirs for lasting digital preservation. Your original full-resolution photographs, audio recordings, and video memories are stored safely with redundant cloud storage.
          </p>
          <div className="p-4 rounded-2xl bg-[#fafafb] border border-black/[0.06] text-xs sm:text-sm text-[#454545] leading-relaxed flex flex-col gap-2">
            <p>
              <strong>The Preservation &amp; Portability Guarantee:</strong> Your family&apos;s memories belong to you, not to a platform. Memorial creators on Theirs Complete can download a complete, uncompressed family archive at any time—including all original full-resolution photos, voice notes, video memories, written stories, and visitor tributes.
            </p>
            <p>
              If Theirs ever materially changes or discontinues any feature, we commit to providing ample advance notice so you can easily download your entire memorial archive.
            </p>
          </div>
        </section>

        {/* 8. Plans & 14-Day Money-Back Guarantee */}
        <section className="flex flex-col gap-3">
          <h2 className="text-xl sm:text-2xl font-medium text-[#181925]">
            8. Plans, Fees &amp; 14-Day Guarantee
          </h2>
          <p>
            Theirs offers a Free Plan (allowing up to 5 high-resolution gallery photos, unlimited written stories, tributes, and custom link) and Theirs Complete ($179 one-time activation, unlocking unlimited photos, voice notes, video memories, timeline milestones, and full archive downloads without monthly subscriptions).
          </p>
          <p>
            All Theirs Complete activations are backed by our <strong>14-day money-back guarantee</strong>. If you are not satisfied for any reason within 14 days of purchase, contact us at{" "}
            <a href="mailto:support@theirs.page" className="text-primary underline font-medium">
              support@theirs.page
            </a>{" "}
            for a full refund. Review our full{" "}
            <Link href="/refunds" className="text-primary underline font-medium">
              Refund Policy
            </Link>{" "}
            for complete details.
          </p>
        </section>

        {/* 9. Copyright & DMCA */}
        <section className="flex flex-col gap-3">
          <h2 className="text-xl sm:text-2xl font-medium text-[#181925]">
            9. Copyright &amp; Intellectual Property
          </h2>
          <p>
            Theirs respects intellectual property rights and complies with copyright safe-harbor standards (including the Digital Millennium Copyright Act). If you believe your copyrighted work has been published on a memorial without authorization, contact our copyright agent:
          </p>
          <div className="p-4 rounded-2xl bg-[#fafafb] border border-black/[0.06] text-xs sm:text-sm text-[#555] flex flex-col gap-1 mt-1">
            <span className="font-medium text-[#181925]">Copyright Inquiries</span>
            <span>Email: support@theirs.page</span>
            <span>Include: Description of the work, the memorial URL, your contact details, and a statement of good-faith belief.</span>
          </div>
        </section>

        {/* 10. Limitation of Liability */}
        <section className="flex flex-col gap-3">
          <h2 className="text-xl sm:text-2xl font-medium text-[#181925]">
            10. Limitation of Liability
          </h2>
          <p className="text-xs sm:text-sm text-[#555] leading-relaxed">
            To the maximum extent permitted by applicable law, Theirs, its founders, and team members shall not be liable for any indirect, incidental, special, or consequential damages, or any loss of data or intangible losses resulting from your use of or inability to access the platform, or any third-party content.
          </p>
          <p className="text-xs sm:text-sm text-[#555] leading-relaxed">
            In no event shall our total aggregate liability exceed the amount you paid to Theirs for the memorial in question during the twelve (12) months preceding the claim, or one hundred US dollars ($100 USD), whichever is greater.
          </p>
        </section>

        {/* 11. Governing Law & Contact */}
        <section className="flex flex-col gap-2">
          <h2 className="text-xl sm:text-2xl font-medium text-[#181925]">
            11. Governing Law &amp; Contact
          </h2>
          <p>
            These Terms are governed by applicable law without regard to conflict of law principles. Any questions regarding these Terms should be directed to:
          </p>
          <div className="p-4 rounded-2xl bg-[#fafafb] border border-black/[0.06] text-xs sm:text-sm text-[#555] flex flex-col gap-1 mt-1">
            <span className="font-medium text-[#181925]">Theirs Legal &amp; Support</span>
            <span>Email: support@theirs.page</span>
            <span>Website: theirs.page</span>
          </div>
        </section>
      </LegalPageLayout>
    </>
  )
}

