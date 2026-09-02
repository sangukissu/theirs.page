import type { Metadata } from "next"
import { TheirsNav } from "@/components/theirs/nav"
import { TheirsHero } from "@/components/theirs/hero"
import { LiveShowcase } from "@/components/theirs/live-showcase"
import { TheirsSteps } from "@/components/theirs/steps"
import { FeaturesBento } from "@/components/theirs/features-bento"
import { TheirsComparison } from "@/components/theirs/comparison"
import { TheirsPricing } from "@/components/theirs/pricing"
import { TheirsFaq } from "@/components/theirs/faq"
import { TheirsFooter } from "@/components/theirs/footer"

export const metadata: Metadata = {
  title: "Theirs — A place on the internet dedicated to a human life",
  description:
    "Reconstruct the texture of who someone was. A collaborative life archive preserving stories, voicemails, and high-resolution memories without funeral clichés.",
  alternates: {
    canonical: "https://theirs.page/",
  },
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-[#666666] selection:bg-primary/10 selection:text-primary relative">
      {/* Floating Frosted Pill Navbar */}
      <TheirsNav />

      {/* Hero Section */}
      <TheirsHero />

      {/* Interactive Memorial Showcase */}
      <LiveShowcase />

      {/* Three Steps Section */}
      <TheirsSteps />

      {/* Features Bento Grid */}
      <FeaturesBento />

      {/* Comparison Matrix */}
      <TheirsComparison />

      {/* Transparent Split Pricing */}
      <TheirsPricing />

      {/* FAQ */}
      <TheirsFaq />

      {/* Final Warm CTA Banner */}
      <section className="py-20 px-4 text-center">
        <div className="max-w-2xl mx-auto rounded-md bg-[#f6f6f6] p-8 sm:p-12">
          <span className="text-xs font-mono font-medium text-primary uppercase tracking-wider">
            Begin today
          </span>
          <h2 className="text-balance text-3xl font-medium leading-[1.1] tracking-tight text-[#454545] sm:text-4xl mt-2 mb-3">
            Start with one photo and one memory.
          </h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto mb-7">
            You don&apos;t have to do it alone. Create the page in two minutes, and invite the people who loved them to assemble the rest.
          </p>
          <a
            href="/login"
            className="inline-flex items-center justify-center gap-1 whitespace-nowrap !rounded-full font-medium transition-all cursor-pointer border border-[color-mix(in_srgb,var(--primary)_80%,#3a3480)] bg-[color-mix(in_srgb,var(--primary)_90%,#3a3480)] text-primary-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.22),inset_0_-1px_0_rgba(58,52,128,0.30)] transform-gpu hover:bg-primary h-9 px-4 text-sm"
          >
            Create their memorial page →
          </a>
        </div>
      </section>

      {/* Footer */}
      <TheirsFooter />
    </main>
  )
}
