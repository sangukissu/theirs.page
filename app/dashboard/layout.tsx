import type React from "react"
import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import { DashboardSkeleton } from "@/components/ui/skeleton"
import { getDashboardIdentity } from "@/lib/auth/dashboard-identity"
import { TheirsDashboardShell } from "@/components/dashboard/theirs-dashboard-shell"

export const metadata: Metadata = {
  title: "Dashboard | Theirs",
  description: "Quiet, dedicated places on the internet honoring the people you love.",
  robots: { index: false, follow: false },
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getDashboardIdentity()

  if (!user) {
    redirect("/login")
  }

  const layoutUser = {
    name: user.email?.split("@")[0] || "User",
    email: user.email || "",
    avatar: "/avatar1.webp",
    id: user.id,
  }

  return (
    <TheirsDashboardShell user={layoutUser}>
      <Suspense fallback={<DashboardSkeleton />}>
        {children}
      </Suspense>
    </TheirsDashboardShell>
  )
}
