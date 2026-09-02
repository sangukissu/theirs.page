import type { Metadata } from "next"
import { TheirsNav } from "@/components/theirs/nav"
import { TheirsHero } from "@/components/theirs/hero"
import { TheirsSteps } from "@/components/theirs/steps"
import { FeaturesBento } from "@/components/theirs/features-bento"
import { TheirsPricing } from "@/components/theirs/pricing"
import { TheirsFaq } from "@/components/theirs/faq"
import { CtaBanner } from "@/components/theirs/cta-banner"
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

      {/* Hero Section with Interactive Link Box CTA */}
      <TheirsHero />

      {/* Three Steps Section */}
      <TheirsSteps />

      {/* Features Bento Grid */}
      <FeaturesBento />

      {/* Transparent Split Pricing */}
      <TheirsPricing />

      {/* FAQ with Fluid Morphing Separation */}
      <TheirsFaq />

      {/* Final Dark Charcoal CTA Banner */}
      <CtaBanner />

      {/* Footer */}
      <TheirsFooter />
    </main>
  )
}
