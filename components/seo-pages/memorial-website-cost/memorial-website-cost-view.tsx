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
  DollarSign,
  AlertTriangle,
  TrendingDown,
  Clock,
  Lock,
  Camera,
  MessageSquare,
  BadgePercent,
  Calendar,
  Layers,
} from "lucide-react"

export const MEMORIAL_COST_FAQS: SeoFaqItem[] = [
  {
    id: "free-plan-real",
    question: "Is the free memorial really $0, or will I be asked for a credit card?",
    answer:
      "The free plan on Theirs is genuinely $0. You can create, publish, and share a memorial with your loved one's portrait, life story, up to 5 photographs, and unlimited guest tributes without ever providing credit card or billing information. It is not a 14-day trial and your page will not be unpublished because you didn't upgrade.",
  },
  {
    id: "upgrade-later-seamless",
    question: "Can I start with the free plan and upgrade to Complete later?",
    answer:
      "Yes. If you publish a free memorial today, you can upgrade to Complete weeks, months, or years down the road. All of your written stories, photos, guest tributes, and your custom web address remain completely intact. Upgrading simply unlocks unlimited high-resolution photos, audio notes, video clips, the interactive life timeline, photo restoration, and PIN privacy.",
  },
  {
    id: "any-renewal-fees",
    question: "Are there any annual or monthly renewal fees with Complete?",
    answer:
      "No. Complete is a single one-time payment of $179. There are zero recurring monthly charges, zero annual domain maintenance fees, and zero renewal invoices. Once paid, the memorial is permanently preserved.",
  },
  {
    id: "why-avoid-subscriptions",
    question: "Why should families avoid monthly subscriptions for memorial websites?",
    answer:
      "Monthly subscriptions ($9.95/month) create long-term financial and emotional anxiety. Over a decade, a $10/month subscription totals nearly $1,200. More critically, if the creator's credit card expires or the creator passes away, the service will typically unpublish the memorial due to failed payments.",
  },
  {
    id: "split-costs",
    question: "Can multiple family members contribute to the cost of Complete?",
    answer:
      "Yes. We support gifting memorial upgrades. A sibling, adult child, or family friend can purchase the Complete upgrade on behalf of the memorial creator with a single payment.",
  },
  {
    id: "refund-policy",
    question: "What is your refund policy if our family changes our mind?",
    answer:
      "We offer a full 14-day money-back guarantee on the Complete upgrade. If you decide it doesn't fit your family's needs, simply let us know and we will issue a full refund while maintaining your memorial on the free tier.",
  },
  {
    id: "hidden-fees",
    question: "Are there any hidden fees for media storage or guest contributions?",
    answer:
      "None. Guests never pay to view the memorial or leave tributes. We do not charge fees for guest comments, bandwidth, or high-resolution downloads. The price you see is the entire cost.",
  },
  {
    id: "how-theirs-affords-free",
    question: "How does Theirs afford to host free memorials permanently?",
    answer:
      "Our business model is simple and transparent: families who want a rich, multi-decade family archive purchase our $179 Complete upgrade. That revenue fully subsidizes our cloud infrastructure and hosting, so we never have to place third-party ads on free memorials or charge visitors to write a condolence.",
  },
]

