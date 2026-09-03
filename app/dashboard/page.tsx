import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { getDashboardIdentity } from "@/lib/auth/dashboard-identity"
import { TheirsDashboardClient } from "@/components/dashboard/theirs-dashboard-client"

export default async function DashboardPage() {
  const supabase = await createClient()
  const user = await getDashboardIdentity()

  if (!user) {
    redirect("/login")
  }

  // Fetch memorials owned by user
  const { data: memorials } = await supabase
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

  return (
    <TheirsDashboardClient
      userEmail={user.email || ""}
      userId={user.id}
      initialMemorials={(memorials as any[]) || []}
    />
  )
}
