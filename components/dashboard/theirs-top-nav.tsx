"use client"

import React, { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import {
  ChevronDown,
  LogOut,
  Heart,
} from "lucide-react"
import Image from "next/image"

interface TheirsTopNavProps {
  userEmail: string
  userId?: string
}

export function TheirsTopNav({ userEmail }: TheirsTopNavProps) {
  const pathname = usePathname()
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)

  const userMenuRef = useRef<HTMLDivElement>(null)

  const handleSignOut = async () => {
    setIsSigningOut(true)
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
    } catch (err) {
      console.error("Sign out error:", err)
    } finally {
      window.location.href = "/"
    }
  }

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const initial = userEmail ? userEmail.charAt(0).toUpperCase() : "U"
  const isMemorialsActive = pathname === "/dashboard" || pathname.startsWith("/dashboard/memorials")

  return (
    <header className="h-16 border-b border-black/[0.06] bg-white/80 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between sticky top-0 z-40">
      {/* Left: Brand + Section Navigation */}
      <div className="flex items-center gap-4 sm:gap-6">
        <Link href="/" className="flex items-center group">
          <Image src="/theirs-logo.svg" alt="Theirs" width={18} height={18} />
          <span className="font-semibold tracking-tight text-[#181925] text-lg ml-1 mt-0.5">
            Theirs<span className="text-primary">.</span>
          </span>
        </Link>

        <span className="text-black/[0.12] hidden sm:inline">/</span>

        {/* Top-Level Section Tabs */}
        <nav className="flex items-center gap-1 sm:gap-2 text-xs">
          <Link
            href="/dashboard"
            prefetch={true}
            className={`px-3 py-1.5 rounded-full font-medium transition-colors ${isMemorialsActive
              ? "bg-black/[0.05] text-[#181925]"
              : "text-[#71717a] hover:text-[#181925] hover:bg-black/[0.03]"
              }`}
          >
            Memorials
          </Link>
        </nav>
      </div>

      {/* Right: User Identity & Account Actions */}
      <div className="flex items-center gap-3">
        <div className="relative" ref={userMenuRef}>
          <button
            type="button"
            onClick={() => setIsUserMenuOpen((prev) => !prev)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-full hover:bg-black/[0.04] transition-colors cursor-pointer"
          >
            <div className="size-7 rounded-full bg-[#181925] text-white flex items-center justify-center text-xs font-medium shrink-0">
              {initial}
            </div>
            <span className="text-xs text-[#71717a] hidden md:inline font-medium max-w-[160px] truncate">
              {userEmail}
            </span>
            <ChevronDown className="size-3 text-[#888] hidden sm:inline" />
          </button>

          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 p-2 rounded-2xl bg-white border border-black/[0.08] shadow-xl shadow-black/5 animate-in fade-in-50 zoom-in-95 z-50 flex flex-col gap-1">
              <div className="px-3 py-2 border-b border-black/[0.05]">
                <div className="text-[11px] text-[#888] font-mono">Signed in as</div>
                <div className="text-xs font-medium text-[#181925] truncate">{userEmail}</div>
              </div>

              <Link
                href="/dashboard"
                onClick={() => setIsUserMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-[#181925] hover:bg-neutral-50 transition-colors"
              >
                <Heart className="size-3.5 text-primary" />
                <span>Your Memorials</span>
              </Link>

              <button
                type="button"
                disabled={isSigningOut}
                onClick={handleSignOut}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer text-left disabled:opacity-50"
              >
                <LogOut className="size-3.5" />
                <span>{isSigningOut ? "Signing out..." : "Sign out"}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
