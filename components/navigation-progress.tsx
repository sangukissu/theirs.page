"use client"

import { useEffect, useState } from "react"
import { usePathname, useSearchParams } from "next/navigation"

export function NavigationProgress() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)

  // Complete progress on route change
  useEffect(() => {
    if (isLoading) {
      setProgress(100)
      const timer = setTimeout(() => {
        setIsLoading(false)
        setProgress(0)
      }, 200)
      return () => clearTimeout(timer)
    }
  }, [pathname, searchParams])

  // Listen to clicks on internal links to start progress immediately
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = (e.target as HTMLElement).closest("a")
      if (!target) return

      const href = target.getAttribute("href")
      if (!href) return

      // Skip external links, hash anchors, new tabs, and mailto/tel
      if (
        href.startsWith("#") ||
        href.startsWith("http://") ||
        href.startsWith("https://") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        target.getAttribute("target") === "_blank" ||
        e.ctrlKey ||
        e.metaKey ||
        e.shiftKey
      ) {
        return
      }

      // Check if navigating to the same path
      const currentUrl = window.location.pathname + window.location.search
      if (href === currentUrl) return

      setIsLoading(true)
      setProgress(25)

      const timer1 = setTimeout(() => setProgress(65), 150)
      const timer2 = setTimeout(() => setProgress(85), 350)

      return () => {
        clearTimeout(timer1)
        clearTimeout(timer2)
      }
    }

    document.addEventListener("click", handleClick, { capture: true })
    return () => document.removeEventListener("click", handleClick, { capture: true })
  }, [])

  if (!isLoading && progress === 0) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none h-[2.5px] bg-transparent">
      <div
        className="h-full bg-primary shadow-[0_0_8px_var(--primary)] transition-all duration-200 ease-out"
        style={{
          width: `${progress}%`,
          opacity: progress === 100 ? 0 : 1,
        }}
      />
    </div>
  )
}
