import { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { TheirsFooter } from "@/components/theirs/footer"
import { GiftPurchaseForm } from "@/components/gift/gift-purchase-form"
import { Heart, ShieldCheck, Clock, Users, BookOpen, Sparkles, CheckCircle2 } from "lucide-react"

export const metadata: Metadata = {
  title: "Gift an Online Memorial for Someone You Love | Theirs",
  description:
    "Gift a Complete online memorial to a grieving family member or friend. Prepaid in full, private, and ready whenever they feel able to celebrate their loved one.",
  openGraph: {
    title: "Gift an Online Memorial for Someone You Love | Theirs",
    description:
      "Gift a Complete online memorial to a grieving family member or friend. Prepaid in full, private, and ready whenever they are.",
    url: "https://theirs.page/gift",
  },
}

export default function GiftMemorialPage() {
  return (
    <div className="min-h-screen bg-[#fafaf9] text-[#181925] flex flex-col selection:bg-primary/20 selection:text-primary">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-black/[0.06] bg-white/90 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center group">
            <Image src="/theirs-logo.svg" alt="Theirs" width={20} height={20} />
            <span className="font-semibold tracking-tight text-[#181925] text-lg ml-2">
              Theirs<span className="text-primary">.</span>
            </span>
          </Link>

          <div className="flex items-center gap-4 text-xs sm:text-sm">
            <Link
              href="/"
              className="text-[#666] hover:text-[#181925] transition-colors"
            >
              Back to home
            </Link>
            <Link
              href="/robert-carter"
              className="text-[#666] hover:text-[#181925] transition-colors hidden sm:inline-block"
            >
              View example memorial
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="pt-12 sm:pt-16 pb-12 px-4 sm:px-6 max-w-4xl mx-auto text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-black/[0.08] bg-white text-[11px] font-mono uppercase tracking-wider text-primary font-medium mb-6">
            <Sparkles className="size-3" />
            <span>Memorial Gift Entitlement</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#181925] tracking-tight leading-[1.18] max-w-2xl font-normal">
            Give a lasting place to remember someone they love.
          </h1>

          <p className="mt-5 text-base sm:text-lg text-[#555] max-w-2xl leading-relaxed">
            When someone you care about experiences a loss, practical support can mean everything. Gifting a Complete memorial gives them a private, prepaid family archive — ready whenever they feel able to gather stories, photos, and tributes.
          </p>

          {/* Stationery Preview Card - STRICT ZERO SHADOWS */}
          <div className="mt-10 w-full max-w-xl rounded-2xl border border-black/[0.1] bg-white p-6 sm:p-8 text-left flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-black/[0.06]">
              <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#777]">
                Official Memorial Gift
              </span>
              <span className="font-mono text-xs font-semibold text-primary">
                Complete Tier · $179 Value
              </span>
            </div>

            <div className="py-2">
              <p className="font-serif text-lg sm:text-xl text-[#181925] leading-snug">
                “A quiet, enduring space dedicated to their life, memories, and stories.”
              </p>
              <p className="mt-3 text-xs sm:text-sm text-[#666] leading-relaxed">
                Includes unlimited high-resolution photos, audio recordings, interactive life timeline, and limitless family contributions — with zero subscriptions forever.
              </p>
            </div>

            <div className="pt-3 border-t border-dashed border-black/[0.08] flex items-center justify-between text-[11px] text-[#777]">
              <span>Private ownership upon claim</span>
              <span>Never expires</span>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-12 bg-white border-y border-black/[0.06] px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center max-w-md mx-auto mb-10">
              <p className="font-mono text-[11px] uppercase tracking-wider text-primary font-medium">
                How It Works
              </p>
              <h2 className="font-serif text-2xl sm:text-3xl text-[#181925] mt-1 font-normal">
                Thoughtful, simple, and pressure-free.
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Step 1 */}
              <div className="rounded-xl border border-black/[0.08] bg-[#fafafb] p-5 flex flex-col gap-3">
                <div className="size-8 rounded-lg bg-primary/10 text-primary font-mono text-xs font-semibold flex items-center justify-center">
                  01
                </div>
                <h3 className="font-semibold text-sm text-[#181925]">
                  You purchase the gift
                </h3>
                <p className="text-xs text-[#666] leading-relaxed">
                  Enter your details and the recipient's email. You do not need to know dates, obituary text, or biographical details right now.
                </p>
              </div>

              {/* Step 2 */}
              <div className="rounded-xl border border-black/[0.08] bg-[#fafafb] p-5 flex flex-col gap-3">
                <div className="size-8 rounded-lg bg-primary/10 text-primary font-mono text-xs font-semibold flex items-center justify-center">
                  02
                </div>
                <h3 className="font-semibold text-sm text-[#181925]">
                  Recipient receives invitation
                </h3>
                <p className="text-xs text-[#666] leading-relaxed">
                  They receive a warm, dignified email containing your personal note and their private claim link. You also get a receipt and backup link.
                </p>
              </div>

              {/* Step 3 */}
              <div className="rounded-xl border border-black/[0.08] bg-[#fafafb] p-5 flex flex-col gap-3">
                <div className="size-8 rounded-lg bg-primary/10 text-primary font-mono text-xs font-semibold flex items-center justify-center">
                  03
                </div>
                <h3 className="font-semibold text-sm text-[#181925]">
                  They create when ready
                </h3>
                <p className="text-xs text-[#666] leading-relaxed">
                  They sign in and activate their Complete memorial — either starting fresh or applying it to an existing draft. The memorial belongs 100% to them.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Purchase Form Section */}
        <section id="purchase" className="py-16 px-4 sm:px-6 max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <p className="font-mono text-[11px] uppercase tracking-wider text-primary font-medium">
              Purchase Gift Entitlement
            </p>
            <h2 className="font-serif text-2xl sm:text-3xl text-[#181925] mt-1 font-normal">
              Send a Complete memorial gift
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-[#666]">
              $179 one-time payment. No accounts required to purchase.
            </p>
          </div>

          <GiftPurchaseForm />
        </section>

        {/* FAQs */}
        <section className="py-12 bg-white border-t border-black/[0.06] px-4 sm:px-6">
          <div className="max-w-3xl mx-auto flex flex-col gap-8">
            <div className="text-center">
              <p className="font-mono text-[11px] uppercase tracking-wider text-primary font-medium">
                Common Questions
              </p>
              <h2 className="font-serif text-2xl sm:text-3xl text-[#181925] mt-1 font-normal">
                Everything you need to know about gifting
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-xl border border-black/[0.08] p-4.5 bg-[#fafafb] flex flex-col gap-1.5">
                <h4 className="font-semibold text-xs sm:text-sm text-[#181925]">
                  Do I need photos or dates of the deceased?
                </h4>
                <p className="text-xs text-[#666] leading-relaxed">
                  No. You only need the recipient's name and email address. They will enter their loved one's details, photos, and stories whenever they feel ready.
                </p>
              </div>

              <div className="rounded-xl border border-black/[0.08] p-4.5 bg-[#fafafb] flex flex-col gap-1.5">
                <h4 className="font-semibold text-xs sm:text-sm text-[#181925]">
                  Does this gift ever expire?
                </h4>
                <p className="text-xs text-[#666] leading-relaxed">
                  Never. Grief moves on its own schedule. Whether they claim it tomorrow, next month, or next year, the entitlement remains permanently valid.
                </p>
              </div>

              <div className="rounded-xl border border-black/[0.08] p-4.5 bg-[#fafafb] flex flex-col gap-1.5">
                <h4 className="font-semibold text-xs sm:text-sm text-[#181925]">
                  Can they use it on a memorial already started?
                </h4>
                <p className="text-xs text-[#666] leading-relaxed">
                  Yes. When claiming the gift, they can choose to create a new memorial or apply the Complete upgrade to any free memorial they already created.
                </p>
              </div>

              <div className="rounded-xl border border-black/[0.08] p-4.5 bg-[#fafafb] flex flex-col gap-1.5">
                <h4 className="font-semibold text-xs sm:text-sm text-[#181925]">
                  Will I have access to edit their memorial?
                </h4>
                <p className="text-xs text-[#666] leading-relaxed">
                  No. For privacy and emotional boundaries, the memorial belongs entirely to the recipient. If they choose to invite you as a contributor or co-admin later, they can do so directly from their dashboard.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <TheirsFooter />
    </div>
  )
}
