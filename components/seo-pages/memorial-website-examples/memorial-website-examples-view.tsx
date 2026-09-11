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
  ArrowRight,
  Camera,
  MessageSquare,
  Clock,
  Sparkles,
  BookOpen,
  Check,
  X,
  Compass,
  Flower2,
  Hammer,
  Quote,
} from "lucide-react"

export const MEMORIAL_EXAMPLES_FAQS: SeoFaqItem[] = [
  {
    id: "see-live-demo",
    question: "Can I explore a real memorial website example before creating one?",
    answer:
      "Yes. You can explore Robert Carter's live demo memorial at theirs.page/robert-carter. It demonstrates how the portrait, life story, milestone gallery, interactive chronological timeline, and family tributes come together in a real memorial.",
  },
  {
    id: "what-to-include",
    question: "What should be included on a memorial website?",
    answer:
      "A complete memorial typically includes an opening portrait with life dates, an unhurried biography celebrating their personality and relationships, milestone photographs across their life eras, a chronological timeline of key milestones, and a guestbook where friends and family can leave written stories and condolences.",
  },
  {
    id: "few-photos",
    question: "What if our family only has a few photographs?",
    answer:
      "A memorial does not require a large photo collection to be meaningful. Even 3 to 5 cherished pictures paired with a thoughtful life story and contributions from friends who knew them create an intimate, touching tribute.",
  },
  {
    id: "collaborative-contributions",
    question: "Can family and friends contribute their own photos and memories?",
    answer:
      "Yes. Anyone with the memorial link can leave a tribute, upload a memory, or share a story from their phone or computer without creating an account or downloading an app. Every contribution waits in your private caretaker moderation queue for approval before appearing on the page.",
  },
  {
    id: "private-examples",
    question: "Can I make our memorial page private so strangers cannot see it?",
    answer:
      "Yes. Memorials can be set to Link-only (unlisted from search engines so only people with the exact URL can visit) or fully PIN-protected with a 4-digit passcode for complete family privacy.",
  },
  {
    id: "memorial-vs-obituary",
    question: "How is an online memorial different from an online obituary?",
    answer:
      "An obituary is a short, static announcement focused primarily on death details, family survivors, and funeral logistics. An online memorial is a living, collaborative tribute that celebrates a whole lifetime, holds high-resolution media and voice recordings, and grows over time with stories from the community.",
  },
  {
    id: "edit-after-publishing",
    question: "Can I update or add more photos after the memorial is published?",
    answer:
      "Yes. You can edit their biography, add or rearrange photos, adjust timeline chapters, and approve incoming tributes whenever you wish. You never have to finish everything in one sitting.",
  },
  {
    id: "cost-to-create",
    question: "How much does it cost to create a memorial like the examples shown?",
    answer:
      "You can create and publish a free memorial with their portrait, story, up to 5 photographs, and unlimited tributes for $0 with no credit card required. If your family wants unlimited original photos, audio notes, video clips, and timeline chapters, you can upgrade to Complete for a one-time payment of $179 with no recurring subscriptions.",
  },
]

