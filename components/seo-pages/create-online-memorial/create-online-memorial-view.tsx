import { TheirsNav } from "@/components/theirs/nav"
import { TheirsFooter } from "@/components/theirs/footer"
import { SectionHeader } from "@/components/theirs/section-header"
import { CtaBanner } from "@/components/theirs/cta-banner"
import { LifePanorama } from "@/components/theirs/life-panorama"
import { TheirsSteps } from "@/components/theirs/steps"
import { TheirsPricing } from "@/components/theirs/pricing"
import { SeoHeroInput } from "@/components/seo-pages/shared/seo-hero-input"
import { SeoFaqAccordion, type SeoFaqItem } from "@/components/seo-pages/shared/seo-faq-accordion"
import { SeoResourcesMesh } from "@/components/seo-pages/shared/seo-resources-mesh"
import {
  ShieldCheck,
  Users,
  Image as ImageIcon,
  Sparkles,
  Lock,
  Mic,
  Share2,
  SlidersHorizontal,
} from "lucide-react"

export const CREATE_MEMORIAL_FAQS: SeoFaqItem[] = [
  {
    id: "setup-time",
    question: "How long does it take to create an online memorial?",
    answer:
      "You can create and publish an initial memorial in less than 60 seconds. Simply enter their name, choose an address (e.g. theirs.page/robert-carter), and add a portrait photograph. You can invite family immediately, or take your time adding stories, life chapters, and voice notes whenever you feel ready.",
  },
  {
    id: "contributor-accounts",
    question: "Do family members and friends have to create an account to contribute?",
    answer:
      "No. Family and friends can add photos, write personal memories, leave condolences, and record voice notes directly from their phone or computer without signing up, downloading an app, or remembering a password. This ensures older relatives and distant friends can participate effortlessly.",
  },
  {
    id: "moderation-control",
    question: "Can I review and approve memories before they appear on the page?",
    answer:
      "Yes. You are the caretaker of the memorial. Every tribute, photograph, or memory submitted by family and friends can be held in your private moderation queue until you approve it. This protects the space and ensures only respectful, meaningful contributions appear.",
  },
  {
    id: "cost-structure",
    question: "Is it free to create an online memorial on Theirs?",
    answer:
      "Yes. You can start completely free. The Free plan includes a dedicated memorial web address, portrait and biography, up to 5 photographs, and unlimited tributes from loved ones with zero advertising. If you later wish to add unlimited original photographs, voice notes, an interactive life timeline, or photo restoration, you can upgrade to the Complete Memorial for a single one-time payment of $179 with zero monthly subscriptions.",
  },
  {
    id: "privacy-controls",
    question: "Can I keep the memorial private or password-protected?",
    answer:
      "Yes. Theirs supports three privacy levels: Public (findable online), Unlisted (accessible only to people who have the link), and Private (requires a secure 4-digit PIN code you share with family). You can change these settings at any time with a single tap.",
  },
  {
    id: "data-export",
    question: "Can our family export or download our photos and stories?",
    answer:
      "Yes. We believe your family should never be trapped inside any platform. You can export all uploaded photographs in their original high resolution, along with written memories and tributes, at any time.",
  },
  {
    id: "memorial-vs-obituary",
    question: "How is an online memorial different from an online obituary?",
    answer:
      "An obituary is a formal announcement that someone has died, traditionally published in a newspaper or funeral home website with funeral details. An online memorial website is an enduring, collaborative space where family and friends gather photographs, voice notes, and stories that continue to grow richer over time.",
  },
]

