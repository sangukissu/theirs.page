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
  Newspaper,
  Heart,
  Sparkles,
  Clock,
  Camera,
  MessageSquare,
  FileText,
  DollarSign,
  Share2,
  ExternalLink,
  BookOpen,
} from "lucide-react"

export const MEMORIAL_VS_OBITUARY_FAQS: SeoFaqItem[] = [
  {
    id: "how-to-phrase-link",
    question: "How do I include an online memorial link in a printed newspaper obituary?",
    answer:
      "Keep it simple and dignified. At the end of the obituary text, add a short sentence such as: 'In lieu of flowers, please explore Robert's life story and share your own memories at theirs.page/robert-carter.' Because Theirs provides short, memorable web addresses, readers can easily type it into their phone or computer browser.",
  },
  {
    id: "replace-funeral-obituary",
    question: "Does an online memorial replace the funeral home's obituary?",
    answer:
      "It does not replace it; they serve complementary roles. Funeral home notices communicate service times, parking directions, and immediate logistics to local attendees. Theirs serves as the permanent family sanctuary where visitors view high-resolution photos, listen to voicemails, and contribute heartfelt memories long after the funeral ends.",
  },
  {
    id: "newspaper-cost-vs-memorial",
    question: "How much does a newspaper obituary cost compared to an online memorial?",
    answer:
      "Newspaper obituaries are billed by line or column inch, often costing $300 to $800+ for a brief 200-word notice in regional newspapers (and over $1,500 in major dailies). An online memorial on Theirs is $0 for a free plan (up to 5 photos and unlimited tributes) or a single one-time payment of $179 for Complete with unlimited photos, video, audio, and timeline.",
  },
  {
    id: "tributes-years-later",
    question: "Can family and friends still leave memories years after the obituary ran?",
    answer:
      "Yes. While newspaper listings are quickly archived and forgotten, a Theirs memorial remains active permanently. Families frequently return on birthdays, anniversaries, and holidays to read old tributes and add new family stories.",
  },
  {
    id: "private-memorial-public-obituary",
    question: "Can I publish a public obituary while keeping the online memorial private?",
    answer:
      "Yes. You can publish a standard public obituary in your local newspaper, but set your Theirs memorial to PIN-protected or Link-only. You then share the private link and 4-digit PIN only with trusted family members and close friends via private message or email.",
  },
  {
    id: "who-writes-each",
    question: "Who writes an obituary versus an online memorial?",
    answer:
      "An obituary is typically written by a single grieving family member under severe deadline pressure to meet print runs. An online memorial is collaborative: you establish the opening portrait and summary, and then friends, cousins, colleagues, and neighbors help assemble their full life by contributing their own stories and photos.",
  },
  {
    id: "media-differences",
    question: "What media can be included in each format?",
    answer:
      "Newspapers and funeral home portals typically allow only a single, heavily compressed thumbnail photograph. A Theirs memorial preserves dozens or hundreds of original high-resolution photos across every life decade, alongside audio voicemails, spoken notes, video clips, and an interactive life timeline.",
  },
  {
    id: "ad-free-guarantee",
    question: "Why do newspaper obituary websites have so many ads?",
    answer:
      "Many digital obituary aggregators monetize traffic through programmatic display advertising, popups, and sponsored links for funeral insurance. Theirs is completely ad-free: our platform is sustained by one-time family upgrades, ensuring a peaceful, solemn reading experience.",
  },
]

