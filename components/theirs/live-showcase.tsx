"use client"

import { useState } from "react"
import { Play, Pause, Heart } from "lucide-react"

export function LiveShowcase() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [likes, setLikes] = useState(24)
  const [hasLiked, setHasLiked] = useState(false)

  const toggleLike = () => {
    if (hasLiked) {
      setLikes(likes - 1)
      setHasLiked(false)
    } else {
      setLikes(likes + 1)
      setHasLiked(true)
    }
  }

  return (
    <section id="sample" className="py-8 sm:py-12 px-4 max-w-5xl mx-auto">
      {/* Outer Clean Container: zero heavy shadow, subtle border */}
      <div className="rounded-md bg-[#f6f6f6] p-2 sm:p-4 border border-border/40">
        {/* Inner Card Window */}
        <div className="rounded-[28px] border border-border bg-card p-4 sm:p-8 shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
          {/* URL Pill Header */}
          <div className="flex items-center justify-between pb-6 border-b border-border/60">
            <div className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-[#ff5f57]" />
              <span className="size-2.5 rounded-full bg-[#febc2e]" />
              <span className="size-2.5 rounded-full bg-[#28c840]" />
            </div>

            <div className="px-3 py-1 rounded-full bg-[#f6f6f6] border border-border text-xs font-mono text-muted-foreground flex items-center gap-1">
              <span className="text-primary">theirs.page/</span>robert-carter
            </div>

            <div className="text-[11px] font-medium text-muted-foreground">
              Live memorial
            </div>
          </div>

          {/* Person Header */}
          <div className="pt-6 pb-8 border-b border-border/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="size-16 sm:size-20 rounded-2xl overflow-hidden bg-neutral-100 border border-border shrink-0">
                <img
                  src="/placeholder-user.jpg"
                  alt="Robert Carter"
                  className="w-full h-full object-cover grayscale"
                />
              </div>

              <div>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-xl sm:text-2xl font-medium tracking-tight text-[#454545]">
                    Robert Carter
                  </h3>
                  <span className="text-xs text-muted-foreground font-mono">1948 — 2026</span>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-md">
                  “He could fix almost anything, except his habit of telling the same joke twice.”
                </p>
                <div className="mt-2 flex items-center gap-2 text-[11px] text-muted-foreground/80">
                  <span>14 memories</span>
                  <span>·</span>
                  <span>42 photographs</span>
                  <span>·</span>
                  <span>9 contributors</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={toggleLike}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border bg-white text-xs font-medium text-[#454545] hover:bg-neutral-50 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
            >
              <Heart className={`size-3.5 ${hasLiked ? "fill-primary text-primary" : "text-muted-foreground"}`} />
              <span>Remembering ({likes})</span>
            </button>
          </div>

          {/* Living Fragments Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mt-6">
            {/* Story Card */}
            <div className="md:col-span-7 rounded-[24px] border border-border bg-[#f6f6f6] p-5 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-medium text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
                  Christmas 1994 · London
                </span>
                <p className="mt-3 text-sm text-[#454545] leading-relaxed">
                  “Dad couldn&apos;t walk past a broken appliance without trying to repair it. Once he spent half of Christmas Day fixing the neighbour&apos;s washing machine while everyone was waiting for dinner. He wouldn&apos;t leave until it spun without rattling.”
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-medium text-[#454545]">Anita Carter (Daughter)</span>
                <span className="text-[11px]">Approved by family</span>
              </div>
            </div>

            {/* Voicemail Card */}
            <div className="md:col-span-5 rounded-[24px] border border-border bg-[#f6f6f6] p-5 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-medium text-purple-600 bg-purple-100/60 px-2.5 py-0.5 rounded-full">
                  Voicemail recording · March 2014
                </span>
                <h4 className="mt-3 text-xs font-medium text-[#454545]">“Just checking your car tyres...”</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  14 seconds. You can hear his laugh right at the end.
                </p>
              </div>

              <div className="mt-4 p-2.5 rounded-xl border border-border bg-white flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="size-7 rounded-full bg-[#181925] text-white flex items-center justify-center hover:bg-primary transition-colors shrink-0"
                >
                  {isPlaying ? <Pause className="size-3" /> : <Play className="size-3 ml-0.5" />}
                </button>
                <div className="flex-1 flex items-center gap-0.5 h-4">
                  {[40, 65, 80, 45, 90, 100, 70, 85, 30, 60, 95, 75, 40, 80, 50, 35, 65, 90].map((h, i) => (
                    <span
                      key={i}
                      className={`flex-1 rounded-full ${
                        isPlaying ? "bg-primary animate-pulse" : i < 6 ? "bg-primary" : "bg-neutral-200"
                      }`}
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
                <span className="text-[10px] font-mono text-muted-foreground">0:14</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
