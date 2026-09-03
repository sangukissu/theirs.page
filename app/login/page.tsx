import { redirect } from "next/navigation"
import LoginFormClient from "./login-form-client"
import { getDashboardIdentity } from "@/lib/auth/dashboard-identity"
import { sanitizeAuthDestination } from "@/lib/auth/redirect"

export const dynamic = "force-dynamic"

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>
}) {
  let nextPath = "/dashboard"

  try {
    const params = await searchParams
    nextPath = sanitizeAuthDestination(params?.next)
  } catch (err: any) {
    if (err?.digest === "DYNAMIC_SERVER_USAGE") throw err
    console.warn("[LoginPage] Failed to parse searchParams:", err)
  }

  try {
    const identity = await getDashboardIdentity()

    if (identity) {
      redirect(nextPath)
    }
  } catch (error: any) {
    if (error?.digest?.startsWith("NEXT_REDIRECT") || error?.digest === "DYNAMIC_SERVER_USAGE") {
      throw error
    }
    console.warn("[LoginPage] Session check encountered error, showing login form:", error)
  }

  return <LoginFormClient nextPath={nextPath} />
}
