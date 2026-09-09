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
    "The legal agreement between Theirs and memorial caretakers, contributors, and visitors."
  )

  return (
    <>
      <JsonLd schema={schema} id="terms-schema" />
      <LegalPageLayout
      title="Terms of Service"
      description="These terms govern the use of Theirs, establishing content ownership, editorial guidelines for memorial caretakers, and our commitments to durable archival preservation."
      lastUpdated="September 2026"
      highlights={[
        {
          title: "You Own Your Content",
          description:
            "You retain full ownership and copyright of all uploaded photographs, audio recordings, video clips, and stories. Theirs receives only a limited license to host and display them.",
        },
        {
          title: "Caretaker Authority",
          description:
            "The memorial caretaker maintains editorial stewardship over contributions to ensure a consistent, respectful celebration of their loved one’s life.",
        },
        {
          title: "Durable Preservation",
          description:
            "We engineer for high-durability cloud storage and provide complete, uncompressed, downloadable family archives at any time without platform lock-in.",
        },
      ]}
    >
      {/* 1. Acceptance of Terms */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xl sm:text-2xl font-medium text-[#181925]">
          1. Agreement to Terms
        </h2>
        <p>
          By visiting, accessing, or using <strong className="font-medium text-[#181925]">theirs.page</strong> (&ldquo;Theirs&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;), or creating or contributing to a memorial, you agree to be bound by these Terms of Service (&ldquo;Terms&rdquo;) and our associated policies, including our{" "}
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
          If you do not agree to these Terms, you must not use the platform. You must be at least 18 years old or the age of legal majority in your jurisdiction to create an account or purchase paid features on Theirs.
        </p>
      </section>

      {/* 2. Memorial Creation & Good Faith */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xl sm:text-2xl font-medium text-[#181925]">
          2. Memorial Creation &amp; Good Faith Representation
        </h2>
        <p>
          Anyone creating a memorial represents and warrants that:
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-md text-[#555]">
          <li>The memorial is created in genuine good faith to remember and celebrate a deceased individual;</li>
          <li>The information provided is not knowingly false, deceptive, or defamatory;</li>
          <li>The memorial is not created to harass, mock, exploit, or embarrass any person living or deceased;</li>
          <li>The memorial is not being used for fraudulent fundraising, commercial advertisements, or SEO manipulation;</li>
          <li>You possess the rights, permissions, or lawful basis necessary to upload the media and information you publish.</li>
        </ul>
      </section>

      {/* 3. No Family Authority Certification */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xl sm:text-2xl font-medium text-[#181925]">
          3. No Certification of Legal Family Authority
        </h2>
        <div className="p-4 rounded-2xl bg-[#fafafb] border border-black/[0.06] text-xs sm:text-sm text-[#454545] leading-relaxed">
          <strong>Important Clarification:</strong> Creating a memorial on Theirs does not establish you as the deceased person&apos;s legal representative, estate executor, next of kin, or official family spokesperson. Theirs does not independently verify genealogical lineage or family authority during account registration.
        </div>
        <p>
          We permit family members, close friends, colleagues, and communities to establish memorials. However, we reserve the right to request identity verification or documentation if an ownership dispute, privacy complaint, or legal request arises.
        </p>
      </section>

      {/* 4. Content Ownership & Limited License */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xl sm:text-2xl font-medium text-[#181925]">
          4. Content Ownership &amp; Platform License
        </h2>
        <p>
          <strong>You own your content.</strong> Theirs does not claim copyright or ownership over the photographs, audio recordings, video clips, stories, or tributes that you upload or contribute.
        </p>
        <p>
          To operate the platform, you grant Theirs a worldwide, non-exclusive, royalty-free, limited license to host, store, cache, transcode, resize, create necessary technical derivatives (such as web-optimized previews), and display your content <em>solely as necessary to provide, secure, and operate the service in accordance with the memorial&apos;s privacy settings</em>.
        </p>
        <p>
          This license terminates when you delete your content or delete the memorial, except for reasonable automated backup retention cycles (typically 30 days) and material retained where required by law or to resolve active disputes.
        </p>
      </section>

      {/* 5. Editorial Stewardship & Memorial Management */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xl sm:text-2xl font-medium text-[#181925]">
          5. Editorial Stewardship &amp; Memorial Management
        </h2>
        <p>
          Family relationships and remembrance are deeply personal. To ensure each memorial remains a peaceful, organized, and respectful tribute, Theirs maintains clear principles of editorial stewardship:
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-md text-[#555]">
          <li>
            <strong>Caretaker Stewardship:</strong> The account holder who established the memorial (or their designated successor) holds administrative authority over page settings, visual presentation, and visitor contribution approvals.
          </li>
          <li>
            <strong>Independent Editorial Discretion:</strong> Caretakers have full discretion to accept, decline, or unpublish contributions according to the family&apos;s wishes. Submitting a memory or condolence does not convey administrative or editorial control over the memorial.
          </li>
          <li>
            <strong>Neutral Platform Role:</strong> Theirs is a hosting and archival service. We do not mediate interpersonal disagreements regarding family dynamics, personal recollections, or which relatives are mentioned in biographies.
          </li>
          <li>
            <strong>Safety &amp; Compliance Intervention:</strong> Theirs will intervene only when there are credible reports of harassment, unauthorized publication of private personal information of living individuals, impersonation, copyright infringement, or violations of our Memorial &amp; Content Guidelines.
          </li>
          <li>
            <strong>Dispute Review:</strong> In the event of a formal legal dispute regarding authority over a memorial, Theirs reserves the right to temporarily restrict editing or public visibility while the parties resolve the matter.
          </li>
        </ul>
      </section>

      {/* 6. Successor Caretakers */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xl sm:text-2xl font-medium text-[#181925]">
          6. Successor Caretakers
        </h2>
        <p>
          Theirs Complete allows the primary owner to designate a successor caretaker. Designating a successor grants that individual the technical ability to administer the memorial on Theirs in the event the primary owner passes away or becomes unable to care for the page.
        </p>
        <p>
          A successor designation applies exclusively to account administration on Theirs. It does not constitute a last will and testament, does not transfer copyright in other family members&apos; contributions, and does not alter estate law. Theirs reserves the right to request proof of identity before transferring account control to a designated successor.
        </p>
      </section>

      {/* 7. Archival Durability & Data Portability */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xl sm:text-2xl font-medium text-[#181925]">
          7. Archival Durability &amp; Data Portability
        </h2>
        <p>
          We design Theirs for long-term digital preservation. Your original full-resolution photographs, audio recordings, and video clips are stored in resilient, multi-region cloud storage with automated redundancy.
        </p>
        <p>
          Online technology and digital media formats naturally evolve across generations. Because no digital service can guarantee infinite availability, our core commitment is grounded in absolute transparency and freedom from platform lock-in:
        </p>
        <div className="p-4 rounded-2xl bg-[#fafafb] border border-black/[0.06] text-xs sm:text-sm text-[#454545] leading-relaxed flex flex-col gap-2">
          <p>
            <strong>The Preservation &amp; Portability Guarantee:</strong> Your family&apos;s memories belong to you. Memorial caretakers on paid plans can download a complete, uncompressed ZIP archive of the entire memorial at any time—including original full-resolution media, audio notes, video files, written biographies, timeline milestones, and visitor tributes.
          </p>
          <p>
            In the event that Theirs ever materially alters or discontinues any aspect of the service, we commit to providing caretakers with clear advance notice and an ample window to download and preserve their complete archive.
          </p>
        </div>
      </section>

      {/* 8. Service Availability & Archival Best Practices */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xl sm:text-2xl font-medium text-[#181925]">
          8. Service Availability &amp; Archival Best Practices
        </h2>
        <p>
          While we operate high-availability cloud infrastructure with automated monitoring and edge redundancy, occasional maintenance or network interruptions may occur.
        </p>
        <p>
          Theirs provides a beautiful, accessible space to honor and share a life story. As a sound archival practice, we always recommend that families maintain their own physical or digital copies of irreplaceable original photographs and home recordings alongside their online memorial.
        </p>
      </section>

      {/* 9. Purchases & Refund Policy */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xl sm:text-2xl font-medium text-[#181925]">
          9. Plans, Fees &amp; Refunds
        </h2>
        <p>
          Theirs offers a Free Plan (enabling up to 5 high-resolution gallery photos, unlimited written stories, tributes, and custom link) and Theirs Complete ($179 one-time activation, unlocking unlimited media, voice notes, video clips, timeline milestones, and full archive downloads).
        </p>
        <p>
          We back all Theirs Complete activations with a transparent, straightforward <strong>14-day money-back guarantee</strong>. If you are unsatisfied for any reason within 14 days of purchase, contact us for a complete refund. Review our full{" "}
          <Link href="/refunds" className="text-primary underline font-medium">
            Refund Policy
          </Link>{" "}
          for detailed terms.
        </p>
      </section>

      {/* 10. Copyright & DMCA Takedowns */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xl sm:text-2xl font-medium text-[#181925]">
          10. Copyright Infringement
        </h2>
        <p>
          Theirs respects the intellectual property rights of others and complies with the safe-harbor provisions of the Digital Millennium Copyright Act (17 U.S.C. § 512) and international copyright directives. If you believe your copyrighted work has been uploaded without authorization, send a written notice to our designated copyright agent:
        </p>
        <div className="p-4 rounded-2xl bg-[#fafafb] border border-black/[0.06] text-xs sm:text-sm font-mono text-[#555] flex flex-col gap-1 mt-1">
          <span>Copyright &amp; DMCA</span>
          <span>Email: support@theirs.page</span>
          <span>Notice Requirements: Identify work, provide infringing URL, your contact details, and statement of good-faith belief.</span>
        </div>
      </section>

      {/* 11. Limitation of Liability */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xl sm:text-2xl font-medium text-[#181925]">
          11. Limitation of Liability
        </h2>
        <p className="text-xs sm:text-sm uppercase tracking-wider font-mono text-[#888]">
          Please read this section carefully.
        </p>
        <p className="text-xs sm:text-sm text-[#555] leading-relaxed">
          TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, THEIRS, ITS FOUNDERS, DIRECTORS, EMPLOYEES, AND SERVICE PROVIDERS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF DATA, REPUTATION, OR OTHER INTANGIBLE LOSSES, ARISING FROM YOUR ACCESS TO OR INABILITY TO ACCESS THE PLATFORM, ANY CONDUCT OR CONTENT OF ANY THIRD PARTY, OR UNAUTHORIZED ACCESS OR ALTERATION OF TRANSMISSIONS OR CONTENT.
        </p>
        <p className="text-xs sm:text-sm text-[#555] leading-relaxed">
          IN NO EVENT SHALL OUR AGGREGATE LIABILITY EXCEED THE GREATER OF ONE HUNDRED UNITED STATES DOLLARS ($100 USD) OR THE AMOUNT YOU PAID TO THEIRS FOR THE MEMORIAL IN DISPUTE DURING THE TWELVE (12) MONTHS PRECEDING THE CLAIM.
        </p>
      </section>

      {/* 12. Governing Law */}
      <section className="flex flex-col gap-2">
        <h2 className="text-xl sm:text-2xl font-medium text-[#181925]">
          12. Governing Law &amp; Jurisdiction
        </h2>
        <p>
          These Terms are governed by and construed in accordance with the applicable laws of the operating entity&apos;s jurisdiction, without regard to its conflict of law provisions. Any disputes arising out of or relating to these Terms or the platform shall be resolved through good-faith negotiation or brought before the competent courts of the operating jurisdiction.
        </p>
      </section>
    </LegalPageLayout>
    </>
  )
}