export function OnlineMemorialVsObituaryView() {
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
              Memorial vs. Obituary Guide
            </span>
          </div>

          {/* H1 Heading */}
          <h1 className="text-balance text-4xl sm:text-6xl lg:text-[68px] font-medium tracking-[-0.04em] text-[#181925] leading-[1.04] mb-3.5">
            Online memorial vs. obituary:
            <br />
            <span className="text-primary">what is the difference?</span>
          </h1>

          {/* Subheading */}
          <p className="mx-auto max-w-[680px] text-pretty text-base sm:text-xl leading-relaxed text-[#666] mb-5 sm:mb-6">
            An obituary announces a death. A memorial website celebrates a lifetime. Understand how they differ and how{" "}
            <span className="rounded-md bg-primary/10 box-decoration-clone px-1 py-0.5 text-primary font-medium">
              modern families use both together
            </span>
            .
          </p>

          {/* Interactive Creation Pill Input */}
          <div className="w-full max-w-lg flex flex-col items-center gap-2 mb-4 sm:mb-5">
            <SeoHeroInput
              buttonLabel="Create an online memorial"
              placeholder="Robert Carter"
            />
          </div>

          {/* Compact Trust Line */}
          <p className="text-center text-xs font-mono text-[#888] mb-8 sm:mb-12">
            Concise announcement · Permanent life memorial · Better together · $0 to start
          </p>

          {/* Curated Life Panorama Ribbon */}
          <LifePanorama />
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 2. THE CORE DISTINCTION AT A GLANCE (DUAL BENTO GRID)                 */}
      {/* ===================================================================== */}
      <section className="w-full max-w-5xl px-4 sm:px-6 mx-auto py-16 sm:py-24 border-t border-black/[0.06] flex flex-col gap-12 sm:gap-14">
        <SectionHeader
          badge="Core Distinction"
          title="Two different formats for two different purposes."
          description="One is a practical announcement for the public community; the other is a permanent living archive for the family."
          className="max-w-3xl mx-auto"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: The Traditional Obituary */}
          <div className="flex flex-col justify-between bg-[#f7f7f8] rounded-2xl p-6 sm:p-8 border border-black/[0.04]">
            <div className="flex flex-col gap-3">
              <span className="w-10 h-9 rounded-full bg-white flex items-center justify-center border border-black/[0.06]">
                <Newspaper className="size-4 text-[#888]" />
              </span>
              <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#888] font-semibold">
                The Traditional Obituary
              </span>
              <h3 className="text-xl font-medium tracking-tight text-[#181925]">
                The Practical Announcement
              </h3>
              <p className="text-xs sm:text-sm text-[#666] leading-relaxed">
                A formal, text-heavy notice published in local newspapers or funeral home websites to notify the public of a death and provide funeral service dates and directions.
              </p>

              <div className="p-4 rounded-xl bg-white border border-black/[0.04] space-y-2 mt-2">
                <div className="flex items-center gap-2 text-xs text-[#555]">
                  <Check className="size-3.5 text-[#888] shrink-0" />
                  <span>Notifies community of dates and locations</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#555]">
                  <Check className="size-3.5 text-[#888] shrink-0" />
                  <span>Lists surviving family members officially</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#555]">
                  <Check className="size-3.5 text-[#888] shrink-0" />
                  <span>Published under immediate 24–48h deadlines</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-black/[0.06] text-xs font-mono text-[#888]">
              Short-term public record
            </div>
          </div>

          {/* Card 2: The Online Memorial */}
          <div className="flex flex-col justify-between bg-[#f7f7f8] rounded-2xl p-6 sm:p-8 border border-primary/25 relative overflow-hidden">
            <div className="flex flex-col gap-3">
              <span className="w-10 h-9 rounded-full bg-white flex items-center justify-center border border-black/[0.06]">
                <Heart className="size-4 text-primary" />
              </span>
              <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-primary font-semibold">
                The Theirs Online Memorial
              </span>
              <h3 className="text-xl font-medium tracking-tight text-[#181925]">
                The Living Family Archive
              </h3>
              <p className="text-xs sm:text-sm text-[#666] leading-relaxed">
                An unhurried, museum-grade digital sanctuary celebrating their whole life. Holds uncompressed photo galleries, audio notes, video clips, a life timeline, and memories from friends.
              </p>

              <div className="p-4 rounded-xl bg-white border border-primary/15 space-y-2 mt-2">
                <div className="flex items-center gap-2 text-xs text-[#181925] font-medium">
                  <Check className="size-3.5 text-primary shrink-0" />
                  <span>Celebrates personality, character, and humor</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#181925] font-medium">
                  <Check className="size-3.5 text-primary shrink-0" />
                  <span>Dozens of high-res photos across every life decade</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#181925] font-medium">
                  <Check className="size-3.5 text-primary shrink-0" />
                  <span>Collaborative: friends add memories over years</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-black/[0.06] text-xs font-mono text-primary font-medium">
              Permanent family legacy · 0 ads
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 3. DETAILED SIDE-BY-SIDE COMPARISON MATRIX                            */}
      {/* ===================================================================== */}
      <section className="w-full max-w-5xl px-4 sm:px-6 mx-auto py-16 sm:py-24 border-t border-black/[0.06] flex flex-col gap-12 sm:gap-14">
        <SectionHeader
          badge="Direct Comparison"
          title="How an obituary and an online memorial compare."
          description="A clear evaluation of purpose, media capacity, authorship, advertising, and longevity."
          className="max-w-3xl mx-auto"
        />

        <div className="bg-white rounded-2xl sm:rounded-3xl border border-black/[0.06] overflow-hidden p-6 sm:p-8 shadow-xs flex flex-col gap-6">
          <div className="overflow-x-auto">
            <p className="sm:hidden text-[11px] font-mono text-[#888] mb-2.5 text-right">
              Swipe horizontally to compare dimensions →
            </p>
            <table className="w-full text-left border-collapse text-xs sm:text-sm min-w-[620px]">
              <thead>
                <tr className="border-b border-black/[0.08]">
                  <th className="py-3 pr-4 font-mono uppercase tracking-wider text-[11px] text-[#888] font-medium">
                    Dimension
                  </th>
                  <th className="py-3 px-4 font-mono uppercase tracking-wider text-[11px] text-[#888] font-medium">
                    Traditional Obituary
                  </th>
                  <th className="py-3 pl-4 font-mono uppercase tracking-wider text-[11px] text-primary font-semibold">
                    Theirs Online Memorial
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.04] text-[#444]">
                <tr>
                  <td className="py-3.5 pr-4 font-medium text-[#181925]">Core Purpose</td>
                  <td className="py-3.5 px-4 text-[#666]">Announce death & funeral service times</td>
                  <td className="py-3.5 pl-4 text-emerald-700 font-medium">
                    Celebrate their whole lifetime & personality
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 pr-4 font-medium text-[#181925]">Media Capacity</td>
                  <td className="py-3.5 px-4 text-[#666]">Single low-res newspaper thumbnail</td>
                  <td className="py-3.5 pl-4 text-emerald-700 font-medium">
                    High-res photos, voicemails, audio & video
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 pr-4 font-medium text-[#181925]">Authorship</td>
                  <td className="py-3.5 px-4 text-[#666]">Written by one family member under stress</td>
                  <td className="py-3.5 pl-4 text-emerald-700 font-medium">
                    Collaborative: friends & family add stories
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 pr-4 font-medium text-[#181925]">Lifespan & Longevity</td>
                  <td className="py-3.5 px-4 text-[#666]">Newspaper edition or 30-day online listing</td>
                  <td className="py-3.5 pl-4 text-emerald-700 font-medium">
                    Permanent web address with zero renewal fees
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 pr-4 font-medium text-[#181925]">Advertising Environment</td>
                  <td className="py-3.5 px-4 text-[#666]">Often surrounded by ads, banners & florist links</td>
                  <td className="py-3.5 pl-4 text-emerald-700 font-medium">
                    100% ad-free, quiet, editorial aesthetic
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 pr-4 font-medium text-[#181925]">Community Interaction</td>
                  <td className="py-3.5 px-4 text-[#666]">Static one-way announcement</td>
                  <td className="py-3.5 pl-4 text-emerald-700 font-medium">
                    Tributes, audio memories, moderated guestbook
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 pr-4 font-medium text-[#181925]">Typical Cost</td>
                  <td className="py-3.5 px-4 text-[#666]">$300 to $800+ in regional newspapers</td>
                  <td className="py-3.5 pl-4 text-emerald-700 font-medium">
                    $0 Free Plan / $179 one-time Complete
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="pt-4 border-t border-black/[0.06] text-xs sm:text-sm text-[#666] leading-relaxed">
            <p>
              <strong className="text-[#181925] font-medium">The summary:</strong> An obituary is a necessary broadcast for a community event. A memorial website is a lasting home for love, photographs, and memories that outlives the funeral by decades.
            </p>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 4. THE MODERN BEST PRACTICE: HOW FAMILIES USE BOTH TOGETHER           */}
      {/* ===================================================================== */}
      <section className="w-full max-w-5xl px-4 sm:px-6 mx-auto py-16 sm:py-24 border-t border-black/[0.06] flex flex-col gap-12 sm:gap-14">
        <SectionHeader
          badge="Family Blueprint"
          title="How to connect your obituary to an online memorial."
          description="The simple 3-step strategy used by modern families to save money on expensive newspaper printing while building a lasting family archive."
          className="max-w-3xl mx-auto"
        />

        <div className="bg-[#f7f7f8] rounded-2xl sm:rounded-3xl border border-black/[0.06] p-6 sm:p-10 flex flex-col gap-4">
          {/* Step 1 */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-black/[0.06] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <span className="size-10 rounded-xl bg-neutral-100 flex items-center justify-center text-[#181925] font-mono text-sm font-semibold shrink-0">
                01
              </span>
              <div>
                <h4 className="text-base font-medium text-[#181925]">Keep the newspaper obituary brief and factual</h4>
                <p className="text-xs sm:text-sm text-[#666] leading-relaxed mt-1 max-w-2xl">
                  Newspapers charge by word or column inch. Focus your newspaper text on essential logistics: full name, life dates, service time, location, and key surviving family. This keeps print costs under control.
                </p>
              </div>
            </div>
            <span className="font-mono text-xs text-primary font-medium shrink-0 bg-primary/10 px-2.5 py-1 rounded-full">
              Save on Print Fees
            </span>
          </div>

          {/* Step 2 */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-black/[0.06] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <span className="size-10 rounded-xl bg-neutral-100 flex items-center justify-center text-[#181925] font-mono text-sm font-semibold shrink-0">
                02
              </span>
              <div>
                <h4 className="text-base font-medium text-[#181925]">Add your clean Theirs link to the closing line</h4>
                <p className="text-xs sm:text-sm text-[#666] leading-relaxed mt-1 max-w-2xl">
                  Conclude the obituary with: &ldquo;In lieu of flowers, view Robert&apos;s photo gallery and add your memories at <code className="font-mono text-xs bg-black/[0.04] px-1 py-0.5 rounded">theirs.page/robert-carter</code>.&rdquo; Everyone who reads the paper now has a bridge to the full memorial.
                </p>
              </div>
            </div>
            <span className="font-mono text-xs text-emerald-700 font-medium shrink-0 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60">
              Clean Web Link
            </span>
          </div>

          {/* Step 3 */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-black/[0.06] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <span className="size-10 rounded-xl bg-neutral-100 flex items-center justify-center text-[#181925] font-mono text-sm font-semibold shrink-0">
                03
              </span>
              <div>
                <h4 className="text-base font-medium text-[#181925]">Let the memorial grow over decades</h4>
                <p className="text-xs sm:text-sm text-[#666] leading-relaxed mt-1 max-w-2xl">
                  While the printed newspaper ends up recycled, the online memorial remains. Friends and family can continue adding photographs, voicemails, and tributes on future anniversaries, birthdays, and celebrations of life.
                </p>
              </div>
            </div>
            <span className="font-mono text-xs text-primary font-medium shrink-0 bg-primary/10 px-2.5 py-1 rounded-full">
              Permanent Legacy
            </span>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 5. REAL-WORLD DEMONSTRATION: ROBERT CARTER                            */}
      {/* ===================================================================== */}
      <section className="w-full max-w-5xl px-4 sm:px-6 mx-auto py-16 sm:py-24 border-t border-black/[0.06] flex flex-col gap-12 sm:gap-14">
        <SectionHeader
          badge="Real Example"
          title="See the difference in practice."
          description="Compare a brief 85-word newspaper notice with Robert Carter's full living online memorial."
          className="max-w-3xl mx-auto"
        />

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
          {/* Left: The Newspaper Notice */}
          <div className="md:col-span-5 bg-white rounded-2xl p-6 sm:p-7 border border-black/[0.08] flex flex-col justify-between shadow-2xs">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Newspaper className="size-4 text-[#888]" />
                <span className="font-mono text-[11px] uppercase tracking-wider text-[#888] font-semibold">
                  Local Newspaper Print Notice
                </span>
              </div>
              <h4 className="text-base font-serif font-bold text-[#181925] uppercase tracking-wide">
                CARTER, Robert Edward
              </h4>
              <p className="font-serif text-xs text-[#666] mt-0.5 mb-4">
                Devon Gazette · Published October 12, 2024
              </p>

              <div className="p-4 rounded-xl bg-[#fafafa] border border-black/[0.04] text-xs text-[#555] font-serif leading-relaxed space-y-2">
                <p>
                  Passed away peacefully on October 4, 2024, aged 76. Beloved husband of Clara, loving father to Anita and Thomas, devoted grandfather. Master clockmaker of Barnstaple for forty years.
                </p>
                <p>
                  Funeral service at St. Peter&apos;s Church on October 18 at 11:00 AM. Family flowers only.
                </p>
                <p className="pt-2 border-t border-black/[0.06] font-sans font-medium text-primary text-[11px]">
                  Share memories and view photos at theirs.page/robert-carter
                </p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-black/[0.06] text-xs font-mono text-[#888]">
              85 words · Single run
            </div>
          </div>

          {/* Right: The Full Memorial Preview */}
          <div className="md:col-span-7 bg-[#f7f7f8] rounded-2xl p-6 sm:p-7 border border-primary/20 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <Heart className="size-4 text-primary" />
                  <span className="font-mono text-[11px] uppercase tracking-wider text-primary font-semibold">
                    Theirs Online Memorial
                  </span>
                </div>
                <Link
                  href="/robert-carter"
                  className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-[#8c3a10]"
                >
                  <span>Explore live demo</span>
                  <ArrowRight className="size-3" />
                </Link>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-black/[0.06] shadow-2xs flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <div className="relative size-16 rounded-xl overflow-hidden bg-neutral-100 border border-black/10 shrink-0">
                    <img
                      src="/landing/robert-young.webp"
                      alt="Robert Carter"
                      className="size-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="text-base font-medium text-[#181925]">Robert Edward Carter</h4>
                    <p className="text-xs font-mono text-[#888]">1948 — 2024 · Master Clockmaker · Devon, UK</p>
                    <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-700 mt-1">
                      <Sparkles className="size-3" /> Complete Archive · 28 Photos · Timeline
                    </span>
                  </div>
                </div>

                <p className="text-xs text-[#555] font-serif italic leading-relaxed">
                  “He lived with gentle kindness and quiet courage. Dad spent his life fixing clocks, wandering the Devon hills, and telling stories that took an hour to reach the punchline.”
                </p>

                <div className="p-3 rounded-xl bg-neutral-50 border border-black/[0.04] text-xs text-[#666]">
                  <span className="font-medium text-[#181925]">Anita (Daughter): </span>
                  “Dad spent half of Christmas Day fixing Mrs. Higgins' washing machine while everyone was waiting for lunch.”
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-black/[0.06] flex items-center justify-between text-xs text-[#888]">
              <span>Permanent family sanctuary</span>
              <span className="text-emerald-700 font-medium">100% Ad-Free</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 6. HOW TO CREATE AN ONLINE MEMORIAL IN 3 SIMPLE STEPS                 */}
      {/* ===================================================================== */}
      <section className="w-full max-w-5xl px-4 sm:px-6 mx-auto py-16 sm:py-24 border-t border-black/[0.06] flex flex-col gap-12 sm:gap-14">
        <SectionHeader
          badge="Simple Setup"
          title="Create an online memorial in a few minutes."
          description="Start simple with their name and portrait, and let family and friends assemble the rest."
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
                Include the link in the obituary
              </h3>
              <p className="text-xs sm:text-sm text-[#666] leading-relaxed">
                Add the clean web link to the printed newspaper or service card so everyone attending can contribute their own memories.
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
          title="Common questions about online memorials and obituaries."
          description="Clear answers to help you navigate announcements and digital remembrance."
          className="max-w-3xl mx-auto"
        />

        <div className="w-full max-w-3xl mx-auto">
          <SeoFaqAccordion items={MEMORIAL_VS_OBITUARY_FAQS} />
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 9. RELEVANT GUIDES (CONTEXTUAL INTERNAL MESH)                         */}
      {/* ===================================================================== */}
      <SeoResourcesMesh
        currentPath="/online-memorial-vs-obituary"
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
