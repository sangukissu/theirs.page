"use client"

import Link from "next/link"
import { ShieldCheck, Download, ArrowRight, Heart } from "lucide-react"

interface MemorialFooterProps {
  fullName: string
  slug: string
  caretakerName?: string
  successorName?: string
}

export function MemorialFooter({
  fullName,
  slug,
  caretakerName = "Anita Carter (Daughter)",
  successorName = "Rahul Carter (Grandson)",
}: MemorialFooterProps) {
  const handleExport = () => {
    window.location.href = `/api/memorials/${slug}/export`
  }

  return (
    <footer className="mt-16 border-t border-black/[0.06] bg-[#f7f7f8] py-16 px-4">
      <div className="max-w-4xl mx-auto flex flex-col gap-10">

        {/* Create a Memorial Prompt */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-black/[0.06] text-xs text-[#888]">
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="flex items-center gap-1.5 font-medium text-[#181925] hover:opacity-85 select-none"
            >
              <span className="size-1.5 rounded-full bg-primary" />
              <span>theirs.page</span>
            </Link>
            <span>·</span>
            <span>A place dedicated to a human life</span>
          </div>

          <Link
            href="/login"
            className="inline-flex items-center gap-1 text-primary hover:underline font-medium select-none"
          >
            <span>Create a memorial for someone you love</span>
            <ArrowRight className="size-3" />
          </Link>
        </div>

      </div>
    </footer>
  )
}
