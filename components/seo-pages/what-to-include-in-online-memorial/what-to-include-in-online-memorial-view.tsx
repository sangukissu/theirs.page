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
  Camera,
  Volume2,
  BookOpen,
  Calendar,
  Heart,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Users,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  Clock,
  FileText,
  Lock,
} from "lucide-react"

export const WHAT_TO_INCLUDE_FAQS: SeoFaqItem[] = [
  {
    id: "need-everything-ready",
    question: "Do I need to have all photos and dates ready before starting?",
    answer:
      "Not at all. The most stressful mistake is waiting until you have gathered every photograph and life milestone before creating a page. On Theirs, you can start with just a name and a single portrait in two minutes. You can invite family and friends right away, and everyone can gradually add photos, voice notes, and memories over the coming weeks and months.",
  },
  {
    id: "who-writes-story",
    question: "Who writes the life story on a memorial website?",
    answer:
      "Typically the primary creator (a partner, child, sibling, or close friend) writes an opening 2–3 paragraph biographical summary. However, on Theirs, you don't have to write their whole biography alone. You can invite other family members as caretakers to edit together, and extended friends can contribute their own stories directly to the tribute feed.",
  },
  {
    id: "contributor-uploads",
    question: "Can friends and family upload their own photos without creating an account?",
    answer:
      "Yes. A core principle of Theirs is collaborative ease. Friends and relatives can submit photos, written stories, and tributes from their phone or computer without being forced to create an account or password. As the creator, you retain full moderation control to approve all contributions before they appear.",
  },
  {
    id: "how-many-photos",
    question: "How many photos should a memorial website include?",
    answer:
      "A free memorial on Theirs supports up to 5 essential photos, which is ideal for an immediate, dignified announcement. For a Complete family archive ($179 one-time), there are zero photo limits. Most families gather between 30 and 150 photos spanning childhood, youth, career, travels, weddings, and quiet moments with grandchildren.",
  },
  {
    id: "voicemails-and-audio",
    question: "Can I include audio recordings and phone voicemails?",
    answer:
      "Yes. Preserving someone's voice is one of the most powerful and comforting elements of a digital memorial. With Theirs Complete, you can upload saved iPhone or Android voice memos, voicemail audio files, and video clips so visitors can hear their laugh, their storytelling, and their distinctive tone forever.",
  },
  {
    id: "prompting-stories",
    question: "How do I ask distant friends and colleagues to contribute meaningful memories?",
    answer:
      "Share the direct link to the memorial via text, email, or social messaging, along with a gentle prompt. Instead of asking vaguely for 'any memories,' ask a specific question: 'If you have a favorite photo of Dad from his camping trips or a funny memory from his workshop days, please add it to his memorial page.' Specific prompts give people permission to share everyday, humorous, and heartfelt stories.",
  },
  {
    id: "privacy-controls",
    question: "How do I keep personal family photos and childhood stories private?",
    answer:
      "Theirs offers three privacy tiers. You can make the memorial Public (searchable), Link-only (unlisted from Google, accessible only to people you send the link to), or PIN-protected (requires a 4-digit passcode chosen by you). This guarantees that sensitive family heirlooms remain strictly within your circle.",
  },
  {
    id: "lifespan-of-page",
    question: "How long does the memorial stay online once published?",
    answer:
      "A Theirs memorial is built to last permanently. With our Complete tier, you pay a single one-time payment of $179 with zero monthly or annual renewal fees. Your family will never receive an automated email threatening to delete or lock your memories because a subscription lapsed.",
  },
]

