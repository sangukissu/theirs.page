import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { TheirsNav } from "@/components/theirs/nav"
import { TheirsFooter } from "@/components/theirs/footer"
import { SectionHeader } from "@/components/theirs/section-header"
import { DitherGradient } from "@/components/theirs/dither-gradient"
import { GiftPreviewCard } from "@/components/gift/gift-preview-card"
import { GiftPurchaseForm } from "@/components/gift/gift-purchase-form"
import { GiftFaqAccordion, GIFT_FAQS } from "@/components/gift/gift-faq-accordion"
import { JsonLd } from "@/components/seo/json-ld"
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Volume2,
  Image as ImageIcon,
  Users,
  ArrowRight,
} from "lucide-react"

export const metadata: Metadata = {
  title: "Gift an Online Memorial Website for Loved Ones | Theirs",
  description:
    "Gift a beautiful, Complete online memorial website for a grieving family member or friend. Prepaid in full, private, with zero subscriptions, ready whenever they are.",
  alternates: {
    canonical: "https://theirs.page/gift",
  },
  openGraph: {
    title: "Gift an Online Memorial Website for Loved Ones | Theirs",
    description:
      "Gift a beautiful, Complete online memorial website for a grieving family member or friend. Prepaid in full, private, and ready whenever they feel able to remember.",
    url: "https://theirs.page/gift",
    type: "website",
  },
}