export function MemorialWebsiteCostView() {
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
              Transparent Pricing Guide
            </span>
          </div>

          {/* H1 Heading */}
          <h1 className="text-balance text-4xl sm:text-6xl lg:text-[68px] font-medium tracking-[-0.04em] text-[#181925] leading-[1.04] mb-3.5">
            How much does a memorial
            <br />
            <span className="text-primary">website cost?</span>
          </h1>

          {/* Subheading */}
          <p className="mx-auto max-w-[680px] text-pretty text-base sm:text-xl leading-relaxed text-[#666] mb-5 sm:mb-6">
            A complete guide to free options, one-time fees, and why contemporary families{" "}
            <span className="rounded-md bg-primary/10 box-decoration-clone px-1 py-0.5 text-primary font-medium">
              avoid indefinite monthly subscriptions
            </span>
            .
          </p>

          {/* Interactive Creation Pill Input */}
          <div className="w-full max-w-lg flex flex-col items-center gap-2 mb-4 sm:mb-5">
            <SeoHeroInput
              buttonLabel="Start a free memorial"
              placeholder="Robert Carter"
            />
          </div>

          {/* Compact Trust Line */}
          <p className="text-center text-xs font-mono text-[#888] mb-8 sm:mb-12">
            No hidden fees · $0 free option · $179 one-time Complete · Zero subscriptions
          </p>

          {/* Curated Life Panorama Ribbon */}
          <LifePanorama />
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 2. THE THREE PRICING MODELS IN THE INDUSTRY (BENTO GRID)              */}
      {/* ===================================================================== */}
      <section className="w-full max-w-5xl px-4 sm:px-6 mx-auto py-16 sm:py-24 border-t border-black/[0.06] flex flex-col gap-12 sm:gap-14">
        <SectionHeader
          badge="Pricing Models"
          title="Free vs. One-time vs. Monthly subscriptions."
          description="Understanding how memorial websites charge and what happens to your loved one's page over time."
          className="max-w-3xl mx-auto"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Model 1: Free Plan */}
          <div className="flex flex-col justify-between bg-[#f7f7f8] rounded-2xl p-6 sm:p-7 border border-black/[0.04]">
            <div className="flex flex-col gap-3">
              <span className="w-10 h-9 rounded-full bg-white flex items-center justify-center border border-black/[0.06]">
                <Heart className="size-4 text-emerald-600" />
              </span>
              <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-emerald-600 font-semibold">
                Model 01 · 100% Free
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-3xl font-medium tracking-tight text-[#181925]">$0</span>
                <span className="text-xs text-[#888]">/ forever</span>
              </div>
              <h3 className="text-lg font-medium text-[#181925]">
                Dignified & focused tribute
              </h3>
              <p className="text-xs sm:text-sm text-[#666] leading-relaxed">
                Includes their portrait, life story, up to 5 milestone photographs, and unlimited tributes from family and friends. No credit card required.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-black/[0.06] text-xs font-mono text-emerald-700">
              Ideal for simple memorials
            </div>
          </div>

          {/* Model 2: One-Time Complete */}
          <div className="flex flex-col justify-between bg-[#f7f7f8] rounded-2xl p-6 sm:p-7 border border-primary/25 relative overflow-hidden">
            <div className="flex flex-col gap-3">
              <span className="w-10 h-9 rounded-full bg-white flex items-center justify-center border border-black/[0.06]">
                <Sparkles className="size-4 text-primary" />
              </span>
              <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-primary font-semibold">
                Model 02 · One-Time Lifetime
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-3xl font-medium tracking-tight text-[#181925]">$179</span>
                <span className="text-xs text-[#888]">/ single payment</span>
              </div>
              <h3 className="text-lg font-medium text-[#181925]">
                Comprehensive family archive
              </h3>
              <p className="text-xs sm:text-sm text-[#666] leading-relaxed">
                Single upfront payment covering unlimited photos, audio notes, video clips, an interactive life timeline, photo restoration, and PIN privacy.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-black/[0.06] text-xs font-mono text-primary font-medium">
              Zero renewal anxiety · The recommended choice
            </div>
          </div>

          {/* Model 3: Monthly Subscriptions */}
          <div className="flex flex-col justify-between bg-[#f7f7f8] rounded-2xl p-6 sm:p-7 border border-black/[0.04]">
            <div className="flex flex-col gap-3">
              <span className="w-10 h-9 rounded-full bg-white flex items-center justify-center border border-black/[0.06]">
                <AlertTriangle className="size-4 text-amber-600" />
              </span>
              <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-amber-700 font-semibold">
                Model 03 · Monthly Subscription
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-3xl font-medium tracking-tight text-[#181925]">$9.95</span>
                <span className="text-xs text-[#888]">/ month indefinitely</span>
              </div>
              <h3 className="text-lg font-medium text-[#181925]">
                The legacy renewal trap
              </h3>
              <p className="text-xs sm:text-sm text-[#666] leading-relaxed">
                Appears affordable upfront, but totals nearly $1,200 over ten years. If your card expires or you pass away, the memorial is taken down.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-black/[0.06] text-xs font-mono text-amber-700">
              High long-term cost & deletion risk
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 3. 2026 INDUSTRY PRICE BENCHMARK TABLE                                */}
      {/* ===================================================================== */}
      <section className="w-full max-w-5xl px-4 sm:px-6 mx-auto py-16 sm:py-24 border-t border-black/[0.06] flex flex-col gap-12 sm:gap-14">
        <SectionHeader
          badge="Cost Comparison"
          title="What top memorial websites charge in 2026."
          description="Official pricing data checked September 2026 across leading digital memorial platforms."
          className="max-w-3xl mx-auto"
        />

        <div className="bg-white rounded-2xl sm:rounded-3xl border border-black/[0.06] overflow-hidden p-6 sm:p-8 shadow-xs flex flex-col gap-6">
          <div className="overflow-x-auto">
            <p className="sm:hidden text-[11px] font-mono text-[#888] mb-2.5 text-right">
              Swipe horizontally to compare pricing →
            </p>
            <table className="w-full text-left border-collapse text-xs sm:text-sm min-w-[660px]">
              <thead>
                <tr className="border-b border-black/[0.08]">
                  <th className="py-3 pr-4 font-mono uppercase tracking-wider text-[11px] text-[#888] font-medium">
                    Platform
                  </th>
                  <th className="py-3 px-3 font-mono uppercase tracking-wider text-[11px] text-[#888] font-medium">
                    Free Plan
                  </th>
                  <th className="py-3 px-3 font-mono uppercase tracking-wider text-[11px] text-[#181925] font-semibold">
                    One-Time Lifetime Fee
                  </th>
                  <th className="py-3 px-3 font-mono uppercase tracking-wider text-[11px] text-[#888] font-medium">
                    Subscription Option
                  </th>
                  <th className="py-3 pl-3 font-mono uppercase tracking-wider text-[11px] text-[#888] font-medium">
                    3rd-Party Ads
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.04] text-[#444]">
                {/* Theirs */}
                <tr className="bg-primary/5 font-medium">
                  <td className="py-3.5 pr-4 text-[#181925] font-semibold flex items-center gap-1.5">
                    Theirs
                    <span className="text-[10px] font-mono text-primary font-normal bg-primary/10 px-1.5 py-0.5 rounded">
                      This page
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-emerald-600 font-medium">
                    Yes ($0, 5 photos, tributes)
                  </td>
                  <td className="py-3.5 px-3 text-[#181925] font-semibold">
                    $179 (Complete)
                  </td>
                  <td className="py-3.5 px-3 text-emerald-600 font-medium">
                    None (Zero subscriptions)
                  </td>
                  <td className="py-3.5 pl-3 text-emerald-600 font-medium">
                    0 Ads (100% ad-free)
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
                  <td className="py-3.5 px-3 text-emerald-600 font-medium">
                    Yes (RSVPs, photos, video)
                  </td>
                  <td className="py-3.5 px-3 text-[#181925]">
                    $199.99 (Premium)
                  </td>
                  <td className="py-3.5 px-3 text-[#777]">
                    None
                  </td>
                  <td className="py-3.5 pl-3 text-[#666]">
                    Minimal / fundraising tips
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
                  <td className="py-3.5 px-3 text-emerald-600 font-medium">
                    Yes (5 photos/videos)
                  </td>
                  <td className="py-3.5 px-3 text-[#181925]">
                    $99.00 (Plus)
                  </td>
                  <td className="py-3.5 px-3 text-[#777]">
                    None
                  </td>
                  <td className="py-3.5 pl-3 text-emerald-600 font-medium">
                    Ad-free
                  </td>
                </tr>

                {/* ForeverMissed */}
                <tr>
                  <td className="py-3.5 pr-4 text-[#181925] font-medium">
                    <a
                      href="https://forevermissed.com/ourplans"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-primary inline-flex items-center gap-1"
                    >
                      ForeverMissed <ExternalLink className="size-3 text-[#aaa]" />
                    </a>
                  </td>
                  <td className="py-3.5 px-3 text-emerald-600 font-medium">
                    Yes (5 photos)
                  </td>
                  <td className="py-3.5 px-3 text-[#181925]">
                    $159.95 (Lifetime)
                  </td>
                  <td className="py-3.5 px-3 text-amber-700 font-medium">
                    $9.95/mo or $79.95/yr
                  </td>
                  <td className="py-3.5 pl-3 text-emerald-600 font-medium">
                    Ad-free
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
                  <td className="py-3.5 px-3 text-emerald-600 font-medium">
                    Yes (200MB free storage)
                  </td>
                  <td className="py-3.5 px-3 text-[#777]">
                    N/A (Donation model)
                  </td>
                  <td className="py-3.5 px-3 text-[#777]">
                    None
                  </td>
                  <td className="py-3.5 pl-3 text-emerald-600 font-medium">
                    Non-profit (0 commercial ads)
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="pt-4 border-t border-black/[0.06] text-xs sm:text-sm text-[#666] leading-relaxed">
            <p>
              <strong className="text-[#181925] font-medium">Key takeaway:</strong> Both Theirs and Keeper reject monthly subscription models in favor of transparent one-time payments. This guarantees that your family will never receive an unexpected annual invoice to keep a loved one&apos;s memory online.
            </p>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 4. 10-YEAR COST MATH: SUBSCRIPTIONS VS. ONE-TIME                      */}
      {/* ===================================================================== */}
      <section className="w-full max-w-5xl px-4 sm:px-6 mx-auto py-16 sm:py-24 border-t border-black/[0.06] flex flex-col gap-12 sm:gap-14">
        <SectionHeader
          badge="Long-Term Math"
          title="The true 10-year cost of an online memorial."
          description="A low monthly price tag often disguises a heavy financial commitment over time."
          className="max-w-3xl mx-auto"
        />

        <div className="bg-[#f7f7f8] rounded-2xl sm:rounded-3xl border border-black/[0.06] p-6 sm:p-10 flex flex-col gap-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {/* Column 1: Monthly */}
            <div className="bg-white rounded-2xl p-6 border border-black/[0.06] flex flex-col justify-between">
              <div>
                <span className="font-mono text-xs uppercase tracking-wider text-[#888]">
                  Monthly Subscription
                </span>
                <p className="text-sm font-medium text-[#181925] mt-1">$9.95 per month</p>
                <div className="mt-4 pt-4 border-t border-black/[0.06]">
                  <span className="text-3xl font-medium tracking-tight text-amber-700">$1,194</span>
                  <p className="text-xs text-[#888] mt-1">Total paid across 10 years (120 payments)</p>
                </div>
              </div>
              <p className="text-xs text-[#666] mt-4 pt-3 border-t border-black/[0.04]">
                Risk: If your card expires, the memorial is taken down.
              </p>
            </div>

            {/* Column 2: Annual */}
            <div className="bg-white rounded-2xl p-6 border border-black/[0.06] flex flex-col justify-between">
              <div>
                <span className="font-mono text-xs uppercase tracking-wider text-[#888]">
                  Annual Subscription
                </span>
                <p className="text-sm font-medium text-[#181925] mt-1">$79.95 per year</p>
                <div className="mt-4 pt-4 border-t border-black/[0.06]">
                  <span className="text-3xl font-medium tracking-tight text-amber-700">$799.50</span>
                  <p className="text-xs text-[#888] mt-1">Total paid across 10 years (10 renewals)</p>
                </div>
              </div>
              <p className="text-xs text-[#666] mt-4 pt-3 border-t border-black/[0.04]">
                Risk: Ongoing administrative friction every 12 months.
              </p>
            </div>

            {/* Column 3: Theirs Complete */}
            <div className="bg-white rounded-2xl p-6 border border-primary/30 flex flex-col justify-between shadow-2xs relative">
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs uppercase tracking-wider text-primary font-semibold">
                    Theirs Complete
                  </span>
                  <span className="text-[10px] font-mono bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                    Save $600–$1,000
                  </span>
                </div>
                <p className="text-sm font-medium text-[#181925] mt-1">Single upfront payment</p>
                <div className="mt-4 pt-4 border-t border-black/[0.06]">
                  <span className="text-3xl font-medium tracking-tight text-[#181925]">$179</span>
                  <p className="text-xs text-[#888] mt-1">Total paid across 10 years (1 payment)</p>
                </div>
              </div>
              <p className="text-xs text-emerald-700 font-medium mt-4 pt-3 border-t border-black/[0.04]">
                ✓ Zero renewals, zero price increases, permanent preservation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 5. THE 4 HIDDEN TRAPS IN MEMORIAL PRICING                             */}
      {/* ===================================================================== */}
      <section className="w-full max-w-5xl px-4 sm:px-6 mx-auto py-16 sm:py-24 border-t border-black/[0.06] flex flex-col gap-12 sm:gap-14">
        <SectionHeader
          badge="Buyer Caution"
          title="Four hidden traps in memorial website pricing."
          description="What to look for in the fine print before entering your payment details during a difficult time."
          className="max-w-3xl mx-auto"
        />

        <div className="bg-[#f7f7f8] rounded-2xl sm:rounded-3xl border border-black/[0.06] p-6 sm:p-10 flex flex-col gap-4">
          {/* Trap 1 */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-black/[0.06] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <span className="size-10 rounded-xl bg-neutral-100 flex items-center justify-center text-[#181925] font-mono text-sm font-semibold shrink-0">
                01
              </span>
              <div>
                <h4 className="text-base font-medium text-[#181925]">The Expired Card & Involuntary Deletion Trap</h4>
                <p className="text-xs sm:text-sm text-[#666] leading-relaxed mt-1 max-w-2xl">
                  Subscription-based memorial sites rely on active credit cards. When the surviving spouse passes away or a card expires after 3 years, automated billing fails and the memorial is unpublished. Always opt for platforms that offer permanent one-time hosting.
                </p>
              </div>
            </div>
            <span className="font-mono text-xs text-primary font-medium shrink-0 bg-primary/10 px-2.5 py-1 rounded-full">
              Subscription Risk
            </span>
          </div>

          {/* Trap 2 */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-black/[0.06] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <span className="size-10 rounded-xl bg-neutral-100 flex items-center justify-center text-[#181925] font-mono text-sm font-semibold shrink-0">
                02
              </span>
              <div>
                <h4 className="text-base font-medium text-[#181925]">Aggressive Compression & Storage Surcharges</h4>
                <p className="text-xs sm:text-sm text-[#666] leading-relaxed mt-1 max-w-2xl">
                  Some platforms advertise &ldquo;unlimited&rdquo; photos but compress them down to blurry thumbnails to reduce cloud hosting bills. They then charge extra fees for high-resolution photo archives or audio storage.
                </p>
              </div>
            </div>
            <span className="font-mono text-xs text-amber-700 font-medium shrink-0 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200/60">
              Media Downgrades
            </span>
          </div>

          {/* Trap 3 */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-black/[0.06] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <span className="size-10 rounded-xl bg-neutral-100 flex items-center justify-center text-[#181925] font-mono text-sm font-semibold shrink-0">
                03
              </span>
              <div>
                <h4 className="text-base font-medium text-[#181925]">Advertising Networks on Free Pages</h4>
                <p className="text-xs sm:text-sm text-[#666] leading-relaxed mt-1 max-w-2xl">
                  Certain platforms provide &ldquo;free&rdquo; memorials by placing programmatic banner ads, sponsored links, or pre-need funeral insurance ads right alongside condolences. Grief should never be monetized by third-party ad networks.
                </p>
              </div>
            </div>
            <span className="font-mono text-xs text-primary font-medium shrink-0 bg-primary/10 px-2.5 py-1 rounded-full">
              Intrusive Ads
            </span>
          </div>

          {/* Trap 4 */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-black/[0.06] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <span className="size-10 rounded-xl bg-neutral-100 flex items-center justify-center text-[#181925] font-mono text-sm font-semibold shrink-0">
                04
              </span>
              <div>
                <h4 className="text-base font-medium text-[#181925]">Donation & Florist Commission Cuts</h4>
                <p className="text-xs sm:text-sm text-[#666] leading-relaxed mt-1 max-w-2xl">
                  When visitors send flowers or donate to funeral collections through built-in platform widgets, some providers take 5% to 15% in platform commissions beyond standard credit card processing fees.
                </p>
              </div>
            </div>
            <span className="font-mono text-xs text-amber-700 font-medium shrink-0 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200/60">
              Hidden Fees
            </span>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 6. WHEN IS FREE ENOUGH VS. WHEN TO UPGRADE?                           */}
      {/* ===================================================================== */}
      <section className="w-full max-w-5xl px-4 sm:px-6 mx-auto py-16 sm:py-24 border-t border-black/[0.06] flex flex-col gap-12 sm:gap-14">
        <SectionHeader
          badge="Plan Guidance"
          title="Start free. Upgrade only if you need more room."
          description="You never have to make a purchasing decision right away. Start with our free tier and decide later."
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
      {/* 7. HOW TO START IN 3 SIMPLE STEPS                                     */}
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
                Share one link so people who loved them can add tributes, stories, and condolences. You review and approve every submission privately.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-black/[0.06] text-xs font-mono text-[#888]">
              Collaborative tribute feed
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 8. ORIGINAL LANDING PAGE PRICING COMPONENT                            */}
      {/* ===================================================================== */}
      <TheirsPricing />

      {/* ===================================================================== */}
      {/* 9. FREQUENTLY ASKED QUESTIONS                                         */}
      {/* ===================================================================== */}
      <section className="w-full max-w-5xl px-4 sm:px-6 mx-auto py-16 sm:py-24 border-t border-black/[0.06] flex flex-col gap-12 sm:gap-14">
        <SectionHeader
          badge="FAQs"
          title="Common questions about memorial website costs."
          description="Clear, factual answers about pricing, payment terms, and platform longevity."
          className="max-w-3xl mx-auto"
        />

        <div className="w-full max-w-3xl mx-auto">
          <SeoFaqAccordion items={MEMORIAL_COST_FAQS} />
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 10. RELEVANT GUIDES (CONTEXTUAL INTERNAL MESH)                        */}
      {/* ===================================================================== */}
      <SeoResourcesMesh
        currentPath="/memorial-website-cost"
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
