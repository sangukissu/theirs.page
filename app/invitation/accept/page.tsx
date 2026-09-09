import Link from "next/link"
import { AlertCircle } from "lucide-react"
import { createClient } from "@/utils/supabase/server"
import { getSupabaseAdminSafe } from "@/utils/supabase/admin"
import { verifyInvitationToken } from "@/lib/invitations"
import { resolveMediaUrl } from "@/lib/r2"
import { InvitationAcceptClient } from "./invitation-accept-client"
import { buildNoIndexMetadata } from "@/lib/seo/metadata"

export const metadata = buildNoIndexMetadata("Memorial Invitation")

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
          <h1 className="text-xl font-serif font-medium text-[#181925]">Invalid Invitation</h1>
          <p className="text-xs text-[#71717a]">
            This invitation link is missing a valid security token.
          </p>
          <Link
            href="/"
            className="px-4 py-2 rounded-full bg-[#181925] text-white text-xs font-medium hover:bg-black transition-colors"
          >
            Return Home
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

  // 2. Resolve both records from the database. The signed token identifies the
  // invitation, while the live collaborator row remains the source of truth.
  const [{ data: memorial }, { data: collab }] = await Promise.all([
    db
      .from("memorials")
      .select("id, full_name, slug, portrait_photo_url")
      .eq("id", payload.memorialId)
      .maybeSingle(),
    db
      .from("collaborators")
      .select("memorial_id, email, role, is_trusted, invitation_accepted, user_id")
      .eq("id", payload.collaboratorId)
      .eq("memorial_id", payload.memorialId)
      .maybeSingle(),
  ])

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

  if (!collab || collab.email.toLowerCase().trim() !== payload.email.toLowerCase().trim()) {
    return (
      <div className="min-h-screen bg-[#fafafb] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-black/[0.08] rounded-3xl p-8 shadow-xs text-center flex flex-col items-center gap-4">
          <div className="size-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
            <AlertCircle className="size-6" />
          </div>
          <h1 className="text-xl font-serif font-medium text-[#181925]">Invitation Revoked</h1>
          <p className="text-xs text-[#71717a] leading-relaxed">
            This invitation is no longer active. Please ask the memorial owner to send a new invitation if you still need access.
          </p>
          <Link
            href="/dashboard"
            className="mt-2 px-5 py-2.5 rounded-full bg-[#181925] text-white text-xs font-medium hover:bg-[#252736] transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  const normalizedUserEmail = user?.email?.toLowerCase().trim()
  const alreadyAccepted = Boolean(
    user?.id &&
      collab.invitation_accepted &&
      collab.user_id === user.id &&
      normalizedUserEmail === collab.email.toLowerCase().trim()
  )
  const accessRole = collab.role === "co_admin"
    ? "co_admin"
    : collab.is_trusted
      ? "trusted"
      : "contributor"

  // 4. Render interactive client (no side-effects on GET)
  return (
    <InvitationAcceptClient
      token={token}
      memorial={{
        ...memorial,
        portrait_photo_url: resolveMediaUrl(memorial.portrait_photo_url),
      }}
      invitedEmail={collab.email}
      role={accessRole}
      userEmail={user?.email || null}
      alreadyAccepted={alreadyAccepted}
    />
  )
}