export default function GiftMemorialPage() {
  // Structured Data (JSON-LD) for SEO: Breadcrumbs, Product, FAQPage
  const giftSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: "https://theirs.page",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Gift a Memorial",
            item: "https://theirs.page/gift",
          },
        ],
      },
      {
        "@type": "Product",
        name: "Complete Online Memorial Gift Entitlement",
        description:
          "A prepaid Complete online memorial entitlement for a grieving loved one or family. Includes unlimited original photos, audio voicemails, interactive life timeline, and limitless family contributions with zero subscriptions.",
        brand: {
          "@type": "Brand",
          name: "Theirs",
        },
        offers: {
          "@type": "Offer",
          price: "179.00",
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
          url: "https://theirs.page/gift",
        },
      },
      {
        "@type": "FAQPage",
        mainEntity: GIFT_FAQS.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
          },
        })),
      },
    ],
  }

  return (
    <div className="min-h-screen bg-white text-[#666666] selection:bg-primary/10 selection:text-primary relative overflow-x-hidden">
      {/* JSON-LD Structured Data */}
      <JsonLd schema={giftSchema} id="theirs-gift-schema" />

      {/* Site-Wide Floating Frosted Pill Navbar */}
      <TheirsNav />

      {/* ===================================================================== */}
      {/* 1. HERO SECTION                                                       */}
      {/* ===================================================================== */}
      <section className="relative pt-16 sm:pt-14 pb-12 px-4 text-center overflow-hidden flex flex-col items-center bg-white">
        <div className="max-w-5xl mx-auto flex flex-col items-center w-full">
          {/* Eyebrow Badge */}
          <div className="mb-3.5 flex justify-center">
            <span
              data-slot="badge"
              className="flex items-center justify-center border font-medium w-fit whitespace-nowrap border-transparent bg-neutral-100 text-[#666] h-[24px] min-w-[24px] text-xs px-2.5 rounded-md select-none"
            >
              Memorial gifts
            </span>
          </div>

          {/* H1 Heading */}
          <h1 className="text-balance text-4xl sm:text-6xl font-medium tracking-tight text-[#181925] leading-tight mb-4">
            Give a lasting online memorial
            <br />
            <span className="text-primary">for someone they love.</span>
          </h1>

          {/* Subheading */}
          <p className="mx-auto max-w-[680px] text-pretty text-base sm:text-lg leading-relaxed text-[#666] mb-8">
            When someone you care about experiences a loss, flowers wilt within days. Gifting a Complete memorial gives them a thoughtful, prepaid family archive{" "}
            <span className="rounded-md bg-primary/10 box-decoration-clone px-1 py-0.5 text-primary font-medium">
              with zero subscriptions
            </span>
            , ready whenever they feel able to bring photos, voice notes and stories together.
          </p>

          {/* Quick Action Links */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10 w-full sm:w-auto">
            <a
              href="#purchase"
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap !rounded-full font-medium transition-all cursor-pointer border border-[color-mix(in_srgb,var(--primary)_80%,#8c3a10)] bg-[color-mix(in_srgb,var(--primary)_90%,#8c3a10)] text-primary-foreground hover:bg-primary active:scale-[0.98] h-11 px-6 text-sm group select-none w-full sm:w-auto"
            >
              <span>Gift a memorial — $179</span>
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </a>

            <a
              href="#how-it-works"
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap !rounded-full font-medium transition-all cursor-pointer border border-black/[0.08] bg-[#f7f7f8] text-[#181925] hover:bg-white active:scale-[0.98] h-11 px-6 text-sm select-none w-full sm:w-auto"
            >
              <span>How gifting works</span>
            </a>
          </div>

          {/* Interactive Preview Stationery Component */}
          <GiftPreviewCard />
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 2. COMPARISON SECTION                                                 */}
      {/* ===================================================================== */}
      <section className="py-16 sm:py-24 px-5 max-w-5xl mx-auto flex flex-col gap-12 sm:gap-14 border-t border-black/[0.06]">
        <SectionHeader
          badge="Why Gifting Matters"
          title="Support that outlasts funeral flowers."
          description={
            <>
              Flowers arrive during the week of shock and fade away within days. A memorial website gives the family{" "}
              <span className="rounded-md bg-primary/10 box-decoration-clone px-1 py-0.5 text-primary">
                a permanent sanctuary
              </span>{" "}
              that grows richer with every passing year.
            </>
          }
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Flowers */}
          <div className="flex flex-col rounded-2xl bg-[#f7f7f8] p-6 border border-black/[0.05] justify-between">
            <div className="flex flex-col gap-3">
              <span className="font-mono text-xs text-[#888] uppercase tracking-wider font-medium">
                Traditional Choice
              </span>
              <h3 className="text-xl font-medium text-[#181925] tracking-tight">
                Funeral Flowers
              </h3>
              <p className="text-sm leading-6 text-[#666]">
                A classic sympathy gesture, but temporary. They wilt in less than a week, creating an unwanted reminder of decay for a grieving household.
              </p>
            </div>

            <ul className="flex flex-col gap-2 pt-6 border-t border-dashed border-black/[0.08] text-xs text-[#666] mt-6 list-none p-0">
              <li className="flex items-center gap-2">
                <XCircle className="size-4 text-red-500 shrink-0" />
                <span>Lasts 3 to 5 days</span>
              </li>
              <li className="flex items-center gap-2">
                <XCircle className="size-4 text-red-500 shrink-0" />
                <span>Costs $120 to $250+</span>
              </li>
              <li className="flex items-center gap-2">
                <XCircle className="size-4 text-red-500 shrink-0" />
                <span>Leaves nothing permanent behind</span>
              </li>
            </ul>
          </div>

          {/* Card 2: Sympathy Card */}
          <div className="flex flex-col rounded-2xl bg-[#f7f7f8] p-6 border border-black/[0.05] justify-between">
            <div className="flex flex-col gap-3">
              <span className="font-mono text-xs text-[#888] uppercase tracking-wider font-medium">
                Sympathy Card
              </span>
              <h3 className="text-xl font-medium text-[#181925] tracking-tight">
                Paper Greeting Card
              </h3>
              <p className="text-sm leading-6 text-[#666]">
                Meaningful words, but limited to a single note. Usually stored in a keepsake drawer or recycled once funeral week passes.
              </p>
            </div>

            <ul className="flex flex-col gap-2 pt-6 border-t border-dashed border-black/[0.08] text-xs text-[#666] mt-6 list-none p-0">
              <li className="flex items-center gap-2">
                <XCircle className="size-4 text-red-500 shrink-0" />
                <span>Only holds a short handwritten note</span>
              </li>
              <li className="flex items-center gap-2">
                <XCircle className="size-4 text-red-500 shrink-0" />
                <span>Cannot preserve photos or voice</span>
              </li>
              <li className="flex items-center gap-2">
                <XCircle className="size-4 text-red-500 shrink-0" />
                <span>Cannot be shared with wider family</span>
              </li>
            </ul>
          </div>

          {/* Card 3: Theirs Memorial Gift */}
          <div className="flex flex-col rounded-2xl bg-[#181925] p-6 text-white border border-black/[0.1] justify-between relative overflow-hidden">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(125%_115%_at_0%_0%,#000_0%,#000_18%,transparent_66%)]"
            >
              <DitherGradient from="orange" bloom="high" />
            </span>

            <div className="relative flex flex-col gap-3 z-10">
              <span className="font-mono text-xs text-primary uppercase tracking-wider font-medium">
                Theirs Memorial Gift
              </span>
              <h3 className="text-xl font-medium text-white tracking-tight">
                Complete Online Memorial
              </h3>
              <p className="text-sm leading-6 text-[#b0b0b0]">
                A permanent, collaborative family archive. Unlimited photos, audio voicemails, and memories contributed by everyone who loved them.
              </p>
            </div>

            <ul className="relative flex flex-col gap-2 pt-6 border-t border-dashed border-white/15 text-xs text-[#e0e0e0] mt-6 z-10 list-none p-0">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                <span>Never expires · Lasts forever</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                <span>$179 one-time · Zero subscriptions</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                <span>Preserves original photos & voice notes</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                <span>Collaborative across the entire family</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 3. HOW IT WORKS                                                       */}
      {/* ===================================================================== */}
      <section id="how-it-works" className="py-16 sm:py-24 px-4 max-w-5xl mx-auto flex flex-col gap-12 sm:gap-16 border-t border-black/[0.06]">
        <SectionHeader
          badge="The Gifting Process"
          title="Designed for dignity and zero pressure."
          description={
            <>
              You do not need to ask the grieving family for dates, photos, or biographical records.{" "}
              <span className="rounded-md bg-primary/10 box-decoration-clone px-1 py-0.5 text-primary">
                Everything is ready for them
              </span>{" "}
              whenever they choose to begin.
            </>
          }
        />

        <ul className="grid gap-4 sm:gap-6 lg:grid-cols-3 list-none p-0 m-0">
          {/* Step 01 */}
          <li className="group relative flex flex-col overflow-hidden rounded-2xl bg-[#f6f6f6] pb-6 sm:pb-8 border border-black/[0.06]">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(125%_115%_at_0%_0%,#000_0%,#000_18%,transparent_66%)]"
            >
              <DitherGradient from="cyan" bloom="aura" />
            </span>

            <div className="relative flex items-baseline gap-2.5 px-6 py-4 sm:px-8">
              <span className="text-base tabular-nums text-muted-foreground font-medium">01</span>
              <h3 className="text-base font-medium tracking-tight text-[#181925]">You purchase the gift</h3>
            </div>

            <div className="relative flex flex-1 items-center justify-center px-4 py-5 sm:px-6 min-h-[170px]">
              <div className="w-full rounded-xl bg-white border border-black/[0.08] p-4 text-left flex flex-col gap-2">
                <span className="text-xs font-mono uppercase tracking-wider text-primary font-medium">
                  Quick & Simple
                </span>
                <p className="text-xs font-medium text-[#181925] leading-snug">
                  Enter your details and the recipient’s email. No accounts or password setups required from you.
                </p>
                <span className="text-xs font-mono text-emerald-600">✓ $179 one-time payment</span>
              </div>
            </div>

            <p className="relative pl-6 pr-6 text-sm leading-6 text-[#666] sm:pl-8 sm:pr-8 tracking-tight">
              You don’t need to know the person’s dates, obituary text, or photos today. We keep it entirely pressure-free.
            </p>
          </li>

          {/* Step 02 */}
          <li className="group relative flex flex-col overflow-hidden rounded-2xl bg-[#f6f6f6] pb-6 sm:pb-8 border border-black/[0.06]">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(125%_115%_at_0%_0%,#000_0%,#000_18%,transparent_66%)]"
            >
              <DitherGradient from="green" bloom="aura" />
            </span>

            <div className="relative flex items-baseline gap-2.5 px-6 py-4 sm:px-8">
              <span className="text-base tabular-nums text-muted-foreground font-medium">02</span>
              <h3 className="text-base font-medium tracking-tight text-[#181925]">They receive their invitation</h3>
            </div>

            <div className="relative flex flex-1 items-center justify-center px-4 py-5 sm:px-6 min-h-[170px]">
              <div className="w-full rounded-xl bg-white border border-black/[0.08] p-4 text-left flex flex-col gap-2">
                <span className="text-xs font-mono uppercase tracking-wider text-emerald-600 font-medium">
                  Dignified Delivery
                </span>
                <p className="text-xs font-medium text-[#181925] leading-snug">
                  The recipient receives a gentle email with your note and a private, direct claim link.
                </p>
                <span className="text-xs font-mono text-[#888]">Backup link sent to your receipt</span>
              </div>
            </div>

            <p className="relative pl-6 pr-6 text-sm leading-6 text-[#666] sm:pl-8 sm:pr-8 tracking-tight">
              If you prefer to write the link into a handwritten sympathy card, your purchase receipt includes the direct link.
            </p>
          </li>

          {/* Step 03 */}
          <li className="group relative flex flex-col overflow-hidden rounded-2xl bg-[#f6f6f6] pb-6 sm:pb-8 border border-black/[0.06]">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(125%_115%_at_0%_0%,#000_0%,#000_18%,transparent_66%)]"
            >
              <DitherGradient from="orange" bloom="high" />
            </span>

            <div className="relative flex items-baseline gap-2.5 px-6 py-4 sm:px-8">
              <span className="text-base tabular-nums text-muted-foreground font-medium">03</span>
              <h3 className="text-base font-medium tracking-tight text-[#181925]">They build it when ready</h3>
            </div>

            <div className="relative flex flex-1 items-center justify-center px-4 py-5 sm:px-6 min-h-[170px]">
              <div className="w-full rounded-xl bg-white border border-black/[0.08] p-4 text-left flex flex-col gap-2">
                <span className="text-xs font-mono uppercase tracking-wider text-primary font-medium">
                  Private Custodianship
                </span>
                <p className="text-xs font-medium text-[#181925] leading-snug">
                  They claim the gift, create a new memorial or upgrade an existing one, and invite friends to contribute.
                </p>
                <span className="text-xs font-mono text-emerald-600">✓ 100% owned by the recipient</span>
              </div>
            </div>

            <p className="relative pl-6 pr-6 text-sm leading-6 text-[#666] sm:pl-8 sm:pr-8 tracking-tight">
              The entitlement never expires. The memorial belongs completely to them under full private moderation.
            </p>
          </li>
        </ul>
      </section>

      {/* ===================================================================== */}
      {/* 4. FEATURES BENTO                                                     */}
      {/* ===================================================================== */}
      <section className="w-full max-w-5xl px-5 mx-auto py-16 sm:py-24 flex flex-col gap-12 border-t border-black/[0.06]">
        <SectionHeader
          badge="Complete Entitlements"
          title="Everything their memory deserves, fully prepaid."
          description={
            <>
              Every gifted memorial unlocks the full Complete tier on Theirs.{" "}
              <span className="rounded-md bg-primary/10 box-decoration-clone px-1 py-0.5 text-primary">
                Never downgraded, never expiring
              </span>
              , and completely ad-free.
            </>
          }
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1 */}
          <div className="flex flex-col bg-[#f7f7f8] rounded-2xl p-6 sm:p-8 border border-black/[0.04] justify-between min-h-[280px]">
            <div className="flex flex-col gap-3">
              <span className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-black/[0.06]">
                <ImageIcon className="size-5 text-primary" />
              </span>
              <h3 className="text-xl font-medium tracking-tight text-[#181925]">
                Unlimited Original Photos & Videos
              </h3>
              <p className="text-sm leading-6 text-[#666]">
                We preserve original-resolution media via direct cloud storage without lossy compression. High-resolution family heirlooms remain safe and downloadable by the family forever.
              </p>
            </div>
            <div className="pt-4 border-t border-black/[0.05] text-xs font-mono text-primary font-medium">
              Zero storage limits · High resolution
            </div>
          </div>

          {/* Card 2 */}
          <div className="flex flex-col bg-[#f7f7f8] rounded-2xl p-6 sm:p-8 border border-black/[0.04] justify-between min-h-[280px]">
            <div className="flex flex-col gap-3">
              <span className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-black/[0.06]">
                <Volume2 className="size-5 text-primary" />
              </span>
              <h3 className="text-xl font-medium tracking-tight text-[#181925]">
                Preserved Voice & Audio Recordings
              </h3>
              <p className="text-sm leading-6 text-[#666]">
                Photos show how someone looked; voice preserves how they sounded. Families can upload old voicemails, voice memos, and spoken stories that playback directly inside the memorial.
              </p>
            </div>
            <div className="pt-4 border-t border-black/[0.05] text-xs font-mono text-primary font-medium">
              Voicemails & spoken memories preserved
            </div>
          </div>

          {/* Card 3 */}
          <div className="flex flex-col bg-[#f7f7f8] rounded-2xl p-6 sm:p-8 border border-black/[0.04] justify-between min-h-[280px]">
            <div className="flex flex-col gap-3">
              <span className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-black/[0.06]">
                <Users className="size-5 text-primary" />
              </span>
              <h3 className="text-xl font-medium tracking-tight text-[#181925]">
                Limitless Family Contributions
              </h3>
              <p className="text-sm leading-6 text-[#666]">
                One person shouldn’t have to assemble an entire life alone. Extended family, childhood friends, and colleagues can contribute stories and photos from any phone without creating accounts.
              </p>
            </div>
            <div className="pt-4 border-t border-black/[0.05] text-xs font-mono text-primary font-medium">
              No login required for guests to contribute
            </div>
          </div>

          {/* Card 4 */}
          <div className="flex flex-col bg-[#f7f7f8] rounded-2xl p-6 sm:p-8 border border-black/[0.04] justify-between min-h-[280px]">
            <div className="flex flex-col gap-3">
              <span className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-black/[0.06]">
                <ShieldCheck className="size-5 text-primary" />
              </span>
              <h3 className="text-xl font-medium tracking-tight text-[#181925]">
                Private Ownership & Downloadable Archive
              </h3>
              <p className="text-sm leading-6 text-[#666]">
                The memorial belongs 100% to the recipient under strict caretakership. The family can choose public, unlisted, or passcode-protected privacy, and download their complete archive at any time.
              </p>
            </div>
            <div className="pt-4 border-t border-black/[0.05] text-xs font-mono text-primary font-medium">
              Your family is never locked in
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 5. PURCHASE FORM SECTION                                              */}
      {/* ===================================================================== */}
      <section id="purchase" className="py-16 sm:py-24 px-4 sm:px-6 max-w-5xl mx-auto flex flex-col gap-12 border-t border-black/[0.06]">
        <SectionHeader
          badge="Purchase Entitlement"
          title="Send a Complete memorial gift today."
          description={
            <>
              Prepay in full for $179.{" "}
              <span className="rounded-md bg-primary/10 box-decoration-clone px-1 py-0.5 text-primary">
                Never expires
              </span>
              , no account registration required to purchase, and immediate delivery.
            </>
          }
        />

        <GiftPurchaseForm />
      </section>

      {/* ===================================================================== */}
      {/* 6. EDITORIAL DEEP DIVE                                                */}
      {/* ===================================================================== */}
      <section className="py-16 sm:py-24 px-5 max-w-4xl mx-auto flex flex-col gap-10 border-t border-black/[0.06]">
        <div className="flex flex-col gap-3 text-center sm:text-left">
          <span className="font-mono text-xs text-primary uppercase tracking-wider font-medium">
            Sympathy & Support Guide
          </span>
          <h2 className="text-2xl sm:text-3xl font-medium text-[#181925] tracking-tight">
            How to support a grieving family when flowers don’t feel like enough
          </h2>
        </div>

        <div className="flex flex-col gap-6 text-base leading-7 text-[#555]">
          <p>
            When a close friend or family member loses someone they love, the initial instinct is often to send sympathy flowers or a paper condolence card. While well-intentioned, these traditional gifts often create unintended burdens: vases must be filled, withered stems must be thrown away, and paper cards pile up on dining tables during the most emotionally overwhelming week of a person's life.
          </p>

          <p>
            Gifting an <strong>online memorial website</strong> through Theirs offers a gentle, enduring alternative. Rather than imposing an immediate demand on the family's attention, a memorial gift entitlement is permanently prepaid and waits patiently. Whether the recipient feels able to begin adding photos tomorrow, after the funeral service, or six months later on a quiet Sunday afternoon, their memorial is ready whenever they are.
          </p>

          <div className="rounded-2xl bg-[#fafafb] border border-black/[0.06] p-6 sm:p-8 flex flex-col gap-3">
            <h4 className="text-lg font-medium text-[#181925]">
              The Grief-First Caretakership Promise
            </h4>
            <p className="text-sm leading-6 text-[#666]">
              We never fabricate AI chatbots pretending to be the person who passed away, and we never insert grief clichés or funeral ads. Theirs is built on the belief that a memorial should feel like visiting someone’s life, not visiting their obituary. By gifting a Complete memorial, you give a family a safe, beautifully designed home for their memories that will last for decades.
            </p>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 7. MORPHING SPRING FAQ ACCORDION                                      */}
      {/* ===================================================================== */}
      <section id="faq" className="py-16 sm:py-24 px-4 sm:px-6 max-w-5xl mx-auto flex flex-col gap-12 border-t border-black/[0.06]">
        <SectionHeader
          badge="Gift FAQs"
          title="Common questions about gifting a memorial."
          description={
            <>
              Everything you need to know about delivery, privacy, and redemption,{" "}
              <span className="rounded-md bg-primary/10 box-decoration-clone px-1 py-0.5 text-primary">
                clearly explained
              </span>
              .
            </>
          }
        />

        <GiftFaqAccordion />
      </section>

      {/* ===================================================================== */}
      {/* 8. FINAL DARK CHARCOAL BANNER                                          */}
      {/* ===================================================================== */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 max-w-5xl mx-auto">
        <div className="relative rounded-3xl bg-[#181925] p-8 sm:p-14 text-white text-center flex flex-col items-center gap-6 overflow-hidden border border-white/10">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(125%_115%_at_50%_0%,#000_0%,#000_30%,transparent_70%)]"
          >
            <DitherGradient from="orange" bloom="high" />
          </span>

          <div className="relative z-10 max-w-xl flex flex-col items-center gap-3">
            <span className="font-mono text-xs uppercase tracking-wider text-primary font-medium">
              Permanent Sympathy Gift
            </span>
            <h2 className="text-3xl sm:text-4xl font-medium tracking-tight text-white leading-tight">
              Give them a place to remember, together.
            </h2>
            <p className="text-base leading-relaxed text-[#b0b0b0]">
              $179 one-time payment. Zero subscriptions forever. The recipient owns and controls their memorial completely.
            </p>
          </div>

          <div className="relative z-10 pt-2">
            <a
              href="#purchase"
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap !rounded-full font-medium transition-all cursor-pointer border border-[color-mix(in_srgb,var(--primary)_80%,#8c3a10)] bg-[color-mix(in_srgb,var(--primary)_90%,#8c3a10)] text-primary-foreground hover:bg-primary active:scale-[0.98] h-12 px-8 text-sm group select-none"
            >
              <span>Purchase memorial gift entitlement</span>
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </a>
          </div>
        </div>
      </section>

      {/* Site-Wide Footer */}
      <TheirsFooter />
    </div>
  )
}
