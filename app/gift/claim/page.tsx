import { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import crypto from "crypto"
import { getSupabaseAdminSafe } from "@/utils/supabase/admin"
import { createClient } from "@/utils/supabase/server"
import { TheirsFooter } from "@/components/theirs/footer"
import { GiftClaimClient } from "./claim-client"
import { AlertCircle, CheckCircle2, Gift, Heart, ArrowRight } from "lucide-react"

export const metadata: Metadata = {
  title: "Claim Your Memorial Gift | Theirs",
  description: "Claim a prepaid Complete memorial entitlement given by someone who cares.",
}

interface ClaimPageProps {
  searchParams: Promise<{
    token?: string
  }>
}

export default async function GiftClaimPage({ searchParams }: ClaimPageProps) {
  const params = await searchParams
  const token = params.token?.trim() || ""

  if (!token || token.length < 32) {
    return (
      <div className="min-h-screen bg-[#fafaf9] text-[#181925] flex flex-col">
        <header className="w-full border-b border-black/[0.06] bg-white h-16 flex items-center px-6">
          <Link href="/" className="flex items-center">
            <Image src="/theirs-logo.svg" alt="Theirs" width={20} height={20} />
            <span className="font-semibold tracking-tight text-[#181925] text-lg ml-2">
              Theirs<span className="text-primary">.</span>
            </span>
          </Link>
        </header>

        <main className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md rounded-2xl border border-black/[0.1] bg-white p-8 text-center flex flex-col items-center gap-4">
            <div className="size-12 rounded-full bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-700">
              <AlertCircle className="size-6" />
            </div>
            <h1 className="font-serif text-2xl text-[#181925] font-normal">
              Invalid or Missing Claim Link
            </h1>
            <p className="text-xs sm:text-sm text-[#666] leading-relaxed">
              We couldn't locate a memorial gift for this link. Please verify that the entire address from your invitation email was copied.
            </p>
            <Link
              href="/"
              className="mt-2 inline-flex items-center justify-center h-10 px-5 rounded-full border border-black/[0.12] bg-[#fafafb] text-xs font-medium text-[#181925] hover:bg-white"
            >
              Return to homepage
            </Link>
          </div>
        </main>

        <TheirsFooter />
      </div>
    )
  }

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex")
  const admin = getSupabaseAdminSafe()

  let gift: any = null
  let redeemedMemorial: any = null

  if (admin) {
    const { data } = await admin
      .from("memorial_gifts")
      .select("id, buyer_name, recipient_name, recipient_email, gift_message, amount, status, redeemed_memorial_id, redeemed_at")
      .eq("claim_token_hash", tokenHash)
      .maybeSingle()

    gift = data

    if (gift?.redeemed_memorial_id) {
      const { data: mem } = await admin
        .from("memorials")
        .select("id, full_name, slug")
        .eq("id", gift.redeemed_memorial_id)
        .maybeSingle()
      redeemedMemorial = mem
    }
  }

  // Not found
  if (!gift) {
    return (
      <div className="min-h-screen bg-[#fafaf9] text-[#181925] flex flex-col">
        <header className="w-full border-b border-black/[0.06] bg-white h-16 flex items-center px-6">
          <Link href="/" className="flex items-center">
            <Image src="/theirs-logo.svg" alt="Theirs" width={20} height={20} />
            <span className="font-semibold tracking-tight text-[#181925] text-lg ml-2">
              Theirs<span className="text-primary">.</span>
            </span>
          </Link>
        </header>

        <main className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md rounded-2xl border border-black/[0.1] bg-white p-8 text-center flex flex-col items-center gap-4">
            <div className="size-12 rounded-full bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-700">
              <AlertCircle className="size-6" />
            </div>
            <h1 className="font-serif text-2xl text-[#181925] font-normal">
              Gift Not Found
            </h1>
            <p className="text-xs sm:text-sm text-[#666] leading-relaxed">
              This gift link does not match any records. It may have been entered incorrectly or updated.
            </p>
            <Link
              href="/"
              className="mt-2 inline-flex items-center justify-center h-10 px-5 rounded-full border border-black/[0.12] bg-[#fafafb] text-xs font-medium text-[#181925] hover:bg-white"
            >
              Return to homepage
            </Link>
          </div>
        </main>

        <TheirsFooter />
      </div>
    )
  }

  // Already redeemed
  if (gift.status === "redeemed") {
    return (
      <div className="min-h-screen bg-[#fafaf9] text-[#181925] flex flex-col">
        <header className="w-full border-b border-black/[0.06] bg-white h-16 flex items-center px-6">
          <Link href="/" className="flex items-center">
            <Image src="/theirs-logo.svg" alt="Theirs" width={20} height={20} />
            <span className="font-semibold tracking-tight text-[#181925] text-lg ml-2">
              Theirs<span className="text-primary">.</span>
            </span>
          </Link>
        </header>

        <main className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md rounded-2xl border border-black/[0.1] bg-white p-8 text-center flex flex-col items-center gap-4">
            <div className="size-12 rounded-full bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="size-6" />
            </div>
            <h1 className="font-serif text-2xl text-[#181925] font-normal">
              Memorial Gift Already Claimed
            </h1>
            <p className="text-xs sm:text-sm text-[#666] leading-relaxed">
              This Complete memorial gift from {gift.buyer_name} has already been claimed and activated.
            </p>

            {redeemedMemorial && (
              <div className="w-full rounded-xl border border-black/[0.08] bg-[#fafafb] p-4 text-left flex flex-col gap-1 my-2">
                <p className="font-mono text-[10px] uppercase tracking-wider text-[#777]">
                  Activated Memorial:
                </p>
                <p className="font-semibold text-sm text-[#181925]">{redeemedMemorial.full_name}</p>
                <p className="font-mono text-[11px] text-primary">theirs.page/{redeemedMemorial.slug}</p>
              </div>
            )}

            <div className="flex items-center gap-3 mt-2">
              {redeemedMemorial ? (
                <Link
                  href={`/${redeemedMemorial.slug}`}
                  className="inline-flex items-center justify-center h-10 px-5 rounded-full border border-transparent bg-primary text-xs font-medium text-white hover:bg-primary/90"
                >
                  Visit Memorial
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center h-10 px-5 rounded-full border border-transparent bg-primary text-xs font-medium text-white hover:bg-primary/90"
                >
                  Sign in to Dashboard
                </Link>
              )}
            </div>
          </div>
        </main>

        <TheirsFooter />
      </div>
    )
  }

  // Pending payment
  if (gift.status === "pending_payment") {
    return (
      <div className="min-h-screen bg-[#fafaf9] text-[#181925] flex flex-col">
        <header className="w-full border-b border-black/[0.06] bg-white h-16 flex items-center px-6">
          <Link href="/" className="flex items-center">
            <Image src="/theirs-logo.svg" alt="Theirs" width={20} height={20} />
            <span className="font-semibold tracking-tight text-[#181925] text-lg ml-2">
              Theirs<span className="text-primary">.</span>
            </span>
          </Link>
        </header>

        <main className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md rounded-2xl border border-black/[0.1] bg-white p-8 text-center flex flex-col items-center gap-4">
            <div className="size-12 rounded-full bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-700">
              <AlertCircle className="size-6" />
            </div>
            <h1 className="font-serif text-2xl text-[#181925] font-normal">
              Gift Payment Pending
            </h1>
            <p className="text-xs sm:text-sm text-[#666] leading-relaxed">
              This gift is awaiting payment confirmation. Once the payment completes, this link will become active immediately.
            </p>
          </div>
        </main>

        <TheirsFooter />
      </div>
    )
  }

  // Status is available -> check authentication & user memorials
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let userMemorials: any[] = []
  if (user && admin) {
    const { data: mems } = await admin
      .from("memorials")
      .select("id, full_name, slug, is_paid")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false })

    userMemorials = mems || []
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
            Learn more about Theirs
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-12 sm:py-16 px-4 sm:px-6 flex flex-col items-center">
        <div className="w-full max-w-xl text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-black/[0.08] bg-white text-[11px] font-mono uppercase tracking-wider text-primary font-medium mb-3">
            <Gift className="size-3" />
            <span>Memorial Gift Invitation</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl text-[#181925] font-normal">
            You have received a memorial gift
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-[#555] max-w-md mx-auto leading-relaxed">
            {gift.buyer_name} has gifted you a Complete memorial archive to celebrate and remember someone you love.
          </p>
        </div>

        <GiftClaimClient
          token={token}
          claimInfo={{
            buyer_name: gift.buyer_name,
            recipient_name: gift.recipient_name,
            recipient_email: gift.recipient_email,
            gift_message: gift.gift_message,
            amount: Number(gift.amount || 179),
          }}
          currentUser={
            user
              ? {
                  id: user.id,
                  email: user.email,
                }
              : null
          }
          existingMemorials={userMemorials}
        />
      </main>

      <TheirsFooter />
    </div>
  )
}
