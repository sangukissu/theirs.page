import Link from "next/link"
import { redirect } from "next/navigation"
import { CheckCircle2, AlertCircle, ArrowRight, Shield, Heart } from "lucide-react"
import { createClient } from "@/utils/supabase/server"
import { getSupabaseAdminSafe } from "@/utils/supabase/admin"
import { verifyInvitationToken } from "@/lib/invitations"

interface PageProps {
  searchParams: Promise<{ token?: string }>
}

export default async function InvitationAcceptPage({ searchParams }: PageProps) {
  const { token } = await searchParams

  if (!token) {
    return (
      <div className="min-h-screen bg-[#fafafb] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-black/[0.08] rounded-3xl p-8 shadow-xs text-center flex flex-col items-center gap-4">
          <div className="size-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
            <AlertCircle className="size-6" />
          </div>
          <h1 className="text-xl font-serif font-medium text-[#181925]">Missing Invitation Link</h1>
          <p className="text-xs text-[#71717a] leading-relaxed">
            This page requires a valid caretaker invitation token. Please check the link you received from the family.
          </p>
          <Link
            href="/"
            className="mt-2 px-5 py-2.5 rounded-full bg-[#181925] text-white text-xs font-medium hover:bg-[#252736] transition-colors"
          >
            Return to Theirs
          </Link>
        </div>
      </div>
    )
  }

  // 1. Verify cryptographic token signature
  const verification = verifyInvitationToken(token)

  if (!verification.valid || !verification.payload) {
    return (
      <div className="min-h-screen bg-[#fafafb] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-black/[0.08] rounded-3xl p-8 shadow-xs text-center flex flex-col items-center gap-4">
          <div className="size-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertCircle className="size-6" />
          </div>
          <h1 className="text-xl font-serif font-medium text-[#181925]">Invitation Expired or Invalid</h1>
          <p className="text-xs text-[#71717a] leading-relaxed">
            {verification.error || "This invitation link is invalid or has expired after 14 days."}
            <br />
            Please ask the memorial owner to send you a new invitation link.
          </p>
          <Link
            href="/"
            className="mt-2 px-5 py-2.5 rounded-full bg-[#181925] text-white text-xs font-medium hover:bg-[#252736] transition-colors"
          >
            Return to Theirs
          </Link>
        </div>
      </div>
    )
  }

  const payload = verification.payload
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const db = getSupabaseAdminSafe() || supabase

  // 2. Fetch memorial details
  const { data: memorial } = await db
    .from("memorials")
    .select("id, full_name, slug, portrait_photo_url")
    .eq("id", payload.memorialId)
    .maybeSingle()

  if (!memorial) {
    return (
      <div className="min-h-screen bg-[#fafafb] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-black/[0.08] rounded-3xl p-8 shadow-xs text-center flex flex-col items-center gap-4">
          <h1 className="text-xl font-serif font-medium text-[#181925]">Memorial Not Found</h1>
          <p className="text-xs text-[#71717a]">
            The memorial associated with this invitation is no longer available.
          </p>
        </div>
      </div>
    )
  }

  // 3. User is NOT logged in: Prompt sign in / account creation
  if (!user) {
    const returnUrl = `/invitation/accept?token=${encodeURIComponent(token)}`
    const loginUrl = `/login?next=${encodeURIComponent(returnUrl)}`

    return (
      <div className="min-h-screen bg-[#fafafb] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-black/[0.08] rounded-3xl p-8 shadow-xs flex flex-col items-center text-center gap-5">
          {memorial.portrait_photo_url ? (
            <div className="size-16 rounded-2xl overflow-hidden border border-black/[0.08]">
              <img
                src={memorial.portrait_photo_url}
                alt={memorial.full_name}
                className="size-full object-cover grayscale contrast-105"
              />
            </div>
          ) : (
            <div className="size-14 rounded-2xl bg-[#f4f4f6] text-[#71717a] flex items-center justify-center">
              <Heart className="size-6" />
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-mono uppercase tracking-wider text-primary font-semibold">
              Family Caretaker Invitation
            </span>
            <h1 className="text-xl sm:text-2xl font-serif font-medium text-[#181925]">
              {memorial.full_name}
            </h1>
            <p className="text-xs text-[#71717a] leading-relaxed max-w-sm">
              You have been invited as a {payload.role === "co_admin" ? "co-admin" : "collaborator"} to help preserve memories, upload photos, and care for this memorial.
            </p>
          </div>

          <div className="w-full pt-2 flex flex-col gap-2.5">
            <Link
              href={loginUrl}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-[#181925] hover:bg-[#252736] text-white text-xs font-medium transition-all cursor-pointer"
            >
              <span>Sign in to Accept Invitation</span>
              <ArrowRight className="size-3.5" />
            </Link>

            <span className="text-[11px] text-[#888]">
              Invited address: <strong className="font-mono text-[#555]">{payload.email}</strong>
            </span>
          </div>
        </div>
      </div>
    )
  }

  // 4. User is logged in: Complete invitation acceptance and bind user_id
  const { error: updateErr } = await db
    .from("collaborators")
    .update({
      user_id: user.id,
      invitation_accepted: true,
    })
    .eq("id", payload.collaboratorId)
    .eq("memorial_id", payload.memorialId)

  if (updateErr) {
    console.error("Failed to accept collaborator invite:", updateErr)
  }

  return (
    <div className="min-h-screen bg-[#fafafb] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white border border-black/[0.08] rounded-3xl p-8 shadow-xs flex flex-col items-center text-center gap-5">
        <div className="size-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
          <CheckCircle2 className="size-7" />
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-600 font-semibold">
            Invitation Accepted
          </span>
          <h1 className="text-xl sm:text-2xl font-serif font-medium text-[#181925]">
            Welcome to {memorial.full_name}&apos;s Circle
          </h1>
          <p className="text-xs text-[#71717a] leading-relaxed max-w-sm">
            You now have access as a {payload.role === "co_admin" ? "co-admin" : "collaborator"}. You can approve contributions, write stories, and care for this space together.
          </p>
        </div>

        <div className="w-full pt-3 flex flex-col sm:flex-row gap-2.5">
          <Link
            href={`/${memorial.slug}`}
            className="flex-1 inline-flex items-center justify-center px-4 py-2.5 rounded-full bg-[#f4f4f6] hover:bg-neutral-200 text-[#181925] text-xs font-medium transition-colors"
          >
            View Live Memorial
          </Link>
          <Link
            href={`/dashboard/memorials/${memorial.id}/editor`}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full bg-[#181925] hover:bg-[#252736] text-white text-xs font-medium transition-colors"
          >
            <span>Open Studio</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </div>
    </div>
  )
}
