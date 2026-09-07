import "server-only"

import type { SupabaseClient } from "@supabase/supabase-js"

export const MEMORIAL_ORIGINAL_STORAGE_LIMIT_BYTES = 10 * 1024 * 1024 * 1024

export async function reserveMemorialStorage(
  db: SupabaseClient,
  memorialId: string,
  reservationKey: string,
  originalBytes: number
) {
  const { error } = await db.rpc("reserve_memorial_storage", {
    p_memorial_id: memorialId,
    p_reservation_key: reservationKey,
    p_original_bytes: originalBytes,
  })
  if (error) throw error
}

export async function reserveUploadSessionStorage(
  db: SupabaseClient,
  memorialId: string,
  reservationKey: string,
  originalBytes: number,
  expiresAt: string,
) {
  const { error } = await db.rpc("reserve_media_upload_session_storage", {
    p_memorial_id: memorialId,
    p_reservation_key: reservationKey,
    p_original_bytes: originalBytes,
    p_expires_at: expiresAt,
  })
  if (error) throw error
}

export async function finalizeMemorialStorage(
  db: SupabaseClient,
  memorialId: string,
  reservationKey: string,
  objectKey: string
) {
  const { error } = await db.rpc("finalize_memorial_storage", {
    p_memorial_id: memorialId,
    p_reservation_key: reservationKey,
    p_object_key: objectKey,
  })
  if (error) throw error
}

export async function releaseMemorialStorage(
  db: SupabaseClient,
  memorialId: string,
  storageKey: string
) {
  const { error } = await db.rpc("release_memorial_storage", {
    p_memorial_id: memorialId,
    p_storage_key: storageKey,
  })
  if (error) throw error
}

export function isStorageQuotaError(error: unknown): boolean {
  const candidate = error as { code?: string; message?: string }
  return candidate?.code === "P0001" || candidate?.message?.includes("10 GB") === true
}
