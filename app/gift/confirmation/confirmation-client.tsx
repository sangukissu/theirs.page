"use client"

import React from "react"
import { Mail, ShieldCheck } from "lucide-react"

interface GiftConfirmationClientProps {
  buyerEmail?: string
}

export function GiftConfirmationClient({ buyerEmail }: GiftConfirmationClientProps) {
  return (
    <div className="mt-6 w-full rounded-xl border border-black/[0.08] bg-[#fbfbfc] p-4 text-left flex flex-col gap-2.5 text-xs text-[#666]">
      <div className="flex items-center gap-2 text-sm font-medium text-[#181925]">
        <Mail className="size-4 text-primary" />
        <span>What happens now?</span>
      </div>
      <p className="leading-relaxed">
        1. An email has been sent to the recipient with instructions on how to activate their memorial whenever they are ready.
      </p>
      {buyerEmail && (
        <p className="leading-relaxed">
          2. A receipt and backup link have been sent to <strong className="text-[#181925]">{buyerEmail}</strong>. If they ever misplace the link, you can provide it to them directly.
        </p>
      )}
      <p className="leading-relaxed">
        3. For privacy, only the recipient controls the memorial. Once they create it, they can invite you as a collaborator or guest contributor if they wish.
      </p>
    </div>
  )
}
