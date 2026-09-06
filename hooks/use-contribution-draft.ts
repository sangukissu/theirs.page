"use client"

import { useCallback, useEffect, useRef, useState } from "react"

const DRAFT_TTL_MS = 7 * 24 * 60 * 60 * 1000

interface StoredDraft<T> {
  savedAt: number
  value: T
}

interface ContributionDraftOptions<T> {
  memorialId: string
  type: "tribute" | "memory"
  value: T
  enabled?: boolean
  delayMs?: number
}

export function useContributionDraft<T>({
  memorialId,
  type,
  value,
  enabled = true,
  delayMs = 400,
}: ContributionDraftOptions<T>) {
  const key = `theirs:draft:${memorialId}:${type}`
  const [restoredDraft, setRestoredDraft] = useState<T | null>(null)
  const restoredKeyRef = useRef<string | null>(null)

  useEffect(() => {
    if (!enabled || !memorialId || restoredKeyRef.current === key) return
    restoredKeyRef.current = key
    try {
      const raw = localStorage.getItem(key)
      if (!raw) return
      const stored = JSON.parse(raw) as StoredDraft<T>
      if (!stored?.savedAt || Date.now() - stored.savedAt > DRAFT_TTL_MS) {
        localStorage.removeItem(key)
        return
      }
      setRestoredDraft(stored.value)
    } catch {
      localStorage.removeItem(key)
    }
  }, [enabled, key, memorialId])

  useEffect(() => {
    if (!enabled || !memorialId || restoredKeyRef.current !== key) return
    const timer = window.setTimeout(() => {
      try {
        localStorage.setItem(key, JSON.stringify({ savedAt: Date.now(), value }))
      } catch {
        // Draft storage is best-effort (private mode and full storage may reject writes).
      }
    }, delayMs)
    return () => window.clearTimeout(timer)
  }, [delayMs, enabled, key, memorialId, value])

  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(key)
    } catch {}
    setRestoredDraft(null)
  }, [key])

  return { restoredDraft, clearDraft }
}
