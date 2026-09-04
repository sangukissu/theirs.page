"use client"

import { useState, useRef, useEffect } from "react"
import { Play, Pause, Volume2, Mic, CheckCircle2 } from "lucide-react"

interface MemorialAudioProps {
  title?: string
  date?: string
  duration?: string
  transcript?: string
  note?: string
  audioSrc?: string
}

export function MemorialAudio({
  title = "“Checking your car tyres before you drive...”",
  date = "March 14, 2014",
  duration = "0:14",
  transcript = "“Hello darling, it’s Dad. Just ringing to make sure you put enough air in those front tyres before taking the motorway back to London. Give your mother a call when you get in.”",
  note = "Voicemail saved on Anita's phone. You can hear his soft chuckle right at the end.",
  audioSrc = "/music/scott-buckley-moonlight(chosic.com).mp3",
}: MemorialAudioProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentTimeStr, setCurrentTimeStr] = useState("0:00")
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return "0:00"
    const m = Math.floor(secs / 60)
    const s = Math.floor(secs % 60)
    return `${m}:${s < 10 ? "0" : ""}${s}`
  }

  const togglePlay = () => {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current.play().catch(() => {})
      setIsPlaying(true)
    }
  }

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !audioRef.current.duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const pct = Math.max(0, Math.min(1, clickX / rect.width))
    audioRef.current.currentTime = pct * audioRef.current.duration
  }

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleTimeUpdate = () => {
      if (!audio.duration) return
      const pct = (audio.currentTime / audio.duration) * 100
      setProgress(pct)
      setCurrentTimeStr(formatTime(audio.currentTime))
    }

    const handleEnded = () => {
      setIsPlaying(false)
      setProgress(0)
      setCurrentTimeStr("0:00")
    }

    audio.addEventListener("timeupdate", handleTimeUpdate)
    audio.addEventListener("ended", handleEnded)

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate)
      audio.removeEventListener("ended", handleEnded)
    }
  }, [])

  return (
    <section id="voice" className="py-8 sm:py-12 px-4 max-w-4xl mx-auto scroll-mt-24">
      {/* Hidden Native Audio Element */}
      <audio ref={audioRef} src={audioSrc} preload="metadata" />

      <div className="rounded-2xl sm:rounded-3xl bg-[#f7f7f8] border border-black/[0.06] p-6 sm:p-8 flex flex-col gap-5">
        
        {/* Header Ribbon */}
        <div className="flex items-center justify-between border-b border-black/[0.05] pb-3">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-primary" />
            <span className="text-xs font-semibold text-[#181925] uppercase tracking-wider">
              Preserved Voice Note
            </span>
          </div>

          <span className="text-[11px] font-mono text-[#888]">
            24-BIT UNCOMPRESSED
          </span>
        </div>

        {/* Audio Waveform Player Bar */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
            <h3 className="text-base sm:text-lg font-medium text-[#181925]">
              {title}
            </h3>
            <span className="text-xs font-mono text-[#888]">
              {date ? `${date} · ` : ""}{duration && duration !== "undefined" ? duration : "Voice note"}
            </span>
          </div>

          {/* Player Controls & Frequency Spectrum */}
          <div className="flex items-center gap-3.5 p-2 sm:p-2.5 rounded-2xl bg-white border border-black/[0.06] select-none">
            <button
              type="button"
              onClick={togglePlay}
              className="size-9 rounded-full bg-primary text-white flex items-center justify-center hover:opacity-90 active:scale-95 transition-all cursor-pointer shrink-0 shadow-xs"
              aria-label={isPlaying ? "Pause voice note" : "Play voice note"}
            >
              {isPlaying ? <Pause className="size-4 fill-white" /> : <Play className="size-4 ml-0.5 fill-white" />}
            </button>

            {/* 30-Bar Interactive Scrubber Frequency Waveform */}
            <div
              onClick={handleSeek}
              className="flex-1 flex items-center gap-[2.5px] h-7 cursor-pointer"
              title="Click to seek"
            >
              {[35, 55, 80, 100, 65, 45, 90, 75, 40, 85, 95, 60, 45, 75, 85, 40, 55, 80, 45, 90, 60, 40, 70, 95, 50, 35, 60, 85, 40, 25].map((h, i) => {
                const barPct = (i / 30) * 100
                const isFilled = barPct <= progress

                return (
                  <span
                    key={i}
                    className={`flex-1 rounded-full transition-all duration-150 ${
                      isFilled
                        ? "bg-primary"
                        : "bg-neutral-200"
                    } ${isPlaying && isFilled ? "animate-pulse" : ""}`}
                    style={{ height: `${h}%` }}
                  />
                )
              })}
            </div>

            <span className="text-xs font-mono text-[#777] shrink-0 tabular-nums">
              {isPlaying
                ? (duration && duration !== "undefined" ? `${currentTimeStr} / ${duration}` : currentTimeStr)
                : (duration && duration !== "undefined" ? duration : "Voice note")}
            </span>
          </div>
        </div>

        {/* Readable Transcript */}
        <div className="p-4 rounded-xl bg-white border border-black/[0.04] flex flex-col gap-1.5">
          <span className="text-[10px] font-mono text-[#888] uppercase tracking-wider">
            Spoken Transcript
          </span>
          <p className="text-xs sm:text-sm text-[#444] leading-relaxed italic">
            {transcript}
          </p>
        </div>

        {/* Note / Anecdote */}
        <div className="flex items-center gap-2 text-xs text-[#777]">
          <Mic className="size-3.5 text-primary shrink-0" />
          <span>{note}</span>
        </div>

      </div>
    </section>
  )
}
