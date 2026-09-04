import { Suspense } from "react"
import LoginFormClient from "./login-form-client"

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="size-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      }
    >
      <LoginFormClient />
    </Suspense>
  )
}
