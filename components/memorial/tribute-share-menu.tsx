"use client"

import { useEffect, useRef, useState } from "react"
import { Check, Link2, Mail, Share2 } from "lucide-react"

interface TributeShareMenuProps {
  tributeId: string
  authorName: string
  memorialName: string
}

function FacebookMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4">
      <path fill="currentColor" d="M14.1 8.5V6.8c0-.8.5-1 1-1h2.5V2.1L14.2 2C10.8 2 9.6 4 9.6 6.4v2.1H7v4h2.6V22h4.5v-9.5h3l.5-4h-3.5Z" />
    </svg>
  )
}

function WhatsAppMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4">
      <path fill="currentColor" d="M12 2a9.7 9.7 0 0 0-8.4 14.6L2.3 22l5.6-1.2A9.8 9.8 0 1 0 12 2Zm0 17.6c-1.4 0-2.8-.4-4-1.1l-.3-.2-3.3.7.8-3.2-.2-.3A7.7 7.7 0 1 1 12 19.6Zm4.2-5.7c-.2-.1-1.4-.7-1.6-.8-.2-.1-.4-.1-.6.1l-.7.9c-.1.2-.3.2-.5.1-1.5-.7-2.6-1.6-3.4-3-.3-.5.3-.5.8-1.5.1-.2 0-.4 0-.5l-.7-1.7c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.3.3-1 1-1 2.4 0 1.4 1 2.7 1.2 2.9.1.2 2 3.1 5 4.3 1.9.8 2.7.9 3.7.7.6-.1 1.4-.6 1.6-1.1.2-.6.2-1 .1-1.1-.1-.2-.3-.2-.5-.3Z" />
    </svg>
  )
}

export function TributeShareMenu({ tributeId, authorName, memorialName }: TributeShareMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setIsOpen(false)
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false)
    }
    document.addEventListener("pointerdown", closeOnOutsideClick)
    document.addEventListener("keydown", closeOnEscape)
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick)
      document.removeEventListener("keydown", closeOnEscape)
    }
  }, [isOpen])

  const getShareDetails = () => {
    const base = window.location.href.split("#")[0]
    const url = `${base}#tribute-${encodeURIComponent(tributeId)}`
    const text = `${authorName} shared a tribute in memory of ${memorialName}.`
    return { url, text }
  }

  const copyLink = async () => {
    const { url } = getShareDetails()
    await navigator.clipboard.writeText(url)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2200)
  }

  const openShareUrl = (provider: "facebook" | "whatsapp" | "email") => {
    const { url, text } = getShareDetails()
    const target = provider === "facebook"
      ? `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
      : provider === "whatsapp"
        ? `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`
        : `mailto:?subject=${encodeURIComponent(`A tribute to ${memorialName}`)}&body=${encodeURIComponent(`${text}\n\n${url}`)}`
    if (provider === "email") window.location.href = target
    else window.open(target, "_blank", "noopener,noreferrer,width=720,height=640")
    setIsOpen(false)
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
        className="inline-flex min-h-9 items-center gap-2 rounded-lg px-2.5 text-xs font-medium text-[#55585c] transition-colors hover:bg-white hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
      >
        <Share2 className="size-4" />
        Share
      </button>

      {isOpen && (
        <div role="menu" className="absolute bottom-11 left-0 z-30 w-52 overflow-hidden rounded-2xl border border-black/[0.09] bg-white p-1.5 shadow-[0_18px_50px_rgba(24,25,37,0.16)] animate-in fade-in zoom-in-95">
          <p className="px-3 pb-1.5 pt-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#929399]">Share this tribute</p>
          <button type="button" role="menuitem" onClick={() => openShareUrl("facebook")} className="flex min-h-10 w-full items-center gap-3 rounded-xl px-3 text-left text-sm text-[#303136] hover:bg-[#f5f6f8]">
            <span className="flex size-7 items-center justify-center rounded-full bg-[#1877f2] text-white"><FacebookMark /></span>
            Facebook
          </button>
          <button type="button" role="menuitem" onClick={() => openShareUrl("whatsapp")} className="flex min-h-10 w-full items-center gap-3 rounded-xl px-3 text-left text-sm text-[#303136] hover:bg-[#f5f6f8]">
            <span className="flex size-7 items-center justify-center rounded-full bg-[#25d366] text-white"><WhatsAppMark /></span>
            WhatsApp
          </button>
          <button type="button" role="menuitem" onClick={() => openShareUrl("email")} className="flex min-h-10 w-full items-center gap-3 rounded-xl px-3 text-left text-sm text-[#303136] hover:bg-[#f5f6f8]">
            <span className="flex size-7 items-center justify-center rounded-full bg-[#5d6269] text-white"><Mail className="size-4" /></span>
            Email
          </button>
          <button type="button" role="menuitem" onClick={copyLink} className="flex min-h-10 w-full items-center gap-3 rounded-xl px-3 text-left text-sm text-[#303136] hover:bg-[#f5f6f8]">
            <span className="flex size-7 items-center justify-center rounded-full bg-primary text-white">{copied ? <Check className="size-4" /> : <Link2 className="size-4" />}</span>
            {copied ? "Link copied" : "Copy link"}
          </button>
        </div>
      )}
    </div>
  )
}
