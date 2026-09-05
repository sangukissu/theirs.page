import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { getDashboardIdentity } from "@/lib/auth/dashboard-identity"
import { MemorialEditorClient } from "@/components/editor/memorial-editor-client"

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

  // 1. Fetch Memorial
  const { data: memorial, error } = await supabase
    .from("memorials")
    .select("*")
    .eq("id", id)
    .single()

  if (error || !memorial) {
    redirect("/dashboard")
  }

  // 2. Fetch associated relations
  const [mediaRes, timelineRes, memoriesRes, caretakerMessagesRes] = await Promise.all([
    supabase.from("media_items").select("*").eq("memorial_id", id).order("order_index", { ascending: true }),
    supabase.from("timeline_events").select("*").eq("memorial_id", id).order("year", { ascending: true }),
    supabase.from("memories").select("*").eq("memorial_id", id).order("created_at", { ascending: false }),
    supabase.from("caretaker_messages").select("*").eq("memorial_id", id).order("created_at", { ascending: false }),
  ])

  return (
    <MemorialEditorClient
      initialMemorial={memorial}
      initialMediaItems={(mediaRes.data as any[]) || []}
      initialTimelineEvents={(timelineRes.data as any[]) || []}
      initialMemories={(memoriesRes.data as any[]) || []}
      initialCaretakerMessages={(caretakerMessagesRes.data as any[]) || []}
    />
  )
}
