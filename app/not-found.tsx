import Link from "next/link"
import { TheirsNav } from "@/components/theirs/nav"
import { TheirsFooter } from "@/components/theirs/footer"
import { ArrowLeft, LogIn } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex flex-col justify-between selection:bg-primary/10 selection:text-primary">
      <TheirsNav />

      <main className="flex-1 flex items-center justify-center px-4 py-16 sm:py-24">
        <div className="text-center max-w-lg mx-auto flex flex-col items-center">
          {/* Minimal Status Pill */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-black/[0.06] bg-[#fafafb] px-3.5 py-1 text-xs text-[#666] select-none">
            <span className="size-1.5 rounded-full bg-primary" />
            <span className="font-mono uppercase text-[11px] tracking-wider text-[#555]">404 · Not Found</span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-5xl font-medium tracking-tight text-[#181925] mb-4">
            This page isn’t here.
          </h1>

          {/* Body */}
          <p className="text-sm sm:text-base text-[#666] leading-relaxed mb-8 max-w-md">
            The memorial may have moved, been made private, or the address may be incorrect.
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 whitespace-nowrap !rounded-full font-medium transition-all cursor-pointer border border-[color-mix(in_srgb,var(--primary)_80%,#3a3480)] bg-[color-mix(in_srgb,var(--primary)_90%,#3a3480)] text-primary-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.22),inset_0_-1px_0_rgba(58,52,128,0.30)] transform-gpu hover:bg-primary hover:border-[color-mix(in_srgb,var(--primary)_70%,#3a3480)] active:translate-y-px active:scale-[0.98] h-10 px-6 text-xs sm:text-sm select-none"
            >
              <ArrowLeft className="size-3.5" />
              <span>Go to Theirs</span>
            </Link>

            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium transition-colors cursor-pointer border border-black/[0.08] bg-[#fafafb] hover:bg-neutral-200 text-[#181925] h-10 px-5 text-xs sm:text-sm select-none"
            >
              <LogIn className="size-3.5 text-[#666]" />
              <span>Sign in</span>
            </Link>
          </div>
        </div>
      </main>

      <TheirsFooter />
    </div>
  )
}