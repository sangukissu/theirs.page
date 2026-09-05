"use client"

import { useState, useRef, useEffect } from "react"
import { Lock, ArrowRight, AlertCircle, Loader2 } from "lucide-react"

interface MemorialPinGateProps {
  fullName: string
  portraitUrl?: string | null
  slug: string
}

export function MemorialPinGate({ fullName, portraitUrl, slug }: MemorialPinGateProps) {
  const [pinDigits, setPinDigits] = useState(["", "", "", ""])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ]

  useEffect(() => {
    inputRefs[0].current?.focus()
  }, [])

  const handleChange = (index: number, val: string) => {
    // Only accept numeric input
    const clean = val.replace(/\D/g, "").slice(-1)
    const next = [...pinDigits]
    next[index] = clean
    setPinDigits(next)
    setError(null)

    if (clean && index < 3) {
      inputRefs[index + 1].current?.focus()
    }

    // If all 4 filled, automatically submit
    if (clean && index === 3 && next.every((d) => d !== "")) {
      submitPin(next.join(""))
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !pinDigits[index] && index > 0) {
      inputRefs[index - 1].current?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4)
    if (pasted) {
      const next = ["", "", "", ""]
      for (let i = 0; i < pasted.length; i++) {
        next[i] = pasted[i]
      }
      setPinDigits(next)
      if (pasted.length === 4) {
        submitPin(pasted)
      } else {
        inputRefs[Math.min(pasted.length, 3)].current?.focus()
      }
    }
  }

  const submitPin = async (pinString: string) => {
    if (pinString.length !== 4) {
      setError("Please enter the 4-digit PIN code.")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/memorials/${slug}/verify-pin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: pinString }),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        // Unlock cookie is set, reload page to view full content
        window.location.reload()
      } else {
        setError(data.error || "Incorrect PIN code. Please try again.")
        setPinDigits(["", "", "", ""])
        inputRefs[0].current?.focus()
      }
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const firstName = fullName.split(" ")[0] || fullName

  return (
    <main className="min-h-screen bg-[#fafafb] text-[#181925] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm flex flex-col items-center text-center gap-6 p-8 rounded-3xl bg-white border border-black/[0.07] shadow-xl">
        {/* Portrait / Monogram */}
        <div className="size-20 rounded-full bg-neutral-100 border border-black/[0.08] overflow-hidden flex items-center justify-center text-2xl font-serif font-medium text-[#181925] shadow-xs">
          {portraitUrl ? (
            <img
              src={portraitUrl}
              alt={fullName}
              className="size-full object-cover"
            />
          ) : (
            firstName.charAt(0)
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="inline-flex items-center justify-center gap-1.5 text-[11px] font-mono font-medium text-primary uppercase tracking-wider bg-primary/10 px-2.5 py-0.5 rounded-full mx-auto">
            <Lock className="size-3" />
            <span>Private Family Memorial</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-serif font-medium text-[#181925]">
            In Memory of {fullName}
          </h1>
          <p className="text-xs text-[#71717a] max-w-xs leading-relaxed mt-1">
            This memorial is private for close family and friends. Enter the 4-digit PIN code to enter.
          </p>
        </div>

        {/* 4-Box PIN Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault()
            submitPin(pinDigits.join(""))
          }}
          className="flex flex-col items-center gap-4 w-full"
        >
          <div className="flex items-center justify-center gap-3">
            {pinDigits.map((digit, idx) => (
              <input
                key={idx}
                ref={inputRefs[idx]}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                onPaste={handlePaste}
                className="size-12 rounded-xl bg-[#fafafb] border border-black/[0.12] text-center text-lg font-mono font-bold text-[#181925] outline-none focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/15 transition-all"
                disabled={loading}
              />
            ))}
          </div>

          {error && (
            <div className="flex items-center gap-1.5 text-xs text-rose-600 font-medium">
              <AlertCircle className="size-3.5" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || pinDigits.some((d) => d === "")}
            className="w-full mt-2 py-2.5 rounded-full bg-primary hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed text-primary-foreground text-xs font-medium transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            {loading ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <>
                <span>Enter Memorial</span>
                <ArrowRight className="size-3.5" />
              </>
            )}
          </button>
        </form>
      </div>

      <p className="mt-8 text-center text-xs text-[#888] font-mono">
        theirs.page/{slug}
      </p>
    </main>
  )
}
