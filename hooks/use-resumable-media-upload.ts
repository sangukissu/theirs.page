"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Uppy, { type UppyFile } from "@uppy/core"
import AwsS3, { type AwsBody } from "@uppy/aws-s3"
import GoldenRetriever from "@uppy/golden-retriever"
import type { MediaType } from "@/types/theirs"
import type { UploadPurpose } from "@/lib/uploads/capabilities"
import { detectMediaType, MULTIPART_CHUNK_BYTES, resolveMediaMime } from "@/lib/uploads/constants"
import { createUploadFingerprint } from "@/lib/uploads/fingerprint"
import {
  dedupeUploadItems,
  hasUsableFileData,
  UploadPreparationRegistry,
  uploadIndexedDbName,
  uploadManagerKey,
} from "@/lib/uploads/client-scope"

export { hasUsableFileData }

export type ResumableUploadStatus =
  | "preparing" | "uploading" | "paused" | "verifying" | "finalizing" | "complete" | "error"

export interface ResumableUploadItem {
  id: string
  sessionId: string
  filename: string
  mediaType: MediaType
  bytesUploaded: number
  totalBytes: number
  percentage: number
  bytesPerSecond: number
  etaSeconds: number | null
  status: ResumableUploadStatus
  resumable: boolean
  error: string | null
  previewUrl?: string
  result?: Record<string, unknown>
  needsFile?: boolean
  canRetry?: boolean
  targetAlbum?: string | null
}

export interface UploadMeta extends Record<string, unknown> {
  sessionId: string
  r2Key: string
  uploadMode: "single" | "multipart"
  mediaType: MediaType
  fingerprint: string
  targetAlbum?: string | null
}


interface SessionContract {
  id: string
  mediaType: MediaType
  filename: string
  fileSize: number
  key: string
  uploadId: string | null
  uploadMode: "single" | "multipart"
  status: string
  targetAlbum: string | null
  bytesUploaded?: number
  uploadedParts?: number
}

interface HookOptions {
  memorialId: string
  userId?: string
  purpose: UploadPurpose
  enabled?: boolean
  defaultAlbum?: string | null
  onStudioComplete?: (mediaItem: Record<string, unknown>) => void
}

const UUID_PATTERN = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i
interface UploadRuntime {
  managers: Map<string, Uppy<UploadMeta, AwsBody>>
  finishingSessions: Set<string>
}

// Fast Refresh deliberately preserves React state and can re-evaluate modules.
// Keep the headless managers in a browser-global runtime so an edit cannot
// create a second uploader for the same account/memorial queue.
const runtimeHost = globalThis as typeof globalThis & { __theirsUploadRuntimeV3?: UploadRuntime }
const uploadRuntime = runtimeHost.__theirsUploadRuntimeV3 ||= {
  managers: new Map<string, Uppy<UploadMeta, AwsBody>>(),
  finishingSessions: new Set<string>(),
}
const managers = uploadRuntime.managers
const finishingSessions = uploadRuntime.finishingSessions

async function readJson(response: Response) {
  return response.json().catch(() => ({})) as Promise<Record<string, any>>
}

function matchesItemId(
  item: { id: string; sessionId?: string; meta?: Record<string, unknown> } | null | undefined,
  targetId: string,
): boolean {
  if (!item) return false
  if (item.id === targetId) return true
  const sessionVal = item.sessionId || (item.meta?.sessionId as string | undefined)
  if (sessionVal) {
    if (sessionVal === targetId) return true
    if (`session:${sessionVal}` === targetId) return true
    if (targetId.startsWith("session:") && sessionVal === targetId.slice(8)) return true
  }
  return false
}

