import type { Metadata } from "next"
import Link from "next/link"
import { LegalPageLayout } from "@/components/legal/legal-page-layout"

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "The legal agreement between Theirs and memorial caretakers, contributors, and visitors.",
  alternates: {
    canonical: "/terms",
  },
}

export default function TermsPage() {
  return (
    <LegalPageLayout
      title="Terms of Service"
      description="These terms establish how Theirs operates, who owns contributed content, how family disagreements are handled, and why we build for long-term preservation without false promises of eternity."
      lastUpdated="March 2026"
      highlights={[
        {
          title: "You Own Your Content",
          description:
            "You retain full copyright and ownership of all uploaded photographs, recordings, and stories. You grant Theirs only a limited license to host and display them.",
        },
        {
          title: "Caretaker Authority",
          description:
            "The primary memorial owner holds editorial authority. Theirs does not arbitrate subjective family disagreements or act as a family court.",
        },
        {
          title: "Durable Preservation",
          description:
            "We build for high-durability archival storage and provide full exportable archives. We do not make reckless marketing promises of ‘eternal lifetime hosting’.",
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
        <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-[#555]">
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

      {/* 5. Family Disagreements & Caretaker Discretion */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xl sm:text-2xl font-medium text-[#181925]">
          5. Family Disagreements &amp; Editorial Discretion
        </h2>
        <p>
          Grief and family relationships are complex. To maintain stability, Theirs operates under clear structural rules:
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-[#555]">
          <li>
            <strong>The Primary Caretaker Controls the Memorial:</strong> The account holder who created the memorial (or their designated successor) holds administrative authority over settings, design, and contributor approvals.
          </li>
          <li>
            <strong>Contributing Does Not Grant Ownership:</strong> Submitting a photograph, story, or condolence does not grant a contributor administrative authority or veto power over the memorial.
          </li>
          <li>
            <strong>Theirs Does Not Act as a Family Court:</strong> We do not arbitrate subjective family disagreements regarding which memories are published, which relatives are highlighted, or nuanced wording in biographies. Caretakers have full discretion to accept or decline contributions.
          </li>
          <li>
            <strong>Intervention Thresholds:</strong> We will only intervene in memorial disputes where there are credible, substantiated allegations of harassment, doxxing, impersonation, copyright infringement, privacy violations against living individuals, or unlawful conduct.
          </li>
          <li>
            <strong>Dispute Holds:</strong> During a verified legal dispute or ownership contest between legal next of kin, Theirs may temporarily lock editing, contribution, or public visibility while the dispute is formally resolved.
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

      {/* 7. Durable Preservation & No Forever Guarantees */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xl sm:text-2xl font-medium text-[#181925]">
          7. Archival Preservation &amp; The &ldquo;No Forever&rdquo; Principle
        </h2>
        <p>
          We engineer Theirs for extreme durability. Original media is preserved in high-resolution multi-region Cloudflare R2 object storage with immutable backup protocols.
        </p>
        <p>
          However, <strong>no technology company can honestly promise eternity</strong>. Server hardware evolves, formats shift, and corporate entities change over decades. We explicitly reject manipulative &ldquo;lifetime hosting&rdquo; claims.
        </p>
        <div className="p-4 rounded-2xl bg-[#fafafb] border border-black/[0.06] text-xs sm:text-sm text-[#454545] leading-relaxed">
          <strong>The Preservation Guarantee:</strong> We guarantee that your family will never be held hostage. Paid memorial caretakers can download a complete, uncompressed, self-contained ZIP archive of the memorial at any time—containing original full-resolution photographs, audio notes, video files, biographies, milestones, and written stories. In the unlikely event that Theirs ever ceases operations or materially sunsets services, we commit to providing advance notice and a generous window to download your family archive.
        </div>
      </section>

      {/* 8. Service Availability & Personal Backups */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xl sm:text-2xl font-medium text-[#181925]">
          8. Service Availability &amp; Media Backups
        </h2>
        <p>
          While we maintain high-availability cloud infrastructure with automated monitoring and DDoS protection, service interruptions, edge network outages, or scheduled maintenance can occur.
        </p>
        <p>
          Theirs provides an accessible, beautiful platform to view and share a life story—it should not serve as your family&apos;s sole, irreplaceable copy of historic photographs or priceless recordings. We strongly encourage families to maintain independent offline backups of their primary physical and digital archives.
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
          10. Copyright Infringement &amp; DMCA Agent
        </h2>
        <p>
          Theirs respects the intellectual property rights of others and complies with the safe-harbor provisions of the Digital Millennium Copyright Act (17 U.S.C. § 512) and international copyright directives. If you believe your copyrighted work has been uploaded without authorization, send a written notice to our designated copyright agent:
        </p>
        <div className="p-4 rounded-2xl bg-[#fafafb] border border-black/[0.06] text-xs sm:text-sm font-mono text-[#555] flex flex-col gap-1 mt-1">
          <span>Copyright &amp; DMCA Agent</span>
          <span>Theirs Legal Department</span>
          <span>Email: copyright@theirs.page</span>
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
  )
}
