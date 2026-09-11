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
  X,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Heart,
  Sparkles,
  HelpCircle,
  Clock,
  Lock,
  Camera,
  MessageSquare,
  AlertCircle,
  DollarSign,
  Star,
} from "lucide-react"

export const BEST_MEMORIALS_FAQS: SeoFaqItem[] = [
  {
    id: "which-platform-is-best",
    question: "Which online memorial website is best overall?",
    answer:
      "The best platform depends on your primary need. If you want a calm, editorial, ad-free memorial celebrating a loved one's full life story with collaborative memories and no monthly fees, Theirs is the best overall choice. If you specifically need funeral RSVP coordination or community crowdfunding, Ever Loved is the strongest fit. For family tree integration, Keeper excels. For UK charitable fundraising, MuchLoved is the industry standard.",
  },
  {
    id: "completely-free-platforms",
    question: "Are any memorial websites completely free?",
    answer:
      "Yes. Several platforms offer genuine free plans. Theirs provides a $0 free plan that includes a dedicated web address, portrait, life story, up to 5 photographs, and unlimited tributes without third-party ads or credit card requirements. Ever Loved and MuchLoved also offer robust free tiers supported by optional donations or premium upgrades.",
  },
  {
    id: "avoid-subscription-traps",
    question: "Why do some memorial websites charge monthly subscriptions?",
    answer:
      "Some legacy platforms charge monthly fees ($5 to $15/month) or annual renewals. This can create anxiety for grieving families who fear their loved one's tribute will be deleted if a credit card expires. We strongly recommend choosing platforms that offer permanent free tiers or transparent one-time payment models like Theirs ($179 one-time) or Keeper ($99 one-time).",
  },
  {
    id: "ad-free-importance",
    question: "Do memorial websites show advertisements?",
    answer:
      "Some platforms monetize free pages by showing programmatic banner ads, sponsored links, or funeral vendor recommendations. Theirs is 100% ad-free across both free and complete plans. We believe a memorial is a sacred personal space that should never be cluttered with commercial advertising.",
  },
  {
    id: "guest-accounts-needed",
    question: "Do guests need to create an account to leave a tribute?",
    answer:
      "On Theirs, guests do not need to register, download an app, or create a password. Anyone with the memorial link can leave a condolence or story directly from their phone. As the caretaker, you review and approve every submission privately before it appears publicly.",
  },
  {
    id: "switch-platforms-later",
    question: "Can I move my memorial or export photos if I change my mind?",
    answer:
      "With Theirs Complete, you preserve all photos at original, uncompressed resolution and can download the complete archive. Before choosing any platform, verify that you retain ownership of your family media and that the site does not aggressively compress high-resolution images.",
  },
  {
    id: "privacy-and-protection",
    question: "How do memorial websites protect family privacy?",
    answer:
      "Modern platforms provide multiple privacy levels. On Theirs, you can keep a memorial Public (searchable on Google), Link-only (unlisted, accessible only to people with the exact URL), or PIN-protected with a 4-digit family passcode.",
  },
  {
    id: "how-long-do-memorials-stay-online",
    question: "How long will an online memorial stay active?",
    answer:
      "Reputable platforms maintain memorial pages indefinitely without forced deletion deadlines. On Theirs, free memorials remain accessible without trial countdowns, and Complete memorials are permanently sustained by one-time payments without recurring hosting bills.",
  },
]

