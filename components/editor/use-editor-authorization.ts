"use client"

import { useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

/**
 * Permission failures are not offline drafts. Clear local editor state and
 * leave the Studio as soon as the server says access has been removed.
 */
export function useEditorAuthorization(memorialId: string) {
  const router = useRouter()
  const isRedirecting = useRef(false)

  return useCallback(
    (response: Response) => {
      if (response.status !== 401 && response.status !== 403) return false

      if (!isRedirecting.current) {
        isRedirecting.current = true
        try {
          localStorage.removeItem(`theirs_editor_draft_${memorialId}`)
          localStorage.removeItem(`theirs_timeline_draft_${memorialId}`)
        } catch { }
        toast.error("You no longer have access to edit this memorial.")
        router.replace("/dashboard?access=revoked")
        router.refresh()
      }

      return true
    },
    [memorialId, router],
  )
}
