import Link from "next/link"
import { TheirsNav } from "@/components/theirs/nav"
import { TheirsFooter } from "@/components/theirs/footer"
import { SectionHeader } from "@/components/theirs/section-header"
import { CtaBanner } from "@/components/theirs/cta-banner"
import { TheirsPricing } from "@/components/theirs/pricing"
import { LifePanorama } from "@/components/theirs/life-panorama"
import { SeoHeroInput } from "@/components/seo-pages/shared/seo-hero-input"
import { SeoFaqAccordion, type SeoFaqItem } from "@/components/seo-pages/shared/seo-faq-accordion"
import { SeoResourcesMesh } from "@/components/seo-pages/shared/seo-resources-mesh"
import {
  Check,
  ArrowRight,
  ExternalLink,
  Heart,
  Sparkles,
  ShieldCheck,
  Camera,
  MessageSquare,
  BadgeCheck,
  Lock,
} from "lucide-react"

export const FREE_MEMORIAL_FAQS: SeoFaqItem[] = [
  {
    id: "really-free",
    question: "Is Theirs really a free online memorial website?",
    answer:
      "Yes. You can create, publish, and share a memorial for someone you love without paying anything. The free plan includes their portrait, their life story, up to 5 photographs, and unlimited tributes from family and friends. We do not require a credit card to create or maintain a free memorial.",
  },
  {
    id: "trial-countdown",
    question: "Is the free memorial a trial that expires?",
    answer:
      "No. There is no trial countdown and your memorial is not automatically unpublished because you didn't upgrade. While we don't believe any online company can honestly promise that a web service will exist 'forever,' your free memorial remains active and accessible on Theirs without recurring renewal fees.",
  },
  {
    id: "what-is-included",
    question: "What is included in a free memorial?",
    answer:
      "A free memorial includes a dedicated web address (theirs.page/their-name), your loved one's portrait, an unhurried life story, up to 5 gallery photographs, unlimited written tributes from guests, caretaker approval controls, and public or link-only sharing settings. All memorials on Theirs are free of third-party advertisements.",
  },
  {
    id: "how-many-photos",
    question: "How many photos can I add for free?",
    answer:
      "You can upload their portrait plus up to 5 gallery photographs at original resolution. If your family wishes to assemble a larger visual archive spanning dozens or hundreds of photos, you can upgrade to Complete whenever you are ready.",
  },
  {
    id: "guest-accounts",
    question: "Can family and friends leave tributes without creating an account?",
    answer:
      "Yes. Guests do not need to register, download an application, or set a password to contribute. Anyone with the link can open the memorial on their phone or computer and leave a tribute or condolence. You review and approve every contribution before it goes live.",
  },
  {
    id: "privacy-levels",
    question: "Can I make a free memorial private?",
    answer:
      "Free memorials support two privacy settings: Public (searchable on search engines) and Link-only (unlisted, accessible only to people who have the exact URL). Fully password-protected memorials with a 4-digit family PIN are included with the Complete upgrade.",
  },
  {
    id: "google-indexing",
    question: "Will my memorial appear in Google search results?",
    answer:
      "Only if you choose the Public setting. If you select Link-only (unlisted), we add search engine directives instructing Google and other search engines not to index or display the page.",
  },
  {
    id: "upgrade-seamless",
    question: "Can I upgrade later without starting over?",
    answer:
      "Yes. If you start with a free memorial and decide weeks or months later to upgrade to Complete, all of your existing text, photographs, tributes, and your memorial's web address remain completely intact. Upgrading simply unlocks unlimited media, video, audio voicemails, the interactive life timeline, photo restoration, and PIN privacy.",
  },
  {
    id: "free-vs-complete",
    question: "What is the main difference between Free and Complete?",
    answer:
      "Free provides a focused, dignified memorial with up to 5 photographs and unlimited guest tributes. Complete ($179 one-time payment, no subscriptions) turns the memorial into a comprehensive family archive with unlimited original photos, audio notes, video clips, a chronological life timeline, photo restoration tools, PIN protection, and full data export.",
  },
  {
    id: "business-model",
    question: "How does Theirs make money if memorials can be free?",
    answer:
      "We operate on a transparent two-tier model. Families who need a simple memorial use Theirs at no charge. Families who want a comprehensive family archive purchase the one-time Complete upgrade. This straightforward model funds our hosting and maintenance so we never have to place third-party ads on memorials or charge visitors to leave a tribute.",
  },
]

