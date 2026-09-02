import Link from "next/link"
import { Check, ShieldCheck, Download } from "lucide-react"

export function TheirsPricing() {
  const perks = [
    "Permanent link: theirs.page/their-name",
    "Unlimited memories from family & friends",
    "Preserves original high-resolution photos",
    "Voicemail & audio player",
    "3 Privacy modes: Public, Unlisted, Private PIN",
    "Successor caretaker assignment",
    "1-Click full archive export anytime",
  ]

  return (
    <section id="pricing" className="py-16 sm:py-24 px-4 max-w-5xl mx-auto">
      <div className="text-center max-w-xl mx-auto mb-12">
        <h2 className="text-balance text-3xl font-medium leading-[1.1] tracking-tight text-[#454545] sm:text-4xl">
          One person. One permanent place.
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          We never charge monthly subscriptions for grief. Pay once, preserve forever.
        </p>
      </div>

      {/* Split Bento Card (Zero heavy shadow) */}
      <div className="rounded-[28px] border border-border bg-[#f6f6f6] overflow-hidden grid grid-cols-1 md:grid-cols-12">
        {/* Left Column */}
        <div className="md:col-span-7 p-6 sm:p-10 flex flex-col justify-between bg-white">
          <div>
            <div className="flex items-center justify-between gap-2 mb-4">
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                Lifetime Memorial
              </span>
              <span className="text-xs text-muted-foreground">Free to begin</span>
            </div>

            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-4xl sm:text-5xl font-medium tracking-tight text-[#454545]">
                $49
              </span>
              <span className="text-sm text-muted-foreground">one-time / lifetime</span>
            </div>

            <p className="text-xs sm:text-sm text-muted-foreground mb-6">
              Start building the memorial for free today. Upgrade only when you are ready to publish and preserve it permanently.
            </p>

            <ul className="space-y-2.5 text-xs sm:text-sm text-muted-foreground mb-8">
              {perks.map((perk, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="size-3.5 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Check className="size-2.5 stroke-[3]" />
                  </span>
                  <span className="text-[#454545]">{perk}</span>
                </li>
              ))}
            </ul>
          </div>

          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-1 whitespace-nowrap !rounded-full font-medium transition-all cursor-pointer border border-[color-mix(in_srgb,var(--primary)_80%,#3a3480)] bg-[color-mix(in_srgb,var(--primary)_90%,#3a3480)] text-primary-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.22),inset_0_-1px_0_rgba(58,52,128,0.30)] transform-gpu hover:bg-primary h-9 px-4 text-sm group"
          >
            Get Started Free
          </Link>
        </div>

        {/* Right Column */}
        <div className="md:col-span-5 p-6 sm:p-10 flex flex-col justify-between border-t md:border-t-0 md:border-l border-border bg-[#f6f6f6]">
          <div>
            <div className="flex items-center gap-1.5 mb-3 text-emerald-600 text-xs font-medium">
              <ShieldCheck className="size-4" />
              <span>Our Core Promise</span>
            </div>

            <h3 className="text-base font-medium text-[#454545] leading-snug">
              “Your memories should not depend on Theirs existing forever.”
            </h3>

            <p className="text-xs text-muted-foreground leading-relaxed mt-2.5">
              Download every original uncompressed photograph, voicemail, and story as an offline archive at any time.
            </p>
          </div>

          <div className="mt-6 p-3.5 rounded-2xl bg-white border border-border space-y-1.5 text-xs font-mono text-muted-foreground">
            <div className="flex items-center justify-between text-primary text-[11px] font-sans font-medium mb-1">
              <span className="flex items-center gap-1">
                <Download className="size-3" />
                <span>Export Package</span>
              </span>
              <span>ZIP</span>
            </div>
            <div className="text-[11px] space-y-0.5">
              <div>📁 /photos (Original 4K)</div>
              <div>📁 /audio (Voicemails)</div>
              <div>📄 memorial.html (Offline reader)</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
