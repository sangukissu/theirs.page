import type { Metadata } from "next"
import { TheirsNav } from "@/components/theirs/nav"
import { TheirsHero } from "@/components/theirs/hero"
import { TheirsSteps } from "@/components/theirs/steps"
import { FeaturesBento } from "@/components/theirs/features-bento"
import { TheirsPricing } from "@/components/theirs/pricing"
import { TheirsFaq } from "@/components/theirs/faq"
import { CtaBanner } from "@/components/theirs/cta-banner"
import { TheirsFooter } from "@/components/theirs/footer"
import { JsonLd } from "@/components/seo/json-ld"
import { buildStaticMetadata } from "@/lib/seo/metadata"
import { buildHomeSchemaGraph } from "@/lib/seo/schema"

export const metadata: Metadata = buildStaticMetadata("/")

export default function HomePage() {
  const schemaGraph = buildHomeSchemaGraph()

  return (
    <main className="min-h-screen bg-white text-[#666666] selection:bg-primary/10 selection:text-primary relative">
      {/* Connected JSON-LD Schema Graph: Organization, WebSite, WebApplication, WebPage, FAQPage */}
      <JsonLd schema={schemaGraph} id="theirs-home-schema" />

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