async function apiRequest(url: string, init?: RequestInit) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 60_000)
  try {
    const signal = init?.signal
      ? (typeof AbortSignal.any === "function" ? AbortSignal.any([init.signal, controller.signal]) : init.signal)
      : controller.signal
    const response = await fetch(url, { ...init, signal })
    const data = await readJson(response)
    if (!response.ok) {
      const error = new Error(data.error || "Upload request failed.") as Error & { status?: number; code?: string }
      error.status = response.status
      error.code = data.code
      throw error
    }
    return data
  } catch (err: any) {
    if (err.name === "AbortError" && !init?.signal?.aborted) {
      const error = new Error("The request timed out. Please try again.") as Error & { status?: number; code?: string }
      error.status = 504
      error.code = "request_timeout"
      throw error
    }
    throw err
  } finally {
    clearTimeout(timeoutId)
  }
}

function sendUploadTelemetry(
  memorialId: string,
  sessionId: string,
  event: string,
  fields: Record<string, unknown> = {},
) {
  void fetch(
    `/api/memorials/${encodeURIComponent(memorialId)}/uploads/sessions/${encodeURIComponent(sessionId)}/telemetry`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event, ...fields }),
      keepalive: true,
    },
  ).catch(() => {})
}

function sessionIdFromKey(key: string): string {
  const matches = key.match(new RegExp(UUID_PATTERN.source, "ig")) || []
  const sessionId = matches.length > 1 ? matches[1] : matches[0]
  if (!sessionId) throw new Error("Upload session key is invalid.")
  return sessionId
}

function getManager(userId: string, memorialId: string, purpose: UploadPurpose) {
  const managerKey = uploadManagerKey(userId, memorialId, purpose)
  const existing = managers.get(managerKey)
  if (existing) return existing

  const uppy = new Uppy<UploadMeta, AwsBody>({
    id: `theirs-${managerKey}`,
    autoProceed: false,
    allowMultipleUploadBatches: true,
    restrictions: { maxNumberOfFiles: 20 },
  })
  uppy.use(GoldenRetriever, {
    expires: 24 * 60 * 60 * 1000,
    serviceWorker: true,
    indexedDB: { name: uploadIndexedDbName(userId, memorialId, purpose) },
  })
  uppy.use(AwsS3, {
    limit: 2,
    shouldUseMultipart: (file) => file.meta.uploadMode === "multipart",
    getChunkSize: () => MULTIPART_CHUNK_BYTES,
    generateObjectKey: (file) => String(file.meta.r2Key),
    signRequest: async (request) => {
      const sessionId = sessionIdFromKey(request.key)
      const data = await apiRequest(
        `/api/memorials/${encodeURIComponent(memorialId)}/uploads/sessions/${encodeURIComponent(sessionId)}/sign`,
        { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(request) },
      )
      return { url: String(data.url) }
    },
  })
  managers.set(managerKey, uppy)
  return uppy
}

function initialItem(session: SessionContract, id = `session:${session.id}`): ResumableUploadItem {
  const bytesUploaded = session.bytesUploaded || 0
  const isComplete = session.status === "complete"
  const percentage = session.fileSize
    ? (isComplete ? 100 : Math.min(99, Math.round((bytesUploaded / session.fileSize) * 100)))
    : 0

  return {
    id,
    sessionId: session.id,
    filename: session.filename,
    mediaType: session.mediaType,
    bytesUploaded,
    totalBytes: session.fileSize,
    percentage,
    bytesPerSecond: 0,
    etaSeconds: null,
    status: isComplete ? "complete" : ["uploaded", "verifying", "finalizing"].includes(session.status) ? "verifying" : "paused",
    resumable: session.uploadMode === "multipart",
    error: null,
    needsFile: !isComplete,
    targetAlbum: session.targetAlbum,
  }
}

function friendlyUploadError(error: Error & { status?: number; code?: string }) {
  if (error.status === 403 || error.code === "membership_revoked") {
    return "You no longer have permission to upload to this memorial."
  }
  if (error.code === "storage_quota_reached") return "This memorial has reached its 10 GB media limit."
  if (error.code === "pro_required") return "Original audio and video are available on the Pro plan."
  if (error.code === "invalid_uploaded_bytes") return error.message
  if (!navigator.onLine || /network|fetch|offline/i.test(error.message)) {
    return "Connection interrupted. Your uploaded progress is safe."
  }
  return error.message || "Upload interrupted. Your uploaded progress is safe; choose Resume to continue."
}

