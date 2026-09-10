import type { Metadata } from "next"
import Link from "next/link"
import { LegalPageLayout } from "@/components/legal/legal-page-layout"
import { JsonLd } from "@/components/seo/json-ld"
import { buildStaticMetadata } from "@/lib/seo/metadata"
import { buildLegalPageSchemaGraph } from "@/lib/seo/schema"

export const metadata: Metadata = buildStaticMetadata("/privacy")

export default function PrivacyPage() {
  const schema = buildLegalPageSchemaGraph(
    "/privacy",
    "Privacy Policy",
    "How Theirs collects, protects, and respects family memories, photographs, and personal information."
  )

  return (
    <>
      <JsonLd schema={schema} id="privacy-schema" />
      <LegalPageLayout
        title="Privacy Policy"
        description="An online memorial holds deeply personal memories. Here is exactly what information Theirs receives, why we need it, how it is safeguarded, and how you retain full control."
        lastUpdated="September 2026"
        highlights={[
          {
            title: "Zero Data Selling",
            description:
              "We never sell personal information, family contacts, or memorial memories to advertisers, data brokers, or third parties.",
          },
          {
            title: "No Public AI Training",
            description:
              "We never use family memorials, photos, voice notes, or videos to train public artificial intelligence models.",
          },
          {
            title: "You Own Your Memories",
            description:
              "You and your family retain full ownership of all uploaded photographs, stories, audio notes, and tributes.",
          },
        ]}
      >
        {/* 1. Introduction */}
        <section className="flex flex-col gap-3">
          <h2 className="text-xl sm:text-2xl font-medium text-[#181925]">
            1. Introduction &amp; Our Principles
          </h2>
          <p>
            Theirs (<strong className="font-medium text-[#181925]">theirs.page</strong>, referred to as &ldquo;Theirs&rdquo;, &ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) is an online memorial website where families create a beautiful, lasting memorial for someone they love. Our platform is built on quiet reverence, lasting preservation, and intentional family privacy.
          </p>
          <p>
            This Privacy Policy explains what personal information we receive, how it is cared for, where it is stored, and how you can exercise your rights under global privacy regulations, including the General Data Protection Regulation (GDPR / UK GDPR), the California Consumer Privacy Act (CCPA / CPRA), and applicable digital personal data protection laws.
          </p>
        </section>

        {/* 2. Information We Collect */}
        <section className="flex flex-col gap-4">
          <h2 className="text-xl sm:text-2xl font-medium text-[#181925]">
            2. Information We Collect
          </h2>
          <p>
            We collect only the information genuinely necessary to create, operate, protect, and display your loved one&apos;s memorial.
          </p>

          <div className="overflow-x-auto rounded-2xl border border-black/[0.06] bg-[#fafafb]">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="border-b border-black/[0.06] bg-black/[0.02] text-[#181925] font-medium">
                <tr>
                  <th className="p-3.5 sm:px-4">Category</th>
                  <th className="p-3.5 sm:px-4">Information Collected</th>
                  <th className="p-3.5 sm:px-4">Purpose</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.05] text-[#555]">
                <tr>
                  <td className="p-3.5 sm:px-4 font-medium text-[#181925]">Account Details</td>
                  <td className="p-3.5 sm:px-4">Your name and email address.</td>
                  <td className="p-3.5 sm:px-4">Creating your account, sending secure sign-in links, and enabling you to manage your memorials.</td>
                </tr>
                <tr>
                  <td className="p-3.5 sm:px-4 font-medium text-[#181925]">Memorial Information</td>
                  <td className="p-3.5 sm:px-4">Loved one&apos;s name, birth and passing years, location, biography, and portrait photograph.</td>
                  <td className="p-3.5 sm:px-4">Creating and presenting the memorial page according to your preferences.</td>
                </tr>
                <tr>
                  <td className="p-3.5 sm:px-4 font-medium text-[#181925]">Photos, Stories &amp; Media</td>
                  <td className="p-3.5 sm:px-4">Photographs, original voice notes, video memories, life milestone stories, and guestbook tributes.</td>
                  <td className="p-3.5 sm:px-4">Displaying memory galleries and timeline events, and compiling your downloadable family archive.</td>
                </tr>
                <tr>
                  <td className="p-3.5 sm:px-4 font-medium text-[#181925]">Contributor Details</td>
                  <td className="p-3.5 sm:px-4">Contributor name, relationship to the person remembered, and optional email address.</td>
                  <td className="p-3.5 sm:px-4">Attributing contributions and notifying memorial creators when family or friends share memories.</td>
                </tr>
                <tr>
                  <td className="p-3.5 sm:px-4 font-medium text-[#181925]">Payment Information</td>
                  <td className="p-3.5 sm:px-4">Transaction identifier, purchase date, payment status, and customer country.</td>
                  <td className="p-3.5 sm:px-4">Activating the Theirs Complete plan. <strong className="text-[#181925]">Theirs never receives, handles, or stores your credit card numbers.</strong> All transactions are processed securely by our Merchant of Record, Dodo Payments.</td>
                </tr>
                <tr>
                  <td className="p-3.5 sm:px-4 font-medium text-[#181925]">Site Security &amp; Analytics</td>
                  <td className="p-3.5 sm:px-4">General device and browser type, spam prevention tokens, and cookieless, privacy-first page statistics via self-hosted Open Analytics.</td>
                  <td className="p-3.5 sm:px-4">Preventing automated spam, protecting site availability, and measuring general website traffic without persistent cookies, raw IP logging, or cross-site tracking.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 3. Public, Unlisted, and Private Settings */}
        <section className="flex flex-col gap-3">
          <h2 className="text-xl sm:text-2xl font-medium text-[#181925]">
            3. Memorial Privacy Settings
          </h2>
          <p>
            You have complete control over who can view and contribute to your memorial:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-2">
            <div className="p-4 rounded-2xl border border-black/[0.06] bg-[#fafafb] flex flex-col gap-1.5">
              <span className="text-xs font-mono uppercase font-semibold text-emerald-700">Public</span>
              <p className="text-xs text-[#555] leading-relaxed">
                Anyone with the link can visit the memorial. Public search engines (like Google and Bing) can discover and index the page.
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-black/[0.06] bg-[#fafafb] flex flex-col gap-1.5">
              <span className="text-xs font-mono uppercase font-semibold text-amber-700">Unlisted</span>
              <p className="text-xs text-[#555] leading-relaxed">
                The memorial is excluded from public search engines and directories. Anyone you share the link with can view the page.
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-black/[0.06] bg-[#fafafb] flex flex-col gap-1.5">
              <span className="text-xs font-mono uppercase font-semibold text-[#2553b9]">Private</span>
              <p className="text-xs text-[#555] leading-relaxed">
                Protected by a 4-digit family PIN. Search engines are blocked completely. Visitors must enter the PIN before viewing stories, media, or tributes.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-900 leading-relaxed">
            <strong>Search Engine Note:</strong> When you switch a public memorial to private or unlisted, it is instantly protected on our platform. However, search engines take time to refresh their search result listings and remove previously cached links.
          </div>
        </section>

        {/* 4. Content Involving Living People */}
        <section className="flex flex-col gap-3">
          <h2 className="text-xl sm:text-2xl font-medium text-[#181925]">
            4. Photos &amp; Stories Involving Living Family &amp; Friends
          </h2>
          <p>
            Memorials naturally include family photographs, stories, and anecdotes that mention living relatives, children, and friends.
          </p>
          <p>
            Memorial creators and contributors should ensure they have permission from living individuals before sharing their personal stories or photos. If you are a living person named or pictured on a memorial and wish for that content to be removed, please email us directly at{" "}
            <a href="mailto:support@theirs.page" className="text-primary underline font-medium">
              support@theirs.page
            </a>
            . We review and handle privacy requests promptly and respectfully.
          </p>
        </section>

        {/* 5. Artificial Intelligence & Content Safety */}
        <section className="flex flex-col gap-3">
          <h2 className="text-xl sm:text-2xl font-medium text-[#181925]">
            5. Safety Screening &amp; Thoughtful Writing Tools
          </h2>
          <p>
            We use automated tools solely to keep memorials safe and to offer optional writing assistance:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-md text-[#555]">
            <li>
              <strong>Automated Safety Checks:</strong> Uploaded media is checked to prevent spam, malicious files, or inappropriate content from appearing on memorial pages.
            </li>
            <li>
              <strong>Optional Writing Assistance:</strong> When you ask our helper tool to polish a written story, it focuses only on fixing grammar and readability while preserving your natural words and voice.
            </li>
            <li>
              <strong>No Value Judgments:</strong> Automated tools never decide what memories are meaningful. The memorial creator always has the final word on approving or declining memories.
            </li>
            <li>
              <strong>Zero Public AI Training:</strong> Your family photos, recordings, stories, and biographies are <strong>never used to train public AI models</strong> and are never sold to external AI companies.
            </li>
          </ul>
        </section>

        {/* 6. Service Providers */}
        <section className="flex flex-col gap-3">
          <h2 className="text-xl sm:text-2xl font-medium text-[#181925]">
            6. Trusted Service Partners
          </h2>
          <p>
            We partner with respected infrastructure providers to host and deliver Theirs safely:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-md text-[#555]">
            <li><strong>Cloudflare</strong> (Fast global hosting, encrypted media storage, and spam defense)</li>
            <li><strong>Supabase</strong> (Secure database and encrypted account authentication)</li>
            <li><strong>Dodo Payments</strong> (Secure checkout, card processing, and billing compliance)</li>
            <li><strong>Resend</strong> (Reliable email delivery for sign-in links and memorial notifications)</li>
            <li><strong>Open Analytics (Self-Hosted)</strong> (Privacy-first visitor statistics that set no tracking cookies, store no raw IP addresses, and respect Global Privacy Control)</li>
            <li><strong>Google Cloud</strong> (Automated safety checks and optional story writing assistance)</li>
          </ul>
        </section>

        {/* 7. Data Retention & Deletion */}
        <section className="flex flex-col gap-3">
          <h2 className="text-xl sm:text-2xl font-medium text-[#181925]">
            7. Keeping &amp; Deleting Your Information
          </h2>
          <p>
            We manage your data thoughtfully:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-md text-[#555]">
            <li><strong>Active Memorials:</strong> Stored safely for as long as your account and memorial remain active.</li>
            <li><strong>Memorial Deletion:</strong> When you delete a memorial from your dashboard, the memorial page and all uploaded photos, voice notes, and videos are permanently erased from our active servers.</li>
            <li><strong>Interrupted Uploads:</strong> Incomplete files from canceled or interrupted uploads are cleared automatically.</li>
            <li><strong>Safety Quarantines:</strong> Uploads that fail safety scans are isolated and deleted permanently.</li>
            <li><strong>Encrypted Backups:</strong> Routine security backups are overwritten on a rolling 30-day schedule.</li>
          </ul>
        </section>

        {/* 8. Your Privacy Rights */}
        <section className="flex flex-col gap-3">
          <h2 className="text-xl sm:text-2xl font-medium text-[#181925]">
            8. Your Rights &amp; Data Portability
          </h2>
          <p>
            You have full control over your personal data:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-md text-[#555]">
            <li><strong>Download Your Family Archive:</strong> Memorial creators on Theirs Complete can download a complete, uncompressed archive containing all original full-resolution photos, voice recordings, video files, written stories, and tributes at any time.</li>
            <li><strong>Edit or Correct:</strong> You can update memorial information directly in your editor at any moment.</li>
            <li><strong>Delete Your Account or Memorial:</strong> You can delete individual memorials or your entire account from your settings.</li>
            <li><strong>Support &amp; Inquiries:</strong> If you have any privacy questions or wish to exercise your rights, email us at{" "}
              <a href="mailto:support@theirs.page" className="text-primary underline font-medium">
                support@theirs.page
              </a>
              . We respond to all requests promptly.
            </li>
          </ul>
        </section>

        {/* 9. Contact */}
        <section className="flex flex-col gap-2">
          <h2 className="text-xl sm:text-2xl font-medium text-[#181925]">
            9. Contact Our Team
          </h2>
          <p>
            If you have questions, feedback, or privacy requests regarding your memorial or data, reach out to us:
          </p>
          <div className="p-4 rounded-2xl bg-[#fafafb] border border-black/[0.06] text-xs sm:text-sm text-[#555] flex flex-col gap-1 mt-1">
            <span className="font-medium text-[#181925]">Theirs Support &amp; Privacy Care</span>
            <span>Email: support@theirs.page</span>
            <span>Website: theirs.page</span>
          </div>
        </section>
      </LegalPageLayout>
    </>
  )
}