export function FreeOnlineMemorialView() {
  return (
    <div className="min-h-screen bg-white text-[#666666] selection:bg-primary/10 selection:text-primary relative overflow-x-hidden">
      {/* Site-Wide Floating Frosted Pill Navbar */}
      <TheirsNav />

      {/* ===================================================================== */}
      {/* 1. HERO SECTION                                                       */}
      {/* ===================================================================== */}
      <section className="relative pt-16 sm:pt-14 pb-0 px-4 text-center overflow-hidden flex flex-col items-center bg-white">
        <div className="max-w-5xl mx-auto flex flex-col items-center w-full">
          {/* Eyebrow Badge */}
          <div className="mb-3.5 flex justify-center">
            <span
              data-slot="badge"
              className="flex items-center justify-center border font-medium w-fit whitespace-nowrap border-transparent bg-neutral-100 text-[#666] h-[24px] min-w-[24px] text-xs px-2.5 rounded-md select-none"
            >
              Free online memorial
            </span>
          </div>

          {/* H1 Heading */}
          <h1 className="text-balance text-4xl sm:text-6xl lg:text-[68px] font-medium tracking-[-0.04em] text-[#181925] leading-[1.04] mb-3.5">
            Create a free online memorial
            <br />
            <span className="text-primary">for someone you love.</span>
          </h1>

          {/* Subheading: Exact commercial answer */}
          <p className="mx-auto max-w-[680px] text-pretty text-base sm:text-xl leading-relaxed text-[#666] mb-5 sm:mb-6">
            Create and publish a memorial with their portrait, story,{" "}
            <span className="rounded-md bg-primary/10 box-decoration-clone px-1 py-0.5 text-primary font-medium">
              up to 5 photographs and tributes
            </span>{" "}
            from family and friends. No credit card required.
          </p>

          {/* Interactive Creation Pill Input */}
          <div className="w-full max-w-lg flex flex-col items-center gap-2 mb-4 sm:mb-5">
            <SeoHeroInput
              buttonLabel="Create a free memorial"
              placeholder="Robert Carter"
            />
          </div>

          {/* Compact Factual Trust Line */}
          <p className="text-center text-xs font-mono text-[#888] mb-8 sm:mb-12">
            $0 to create · No credit card · No third-party ads · Not a trial
          </p>

          {/* Curated Life Panorama Ribbon */}
          <LifePanorama />
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 2. FREE PLAN AT A GLANCE (EDITORIAL SPECIFICATION CANVAS)             */}
      {/* ===================================================================== */}
      <section className="w-full max-w-5xl px-4 sm:px-6 mx-auto py-16 sm:py-24 border-t border-black/[0.06] flex flex-col gap-12 sm:gap-14">
        <SectionHeader
          badge="Free Plan at a Glance"
          title="What do you get with a free Theirs memorial?"
          description="A clear, itemized breakdown of what is included at no cost, and what requires the optional Complete upgrade."
          className="max-w-3xl mx-auto"
        />

        {/* Outer Spec Canvas */}
        <div className="bg-[#f7f7f8] rounded-2xl sm:rounded-3xl border border-black/[0.06] overflow-hidden p-6 sm:p-10 flex flex-col gap-8">
          {/* Top 4 Key Assurances */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-black/[0.04] flex flex-col gap-2">
              <span className="size-8 rounded-full bg-neutral-100 flex items-center justify-center text-[#181925]">
                <BadgeCheck className="size-4 text-primary" />
              </span>
              <h4 className="text-sm font-medium text-[#181925]">$0 to publish</h4>
              <p className="text-xs text-[#666] leading-relaxed">
                Publish immediately without providing credit card or billing details.
              </p>
            </div>

            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-black/[0.04] flex flex-col gap-2">
              <span className="size-8 rounded-full bg-neutral-100 flex items-center justify-center text-[#181925]">
                <ShieldCheck className="size-4 text-emerald-600" />
              </span>
              <h4 className="text-sm font-medium text-[#181925]">No trial countdown</h4>
              <p className="text-xs text-[#666] leading-relaxed">
                Your memorial is not automatically deleted because you didn't upgrade.
              </p>
            </div>

            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-black/[0.04] flex flex-col gap-2">
              <span className="size-8 rounded-full bg-neutral-100 flex items-center justify-center text-[#181925]">
                <Heart className="size-4 text-primary" />
              </span>
              <h4 className="text-sm font-medium text-[#181925]">Zero 3rd-party ads</h4>
              <p className="text-xs text-[#666] leading-relaxed">
                We never place banner ads or advertising networks on your loved one's page.
              </p>
            </div>

            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-black/[0.04] flex flex-col gap-2">
              <span className="size-8 rounded-full bg-neutral-100 flex items-center justify-center text-[#181925]">
                <MessageSquare className="size-4 text-emerald-600" />
              </span>
              <h4 className="text-sm font-medium text-[#181925]">Unlimited tributes</h4>
              <p className="text-xs text-[#666] leading-relaxed">
                Friends and family contribute memories freely without mandatory account sign-up.
              </p>
            </div>
          </div>

          {/* Itemized Specification Table */}
          <div className="overflow-hidden rounded-xl sm:rounded-2xl border border-black/[0.06] bg-white">
            <div className="p-4 sm:p-6 overflow-x-auto">
              <p className="sm:hidden text-[11px] font-mono text-[#888] mb-2.5 text-right">
                Swipe horizontally to view all details →
              </p>
              <table className="w-full text-left border-collapse text-xs sm:text-sm min-w-[500px]">
                <thead>
                  <tr className="border-b border-black/[0.06]">
                    <th className="py-3 pr-4 font-mono uppercase tracking-wider text-[11px] text-[#888] font-medium">
                      Feature / Capability
                    </th>
                    <th className="py-3 px-4 font-mono uppercase tracking-wider text-[11px] text-[#888] font-medium">
                      Details
                    </th>
                    <th className="py-3 pl-4 font-mono uppercase tracking-wider text-[11px] text-[#181925] font-semibold text-right sm:text-left">
                      Free Plan
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.04] text-[#333]">
                  <tr>
                    <td className="py-3.5 pr-4 font-medium text-[#181925]">Dedicated Web Address</td>
                    <td className="py-3.5 px-4 text-xs text-[#666]">Clean URL (e.g. theirs.page/robert-carter)</td>
                    <td className="py-3.5 pl-4 text-right sm:text-left">
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60">
                        <Check className="size-3" /> Included
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3.5 pr-4 font-medium text-[#181925]">Main Portrait Photograph</td>
                    <td className="py-3.5 px-4 text-xs text-[#666]">Original quality focal portrait with life dates</td>
                    <td className="py-3.5 pl-4 text-right sm:text-left">
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60">
                        <Check className="size-3" /> Included
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3.5 pr-4 font-medium text-[#181925]">Written Life Story & Biography</td>
                    <td className="py-3.5 px-4 text-xs text-[#666]">Unhurried life narrative, memories, and family notes</td>
                    <td className="py-3.5 pl-4 text-right sm:text-left">
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60">
                        <Check className="size-3" /> Included
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3.5 pr-4 font-medium text-[#181925]">Gallery Photographs</td>
                    <td className="py-3.5 px-4 text-xs text-[#666]">Cherished milestone photos preserved without heavy compression</td>
                    <td className="py-3.5 pl-4 text-right sm:text-left">
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-[#181925] bg-neutral-100 px-2.5 py-1 rounded-full">
                        Up to 5
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3.5 pr-4 font-medium text-[#181925]">Guest Tributes & Condolences</td>
                    <td className="py-3.5 px-4 text-xs text-[#666]">Friends share stories directly from mobile or desktop</td>
                    <td className="py-3.5 pl-4 text-right sm:text-left">
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60">
                        <Check className="size-3" /> Unlimited
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3.5 pr-4 font-medium text-[#181925]">Guest Login Required</td>
                    <td className="py-3.5 px-4 text-xs text-[#666]">No account registration or app downloads required for contributors</td>
                    <td className="py-3.5 pl-4 text-right sm:text-left">
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60">
                        No login needed
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3.5 pr-4 font-medium text-[#181925]">Caretaker Moderation Queue</td>
                    <td className="py-3.5 px-4 text-xs text-[#666]">Review and approve all contributions before they appear publicly</td>
                    <td className="py-3.5 pl-4 text-right sm:text-left">
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60">
                        <Check className="size-3" /> Included
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3.5 pr-4 font-medium text-[#181925]">Privacy Controls</td>
                    <td className="py-3.5 px-4 text-xs text-[#666]">Public (indexed by Google) or Link-only (unlisted)</td>
                    <td className="py-3.5 pl-4 text-right sm:text-left">
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-[#181925] bg-neutral-100 px-2.5 py-1 rounded-full">
                        Public or Link-only
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3.5 pr-4 font-medium text-[#181925]">Third-Party Advertising</td>
                    <td className="py-3.5 px-4 text-xs text-[#666]">Banner ads, sponsored links, or commercial popups</td>
                    <td className="py-3.5 pl-4 text-right sm:text-left">
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60">
                        Zero ads (0)
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3.5 pr-4 font-medium text-[#181925]">Photo Restoration & Colorization</td>
                    <td className="py-3.5 px-4 text-xs text-[#666]">AI scratch removal, facial sharpening, and vintage colorization</td>
                    <td className="py-3.5 pl-4 text-right sm:text-left">
                      <span className="text-xs font-mono text-[#888]">Complete upgrade</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3.5 pr-4 font-medium text-[#181925]">Spoken Audio Notes & Video Clips</td>
                    <td className="py-3.5 px-4 text-xs text-[#666]">Voicemail recordings, laugh audio, and family video moments</td>
                    <td className="py-3.5 pl-4 text-right sm:text-left">
                      <span className="text-xs font-mono text-[#888]">Complete upgrade</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3.5 pr-4 font-medium text-[#181925]">Chronological Life Timeline</td>
                    <td className="py-3.5 px-4 text-xs text-[#666]">Interactive chapter timeline tracing their life from childhood to senior years</td>
                    <td className="py-3.5 pl-4 text-right sm:text-left">
                      <span className="text-xs font-mono text-[#888]">Complete upgrade</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3.5 pr-4 font-medium text-[#181925]">PIN-Protected Family Privacy</td>
                    <td className="py-3.5 px-4 text-xs text-[#666]">4-digit passcode gate keeping the memorial strictly within the family</td>
                    <td className="py-3.5 pl-4 text-right sm:text-left">
                      <span className="text-xs font-mono text-[#888]">Complete upgrade</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="border-t border-black/[0.06] bg-[#fafafa] p-5 sm:p-6 text-xs sm:text-sm text-[#666] leading-relaxed">
              <p>
                <strong className="text-[#181925] font-medium">The free plan is not a trial.</strong> You can create and publish a real memorial without entering payment information. The Complete upgrade is available later if your family needs more photographs, private access, richer media, restoration, and long-term archive features.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 3. HOW FREE MEMORIAL PLANS COMPARE (OBJECTIVE INDUSTRY BENCHMARK)     */}
      {/* ===================================================================== */}
      <section className="w-full max-w-5xl px-4 sm:px-6 mx-auto py-16 sm:py-24 border-t border-black/[0.06] flex flex-col gap-12 sm:gap-14">
        <SectionHeader
          badge="Market Research"
          title="How free online memorial plans compare."
          description="An objective comparison of free tiers across popular memorial websites. Information checked September 2026 from official pricing pages."
          className="max-w-3xl mx-auto"
        />

        <div className="bg-white rounded-2xl sm:rounded-3xl border border-black/[0.06] overflow-hidden p-6 sm:p-8 shadow-xs flex flex-col gap-6">
          <div className="overflow-x-auto">
            <p className="sm:hidden text-[11px] font-mono text-[#888] mb-2.5 text-right">
              Swipe horizontally to compare platforms →
            </p>
            <table className="w-full text-left border-collapse text-xs sm:text-sm min-w-[620px]">
              <thead>
                <tr className="border-b border-black/[0.08]">
                  <th className="py-3 pr-4 font-mono uppercase tracking-wider text-[11px] text-[#888] font-medium">
                    Platform
                  </th>
                  <th className="py-3 px-3 font-mono uppercase tracking-wider text-[11px] text-[#181925] font-semibold">
                    Free Memorial
                  </th>
                  <th className="py-3 px-3 font-mono uppercase tracking-wider text-[11px] text-[#181925] font-semibold">
                    Free Media Included
                  </th>
                  <th className="py-3 px-3 font-mono uppercase tracking-wider text-[11px] text-[#181925] font-semibold">
                    Guest Tributes
                  </th>
                  <th className="py-3 pl-3 font-mono uppercase tracking-wider text-[11px] text-[#888] font-medium">
                    Main Paid Upgrade
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.04] text-[#444]">
                <tr className="bg-primary/5 font-medium">
                  <td className="py-3.5 pr-4 text-[#181925] font-semibold flex items-center gap-1.5">
                    Theirs
                    <span className="text-[10px] font-mono text-primary font-normal bg-primary/10 px-1.5 py-0.5 rounded">
                      This page
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-emerald-600 font-medium">Yes</td>
                  <td className="py-3.5 px-3">5 photos (uncompressed)</td>
                  <td className="py-3.5 px-3">Yes (no login needed)</td>
                  <td className="py-3.5 pl-3 text-[#181925] font-medium">$179 one-time (Complete)</td>
                </tr>
                <tr>
                  <td className="py-3.5 pr-4 text-[#181925] font-medium">
                    <a
                      href="https://everloved.com/memorial-websites/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-primary inline-flex items-center gap-1"
                    >
                      Ever Loved <ExternalLink className="size-3 text-[#aaa]" />
                    </a>
                  </td>
                  <td className="py-3.5 px-3 text-emerald-600 font-medium">Yes</td>
                  <td className="py-3.5 px-3">Photos, videos, fundraising</td>
                  <td className="py-3.5 px-3">Yes</td>
                  <td className="py-3.5 pl-3">$199.99 one-time (Premium)</td>
                </tr>
                <tr>
                  <td className="py-3.5 pr-4 text-[#181925] font-medium">
                    <a
                      href="https://www.muchloved.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-primary inline-flex items-center gap-1"
                    >
                      MuchLoved <ExternalLink className="size-3 text-[#aaa]" />
                    </a>
                  </td>
                  <td className="py-3.5 px-3 text-emerald-600 font-medium">Yes</td>
                  <td className="py-3.5 px-3">200 MB free storage</td>
                  <td className="py-3.5 px-3">Yes</td>
                  <td className="py-3.5 pl-3">Donation model / storage add-ons</td>
                </tr>
                <tr>
                  <td className="py-3.5 pr-4 text-[#181925] font-medium">
                    <a
                      href="https://www.mykeeper.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-primary inline-flex items-center gap-1"
                    >
                      Keeper <ExternalLink className="size-3 text-[#aaa]" />
                    </a>
                  </td>
                  <td className="py-3.5 px-3 text-emerald-600 font-medium">Yes</td>
                  <td className="py-3.5 px-3">5 photos / videos</td>
                  <td className="py-3.5 px-3">Yes</td>
                  <td className="py-3.5 pl-3">$99.00 one-time (Plus)</td>
                </tr>
                <tr>
                  <td className="py-3.5 pr-4 text-[#181925] font-medium">
                    <a
                      href="https://www.forevermissed.com/ourplans"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-primary inline-flex items-center gap-1"
                    >
                      ForeverMissed <ExternalLink className="size-3 text-[#aaa]" />
                    </a>
                  </td>
                  <td className="py-3.5 px-3 text-emerald-600 font-medium">Yes</td>
                  <td className="py-3.5 px-3">5 photos</td>
                  <td className="py-3.5 px-3">Yes</td>
                  <td className="py-3.5 pl-3">$9.95/mo, $79.95/yr, or $159.95 life</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Objective Assessment Breakdown */}
          <div className="pt-4 border-t border-black/[0.06] grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 sm:p-5 rounded-xl bg-[#fafafa] border border-black/[0.04]">
              <span className="font-mono text-[10px] text-[#888] uppercase tracking-wider font-semibold">
                Alternative Strengths
              </span>
              <h4 className="text-sm font-medium text-[#181925] mt-1 mb-1.5">
                When another platform may fit you better
              </h4>
              <p className="text-xs text-[#666] leading-relaxed">
                Ever Loved is often the ideal choice if you need integrated funeral RSVP management or community crowdfunding. MuchLoved is exceptionally well suited for UK families collecting charitable donations in memory of someone they love.
              </p>
            </div>

            <div className="p-4 sm:p-5 rounded-xl bg-primary/5 border border-primary/15">
              <span className="font-mono text-[10px] text-primary uppercase tracking-wider font-semibold">
                Where Theirs Focuses
              </span>
              <h4 className="text-sm font-medium text-[#181925] mt-1 mb-1.5">
                Calm, collaborative, editorial remembrance
              </h4>
              <p className="text-xs text-[#666] leading-relaxed">
                Theirs is built specifically for families who want a serene, beautiful space to assemble memories, stories, and photographs together without third-party advertisements, recurring monthly invoices, or distracting clutter.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 4. HONEST BUSINESS MODEL: HOW DOES THEIRS MAKE MONEY? (BENTO CARDS)   */}
      {/* ===================================================================== */}
      <section className="w-full max-w-5xl px-4 sm:px-6 mx-auto py-16 sm:py-24 border-t border-black/[0.06] flex flex-col gap-12 sm:gap-14">
        <SectionHeader
          badge="Honest Business Model"
          title="If it's free, how does Theirs make money?"
          description="Memorial websites should have zero ambiguity about how they survive. Here is our exact commercial model."
          className="max-w-3xl mx-auto"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Free Tier */}
          <div className="flex flex-col justify-between bg-[#f7f7f8] rounded-2xl p-6 sm:p-7 border border-black/[0.04]">
            <div className="flex flex-col gap-3">
              <span className="w-10 h-9 rounded-full bg-white flex items-center justify-center border border-black/[0.06]">
                <Heart className="size-4 text-primary" />
              </span>
              <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-primary font-semibold">
                For Every Family
              </span>
              <h3 className="text-xl font-medium tracking-tight text-[#181925]">
                The free tier is subsidized, not crippled.
              </h3>
              <p className="text-xs sm:text-sm text-[#666] leading-relaxed">
                We believe every grieving family should have access to a dignified, serene memorial without reaching for a credit card. The free plan covers their portrait, story, 5 photos, and unlimited tributes without trial deadlines.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-black/[0.06] text-xs font-mono text-[#888]">
              $0 · No credit card required
            </div>
          </div>

          {/* Card 2: Complete Upgrade */}
          <div className="flex flex-col justify-between bg-[#f7f7f8] rounded-2xl p-6 sm:p-7 border border-black/[0.04]">
            <div className="flex flex-col gap-3">
              <span className="w-10 h-9 rounded-full bg-white flex items-center justify-center border border-black/[0.06]">
                <Sparkles className="size-4 text-primary" />
              </span>
              <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-primary font-semibold">
                Family Archive
              </span>
              <h3 className="text-xl font-medium tracking-tight text-[#181925]">
                Funded by families who want a complete archive.
              </h3>
              <p className="text-xs sm:text-sm text-[#666] leading-relaxed">
                Families who wish to assemble a comprehensive archive spanning hundreds of photos, voicemail audio, video tributes, photo restoration, and PIN privacy purchase our $179 one-time Complete upgrade.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-black/[0.06] text-xs font-mono text-[#888]">
              $179 one-time · No subscriptions
            </div>
          </div>

          {/* Card 3: What We Never Do */}
          <div className="flex flex-col justify-between bg-[#f7f7f8] rounded-2xl p-6 sm:p-7 border border-black/[0.04]">
            <div className="flex flex-col gap-3">
              <span className="w-10 h-9 rounded-full bg-white flex items-center justify-center border border-black/[0.06]">
                <ShieldCheck className="size-4 text-emerald-600" />
              </span>
              <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-emerald-600 font-semibold">
                Zero Compromise
              </span>
              <h3 className="text-xl font-medium tracking-tight text-[#181925]">
                No third-party ads or monetized grief.
              </h3>
              <p className="text-xs sm:text-sm text-[#666] leading-relaxed">
                Because our one-time upgrade model sustains our infrastructure, we never put banner advertising on memorials, never sell guest contact lists, and never charge friends to leave a condolence.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-black/[0.06] text-xs font-mono text-[#888]">
              100% advertising-free memorials
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 5. SEE WHAT A FREE MEMORIAL LOOKS LIKE (PRODUCT PROOF CANVAS)         */}
      {/* ===================================================================== */}
      <section className="w-full max-w-5xl px-4 sm:px-6 mx-auto py-16 sm:py-24 border-t border-black/[0.06] flex flex-col gap-12 sm:gap-14">
        <SectionHeader
          badge="Product Proof"
          title="See what a free online memorial can look like."
          description="Every free memorial has the same serene editorial typography and dignified layout as our paid tier."
          className="max-w-3xl mx-auto"
        />

        <div className="bg-[#f7f7f8] rounded-2xl sm:rounded-3xl border border-black/[0.06] overflow-hidden p-6 sm:p-10 flex flex-col gap-8">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-6 border-b border-black/[0.06]">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-primary font-medium">
                Live Example · theirs.page/robert-carter
              </span>
              <h3 className="text-2xl font-medium text-[#181925] mt-0.5">
                Robert Edward Carter
              </h3>
              <p className="font-mono text-xs text-[#888]">1948 — 2024 · Devon, UK</p>
            </div>
            <Link
              href="/robert-carter"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-[#8c3a10] transition-colors"
            >
              <span>Explore Robert&apos;s memorial</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </div>

          {/* Product Showcase: Live Preview Card + Editorial Specs */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Left Preview Card */}
            <div className="lg:col-span-6 bg-white rounded-2xl border border-black/[0.06] p-6 sm:p-7 flex flex-col justify-between shadow-2xs">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <div className="relative size-16 rounded-xl overflow-hidden bg-neutral-100 border border-black/10 shrink-0">
                    <img
                      src="/landing/robert-young.webp"
                      alt="Robert Carter"
                      className="size-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="text-base font-medium text-[#181925]">Robert Carter</h4>
                    <p className="text-xs font-mono text-[#888]">1948 — 2024 · Devon, UK</p>
                    <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-600 mt-1">
                      <span className="size-1.5 rounded-full bg-emerald-500" /> Free Memorial
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#fbfbfb] border border-black/[0.04]">
                  <p className="text-xs text-[#555] font-serif italic leading-relaxed">
                    “He lived with gentle kindness and quiet courage. Dad spent his life fixing clocks, wandering the Devon hills, and telling stories that took an hour to reach the punchline.”
                  </p>
                </div>

                {/* Sample Tribute */}
                <div className="p-3.5 rounded-xl bg-neutral-50 border border-black/[0.04] flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-medium text-[#181925]">Anita · Daughter</span>
                    <span className="font-mono text-[#888]">Verified contribution</span>
                  </div>
                  <p className="text-xs text-[#666] leading-relaxed">
                    “Dad spent half of Christmas Day fixing Mrs. Higgins' washing machine while everyone was waiting for lunch.”
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-black/[0.06] flex items-center justify-between text-xs text-[#888]">
                <span>5 photos included</span>
                <span className="text-emerald-600 font-medium">Guest tributes approved</span>
              </div>
            </div>

            {/* Right Specification List */}
            <div className="lg:col-span-6 flex flex-col justify-between gap-4">
              <div className="bg-white rounded-2xl p-5 border border-black/[0.06] flex items-start gap-4">
                <span className="size-9 rounded-xl bg-neutral-100 flex items-center justify-center text-[#181925] shrink-0 mt-0.5">
                  <Camera className="size-4 text-primary" />
                </span>
                <div>
                  <h4 className="text-sm font-medium text-[#181925]">Portrait & Curated Photos</h4>
                  <p className="text-xs text-[#666] leading-relaxed mt-1">
                    Upload a high-resolution portrait and up to 5 milestone photographs preserved in their original clarity without lossy compression.
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-black/[0.06] flex items-start gap-4">
                <span className="size-9 rounded-xl bg-neutral-100 flex items-center justify-center text-[#181925] shrink-0 mt-0.5">
                  <MessageSquare className="size-4 text-emerald-600" />
                </span>
                <div>
                  <h4 className="text-sm font-medium text-[#181925]">Unlimited Guest Tributes</h4>
                  <p className="text-xs text-[#666] leading-relaxed mt-1">
                    Family and friends leave stories and condolences from any mobile phone or computer without needing to register or download an app.
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-black/[0.06] flex items-start gap-4">
                <span className="size-9 rounded-xl bg-neutral-100 flex items-center justify-center text-[#181925] shrink-0 mt-0.5">
                  <Lock className="size-4 text-primary" />
                </span>
                <div>
                  <h4 className="text-sm font-medium text-[#181925]">Private Moderation Queue</h4>
                  <p className="text-xs text-[#666] leading-relaxed mt-1">
                    Every tribute waits in your private caretaker dashboard for approval before going live, giving you complete peace of mind.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 6. CREATE A FREE MEMORIAL IN A FEW MINUTES                            */}
      {/* ===================================================================== */}
      <section className="w-full max-w-5xl px-4 sm:px-6 mx-auto py-16 sm:py-24 border-t border-black/[0.06] flex flex-col gap-12 sm:gap-14">
        <SectionHeader
          badge="Simple Setup"
          title="Create a free memorial in a few minutes."
          description="You do not need to assemble a lifetime of photographs in an afternoon. Start simple and let the memorial grow."
          className="max-w-3xl mx-auto"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col justify-between rounded-2xl bg-[#f6f6f6] p-6 sm:p-7 border border-black/[0.06]">
            <div>
              <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                Step 01
              </span>
              <h3 className="text-lg font-medium tracking-tight text-[#181925] mt-2 mb-2">
                Start with their name
              </h3>
              <p className="text-xs sm:text-sm text-[#666] leading-relaxed">
                Add their name, life dates, and a favorite portrait. This claims your clean web address (like <code className="font-mono text-xs bg-black/[0.04] px-1 py-0.5 rounded">theirs.page/robert-carter</code>).
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-black/[0.06] text-xs font-mono text-[#888]">
              Instant web link
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-2xl bg-[#f6f6f6] p-6 sm:p-7 border border-black/[0.06]">
            <div>
              <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                Step 02
              </span>
              <h3 className="text-lg font-medium tracking-tight text-[#181925] mt-2 mb-2">
                Add what you have today
              </h3>
              <p className="text-xs sm:text-sm text-[#666] leading-relaxed">
                Add up to 5 photographs and the beginning of their story. You don&apos;t need to finish everything right now — you can return anytime.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-black/[0.06] text-xs font-mono text-[#888]">
              Save and return anytime
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-2xl bg-[#f6f6f6] p-6 sm:p-7 border border-black/[0.06]">
            <div>
              <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                Step 03
              </span>
              <h3 className="text-lg font-medium tracking-tight text-[#181925] mt-2 mb-2">
                Share with family & friends
              </h3>
              <p className="text-xs sm:text-sm text-[#666] leading-relaxed">
                Share one link so people who loved them can add tributes, stories, and condolences. You review and approve each contribution.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-black/[0.06] text-xs font-mono text-[#888]">
              Collaborative tribute feed
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 7. PLAN GUIDANCE: WHEN IS FREE ENOUGH?                                */}
      {/* ===================================================================== */}
      <section className="w-full max-w-5xl px-4 sm:px-6 mx-auto py-16 sm:py-24 border-t border-black/[0.06] flex flex-col gap-12 sm:gap-14">
        <SectionHeader
          badge="Plan Guidance"
          title="Start free. Upgrade only when the memorial needs more room."
          description="We designed our plans so families only upgrade if they genuinely need the features of a larger family archive."
          className="max-w-3xl mx-auto"
        />

        <div className="bg-[#f7f7f8] rounded-2xl sm:rounded-3xl border border-black/[0.06] p-6 sm:p-10 flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Free Plan Guidance */}
            <div className="bg-white rounded-2xl border border-black/[0.06] p-6 sm:p-7 flex flex-col justify-between">
              <div>
                <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#181925] font-semibold">
                  Free Memorial · $0
                </span>
                <h3 className="text-lg font-medium text-[#181925] mt-1.5 mb-3">
                  Free is likely all you need if:
                </h3>
                <ul className="space-y-2.5 text-xs sm:text-sm text-[#555]">
                  <li className="flex items-start gap-2">
                    <Check className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>You want a serene place to share their story, portrait, and funeral details.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>A small selection of 5 favorite milestone photographs is sufficient.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Your primary goal is collecting condolences and stories from family and friends.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>You want a clean link to share in an obituary, email, or WhatsApp message.</span>
                  </li>
                </ul>
              </div>
              <div className="mt-6 pt-4 border-t border-black/[0.06] text-xs font-mono text-emerald-700">
                100% Free · No credit card required
              </div>
            </div>

            {/* Complete Upgrade Guidance */}
            <div className="bg-white rounded-2xl border border-primary/20 p-6 sm:p-7 flex flex-col justify-between">
              <div>
                <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-primary font-semibold">
                  Complete Archive · $179 One-Time
                </span>
                <h3 className="text-lg font-medium text-[#181925] mt-1.5 mb-3">
                  Complete makes more sense if:
                </h3>
                <ul className="space-y-2.5 text-xs sm:text-sm text-[#555]">
                  <li className="flex items-start gap-2">
                    <Check className="size-4 text-primary shrink-0 mt-0.5" />
                    <span>You want to preserve a larger family archive with dozens or hundreds of photos.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="size-4 text-primary shrink-0 mt-0.5" />
                    <span>You have voicemail recordings, voice notes, or video tributes you want preserved.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="size-4 text-primary shrink-0 mt-0.5" />
                    <span>You want an interactive chronological timeline tracing their decades of life.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="size-4 text-primary shrink-0 mt-0.5" />
                    <span>You need password-protected PIN privacy or want to restore old family portraits.</span>
                  </li>
                </ul>
              </div>
              <div className="mt-6 pt-4 border-t border-black/[0.06] text-xs font-mono text-primary">
                One-time payment · Never recurring
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 8. ORIGINAL LANDING PAGE PRICING COMPONENT                            */}
      {/* ===================================================================== */}
      <TheirsPricing />

      {/* ===================================================================== */}
      {/* 9. DETAILED FAQS                                                      */}
      {/* ===================================================================== */}
      <section className="w-full max-w-5xl px-4 sm:px-6 mx-auto py-16 sm:py-24 border-t border-black/[0.06] flex flex-col gap-12 sm:gap-14">
        <SectionHeader
          badge="FAQs"
          title="Common questions about our free memorial website."
          description="Clear, factual answers to help you decide whether a free Theirs memorial fits what your family needs."
          className="max-w-3xl mx-auto"
        />

        <div className="w-full max-w-3xl mx-auto">
          <SeoFaqAccordion items={FREE_MEMORIAL_FAQS} />
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 10. RELEVANT GUIDES (CONTEXTUAL INTERNAL MESH)                        */}
      {/* ===================================================================== */}
      <SeoResourcesMesh
        currentPath="/free-online-memorial"
        title="More memorial guides and resources."
        description="Helpful reading as you consider how best to remember your loved one."
      />

      {/* ===================================================================== */}
      {/* 11. CLOSING CTA BANNER & FOOTER                                       */}
      {/* ===================================================================== */}
      <CtaBanner />
      <TheirsFooter />
    </div>
  )
}
