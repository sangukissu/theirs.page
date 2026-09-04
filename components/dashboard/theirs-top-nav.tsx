"use client"

import React, { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Sparkles,
  Wand2,
  BookOpen,
  UsersRound,
  FolderOpen,
  ChevronDown,
  LogOut,
  Heart,
  ExternalLink,
} from "lucide-react"

interface TheirsTopNavProps {
  userEmail: string
  userId?: string
}

export function TheirsTopNav({ userEmail }: TheirsTopNavProps) {
  const pathname = usePathname()
  const [isStudioOpen, setIsStudioOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

  const studioRef = useRef<HTMLDivElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (studioRef.current && !studioRef.current.contains(e.target as Node)) {
        setIsStudioOpen(false)
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const initial = userEmail ? userEmail.charAt(0).toUpperCase() : "U"
  const isMemorialsActive = pathname === "/dashboard" || pathname.startsWith("/dashboard/memorials")
  const isStudioActive =
    pathname.startsWith("/dashboard/restore") ||
    pathname.startsWith("/dashboard/memory-book") ||
    pathname.startsWith("/dashboard/family-portrait") ||
    pathname.startsWith("/dashboard/my-media")

  return (
    <header className="h-16 border-b border-black/[0.06] bg-white/80 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between sticky top-0 z-40">
      {/* Left: Brand + Section Navigation */}
      <div className="flex items-center gap-4 sm:gap-6">
        <Link
          href="/"
          className="font-semibold tracking-tight text-[#181925] text-lg flex items-center gap-1.5 group select-none"
        >
          <span className="size-2 rounded-full bg-primary group-hover:scale-125 transition-transform" />
          <span>
            Theirs<span className="text-primary">.</span>
          </span>
        </Link>

        <span className="text-black/[0.12] hidden sm:inline">/</span>

        {/* Top-Level Section Tabs */}
        <nav className="flex items-center gap-1 sm:gap-2 text-xs">
          <Link
            href="/dashboard"
            prefetch={true}
            className={`px-3 py-1.5 rounded-full font-medium transition-colors ${
              isMemorialsActive && !isStudioActive
                ? "bg-black/[0.05] text-[#181925]"
                : "text-[#71717a] hover:text-[#181925] hover:bg-black/[0.03]"
            }`}
          >
            Memorials
          </Link>

          {/* Photo Studio Dropdown Menu */}
          <div className="relative" ref={studioRef}>
            <button
              type="button"
              onClick={() => setIsStudioOpen((prev) => !prev)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-medium transition-colors cursor-pointer ${
                isStudioActive
                  ? "bg-black/[0.05] text-[#181925]"
                  : "text-[#71717a] hover:text-[#181925] hover:bg-black/[0.03]"
              }`}
            >
              <Sparkles className="size-3 text-primary" />
              <span>Photo Studio</span>
              <ChevronDown
                className={`size-3 text-[#999] transition-transform duration-200 ${
                  isStudioOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            {isStudioOpen && (
              <div className="absolute left-0 mt-2 w-72 p-2 rounded-2xl bg-white border border-black/[0.08] shadow-xl shadow-black/5 animate-in fade-in-50 zoom-in-95 z-50 flex flex-col gap-1">
                <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-[#999]">
                  Family Media Tools
                </div>

                <Link
                  href="/dashboard/restore"
                  onClick={() => setIsStudioOpen(false)}
                  className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-neutral-50 transition-colors group"
                >
                  <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                    <Wand2 className="size-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-[#181925]">Restore Old Photos</span>
                    <span className="text-[11px] text-[#71717a] leading-tight">
                      Remove scratches, creases & enhance clarity
                    </span>
                  </div>
                </Link>

                <Link
                  href="/dashboard/memory-book"
                  onClick={() => setIsStudioOpen(false)}
                  className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-neutral-50 transition-colors group"
                >
                  <div className="size-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                    <BookOpen className="size-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-[#181925]">Memory Books</span>
                    <span className="text-[11px] text-[#71717a] leading-tight">
                      Curate printable & digital family albums
                    </span>
                  </div>
                </Link>

                <Link
                  href="/dashboard/family-portrait"
                  onClick={() => setIsStudioOpen(false)}
                  className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-neutral-50 transition-colors group"
                >
                  <div className="size-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                    <UsersRound className="size-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-[#181925]">Family Portrait</span>
                    <span className="text-[11px] text-[#71717a] leading-tight">
                      Composite across multiple generations
                    </span>
                  </div>
                </Link>

                <Link
                  href="/dashboard/my-media"
                  onClick={() => setIsStudioOpen(false)}
                  className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-neutral-50 transition-colors group border-t border-black/[0.04] mt-1 pt-2"
                >
                  <div className="size-8 rounded-lg bg-neutral-100 text-[#555] flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                    <FolderOpen className="size-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-[#181925]">Media Library</span>
                    <span className="text-[11px] text-[#71717a] leading-tight">
                      All uploaded photos & derivatives
                    </span>
                  </div>
                </Link>
              </div>
            )}
          </div>
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

              <form action="/api/auth/signout" method="POST" className="w-full">
                <button
                  type="submit"
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer text-left"
                >
                  <LogOut className="size-3.5" />
                  <span>Sign out</span>
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
