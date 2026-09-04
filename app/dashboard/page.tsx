import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { supabaseAdmin } from "@/utils/supabase/admin"
import { getDashboardIdentity } from "@/lib/auth/dashboard-identity"
import { TheirsDashboardClient } from "@/components/dashboard/theirs-dashboard-client"

export default async function DashboardPage() {
  const user = await getDashboardIdentity()

  if (!user) {
    redirect("/login")
  }

  // Fetch memorials owned by user with resilient fast querying
  let memorials: any[] = []
  try {
    const { data, error } = await supabaseAdmin
      .from("memorials")
      .select(`
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
      `)
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false })

    if (!error && data) {
      memorials = data
    }
  } catch {
    const supabase = await createClient()
    const { data } = await supabase
      .from("memorials")
      .select(`
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
      `)
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false })

    if (data) {
      memorials = data
    }
  }

  return (
    <TheirsDashboardClient
      userEmail={user.email || ""}
      userId={user.id}
      initialMemorials={memorials}
    />
  )
}
