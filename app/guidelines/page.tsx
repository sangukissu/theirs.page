import type { Metadata } from "next"
import Link from "next/link"
import { LegalPageLayout } from "@/components/legal/legal-page-layout"

export const metadata: Metadata = {
  title: "Memorial & Content Guidelines",
  description:
    "Community standards for creating respectful, authentic, and dignified life archives on Theirs.",
  alternates: {
    canonical: "/guidelines",
  },
}

export default function GuidelinesPage() {
  return (
    <LegalPageLayout
      title="Memorial & Content Guidelines"
      description="Theirs exists to celebrate human lives with honesty, dignity, and warmth. These guidelines establish what is welcomed, what is moderated, and how we keep memorials safe for grieving families."
      lastUpdated="September 2026"
      highlights={[
        {
          title: "Authentic Remembrance",
          description:
            "Genuine, complex memories—including human imperfections—are welcomed. Memorials do not need to portray someone as flawless.",
        },
        {
          title: "Zero Tolerance for Abuse",
          description:
            "Harassment, hate speech, doxxing, impersonation, commercial spam, and fraudulent fundraising are strictly prohibited and immediately removed.",
        },
        {
          title: "Ban on Synthetic Clones",
          description:
            "Photo restoration is allowed, but AI-generated voice clones or fabricated media portraying someone saying or doing things they never did are strictly prohibited.",
        },
      ]}
    >
      {/* 1. Core Philosophy */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xl sm:text-2xl font-medium text-[#181925]">
          1. The Philosophy of Theirs
        </h2>
        <p>
          We believe that visiting a memorial should feel like visiting someone&apos;s life, not visiting their obituary. A full life includes quirky habits, passionate arguments, acts of quiet generosity, funny holiday mishaps, and real human character.
        </p>
        <p>
          We do not require sterile eulogies or forced solemnity. A memory that recounts humorous mishaps, eccentricities, or real human moments is often the truest, most loving tribute. However, personal recollection must never be used for cruelty, harassment, or attacks on others.
        </p>
      </section>

      {/* 2. Permitted vs. Prohibited Standards */}
      <section className="flex flex-col gap-4">
        <h2 className="text-xl sm:text-2xl font-medium text-[#181925]">
          2. Content Standards Matrix
        </h2>

        <div className="overflow-x-auto rounded-2xl border border-black/[0.06] bg-[#fafafb]">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="border-b border-black/[0.06] bg-black/[0.02] text-[#181925] font-medium">
              <tr>
                <th className="p-3.5 sm:px-4 w-1/3">Content Type</th>
                <th className="p-3.5 sm:px-4">Policy &amp; Handling</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05] text-[#555]">
              <tr>
                <td className="p-3.5 sm:px-4 font-medium text-emerald-800">Honest Memories &amp; Flaws</td>
                <td className="p-3.5 sm:px-4">
                  <strong>Permitted.</strong> Recollections that touch on human weaknesses, eccentricities, and difficult life chapters in a spirit of honest remembrance are fully permitted.
                </td>
              </tr>
              <tr>
                <td className="p-3.5 sm:px-4 font-medium text-emerald-800">Historical Family Photos</td>
                <td className="p-3.5 sm:px-4">
                  <strong>Permitted.</strong> Original family photographs, candid snapshots, scanned letters, diplomas, certificates, and restored vintage pictures.
                </td>
              </tr>
              <tr>
                <td className="p-3.5 sm:px-4 font-medium text-emerald-800">Cultural &amp; Religious Traditions</td>
                <td className="p-3.5 sm:px-4">
                  <strong>Permitted.</strong> Faith traditions, cultural mourning rituals, blessings, prayers, and non-denominational secular tributes are welcomed without bias.
                </td>
              </tr>
              <tr>
                <td className="p-3.5 sm:px-4 font-medium text-rose-800">Targeted Abuse &amp; Harassment</td>
                <td className="p-3.5 sm:px-4">
                  <strong>Strictly Prohibited.</strong> Content designed to demean, torment, stalk, intimidate, or attack the deceased, caretakers, or living family members.
                </td>
              </tr>
              <tr>
                <td className="p-3.5 sm:px-4 font-medium text-rose-800">Hate Speech &amp; Slurs</td>
                <td className="p-3.5 sm:px-4">
                  <strong>Strictly Prohibited.</strong> Dehumanizing speech, racial or religious slurs, or hatred targeting race, ethnicity, religion, sexual orientation, disability, or gender.
                </td>
              </tr>
              <tr>
                <td className="p-3.5 sm:px-4 font-medium text-rose-800">Graphic Death &amp; Trauma Imagery</td>
                <td className="p-3.5 sm:px-4">
                  <strong>Strictly Prohibited.</strong> Autopsy photographs, open casket close-ups depicting severe injury, accident scenes, or graphic depictions of suffering.
                </td>
              </tr>
              <tr>
                <td className="p-3.5 sm:px-4 font-medium text-rose-800">Doxxing &amp; Private Information</td>
                <td className="p-3.5 sm:px-4">
                  <strong>Strictly Prohibited.</strong> Publishing living persons&apos; physical residential addresses, telephone numbers, bank details, or private medical records.
                </td>
              </tr>
              <tr>
                <td className="p-3.5 sm:px-4 font-medium text-rose-800">Scams &amp; Commercial Spam</td>
                <td className="p-3.5 sm:px-4">
                  <strong>Strictly Prohibited.</strong> SEO link schemes, product promotions, affiliate links, cryptocurrency schemes, or fraudulent charitable solicitations.
                </td>
              </tr>
              <tr>
                <td className="p-3.5 sm:px-4 font-medium text-rose-800">False Impersonation</td>
                <td className="p-3.5 sm:px-4">
                  <strong>Strictly Prohibited.</strong> Pretending to be an authorized family member, fabricating a death, or creating mock memorials for living persons.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 3. The Synthetic Media & AI Clones Rule */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xl sm:text-2xl font-medium text-[#181925]">
          3. Synthetic Media, Voice Clones &amp; Deepfakes
        </h2>
        <p>
          Generative artificial intelligence has introduced technologies that can clone human voices and animate still photos. For a sacred family archive, authenticity is non-negotiable.
        </p>
        <div className="p-4 rounded-2xl bg-[#fafafb] border border-black/[0.06] text-xs sm:text-sm text-[#454545] leading-relaxed flex flex-col gap-2">
          <p>
            <strong>What is Permitted:</strong> AI photo restoration (scratch removal, colorization, clarity enhancement, noise reduction) that makes an authentic historical photograph clearer to view.
          </p>
          <p>
            <strong>What is Prohibited:</strong> Materially AI-generated speech, video, or synthetic deepfakes that portray the deceased speaking words they never said or performing actions they never took must <strong>never be uploaded or presented as authentic archival media</strong>. Fabricated conversations or fake &ldquo;farewell recordings&rdquo; violate the core purpose of Theirs.
          </p>
        </div>
      </section>

      {/* 4. Visitor Contributions & Caretaker Role */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xl sm:text-2xl font-medium text-[#181925]">
          4. Visitor Contributions &amp; Moderation Process
        </h2>
        <p>
          Theirs is collaborative by design. Friends and extended family can contribute memories without forced account creation. To protect the space, we use a two-step moderation architecture:
        </p>
        <ol className="list-decimal pl-5 space-y-1.5 text-xs sm:text-sm text-[#555]">
          <li>
            <strong>Automated Safety Shield:</strong> New submissions are screened for malware, explicit content, spam links, and abusive text. Unsafe items are immediately quarantined.
          </li>
          <li>
            <strong>Caretaker Editorial Approval:</strong> Safe contributions land in the caretaker&apos;s private moderation dashboard. The memory becomes visible on the memorial only when the caretaker clicks &ldquo;Approve&rdquo;.
          </li>
        </ol>
        <p>
          <strong className="text-[#181925]">Note on Declined Memories:</strong> A caretaker may decline a contribution simply because it contains a photo they dislike, mentions a sensitive family matter, or does not fit the tone they envision. A declined contribution does not mean the contributor broke platform rules—it is simply a private family editorial choice.
        </p>
      </section>

      {/* 5. Content Involving Children */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xl sm:text-2xl font-medium text-[#181925]">
          5. Photographs &amp; Stories Involving Children
        </h2>
        <p>
          Special reverence applies to children and minors. We urge contributors to exercise care when posting photographs of living minors. If a parent or legal guardian objects to an image or story mentioning their child, we will promptly remove or blur that content upon request to{" "}
          <a href="mailto:support@theirs.page" className="text-primary underline font-medium">
            support@theirs.page
          </a>
          .
        </p>
      </section>

      {/* 6. Reporting Violations */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xl sm:text-2xl font-medium text-[#181925]">
          6. How to Report a Concern or Violation
        </h2>
        <p>
          If you encounter content that violates these guidelines, breaches copyright, infringes upon personal privacy, or impersonates your family, please report it immediately:
        </p>
        <div className="p-4 rounded-2xl bg-[#fafafb] border border-black/[0.06] text-xs sm:text-sm font-mono text-[#555] flex flex-col gap-1">
          <span>Theirs Trust &amp; Safety Team</span>
          <span>Email: support@theirs.page </span>
          <span>Please provide the memorial URL, description of the issue, and any relevant supporting details.</span>
        </div>
        <p className="text-xs text-[#71717a]">
          Reports are reviewed promptly by human moderators. Where violations are confirmed, we remove the offending material and may suspend or terminate responsible accounts.
        </p>
      </section>
    </LegalPageLayout>
  )
}
