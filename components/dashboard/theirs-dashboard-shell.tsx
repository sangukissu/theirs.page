"use client"

import React from "react"
import { usePathname } from "next/navigation"
import { TheirsTopNav } from "./theirs-top-nav"

interface TheirsDashboardShellProps {
  user: {
    name: string
    email: string
    avatar: string
    id: string
  }
  children: React.ReactNode
}

export function TheirsDashboardShell({ user, children }: TheirsDashboardShellProps) {
  const pathname = usePathname()
  const isEditor = pathname.includes("/editor")

  return (
    <div className="min-h-screen bg-[#fafafb] text-[#181925] flex flex-col">
      {!isEditor && <TheirsTopNav userEmail={user.email} userId={user.id} />}
      <div className="flex-1 flex flex-col w-full">{children}</div>
    </div>
  )
}
