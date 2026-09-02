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
  const handleExportMock = () => {
    alert("Offline Archive Export: A self-contained ZIP bundle containing all original uncompressed photos, studio audio, and a standalone offline browser viewer is being generated.")
  }

  return (
    <footer className="mt-16 border-t border-black/[0.06] bg-[#f7f7f8] py-16 px-4">
      <div className="max-w-4xl mx-auto flex flex-col gap-10">
        
        {/* Preservation Stewardship Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-black/[0.06] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex flex-col gap-1.5 max-w-md">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#181925] uppercase tracking-wider">
              <ShieldCheck className="size-4 text-emerald-600" />
              <span>Permanent Stewardship Chain</span>
            </div>
            <p className="text-xs text-[#666] leading-relaxed">
              This memorial is permanently funded with lifetime hosting on Theirs. Administered by{" "}
              <span className="font-medium text-[#181925]">{caretakerName}</span> with secondary stewardship designated to{" "}
              <span className="font-medium text-[#181925]">{successorName}</span>.
            </p>
          </div>

          <button
            type="button"
            onClick={handleExportMock}
            className="inline-flex items-center gap-2 rounded-full border border-black/[0.08] hover:bg-neutral-50 px-4 py-2 text-xs font-medium text-[#181925] transition-colors cursor-pointer shrink-0 select-none"
          >
            <Download className="size-3.5 text-[#888]" />
            <span>Download Offline Archive (.ZIP)</span>
          </button>
        </div>

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
