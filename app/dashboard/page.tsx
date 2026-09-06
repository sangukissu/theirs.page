import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { createClient } from "@/utils/supabase/server"
import { getSupabaseAdminSafe } from "@/utils/supabase/admin"
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

  // A dashboard is the set of memorials this account can currently access,
  // not only the memorials it owns.
  let memorials: any[] = []
  let caretakerName = ""
  try {
    const db = getSupabaseAdminSafe() || (await createClient())
    const [ownedResult, membershipsResult, profileResult] = await Promise.all([
      db.from("memorials").select(`
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
      db.from("collaborators")
        .select("memorial_id, role, is_trusted")
        .eq("user_id", user.id)
        .eq("invitation_accepted", true),
      db.from("user_profiles").select("full_name").eq("user_id", user.id).maybeSingle(),
    ])

    const memberships = membershipsResult.data || []
    const membershipIds = memberships.map((membership: any) => membership.memorial_id)
    const membershipMemorialResult = membershipIds.length
      ? await db.from("memorials").select(`
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
        `).in("id", membershipIds)
      : { data: [], error: null }

    const byId = new Map<string, any>()
    for (const owned of ownedResult.data || []) {
      byId.set(owned.id, { ...owned, access_role: "owner" })
    }
    for (const membershipMemorial of membershipMemorialResult.data || []) {
      if (byId.has(membershipMemorial.id)) continue
      const membership = memberships.find(
        (item: any) => item.memorial_id === membershipMemorial.id,
      )
      if (!membership) continue
      byId.set(membershipMemorial.id, {
        ...membershipMemorial,
        access_role:
          membership.role === "co_admin"
            ? "co_admin"
            : membership.is_trusted
              ? "trusted"
              : "contributor",
      })
    }

    memorials = Array.from(byId.values())
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      )
      .map((m: any) => ({
        ...m,
        portrait_photo_url: resolveMediaUrl(m.portrait_photo_url),
      }))
    caretakerName = profileResult.data?.full_name?.trim() || ""
  } catch (error) {
    console.error("Unable to load dashboard memorial access:", error)
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
