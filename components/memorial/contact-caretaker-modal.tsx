"use client"

import { useEffect, useRef, useState } from "react"
import { AlertCircle, Check, Loader2, Mail, X } from "lucide-react"
import { Turnstile } from "@marsidev/react-turnstile"

interface ContactCaretakerModalProps {
  isOpen: boolean
  onClose: () => void
  memorialId: string
  memorialName: string
}

export function ContactCaretakerModal({ isOpen, onClose, memorialId, memorialName }: ContactCaretakerModalProps) {
  const [senderName, setSenderName] = useState("")
  const [senderEmail, setSenderEmail] = useState("")
  const [message, setMessage] = useState("")
  const [turnstileToken, setTurnstileToken] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [isSent, setIsSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const nameRef = useRef<HTMLInputElement>(null)
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "0x4AAAAAAElC6yv2vY7dR2dn"

  useEffect(() => {
    if (!isOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    window.setTimeout(() => nameRef.current?.focus(), 80)
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isSending) onClose()
    }
    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [isOpen, isSending, onClose])

  if (!isOpen) return null

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsSending(true)
    setError(null)
    try {
      const response = await fetch(`/api/memorials/${memorialId}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sender_name: senderName.trim(),
          sender_email: senderEmail.trim(),
          message: message.trim(),
          turnstile_token: turnstileToken,
        }),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.error || "Your message could not be sent.")
      setIsSent(true)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Your message could not be sent.")
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#181925]/45 p-4 backdrop-blur-[2px]" onMouseDown={(event) => event.target === event.currentTarget && !isSending && onClose()}>
      <div role="dialog" aria-modal="true" aria-labelledby="contact-caretaker-title" className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-black/[0.08] bg-white shadow-[0_28px_90px_rgba(24,25,37,0.24)]">
        <button type="button" aria-label="Close" onClick={onClose} disabled={isSending} className="absolute right-4 top-4 flex size-9 items-center justify-center rounded-full text-[#777] hover:bg-[#f4f4f6] hover:text-[#181925] disabled:opacity-50">
          <X className="size-5" />
        </button>

        {isSent ? (
          <div className="flex flex-col items-center px-7 py-12 text-center sm:px-10">
            <span className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Check className="size-7" /></span>
            <h2 id="contact-caretaker-title" className="font-serif text-2xl text-[#181925]">Your message has been sent</h2>
            <p className="mt-2 max-w-sm text-sm leading-6 text-[#686970]">The caretaker of {memorialName}&apos;s memorial can reply directly to the email address you provided.</p>
            <button type="button" onClick={onClose} className="mt-7 min-h-10 rounded-full bg-primary px-6 text-sm font-semibold text-white hover:bg-primary/90">Done</button>
          </div>
        ) : (
          <form onSubmit={submit} className="p-6 sm:p-8">
            <span className="mb-4 flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Mail className="size-5" /></span>
            <h2 id="contact-caretaker-title" className="pr-10 font-serif text-2xl text-[#181925]">Contact the memorial caretaker</h2>
            <p className="mt-2 text-sm leading-6 text-[#686970]">Send a private message about {memorialName}&apos;s memorial. It will never appear publicly.</p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="grid gap-1.5 text-xs font-medium text-[#55585c]">
                Your name
                <input ref={nameRef} required maxLength={100} value={senderName} onChange={(event) => setSenderName(event.target.value)} className="min-h-11 rounded-xl border border-black/[0.1] px-3.5 text-sm text-[#181925] outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" />
              </label>
              <label className="grid gap-1.5 text-xs font-medium text-[#55585c]">
                Your email
                <input type="email" required maxLength={254} value={senderEmail} onChange={(event) => setSenderEmail(event.target.value)} className="min-h-11 rounded-xl border border-black/[0.1] px-3.5 text-sm text-[#181925] outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" />
              </label>
            </div>
            <label className="mt-4 grid gap-1.5 text-xs font-medium text-[#55585c]">
              Message
              <textarea required minLength={10} maxLength={4000} rows={6} value={message} onChange={(event) => setMessage(event.target.value)} placeholder="How can the caretaker help?" className="resize-none rounded-xl border border-black/[0.1] px-3.5 py-3 text-sm leading-6 text-[#181925] outline-none placeholder:text-[#a1a1a6] focus:border-primary focus:ring-2 focus:ring-primary/10" />
            </label>

            {error && <p role="alert" className="mt-4 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700"><AlertCircle className="size-4 shrink-0" />{error}</p>}

            <div className="mt-5 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <Turnstile siteKey={siteKey} onSuccess={setTurnstileToken} onExpire={() => setTurnstileToken("")} onError={() => setTurnstileToken("")} />
              <button type="submit" disabled={isSending || !turnstileToken || !senderName.trim() || !senderEmail.trim() || message.trim().length < 10} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-white hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto">
                {isSending && <Loader2 className="size-4 animate-spin" />}
                {isSending ? "Sending…" : "Send privately"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
