import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createClient } from "@/utils/supabase/server"
import { getSupabaseAdminSafe } from "@/utils/supabase/admin"
import { getAuthorizedUploadSession, UploadSessionError } from "@/lib/uploads/upload-session"

interface RouteContext { params: Promise<{ id: string; sessionId: string }> }

const telemetrySchema = z.object({
  event: z.enum(["upload_prepared", "upload_resumed", "upload_client_complete", "upload_failed"]),
  prepare_ms: z.number().int().min(0).max(60 * 60 * 1000).optional(),
  upload_ms: z.number().int().min(0).max(24 * 60 * 60 * 1000).optional(),
  effective_mbps: z.number().min(0).max(100_000).optional(),
  retry_count: z.number().int().min(0).max(1_000).optional(),
  resume_count: z.number().int().min(0).max(1_000).optional(),
  failure_stage: z.enum(["capability", "quota", "create", "sign", "upload_part", "complete", "verify", "finalize"]).optional(),
  http_status: z.number().int().min(100).max(599).optional(),
  error_code: z.string().trim().regex(/^[a-z0-9_-]{1,80}$/i).optional(),
}).strict()

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const { id, sessionId } = await context.params
    const auth = await createClient()
    const { data: { user } } = await auth.auth.getUser()
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 })
    const db = getSupabaseAdminSafe()
    if (!db) return NextResponse.json({ error: "Telemetry unavailable." }, { status: 503 })
    const body = telemetrySchema.safeParse(await req.json().catch(() => ({})))
    if (!body.success) return NextResponse.json({ error: "Invalid telemetry event." }, { status: 400 })
    const { session, access } = await getAuthorizedUploadSession(db, sessionId, user.id, id)

    // Deliberately emit only allow-listed operational fields. Never include the
    // source filename, memorial name, captions, or contribution text.
    console.info(`[media-upload] ${body.data.event}`, {
      actor_role: access.role,
      purpose: session.purpose,
      media_type: session.media_type,
      bytes: Number(session.file_size),
      transport: `${session.upload_mode}_direct`,
      ...body.data,
    })
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    if (error instanceof UploadSessionError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.status })
    }
    return NextResponse.json({ error: "Telemetry unavailable." }, { status: 503 })
  }
}
