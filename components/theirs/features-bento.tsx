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
  Video,
} from "lucide-react"

import { SectionHeader } from "@/components/theirs/section-header"

export function FeaturesBento() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [activePrivacy, setActivePrivacy] = useState<"public" | "unlisted" | "private">("private")

  return (
    <section id="features" className="w-full max-w-5xl px-5 mx-auto py-16 sm:py-24 flex flex-col gap-12">
      {/* Section Header */}
      <SectionHeader
        badge="The memorial"
        title="Everything about them, together in one place."
        description="From the stories only a sibling remembers to the voice note you never want to lose, every part of their memorial stays connected — and under your family’s control."
      />

      {/* Grid of Bento Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* =================================================================== */}
        {/* Large Card 01: Emotional Anchor — Remember together                 */}
        {/* =================================================================== */}
        <div className="flex flex-col bg-[#f7f7f8] rounded-2xl min-h-[560px] overflow-hidden border border-black/[0.04] justify-between">
          <div className="flex flex-col p-6 px-8 gap-3 items-start">
            <span className="w-10 h-9 rounded-full bg-white flex items-center justify-center border border-black/[0.06]">
              <Heart className="size-5 text-[#ff2f00]" />
            </span>

            <div className="flex flex-col gap-1 max-w-80">
              <h3 className="text-2xl/7 font-medium text-[#ff2f00]">
                Remember together
                <br />
                <span className="text-[#181925]">Everyone remembers a different part of them.</span>
              </h3>
            </div>

            <ul className="list-style-none flex flex-col gap-1.5 mt-1">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-[#ff2f00] shrink-0" />
                <span className="text-sm font-medium text-[#181925]">Invite family and friends with one link</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-[#ff2f00] shrink-0" />
                <span className="text-sm font-medium text-[#181925]">Every story, photo and recording stays attributed</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-[#ff2f00] shrink-0" />
                <span className="text-sm font-medium text-[#181925]">Approve contributions before they appear</span>
              </li>
            </ul>

            <a
              href="#how-it-works"
              className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-medium text-[#181925] border border-black/[0.06] hover:bg-neutral-50 transition-colors mt-2"
            >
              See how memories are shared
              <ChevronRight className="size-3 text-[#888]" />
            </a>
          </div>

          {/* Full-Height Contribution Feed (3 Real Relationships: Story, Photo+Caption, Voice) */}
          <div className="w-full h-[280px] relative overflow-hidden px-6 sm:px-8">
            <div
              className="flex flex-col w-full divide-y divide-black/[0.04]"
              style={{
                maskImage: "linear-gradient(to bottom, black 75%, transparent 100%)",
                WebkitMaskImage: "linear-gradient(to bottom, black 75%, transparent 100%)",
              }}
            >
              {/* Contribution 1: Anita · Daughter (Story) */}
              <div className="py-2.5 flex items-start gap-3">
                <div className="size-6 rounded-full bg-neutral-200/80 text-[11px] font-medium text-[#181925] flex items-center justify-center shrink-0 mt-0.5">
                  A
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-[#181925] truncate">Anita · Daughter</span>
                    <span className="text-[10px] font-mono text-[#888] shrink-0">Story · 2m ago</span>
                  </div>
                  <p className="text-xs text-[#666] leading-relaxed line-clamp-2 mt-0.5 font-serif italic">
                    “Dad spent half of Christmas Day fixing Mrs. Higgins&apos; washing machine while everyone was waiting for lunch.”
                  </p>
                </div>
              </div>

              {/* Contribution 2: David · Brother (Photograph + Caption) */}
              <div className="py-2.5 flex items-start gap-3">
                <div className="size-6 rounded-full bg-neutral-200/80 text-[11px] font-medium text-[#181925] flex items-center justify-center shrink-0 mt-0.5">
                  D
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-[#181925] truncate">David · Brother</span>
                    <span className="text-[10px] font-mono text-[#888] shrink-0">Photo · 14m ago</span>
                  </div>
                  <div className="flex items-center gap-2.5 mt-1">
                    <div className="size-10 rounded-md overflow-hidden bg-neutral-200 shrink-0 border border-black/[0.08]">
                      <img
                        src="/vintage-family-portraits-colorized.webp"
                        alt="Devon moors 1968"
                        className="size-full object-cover grayscale"
                      />
                    </div>
                    <p className="text-xs text-[#666] leading-relaxed line-clamp-2 italic font-serif">
                      “When we took the Morris Minor across the moors. Bob knew every shortcut through the fog.”
                    </p>
                  </div>
                </div>
              </div>

              {/* Contribution 3: Rahul · Grandson (Voice Note Waveform) */}
              <div className="py-2.5 flex items-start gap-3">
                <div className="size-6 rounded-full bg-neutral-200/80 text-[11px] font-medium text-[#181925] flex items-center justify-center shrink-0 mt-0.5">
                  R
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-[#181925] truncate">Rahul · Grandson</span>
                    <span className="text-[10px] font-mono text-primary shrink-0">Voice note · 1h ago</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between p-1.5 px-2 rounded-lg bg-white border border-black/[0.06]">
                    <div className="flex items-center gap-2 text-[11px] text-[#444]">
                      <Volume2 className="size-3 text-primary shrink-0" />
                      <span className="truncate italic">“How Grandad taught me chess...”</span>
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground shrink-0">0:14</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =================================================================== */}
        {/* Large Card 02: Their life                                           */}
        {/* =================================================================== */}
        <div className="flex flex-col bg-[#f7f7f8] rounded-2xl min-h-[560px] overflow-hidden border border-black/[0.04] justify-between">
          <div className="flex flex-col p-6 px-8 gap-3 items-start">
            <span className="w-10 h-9 rounded-full bg-white flex items-center justify-center border border-black/[0.06]">
              <Clock className="size-5 text-[#2c78fc]" />
            </span>

            <div className="flex flex-col gap-1 max-w-80">
              <h3 className="text-2xl/7 font-medium text-[#2c78fc]">
                Their life
                <br />
                <span className="text-[#181925]">Turn scattered memories into one life story.</span>
              </h3>
            </div>

            <ul className="list-style-none flex flex-col gap-1.5 mt-1">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-[#2c78fc] shrink-0" />
                <span className="text-sm font-medium text-[#181925]">Build their story from childhood onward</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-[#2c78fc] shrink-0" />
                <span className="text-sm font-medium text-[#181925]">Attach photos, stories and recordings to milestones</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-[#2c78fc] shrink-0" />
                <span className="text-sm font-medium text-[#181925]">Keep important people and moments connected</span>
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

          {/* Full-Height Chronological Life Journey Spine with Mixed Media Milestones */}
          <div className="w-full h-[280px] relative overflow-hidden px-6 sm:px-8">
            <div
              className="flex flex-col w-full relative pl-6 space-y-2.5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-black/[0.08]"
              style={{
                maskImage: "linear-gradient(to bottom, black 80%, transparent 100%)",
                WebkitMaskImage: "linear-gradient(to bottom, black 80%, transparent 100%)",
              }}
            >
              {/* 1952 Born */}
              <div className="relative flex items-center justify-between text-xs py-0.5">
                <span className="absolute -left-[19px] size-2 rounded-full bg-[#2c78fc] ring-4 ring-[#f7f7f8]" />
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-semibold text-[#2c78fc]">1952</span>
                  <span className="font-medium text-[#181925]">Born in Exeter, Devon</span>
                </div>
                <span className="text-[10px] font-mono text-[#888]">Childhood</span>
              </div>

              {/* 1968 Apprenticeship + Photo */}
              <div className="relative flex items-center justify-between text-xs py-0.5">
                <span className="absolute -left-[19px] size-2 rounded-full bg-[#2c78fc] ring-4 ring-[#f7f7f8]" />
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-semibold text-[#2c78fc]">1968</span>
                  <span className="font-medium text-[#181925]">Horology Apprenticeship</span>
                </div>
                <span className="text-[10px] font-mono text-neutral-600 bg-white border border-black/[0.06] px-1.5 py-0.5 rounded">
                  + photo
                </span>
              </div>

              {/* 1974 Married Meena + Story */}
              <div className="relative flex items-center justify-between text-xs py-0.5">
                <span className="absolute -left-[19px] size-2 rounded-full bg-[#2c78fc] ring-4 ring-[#f7f7f8]" />
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-semibold text-[#2c78fc]">1974</span>
                  <span className="font-medium text-[#181925]">Married Meena at St. Jude’s</span>
                </div>
                <span className="text-[10px] font-mono text-neutral-600 bg-white border border-black/[0.06] px-1.5 py-0.5 rounded">
                  + story
                </span>
              </div>

              {/* 1983 Opened workshop + Voice */}
              <div className="relative flex items-center justify-between text-xs py-0.5">
                <span className="absolute -left-[19px] size-2 rounded-full bg-[#2c78fc] ring-4 ring-[#f7f7f8]" />
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-semibold text-[#2c78fc]">1983</span>
                  <span className="font-medium text-[#181925]">Opened Carter Workshop</span>
                </div>
                <span className="text-[10px] font-mono text-primary bg-white border border-black/[0.06] px-1.5 py-0.5 rounded">
                  + voice
                </span>
              </div>

              {/* 2004 Granddaughter born */}
              <div className="relative flex items-center justify-between text-xs py-0.5">
                <span className="absolute -left-[19px] size-2 rounded-full bg-[#2c78fc] ring-4 ring-[#f7f7f8]" />
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-semibold text-[#2c78fc]">2004</span>
                  <span className="font-medium text-[#181925]">Welcomed Granddaughter Anita</span>
                </div>
                <span className="text-[10px] font-mono text-[#888]">Family</span>
              </div>
            </div>
          </div>
        </div>

        {/* =================================================================== */}
        {/* Large Card 03: Photos, video & voice                                */}
        {/* =================================================================== */}
        <div className="flex flex-col bg-[#f7f7f8] rounded-2xl min-h-[560px] overflow-hidden border border-black/[0.04] justify-between">
          <div className="flex flex-col p-6 px-8 gap-3 items-start">
            <span className="w-10 h-9 rounded-full bg-white flex items-center justify-center border border-black/[0.06]">
              <Mic className="size-5 text-primary" />
            </span>

            <div className="flex flex-col gap-1 max-w-80">
              <h3 className="text-2xl/7 font-medium text-primary">
                Photos, video & voice
                <br />
                <span className="text-[#181925]">Keep the photos, videos and voices you treasure.</span>
              </h3>
            </div>

            <ul className="list-style-none flex flex-col gap-1.5 mt-1">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-primary shrink-0" />
                <span className="text-sm font-medium text-[#181925]">Original files stay preserved untouched</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-primary shrink-0" />
                <span className="text-sm font-medium text-[#181925]">Play photos, video and voice inside the memorial</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-primary shrink-0" />
                <span className="text-sm font-medium text-[#181925]">Download the originals whenever you need them</span>
              </li>
            </ul>

            <a
              href="#how-it-works"
              className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-medium text-[#181925] border border-black/[0.06] hover:bg-neutral-50 transition-colors mt-2"
            >
              Listen to a voice note
              <ChevronRight className="size-3 text-[#888]" />
            </a>
          </div>

          {/* Full-Height Integrated Audio Player & Uncompressed Original Vault */}
          <div className="w-full h-[280px] relative overflow-hidden px-6 sm:px-8 flex flex-col justify-between pb-6">
            {/* Voicemail Audio Player */}
            <div className="p-3.5 rounded-xl bg-white border border-black/[0.06] flex flex-col gap-2">
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

            {/* Quiet Original Media Preservation Proof (Photograph, Home-Video, Voicemail) */}
            <div className="flex flex-col divide-y divide-black/[0.04] pt-1">
              <div className="py-1.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <FileImage className="size-3.5 text-[#888]" />
                  <span className="font-mono text-[#181925]">portrait_original.jpg</span>
                </div>
                <span className="font-mono text-[11px] text-[#888]">4032 × 3024 · 24.8 MB</span>
              </div>
              <div className="py-1.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Video className="size-3.5 text-[#888]" />
                  <span className="font-mono text-[#181925]">garden_summer_1998.mp4</span>
                </div>
                <span className="font-mono text-[11px] text-[#888]">1080p · 142 MB</span>
              </div>
              <div className="py-1.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <FileAudio className="size-3.5 text-[#888]" />
                  <span className="font-mono text-[#181925]">voicemail_march2014.wav</span>
                </div>
                <span className="font-mono text-[11px] text-[#888]">24-bit 96kHz · 18.2 MB</span>
              </div>
            </div>
          </div>
        </div>

        {/* =================================================================== */}
        {/* Large Card 04: Family continuity                                    */}
        {/* =================================================================== */}
        <div className="flex flex-col bg-[#f7f7f8] rounded-2xl min-h-[560px] overflow-hidden border border-black/[0.04] justify-between">
          <div className="flex flex-col p-6 px-8 gap-3 items-start">
            <span className="w-10 h-9 rounded-full bg-white flex items-center justify-center border border-black/[0.06]">
              <ShieldCheck className="size-5 text-[#ffa600]" />
            </span>

            <div className="flex flex-col gap-1 max-w-80">
              <h3 className="text-2xl/7 font-medium text-[#ffa600]">
                Family continuity
                <br />
                <span className="text-[#181925]">Someone you trust can always look after it.</span>
              </h3>
            </div>

            <ul className="list-style-none flex flex-col gap-1.5 mt-1">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-[#ffa600] shrink-0" />
                <span className="text-sm font-medium text-[#181925]">Choose a family member to take over if needed</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-[#ffa600] shrink-0" />
                <span className="text-sm font-medium text-[#181925]">Pass control without losing anything</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-[#ffa600] shrink-0" />
                <span className="text-sm font-medium text-[#181925]">Keep the memorial cared for over time</span>
              </li>
            </ul>

            <a
              href="#how-it-works"
              className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-medium text-[#181925] border border-black/[0.06] hover:bg-neutral-50 transition-colors mt-2"
            >
              How family access works
              <ChevronRight className="size-3 text-[#888]" />
            </a>
          </div>

          {/* ONE Unified Archival Family Continuity Panel (Zero nested boxes, zero pills) */}
          <div className="w-full h-[280px] relative overflow-hidden px-6 sm:px-8 flex flex-col justify-between pb-6">
            <div className="h-full rounded-2xl bg-white border border-black/[0.08] p-5 flex flex-col justify-between text-left">
              
              {/* Top: Generational Caretaker Bridge */}
              <div className="flex items-center justify-between pb-3.5 border-b border-black/[0.06]">
                <div className="flex flex-col">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
                    Current caretaker
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="size-1.5 rounded-full bg-emerald-500" />
                    <span className="text-xs font-medium text-[#181925]">You</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 px-2 text-neutral-300">
                  <span className="h-px w-6 sm:w-10 bg-neutral-200" />
                  <span className="text-xs text-neutral-400">→</span>
                  <span className="h-px w-6 sm:w-10 bg-neutral-200" />
                </div>

                <div className="flex flex-col text-right">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
                    Next caretaker
                  </span>
                  <div className="flex items-center justify-end gap-1.5 mt-0.5">
                    <span className="text-xs font-medium text-[#181925]">Anita Carter</span>
                    <span className="size-1.5 rounded-full bg-[#ffa600]" />
                  </div>
                </div>
              </div>

              {/* Middle: Clean Family Preservation Registry (No boxes, pure editorial typography) */}
              <div className="py-2 flex flex-col gap-1.5">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs font-medium text-[#181925]">
                    Your family can download everything
                  </span>
                  <span className="text-[10px] font-mono text-neutral-400">
                    Full archive
                  </span>
                </div>

                <p className="text-xs text-neutral-500 leading-relaxed font-serif italic">
                  Photographs · Family stories · Audio recordings · Home videos · Complete timeline
                </p>
              </div>

              {/* Bottom: Single Clean Download Action & Guarantee */}
              <div className="pt-3 border-t border-black/[0.06] flex items-center justify-between">
                <span className="text-xs font-medium text-primary hover:underline cursor-pointer flex items-center gap-1">
                  Download family archive ↓
                </span>
                <span className="text-[11px] font-mono text-neutral-400">
                  Download anytime
                </span>
              </div>

            </div>
          </div>
        </div>

        {/* =================================================================== */}
        {/* Bottom Row: 2 Compact Cards (Privacy & Ownership / Export)          */}
        {/* =================================================================== */}
        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Compact Card 05: Privacy */}
          <div className="bg-[#f7f7f8] rounded-2xl border border-black/[0.04] p-6 px-8 flex flex-col justify-between gap-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex flex-col gap-1 max-w-72">
                <h3 className="text-lg font-medium text-[#181925]">You control who can see it.</h3>
                <p className="text-sm text-[#666]">
                  Make the memorial public, keep it unlisted for people with the link, or restrict it to invited family.
                </p>
              </div>

              {/* Segmented Control: Public · Unlisted · Private */}
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
                  onClick={() => setActivePrivacy("private")}
                  className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                    activePrivacy === "private"
                      ? "bg-white text-[#181925]"
                      : "text-[#71717a] hover:text-[#181925]"
                  }`}
                >
                  <Lock className="size-3 text-primary" />
                  <span>Private</span>
                </button>
              </div>
            </div>
          </div>

          {/* Compact Card 06: Ownership / Export */}
          <div className="bg-[#f7f7f8] rounded-2xl border border-black/[0.04] p-6 px-8 flex justify-between items-center gap-4">
            <div className="flex flex-col gap-1 max-w-72">
              <h3 className="text-lg font-medium text-[#181925]">Take the whole memorial with you.</h3>
              <p className="text-sm text-[#666]">
                Export the originals, stories, voice notes and memorial data together in one family archive.
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
