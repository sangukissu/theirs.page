"use client"

import { useState } from "react"
import { ArrowRight, Loader2, UserRound } from "lucide-react"

export function ProfileOnboarding({ onComplete }: { onComplete: (fullName: string) => void }) {
  const [fullName, setFullName] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    const cleanName = fullName.trim().replace(/\s+/g, " ")
    if (cleanName.length < 2) return
    setIsSaving(true)
    setError(null)
    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: cleanName }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || "Your name could not be saved.")
      onComplete(data.profile?.full_name || cleanName)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Your name could not be saved.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <section className="overflow-hidden rounded-3xl border border-black/[0.08] bg-white shadow-xs">
      <div className="h-1.5 bg-primary" />
      <div className="grid gap-7 p-6 sm:grid-cols-[1fr_0.9fr] sm:p-9">
        <div className="flex flex-col justify-center gap-4">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/8 text-primary">
            <UserRound className="size-5" />
          </div>
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">One small introduction</p>
            <h2 className="font-serif text-2xl font-medium tracking-tight text-[#181925]">What should we call you?</h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-[#666]">
            We use your real name for your Theirs profile and show it as the caretaker name on memorials you create. Your email remains private.
          </p>
        </div>

        <form onSubmit={submit} className="flex flex-col justify-center gap-3 rounded-2xl border border-black/[0.06] bg-[#fafafb] p-5">
          <label htmlFor="profile-full-name" className="text-xs font-medium text-[#181925]">Your real name</label>
          <input
            id="profile-full-name"
            type="text"
            required
            autoFocus
            autoComplete="name"
            maxLength={100}
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            placeholder="e.g. Anita Carter"
            className="rounded-xl border border-black/[0.09] bg-white px-4 py-2.5 text-sm text-[#181925] outline-none transition-colors placeholder:text-[#aaa] focus:border-primary/60"
          />
          <p className="text-[11px] leading-relaxed text-[#81838a]">You can use the name family and friends will recognise.</p>
          {error && <p className="text-xs font-medium text-rose-700">{error}</p>}
          <button
            type="submit"
            disabled={isSaving || fullName.trim().length < 2}
            className="mt-1 inline-flex h-10 items-center justify-center gap-2 rounded-full bg-primary px-5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-primary/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="size-3.5 animate-spin" /> : <ArrowRight className="size-3.5" />}
            <span>{isSaving ? "Saving..." : "Continue"}</span>
          </button>
        </form>
      </div>
    </section>
  )
}
