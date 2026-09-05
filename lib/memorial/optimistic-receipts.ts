"use client"

import { useEffect, useState, useCallback } from "react"
import type { Memory } from "@/types/theirs"

export interface OptimisticReceiptItem {
  id: string
  receipt_token: string
  memorial_slug: string
  memorial_id?: string
  author_name: string
  author_relationship?: string | null
  story: string
  approx_year?: number | string | null
  location?: string | null
  photo_url?: string | null
  photo_urls?: string[] | null
  tribute_type?: "flower" | "note" | "photo" | "candle"
  contribution_type?: "tribute" | "story" | "photo" | "voice" | "video" | "moment"
  status: "pending_approval" | "approved" | "blocked"
  created_at: string
}

function getStorageKey(slugOrId: string): string {
  return `theirs_receipts_${(slugOrId || "default").toLowerCase()}`
}

export function getLocalReceipts(slugOrId: string): OptimisticReceiptItem[] {
  if (typeof window === "undefined" || !slugOrId) return []
  try {
    const raw = localStorage.getItem(getStorageKey(slugOrId))
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch (err) {
    console.warn("Failed to read local receipts:", err)
    return []
  }
}

export function saveLocalReceipt(slugOrId: string, item: OptimisticReceiptItem): void {
  if (typeof window === "undefined" || !slugOrId) return
  try {
    const existing = getLocalReceipts(slugOrId)
    // Avoid duplicate insertions
    const filtered = existing.filter(
      (r) => r.id !== item.id && r.receipt_token !== item.receipt_token
    )
    const updated = [item, ...filtered]
    localStorage.setItem(getStorageKey(slugOrId), JSON.stringify(updated))

    window.dispatchEvent(
      new CustomEvent("theirs_receipts_updated", {
        detail: { slugOrId, item },
      })
    )
  } catch (err) {
    console.warn("Failed to save local receipt:", err)
  }
}

export function removeLocalReceipt(slugOrId: string, idOrToken: string): void {
  if (typeof window === "undefined" || !slugOrId) return
  try {
    const existing = getLocalReceipts(slugOrId)
    const filtered = existing.filter((r) => r.id !== idOrToken && r.receipt_token !== idOrToken)
    localStorage.setItem(getStorageKey(slugOrId), JSON.stringify(filtered))

    window.dispatchEvent(
      new CustomEvent("theirs_receipts_updated", {
        detail: { slugOrId },
      })
    )
  } catch (err) {
    console.warn("Failed to remove local receipt:", err)
  }
}

/**
 * Reconciles local optimistic receipts with live public items.
 * If a locally submitted receipt is now in the approved public feed,
 * remove it from LocalStorage so it renders purely from the server.
 */
export function reconcileReceipts(
  slugOrId: string,
  publicItems: { id: string }[]
): OptimisticReceiptItem[] {
  if (typeof window === "undefined" || !slugOrId) return []
  const existing = getLocalReceipts(slugOrId)
  if (existing.length === 0) return []

  const publicIds = new Set(publicItems.map((p) => p.id))
  const remaining = existing.filter((receipt) => !publicIds.has(receipt.id))

  if (remaining.length !== existing.length) {
    try {
      localStorage.setItem(getStorageKey(slugOrId), JSON.stringify(remaining))
    } catch {}
  }

  return remaining
}

/**
 * React hook to listen for optimistic receipts on a memorial page.
 */
export function useOptimisticReceipts(slugOrId: string, liveItems?: { id: string }[]) {
  const [receipts, setReceipts] = useState<OptimisticReceiptItem[]>([])

  const refresh = useCallback(() => {
    if (!slugOrId) return
    const current = liveItems
      ? reconcileReceipts(slugOrId, liveItems)
      : getLocalReceipts(slugOrId)
    setReceipts(current)
  }, [slugOrId, liveItems])

  useEffect(() => {
    refresh()

    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<{ slugOrId?: string }>
      if (!customEvent.detail?.slugOrId || customEvent.detail.slugOrId === slugOrId) {
        refresh()
      }
    }

    window.addEventListener("theirs_receipts_updated", handleUpdate)
    window.addEventListener("storage", refresh)

    return () => {
      window.removeEventListener("theirs_receipts_updated", handleUpdate)
      window.removeEventListener("storage", refresh)
    }
  }, [slugOrId, refresh])

  return receipts
}
