"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { Trash2, Loader2 } from "lucide-react"

interface ConfirmDeleteModalProps {
  isOpen: boolean
  title: string
  description: string
  itemPreview?: string | null
  confirmLabel?: string
  cancelLabel?: string
  isDeleting?: boolean
  onConfirm: () => void | Promise<void>
  onClose: () => void
}

export function ConfirmDeleteModal({
  isOpen,
  title,
  description,
  itemPreview,
  confirmLabel = "Delete permanently",
  cancelLabel = "Cancel",
  isDeleting = false,
  onConfirm,
  onClose,
}: ConfirmDeleteModalProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isDeleting) {
        onClose()
      }
    }

    if (isOpen) {
      document.body.style.overflow = "hidden"
      window.addEventListener("keydown", handleKeyDown)
    } else {
      document.body.style.overflow = "unset"
    }

    return () => {
      document.body.style.overflow = "unset"
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen, isDeleting, mounted, onClose])

  if (!mounted || !isOpen) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 select-none animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={isDeleting ? undefined : onClose}
      />

      {/* Modal Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-delete-title"
        className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-black/[0.08] flex flex-col gap-5 z-10 animate-in zoom-in-95 duration-200"
      >
        <div className="flex items-start gap-4">
          <div className="size-11 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center shrink-0">
            <Trash2 className="size-5" />
          </div>

          <div className="flex flex-col gap-1 min-w-0 flex-1">
            <h3
              id="confirm-delete-title"
              className="text-base sm:text-lg font-serif font-medium text-[#181925] tracking-tight"
            >
              {title}
            </h3>
            <p className="text-xs sm:text-sm text-[#71717a] leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        {itemPreview && (
          <div className="px-3.5 py-2.5 rounded-xl bg-[#fafafb] border border-black/[0.06] text-xs text-[#555] font-medium truncate flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-rose-500 shrink-0" />
            <span className="truncate">{itemPreview}</span>
          </div>
        )}

        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-black/[0.05]">
          <button
            type="button"
            disabled={isDeleting}
            onClick={onClose}
            className="px-4 py-2 rounded-full text-xs font-medium text-[#666] hover:text-[#181925] hover:bg-neutral-100 transition-colors cursor-pointer disabled:opacity-50"
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            disabled={isDeleting}
            onClick={onConfirm}
            className="inline-flex items-center justify-center gap-1.5 px-5 py-2 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium transition-all cursor-pointer shadow-xs disabled:opacity-50"
          >
            {isDeleting ? (
              <>
                <Loader2 className="size-3 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="size-3.5" />
                <span>{confirmLabel}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