export function MemorialWebsiteExamplesView() {
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
              Memorial website examples
            </span>
          </div>

          {/* H1 Heading */}
          <h1 className="text-balance text-4xl sm:text-6xl lg:text-[68px] font-medium tracking-[-0.04em] text-[#181925] leading-[1.04] mb-3.5">
            Real memorial website examples
            <br />
            <span className="text-primary">to inspire yours.</span>
          </h1>

          {/* Subheading */}
          <p className="mx-auto max-w-[680px] text-pretty text-base sm:text-xl leading-relaxed text-[#666] mb-5 sm:mb-6">
            See how families bring together photos, life stories, chronological milestones, and tributes in a{" "}
            <span className="rounded-md bg-primary/10 box-decoration-clone px-1 py-0.5 text-primary font-medium">
              calm, collaborative online memorial
            </span>
            .
          </p>

          {/* Interactive Creation Pill Input */}
          <div className="w-full max-w-lg flex flex-col items-center gap-2 mb-4 sm:mb-5">
            <SeoHeroInput
              buttonLabel="Start their memorial"
              placeholder="Robert Carter"
            />
          </div>

          {/* Compact Trust Line */}
          <p className="text-center text-xs font-mono text-[#888] mb-8 sm:mb-12">
            Curated examples · Ad-free spaces · Real family stories · $0 to start
          </p>

          {/* Curated Life Panorama Ribbon */}
          <LifePanorama />
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 2. FLAGSHIP INTERACTIVE SHOWCASE — ROBERT CARTER DEMO                 */}
      {/* ===================================================================== */}
      <section className="w-full max-w-5xl px-4 sm:px-6 mx-auto py-16 sm:py-24 border-t border-black/[0.06] flex flex-col gap-12 sm:gap-14">
        <SectionHeader
          badge="Live Memorial Demo"
          title="An unhurried tribute to a life well-lived."
          description="Explore the structure of a complete Theirs memorial using Robert Carter’s live memorial page."
          className="max-w-3xl mx-auto"
        />

        <div className="bg-[#f7f7f8] rounded-2xl sm:rounded-3xl border border-black/[0.06] overflow-hidden p-6 sm:p-10 flex flex-col gap-8">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-6 border-b border-black/[0.06]">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-primary font-medium">
                Complete Showcase · theirs.page/robert-carter
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

          {/* 2-Column Split: Card Preview + Architectural Pillars */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Left Preview Card */}
            <div className="lg:col-span-5 bg-white rounded-2xl border border-black/[0.06] p-6 sm:p-7 flex flex-col justify-between shadow-2xs">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <div className="relative size-18 rounded-xl overflow-hidden bg-neutral-100 border border-black/10 shrink-0">
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
                      <Sparkles className="size-3" /> Complete Archive
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#fbfbfb] border border-black/[0.04]">
                  <p className="text-xs text-[#555] font-serif italic leading-relaxed">
                    “He lived with gentle kindness and quiet courage. Dad spent his life fixing clocks, wandering the Devon hills, and telling stories that took an hour to reach the punchline.”
                  </p>
                </div>

                {/* Contribution Sample */}
                <div className="p-3.5 rounded-xl bg-neutral-50 border border-black/[0.04] flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-medium text-[#181925]">David · Brother</span>
                    <span className="font-mono text-[#888]">1974 Milestone Photo</span>
                  </div>
                  <p className="text-xs text-[#666] leading-relaxed">
                    “The afternoon Robert finally finished the parish clock pendulum. He wouldn&apos;t take a single pound for the work.”
                  </p>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-black/[0.06] flex items-center justify-between text-xs text-[#888]">
                <span>28 original photos</span>
                <span className="text-primary font-medium">Interactive timeline</span>
              </div>
            </div>

            {/* Right Architectural Pillars */}
            <div className="lg:col-span-7 flex flex-col justify-between gap-3.5">
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-black/[0.06] flex items-start gap-4">
                <span className="size-9 rounded-xl bg-neutral-100 flex items-center justify-center text-[#181925] shrink-0 mt-0.5">
                  <Camera className="size-4 text-primary" />
                </span>
                <div>
                  <h4 className="text-sm font-medium text-[#181925]">1. The Portrait & Gentle Inscription</h4>
                  <p className="text-xs text-[#666] leading-relaxed mt-1">
                    A clear, dignified portrait paired with their birth and passing years and a defining quote that immediately sets a warm, personal tone for visitors.
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-black/[0.06] flex items-start gap-4">
                <span className="size-9 rounded-xl bg-neutral-100 flex items-center justify-center text-[#181925] shrink-0 mt-0.5">
                  <Clock className="size-4 text-emerald-600" />
                </span>
                <div>
                  <h4 className="text-sm font-medium text-[#181925]">2. Chronological Life Timeline</h4>
                  <p className="text-xs text-[#666] leading-relaxed mt-1">
                    Chapters spanning his 1948 Barnstaple childhood, 1968 clockmaking apprenticeship, 1974 marriage to Clara, and 2004 grandfatherhood.
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-black/[0.06] flex items-start gap-4">
                <span className="size-9 rounded-xl bg-neutral-100 flex items-center justify-center text-[#181925] shrink-0 mt-0.5">
                  <BookOpen className="size-4 text-primary" />
                </span>
                <div>
                  <h4 className="text-sm font-medium text-[#181925]">3. Curated Photographic Gallery</h4>
                  <p className="text-xs text-[#666] leading-relaxed mt-1">
                    Original-resolution photographs preserved with captions explaining who was there and why the moment mattered.
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-black/[0.06] flex items-start gap-4">
                <span className="size-9 rounded-xl bg-neutral-100 flex items-center justify-center text-[#181925] shrink-0 mt-0.5">
                  <MessageSquare className="size-4 text-emerald-600" />
                </span>
                <div>
                  <h4 className="text-sm font-medium text-[#181925]">4. Collaborative Family Memories</h4>
                  <p className="text-xs text-[#666] leading-relaxed mt-1">
                    Condolences, voicemails, and stories left by daughters, cousins, and old neighbors—all privately moderated before appearing.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 3. THREE MEMORIAL EXAMPLES BY ARCHETYPE (BENTO GRID)                  */}
      {/* ===================================================================== */}
      <section className="w-full max-w-5xl px-4 sm:px-6 mx-auto py-16 sm:py-24 border-t border-black/[0.06] flex flex-col gap-12 sm:gap-14">
        <SectionHeader
          badge="Inspiration by Archetype"
          title="Different lives deserve different memorials."
          description="Every person leaves behind a unique rhythm. Here is how three different families structured a tribute to match their loved one's spirit."
          className="max-w-3xl mx-auto"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Archetype 1: The Craftsman & Patriarch */}
          <div className="flex flex-col justify-between bg-[#f7f7f8] rounded-2xl p-6 sm:p-7 border border-black/[0.04]">
            <div className="flex flex-col gap-3">
              <div className="relative h-44 w-full rounded-xl overflow-hidden bg-neutral-200 border border-black/10">
                <img
                  src="/theirs/wooden-work.webp"
                  alt="Craftsman workshop memorial"
                  className="size-full object-cover"
                />
                <span className="absolute top-2.5 left-2.5 bg-white/95 backdrop-blur-xs text-[10px] font-mono uppercase tracking-wider text-[#181925] px-2 py-0.5 rounded font-medium">
                  Craftsman & Patriarch
                </span>
              </div>

              <div className="flex items-center gap-2 mt-1">
                <Hammer className="size-3.5 text-primary" />
                <span className="font-mono text-[11px] uppercase tracking-wider text-[#181925] font-semibold">
                  Robert Carter · 1948–2024
                </span>
              </div>

              <h3 className="text-lg font-medium tracking-tight text-[#181925]">
                A tribute grounded in patience & craft.
              </h3>

              <p className="text-xs sm:text-sm text-[#666] leading-relaxed">
                Focused on hands-on creations, apprenticeship records, woodworking projects, and the patience he showed to three generations of children.
              </p>

              <div className="p-3 rounded-xl bg-white border border-black/[0.04] text-xs text-[#555] italic font-serif leading-relaxed">
                “He spent his life fixing clocks and telling stories that took an hour to reach the punchline.”
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-black/[0.06] flex items-center justify-between text-xs font-mono text-[#888]">
              <span>Timeline chapters</span>
              <span className="text-primary font-medium">Devon, UK</span>
            </div>
          </div>

          {/* Archetype 2: The Matriarch & Botanist */}
          <div className="flex flex-col justify-between bg-[#f7f7f8] rounded-2xl p-6 sm:p-7 border border-black/[0.04]">
            <div className="flex flex-col gap-3">
              <div className="relative h-44 w-full rounded-xl overflow-hidden bg-neutral-200 border border-black/10">
                <img
                  src="/theirs/rose-garden.webp"
                  alt="Garden matriarch memorial"
                  className="size-full object-cover"
                />
                <span className="absolute top-2.5 left-2.5 bg-white/95 backdrop-blur-xs text-[10px] font-mono uppercase tracking-wider text-[#181925] px-2 py-0.5 rounded font-medium">
                  Educator & Matriarch
                </span>
              </div>

              <div className="flex items-center gap-2 mt-1">
                <Flower2 className="size-3.5 text-emerald-600" />
                <span className="font-mono text-[11px] uppercase tracking-wider text-[#181925] font-semibold">
                  Clara Evelyn Carter · 1950–2022
                </span>
              </div>

              <h3 className="text-lg font-medium tracking-tight text-[#181925]">
                A celebration of hospitality & nature.
              </h3>

              <p className="text-xs sm:text-sm text-[#666] leading-relaxed">
                Structured around family kitchen recipes, botanical garden photographs, and decades of heartfelt letters written by former primary school students.
              </p>

              <div className="p-3 rounded-xl bg-white border border-black/[0.04] text-xs text-[#555] italic font-serif leading-relaxed">
                “She measured the years not in calendar months, but in the first blooming of winter aconites.”
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-black/[0.06] flex items-center justify-between text-xs font-mono text-[#888]">
              <span>Recipe & garden gallery</span>
              <span className="text-emerald-600 font-medium">Somerset, UK</span>
            </div>
          </div>

          {/* Archetype 3: The Creative Adventurer */}
          <div className="flex flex-col justify-between bg-[#f7f7f8] rounded-2xl p-6 sm:p-7 border border-black/[0.04]">
            <div className="flex flex-col gap-3">
              <div className="relative h-44 w-full rounded-xl overflow-hidden bg-neutral-200 border border-black/10">
                <img
                  src="/theirs/still-waters.webp"
                  alt="Adventurous creative memorial"
                  className="size-full object-cover"
                />
                <span className="absolute top-2.5 left-2.5 bg-white/95 backdrop-blur-xs text-[10px] font-mono uppercase tracking-wider text-[#181925] px-2 py-0.5 rounded font-medium">
                  Designer & Adventurer
                </span>
              </div>

              <div className="flex items-center gap-2 mt-1">
                <Compass className="size-3.5 text-primary" />
                <span className="font-mono text-[11px] uppercase tracking-wider text-[#181925] font-semibold">
                  Maya Lin Vance · 1985–2023
                </span>
              </div>

              <h3 className="text-lg font-medium tracking-tight text-[#181925]">
                A vibrant canvas of art & wanderlust.
              </h3>

              <p className="text-xs sm:text-sm text-[#666] leading-relaxed">
                Organized with spontaneous sketchbook scans, audio voicemails from friends, mountain expedition logs, and collaborative photo collections.
              </p>

              <div className="p-3 rounded-xl bg-white border border-black/[0.04] text-xs text-[#555] italic font-serif leading-relaxed">
                “She traveled with an unsharpened pencil and left laughter in every city she touched.”
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-black/[0.06] flex items-center justify-between text-xs font-mono text-[#888]">
              <span>Audio voicemails</span>
              <span className="text-primary font-medium">Vancouver, CA</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 4. THE ANATOMY OF A MEANINGFUL MEMORIAL WEBSITE                       */}
      {/* ===================================================================== */}
      <section className="w-full max-w-5xl px-4 sm:px-6 mx-auto py-16 sm:py-24 border-t border-black/[0.06] flex flex-col gap-12 sm:gap-14">
        <SectionHeader
          badge="Layout & Structure"
          title="What goes into a complete memorial website?"
          description="The 5 essential building blocks that transform an impersonal death announcement into an authentic family sanctuary."
          className="max-w-3xl mx-auto"
        />

        <div className="bg-[#f7f7f8] rounded-2xl sm:rounded-3xl border border-black/[0.06] p-6 sm:p-10 flex flex-col gap-4">
          {/* Pillar 1 */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-black/[0.06] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <span className="size-10 rounded-xl bg-neutral-100 flex items-center justify-center text-[#181925] font-mono text-sm font-semibold shrink-0">
                01
              </span>
              <div>
                <h4 className="text-base font-medium text-[#181925]">The Opening Inscription & Focal Portrait</h4>
                <p className="text-xs sm:text-sm text-[#666] leading-relaxed mt-1 max-w-2xl">
                  A high-resolution photograph where they look like themselves, their life dates, and a gentle one-sentence distillation of who they were. This grounds the visitor in warmth rather than grief.
                </p>
              </div>
            </div>
            <span className="font-mono text-xs text-primary font-medium shrink-0 bg-primary/10 px-2.5 py-1 rounded-full">
              Tone Setter
            </span>
          </div>

          {/* Pillar 2 */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-black/[0.06] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <span className="size-10 rounded-xl bg-neutral-100 flex items-center justify-center text-[#181925] font-mono text-sm font-semibold shrink-0">
                02
              </span>
              <div>
                <h4 className="text-base font-medium text-[#181925]">The Unhurried Life Narrative</h4>
                <p className="text-xs sm:text-sm text-[#666] leading-relaxed mt-1 max-w-2xl">
                  Not a dry career résumé or a formal obituary, but an intimate story: what made them laugh, their favorite rituals, their quirks, and the quiet ways they showed love to family and neighbors.
                </p>
              </div>
            </div>
            <span className="font-mono text-xs text-emerald-700 font-medium shrink-0 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60">
              The Heart
            </span>
          </div>

          {/* Pillar 3 */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-black/[0.06] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <span className="size-10 rounded-xl bg-neutral-100 flex items-center justify-center text-[#181925] font-mono text-sm font-semibold shrink-0">
                03
              </span>
              <div>
                <h4 className="text-base font-medium text-[#181925]">Milestone Photographs Across Every Era</h4>
                <p className="text-xs sm:text-sm text-[#666] leading-relaxed mt-1 max-w-2xl">
                  Preserving photographs in chronological sequence: childhood, early romances, family holidays, career milestones, and peaceful later years—captioned so grandchildren understand the context.
                </p>
              </div>
            </div>
            <span className="font-mono text-xs text-[#181925] font-medium shrink-0 bg-neutral-100 px-2.5 py-1 rounded-full">
              Visual Archive
            </span>
          </div>

          {/* Pillar 4 */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-black/[0.06] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <span className="size-10 rounded-xl bg-neutral-100 flex items-center justify-center text-[#181925] font-mono text-sm font-semibold shrink-0">
                04
              </span>
              <div>
                <h4 className="text-base font-medium text-[#181925]">Chronological Chapter Timeline</h4>
                <p className="text-xs sm:text-sm text-[#666] leading-relaxed mt-1 max-w-2xl">
                  An interactive timeline highlighting the years that shaped their journey: birth, education, marriages, big relocations, retirement, and the arrival of children and grandchildren.
                </p>
              </div>
            </div>
            <span className="font-mono text-xs text-primary font-medium shrink-0 bg-primary/10 px-2.5 py-1 rounded-full">
              Decade Milestones
            </span>
          </div>

          {/* Pillar 5 */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-black/[0.06] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <span className="size-10 rounded-xl bg-neutral-100 flex items-center justify-center text-[#181925] font-mono text-sm font-semibold shrink-0">
                05
              </span>
              <div>
                <h4 className="text-base font-medium text-[#181925]">Collaborative Memories & Spoken Audio</h4>
                <p className="text-xs sm:text-sm text-[#666] leading-relaxed mt-1 max-w-2xl">
                  A place where friends, cousins, and coworkers contribute the stories only they remember, complete with private caretaker moderation to protect family peace of mind.
                </p>
              </div>
            </div>
            <span className="font-mono text-xs text-emerald-700 font-medium shrink-0 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60">
              Community Voice
            </span>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 5. OPENING LINES INSPIRATION (HOW TO BEGIN THEIR STORY)               */}
      {/* ===================================================================== */}
      <section className="w-full max-w-5xl px-4 sm:px-6 mx-auto py-16 sm:py-24 border-t border-black/[0.06] flex flex-col gap-12 sm:gap-14">
        <SectionHeader
          badge="Writing Inspiration"
          title="Stuck on the first sentence? Three ways to begin."
          description="Starting to write about someone you love can feel paralyzing. Here are three authentic opening approaches borrowed from real memorials."
          className="max-w-3xl mx-auto"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Approach 1 */}
          <div className="flex flex-col justify-between bg-white rounded-2xl p-6 sm:p-7 border border-black/[0.06] shadow-2xs">
            <div className="flex flex-col gap-3">
              <div className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <Quote className="size-4" />
              </div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-primary font-semibold">
                Approach 01 · The Anecdotal Opening
              </span>
              <h3 className="text-base font-medium text-[#181925]">
                Start with a defining habit or quirky kindness.
              </h3>
              <div className="p-4 rounded-xl bg-[#fafafa] border border-black/[0.04] text-xs text-[#555] font-serif italic leading-relaxed">
                “If you arrived at Dad’s house between two and four on a Tuesday, you were guaranteed a cup of lukewarm Earl Grey and a story about an engine he rebuilt in 1978.”
              </div>
              <p className="text-xs text-[#666] leading-relaxed">
                <strong>Why it works:</strong> It avoids formal clichés and immediately puts a smile on the reader&apos;s face by evoking a real memory.
              </p>
            </div>
          </div>

          {/* Approach 2 */}
          <div className="flex flex-col justify-between bg-white rounded-2xl p-6 sm:p-7 border border-black/[0.06] shadow-2xs">
            <div className="flex flex-col gap-3">
              <div className="size-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Quote className="size-4" />
              </div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-emerald-600 font-semibold">
                Approach 02 · The Reflective Essence
              </span>
              <h3 className="text-base font-medium text-[#181925]">
                Capture their quiet presence and worldview.
              </h3>
              <div className="p-4 rounded-xl bg-[#fafafa] border border-black/[0.04] text-xs text-[#555] font-serif italic leading-relaxed">
                “Mum never needed to raise her voice to command a room. She lived with quiet, immovable conviction and believed every problem could be solved by walking outside.”
              </div>
              <p className="text-xs text-[#666] leading-relaxed">
                <strong>Why it works:</strong> It honors their emotional dignity and reminds visitors of the calm strength they provided to the family.
              </p>
            </div>
          </div>

          {/* Approach 3 */}
          <div className="flex flex-col justify-between bg-white rounded-2xl p-6 sm:p-7 border border-black/[0.06] shadow-2xs">
            <div className="flex flex-col gap-3">
              <div className="size-8 rounded-full bg-neutral-100 text-[#181925] flex items-center justify-center">
                <Quote className="size-4" />
              </div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#888] font-semibold">
                Approach 03 · The Joyful Celebration
              </span>
              <h3 className="text-base font-medium text-[#181925]">
                Lead with their boundless energy and humor.
              </h3>
              <div className="p-4 rounded-xl bg-[#fafafa] border border-black/[0.04] text-xs text-[#555] font-serif italic leading-relaxed">
                “Maya refused to do anything quietly. She traveled light, loved loud music, collected stray animals, and made friends in every grocery line she ever stood in.”
              </div>
              <p className="text-xs text-[#666] leading-relaxed">
                <strong>Why it works:</strong> It gives visitors permission to celebrate, laugh, and remember the electricity they brought into the room.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 6. MEMORIAL WEBSITE VS. OBITUARY (COMPARISON MATRIX)                  */}
      {/* ===================================================================== */}
      <section className="w-full max-w-5xl px-4 sm:px-6 mx-auto py-16 sm:py-24 border-t border-black/[0.06] flex flex-col gap-12 sm:gap-14">
        <SectionHeader
          badge="Format Comparison"
          title="How an online memorial differs from an obituary."
          description="An obituary announces a death. A memorial website celebrates a lifetime."
          className="max-w-3xl mx-auto"
        />

        <div className="bg-white rounded-2xl sm:rounded-3xl border border-black/[0.06] overflow-hidden p-6 sm:p-8 shadow-xs flex flex-col gap-6">
          <div className="overflow-x-auto">
            <p className="sm:hidden text-[11px] font-mono text-[#888] mb-2.5 text-right">
              Swipe horizontally to compare →
            </p>
            <table className="w-full text-left border-collapse text-xs sm:text-sm min-w-[580px]">
              <thead>
                <tr className="border-b border-black/[0.08]">
                  <th className="py-3 pr-4 font-mono uppercase tracking-wider text-[11px] text-[#888] font-medium">
                    Dimension
                  </th>
                  <th className="py-3 px-4 font-mono uppercase tracking-wider text-[11px] text-[#888] font-medium">
                    Traditional Online Obituary
                  </th>
                  <th className="py-3 pl-4 font-mono uppercase tracking-wider text-[11px] text-primary font-semibold">
                    Theirs Online Memorial
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.04] text-[#444]">
                <tr>
                  <td className="py-3.5 pr-4 font-medium text-[#181925]">Core Purpose</td>
                  <td className="py-3.5 px-4 text-[#777]">Logistical notice of death & service dates</td>
                  <td className="py-3.5 pl-4 text-[#181925] font-medium text-emerald-700">
                    A lasting, collaborative celebration of a person’s life
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 pr-4 font-medium text-[#181925]">Media Capacity</td>
                  <td className="py-3.5 px-4 text-[#777]">Single low-res newspaper thumbnail</td>
                  <td className="py-3.5 pl-4 text-[#181925] font-medium text-emerald-700">
                    High-resolution photos, voicemails, audio & video
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 pr-4 font-medium text-[#181925]">Authorship</td>
                  <td className="py-3.5 px-4 text-[#777]">Written by one exhausted family member</td>
                  <td className="py-3.5 pl-4 text-[#181925] font-medium text-emerald-700">
                    Collaborative: family and friends contribute their own memories
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 pr-4 font-medium text-[#181925]">Advertising Environment</td>
                  <td className="py-3.5 px-4 text-[#777]">Often crowded with third-party ads & affiliate links</td>
                  <td className="py-3.5 pl-4 text-[#181925] font-medium text-emerald-700">
                    100% ad-free, quiet, editorial aesthetic
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 pr-4 font-medium text-[#181925]">Timeline & Longevity</td>
                  <td className="py-3.5 px-4 text-[#777]">Often archived or locked behind paywalls after 30 days</td>
                  <td className="py-3.5 pl-4 text-[#181925] font-medium text-emerald-700">
                    Permanent web address with zero recurring renewal fees
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="pt-4 border-t border-black/[0.06] text-xs sm:text-sm text-[#666] leading-relaxed">
            <p>
              <strong className="text-[#181925] font-medium">How families use them together:</strong> Many families publish a brief traditional obituary in their local paper containing service times and a clean link to their Theirs memorial (<code className="font-mono text-xs bg-black/[0.04] px-1 py-0.5 rounded">theirs.page/their-name</code>), giving attendees a beautiful place to read the full life story and add their own memories.
            </p>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 7. HOW TO START IN 3 SIMPLE STEPS                                     */}
      {/* ===================================================================== */}
      <section className="w-full max-w-5xl px-4 sm:px-6 mx-auto py-16 sm:py-24 border-t border-black/[0.06] flex flex-col gap-12 sm:gap-14">
        <SectionHeader
          badge="Simple Setup"
          title="Create a memorial like these in minutes."
          description="You do not need to assemble decades of memories alone. Start simple and let the memorial grow."
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
                Add 3 to 5 photographs and the beginning of their story. You don&apos;t have to finish everything right now — you can return anytime.
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
                Share one link so people who loved them can add their own stories and photos. You review and approve every submission privately.
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
          title="Common questions about memorial website examples."
          description="Everything you need to know about designing and publishing a memorial for someone you love."
          className="max-w-3xl mx-auto"
        />

        <div className="w-full max-w-3xl mx-auto">
          <SeoFaqAccordion items={MEMORIAL_EXAMPLES_FAQS} />
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 10. RELEVANT GUIDES (CONTEXTUAL INTERNAL MESH)                        */}
      {/* ===================================================================== */}
      <SeoResourcesMesh
        currentPath="/memorial-website-examples"
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
