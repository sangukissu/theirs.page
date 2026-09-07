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
  UploadPreparationRegistry,
  uploadIndexedDbName,
  uploadManagerKey,
} from "@/lib/uploads/client-scope"

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

interface UploadMeta extends Record<string, unknown> {
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

async function apiRequest(url: string, init?: RequestInit) {
  const response = await fetch(url, init)
  const data = await readJson(response)
  if (!response.ok) {
    const error = new Error(data.error || "Upload request failed.") as Error & { status?: number; code?: string }
    error.status = response.status
    error.code = data.code
    throw error
  }
  return data
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
    serviceWorker: false,
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
  return {
    id,
    sessionId: session.id,
    filename: session.filename,
    mediaType: session.mediaType,
    bytesUploaded: 0,
    totalBytes: session.fileSize,
    percentage: 0,
    bytesPerSecond: 0,
    etaSeconds: null,
    status: session.status === "uploaded" || session.status === "finalizing" ? "verifying" : "paused",
    resumable: session.uploadMode === "multipart",
    error: null,
    needsFile: !["uploaded", "verifying", "finalizing"].includes(session.status),
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
      current.map((item) => item.id === id ? { ...item, ...patch } : item),
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
      patchItem(itemId, { status: "verifying", percentage: 100, error: null, needsFile: false })
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
        patchItem(itemId, { status: "complete", result: finalized.mediaItem, previewUrl: finalized.mediaItem?.url })
        completeCallback.current?.(finalized.mediaItem)
        setTimeout(() => {
          const manager = managerRef.current
          if (manager?.getFile(itemId)) manager.removeFile(itemId)
          setItems((current) => current.filter((item) => item.id !== itemId))
        }, 8_000)
      } else {
        patchItem(itemId, { status: "complete", previewUrl: verified.previewUrl, result: verified })
      }
    } catch (error) {
      const typed = error as Error & { code?: string }
      if (typed.code === "upload_not_complete") {
        const hasRecoverableFile = Boolean(managerRef.current?.getFile(itemId))
        patchItem(itemId, {
          status: hasRecoverableFile ? "error" : "paused",
          needsFile: !hasRecoverableFile,
          error: hasRecoverableFile
            ? "Upload completion was interrupted. Choose Resume to reconcile the uploaded parts."
            : "Upload completion was interrupted. Choose the same file to continue; uploaded parts remain safe.",
        })
      } else {
        const unrecoverable = ["invalid_uploaded_bytes", "failed", "expired", "aborted"].includes(typed.code || "")
        if (unrecoverable && managerRef.current?.getFile(itemId)) managerRef.current.removeFile(itemId)
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
    if (options.enabled === false || !options.memorialId || !options.userId) return
    const uppy = getManager(options.userId, options.memorialId, options.purpose)
    managerRef.current = uppy

    const addFromFile = (file: UppyFile<UploadMeta, AwsBody>) => {
      if (!file.meta.sessionId) return
      setItems((current) => {
        const next = initialItem({
          id: file.meta.sessionId,
          mediaType: file.meta.mediaType,
          filename: file.name,
          fileSize: file.size || 0,
          key: file.meta.r2Key,
          uploadId: (file as typeof file & { s3Multipart?: { uploadId: string } }).s3Multipart?.uploadId || null,
          uploadMode: file.meta.uploadMode,
          status: file.isGhost ? "uploading" : "created",
          targetAlbum: file.meta.targetAlbum || null,
        }, file.id)
        next.status = file.isGhost ? "paused" : file.progress.uploadComplete ? "verifying" : "uploading"
        next.needsFile = file.isGhost
        if (file.error) {
          next.status = "error"
          next.error = typeof file.error === "string" ? file.error : "Upload interrupted. Choose Resume to continue."
        }
        next.bytesUploaded = Number(file.progress.bytesUploaded || 0)
        next.totalBytes = Number(file.progress.bytesTotal || file.size || 0)
        next.percentage = next.totalBytes ? Math.round((next.bytesUploaded / next.totalBytes) * 100) : 0
        const withoutPlaceholder = current.filter((item) => item.id !== next.id && item.sessionId !== next.sessionId)
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
      restored.filter((file) => !file.isGhost && file.progress.uploadComplete).forEach((file) => {
        void finishUploadedSession(file.id, file.meta.sessionId, file.meta.targetAlbum)
      })
      const resumable = restored.filter((file) => !file.isGhost && !file.error && !file.progress.uploadComplete)
      if (resumable.length > 0 && navigator.onLine) void uppy.upload()
    }

    uppy.on("file-added", onAdded)
    uppy.on("upload-progress", onProgress)
    uppy.on("upload-pause", onPaused)
    uppy.on("upload-error", onError)
    uppy.on("upload-success", onSuccess)
    uppy.on("restored", onRestored)
    const existingFiles = uppy.getFiles()
    existingFiles.forEach(addFromFile)
    existingFiles.filter((file) => !file.isGhost && file.progress.uploadComplete).forEach((file) => {
      void finishUploadedSession(file.id, file.meta.sessionId, file.meta.targetAlbum)
    })

    void apiRequest(`/api/memorials/${encodeURIComponent(options.memorialId)}/uploads/sessions?purpose=${options.purpose}`)
      .then((data) => {
        setItems((current) => {
          const known = new Set(current.map((item) => item.sessionId))
          const missing = (data.sessions || []).filter((session: SessionContract) => !known.has(session.id)).map((session: SessionContract) => initialItem(session))
          return dedupeUploadItems([...current, ...missing])
        })
        for (const session of (data.sessions || []) as SessionContract[]) {
          const localFile = uppy.getFiles().find((file) => file.meta.sessionId === session.id)
          const serverMayAlreadyHaveObject = ["uploaded", "verifying", "finalizing"].includes(session.status) ||
            !localFile || localFile.isGhost
          // Reconcile orphaned server sessions on refresh. This covers the
          // boundary where R2 completed the multipart object but the response
          // was lost before the database status advanced from `uploading`.
          if (serverMayAlreadyHaveObject) {
            void finishUploadedSession(localFile?.id || `session:${session.id}`, session.id, session.targetAlbum)
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
        candidate.meta.fingerprint === fingerprint && !candidate.isGhost,
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
          if (!recoveredFile.isGhost) {
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
    const item = items.find((candidate) => candidate.id === id)
    if (!item) return
    if (!item.sessionId) {
      const file = preparationFiles.current.get(id)
      if (!file) {
        patchItem(id, { canRetry: false, needsFile: true, error: "Choose the file again to restart this upload." })
        return
      }
      preparationFiles.current.delete(id)
      setItems((current) => current.filter((candidate) => candidate.id !== id))
      await addFiles([file])
      return
    }
    if (!item.needsFile && (!uppy?.getFile(id) || uppy.getFile(id)?.progress.uploadComplete)) {
      await finishUploadedSession(id, item.sessionId, item.targetAlbum)
      return
    }
    if (!uppy || item.needsFile) return
    try {
      await apiRequest(
        `/api/memorials/${encodeURIComponent(options.memorialId)}/uploads/sessions/${encodeURIComponent(item.sessionId)}/verify`,
        { method: "POST" },
      )
      await finishUploadedSession(id, item.sessionId, item.targetAlbum)
      return
    } catch (error) {
      const typed = error as Error & { code?: string }
      if (typed.code !== "upload_not_complete") {
        patchItem(id, { status: "error", error: friendlyUploadError(typed) })
        return
      }
    }
    const retryCount = (retryCounts.current.get(id) || 0) + 1
    retryCounts.current.set(id, retryCount)
    sendUploadTelemetry(options.memorialId, item.sessionId, "upload_resumed", {
      retry_count: retryCount,
      resume_count: retryCount,
    })
    patchItem(id, { status: "uploading", error: null })
    await uppy.retryUpload(id)
  }, [addFiles, finishUploadedSession, items, options.memorialId, patchItem])

  const cancel = useCallback(async (id: string) => {
    if (preparations.current.cancel(id)) {
      preparationFiles.current.delete(id)
      setItems((current) => current.filter((candidate) => candidate.id !== id))
      return
    }
    const item = items.find((candidate) => candidate.id === id)
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
    if (uppy?.getFile(id)) uppy.removeFile(id)
    preparationFiles.current.delete(id)
    setItems((current) => current.filter((candidate) => candidate.id !== id))
  }, [items, options.memorialId, patchItem])

  const dismiss = useCallback((id: string) => {
    preparationFiles.current.delete(id)
    setItems((current) => current.filter((item) => item.id !== id))
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