export function WhatToIncludeInOnlineMemorialView() {
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
              Memorial Content & Checklist Guide
            </span>
          </div>

          {/* H1 Heading */}
          <h1 className="text-balance text-4xl sm:text-6xl font-medium tracking-tight text-[#181925] leading-tight mb-4">
            What to include in an online memorial:
            <br />
            <span className="text-primary">a gentle, complete guide.</span>
          </h1>

          {/* Subheading */}
          <p className="mx-auto max-w-[680px] text-pretty text-base sm:text-lg leading-relaxed text-[#666] mb-8">
            You do not have to assemble an entire human life alone. Here is a practical checklist of the{" "}
            <span className="rounded-md bg-primary/10 box-decoration-clone px-1 py-0.5 text-primary font-medium">
              photos, stories, voicemails, and milestones
            </span>{" "}
            that bring their genuine character to life — and how to gather them gently over time.
          </p>

          {/* Hero Input Pill */}
          <div className="w-full max-w-lg flex flex-col items-center gap-2 mb-4 sm:mb-5">
            <SeoHeroInput
              buttonLabel="Create an online memorial"
              placeholder="Robert Carter"
            />
          </div>

          {/* Compact Trust Line */}
          <p className="text-center text-xs font-mono text-[#888] mb-8 sm:mb-12">
            Start with what you have today · Invite family anytime · $0 to start
          </p>

          {/* Authentic Curved LifePanorama Ribbon */}
          <div className="w-full relative">
            <LifePanorama />
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 2. THE 5 CORE ANCHORS (EDITORIAL BENTO SPEC CANVAS)                  */}
      {/* ===================================================================== */}
      <section className="w-full max-w-5xl px-4 sm:px-6 mx-auto py-16 sm:py-24 border-t border-black/[0.06] flex flex-col gap-12 sm:gap-14">
        <SectionHeader
          badge="Essential Elements"
          title="The five pillars of a living memorial."
          description={
            <>
              It should feel like visiting someone’s life, not visiting a government registry. Focus on these{" "}
              <span className="rounded-md bg-primary/10 box-decoration-clone px-1 py-0.5 text-primary">
                five meaningful cornerstones
              </span>
              .
            </>
          }
          className="max-w-3xl mx-auto"
        />

        {/* 5-Item Bento Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pillar 1: Welcoming Portrait & Life Summary (Spans 2 cols) */}
          <div className="md:col-span-2 rounded-2xl bg-[#fbfbfa] p-6 sm:p-8 border border-black/[0.06] flex flex-col justify-between">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-white border border-black/[0.08] flex items-center justify-center text-primary shadow-xs">
                  <Camera className="size-5" />
                </div>
                <div>
                  <span className="font-mono text-xs text-[#888] uppercase tracking-wider font-medium">Pillar 01</span>
                  <h3 className="text-xl font-medium text-[#181925] tracking-tight">The Welcoming Portrait & Life Story</h3>
                </div>
              </div>

              <p className="text-sm sm:text-base leading-relaxed text-[#666]">
                Choose a portrait where their personality shines — smiling, caught mid-laughter, or engaged in something they loved, rather than a stiff passport photo. Accompany it with a 2 to 4 paragraph life story that emphasizes their humor, virtues, kindness, and quirks, rather than reading like an employment resume.
              </p>

              {/* Sample Quote Box */}
              <div className="rounded-xl bg-white p-4 border border-black/[0.06] text-xs sm:text-sm text-[#454545] italic font-serif leading-relaxed">
                &ldquo;He lived with gentle kindness and quiet courage. Dad spent his life fixing clocks, wandering the Devon hills, and telling stories that took an hour to reach the punchline.&rdquo;
              </div>
            </div>

            <div className="flex items-center gap-2 pt-5 border-t border-black/[0.06] text-xs text-[#888] font-mono mt-6">
              <Check className="size-4 text-emerald-500 shrink-0" />
              <span>Captures their spirit in the first 10 seconds of visiting</span>
            </div>
          </div>

          {/* Pillar 2: Voice & Spoken Memories (1 col) */}
          <div className="rounded-2xl bg-[#fbfbfa] p-6 sm:p-8 border border-black/[0.06] flex flex-col justify-between">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-white border border-black/[0.08] flex items-center justify-center text-primary shadow-xs">
                  <Volume2 className="size-5" />
                </div>
                <div>
                  <span className="font-mono text-xs text-[#888] uppercase tracking-wider font-medium">Pillar 02</span>
                  <h3 className="text-xl font-medium text-[#181925] tracking-tight">Voice & Audio Notes</h3>
                </div>
              </div>

              <p className="text-sm leading-relaxed text-[#666]">
                Photographs show how someone looked; voice preserves who they sounded like. Upload saved phone voicemails, voice memos, and short video clips of their laughter.
              </p>

              <div className="rounded-xl bg-white p-3.5 border border-black/[0.06] flex items-center gap-3 text-xs text-[#454545]">
                <div className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Volume2 className="size-4" />
                </div>
                <div>
                  <p className="font-medium text-[#181925]">Voicemail from Dad (2021)</p>
                  <p className="text-[11px] text-[#888] font-mono">0:24 · &quot;Just calling to see how the garden is...&quot;</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-5 border-t border-black/[0.06] text-xs text-[#888] font-mono mt-6">
              <Check className="size-4 text-emerald-500 shrink-0" />
              <span>The most powerful sensory connection</span>
            </div>
          </div>

          {/* Pillar 3: Decade-Spanning Photo Gallery (1 col) */}
          <div className="rounded-2xl bg-[#fbfbfa] p-6 sm:p-8 border border-black/[0.06] flex flex-col justify-between">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-white border border-black/[0.08] flex items-center justify-center text-primary shadow-xs">
                  <Sparkles className="size-5" />
                </div>
                <div>
                  <span className="font-mono text-xs text-[#888] uppercase tracking-wider font-medium">Pillar 03</span>
                  <h3 className="text-xl font-medium text-[#181925] tracking-tight">Photos Across Decades</h3>
                </div>
              </div>

              <p className="text-sm leading-relaxed text-[#666]">
                Do not just upload recent pictures. Bring together black-and-white childhood prints, teenage adventures, twenties travels, wedding days, and candid family kitchen scenes.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-5 border-t border-black/[0.06] text-xs text-[#888] font-mono mt-6">
              <Check className="size-4 text-emerald-500 shrink-0" />
              <span>Shows a complete, multifaceted life arc</span>
            </div>
          </div>

          {/* Pillar 4: Chronological Life Timeline (1 col) */}
          <div className="rounded-2xl bg-[#fbfbfa] p-6 sm:p-8 border border-black/[0.06] flex flex-col justify-between">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-white border border-black/[0.08] flex items-center justify-center text-primary shadow-xs">
                  <Calendar className="size-5" />
                </div>
                <div>
                  <span className="font-mono text-xs text-[#888] uppercase tracking-wider font-medium">Pillar 04</span>
                  <h3 className="text-xl font-medium text-[#181925] tracking-tight">Interactive Timeline</h3>
                </div>
              </div>

              <p className="text-sm leading-relaxed text-[#666]">
                Anchor their journey with 5 to 12 milestone events: where they grew up, degrees earned, businesses founded, countries visited, children born, and proud community achievements.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-5 border-t border-black/[0.06] text-xs text-[#888] font-mono mt-6">
              <Check className="size-4 text-emerald-500 shrink-0" />
              <span>Provides historical context for future generations</span>
            </div>
          </div>

          {/* Pillar 5: Collaborative Community Tributes (1 col) */}
          <div className="rounded-2xl bg-[#fbfbfa] p-6 sm:p-8 border border-black/[0.06] flex flex-col justify-between">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-white border border-black/[0.08] flex items-center justify-center text-primary shadow-xs">
                  <Users className="size-5" />
                </div>
                <div>
                  <span className="font-mono text-xs text-[#888] uppercase tracking-wider font-medium">Pillar 05</span>
                  <h3 className="text-xl font-medium text-[#181925] tracking-tight">Community Stories</h3>
                </div>
              </div>

              <p className="text-sm leading-relaxed text-[#666]">
                The stories you do not know. Friends, cousins, schoolmates, and colleagues contribute the memories that only they possess — revealing sides of your loved one you never saw.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-5 border-t border-black/[0.06] text-xs text-[#888] font-mono mt-6">
              <Check className="size-4 text-emerald-500 shrink-0" />
              <span>No account required for friends to post</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 3. STEP-BY-STEP CHECKLIST: GATHERING BY STAGES                         */}
      {/* ===================================================================== */}
      <section className="w-full max-w-5xl px-4 sm:px-6 mx-auto py-16 sm:py-24 border-t border-black/[0.06] flex flex-col gap-12 sm:gap-14">
        <SectionHeader
          badge="Practical Checklist"
          title="What to gather, stage by stage."
          description={
            <>
              You do not need to do everything at once. Divide your memorial into three gentle stages to{" "}
              <span className="rounded-md bg-primary/10 box-decoration-clone px-1 py-0.5 text-primary">
                eliminate grief fatigue
              </span>
              .
            </>
          }
          className="max-w-3xl mx-auto"
        />

        <div className="flex flex-col gap-6">
          {/* Stage 1: Day One */}
          <div className="rounded-2xl bg-[#fbfbfa] p-6 sm:p-8 border border-black/[0.06] flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-black/[0.06] pb-4">
              <div className="flex items-center gap-3">
                <span className="size-8 rounded-full bg-primary/10 text-primary font-mono text-xs font-semibold flex items-center justify-center">
                  01
                </span>
                <h3 className="text-lg sm:text-xl font-medium text-[#181925] tracking-tight">
                  Stage 1: Day One — The Quick Foundation (Under 5 Minutes)
                </h3>
              </div>
              <span className="text-xs font-mono text-[#888] bg-white px-2.5 py-1 rounded-md border border-black/[0.06] w-fit">
                Immediate · $0 Free Tier
              </span>
            </div>

            <p className="text-sm text-[#666] leading-relaxed">
              When a loss is fresh, your energy is limited. Claim their clean web address and establish the basic resting place for condolences:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {[
                { label: "Full legal name and familiar nickname", detail: "e.g., Robert 'Bob' Carter" },
                { label: "Birth and passing years or dates", detail: "e.g., 1948 – 2024" },
                { label: "One clear portrait photo", detail: "Looking warm, smiling, or doing what they loved" },
                { label: "A brief 2-sentence opening message", detail: "Welcoming visitors and inviting tributes" },
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 bg-white p-3.5 rounded-xl border border-black/[0.05]">
                  <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-[#181925]">{item.label}</span>
                    <span className="text-xs text-[#888] mt-0.5">{item.detail}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stage 2: Funeral Week */}
          <div className="rounded-2xl bg-[#fbfbfa] p-6 sm:p-8 border border-black/[0.06] flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-black/[0.06] pb-4">
              <div className="flex items-center gap-3">
                <span className="size-8 rounded-full bg-primary/10 text-primary font-mono text-xs font-semibold flex items-center justify-center">
                  02
                </span>
                <h3 className="text-lg sm:text-xl font-medium text-[#181925] tracking-tight">
                  Stage 2: Service Week — The Gathering Phase
                </h3>
              </div>
              <span className="text-xs font-mono text-[#888] bg-white px-2.5 py-1 rounded-md border border-black/[0.06] w-fit">
                Collaborative · Share With Family
              </span>
            </div>

            <p className="text-sm text-[#666] leading-relaxed">
              During the days surrounding the funeral or celebration of life, family and friends are actively searching for ways to participate:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {[
                { label: "10 to 25 essential candid photographs", detail: "From photo albums, shoeboxes, and phone cameras" },
                { label: "Service times or celebration of life details", detail: "Date, location, and livestream link if applicable" },
                { label: "Charity or memorial fund designation", detail: "In lieu of flowers donation links" },
                { label: "Printed link on the funeral service card", detail: "So guests can upload their own memories afterwards" },
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 bg-white p-3.5 rounded-xl border border-black/[0.05]">
                  <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-[#181925]">{item.label}</span>
                    <span className="text-xs text-[#888] mt-0.5">{item.detail}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stage 3: Months & Years */}
          <div className="rounded-2xl bg-[#fbfbfa] p-6 sm:p-8 border border-black/[0.06] flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-black/[0.06] pb-4">
              <div className="flex items-center gap-3">
                <span className="size-8 rounded-full bg-primary/10 text-primary font-mono text-xs font-semibold flex items-center justify-center">
                  03
                </span>
                <h3 className="text-lg sm:text-xl font-medium text-[#181925] tracking-tight">
                  Stage 3: Over Time — The Complete Living Family Archive
                </h3>
              </div>
              <span className="text-xs font-mono text-[#888] bg-white px-2.5 py-1 rounded-md border border-black/[0.06] w-fit">
                Long-Term · Complete Tier
              </span>
            </div>

            <p className="text-sm text-[#666] leading-relaxed">
              As months pass and grief softens into reflective remembrance, add depth to their permanent family archive:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {[
                { label: "Phone voicemails & audio voice memos", detail: "Preserving their actual voice and laughter forever" },
                { label: "Detailed life story narrative", detail: "Their youth, career, life philosophy, and funny habits" },
                { label: "Chronological life story timeline events", detail: "Mapping births, graduations, travels, and homes" },
                { label: "Restored historic photographs", detail: "Clean, enhanced digital versions of vintage family prints" },
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 bg-white p-3.5 rounded-xl border border-black/[0.05]">
                  <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-[#181925]">{item.label}</span>
                    <span className="text-xs text-[#888] mt-0.5">{item.detail}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 4. STORYTELLING PROMPTS: UNLOCKING CONTRIBUTIONS                      */}
      {/* ===================================================================== */}
      <section className="w-full max-w-5xl px-4 sm:px-6 mx-auto py-16 sm:py-24 border-t border-black/[0.06] flex flex-col gap-12 sm:gap-14">
        <SectionHeader
          badge="Story Prompts"
          title="Questions that unlock heartfelt memories."
          description={
            <>
              Blank text boxes intimidate contributors. When inviting friends and family to share, offer these{" "}
              <span className="rounded-md bg-primary/10 box-decoration-clone px-1 py-0.5 text-primary">
                thoughtful writing prompts
              </span>{" "}
              to bring out vivid, real memories.
            </>
          }
          className="max-w-3xl mx-auto"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              category: "Personality & Humor",
              prompt: "What is a phrase, piece of advice, or greeting they always repeated?",
            },
            {
              category: "Quiet Moments",
              prompt: "What did they love doing on a peaceful Saturday morning or rainy afternoon?",
            },
            {
              category: "Mischief & Laughter",
              prompt: "What is a funny mishap or road trip disaster that made everyone laugh?",
            },
            {
              category: "Signature Quirks",
              prompt: "What was their secret recipe, signature dish, or peculiar daily routine?",
            },
            {
              category: "Work & Craft",
              prompt: "What was their attitude toward their work, garden, tools, or hobbies?",
            },
            {
              category: "Enduring Lessons",
              prompt: "What is something they taught you that you still find yourself doing today?",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="rounded-2xl bg-[#fbfbfa] p-5 sm:p-6 border border-black/[0.06] flex flex-col justify-between gap-4"
            >
              <div className="flex flex-col gap-2">
                <span className="font-mono text-xs text-primary font-medium">{item.category}</span>
                <p className="text-sm sm:text-base font-serif italic text-[#181925] leading-snug">
                  &ldquo;{item.prompt}&rdquo;
                </p>
              </div>
              <div className="pt-3 border-t border-black/[0.05] text-[11px] font-mono text-[#888]">
                Prompt {idx + 1} of 6
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 5. WHAT TO AVOID (DIGNITY & SECURITY RULES)                            */}
      {/* ===================================================================== */}
      <section className="w-full max-w-5xl px-4 sm:px-6 mx-auto py-16 sm:py-24 border-t border-black/[0.06] flex flex-col gap-12 sm:gap-14">
        <SectionHeader
          badge="Dignity & Privacy"
          title="What to leave out of an online memorial."
          description={
            <>
              Protecting your family’s privacy and maintaining a solemn, peaceful atmosphere is just as important as what you include.
            </>
          }
          className="max-w-3xl mx-auto"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="rounded-2xl bg-[#fbfbfa] p-6 border border-black/[0.06] flex flex-col gap-3">
            <div className="flex items-center gap-2 text-red-500">
              <X className="size-5 shrink-0" />
              <h3 className="text-base font-medium text-[#181925]">Sensitive Identity & Financial Data</h3>
            </div>
            <p className="text-sm text-[#666] leading-relaxed">
              Never post social security numbers, mother&apos;s maiden names used for banking security questions, or exact home addresses of surviving family members.
            </p>
          </div>

          <div className="rounded-2xl bg-[#fbfbfa] p-6 border border-black/[0.06] flex flex-col gap-3">
            <div className="flex items-center gap-2 text-red-500">
              <X className="size-5 shrink-0" />
              <h3 className="text-base font-medium text-[#181925]">Funeral Clichés & Fake AI Chatbots</h3>
            </div>
            <p className="text-sm text-[#666] leading-relaxed">
              Avoid gloomy clip art, animated candles, or automated AI chat bots pretending to speak for your loved one. Authenticity is sacred; preserve their real words and voice instead.
            </p>
          </div>

          <div className="rounded-2xl bg-[#fbfbfa] p-6 border border-black/[0.06] flex flex-col gap-3">
            <div className="flex items-center gap-2 text-red-500">
              <X className="size-5 shrink-0" />
              <h3 className="text-base font-medium text-[#181925]">Unmoderated Public Comment Spams</h3>
            </div>
            <p className="text-sm text-[#666] leading-relaxed">
              Never leave your tribute section completely open to anonymous internet strangers. Theirs includes caretaker moderation so every tribute is approved before publishing.
            </p>
          </div>

          <div className="rounded-2xl bg-[#fbfbfa] p-6 border border-black/[0.06] flex flex-col gap-3">
            <div className="flex items-center gap-2 text-red-500">
              <X className="size-5 shrink-0" />
              <h3 className="text-base font-medium text-[#181925]">Low-Resolution Compressed Screenshots</h3>
            </div>
            <p className="text-sm text-[#666] leading-relaxed">
              Avoid uploading blurry phone screenshots of social media feeds. Upload the original high-resolution camera files or flatbed photo scans to preserve their heirloom quality.
            </p>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 6. ORIGINAL PRICING COMPONENT                                         */}
      {/* ===================================================================== */}
      <TheirsPricing />

      {/* ===================================================================== */}
      {/* 7. FAQ ACCORDION SECTION                                              */}
      {/* ===================================================================== */}
      <section className="w-full max-w-5xl px-4 sm:px-6 mx-auto py-16 sm:py-24 border-t border-black/[0.06] flex flex-col gap-10">
        <SectionHeader
          badge="FAQs"
          title="Common questions about memorial content."
          description="Clear guidance on gathering photos, writing stories, and preserving family memories."
          className="max-w-3xl mx-auto"
        />

        <SeoFaqAccordion items={WHAT_TO_INCLUDE_FAQS} />
      </section>

      {/* ===================================================================== */}
      {/* 8. INTERLINKED RESOURCES MESH                                         */}
      {/* ===================================================================== */}
      <SeoResourcesMesh currentPath="/what-to-include-in-online-memorial" />

      {/* ===================================================================== */}
      {/* 9. BOTTOM CTA BANNER                                                  */}
      {/* ===================================================================== */}
      <CtaBanner />

      {/* Site-Wide Footer */}
      <TheirsFooter />
    </div>
  )
}
