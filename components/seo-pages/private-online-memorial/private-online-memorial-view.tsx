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
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  KeyRound,
  UserCheck,
  Heart,
  Sparkles,
  Camera,
  MessageSquare,
  Globe,
  FileCheck,
} from "lucide-react"

export const PRIVATE_MEMORIAL_FAQS: SeoFaqItem[] = [
  {
    id: "change-privacy-later",
    question: "Can I change our memorial's privacy setting after creating it?",
    answer:
      "Yes. You have complete flexibility to update your memorial's visibility at any time from your caretaker dashboard. Many families begin with a private or link-only memorial during the immediate days surrounding the service, and later switch it to public once they are ready to share it with a wider circle of distant friends.",
  },
  {
    id: "google-indexing-prevention",
    question: "How does Theirs prevent search engines from finding unlisted memorials?",
    answer:
      "When you choose the Link-only setting, we inject strict `noindex, nofollow` search engine directives into the page headers. This explicitly instructs Google, Bing, and other web crawlers not to index the page, preventing it from appearing in public search results.",
  },
  {
    id: "how-pin-works",
    question: "How does the 4-digit family PIN protection work?",
    answer:
      "With the Complete plan, you can set a custom 4-digit PIN code (e.g. 1974). Anyone visiting your memorial link will see a warm, quiet entry gate prompting them to enter the passcode before any photos, stories, or tributes are displayed.",
  },
  {
    id: "forgot-pin",
    question: "What happens if a family member forgets the PIN?",
    answer:
      "As the memorial creator or caretaker, you can view, share, or reset the PIN at any time directly from your account settings. You can also disable the PIN with one click if you ever wish to open the memorial to a broader circle.",
  },
  {
    id: "contribute-with-pin",
    question: "Can family members still contribute tributes if the memorial has a PIN?",
    answer:
      "Yes. Once a visitor enters the correct 4-digit PIN, they have full access to read the life story, browse the photo gallery, and leave a tribute. Every submitted memory still routes directly to your private caretaker moderation inbox for approval before going live.",
  },
  {
    id: "caretaker-moderation",
    question: "What is the caretaker moderation queue?",
    answer:
      "All tributes, condolences, and memories submitted by guests are held in a private moderation queue. Only you and your designated co-caretakers can see pending submissions. No tribute ever appears on the live memorial page until you explicitly approve it.",
  },
  {
    id: "data-harvesting",
    question: "Does Theirs sell or harvest our family photos for advertising or AI?",
    answer:
      "No. We never sell user data, never run third-party advertising scripts, and never license your family's personal memories or photographs to AI training datasets. Your media remains 100% your family's property.",
  },
  {
    id: "multiple-caretakers",
    question: "Can multiple family members share caretaker administrative controls?",
    answer:
      "Yes. Complete memorials allow you to invite trusted family members (such as siblings or adult children) as co-caretakers, allowing them to review tribute submissions, add photos, and help manage the memorial together.",
  },
]

