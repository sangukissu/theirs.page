import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { createClient } from "@/utils/supabase/server"
import { supabaseAdmin } from "@/utils/supabase/admin"
import { getDashboardIdentity } from "@/lib/auth/dashboard-identity"
import { resolveMediaUrl } from "@/lib/r2"
import { TheirsDashboardClient } from "@/components/dashboard/theirs-dashboard-client"

interface DashboardPageProps {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function DashboardPage(props: DashboardPageProps) {
  const user = await getDashboardIdentity()

  if (!user) {
    redirect("/login")
  }

  const searchParams = props.searchParams ? await props.searchParams : {}
  const rawName = typeof searchParams.name === "string" ? searchParams.name : ""
  const rawSlug = typeof searchParams.slug === "string" ? searchParams.slug : ""

  const cookieStore = await cookies()
  const cookieName = cookieStore.get("theirs_pending_name")?.value
  const cookieSlug = cookieStore.get("theirs_pending_slug")?.value

  const initialName = (rawName || (cookieName ? decodeURIComponent(cookieName) : "")).trim()
  const initialSlug = (rawSlug || (cookieSlug ? decodeURIComponent(cookieSlug) : "")).trim()

  // Fetch memorials owned by user with resilient fast querying
  let memorials: any[] = []
  let caretakerName = ""
  try {
    const [memorialResult, profileResult] = await Promise.all([
      supabaseAdmin.from("memorials").select(`
        id,
        slug,
        full_name,
        preferred_name,
        birth_year,
        death_year,
        headline,
        portrait_photo_url,
        status,
        privacy,
        is_paid,
        created_at
      `).eq("owner_id", user.id).order("created_at", { ascending: false }),
      supabaseAdmin.from("user_profiles").select("full_name").eq("user_id", user.id).maybeSingle(),
    ])

    if (!memorialResult.error && memorialResult.data) {
      memorials = memorialResult.data.map((m: any) => ({
        ...m,
        portrait_photo_url: resolveMediaUrl(m.portrait_photo_url),
      }))
    }
    caretakerName = profileResult.data?.full_name?.trim() || ""
  } catch {
    const supabase = await createClient()
    const [memorialResult, profileResult] = await Promise.all([
      supabase.from("memorials").select(`
        id,
        slug,
        full_name,
        preferred_name,
        birth_year,
        death_year,
        headline,
        portrait_photo_url,
        status,
        privacy,
        is_paid,
        created_at
      `).eq("owner_id", user.id).order("created_at", { ascending: false }),
      supabase.from("user_profiles").select("full_name").eq("user_id", user.id).maybeSingle(),
    ])

    if (memorialResult.data) {
      memorials = memorialResult.data.map((m: any) => ({
        ...m,
        portrait_photo_url: resolveMediaUrl(m.portrait_photo_url),
      }))
    }
    caretakerName = profileResult.data?.full_name?.trim() || ""
  }

  return (
    <TheirsDashboardClient
      userEmail={user.email || ""}
      userId={user.id}
      initialMemorials={memorials}
      initialName={initialName}
      initialSlug={initialSlug}
      initialCaretakerName={caretakerName}
    />
  )
}