export function BestOnlineMemorialWebsitesView() {
  return (
    <div className="min-h-screen bg-white text-[#666666] selection:bg-primary/10 selection:text-primary relative overflow-x-hidden">
      {/* Floating Frosted Pill Navbar */}
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
              Independent Comparison · 2026 Guide
            </span>
          </div>

          {/* H1 Heading */}
          <h1 className="text-balance text-4xl sm:text-6xl lg:text-[68px] font-medium tracking-[-0.04em] text-[#181925] leading-[1.04] mb-3.5">
            The best online memorial
            <br />
            <span className="text-primary">websites in 2026.</span>
          </h1>

          {/* Subheading */}
          <p className="mx-auto max-w-[680px] text-pretty text-base sm:text-xl leading-relaxed text-[#666] mb-5 sm:mb-6">
            An objective comparison of pricing, advertising policies, guest access, and longevity across the{" "}
            <span className="rounded-md bg-primary/10 box-decoration-clone px-1 py-0.5 text-primary font-medium">
              leading memorial platforms
            </span>
            .
          </p>

          {/* Interactive Creation Pill Input */}
          <div className="w-full max-w-lg flex flex-col items-center gap-2 mb-4 sm:mb-5">
            <SeoHeroInput
              buttonLabel="Create a memorial"
              placeholder="Robert Carter"
            />
          </div>

          {/* Compact Trust Line */}
          <p className="text-center text-xs font-mono text-[#888] mb-8 sm:mb-12">
            Updated September 2026 · Independent evaluation · Ad-free spaces · Verified pricing
          </p>

          {/* Curated Life Panorama Ribbon */}
          <LifePanorama />
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 2. MASTER 2026 COMPARISON TABLE                                       */}
      {/* ===================================================================== */}
      <section className="w-full max-w-5xl px-4 sm:px-6 mx-auto py-16 sm:py-24 border-t border-black/[0.06] flex flex-col gap-12 sm:gap-14">
        <SectionHeader
          badge="2026 Benchmark"
          title="How the leading memorial websites compare."
          description="Direct side-by-side evaluation of the 5 most popular platforms based on official public pricing, feature documentation, and advertising policies."
          className="max-w-3xl mx-auto"
        />

        <div className="bg-white rounded-2xl sm:rounded-3xl border border-black/[0.06] overflow-hidden p-6 sm:p-8 shadow-xs flex flex-col gap-6">
          <div className="overflow-x-auto">
            <p className="sm:hidden text-[11px] font-mono text-[#888] mb-2.5 text-right">
              Swipe horizontally to compare platforms →
            </p>
            <table className="w-full text-left border-collapse text-xs sm:text-sm min-w-[700px]">
              <thead>
                <tr className="border-b border-black/[0.08]">
                  <th className="py-3 pr-4 font-mono uppercase tracking-wider text-[11px] text-[#888] font-medium">
                    Platform
                  </th>
                  <th className="py-3 px-3 font-mono uppercase tracking-wider text-[11px] text-[#888] font-medium">
                    Best For
                  </th>
                  <th className="py-3 px-3 font-mono uppercase tracking-wider text-[11px] text-[#888] font-medium">
                    Free Plan
                  </th>
                  <th className="py-3 px-3 font-mono uppercase tracking-wider text-[11px] text-[#888] font-medium">
                    Paid Pricing Model
                  </th>
                  <th className="py-3 px-3 font-mono uppercase tracking-wider text-[11px] text-[#888] font-medium">
                    3rd-Party Ads
                  </th>
                  <th className="py-3 pl-3 font-mono uppercase tracking-wider text-[11px] text-[#888] font-medium">
                    Guest Account Required
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.04] text-[#444]">
                {/* Theirs */}
                <tr className="bg-primary/5 font-medium">
                  <td className="py-3.5 pr-4 text-[#181925] font-semibold flex items-center gap-1.5">
                    Theirs
                    <span className="text-[10px] font-mono text-primary font-normal bg-primary/10 px-1.5 py-0.5 rounded">
                      Editor&apos;s Pick
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-[#181925]">
                    Calm, editorial storytelling & family archives
                  </td>
                  <td className="py-3.5 px-3 text-emerald-600 font-medium">
                    Yes ($0, 5 photos, tributes)
                  </td>
                  <td className="py-3.5 px-3 text-[#181925] font-medium">
                    $179 one-time (Never subscriptions)
                  </td>
                  <td className="py-3.5 px-3 text-emerald-600 font-medium">
                    0 Ads (100% ad-free)
                  </td>
                  <td className="py-3.5 pl-3 text-emerald-600 font-medium">
                    No login needed
                  </td>
                </tr>

                {/* Ever Loved */}
                <tr>
                  <td className="py-3.5 pr-4 text-[#181925] font-medium">
                    <a
                      href="https://everloved.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-primary inline-flex items-center gap-1"
                    >
                      Ever Loved <ExternalLink className="size-3 text-[#aaa]" />
                    </a>
                  </td>
                  <td className="py-3.5 px-3 text-[#666]">
                    Funeral RSVPs & community fundraising
                  </td>
                  <td className="py-3.5 px-3 text-emerald-600 font-medium">
                    Yes (photos, video, RSVPs)
                  </td>
                  <td className="py-3.5 px-3 text-[#181925]">
                    $199.99 one-time (Premium)
                  </td>
                  <td className="py-3.5 px-3 text-[#666]">
                    Minimal / fundraising tips
                  </td>
                  <td className="py-3.5 pl-3 text-[#666]">
                    Email verification
                  </td>
                </tr>

                {/* Keeper */}
                <tr>
                  <td className="py-3.5 pr-4 text-[#181925] font-medium">
                    <a
                      href="https://mykeeper.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-primary inline-flex items-center gap-1"
                    >
                      Keeper <ExternalLink className="size-3 text-[#aaa]" />
                    </a>
                  </td>
                  <td className="py-3.5 px-3 text-[#666]">
                    Family trees & cemetery GPS mapping
                  </td>
                  <td className="py-3.5 px-3 text-emerald-600 font-medium">
                    Yes (5 photos/videos)
                  </td>
                  <td className="py-3.5 px-3 text-[#181925]">
                    $99.00 one-time (Plus)
                  </td>
                  <td className="py-3.5 px-3 text-emerald-600 font-medium">
                    Ad-free
                  </td>
                  <td className="py-3.5 pl-3 text-[#666]">
                    Optional
                  </td>
                </tr>

                {/* ForeverMissed */}
                <tr>
                  <td className="py-3.5 pr-4 text-[#181925] font-medium">
                    <a
                      href="https://forevermissed.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-primary inline-flex items-center gap-1"
                    >
                      ForeverMissed <ExternalLink className="size-3 text-[#aaa]" />
                    </a>
                  </td>
                  <td className="py-3.5 px-3 text-[#666]">
                    Traditional template tributes & guestbooks
                  </td>
                  <td className="py-3.5 px-3 text-emerald-600 font-medium">
                    Yes (5 photos)
                  </td>
                  <td className="py-3.5 px-3 text-[#181925]">
                    $9.95/mo, $79.95/yr, or $159.95 life
                  </td>
                  <td className="py-3.5 px-3 text-emerald-600 font-medium">
                    Ad-free
                  </td>
                  <td className="py-3.5 pl-3 text-[#666]">
                    Optional
                  </td>
                </tr>

                {/* MuchLoved */}
                <tr>
                  <td className="py-3.5 pr-4 text-[#181925] font-medium">
                    <a
                      href="https://muchloved.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-primary inline-flex items-center gap-1"
                    >
                      MuchLoved <ExternalLink className="size-3 text-[#aaa]" />
                    </a>
                  </td>
                  <td className="py-3.5 px-3 text-[#666]">
                    UK charity donation funds in memory
                  </td>
                  <td className="py-3.5 px-3 text-emerald-600 font-medium">
                    Yes (200MB free storage)
                  </td>
                  <td className="py-3.5 px-3 text-[#181925]">
                    Donation model / charity fee
                  </td>
                  <td className="py-3.5 px-3 text-emerald-600 font-medium">
                    Non-profit (no commercial ads)
                  </td>
                  <td className="py-3.5 pl-3 text-[#666]">
                    Optional
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="pt-4 border-t border-black/[0.06] text-xs sm:text-sm text-[#666] leading-relaxed">
            <p>
              <strong className="text-[#181925] font-medium">How we evaluate platforms:</strong> We prioritize permanent accessibility, absence of predatory monthly subscription renewals, zero third-party advertising, and frictionless contribution flows that allow grieving family members to participate easily.
            </p>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 3. IN-DEPTH PLATFORM REVIEWS                                          */}
      {/* ===================================================================== */}
      <section className="w-full max-w-5xl px-4 sm:px-6 mx-auto py-16 sm:py-24 border-t border-black/[0.06] flex flex-col gap-12 sm:gap-14">
        <SectionHeader
          badge="Platform Reviews"
          title="In-depth reviews of the top memorial websites."
          description="A detailed analysis of what each platform does best, where it falls short, and how its pricing works."
          className="max-w-3xl mx-auto"
        />

        <div className="flex flex-col gap-6">
          {/* Review 1: Theirs */}
          <div className="bg-[#f7f7f8] rounded-2xl sm:rounded-3xl border border-primary/20 p-6 sm:p-8 flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-black/[0.06]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs uppercase tracking-wider text-primary font-semibold">
                    1. Theirs · Editor&apos;s Choice for 2026
                  </span>
                  <span className="text-[10px] font-mono bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                    theirs.page
                  </span>
                </div>
                <h3 className="text-2xl font-medium text-[#181925] mt-1">
                  Theirs — Calm, Editorial Remembrance & Family Archives
                </h3>
              </div>
              <div className="text-left sm:text-right">
                <span className="text-base font-semibold text-[#181925]">$0 free / $179 one-time</span>
                <p className="text-xs font-mono text-[#888]">Never recurring</p>
              </div>
            </div>

            <p className="text-sm text-[#555] leading-relaxed">
              Theirs represents a major departure from traditional funeral-black memorial pages. Designed with warm cream backgrounds, generous editorial typography, and museum-grade aesthetics, it is built to feel like visiting someone&apos;s life rather than their obituary.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white border border-black/[0.04]">
                <h4 className="text-xs font-mono uppercase tracking-wider text-emerald-700 font-semibold mb-2 flex items-center gap-1.5">
                  <Check className="size-3.5 text-emerald-600" /> Key Strengths
                </h4>
                <ul className="space-y-1.5 text-xs text-[#666]">
                  <li>• Exceptional editorial design and typography with 0 third-party ads.</li>
                  <li>• Friends contribute stories and photos with no account sign-up required.</li>
                  <li>• Preserves original high-resolution media without aggressive compression.</li>
                  <li>• Rich features: chronological life timeline, audio notes, and photo restoration.</li>
                  <li>• Transparent one-time pricing ($179 Complete) with no recurring bills.</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-white border border-black/[0.04]">
                <h4 className="text-xs font-mono uppercase tracking-wider text-[#888] font-semibold mb-2 flex items-center gap-1.5">
                  <AlertCircle className="size-3.5 text-[#888]" /> Considerations
                </h4>
                <ul className="space-y-1.5 text-xs text-[#666]">
                  <li>• Does not include built-in crowdfunding or funeral fund processing.</li>
                  <li>• Does not include funeral RSVP attendee tracking.</li>
                  <li>• Focused entirely on celebration of life and family storytelling.</li>
                </ul>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <span className="text-xs text-[#666]">
                <strong>Best suited for:</strong> Families who want a timeless, dignified family archive that honors their loved one with beauty and calm.
              </span>
              <Link
                href="/create-online-memorial"
                className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-[#8c3a10] transition-colors"
              >
                <span>Create a memorial</span>
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </div>

          {/* Review 2: Ever Loved */}
          <div className="bg-[#f7f7f8] rounded-2xl sm:rounded-3xl border border-black/[0.06] p-6 sm:p-8 flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-black/[0.06]">
              <div>
                <span className="font-mono text-xs uppercase tracking-wider text-[#888] font-semibold">
                  2. Ever Loved · Best for Funeral Logistics & Crowdfunding
                </span>
                <h3 className="text-2xl font-medium text-[#181925] mt-1">
                  Ever Loved — All-in-One Funeral Support & Memorials
                </h3>
              </div>
              <div className="text-left sm:text-right">
                <span className="text-base font-semibold text-[#181925]">$0 free / $199.99 Premium</span>
                <p className="text-xs font-mono text-[#888]">One-time fee</p>
              </div>
            </div>

            <p className="text-sm text-[#555] leading-relaxed">
              Ever Loved is the market leader for families who need to coordinate funeral details immediately following a loss. Its platform combines memorial tributes with RSVP management, florist integration, and community funeral fundraising.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white border border-black/[0.04]">
                <h4 className="text-xs font-mono uppercase tracking-wider text-emerald-700 font-semibold mb-2 flex items-center gap-1.5">
                  <Check className="size-3.5 text-emerald-600" /> Key Strengths
                </h4>
                <ul className="space-y-1.5 text-xs text-[#666]">
                  <li>• Outstanding funeral service RSVP management and event directions.</li>
                  <li>• Built-in memorial fundraising with zero platform fee (standard credit card processing applies).</li>
                  <li>• Substantial free plan with photos, videos, and guestbook entries.</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-white border border-black/[0.04]">
                <h4 className="text-xs font-mono uppercase tracking-wider text-[#888] font-semibold mb-2 flex items-center gap-1.5">
                  <AlertCircle className="size-3.5 text-[#888]" /> Considerations
                </h4>
                <ul className="space-y-1.5 text-xs text-[#666]">
                  <li>• The visual layout feels utilitarian and logistics-focused rather than editorial.</li>
                  <li>• Pages frequently prompt visitors to donate or purchase funeral flowers.</li>
                </ul>
              </div>
            </div>

            <div className="pt-2">
              <span className="text-xs text-[#666]">
                <strong>Best suited for:</strong> Families managing immediate funeral arrangements, service RSVPs, or community expense fundraising.
              </span>
            </div>
          </div>

          {/* Review 3: Keeper */}
          <div className="bg-[#f7f7f8] rounded-2xl sm:rounded-3xl border border-black/[0.06] p-6 sm:p-8 flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-black/[0.06]">
              <div>
                <span className="font-mono text-xs uppercase tracking-wider text-[#888] font-semibold">
                  3. Keeper · Best for Genealogy & Cemetery GPS
                </span>
                <h3 className="text-2xl font-medium text-[#181925] mt-1">
                  Keeper (MyKeeper) — Family Trees & Cemetery Mapping
                </h3>
              </div>
              <div className="text-left sm:text-right">
                <span className="text-base font-semibold text-[#181925]">$0 free / $99.00 Plus</span>
                <p className="text-xs font-mono text-[#888]">One-time fee</p>
              </div>
            </div>

            <p className="text-sm text-[#555] leading-relaxed">
              Keeper is a Canadian memorial platform that specializes in linking digital tributes to physical burial locations and genealogy. It provides cemetery GPS coordinates, family tree visualization, and QR code integration for headstones.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white border border-black/[0.04]">
                <h4 className="text-xs font-mono uppercase tracking-wider text-emerald-700 font-semibold mb-2 flex items-center gap-1.5">
                  <Check className="size-3.5 text-emerald-600" /> Key Strengths
                </h4>
                <ul className="space-y-1.5 text-xs text-[#666]">
                  <li>• Interactive family tree builder linking multiple family memorials.</li>
                  <li>• Cemetery GPS mapping to guide physical visitors to gravesites.</li>
                  <li>• Affordable $99 one-time Plus upgrade with unlimited media.</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-white border border-black/[0.04]">
                <h4 className="text-xs font-mono uppercase tracking-wider text-[#888] font-semibold mb-2 flex items-center gap-1.5">
                  <AlertCircle className="size-3.5 text-[#888]" /> Considerations
                </h4>
                <ul className="space-y-1.5 text-xs text-[#666]">
                  <li>• The free tier is limited to 5 photos or videos.</li>
                  <li>• The user interface feels older and less polished on mobile devices.</li>
                </ul>
              </div>
            </div>

            <div className="pt-2">
              <span className="text-xs text-[#666]">
                <strong>Best suited for:</strong> Genealogists and families who want to map a physical headstone and connect multi-generational family records.
              </span>
            </div>
          </div>

          {/* Review 4: ForeverMissed */}
          <div className="bg-[#f7f7f8] rounded-2xl sm:rounded-3xl border border-black/[0.06] p-6 sm:p-8 flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-black/[0.06]">
              <div>
                <span className="font-mono text-xs uppercase tracking-wider text-[#888] font-semibold">
                  4. ForeverMissed · Best for Traditional Templates
                </span>
                <h3 className="text-2xl font-medium text-[#181925] mt-1">
                  ForeverMissed — Established Traditional Online Memorials
                </h3>
              </div>
              <div className="text-left sm:text-right">
                <span className="text-base font-semibold text-[#181925]">$9.95/mo or $159.95 lifetime</span>
                <p className="text-xs font-mono text-[#888]">Subscription or one-time</p>
              </div>
            </div>

            <p className="text-sm text-[#555] leading-relaxed">
              Launched in 2008, ForeverMissed is one of the oldest and most established online memorial sites. It offers traditional mourning themes, virtual candle lighting, background music players, and long-form biographical sections.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white border border-black/[0.04]">
                <h4 className="text-xs font-mono uppercase tracking-wider text-emerald-700 font-semibold mb-2 flex items-center gap-1.5">
                  <Check className="size-3.5 text-emerald-600" /> Key Strengths
                </h4>
                <ul className="space-y-1.5 text-xs text-[#666]">
                  <li>• Established platform hosting over 100,000 public and private memorials.</li>
                  <li>• Familiar traditional features: virtual candles, notes, and music.</li>
                  <li>• Ad-free on both free and premium tiers.</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-white border border-black/[0.04]">
                <h4 className="text-xs font-mono uppercase tracking-wider text-[#888] font-semibold mb-2 flex items-center gap-1.5">
                  <AlertCircle className="size-3.5 text-[#888]" /> Considerations
                </h4>
                <ul className="space-y-1.5 text-xs text-[#666]">
                  <li>• Heavily pushes recurring monthly ($9.95/mo) or annual ($79.95/yr) subscriptions.</li>
                  <li>• Template designs have not seen significant updates and feel dated compared to modern web design.</li>
                </ul>
              </div>
            </div>

            <div className="pt-2">
              <span className="text-xs text-[#666]">
                <strong>Best suited for:</strong> Families looking for a familiar, traditional memorial with candle-lighting features who opt for the lifetime tier.
              </span>
            </div>
          </div>

          {/* Review 5: MuchLoved */}
          <div className="bg-[#f7f7f8] rounded-2xl sm:rounded-3xl border border-black/[0.06] p-6 sm:p-8 flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-black/[0.06]">
              <div>
                <span className="font-mono text-xs uppercase tracking-wider text-[#888] font-semibold">
                  5. MuchLoved · Best for UK Charitable In-Memory Giving
                </span>
                <h3 className="text-2xl font-medium text-[#181925] mt-1">
                  MuchLoved — The UK Charitable Tribute Fund Platform
                </h3>
              </div>
              <div className="text-left sm:text-right">
                <span className="text-base font-semibold text-[#181925]">Free / Donation funded</span>
                <p className="text-xs font-mono text-[#888]">Non-profit charity</p>
              </div>
            </div>

            <p className="text-sm text-[#555] leading-relaxed">
              MuchLoved is a registered UK charity founded in 1998. It has helped raise hundreds of millions of pounds for hospices, medical research, and animal welfare charities by combining tribute websites with Gift Aid-eligible donation processing.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white border border-black/[0.04]">
                <h4 className="text-xs font-mono uppercase tracking-wider text-emerald-700 font-semibold mb-2 flex items-center gap-1.5">
                  <Check className="size-3.5 text-emerald-600" /> Key Strengths
                </h4>
                <ul className="space-y-1.5 text-xs text-[#666]">
                  <li>• Direct integration with thousands of UK charities with automated Gift Aid collection.</li>
                  <li>• Non-profit foundation with 200 MB of free storage and zero commercial ads.</li>
                  <li>• Partnered with major UK funeral directors and hospices.</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-white border border-black/[0.04]">
                <h4 className="text-xs font-mono uppercase tracking-wider text-[#888] font-semibold mb-2 flex items-center gap-1.5">
                  <AlertCircle className="size-3.5 text-[#888]" /> Considerations
                </h4>
                <ul className="space-y-1.5 text-xs text-[#666]">
                  <li>• Primarily optimized for the UK market and British charities.</li>
                  <li>• Limited layout customization and basic media gallery options.</li>
                </ul>
              </div>
            </div>

            <div className="pt-2">
              <span className="text-xs text-[#666]">
                <strong>Best suited for:</strong> British families who wish to collect charitable donations in honor of their loved one for a specific hospice or medical cause.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 4. THE 5 ESSENTIAL QUESTIONS TO ASK BEFORE CHOOSING                   */}
      {/* ===================================================================== */}
      <section className="w-full max-w-5xl px-4 sm:px-6 mx-auto py-16 sm:py-24 border-t border-black/[0.06] flex flex-col gap-12 sm:gap-14">
        <SectionHeader
          badge="Buyer Guide"
          title="What to ask before choosing a memorial platform."
          description="Avoid common industry pitfalls such as indefinite monthly renewals, intrusive banner ads, and aggressive photo compression."
          className="max-w-3xl mx-auto"
        />

        <div className="bg-[#f7f7f8] rounded-2xl sm:rounded-3xl border border-black/[0.06] p-6 sm:p-10 flex flex-col gap-4">
          {/* Question 1 */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-black/[0.06] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <span className="size-10 rounded-xl bg-neutral-100 flex items-center justify-center text-[#181925] font-mono text-sm font-semibold shrink-0">
                01
              </span>
              <div>
                <h4 className="text-base font-medium text-[#181925]">Will our family be forced into a monthly subscription?</h4>
                <p className="text-xs sm:text-sm text-[#666] leading-relaxed mt-1 max-w-2xl">
                  Some platforms charge $10/month indefinitely. Grieving family members often keep paying for years because they fear the page will be deleted if they cancel. Look for platforms that offer permanent free tiers or clear, single one-time payments.
                </p>
              </div>
            </div>
            <span className="font-mono text-xs text-primary font-medium shrink-0 bg-primary/10 px-2.5 py-1 rounded-full">
              Longevity Trap
            </span>
          </div>

          {/* Question 2 */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-black/[0.06] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <span className="size-10 rounded-xl bg-neutral-100 flex items-center justify-center text-[#181925] font-mono text-sm font-semibold shrink-0">
                02
              </span>
              <div>
                <h4 className="text-base font-medium text-[#181925]">Are there third-party banner ads on memorial pages?</h4>
                <p className="text-xs sm:text-sm text-[#666] leading-relaxed mt-1 max-w-2xl">
                  Several websites place commercial ad banners or programmatic affiliate links directly beneath tributes. A memorial is a sacred personal space; choose platforms that strictly guarantee zero commercial advertising.
                </p>
              </div>
            </div>
            <span className="font-mono text-xs text-emerald-700 font-medium shrink-0 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60">
              Dignity & Privacy
            </span>
          </div>

          {/* Question 3 */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-black/[0.06] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <span className="size-10 rounded-xl bg-neutral-100 flex items-center justify-center text-[#181925] font-mono text-sm font-semibold shrink-0">
                03
              </span>
              <div>
                <h4 className="text-base font-medium text-[#181925]">Do grieving friends have to create an account to leave a tribute?</h4>
                <p className="text-xs sm:text-sm text-[#666] leading-relaxed mt-1 max-w-2xl">
                  Forcing elderly relatives or former coworkers to register and set a password creates friction, causing many people to give up. Platforms that allow frictionless guest contributions gather significantly more memories.
                </p>
              </div>
            </div>
            <span className="font-mono text-xs text-[#181925] font-medium shrink-0 bg-neutral-100 px-2.5 py-1 rounded-full">
              Frictionless Access
            </span>
          </div>

          {/* Question 4 */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-black/[0.06] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <span className="size-10 rounded-xl bg-neutral-100 flex items-center justify-center text-[#181925] font-mono text-sm font-semibold shrink-0">
                04
              </span>
              <div>
                <h4 className="text-base font-medium text-[#181925]">Does the platform compress or downgrade original family photographs?</h4>
                <p className="text-xs sm:text-sm text-[#666] leading-relaxed mt-1 max-w-2xl">
                  Many platforms aggressively compress uploaded photos to save on storage costs, leaving family heirlooms pixelated. Verify that the platform preserves original full-resolution master files and allows full data download.
                </p>
              </div>
            </div>
            <span className="font-mono text-xs text-primary font-medium shrink-0 bg-primary/10 px-2.5 py-1 rounded-full">
              Media Preservation
            </span>
          </div>

          {/* Question 5 */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-black/[0.06] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <span className="size-10 rounded-xl bg-neutral-100 flex items-center justify-center text-[#181925] font-mono text-sm font-semibold shrink-0">
                05
              </span>
              <div>
                <h4 className="text-base font-medium text-[#181925]">Can you keep the memorial private or PIN-protected?</h4>
                <p className="text-xs sm:text-sm text-[#666] leading-relaxed mt-1 max-w-2xl">
                  Not all families want their memories indexed on public search engines. Look for granular privacy settings including Link-only (unlisted) and 4-digit PIN password protection so only invited friends can view the page.
                </p>
              </div>
            </div>
            <span className="font-mono text-xs text-emerald-700 font-medium shrink-0 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60">
              Family Security
            </span>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 5. PRODUCT PROOF: THE THEIRS DIFFERENCE                               */}
      {/* ===================================================================== */}
      <section className="w-full max-w-5xl px-4 sm:px-6 mx-auto py-16 sm:py-24 border-t border-black/[0.06] flex flex-col gap-12 sm:gap-14">
        <SectionHeader
          badge="The Theirs Difference"
          title="A different approach to digital remembrance."
          description="Why Theirs was built around life stories, calm typography, and effortless family collaboration."
          className="max-w-3xl mx-auto"
        />

        <div className="bg-[#f7f7f8] rounded-2xl sm:rounded-3xl border border-black/[0.06] overflow-hidden p-6 sm:p-10 flex flex-col gap-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-6 border-b border-black/[0.06]">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-primary font-medium">
                Live Example · theirs.page/robert-carter
              </span>
              <h3 className="text-2xl font-medium text-[#181925] mt-0.5">
                Robert Edward Carter
              </h3>
              <p className="font-mono text-xs text-[#888]">1948 — 2024 · Master Clockmaker · Devon, UK</p>
            </div>
            <Link
              href="/robert-carter"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-[#8c3a10] transition-colors bg-white px-3 py-1.5 rounded-full border border-black/[0.06] shadow-2xs"
            >
              <span>Explore live demo memorial</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </div>

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
                <span>5 photos included free</span>
                <span className="text-emerald-600 font-medium">Guest tributes approved</span>
              </div>
            </div>

            {/* Right Specification List */}
            <div className="lg:col-span-6 flex flex-col justify-between gap-4">
              <div className="bg-white rounded-2xl p-5 border border-black/[0.06] flex items-start gap-4">
                <span className="size-9 rounded-xl bg-neutral-100 flex items-center justify-center text-[#181925] shrink-0 mt-0.5">
                  <Heart className="size-4 text-primary" />
                </span>
                <div>
                  <h4 className="text-sm font-medium text-[#181925]">Life Dominates, Death Explains</h4>
                  <p className="text-xs text-[#666] leading-relaxed mt-1">
                    Every visitor experiences a person, not a government document or funeral receipt. We emphasize their character, warmth, and stories.
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-black/[0.06] flex items-start gap-4">
                <span className="size-9 rounded-xl bg-neutral-100 flex items-center justify-center text-[#181925] shrink-0 mt-0.5">
                  <MessageSquare className="size-4 text-emerald-600" />
                </span>
                <div>
                  <h4 className="text-sm font-medium text-[#181925]">Collaborative by Design</h4>
                  <p className="text-xs text-[#666] leading-relaxed mt-1">
                    One family member shouldn&apos;t carry the emotional burden of writing a life alone. Family and friends contribute without friction.
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-black/[0.06] flex items-start gap-4">
                <span className="size-9 rounded-xl bg-neutral-100 flex items-center justify-center text-[#181925] shrink-0 mt-0.5">
                  <ShieldCheck className="size-4 text-primary" />
                </span>
                <div>
                  <h4 className="text-sm font-medium text-[#181925]">No Subscription Traps</h4>
                  <p className="text-xs text-[#666] leading-relaxed mt-1">
                    Use our $0 free tier without entering credit card info, or make it Complete for a single one-time payment of $179. No monthly bills.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 6. HOW TO CREATE A MEMORIAL IN 3 SIMPLE STEPS                          */}
      {/* ===================================================================== */}
      <section className="w-full max-w-5xl px-4 sm:px-6 mx-auto py-16 sm:py-24 border-t border-black/[0.06] flex flex-col gap-12 sm:gap-14">
        <SectionHeader
          badge="Simple Setup"
          title="Create a memorial in a few minutes."
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
              $0 · Instant web address
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
                Share one link so people who loved them can add their own stories and photos. You review and approve every contribution privately.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-black/[0.06] text-xs font-mono text-[#888]">
              Collaborative tribute feed
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 7. ORIGINAL LANDING PAGE PRICING COMPONENT                            */}
      {/* ===================================================================== */}
      <TheirsPricing />

      {/* ===================================================================== */}
      {/* 8. FREQUENTLY ASKED QUESTIONS                                         */}
      {/* ===================================================================== */}
      <section className="w-full max-w-5xl px-4 sm:px-6 mx-auto py-16 sm:py-24 border-t border-black/[0.06] flex flex-col gap-12 sm:gap-14">
        <SectionHeader
          badge="FAQs"
          title="Common questions about memorial websites."
          description="Clear, factual answers to help you choose the best platform for your family."
          className="max-w-3xl mx-auto"
        />

        <div className="w-full max-w-3xl mx-auto">
          <SeoFaqAccordion items={BEST_MEMORIALS_FAQS} />
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 9. RELEVANT GUIDES (CONTEXTUAL INTERNAL MESH)                         */}
      {/* ===================================================================== */}
      <SeoResourcesMesh
        currentPath="/best-online-memorial-websites"
        title="More memorial guides and resources."
        description="Helpful reading as you consider how best to remember your loved one."
      />

      {/* ===================================================================== */}
      {/* 10. CLOSING CTA BANNER & FOOTER                                       */}
      {/* ===================================================================== */}
      <CtaBanner />
      <TheirsFooter />
    </div>
  )
}