export function CreateOnlineMemorialView() {
  return (
    <div className="min-h-screen bg-white text-[#666666] selection:bg-primary/10 selection:text-primary relative overflow-x-hidden">
      {/* Site-Wide Floating Frosted Pill Navbar */}
      <TheirsNav />

      {/* ===================================================================== */}
      {/* 1. HERO SECTION WITH SIGNATURE LIFE PANORAMA                          */}
      {/* ===================================================================== */}
      <section className="relative pt-16 sm:pt-14 pb-0 px-4 text-center overflow-hidden flex flex-col items-center bg-white">
        <div className="max-w-5xl mx-auto flex flex-col items-center w-full">
          {/* Eyebrow Badge */}
          <div className="mb-3.5 flex justify-center">
            <span
              data-slot="badge"
              className="flex items-center justify-center border font-medium w-fit whitespace-nowrap border-transparent bg-neutral-100 text-[#666] h-[24px] min-w-[24px] text-xs px-2.5 rounded-md select-none"
            >
              Online memorial creator
            </span>
          </div>

          {/* H1 Heading */}
          <h1 className="text-balance text-4xl sm:text-6xl lg:text-[68px] font-medium tracking-[-0.04em] text-[#181925] leading-[1.04] mb-3.5">
            Create an online memorial
            <br />
            <span className="text-primary">for someone you love.</span>
          </h1>

          {/* Subheading */}
          <p className="mx-auto max-w-[660px] text-pretty text-base sm:text-xl leading-relaxed text-[#666] mb-5 sm:mb-6">
            Bring their photos, stories and tributes{" "}
            <span className="rounded-md bg-primary/10 box-decoration-clone px-1 py-0.5 text-primary font-medium">
              together in one place
            </span>
            , then invite family and friends to add the memories only they remember.
          </p>

          {/* Interactive Creation Pill Input */}
          <div className="w-full max-w-lg flex flex-col items-center gap-2 mb-4 sm:mb-5">
            <SeoHeroInput
              buttonLabel="Create their memorial"
              placeholder="Robert Carter"
            />
          </div>

          {/* Clean Trust Line */}
          <p className="text-center text-xs font-mono text-[#888] mb-8 sm:mb-12">
            Free to start · No credit card required · Takes less than 60 seconds
          </p>

          {/* Signature Museum-Grade Curved Life Panorama */}
          <LifePanorama />
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 2. ORIGINAL THREE-STEP ANIMATED SHOWCASE CARDS                        */}
      {/* ===================================================================== */}
      <TheirsSteps />

      {/* ===================================================================== */}
      {/* 3. KEY DIFFERENTIATORS (WHY FAMILIES CHOOSE THEIRS)                   */}
      {/* ===================================================================== */}
      <section className="py-16 sm:py-24 px-4 max-w-5xl mx-auto border-t border-black/[0.06]">
        <SectionHeader
          badge="Thoughtful Design"
          title="Built to honor a life, not fill out a database."
          description={
            <>
              Traditional memorial platforms feel like government registries or cluttered noticeboards. Theirs is designed with{" "}
              <span className="rounded-md bg-primary/10 box-decoration-clone px-1 py-0.5 text-primary">
                intimate, editorial warmth
              </span>
              .
            </>
          }
        />

        <div className="mt-12 sm:mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="rounded-2xl bg-[#fafafa] border border-black/[0.06] p-6 flex flex-col">
            <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
              <Users className="size-4.5" />
            </div>
            <h4 className="text-base font-medium text-[#181925] mb-2">
              No account required to contribute
            </h4>
            <p className="text-sm text-[#666] leading-relaxed">
              Grandparents, childhood friends, and distant relatives can submit a heartfelt memory, photo, or condolence from their mobile phone in seconds without passwords or app downloads.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="rounded-2xl bg-[#fafafa] border border-black/[0.06] p-6 flex flex-col">
            <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
              <ShieldCheck className="size-4.5" />
            </div>
            <h4 className="text-base font-medium text-[#181925] mb-2">
              Caretaker approval & moderation
            </h4>
            <p className="text-sm text-[#666] leading-relaxed">
              You stay in full control. All submissions go into your private moderation inbox. Nothing appears publicly until you review and approve it.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="rounded-2xl bg-[#fafafa] border border-black/[0.06] p-6 flex flex-col">
            <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
              <Mic className="size-4.5" />
            </div>
            <h4 className="text-base font-medium text-[#181925] mb-2">
              Voice notes & spoken stories
            </h4>
            <p className="text-sm text-[#666] leading-relaxed">
              Photographs show how someone looked; their voice brings them back into the room. Preserve old voicemails, spoken memories, or video clips directly on their page.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="rounded-2xl bg-[#fafafa] border border-black/[0.06] p-6 flex flex-col">
            <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
              <ImageIcon className="size-4.5" />
            </div>
            <h4 className="text-base font-medium text-[#181925] mb-2">
              Original quality preservation
            </h4>
            <p className="text-sm text-[#666] leading-relaxed">
              Most social platforms crush images down to tiny compressed files. Theirs preserves original full-resolution files so your family archive stays intact forever.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="rounded-2xl bg-[#fafafa] border border-black/[0.06] p-6 flex flex-col">
            <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
              <SlidersHorizontal className="size-4.5" />
            </div>
            <h4 className="text-base font-medium text-[#181925] mb-2">
              Interactive life timeline
            </h4>
            <p className="text-sm text-[#666] leading-relaxed">
              Chronicle their journey through chapters: childhood adventures, military service, marriage, parenthood, career achievements, and retirement.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="rounded-2xl bg-[#fafafa] border border-black/[0.06] p-6 flex flex-col">
            <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
              <Sparkles className="size-4.5" />
            </div>
            <h4 className="text-base font-medium text-[#181925] mb-2">
              Zero advertisements, forever
            </h4>
            <p className="text-sm text-[#666] leading-relaxed">
              We never run third-party advertising, popup banners, flower commission links, or sponsored funeral promotions. Your loved one&apos;s memory remains sacred.
            </p>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 4. PRIVACY & CONTROL ARCHITECTURE                                     */}
      {/* ===================================================================== */}
      <section className="py-16 sm:py-24 px-4 max-w-5xl mx-auto border-t border-black/[0.06]">
        <SectionHeader
          badge="Privacy Controls"
          title="Share openly or keep it strictly within the family."
          description={
            <>
              Every family has different comfort levels with online visibility. You can change your memorial&apos;s privacy status{" "}
              <span className="rounded-md bg-primary/10 box-decoration-clone px-1 py-0.5 text-primary">
                at any time with one click
              </span>
              .
            </>
          }
        />

        <div className="mt-12 sm:mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Public */}
          <div className="rounded-2xl bg-white border border-black/[0.08] p-6 flex flex-col shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-xs uppercase tracking-wider text-[#181925] font-semibold">
                Public
              </span>
              <Share2 className="size-4 text-[#888]" />
            </div>
            <h4 className="text-base font-medium text-[#181925] mb-2">
              Findable online
            </h4>
            <p className="text-sm text-[#666] leading-relaxed mb-4">
              Visible to anyone with the link and indexed by search engines. Ideal when you want distant colleagues, friends, and community members to discover the memorial easily.
            </p>
            <div className="mt-auto text-xs font-mono text-[#888] bg-neutral-50 p-2.5 rounded-lg border border-black/[0.04]">
              Indexed on Google · Open to all visitors
            </div>
          </div>

          {/* Unlisted */}
          <div className="rounded-2xl bg-white border border-black/[0.08] p-6 flex flex-col shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-xs uppercase tracking-wider text-primary font-semibold">
                Unlisted (Most Popular)
              </span>
              <Lock className="size-4 text-primary" />
            </div>
            <h4 className="text-base font-medium text-[#181925] mb-2">
              Accessible only via private link
            </h4>
            <p className="text-sm text-[#666] leading-relaxed mb-4">
              Hidden from search engines like Google. Only people who receive the private link or scan the funeral program QR code can view and contribute.
            </p>
            <div className="mt-auto text-xs font-mono text-primary bg-primary/5 p-2.5 rounded-lg border border-primary/10">
              Not indexed · Accessible only by link
            </div>
          </div>

          {/* Private */}
          <div className="rounded-2xl bg-white border border-black/[0.08] p-6 flex flex-col shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-xs uppercase tracking-wider text-[#181925] font-semibold">
                Private PIN
              </span>
              <ShieldCheck className="size-4 text-[#888]" />
            </div>
            <h4 className="text-base font-medium text-[#181925] mb-2">
              Password-protected access
            </h4>
            <p className="text-sm text-[#666] leading-relaxed mb-4">
              Requires visitors to enter a 4-digit PIN code that you set and share. Perfect for keeping sensitive family photographs and private stories strictly confidential.
            </p>
            <div className="mt-auto text-xs font-mono text-[#888] bg-neutral-50 p-2.5 rounded-lg border border-black/[0.04]">
              4-digit PIN required · Complete privacy
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 5. ORIGINAL PRICING COMPONENT DIRECT FROM LANDING                     */}
      {/* ===================================================================== */}
      <TheirsPricing />

      {/* ===================================================================== */}
      {/* 6. FREQUENTLY ASKED QUESTIONS                                         */}
      {/* ===================================================================== */}
      <section className="py-16 sm:py-24 px-4 max-w-3xl mx-auto border-t border-black/[0.06]">
        <SectionHeader
          badge="Questions & Answers"
          title="Everything you need to know about creating an online memorial."
          description={
            <>
              Honest, transparent answers about privacy, contribution workflows, and data ownership,{" "}
              <span className="rounded-md bg-primary/10 box-decoration-clone px-1 py-0.5 text-primary">
                without technical jargon
              </span>
              .
            </>
          }
        />

        <div className="mt-12 sm:mt-16">
          <SeoFaqAccordion items={CREATE_MEMORIAL_FAQS} />
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 7. INTERCONNECTED EXPLORATION GRID (INTERNAL LINKING NETWORK)         */}
      {/* ===================================================================== */}
      <SeoResourcesMesh currentPath="/create-online-memorial" />

      {/* ===================================================================== */}
      {/* 8. CLOSING CTA BANNER                                                 */}
      {/* ===================================================================== */}
      <CtaBanner />

      {/* Site Footer */}
      <TheirsFooter />
    </div>
  )
}