export function useResumableMediaUpload(options: HookOptions) {
  const [items, setItems] = useState<ResumableUploadItem[]>([])
  const [isOnline, setIsOnline] = useState(() => typeof navigator === "undefined" || navigator.onLine)
  const managerRef = useRef<Uppy<UploadMeta, AwsBody> | null>(null)
  const startedAt = useRef(new Map<string, number>())
  const retryCounts = useRef(new Map<string, number>())
  const preparations = useRef(new UploadPreparationRegistry())
  const preparationFiles = useRef(new Map<string, File>())
  const activeScope = useRef<string | null>(null)
  const completeCallback = useRef(options.onStudioComplete)
  completeCallback.current = options.onStudioComplete

  const patchItem = useCallback((id: string, patch: Partial<ResumableUploadItem>) => {
    setItems((current) => dedupeUploadItems(
      current.map((item) => matchesItemId(item, id) ? { ...item, ...patch } : item),
    ))
  }, [])

  useEffect(() => {
    const nextScope = options.userId && options.memorialId && options.enabled !== false
      ? uploadManagerKey(options.userId, options.memorialId, options.purpose)
      : null
    if (activeScope.current !== nextScope) {
      preparations.current.cancelAll()
      preparationFiles.current.clear()
      startedAt.current.clear()
      retryCounts.current.clear()
      setItems([])
      activeScope.current = nextScope
    }
  }, [options.enabled, options.memorialId, options.purpose, options.userId])

  useEffect(() => () => preparations.current.cancelAll(), [])

  const finishUploadedSession = useCallback(async (
    itemId: string,
    sessionId: string,
    targetAlbum?: string | null,
  ) => {
    if (finishingSessions.has(sessionId)) return
    finishingSessions.add(sessionId)
    try {
      patchItem(itemId, { status: "verifying", error: null, needsFile: false })
      const verified = await apiRequest(
        `/api/memorials/${encodeURIComponent(options.memorialId)}/uploads/sessions/${encodeURIComponent(sessionId)}/verify`,
        { method: "POST" },
      )
      if (options.purpose === "studio_gallery") {
        patchItem(itemId, { status: "finalizing" })
        const finalized = await apiRequest(
          `/api/memorials/${encodeURIComponent(options.memorialId)}/uploads/sessions/${encodeURIComponent(sessionId)}/finalize`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ album: targetAlbum || null }),
          },
        )
        patchItem(itemId, {
          status: "complete",
          percentage: 100,
          result: finalized.mediaItem,
          previewUrl: finalized.mediaItem?.url,
        })
        completeCallback.current?.(finalized.mediaItem)
        setTimeout(() => {
          const manager = managerRef.current
          const file = manager?.getFiles().find((f) => matchesItemId(f as any, itemId))
          if (file) manager?.removeFile(file.id)
          setItems((current) => current.filter((item) => !matchesItemId(item, itemId)))
        }, 8_000)
      } else {
        patchItem(itemId, {
          status: "complete",
          percentage: 100,
          previewUrl: verified.previewUrl,
          result: verified,
        })
      }
    } catch (error) {
      const typed = error as Error & { code?: string }
      if (typed.code === "upload_not_complete") {
        const file = managerRef.current?.getFiles().find((f) => matchesItemId(f as any, itemId))
        const hasRecoverableFile = hasUsableFileData(file)
        patchItem(itemId, {
          status: hasRecoverableFile ? "error" : "paused",
          needsFile: !hasRecoverableFile,
          error: hasRecoverableFile
            ? "Upload completion was interrupted. Choose Resume to reconcile the uploaded parts."
            : "Upload paused. Choose the same file to continue; uploaded parts remain safe.",
        })
      } else {
        const unrecoverable = ["invalid_uploaded_bytes", "failed", "expired", "aborted"].includes(typed.code || "")
        if (unrecoverable) {
          const file = managerRef.current?.getFiles().find((f) => matchesItemId(f as any, itemId))
          if (file) managerRef.current?.removeFile(file.id)
        }
        patchItem(itemId, {
          status: "error",
          error: friendlyUploadError(typed),
          canRetry: !unrecoverable,
        })
      }
    } finally {
      finishingSessions.delete(sessionId)
    }
  }, [options.memorialId, options.purpose, patchItem])

  useEffect(() => {
    if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/uppy-service-worker.js").catch(() => {})
    }
    if (options.enabled === false || !options.memorialId || !options.userId) return
    const uppy = getManager(options.userId, options.memorialId, options.purpose)
    managerRef.current = uppy

    const addFromFile = (file: UppyFile<UploadMeta, AwsBody>) => {
      if (!file.meta.sessionId) return
      setItems((current) => {
        const isUsable = hasUsableFileData(file)
        const next = initialItem({
          id: file.meta.sessionId,
          mediaType: file.meta.mediaType,
          filename: file.name,
          fileSize: file.size || 0,
          key: file.meta.r2Key,
          uploadId: (file as typeof file & { s3Multipart?: { uploadId: string } }).s3Multipart?.uploadId || null,
          uploadMode: file.meta.uploadMode,
          status: !isUsable ? "paused" : "created",
          targetAlbum: file.meta.targetAlbum || null,
        }, file.id)
        next.needsFile = !isUsable
        // Restored files start as "paused" (or "verifying" if complete), never fake "uploading" while idle
        next.status = !isUsable ? "paused" : file.progress.uploadComplete ? "verifying" : "paused"
        if (file.error) {
          next.status = "error"
          next.error = typeof file.error === "string" ? file.error : "Upload interrupted. Choose Resume to continue."
        }
        next.bytesUploaded = Number(file.progress.bytesUploaded || 0)
        next.totalBytes = Number(file.progress.bytesTotal || file.size || 0)
        next.percentage = next.totalBytes
          ? Math.min(next.bytesUploaded >= next.totalBytes && !file.progress.uploadComplete ? 99 : 100, Math.round((next.bytesUploaded / next.totalBytes) * 100))
          : 0
        if (!isUsable && next.percentage === 100) {
          next.percentage = 99
        }
        const existingItem = current.find((item) => matchesItemId(item, next.id))
        if (existingItem && existingItem.bytesUploaded > next.bytesUploaded) {
          next.bytesUploaded = existingItem.bytesUploaded
          next.percentage = existingItem.percentage
        }
        const withoutPlaceholder = current.filter((item) => !matchesItemId(item, next.id))
        return dedupeUploadItems([next, ...withoutPlaceholder])
      })
    }
    const onAdded = (file: UppyFile<UploadMeta, AwsBody>) => addFromFile(file)
    const onProgress = (file: UppyFile<UploadMeta, AwsBody> | undefined, progress: { bytesUploaded: number; bytesTotal: number | null }) => {
      if (!file) return
      const bytesTotal = progress.bytesTotal || file.size || 0
      if (!startedAt.current.has(file.id)) startedAt.current.set(file.id, Date.now())
      const seconds = Math.max(0.25, (Date.now() - (startedAt.current.get(file.id) || Date.now())) / 1000)
      const speed = progress.bytesUploaded / seconds
      const remaining = Math.max(0, bytesTotal - progress.bytesUploaded)
      patchItem(file.id, {
        status: "uploading", bytesUploaded: progress.bytesUploaded, totalBytes: bytesTotal,
        percentage: bytesTotal ? Math.round((progress.bytesUploaded / bytesTotal) * 100) : 0,
        bytesPerSecond: speed, etaSeconds: speed > 0 ? Math.ceil(remaining / speed) : null,
        error: null, needsFile: false,
      })
    }
    const onPaused = (file: UppyFile<UploadMeta, AwsBody> | undefined, paused: boolean) => {
      if (file && paused) patchItem(file.id, { status: "paused", error: "Upload paused. Your uploaded progress is safe." })
    }
    const onError = (file: UppyFile<UploadMeta, AwsBody> | undefined, error: Error) => {
      if (file) {
        const typed = error as Error & { status?: number; code?: string }
        if (typed.code === "upload_already_completed") {
          patchItem(file.id, {
            status: "verifying",
            percentage: 100,
            error: null,
            needsFile: false,
          })
          void finishUploadedSession(file.id, file.meta.sessionId, file.meta.targetAlbum)
          return
        }
        const automaticRetryCount = retryCounts.current.get(file.id) || 0
        const shouldRefreshExpiredSignature = navigator.onLine &&
          typed.name === "S3ServiceError" && typed.status === 403 && automaticRetryCount < 2
        if (shouldRefreshExpiredSignature) {
          const nextRetryCount = automaticRetryCount + 1
          retryCounts.current.set(file.id, nextRetryCount)
          patchItem(file.id, {
            status: "paused",
            error: "Upload permission expired. Refreshing it and resuming the missing part…",
          })
          setTimeout(() => {
            if (uppy.getFile(file.id) && navigator.onLine) {
              void uppy.retryUpload(file.id).catch(() => {})
            }
          }, 300)
        } else {
          patchItem(file.id, { status: navigator.onLine ? "error" : "paused", error: friendlyUploadError(error) })
          // Uppy 6 upload() retries every file carrying a core `error` before
          // it starts newly-added files. Retries in this UI are explicit, so
          // clear the internal flag while preserving our visible error state.
          if (uppy.getFile(file.id)) {
            uppy.setFileState(file.id, { error: null, isPaused: !navigator.onLine })
          }
        }
        sendUploadTelemetry(options.memorialId, file.meta.sessionId, "upload_failed", {
          failure_stage: "upload_part",
          http_status: typed.status,
          error_code: typed.code && /^[a-z0-9_-]{1,80}$/i.test(typed.code) ? typed.code : "upload_interrupted",
          retry_count: retryCounts.current.get(file.id) || 0,
        })
      }
    }
    const onSuccess = (file: UppyFile<UploadMeta, AwsBody> | undefined) => {
      if (!file) return
      const uploadMs = Math.max(0, Date.now() - (startedAt.current.get(file.id) || Date.now()))
      sendUploadTelemetry(options.memorialId, file.meta.sessionId, "upload_client_complete", {
        upload_ms: uploadMs,
        effective_mbps: uploadMs > 0 ? Number((((file.size || 0) * 8) / uploadMs / 1000).toFixed(3)) : 0,
        retry_count: retryCounts.current.get(file.id) || 0,
      })
      void (async () => {
        await finishUploadedSession(file.id, file.meta.sessionId, file.meta.targetAlbum)
      })()
    }
    const onRestored = () => {
      const restored = uppy.getFiles()
      restored.forEach(addFromFile)
      restored.filter((file) => Boolean(file.error)).forEach((file) => {
        // Old persisted failures must not be included in Uppy's implicit
        // retry-all behavior. The visible queue still offers explicit Resume.
        uppy.setFileState(file.id, { error: null, isPaused: false })
      })
      restored.filter((file) => hasUsableFileData(file) && file.progress.uploadComplete).forEach((file) => {
        void finishUploadedSession(file.id, file.meta.sessionId, file.meta.targetAlbum)
      })
      const resumable = restored.filter((file) => hasUsableFileData(file) && !file.error && !file.progress.uploadComplete)
      if (resumable.length > 0 && navigator.onLine) {
        for (const file of resumable) {
          patchItem(file.id, { status: "uploading", error: null })
          void uppy.retryUpload(file.id).catch((err) => {
            console.error("Auto-resume failed:", err)
            patchItem(file.id, { status: "paused", error: "Upload paused. Choose Resume to continue." })
          })
        }
      }
    }

    uppy.on("file-added", onAdded)
    uppy.on("upload-progress", onProgress)
    uppy.on("upload-pause", onPaused)
    uppy.on("upload-error", onError)
    uppy.on("upload-success", onSuccess)
    uppy.on("restored", onRestored)
    const existingFiles = uppy.getFiles()
    existingFiles.forEach(addFromFile)
    existingFiles.filter((file) => hasUsableFileData(file) && file.progress.uploadComplete).forEach((file) => {
      void finishUploadedSession(file.id, file.meta.sessionId, file.meta.targetAlbum)
    })

    void apiRequest(`/api/memorials/${encodeURIComponent(options.memorialId)}/uploads/sessions?purpose=${options.purpose}`)
      .then((data) => {
        setItems((current) => {
          const serverSessions = new Map<string, SessionContract>(
            (data.sessions || []).map((s: SessionContract) => [s.id, s]),
          )
          const updated = current.map((item) => {
            const serverSession = serverSessions.get(item.sessionId)
            if (!serverSession) return item
            if (serverSession.status === "complete") {
              return {
                ...item,
                status: "complete" as const,
                percentage: 100,
                bytesUploaded: item.totalBytes,
              }
            }
            const localFile = uppy.getFiles().find((f) => matchesItemId(f as any, item.id))
            if (hasUsableFileData(localFile) && item.status === "uploading") {
              return item
            }
            if (serverSession.bytesUploaded !== undefined && serverSession.bytesUploaded > item.bytesUploaded) {
              const bytesUploaded = serverSession.bytesUploaded
              const percentage = item.totalBytes
                ? Math.min(99, Math.round((bytesUploaded / item.totalBytes) * 100))
                : item.percentage
              return { ...item, bytesUploaded, percentage }
            }
            return item
          })
          const known = new Set(updated.map((item) => item.sessionId))
          const missing = (data.sessions || [])
            .filter((session: SessionContract) => !known.has(session.id) && session.status !== "complete")
            .map((session: SessionContract) => initialItem(session))
          return dedupeUploadItems([...updated, ...missing])
        })
        for (const session of (data.sessions || []) as SessionContract[]) {
          if (session.status === "complete") {
            patchItem(session.id, { status: "complete", percentage: 100 })
            continue
          }
          const localFile = uppy.getFiles().find((file) => file.meta.sessionId === session.id)
          if (["uploaded", "verifying", "finalizing"].includes(session.status)) {
            void finishUploadedSession(localFile?.id || `session:${session.id}`, session.id, session.targetAlbum)
            continue
          }
          if (!localFile || !hasUsableFileData(localFile)) {
            patchItem(localFile?.id || `session:${session.id}`, {
              status: "paused",
              needsFile: true,
              error: null,
            })
            continue
          }

          if (localFile.progress.uploadComplete) {
            void finishUploadedSession(localFile.id, session.id, session.targetAlbum)
          } else if (!localFile.error && navigator.onLine) {
            patchItem(localFile.id, { status: "uploading", error: null })
            void uppy.retryUpload(localFile.id).catch(() => {
              patchItem(localFile.id, { status: "paused" })
            })
          }
        }
      })
      .catch(() => {})

    const online = () => { setIsOnline(true); uppy.resumeAll() }
    const offline = () => { setIsOnline(false); uppy.pauseAll() }
    window.addEventListener("online", online)
    window.addEventListener("offline", offline)
    return () => {
      uppy.off("file-added", onAdded)
      uppy.off("upload-progress", onProgress)
      uppy.off("upload-pause", onPaused)
      uppy.off("upload-error", onError)
      uppy.off("upload-success", onSuccess)
      uppy.off("restored", onRestored)
      window.removeEventListener("online", online)
      window.removeEventListener("offline", offline)
      if (managerRef.current === uppy) managerRef.current = null
    }
  }, [finishUploadedSession, options.enabled, options.memorialId, options.purpose, options.userId, patchItem])

  const addFiles = useCallback(async (files: File[]) => {
    if (options.enabled === false || !options.userId) {
      throw new Error("Authenticated uploads are not available in this contribution flow.")
    }
    const uppy = getManager(options.userId, options.memorialId, options.purpose)
    managerRef.current = uppy
    const prepared = new Set<string>()
    const newlyAdded: string[] = []
    for (const file of files) {
      const prepareStartedAt = performance.now()
      const mimeType = resolveMediaMime(file.type, file.name)
      const guessedType = detectMediaType(mimeType)
      if (!guessedType) throw new Error(`“${file.name}” uses a media format that this uploader cannot verify.`)
      const fingerprint = createUploadFingerprint({
        name: file.name,
        size: file.size,
        type: mimeType,
        lastModified: file.lastModified,
      }, options.memorialId, options.userId, options.purpose)
      const existingLocalFile = uppy.getFiles().find((candidate) =>
        candidate.meta.fingerprint === fingerprint && hasUsableFileData(candidate),
      )
      if (existingLocalFile) {
        prepared.add(existingLocalFile.id)
        if (existingLocalFile.progress.uploadComplete) {
          void finishUploadedSession(
            existingLocalFile.id,
            existingLocalFile.meta.sessionId,
            existingLocalFile.meta.targetAlbum,
          )
        }
        continue
      }
      const clientUploadId = crypto.randomUUID()
      const placeholderId = `preparing:${clientUploadId}`
      const preparation = preparations.current.begin(placeholderId)
      preparationFiles.current.set(placeholderId, file)
      setItems((current) => dedupeUploadItems([{
        id: placeholderId, sessionId: "", filename: file.name, mediaType: guessedType,
        bytesUploaded: 0, totalBytes: file.size, percentage: 0, bytesPerSecond: 0, etaSeconds: null,
        status: "preparing", resumable: false, error: null,
      }, ...current]))
      try {
        const data = await apiRequest(`/api/memorials/${encodeURIComponent(options.memorialId)}/uploads/sessions`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          signal: preparation.signal,
          body: JSON.stringify({
            purpose: options.purpose, filename: file.name,
            mimeType, fileSize: file.size,
            clientUploadId, fingerprint, album: options.defaultAlbum || null,
          }),
        })
        const session = data.session as SessionContract
        if (preparation.signal.aborted) {
          await fetch(
            `/api/memorials/${encodeURIComponent(options.memorialId)}/uploads/sessions/${encodeURIComponent(session.id)}/control?operation=abort`,
            { method: "DELETE" },
          ).catch(() => {})
          setItems((current) => current.filter((item) => item.id !== placeholderId))
          preparationFiles.current.delete(placeholderId)
          continue
        }
        sendUploadTelemetry(options.memorialId, session.id, data.recovered ? "upload_resumed" : "upload_prepared", {
          prepare_ms: Math.round(performance.now() - prepareStartedAt),
          resume_count: data.recovered ? 1 : 0,
        })
        setItems((current) => current.filter((item) => item.id !== placeholderId && item.sessionId !== session.id))
        preparationFiles.current.delete(placeholderId)
        const recoveredFile = uppy.getFiles().find((candidate) => candidate.meta.sessionId === session.id)
        if (recoveredFile) {
          if (hasUsableFileData(recoveredFile)) {
            prepared.add(recoveredFile.id)
            continue
          }
          uppy.removeFile(recoveredFile.id)
        }
        const fileId = uppy.addFile({
          name: file.name,
          type: mimeType,
          data: file,
          source: "Theirs",
          meta: {
            sessionId: session.id, r2Key: session.key, uploadMode: session.uploadMode,
            mediaType: session.mediaType, fingerprint, targetAlbum: session.targetAlbum,
            relativePath: session.id,
          },
        })
        if (session.uploadId) {
          uppy.patchFilesState({ [fileId]: { s3Multipart: { uploadId: session.uploadId, key: session.key } } } as any)
        }
        prepared.add(fileId)
        newlyAdded.push(fileId)
      } catch (error) {
        if (preparation.signal.aborted || (error instanceof Error && error.name === "AbortError")) {
          setItems((current) => current.filter((item) => item.id !== placeholderId))
        } else {
          patchItem(placeholderId, { status: "error", error: friendlyUploadError(error as Error) })
        }
      } finally {
        preparations.current.finish(placeholderId, preparation)
      }
    }
    if (newlyAdded.length > 0 && navigator.onLine) {
      // Upload progress and errors are event-driven. Return the prepared IDs
      // immediately so callers can render controls while bytes are in flight.
      void uppy.upload().catch(() => {})
    }
    return [...prepared]
  }, [finishUploadedSession, options.defaultAlbum, options.enabled, options.memorialId, options.purpose, options.userId, patchItem])

  const retry = useCallback(async (id: string) => {
    const uppy = managerRef.current
    const item = items.find((candidate) => matchesItemId(candidate, id))
    if (!item) return
    if (!item.sessionId) {
      const file = preparationFiles.current.get(id)
      if (!file) {
        patchItem(id, { canRetry: false, needsFile: true, error: "Choose the file again to restart this upload." })
        return
      }
      preparationFiles.current.delete(id)
      setItems((current) => current.filter((candidate) => !matchesItemId(candidate, id)))
      await addFiles([file])
      return
    }
    if (!uppy) return
    const localFile = uppy.getFiles().find((f) => matchesItemId(f as any, id))
    const uppyFileId = localFile?.id || id
    if (!hasUsableFileData(localFile)) {
      patchItem(id, {
        status: "paused",
        needsFile: true,
        canRetry: false,
        error: "Upload paused. Choose the same file to continue; uploaded parts remain safe.",
      })
      return
    }
    if (localFile?.progress.uploadComplete) {
      await finishUploadedSession(uppyFileId, item.sessionId, item.targetAlbum)
      return
    }
    try {
      await apiRequest(
        `/api/memorials/${encodeURIComponent(options.memorialId)}/uploads/sessions/${encodeURIComponent(item.sessionId)}/verify`,
        { method: "POST" },
      )
      await finishUploadedSession(uppyFileId, item.sessionId, item.targetAlbum)
      return
    } catch (error) {
      const typed = error as Error & { code?: string }
      if (typed.code !== "upload_not_complete") {
        patchItem(id, { status: "error", error: friendlyUploadError(typed) })
        return
      }
    }
    const retryCount = (retryCounts.current.get(uppyFileId) || 0) + 1
    retryCounts.current.set(uppyFileId, retryCount)
    sendUploadTelemetry(options.memorialId, item.sessionId, "upload_resumed", {
      retry_count: retryCount,
      resume_count: retryCount,
    })
    patchItem(id, { status: "uploading", error: null })
    await uppy.retryUpload(uppyFileId)
  }, [addFiles, finishUploadedSession, items, options.memorialId, patchItem])

  const cancel = useCallback(async (id: string) => {
    if (preparations.current.cancel(id)) {
      preparationFiles.current.delete(id)
      setItems((current) => current.filter((candidate) => !matchesItemId(candidate, id)))
      return
    }
    const item = items.find((candidate) => matchesItemId(candidate, id))
    if (!item) return
    if (item.sessionId) {
      try {
        const response = await fetch(`/api/memorials/${encodeURIComponent(options.memorialId)}/uploads/sessions/${encodeURIComponent(item.sessionId)}/control?operation=abort`, { method: "DELETE" })
        if (!response.ok) {
          patchItem(id, {
            status: response.status === 409 ? "finalizing" : "error",
            error: response.status === 409
              ? "This upload is already being added to the memorial."
              : "Could not cancel yet. Check your connection and try again.",
          })
          return
        }
      } catch {
        patchItem(id, { status: "error", error: "Could not cancel yet. Check your connection and try again." })
        return
      }
    }
    const uppy = managerRef.current
    const localFile = uppy?.getFiles().find((f) => matchesItemId(f as any, id))
    if (localFile) uppy?.removeFile(localFile.id)
    preparationFiles.current.delete(id)
    setItems((current) => current.filter((candidate) => !matchesItemId(candidate, id)))
  }, [items, options.memorialId, patchItem])

  const dismiss = useCallback((id: string) => {
    preparationFiles.current.delete(id)
    setItems((current) => current.filter((item) => !matchesItemId(item, id)))
  }, [])

  return {
    items,
    isOnline,
    isUploading: items.some((item) => ["preparing", "uploading", "verifying", "finalizing"].includes(item.status)),
    addFiles,
    retry,
    cancel,
    dismiss,
    readySessionIds: [...new Set(items.filter((item) => item.status === "complete" && item.sessionId).map((item) => item.sessionId))],
  }
}
