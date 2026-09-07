import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { getSupabaseAdminSafe } from "@/utils/supabase/admin"
import { getDashboardIdentity } from "@/lib/auth/dashboard-identity"
import { getMemorialAccess } from "@/lib/memorial-auth"
import { MemorialEditorClient } from "@/components/editor/memorial-editor-client"
import { resolveMediaUrl } from "@/lib/r2"
import { sanitizeContributionHtml } from "@/lib/safety/contribution-html"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function MemorialEditorPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  const user = await getDashboardIdentity()

  if (!user) {
    redirect(`/login?next=/dashboard/memorials/${id}/editor`)
  }

  const access = await getMemorialAccess(id, user.id)
  if (!access?.canOpenStudio || !access.canEditEditorial) {
    redirect("/dashboard?access=denied")
  }

  const db = getSupabaseAdminSafe() || supabase

  // Fetch editor data only after the server-side capability check succeeds.
  const { data: memorial, error } = await db
    .from("memorials")
    .select("*")
    .eq("id", id)
    .single()

  if (error || !memorial) {
    redirect("/dashboard")
  }

  const { access_pin_hash: accessPinHash, ...safeMemorial } = memorial

  // 2. Fetch associated relations
  const [mediaRes, timelineRes, memoriesRes, caretakerMessagesRes] = await Promise.all([
    db.from("media_items").select("*").eq("memorial_id", id).order("order_index", { ascending: true }),
    db.from("timeline_events").select("*").eq("memorial_id", id).order("year", { ascending: true }),
    db.from("memories").select("*")
      .eq("memorial_id", id)
      .eq("status", "pending_approval")
      .or("safety_decision.is.null,safety_decision.neq.blocked")
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .range(0, 19),
    db.from("caretaker_messages").select("*").eq("memorial_id", id).order("created_at", { ascending: false }),
  ])

  return (
    <MemorialEditorClient
      currentUserId={user.id}
      accessRole={access.role === "co_admin" ? "co_admin" : "owner"}
      initialMemorial={{
        ...safeMemorial,
        portrait_photo_url: resolveMediaUrl(safeMemorial.portrait_photo_url),
        has_access_pin: Boolean(accessPinHash),
        can_manage_owner_settings: access.canManage,
      }}
      initialMediaItems={((mediaRes.data as any[]) || []).map((item) => ({
        ...item,
        url: resolveMediaUrl(item.url),
      }))}
      initialTimelineEvents={((timelineRes.data as any[]) || []).map((event) => ({
        ...event,
        photo_url: resolveMediaUrl(event.photo_url),
      }))}
      initialMemories={((memoriesRes.data as any[]) || []).map((item) => ({
        ...item,
        story: item.contribution_type === "story"
          ? sanitizeContributionHtml(item.story || "")
          : item.story,
      }))}
      initialCaretakerMessages={(caretakerMessagesRes.data as any[]) || []}
    />
  )
}
