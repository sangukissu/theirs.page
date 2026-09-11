import { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { getSupabaseAdminSafe } from "@/utils/supabase/admin"
import { TheirsFooter } from "@/components/theirs/footer"
import { CheckCircle2, Heart, Mail, Copy, ArrowRight, ShieldCheck } from "lucide-react"
import { GiftConfirmationClient } from "./confirmation-client"

export const metadata: Metadata = {
  title: "Gift Confirmation | Theirs",
  description: "Your memorial gift has been successfully processed and sent.",
}

interface ConfirmationPageProps {
  searchParams: Promise<{
    session_id?: string
    gift_id?: string
  }>
}

export default async function GiftConfirmationPage({ searchParams }: ConfirmationPageProps) {
  const params = await searchParams
  const giftId = params.gift_id

  let gift: any = null

  if (giftId) {
    const admin = getSupabaseAdminSafe()
    if (admin) {
      const { data } = await admin
        .from("memorial_gifts")
        .select("id, buyer_name, buyer_email, recipient_name, recipient_email, gift_message, status, created_at")
        .eq("id", giftId)
        .maybeSingle()

      gift = data
    }
  }

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

          <Link href="/" className="text-xs sm:text-sm text-[#666] hover:text-[#181925] transition-colors">
            Return to home
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-12 sm:py-16 px-4 sm:px-6 flex flex-col items-center">
        <div className="w-full max-w-xl flex flex-col items-center text-center">
          {/* Success Icon */}
          <div className="size-14 rounded-full bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-600 mb-6">
            <CheckCircle2 className="size-7" />
          </div>

          <p className="font-mono text-[11px] uppercase tracking-wider text-primary font-medium">
            Order Complete
          </p>

          <h1 className="font-serif text-3xl sm:text-4xl text-[#181925] mt-1 font-normal">
            Thank you. Your gift has been sent.
          </h1>

          <p className="mt-3 text-sm sm:text-base text-[#555] max-w-md leading-relaxed">
            {gift ? (
              <>
                We have emailed an invitation and personal claim instructions to{" "}
                <strong className="text-[#181925] font-medium">{gift.recipient_name}</strong> at{" "}
                <strong className="text-[#181925] font-medium">{gift.recipient_email}</strong>.
              </>
            ) : (
              "Your payment was successful and the recipient's invitation is on its way."
            )}
          </p>

          {/* Card Summary - STRICT ZERO SHADOWS */}
          <div className="mt-8 w-full rounded-2xl border border-black/[0.1] bg-white p-6 text-left flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-black/[0.06]">
              <span className="font-mono text-[11px] uppercase tracking-wider text-[#777]">
                Gift Entitlement
              </span>
              <span className="font-mono text-xs text-emerald-700 font-medium bg-emerald-50 border border-emerald-200/70 px-2 py-0.5 rounded-md">
                Active & Ready to Claim
              </span>
            </div>

            {gift && (
              <div className="flex flex-col gap-2.5 text-xs">
                <div className="flex items-baseline justify-between">
                  <span className="text-[#777]">Recipient:</span>
                  <span className="font-medium text-[#181925]">
                    {gift.recipient_name} ({gift.recipient_email})
                  </span>
                </div>

                <div className="flex items-baseline justify-between">
                  <span className="text-[#777]">Purchased by:</span>
                  <span className="font-medium text-[#181925]">
                    {gift.buyer_name} ({gift.buyer_email})
                  </span>
                </div>

                {gift.gift_message && (
                  <div className="mt-2 pt-2 border-t border-black/[0.05] bg-[#fafafb] p-3 rounded-lg border border-black/[0.06]">
                    <p className="font-mono text-[10px] uppercase tracking-wider text-[#888] mb-1">
                      Your note to {gift.recipient_name}:
                    </p>
                    <p className="font-serif italic text-xs text-[#444] leading-relaxed">
                      “{gift.gift_message}”
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="pt-3 border-t border-dashed border-black/[0.08] flex items-center justify-between text-[11px] text-[#777]">
              <span>Never expires</span>
              <span>Unlimited family contributors</span>
              <span>100% private to recipient</span>
            </div>
          </div>

          <GiftConfirmationClient buyerEmail={gift?.buyer_email} />

          {/* Action Links */}
          <div className="mt-8 flex items-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center justify-center h-10 px-5 rounded-full border border-black/[0.12] bg-white text-xs font-medium text-[#181925] hover:bg-[#f5f5f5] transition-colors"
            >
              Return to Theirs home
            </Link>
            <Link
              href="/robert-carter"
              className="inline-flex items-center justify-center h-10 px-5 rounded-full border border-transparent bg-primary text-xs font-medium text-white hover:bg-primary/90 transition-colors"
            >
              Explore sample memorial
            </Link>
          </div>
        </div>
      </main>

      <TheirsFooter />
    </div>
  )
}
