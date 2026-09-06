import type { Metadata } from "next"
import { LegalPageLayout } from "@/components/legal/legal-page-layout"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Theirs collects, protects, and respects family memories, photographs, and personal information.",
  alternates: {
    canonical: "/privacy",
  },
}

export default function PrivacyPage() {
  return (
    <LegalPageLayout
      title="Privacy Policy"
      description="A life archive holds deeply personal memories. Here is exactly what information Theirs receives, why we need it, how it is safeguarded, and the control you retain."
      lastUpdated="March 2026"
      highlights={[
        {
          title: "Zero Data Selling",
          description:
            "We do not sell personal data, family contacts, or memorial content to advertisers, data brokers, or third parties.",
        },
        {
          title: "No Public AI Training",
          description:
            "We never use private memorials, family photographs, voice recordings, or videos to train public generative AI models.",
        },
        {
          title: "You Retain Ownership",
          description:
            "You and your family retain full ownership of all uploaded photographs, stories, audio notes, and contributions.",
        },
      ]}
    >
      {/* 1. Introduction */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xl sm:text-2xl font-medium text-[#181925]">
          1. Introduction & Core Philosophy
        </h2>
        <p>
          Theirs (<strong className="font-medium text-[#181925]">theirs.page</strong>, referred to as &ldquo;Theirs&rdquo;, &ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) is dedicated to preserving the story, voice, and memories of human lives. Unlike commercial social media networks or data-broker obituaries, Theirs is built on quiet reverence, archival preservation, and intentional family privacy.
        </p>
        <p>
          This Privacy Policy explains what personal data we collect, how it is processed, where it is stored, and how you can exercise your rights under applicable privacy frameworks, including the Digital Personal Data Protection Act (DPDP Act, India 2025/2026), the General Data Protection Regulation (GDPR / UK GDPR), and the California Consumer Privacy Act (CCPA / CPRA).
        </p>
      </section>

      {/* 2. Information We Collect */}
      <section className="flex flex-col gap-4">
        <h2 className="text-xl sm:text-2xl font-medium text-[#181925]">
          2. Information We Collect
        </h2>
        <p>
          We only collect personal information that is genuinely necessary to create, operate, protect, and display memorials.
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
                <td className="p-3.5 sm:px-4 font-medium text-[#181925]">Account Data</td>
                <td className="p-3.5 sm:px-4">Full name, email address, authentication user identifiers.</td>
                <td className="p-3.5 sm:px-4">Account creation, secure passwordless magic link logins, caretaker permissions.</td>
              </tr>
              <tr>
                <td className="p-3.5 sm:px-4 font-medium text-[#181925]">Memorial Data</td>
                <td className="p-3.5 sm:px-4">Honoree full name, preferred name, birth and death years, location, headline, biography, primary portrait photo.</td>
                <td className="p-3.5 sm:px-4">Assembling and presenting the memorial page according to caretaker preferences.</td>
              </tr>
              <tr>
                <td className="p-3.5 sm:px-4 font-medium text-[#181925]">User Content</td>
                <td className="p-3.5 sm:px-4">Photographs, original voice notes, video clips, written stories, milestone events, and guestbook tributes.</td>
                <td className="p-3.5 sm:px-4">Displaying memory galleries and timeline events; compiling family archive ZIP packages.</td>
              </tr>
              <tr>
                <td className="p-3.5 sm:px-4 font-medium text-[#181925]">Contributor Data</td>
                <td className="p-3.5 sm:px-4">Contributor name, relationship to the deceased, optional email address.</td>
                <td className="p-3.5 sm:px-4">Attributing contributions and notifying caretakers for moderation approval.</td>
              </tr>
              <tr>
                <td className="p-3.5 sm:px-4 font-medium text-[#181925]">Payment Information</td>
                <td className="p-3.5 sm:px-4">Transaction ID, purchase date, payment status, customer country.</td>
                <td className="p-3.5 sm:px-4">Activating the Theirs Complete plan. <strong className="text-[#181925]">Theirs never receives, processes, or stores your complete credit card numbers.</strong> All payment processing is securely handled by our Merchant of Record, Dodo Payments.</td>
              </tr>
              <tr>
                <td className="p-3.5 sm:px-4 font-medium text-[#181925]">Technical & Security</td>
                <td className="p-3.5 sm:px-4">IP address, browser type, device information, Cloudflare Turnstile bot verification tokens.</td>
                <td className="p-3.5 sm:px-4">Preventing spam, bot attacks, DDoS abuse, and enforcing durable rate limits.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 3. Public, Unlisted, and Private Settings */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xl sm:text-2xl font-medium text-[#181925]">
          3. Memorial Privacy Settings Defined
        </h2>
        <p>
          The memorial owner controls the accessibility of each page. We define these settings with absolute clarity:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-2">
          <div className="p-4 rounded-2xl border border-black/[0.06] bg-[#fafafb] flex flex-col gap-1.5">
            <span className="text-xs font-mono uppercase font-semibold text-emerald-700">Public</span>
            <p className="text-xs text-[#555] leading-relaxed">
              Anyone with internet access can view the memorial. Public search engines (such as Google and Bing) are permitted to index the page and metadata.
            </p>
          </div>

          <div className="p-4 rounded-2xl border border-black/[0.06] bg-[#fafafb] flex flex-col gap-1.5">
            <span className="text-xs font-mono uppercase font-semibold text-amber-700">Unlisted</span>
            <p className="text-xs text-[#555] leading-relaxed">
              The memorial is not included in sitemaps or directory listings. However, <strong>anyone who receives or discovers the link can view it</strong>. Unlisted pages can be reshared by recipients.
            </p>
          </div>

          <div className="p-4 rounded-2xl border border-black/[0.06] bg-[#fafafb] flex flex-col gap-1.5">
            <span className="text-xs font-mono uppercase font-semibold text-primary">Private</span>
            <p className="text-xs text-[#555] leading-relaxed">
              Protected by a 4-digit family PIN. Search engines are blocked via noindex headers. Visitors must input the valid PIN before accessing stories, timeline, or media.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-900 leading-relaxed">
          <strong>Important Search Engine & Third-Party Notice:</strong> While switching a public memorial to private or unlisted immediately removes public access from our active servers, Theirs cannot guarantee the immediate deletion of cached copies, screenshots, or indexes previously collected by third-party search engines or past visitors before the setting was changed.
        </div>
      </section>

      {/* 4. Content Involving Living People */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xl sm:text-2xl font-medium text-[#181925]">
          4. Content Involving Living Individuals
        </h2>
        <p>
          Memorials frequently contain group family photographs, anecdotes, and stories that mention living relatives, children, or friends.
        </p>
        <p>
          Memorial creators and contributors represent that they have the appropriate permission or lawful basis to share personal information, photographs, or recordings concerning living individuals. Theirs respects the privacy of living individuals: if you are a living person named, depicted, or described in a memorial and wish for that content to be removed or corrected, you may contact our team directly at{" "}
          <a href="mailto:privacy@theirs.page" className="text-primary underline font-medium">
            privacy@theirs.page
          </a>
          . We review and act upon verified privacy concerns promptly.
        </p>
      </section>

      {/* 5. Artificial Intelligence & Automated Screening */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xl sm:text-2xl font-medium text-[#181925]">
          5. Automated Screening & Artificial Intelligence
        </h2>
        <p>
          We use automated tools (including Google Gemini models) strictly for security and safety purposes:
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-[#555]">
          <li>
            <strong>Safety & Malware Screening:</strong> Uploaded media is scanned to detect spam, malicious code, sexually explicit material, and severe abuse before it reaches caretakers.
          </li>
          <li>
            <strong>Optional Editing Assistance:</strong> When caretakers explicitly request AI story polishing, the text is processed solely to fix grammar and improve flow while preserving the author&apos;s authentic voice.
          </li>
          <li>
            <strong>No Value Judgments:</strong> Automated screening does not determine which personal family memories are worthy of celebration. Human caretakers retain absolute discretion over approving or declining memories.
          </li>
          <li>
            <strong>No Generative AI Training:</strong> Your family content, photographs, voice recordings, and biographies are <strong>never used to train public generative AI models</strong> or sold to third-party AI companies.
          </li>
        </ul>
      </section>

      {/* 6. Service Providers & Subprocessors */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xl sm:text-2xl font-medium text-[#181925]">
          6. Service Providers & Subprocessors
        </h2>
        <p>
          We engage trusted, industry-leading infrastructure providers to host and operate Theirs under strict data processing agreements:
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-[#555]">
          <li><strong>Cloudflare, Inc.</strong> (Global Edge Network, Cloudflare R2 object storage, Turnstile bot protection)</li>
          <li><strong>Supabase, Inc.</strong> (PostgreSQL database, encrypted authentication, managed cloud infrastructure)</li>
          <li><strong>Dodo Payments, Inc.</strong> (Merchant of Record, credit card processing, sales tax compliance, fraud prevention)</li>
          <li><strong>Resend, Inc.</strong> (Transactional email delivery, passwordless authentication magic links)</li>
          <li><strong>Google LLC</strong> (Google Cloud / Gemini API for media safety screening)</li>
        </ul>
      </section>

      {/* 7. Data Retention & Deletion */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xl sm:text-2xl font-medium text-[#181925]">
          7. Data Retention & Erasure
        </h2>
        <p>
          We retain information according to transparent, purposeful criteria:
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-[#555]">
          <li><strong>Active Memorials:</strong> Stored securely as long as the account and memorial remain active.</li>
          <li><strong>Abandoned Staging Uploads:</strong> Uncommitted upload files in temporary staging prefixes are automatically purged by background cleanup routines.</li>
          <li><strong>Quarantined / Rejected Media:</strong> Unapproved or blocked media is held for a limited quarantine period before automatic permanent deletion.</li>
          <li><strong>Memorial Deletion:</strong> When a memorial owner deletes a memorial via the dashboard, the memorial record and all associated R2 storage files (photographs, audio, video) are permanently erased from active systems.</li>
          <li><strong>System Backups:</strong> Residual copies in encrypted database backups are overwritten according to routine retention cycles (typically 30 days).</li>
        </ul>
      </section>

      {/* 8. Your Rights */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xl sm:text-2xl font-medium text-[#181925]">
          8. Your Privacy Rights
        </h2>
        <p>
          Depending on your location, you hold statutory rights regarding your personal data:
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-[#555]">
          <li><strong>Right of Access & Portability:</strong> You may request a copy of your personal data. Memorial caretakers on paid plans can download a complete, uncompressed ZIP archive containing all original media, biographies, and written tributes at any time.</li>
          <li><strong>Right to Correction:</strong> You can edit or update memorial information directly in the memorial editor.</li>
          <li><strong>Right to Erasure:</strong> You can delete your account or individual memorials at any time from your account settings.</li>
          <li><strong>Right to Withdraw Consent:</strong> You may withdraw consent for optional processing or communications at any time.</li>
        </ul>
        <p>
          To exercise any of these rights, email our Data Privacy Officer at{" "}
          <a href="mailto:privacy@theirs.page" className="text-primary underline font-medium">
            privacy@theirs.page
          </a>
          . We acknowledge and respond to verified requests within statutory timeframes.
        </p>
      </section>

      {/* 9. Contact */}
      <section className="flex flex-col gap-2">
        <h2 className="text-xl sm:text-2xl font-medium text-[#181925]">
          9. Contact & Grievance Redressal
        </h2>
        <p>
          For questions, privacy requests, or grievances concerning this policy or the treatment of your personal data, contact:
        </p>
        <div className="p-4 rounded-2xl bg-[#fafafb] border border-black/[0.06] text-xs sm:text-sm font-mono text-[#555] flex flex-col gap-1 mt-1">
          <span>Theirs Privacy & Data Protection Office</span>
          <span>Email: privacy@theirs.page</span>
          <span>Website: theirs.page</span>
        </div>
      </section>
    </LegalPageLayout>
  )
}