export function PrivateOnlineMemorialView() {
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
              Privacy & Security Guide
            </span>
          </div>

          {/* H1 Heading */}
          <h1 className="text-balance text-4xl sm:text-6xl lg:text-[68px] font-medium tracking-[-0.04em] text-[#181925] leading-[1.04] mb-3.5">
            Create a private online memorial
            <br />
            <span className="text-primary">for your family.</span>
          </h1>

          {/* Subheading */}
          <p className="mx-auto max-w-[680px] text-pretty text-base sm:text-xl leading-relaxed text-[#666] mb-5 sm:mb-6">
            Keep cherished photos, stories, and condolences safe with{" "}
            <span className="rounded-md bg-primary/10 box-decoration-clone px-1 py-0.5 text-primary font-medium">
              unlisted URLs, 4-digit PIN protection, and caretaker moderation
            </span>
            .
          </p>

          {/* Interactive Creation Pill Input */}
          <div className="w-full max-w-lg flex flex-col items-center gap-2 mb-4 sm:mb-5">
            <SeoHeroInput
              buttonLabel="Create a private memorial"
              placeholder="Robert Carter"
            />
          </div>

          {/* Compact Trust Line */}
          <p className="text-center text-xs font-mono text-[#888] mb-8 sm:mb-12">
            PIN protection · Unlisted from Google · Private moderation queue · Zero third-party tracking
          </p>

          {/* Curated Life Panorama Ribbon */}
          <LifePanorama />
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 2. THE THREE LEVELS OF MEMORIAL PRIVACY (BENTO GRID)                  */}
      {/* ===================================================================== */}
      <section className="w-full max-w-5xl px-4 sm:px-6 mx-auto py-16 sm:py-24 border-t border-black/[0.06] flex flex-col gap-12 sm:gap-14">
        <SectionHeader
          badge="Privacy Settings"
          title="Three ways to protect your family's space."
          description="You choose exactly who can find, view, and contribute to your loved one's memorial."
          className="max-w-3xl mx-auto"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Level 01: Public */}
          <div className="flex flex-col justify-between bg-[#f7f7f8] rounded-2xl p-6 sm:p-7 border border-black/[0.04]">
            <div className="flex flex-col gap-3">
              <span className="w-10 h-9 rounded-full bg-white flex items-center justify-center border border-black/[0.06]">
                <Globe className="size-4 text-emerald-600" />
              </span>
              <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-emerald-600 font-semibold">
                Level 01 · Public
              </span>
              <h3 className="text-lg font-medium tracking-tight text-[#181925]">
                Searchable on Google
              </h3>
              <p className="text-xs sm:text-sm text-[#666] leading-relaxed">
                Indexed by search engines so distant acquaintances, old schoolmates, and former colleagues can easily discover the memorial by searching their name.
              </p>
              <div className="p-3 rounded-xl bg-white border border-black/[0.04] text-xs text-[#555] leading-relaxed mt-2">
                ✓ Perfect for public celebrations of life and community condolences.
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-black/[0.06] text-xs font-mono text-emerald-700">
              Included on Free & Complete
            </div>
          </div>

          {/* Level 02: Link-Only */}
          <div className="flex flex-col justify-between bg-[#f7f7f8] rounded-2xl p-6 sm:p-7 border border-black/[0.04]">
            <div className="flex flex-col gap-3">
              <span className="w-10 h-9 rounded-full bg-white flex items-center justify-center border border-black/[0.06]">
                <EyeOff className="size-4 text-primary" />
              </span>
              <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-primary font-semibold">
                Level 02 · Link-Only (Unlisted)
              </span>
              <h3 className="text-lg font-medium tracking-tight text-[#181925]">
                Hidden from search engines
              </h3>
              <p className="text-xs sm:text-sm text-[#666] leading-relaxed">
                Protected with strict <code className="font-mono text-xs bg-black/[0.04] px-1 py-0.5 rounded">noindex</code> directives. Only people with your exact secret URL can access the memorial page.
              </p>
              <div className="p-3 rounded-xl bg-white border border-black/[0.04] text-xs text-[#555] leading-relaxed mt-2">
                ✓ Share easily via private email, WhatsApp, or printed funeral programs.
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-black/[0.06] text-xs font-mono text-primary font-medium">
              Included on Free & Complete
            </div>
          </div>

          {/* Level 03: 4-Digit PIN */}
          <div className="flex flex-col justify-between bg-[#f7f7f8] rounded-2xl p-6 sm:p-7 border border-primary/25 relative overflow-hidden">
            <div className="flex flex-col gap-3">
              <span className="w-10 h-9 rounded-full bg-white flex items-center justify-center border border-black/[0.06]">
                <Lock className="size-4 text-primary" />
              </span>
              <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-primary font-semibold">
                Level 03 · 4-Digit Family PIN
              </span>
              <h3 className="text-lg font-medium tracking-tight text-[#181925]">
                Complete passcode gate
              </h3>
              <p className="text-xs sm:text-sm text-[#666] leading-relaxed">
                Total privacy. Visitors must enter your custom 4-digit PIN code before any photos, stories, or tributes can be viewed.
              </p>
              <div className="p-3 rounded-xl bg-white border border-black/[0.04] text-xs text-[#555] leading-relaxed mt-2">
                ✓ Keeps personal family archives strictly within the trusted inner circle.
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-black/[0.06] text-xs font-mono text-primary font-medium">
              Included with Complete Upgrade
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 3. PRIVACY & SECURITY SPECIFICATION TABLE                             */}
      {/* ===================================================================== */}
      <section className="w-full max-w-5xl px-4 sm:px-6 mx-auto py-16 sm:py-24 border-t border-black/[0.06] flex flex-col gap-12 sm:gap-14">
        <SectionHeader
          badge="Security Comparison"
          title="Granular privacy controls at every tier."
          description="A clear breakdown of visibility settings, indexing rules, and contribution safeguards."
          className="max-w-3xl mx-auto"
        />

        <div className="bg-white rounded-2xl sm:rounded-3xl border border-black/[0.06] overflow-hidden p-6 sm:p-8 shadow-xs flex flex-col gap-6">
          <div className="overflow-x-auto">
            <p className="sm:hidden text-[11px] font-mono text-[#888] mb-2.5 text-right">
              Swipe horizontally to view all security features →
            </p>
            <table className="w-full text-left border-collapse text-xs sm:text-sm min-w-[560px]">
              <thead>
                <tr className="border-b border-black/[0.08]">
                  <th className="py-3 pr-4 font-mono uppercase tracking-wider text-[11px] text-[#888] font-medium">
                    Privacy & Safeguard Capability
                  </th>
                  <th className="py-3 px-3 font-mono uppercase tracking-wider text-[11px] text-[#888] font-medium">
                    Free Plan ($0)
                  </th>
                  <th className="py-3 pl-3 font-mono uppercase tracking-wider text-[11px] text-primary font-semibold">
                    Complete Plan ($179)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.04] text-[#444]">
                <tr>
                  <td className="py-3.5 pr-4 font-medium text-[#181925]">
                    Public Visibility (Google Searchable)
                  </td>
                  <td className="py-3.5 px-3 text-emerald-700 font-medium">
                    <span className="inline-flex items-center gap-1">
                      <Check className="size-3.5 text-emerald-600" /> Included
                    </span>
                  </td>
                  <td className="py-3.5 pl-3 text-emerald-700 font-medium">
                    <span className="inline-flex items-center gap-1">
                      <Check className="size-3.5 text-emerald-600" /> Included
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 pr-4 font-medium text-[#181925]">
                    Link-Only Visibility (<code className="font-mono text-xs">noindex</code> Unlisted)
                  </td>
                  <td className="py-3.5 px-3 text-emerald-700 font-medium">
                    <span className="inline-flex items-center gap-1">
                      <Check className="size-3.5 text-emerald-600" /> Included
                    </span>
                  </td>
                  <td className="py-3.5 pl-3 text-emerald-700 font-medium">
                    <span className="inline-flex items-center gap-1">
                      <Check className="size-3.5 text-emerald-600" /> Included
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 pr-4 font-medium text-[#181925]">
                    4-Digit Family PIN Protection (Passcode Gate)
                  </td>
                  <td className="py-3.5 px-3 text-[#888]">
                    Complete upgrade
                  </td>
                  <td className="py-3.5 pl-3 text-emerald-700 font-medium">
                    <span className="inline-flex items-center gap-1">
                      <Check className="size-3.5 text-emerald-600" /> Included
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 pr-4 font-medium text-[#181925]">
                    Caretaker Moderation Queue (Approve Before Posting)
                  </td>
                  <td className="py-3.5 px-3 text-emerald-700 font-medium">
                    <span className="inline-flex items-center gap-1">
                      <Check className="size-3.5 text-emerald-600" /> Included
                    </span>
                  </td>
                  <td className="py-3.5 pl-3 text-emerald-700 font-medium">
                    <span className="inline-flex items-center gap-1">
                      <Check className="size-3.5 text-emerald-600" /> Included
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 pr-4 font-medium text-[#181925]">
                    Multiple Family Caretakers (Co-Administrators)
                  </td>
                  <td className="py-3.5 px-3 text-[#888]">
                    Single caretaker
                  </td>
                  <td className="py-3.5 pl-3 text-emerald-700 font-medium">
                    <span className="inline-flex items-center gap-1">
                      <Check className="size-3.5 text-emerald-600" /> Multiple caretakers
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 pr-4 font-medium text-[#181925]">
                    Third-Party Advertising & Tracking Scripts
                  </td>
                  <td className="py-3.5 px-3 text-emerald-700 font-medium">
                    0 Ads (100% ad-free)
                  </td>
                  <td className="py-3.5 pl-3 text-emerald-700 font-medium">
                    0 Ads (100% ad-free)
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 pr-4 font-medium text-[#181925]">
                    Data Export (Download Full-Resolution Archive)
                  </td>
                  <td className="py-3.5 px-3 text-[#888]">
                    Web view
                  </td>
                  <td className="py-3.5 pl-3 text-emerald-700 font-medium">
                    <span className="inline-flex items-center gap-1">
                      <Check className="size-3.5 text-emerald-600" /> Full archive download
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="pt-4 border-t border-black/[0.06] text-xs sm:text-sm text-[#666] leading-relaxed">
            <p>
              <strong className="text-[#181925] font-medium">You remain in control:</strong> You can switch visibility settings at any time with a single click. Upgrading to Complete is never required to keep a memorial unlisted from search engines.
            </p>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 4. FOUR ESSENTIAL PEACE-OF-MIND PROTECTIONS                           */}
      {/* ===================================================================== */}
      <section className="w-full max-w-5xl px-4 sm:px-6 mx-auto py-16 sm:py-24 border-t border-black/[0.06] flex flex-col gap-12 sm:gap-14">
        <SectionHeader
          badge="Peace of Mind"
          title="Why families choose private online memorials."
          description="Creating a quiet, sacred digital space that feels like an intimate family living room, not a public bulletin board."
          className="max-w-3xl mx-auto"
        />

        <div className="bg-[#f7f7f8] rounded-2xl sm:rounded-3xl border border-black/[0.06] p-6 sm:p-10 flex flex-col gap-4">
          {/* Protection 1 */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-black/[0.06] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <span className="size-10 rounded-xl bg-neutral-100 flex items-center justify-center text-[#181925] font-mono text-sm font-semibold shrink-0">
                01
              </span>
              <div>
                <h4 className="text-base font-medium text-[#181925]">Protection from Internet Scrapers & Bots</h4>
                <p className="text-xs sm:text-sm text-[#666] leading-relaxed mt-1 max-w-2xl">
                  Public death records are routinely targeted by commercial scrapers, genealogy aggregators, and spam directories. Unlisted and PIN-protected memorials keep your family photographs and stories completely off public registries.
                </p>
              </div>
            </div>
            <span className="font-mono text-xs text-primary font-medium shrink-0 bg-primary/10 px-2.5 py-1 rounded-full">
              Anti-Scraping
            </span>
          </div>

          {/* Protection 2 */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-black/[0.06] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <span className="size-10 rounded-xl bg-neutral-100 flex items-center justify-center text-[#181925] font-mono text-sm font-semibold shrink-0">
                02
              </span>
              <div>
                <h4 className="text-base font-medium text-[#181925]">A Safe Space for Vulnerable Emotions</h4>
                <p className="text-xs sm:text-sm text-[#666] leading-relaxed mt-1 max-w-2xl">
                  When a memorial is strictly private, family members feel safe sharing honest, emotional memories—including vintage childhood snapshots, inside jokes, and intimate voice recordings—without worrying about public scrutiny.
                </p>
              </div>
            </div>
            <span className="font-mono text-xs text-emerald-700 font-medium shrink-0 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60">
              Emotional Safety
            </span>
          </div>

          {/* Protection 3 */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-black/[0.06] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <span className="size-10 rounded-xl bg-neutral-100 flex items-center justify-center text-[#181925] font-mono text-sm font-semibold shrink-0">
                03
              </span>
              <div>
                <h4 className="text-base font-medium text-[#181925]">Caretaker Moderation for Every Single Tribute</h4>
                <p className="text-xs sm:text-sm text-[#666] leading-relaxed mt-1 max-w-2xl">
                  Never worry about an inappropriate comment or awkward message spoiling the memorial. Every contribution sits quietly in your private caretaker dashboard until you review and approve it.
                </p>
              </div>
            </div>
            <span className="font-mono text-xs text-primary font-medium shrink-0 bg-primary/10 px-2.5 py-1 rounded-full">
              Zero Unmoderated Posts
            </span>
          </div>

          {/* Protection 4 */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-black/[0.06] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <span className="size-10 rounded-xl bg-neutral-100 flex items-center justify-center text-[#181925] font-mono text-sm font-semibold shrink-0">
                04
              </span>
              <div>
                <h4 className="text-base font-medium text-[#181925]">Zero Third-Party Advertising or AI Scraping</h4>
                <p className="text-xs sm:text-sm text-[#666] leading-relaxed mt-1 max-w-2xl">
                  We never embed advertising trackers, never resell visitor emails to funeral homes, and never feed uploaded family portraits into commercial artificial intelligence datasets.
                </p>
              </div>
            </div>
            <span className="font-mono text-xs text-emerald-700 font-medium shrink-0 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60">
              Data Integrity
            </span>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 5. PRODUCT PROOF: HOW CARETAKER PRIVACY WORKS ON THEIRS              */}
      {/* ===================================================================== */}
      <section className="w-full max-w-5xl px-4 sm:px-6 mx-auto py-16 sm:py-24 border-t border-black/[0.06] flex flex-col gap-12 sm:gap-14">
        <SectionHeader
          badge="Product Proof"
          title="You stay in complete control as the memorial grows."
          description="Every memory waits in your private caretaker dashboard until you approve it."
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
                    <span className="inline-flex items-center gap-1 text-[11px] font-mono text-primary mt-1">
                      <Lock className="size-3" /> PIN Protected · Private Archive
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#fbfbfb] border border-black/[0.04]">
                  <p className="text-xs text-[#555] font-serif italic leading-relaxed">
                    “He lived with gentle kindness and quiet courage. Dad spent his life fixing clocks, wandering the Devon hills, and telling stories that took an hour to reach the punchline.”
                  </p>
                </div>

                {/* Sample Moderated Tribute */}
                <div className="p-3.5 rounded-xl bg-neutral-50 border border-black/[0.04] flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-medium text-[#181925]">Anita · Daughter</span>
                    <span className="font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60">
                      Approved by Caretaker
                    </span>
                  </div>
                  <p className="text-xs text-[#666] leading-relaxed">
                    “Dad spent half of Christmas Day fixing Mrs. Higgins' washing machine while everyone was waiting for lunch.”
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-black/[0.06] flex items-center justify-between text-xs text-[#888]">
                <span>Passcode protected</span>
                <span className="text-emerald-700 font-medium">100% Caretaker Moderated</span>
              </div>
            </div>

            {/* Right Specification List */}
            <div className="lg:col-span-6 flex flex-col justify-between gap-4">
              <div className="bg-white rounded-2xl p-5 border border-black/[0.06] flex items-start gap-4">
                <span className="size-9 rounded-xl bg-neutral-100 flex items-center justify-center text-[#181925] shrink-0 mt-0.5">
                  <KeyRound className="size-4 text-primary" />
                </span>
                <div>
                  <h4 className="text-sm font-medium text-[#181925]">Custom 4-Digit Passcode</h4>
                  <p className="text-xs text-[#666] leading-relaxed mt-1">
                    Choose any memorable 4-digit code (such as their birth year). Share it easily via text or email so only invited friends can enter.
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-black/[0.06] flex items-start gap-4">
                <span className="size-9 rounded-xl bg-neutral-100 flex items-center justify-center text-[#181925] shrink-0 mt-0.5">
                  <UserCheck className="size-4 text-emerald-600" />
                </span>
                <div>
                  <h4 className="text-sm font-medium text-[#181925]">Private Moderation Queue</h4>
                  <p className="text-xs text-[#666] leading-relaxed mt-1">
                    Every tribute waits quietly in your caretaker inbox. You read every memory first and decide whether it appears on the memorial.
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-black/[0.06] flex items-start gap-4">
                <span className="size-9 rounded-xl bg-neutral-100 flex items-center justify-center text-[#181925] shrink-0 mt-0.5">
                  <EyeOff className="size-4 text-primary" />
                </span>
                <div>
                  <h4 className="text-sm font-medium text-[#181925]">Automatic Search De-Indexing</h4>
                  <p className="text-xs text-[#666] leading-relaxed mt-1">
                    Unlisted settings actively instruct search engines not to catalog your page, keeping family photos out of public image searches.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 6. HOW TO SET UP A PRIVATE MEMORIAL IN 3 SIMPLE STEPS                 */}
      {/* ===================================================================== */}
      <section className="w-full max-w-5xl px-4 sm:px-6 mx-auto py-16 sm:py-24 border-t border-black/[0.06] flex flex-col gap-12 sm:gap-14">
        <SectionHeader
          badge="Simple Setup"
          title="Create a private memorial in minutes."
          description="Setting up privacy takes just a few clicks. Start simple and adjust settings whenever you wish."
          className="max-w-3xl mx-auto"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col justify-between rounded-2xl bg-[#f6f6f6] p-6 sm:p-7 border border-black/[0.06]">
            <div>
              <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                Step 01
              </span>
              <h3 className="text-lg font-medium tracking-tight text-[#181925] mt-2 mb-2">
                Choose your privacy level
              </h3>
              <p className="text-xs sm:text-sm text-[#666] leading-relaxed">
                Start with their name and select your preferred visibility: Public, Link-only (unlisted), or PIN-protected family archive.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-black/[0.06] text-xs font-mono text-[#888]">
              Adjustable anytime
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-2xl bg-[#f6f6f6] p-6 sm:p-7 border border-black/[0.06]">
            <div>
              <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                Step 02
              </span>
              <h3 className="text-lg font-medium tracking-tight text-[#181925] mt-2 mb-2">
                Add their story & photos
              </h3>
              <p className="text-xs sm:text-sm text-[#666] leading-relaxed">
                Upload their portrait, write the opening chapter of their life story, and add milestone photographs at original high resolution.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-black/[0.06] text-xs font-mono text-[#888]">
              Uncompressed original media
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-2xl bg-[#f6f6f6] p-6 sm:p-7 border border-black/[0.06]">
            <div>
              <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                Step 03
              </span>
              <h3 className="text-lg font-medium tracking-tight text-[#181925] mt-2 mb-2">
                Share privately with family
              </h3>
              <p className="text-xs sm:text-sm text-[#666] leading-relaxed">
                Send the private link and PIN code directly to family and close friends. You review and approve incoming memories privately.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-black/[0.06] text-xs font-mono text-[#888]">
              Safe family sanctuary
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
          title="Common questions about private online memorials."
          description="Clear answers to help you safeguard your family's personal memories."
          className="max-w-3xl mx-auto"
        />

        <div className="w-full max-w-3xl mx-auto">
          <SeoFaqAccordion items={PRIVATE_MEMORIAL_FAQS} />
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 9. RELEVANT GUIDES (CONTEXTUAL INTERNAL MESH)                         */}
      {/* ===================================================================== */}
      <SeoResourcesMesh
        currentPath="/private-online-memorial"
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
