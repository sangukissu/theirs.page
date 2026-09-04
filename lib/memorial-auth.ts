import { NextResponse } from "next/server"
import { getSupabaseAdminSafe } from "@/utils/supabase/admin"
import { createClient } from "@/utils/supabase/server"

export interface MemorialAuthResult {
  authorized: boolean
  status: number
  error?: string
  memorial?: any
  role?: "owner" | "co_admin"
}

export interface AssertAdminResult {
  authorized: boolean
  errorResponse: NextResponse | null
  error?: string
  memorial: any | null
  isOwner?: boolean
}

/**
 * Verifies whether a user is the primary owner (steward) of a memorial.
 */
export async function verifyMemorialOwner(
  memorialId: string,
  userId: string
): Promise<MemorialAuthResult> {
  if (!memorialId || !userId) {
    return { authorized: false, status: 401, error: "Unauthorized" }
  }

  const db = getSupabaseAdminSafe() || (await createClient())

  try {
    const { data: memorial, error } = await db
      .from("memorials")
      .select("id, owner_id, slug, status, privacy, is_paid")
      .eq("id", memorialId)
      .maybeSingle()

    if (error || !memorial) {
      return { authorized: false, status: 404, error: "Memorial not found" }
    }

    if (memorial.owner_id === userId) {
      return { authorized: true, status: 200, memorial, role: "owner" }
    }

    return {
      authorized: false,
      status: 403,
      error: "Forbidden: Only the primary memorial steward (creator/owner) has permission to manage these core settings.",
    }
  } catch (err) {
    console.error("verifyMemorialOwner error:", err)
    return { authorized: false, status: 500, error: "Internal server error" }
  }
}

export async function assertMemorialOwner(
  memorialId: string,
  userId: string
): Promise<AssertAdminResult> {
  const result = await verifyMemorialOwner(memorialId, userId)
  if (!result.authorized) {
    return {
      authorized: false,
      error: result.error,
      errorResponse: NextResponse.json({ error: result.error }, { status: result.status }),
      memorial: null,
      isOwner: false,
    }
  }
  return {
    authorized: true,
    errorResponse: null,
    error: undefined,
    memorial: result.memorial,
    isOwner: true,
  }
}

/**
 * Verifies whether a user is authorized as an administrator (owner or accepted co_admin)
 * for a specific memorial.
 */
export async function verifyMemorialAdmin(
  memorialId: string,
  userId: string
): Promise<MemorialAuthResult> {
  if (!memorialId || !userId) {
    return {
      authorized: false,
      status: 401,
      error: "Unauthorized",
    }
  }

  const db = getSupabaseAdminSafe() || (await createClient())

  try {
    // 1. Check if user is the direct owner of the memorial
    const { data: memorial, error: memorialError } = await db
      .from("memorials")
      .select("id, owner_id, slug, status, privacy, is_paid")
      .eq("id", memorialId)
      .maybeSingle()

    if (memorialError || !memorial) {
      return {
        authorized: false,
        status: 404,
        error: "Memorial not found",
      }
    }

    if (memorial.owner_id === userId) {
      return {
        authorized: true,
        status: 200,
        memorial,
        role: "owner",
      }
    }

    // 2. Check if user is an accepted co_admin collaborator
    const { data: collaborator } = await db
      .from("collaborators")
      .select("id, role, invitation_accepted")
      .eq("memorial_id", memorialId)
      .eq("user_id", userId)
      .eq("role", "co_admin")
      .eq("invitation_accepted", true)
      .maybeSingle()

    if (collaborator) {
      return {
        authorized: true,
        status: 200,
        memorial,
        role: "co_admin",
      }
    }

    return {
      authorized: false,
      status: 403,
      error: "Forbidden: You do not have permission to manage this memorial.",
    }
  } catch (err) {
    console.error("verifyMemorialAdmin error:", err)
    return {
      authorized: false,
      status: 500,
      error: "Internal server error during authorization check.",
    }
  }
}

/**
 * Guard function that returns an errorResponse if unauthorized,
 * or { authorized: true, errorResponse: null, memorial, isOwner } if authorized.
 */
export async function assertMemorialAdmin(
  memorialId: string,
  userId: string
): Promise<AssertAdminResult> {
  const result = await verifyMemorialAdmin(memorialId, userId)
  if (!result.authorized) {
    return {
      authorized: false,
      error: result.error,
      errorResponse: NextResponse.json({ error: result.error }, { status: result.status }),
      memorial: null,
      isOwner: false,
    }
  }
  return {
    authorized: true,
    errorResponse: null,
    error: undefined,
    memorial: result.memorial,
    isOwner: result.role === "owner",
  }
}
