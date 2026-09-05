"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { CheckCircle2, AlertCircle, ArrowRight, Heart, Shield, Loader2, LogOut } from "lucide-react"

interface InvitationAcceptClientProps {
  token: string
  memorial: {
    id: string
    full_name: string
    slug: string
    portrait_photo_url: string | null
  }
  invitedEmail: string
  role: "co_admin" | "contributor"
  userEmail: string | null
  alreadyAccepted?: boolean
}

export function InvitationAcceptClient({
  token,
  memorial,
  invitedEmail,
  role,
  userEmail,
  alreadyAccepted = false,
}: InvitationAcceptClientProps) {
  const router = useRouter()
  const [isAccepting, setIsAccepting] = useState(false)
  const [accepted, setAccepted] = useState(alreadyAccepted)
  const [error, setError] = useState<string | null>(null)

  const isEmailMatch =
    userEmail && userEmail.toLowerCase().trim() === invitedEmail.toLowerCase().trim()

  const handleAccept = async () => {
    setIsAccepting(true)
    setError(null)

    try {
      const res = await fetch("/api/invitations/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Failed to accept invitation")
      }

      setAccepted(true)
    } catch (err: any) {
      setError(err.message || "Failed to accept invitation. Please try again.")
    } finally {
      setIsAccepting(false)
    }
  }

  // Already accepted or just accepted state
  if (accepted) {
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
              You now have access as a {role === "co_admin" ? "co-admin" : "collaborator"}. You can approve contributions, write stories, and care for this space together.
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

  // Logged in with DIFFERENT email
  if (userEmail && !isEmailMatch) {
    const returnUrl = `/invitation/accept?token=${encodeURIComponent(token)}`
    const loginUrl = `/login?next=${encodeURIComponent(returnUrl)}`

    return (
      <div className="min-h-screen bg-[#fafafb] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-black/[0.08] rounded-3xl p-8 shadow-xs flex flex-col items-center text-center gap-5">
          <div className="size-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
            <AlertCircle className="size-6" />
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-mono uppercase tracking-wider text-amber-600 font-semibold">
              Account Mismatch
            </span>
            <h1 className="text-xl font-serif font-medium text-[#181925]">
              Signed in as different account
            </h1>
            <p className="text-xs text-[#71717a] leading-relaxed max-w-sm">
              This caretaker invitation was issued for{" "}
              <strong className="font-mono text-[#333]">{invitedEmail}</strong>.
              <br />
              You are currently signed in as{" "}
              <strong className="font-mono text-[#333]">{userEmail}</strong>.
            </p>
          </div>

          <div className="w-full pt-2 flex flex-col gap-2.5">
            <Link
              href={loginUrl}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-[#181925] hover:bg-[#252736] text-white text-xs font-medium transition-all cursor-pointer"
            >
              <span>Switch Account</span>
              <ArrowRight className="size-3.5" />
            </Link>
            <Link
              href="/"
              className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-full bg-[#f4f4f6] hover:bg-neutral-200 text-[#181925] text-xs font-medium transition-colors"
            >
              Cancel & Return Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Logged in with MATCHING email: Explicit POST Acceptance
  if (userEmail && isEmailMatch) {
    return (
      <div className="min-h-screen bg-[#fafafb] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-black/[0.08] rounded-3xl p-8 shadow-xs flex flex-col items-center text-center gap-5">
          {memorial.portrait_photo_url ? (
            <div className="size-16 rounded-2xl overflow-hidden border border-black/[0.08]">
              <img
                src={memorial.portrait_photo_url}
                alt={memorial.full_name}
                className="size-full object-cover"
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
              You have been invited as a {role === "co_admin" ? "co-admin" : "collaborator"} to help care for and contribute to {memorial.full_name}&apos;s family archive.
            </p>
          </div>

          {error && (
            <div className="w-full p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium flex items-center gap-2 text-left">
              <AlertCircle className="size-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="w-full pt-2 flex flex-col gap-2.5">
            <button
              type="button"
              onClick={handleAccept}
              disabled={isAccepting}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-[#181925] hover:bg-[#252736] text-white text-xs font-medium transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAccepting ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Joining Circle...</span>
                </>
              ) : (
                <>
                  <span>Accept Caretaker Role</span>
                  <ArrowRight className="size-3.5" />
                </>
              )}
            </button>

            <span className="text-[11px] text-[#888]">
              Signed in as <strong className="font-mono text-[#555]">{userEmail}</strong>
            </span>
          </div>
        </div>
      </div>
    )
  }

  // Not logged in: prompt sign in
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
              className="size-full object-cover"
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
            You have been invited as a {role === "co_admin" ? "co-admin" : "collaborator"} to help preserve memories, upload photos, and care for this memorial.
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
            Invited address: <strong className="font-mono text-[#555]">{invitedEmail}</strong>
          </span>
        </div>
      </div>
    </div>
  )
}
