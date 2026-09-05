"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { normalizeMemorialSlug } from "@/lib/memorial-slug"
import {
  Sparkles,
  ArrowRight,
  Share2,
  Check,
  CheckCircle2,
  Lock,
  Smartphone,
  MessageCircle,
  Clock,
  Camera,
  Mic,
  FileText,
  UserCheck,
} from "lucide-react"

export function LiveShowcase() {
  const router = useRouter()
  const [name, setName] = useState("Robert Carter")
  const [approvedCount, setApprovedCount] = useState(3)
  const [hasApprovedAll, setHasApprovedAll] = useState(false)

  // Derived slug from name
  const slug = normalizeMemorialSlug(name) || "their-name"

  const handleApproveAll = () => {
    setHasApprovedAll(true)
  }

  return (
    <section id="sample" className="py-8 sm:py-16 px-4 max-w-5xl mx-auto">
      {/* Outer Card: Soft neutral background, crisp hairline border, zero drop shadows */}
      <div className="rounded-2xl sm:rounded-3xl bg-[#f7f7f8] border border-black/[0.06] overflow-hidden flex flex-col">
        
        {/* Instant Name Claim & URL Playground (Reduces all initial friction) */}
        <div className="p-6 sm:p-8 bg-white border-b border-black/[0.05] flex flex-col items-center text-center gap-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 border border-black/[0.04] text-xs font-medium text-[#666]">
            <Sparkles className="size-3 text-primary" />
            <span>Try it with someone you love</span>
          </div>

          <h3 className="text-2xl sm:text-3xl font-medium tracking-tight text-[#181925] max-w-md">
            Start with their name. Let family assemble the rest.
          </h3>

          <p className="text-sm text-[#666] max-w-lg leading-relaxed">
            You don&apos;t have to write a biography alone. Type their name to see how one simple link gathers stories from everyone who loved them.
          </p>

          {/* Interactive URL Input & Instant Claim Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              const trimmed = name.trim()
              if (!trimmed) return
              const slugVal = normalizeMemorialSlug(trimmed)
              try {
                localStorage.setItem("theirs_pending_memorial", JSON.stringify({ name: trimmed, slug: slugVal }))
                document.cookie = `theirs_pending_name=${encodeURIComponent(trimmed)}; path=/; max-age=86400; SameSite=Lax`
                document.cookie = `theirs_pending_slug=${encodeURIComponent(slugVal)}; path=/; max-age=86400; SameSite=Lax`
              } catch {}
              router.push(`/login?name=${encodeURIComponent(trimmed)}&slug=${encodeURIComponent(slugVal)}`)
            }}
            className="w-full max-w-xl mt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-1.5 rounded-2xl bg-[#f7f7f8] border border-black/[0.08]"
          >
            <div className="flex-1 flex items-center gap-2 px-3 py-2 text-sm">
              <span className="font-mono text-xs text-[#888] select-none">theirs.page/</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onFocus={() => router.prefetch("/login")}
                placeholder="Enter their name..."
                className="w-full bg-transparent font-medium text-[#181925] outline-none placeholder:text-[#aaa] text-sm"
              />
            </div>

            <button
              type="submit"
              className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap !rounded-full font-medium transition-all cursor-pointer border border-[color-mix(in_srgb,var(--primary)_80%,#3a3480)] bg-[color-mix(in_srgb,var(--primary)_90%,#3a3480)] text-primary-foreground hover:bg-primary h-9 px-4 text-xs shrink-0 select-none group"
            >
              <span>Claim Free Memorial</span>
              <ArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
            </button>
          </form>

          {/* Quick Preset Names */}
          <div className="flex items-center gap-2 flex-wrap justify-center text-xs text-[#888] mt-1">
            <span>Try an example:</span>
            {["Grandma Rose", "Dad", "Arthur Pendelton", "Maya Lin"].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setName(preset)}
                className="px-2.5 py-1 rounded-full bg-neutral-100 hover:bg-neutral-200/80 text-[#555] transition-colors cursor-pointer"
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* The Collaborative Flywheel Visual (Side-by-Side: The Link vs The Living Page) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-black/[0.06]">
          
          {/* Left Column: The Frictionless WhatsApp/Family Spark */}
          <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between gap-6 bg-neutral-50/50">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#181925] uppercase tracking-wider">
                <Smartphone className="size-4 text-primary" />
                <span>Step 1 · Send 1 link to family</span>
              </div>
              <p className="text-xs text-[#666] leading-relaxed">
                Family & friends open the link directly on their phones. No account creation, no password to remember, and no app download.
              </p>

              {/* Simulated Family WhatsApp / iMessage Bubble */}
              <div className="p-4 rounded-2xl bg-white border border-black/[0.06] flex flex-col gap-2.5 mt-2">
                <div className="flex items-center justify-between border-b border-black/[0.04] pb-2 text-[11px] text-[#888]">
                  <span className="font-medium text-[#181925]">Family Group Chat</span>
                  <span>Today · 2:14 PM</span>
                </div>

                <p className="text-xs text-[#444] leading-relaxed">
                  “Hi everyone, I started a living page for <span className="font-medium text-[#181925]">{name || "them"}</span> on Theirs. If you have an old photo, a voice note, or a favorite story, please add it here:”
                </p>

                {/* Share Link Preview Pill */}
                <div className="p-2.5 rounded-xl bg-neutral-50 border border-black/[0.04] flex items-center justify-between gap-2">
                  <div className="flex flex-col min-w-0">
                    <span className="text-[11px] font-mono text-primary truncate font-medium">
                      theirs.page/{slug}
                    </span>
                    <span className="text-[10px] text-[#888]">Tap to contribute a memory</span>
                  </div>
                  <Share2 className="size-3.5 text-[#888] shrink-0" />
                </div>
              </div>
            </div>

            {/* Zero-Friction Checkpoints */}
            <div className="flex flex-col gap-2 pt-2 border-t border-black/[0.05] text-xs text-[#555]">
              <div className="flex items-center gap-2">
                <Check className="size-3.5 text-emerald-600 shrink-0" />
                <span>Zero sign-up required for contributors</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="size-3.5 text-emerald-600 shrink-0" />
                <span>You approve everything before it goes live</span>
              </div>
            </div>
          </div>

          {/* Right Column: The Page Assembling in Real-Time */}
          <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between gap-6 bg-white">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#181925] uppercase tracking-wider">
                  <UserCheck className="size-4 text-emerald-600" />
                  <span>Step 2 · Memories stream into your queue</span>
                </div>

                {/* Live Approval Queue Trigger */}
                {hasApprovedAll ? (
                  <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center gap-1 border border-emerald-100">
                    <CheckCircle2 className="size-3" />
                    <span>All Memories Live on Page</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleApproveAll}
                    className="text-[11px] font-medium text-primary bg-primary/10 hover:bg-primary/20 px-2.5 py-1 rounded-full cursor-pointer transition-colors flex items-center gap-1"
                  >
                    <span>Approve All (3)</span>
                  </button>
                )}
              </div>

              {/* Live Streaming Contribution Stack */}
              <div className="flex flex-col gap-2.5">
                {/* Contribution 1: Photo */}
                <div className="p-3.5 rounded-xl bg-[#f7f7f8] border border-black/[0.04] flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="size-8 rounded-lg bg-neutral-200 text-[#181925] text-xs font-medium flex items-center justify-center shrink-0">
                      A
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-medium text-[#181925] truncate">Anita (Daughter)</span>
                        <span className="text-[10px] text-[#888]">uploaded 35mm photo</span>
                      </div>
                      <p className="text-[11px] text-[#666] truncate">
                        “Christmas Day 1994 fixing the neighbour&apos;s machine”
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-[#777] bg-white px-2 py-0.5 rounded border border-black/[0.04] shrink-0">
                    Photo
                  </span>
                </div>

                {/* Contribution 2: Voice Note */}
                <div className="p-3.5 rounded-xl bg-[#f7f7f8] border border-black/[0.04] flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="size-8 rounded-lg bg-neutral-200 text-[#181925] text-xs font-medium flex items-center justify-center shrink-0">
                      D
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-medium text-[#181925] truncate">Uncle David (Brother)</span>
                        <span className="text-[10px] text-[#888]">recorded 42s voice note</span>
                      </div>
                      <p className="text-[11px] text-[#666] truncate">
                        “Crossing Dartmoor in the old Morris Minor”
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-[#777] bg-white px-2 py-0.5 rounded border border-black/[0.04] shrink-0">
                    Voice Memo
                  </span>
                </div>

                {/* Contribution 3: Written Memory */}
                <div className="p-3.5 rounded-xl bg-[#f7f7f8] border border-black/[0.04] flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="size-8 rounded-lg bg-neutral-200 text-[#181925] text-xs font-medium flex items-center justify-center shrink-0">
                      M
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-medium text-[#181925] truncate">Meena (Wife)</span>
                        <span className="text-[10px] text-[#888]">added a childhood story</span>
                      </div>
                      <p className="text-[11px] text-[#666] truncate">
                        “Fifty years of morning tea in the blue mugs”
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-[#777] bg-white px-2 py-0.5 rounded border border-black/[0.04] shrink-0">
                    Story
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Final Result Indicator */}
            <div className="p-3 rounded-xl bg-neutral-50 border border-black/[0.04] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-emerald-500" />
                <span className="font-mono text-[#181925]">theirs.page/{slug}</span>
              </div>
              <span className="text-[11px] text-[#888]">3 stories assembled with zero effort</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  )
}
