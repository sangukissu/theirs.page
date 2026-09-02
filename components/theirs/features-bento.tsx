"use client"

import { useState } from "react"
import {
  Heart,
  Clock,
  Mic,
  ShieldCheck,
  Lock,
  Play,
  Pause,
  ChevronRight,
  CheckCircle2,
  Volume2,
  FileCode,
  Folder,
  FileText,
  FileAudio,
  FileImage,
} from "lucide-react"

import { SectionHeader } from "@/components/theirs/section-header"

export function FeaturesBento() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [activePrivacy, setActivePrivacy] = useState<"public" | "unlisted" | "pin">("pin")

  return (
    <section id="features" className="w-full max-w-5xl px-5 mx-auto py-16 sm:py-24 flex flex-col gap-12">
      {/* Section Header */}
      <SectionHeader
        badge="Features"
        title="Everything needed to preserve who they were"
        description="From intimate voicemails to childhood stories, assemble the complete texture of a human life."
      />

      {/* Grid of Bento Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Card 1: Collaborative Storytelling (Rose Accent) */}
        <div className="flex flex-col bg-[#f7f7f8] rounded-2xl min-h-[560px] overflow-hidden border border-black/[0.04] justify-between">
          <div className="flex flex-col p-6 px-8 gap-3 items-start">
            <span className="w-10 h-9 rounded-full bg-white flex items-center justify-center border border-black/[0.06]">
              <Heart className="size-5 text-[#ff2f00]" />
            </span>

            <div className="flex flex-col gap-1 max-w-80">
              <h3 className="text-2xl/7 font-medium text-[#ff2f00]">
                Collaborative memories
                <br />
                <span className="text-[#181925]">Hear stories no single person could know alone.</span>
              </h3>
            </div>

            <ul className="list-style-none flex flex-col gap-1.5 mt-1">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-[#ff2f00] shrink-0" />
                <span className="text-sm font-medium text-[#181925]">Zero sign-up required for family & friends</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-[#ff2f00] shrink-0" />
                <span className="text-sm font-medium text-[#181925]">Private approval queue before anything goes live</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-[#ff2f00] shrink-0" />
                <span className="text-sm font-medium text-[#181925]">Attached photos, voice notes, and places</span>
              </li>
            </ul>

            <a
              href="#how-it-works"
              className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-medium text-[#181925] border border-black/[0.06] hover:bg-neutral-50 transition-colors mt-2"
            >
              See how memories arrive
              <ChevronRight className="size-3 text-[#888]" />
            </a>
          </div>

          {/* Full-Height Streaming Contribution Feed (Zero Dead Space, Zero Shadows, Fades Naturally) */}
          <div className="w-full h-[280px] relative overflow-hidden px-6 sm:px-8">
            <div
              className="flex flex-col w-full divide-y divide-black/[0.04]"
              style={{
                maskImage: "linear-gradient(to bottom, black 70%, transparent 100%)",
                WebkitMaskImage: "linear-gradient(to bottom, black 70%, transparent 100%)",
              }}
            >
              <div className="py-2.5 flex items-start gap-3">
                <div className="size-6 rounded-full bg-neutral-200/80 text-[11px] font-medium text-[#181925] flex items-center justify-center shrink-0 mt-0.5">
                  A
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-[#181925] truncate">Anita Carter (Daughter)</span>
                    <span className="text-[11px] text-[#888] shrink-0">London · 2m</span>
                  </div>
                  <p className="text-xs text-[#666] leading-relaxed line-clamp-2 mt-0.5">
                    “Dad spent half of Christmas Day fixing Mrs. Higgins&apos; washing machine while everyone was waiting for lunch.”
                  </p>
                </div>
              </div>

              <div className="py-2.5 flex items-start gap-3">
                <div className="size-6 rounded-full bg-neutral-200/80 text-[11px] font-medium text-[#181925] flex items-center justify-center shrink-0 mt-0.5">
                  D
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-[#181925] truncate">Uncle David (Brother)</span>
                    <span className="text-[11px] text-[#888] shrink-0">Toronto · 14m</span>
                  </div>
                  <p className="text-xs text-[#666] leading-relaxed line-clamp-2 mt-0.5">
                    “When we took the Morris Minor across the moors without telling Grandad. Bob knew every shortcut through the fog.”
                  </p>
                </div>
              </div>

              <div className="py-2.5 flex items-start gap-3">
                <div className="size-6 rounded-full bg-neutral-200/80 text-[11px] font-medium text-[#181925] flex items-center justify-center shrink-0 mt-0.5">
                  R
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-[#181925] truncate">Rahul Carter (Grandson)</span>
                    <span className="text-[11px] text-[#888] shrink-0">Jaipur · 1h</span>
                  </div>
                  <p className="text-xs text-[#666] leading-relaxed line-clamp-2 mt-0.5">
                    “He taught me how to play chess on his back porch using carved teak pieces he brought from India.”
                  </p>
                </div>
              </div>

              <div className="py-2.5 flex items-start gap-3">
                <div className="size-6 rounded-full bg-neutral-200/80 text-[11px] font-medium text-[#181925] flex items-center justify-center shrink-0 mt-0.5">
                  S
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-[#181925] truncate">Sarah Jenkins (Colleague)</span>
                    <span className="text-[11px] text-[#888] shrink-0">Oxford · 3h</span>
                  </div>
                  <p className="text-xs text-[#666] leading-relaxed line-clamp-2 mt-0.5">
                    “Thirty years at the workshop and I never once heard him raise his voice. A master of patience.”
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Life Timeline (Sky Blue Accent) */}
        <div className="flex flex-col bg-[#f7f7f8] rounded-2xl min-h-[560px] overflow-hidden border border-black/[0.04] justify-between">
          <div className="flex flex-col p-6 px-8 gap-3 items-start">
            <span className="w-10 h-9 rounded-full bg-white flex items-center justify-center border border-black/[0.06]">
              <Clock className="size-5 text-[#2c78fc]" />
            </span>

            <div className="flex flex-col gap-1 max-w-80">
              <h3 className="text-2xl/7 font-medium text-[#2c78fc]">
                Life timeline
                <br />
                <span className="text-[#181925]">Anchor every story to the year it happened.</span>
              </h3>
            </div>

            <ul className="list-style-none flex flex-col gap-1.5 mt-1">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-[#2c78fc] shrink-0" />
                <span className="text-sm font-medium text-[#181925]">Childhood to late years in sequential chapters</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-[#2c78fc] shrink-0" />
                <span className="text-sm font-medium text-[#181925]">Attach photographs and voice notes to milestones</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-[#2c78fc] shrink-0" />
                <span className="text-sm font-medium text-[#181925]">Never leaves visitors lost in an unorganized feed</span>
              </li>
            </ul>

            <a
              href="#how-it-works"
              className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-medium text-[#181925] border border-black/[0.06] hover:bg-neutral-50 transition-colors mt-2"
            >
              Explore the timeline
              <ChevronRight className="size-3 text-[#888]" />
            </a>
          </div>

          {/* Full-Height Chronological Life Journey Spine (Zero Dead Space, Zero Shadows) */}
          <div className="w-full h-[280px] relative overflow-hidden px-6 sm:px-8">
            <div
              className="flex flex-col w-full relative pl-6 space-y-3 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-black/[0.08]"
              style={{
                maskImage: "linear-gradient(to bottom, black 75%, transparent 100%)",
                WebkitMaskImage: "linear-gradient(to bottom, black 75%, transparent 100%)",
              }}
            >
              <div className="relative flex items-center justify-between text-xs py-1">
                <span className="absolute -left-[19px] size-2 rounded-full bg-[#2c78fc] ring-4 ring-[#f7f7f8]" />
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-xs font-semibold text-[#2c78fc]">1952</span>
                  <span className="font-medium text-[#181925]">Born in Jaipur, Rajasthan</span>
                </div>
                <span className="text-[11px] text-[#888] font-mono">Chapter I</span>
              </div>

              <div className="relative flex items-center justify-between text-xs py-1">
                <span className="absolute -left-[19px] size-2 rounded-full bg-[#2c78fc] ring-4 ring-[#f7f7f8]" />
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-xs font-semibold text-[#2c78fc]">1968</span>
                  <span className="font-medium text-[#181925]">Apprenticeship under Master Lal</span>
                </div>
                <span className="text-[11px] text-[#888] font-mono">Chapter II</span>
              </div>

              <div className="relative flex items-center justify-between text-xs py-1">
                <span className="absolute -left-[19px] size-2 rounded-full bg-[#2c78fc] ring-4 ring-[#f7f7f8]" />
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-xs font-semibold text-[#2c78fc]">1974</span>
                  <span className="font-medium text-[#181925]">Married Meena at St. Jude&apos;s</span>
                </div>
                <span className="text-[11px] text-[#888] font-mono">Chapter III</span>
              </div>

              <div className="relative flex items-center justify-between text-xs py-1">
                <span className="absolute -left-[19px] size-2 rounded-full bg-[#2c78fc] ring-4 ring-[#f7f7f8]" />
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-xs font-semibold text-[#2c78fc]">1983</span>
                  <span className="font-medium text-[#181925]">Founded Carter Workshop</span>
                </div>
                <span className="text-[11px] text-[#888] font-mono">Chapter IV</span>
              </div>

              <div className="relative flex items-center justify-between text-xs py-1">
                <span className="absolute -left-[19px] size-2 rounded-full bg-[#2c78fc] ring-4 ring-[#f7f7f8]" />
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-xs font-semibold text-[#2c78fc]">2004</span>
                  <span className="font-medium text-[#181925]">Welcomed Granddaughter Anita</span>
                </div>
                <span className="text-[11px] text-[#888] font-mono">Chapter V</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Voice & Original 4K (Primary Accent) */}
        <div className="flex flex-col bg-[#f7f7f8] rounded-2xl min-h-[560px] overflow-hidden border border-black/[0.04] justify-between">
          <div className="flex flex-col p-6 px-8 gap-3 items-start">
            <span className="w-10 h-9 rounded-full bg-white flex items-center justify-center border border-black/[0.06]">
              <Mic className="size-5 text-primary" />
            </span>

            <div className="flex flex-col gap-1 max-w-80">
              <h3 className="text-2xl/7 font-medium text-primary">
                Voices & original 4K
                <br />
                <span className="text-[#181925]">Hear their laugh again in uncompressed clarity.</span>
              </h3>
            </div>

            <ul className="list-style-none flex flex-col gap-1.5 mt-1">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-primary shrink-0" />
                <span className="text-sm font-medium text-[#181925]">Original high-resolution files preserved untouched</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-primary shrink-0" />
                <span className="text-sm font-medium text-[#181925]">Audio voicemail & voice note waveform player</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-primary shrink-0" />
                <span className="text-sm font-medium text-[#181925]">No social media compression or image blurring</span>
              </li>
            </ul>

            <a
              href="#how-it-works"
              className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-medium text-[#181925] border border-black/[0.06] hover:bg-neutral-50 transition-colors mt-2"
            >
              Listen to audio sample
              <ChevronRight className="size-3 text-[#888]" />
            </a>
          </div>

          {/* Full-Height Integrated Audio Player & Uncompressed Vault (Zero Dead Space, Zero Shadows) */}
          <div className="w-full h-[280px] relative overflow-hidden px-6 sm:px-8 flex flex-col justify-between pb-6">
            {/* Studio Audio Player Bar */}
            <div className="p-3.5 rounded-xl bg-white border border-black/[0.06] flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Volume2 className="size-3.5 text-primary" />
                  <span className="text-xs font-medium text-[#181925]">“Checking your car tyres...”</span>
                </div>
                <span className="text-[11px] font-mono text-[#888]">Voicemail · 2014</span>
              </div>

              <div className="flex items-center gap-3 p-1.5 rounded-lg bg-neutral-50 border border-black/[0.04]">
                <button
                  type="button"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="size-7 rounded-full bg-primary text-white flex items-center justify-center hover:opacity-90 transition-opacity cursor-pointer shrink-0"
                  aria-label={isPlaying ? "Pause audio" : "Play audio"}
                >
                  {isPlaying ? <Pause className="size-3" /> : <Play className="size-3 ml-0.5" />}
                </button>

                <div className="flex-1 flex items-center gap-[2px] h-5">
                  {[35, 55, 80, 100, 65, 45, 90, 75, 40, 85, 95, 60, 45, 75, 85, 40, 55, 80, 45, 90, 60, 40, 70, 95, 50, 35, 60, 80, 45, 30].map((h, i) => (
                    <span
                      key={i}
                      className={`flex-1 rounded-full transition-all duration-150 ${
                        isPlaying
                          ? "bg-primary animate-pulse"
                          : i < 11
                          ? "bg-primary"
                          : "bg-neutral-200"
                      }`}
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>

                <span className="text-[11px] font-mono text-[#888] tabular-nums">0:14</span>
              </div>
            </div>

            {/* Clean Monospace Media Vault List (Zero Shadows) */}
            <div className="flex flex-col divide-y divide-black/[0.04] pt-1">
              <div className="py-2 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <FileImage className="size-3.5 text-[#888]" />
                  <span className="font-mono text-[#181925]">portrait_original.jpg</span>
                </div>
                <span className="font-mono text-[11px] text-[#888]">4032 × 3024 · 24.8 MB</span>
              </div>
              <div className="py-2 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <FileAudio className="size-3.5 text-[#888]" />
                  <span className="font-mono text-[#181925]">voicemail_march2014.wav</span>
                </div>
                <span className="font-mono text-[11px] text-[#888]">24-bit 96kHz · 18.2 MB</span>
              </div>
              <div className="py-2 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <FileImage className="size-3.5 text-[#888]" />
                  <span className="font-mono text-[#181925]">wedding_1974_film.tiff</span>
                </div>
                <span className="font-mono text-[11px] text-[#888]">6000 × 4000 · 68.4 MB</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: Successor Stewardship (Amber Accent) */}
        <div className="flex flex-col bg-[#f7f7f8] rounded-2xl min-h-[560px] overflow-hidden border border-black/[0.04] justify-between">
          <div className="flex flex-col p-6 px-8 gap-3 items-start">
            <span className="w-10 h-9 rounded-full bg-white flex items-center justify-center border border-black/[0.06]">
              <ShieldCheck className="size-5 text-[#ffa600]" />
            </span>

            <div className="flex flex-col gap-1 max-w-80">
              <h3 className="text-2xl/7 font-medium text-[#ffa600]">
                Successor stewardship
                <br />
                <span className="text-[#181925]">A memorial built to outlive us all.</span>
              </h3>
            </div>

            <ul className="list-style-none flex flex-col gap-1.5 mt-1">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-[#ffa600] shrink-0" />
                <span className="text-sm font-medium text-[#181925]">Nominate a successor caretaker across generations</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-[#ffa600] shrink-0" />
                <span className="text-sm font-medium text-[#181925]">One-time lifetime preservation (no subscription lock-in)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-[#ffa600] shrink-0" />
                <span className="text-sm font-medium text-[#181925]">Download full offline archive at any moment</span>
              </li>
            </ul>

            <a
              href="#pricing"
              className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-medium text-[#181925] border border-black/[0.06] hover:bg-neutral-50 transition-colors mt-2"
            >
              See preservation promise
              <ChevronRight className="size-3 text-[#888]" />
            </a>
          </div>

          {/* Full-Height Archival File Package Tree (Zero Dead Space, Zero Shadows) */}
          <div className="w-full h-[280px] relative overflow-hidden px-6 sm:px-8 flex flex-col justify-between pb-6">
            <div className="p-3 rounded-xl bg-white border border-black/[0.06] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-emerald-500" />
                <span className="font-medium text-[#181925]">Primary: You</span>
              </div>
              <span className="text-[#888]">→</span>
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-[#ffa600]" />
                <span className="font-medium text-[#181925]">Successor: Anita Carter</span>
              </div>
            </div>

            {/* Monospace Self-Contained Archive Tree */}
            <div className="p-3 rounded-xl bg-neutral-900 text-neutral-300 font-mono text-[11px] leading-relaxed flex flex-col gap-1">
              <div className="flex items-center gap-2 text-white font-medium">
                <Folder className="size-3.5 text-neutral-400" />
                <span>theirs-robert-carter-archive.zip (1.25 GB)</span>
              </div>
              <div className="pl-4 text-neutral-400">
                ├── 📁 photos/ <span className="text-neutral-500">(42 uncompressed RAW)</span>
              </div>
              <div className="pl-4 text-neutral-400">
                ├── 📁 voice/ <span className="text-neutral-500">(3 studio voicemails)</span>
              </div>
              <div className="pl-4 text-emerald-400">
                ├── 📄 memorial.html <span className="text-neutral-500">(offline standalone reader)</span>
              </div>
              <div className="pl-4 text-neutral-400">
                └── 📄 timeline.json <span className="text-neutral-500">(open structured data)</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-[#888] px-1">
              <span>SHA-256 Checksum Verified</span>
              <span>100% Offline Capable</span>
            </div>
          </div>
        </div>

        {/* Bottom Row: 2 Compact Cards */}
        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Privacy Card with Minimalist Segmented Switch (Zero Shadows) */}
          <div className="bg-[#f7f7f8] rounded-2xl border border-black/[0.04] p-6 px-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex flex-col gap-1 max-w-72">
              <h3 className="text-lg font-medium text-[#181925]">Three privacy tiers</h3>
              <p className="text-sm text-[#666]">
                Public for old friends to discover, unlisted for family chats, or PIN-protected for absolute intimacy.
              </p>
            </div>

            <div className="inline-flex p-1 rounded-full bg-neutral-200/70 border border-black/5 gap-1 shrink-0 self-stretch sm:self-auto justify-center">
              <button
                type="button"
                onClick={() => setActivePrivacy("public")}
                className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors cursor-pointer ${
                  activePrivacy === "public"
                    ? "bg-white text-[#181925]"
                    : "text-[#71717a] hover:text-[#181925]"
                }`}
              >
                Public
              </button>
              <button
                type="button"
                onClick={() => setActivePrivacy("unlisted")}
                className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors cursor-pointer ${
                  activePrivacy === "unlisted"
                    ? "bg-white text-[#181925]"
                    : "text-[#71717a] hover:text-[#181925]"
                }`}
              >
                Unlisted
              </button>
              <button
                type="button"
                onClick={() => setActivePrivacy("pin")}
                className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                  activePrivacy === "pin"
                    ? "bg-white text-[#181925]"
                    : "text-[#71717a] hover:text-[#181925]"
                }`}
              >
                <Lock className="size-3 text-primary" />
                <span>PIN: 4829</span>
              </button>
            </div>
          </div>

          {/* Zero Lock-In Card (Zero Shadows) */}
          <div className="bg-[#f7f7f8] rounded-2xl border border-black/[0.04] p-6 px-8 flex justify-between items-center gap-4">
            <div className="flex flex-col gap-1 max-w-72">
              <h3 className="text-lg font-medium text-[#181925]">Zero grief lock-in</h3>
              <p className="text-sm text-[#666]">
                Export every photograph, voicemail, and story in 1 click anytime. We never hold memories hostage.
              </p>
            </div>

            <div className="flex items-center gap-2 p-2 px-3 rounded-xl bg-white border border-black/[0.06] shrink-0">
              <FileCode className="size-4 text-primary" />
              <div className="flex flex-col">
                <span className="text-xs font-mono font-medium text-[#181925]">archive.zip</span>
                <span className="text-[10px] text-[#888]">1-Click Export</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}
