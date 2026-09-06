"use client"

import { useEffect, useRef, useState } from "react"
import { usePathname, useSearchParams } from "next/navigation"

export function NavigationProgress() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [state, setState] = useState<{
    visible: boolean
    progress: number
    completing: boolean
  }>({
    visible: false,
    progress: 0,
    completing: false,
  })

  // All active timer IDs are stored in a ref array so we can guarantee 100% clean teardown
  const timersRef = useRef<NodeJS.Timeout[]>([])
  const previousUrlRef = useRef<string | null>(null)

  const clearAllTimers = () => {
    timersRef.current.forEach((t) => clearTimeout(t))
    timersRef.current = []
  }

  const addTimer = (fn: () => void, delay: number) => {
    const id = setTimeout(() => {
      timersRef.current = timersRef.current.filter((t) => t !== id)
      fn()
    }, delay)
    timersRef.current.push(id)
    return id
  }

  const complete = () => {
    clearAllTimers()
    setState((prev) => {
      if (!prev.visible && prev.progress === 0) return prev
      return { visible: true, progress: 100, completing: true }
    })

    // After the bar reaches 100% and opacity fades out, reset to idle
    addTimer(() => {
      setState({ visible: false, progress: 0, completing: false })
    }, 400)
  }

  const start = () => {
    clearAllTimers()
    setState({ visible: true, progress: 25, completing: false })

    // Progressive trickle steps
    addTimer(() => {
      setState((prev) => (prev.visible && !prev.completing ? { ...prev, progress: 55 } : prev))
    }, 150)

    addTimer(() => {
      setState((prev) => (prev.visible && !prev.completing ? { ...prev, progress: 75 } : prev))
    }, 350)

    addTimer(() => {
      setState((prev) => (prev.visible && !prev.completing ? { ...prev, progress: 85 } : prev))
    }, 800)

    // Absolute failsafe timeout: if route doesn't change or stalls within 3.5s, auto-complete and fade out
    addTimer(() => {
      complete()
    }, 3500)
  }

  // Detect route changes (pathname or searchParams)
  useEffect(() => {
    const currentUrl = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "")

    // If this is the initial mount, just store the URL and do nothing
    if (previousUrlRef.current === null) {
      previousUrlRef.current = currentUrl
      return
    }

    if (currentUrl !== previousUrlRef.current) {
      previousUrlRef.current = currentUrl
      // Navigation finished! Complete progress bar immediately
      complete()
    }
  }, [pathname, searchParams])

  // Listen to clicks on internal links to start progress immediately
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      // Only handle primary (left) mouse click
      if (e.button !== 0) return

      const target = (e.target as HTMLElement).closest("a")
      if (!target) return

      const href = target.getAttribute("href")
      if (!href) return

      // Skip external links, hash-only anchors, new tabs, mailto/tel, and download links
      if (
        href.startsWith("#") ||
        href.startsWith("http://") ||
        href.startsWith("https://") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        href.startsWith("javascript:") ||
        target.getAttribute("target") === "_blank" ||
        target.hasAttribute("download") ||
        e.ctrlKey ||
        e.metaKey ||
        e.shiftKey ||
        e.altKey ||
        e.defaultPrevented
      ) {
        return
      }

      // Check if navigating to the exact same page & search params
      try {
        const url = new URL(href, window.location.href)
        const currentUrl = window.location.pathname + window.location.search
        const targetUrl = url.pathname + url.search

        // If it's just a hash change on the same page, ignore
        if (targetUrl === currentUrl) return
      } catch {
        return
      }

      start()
    }

    function handlePopState() {
      start()
    }

    document.addEventListener("click", handleClick, { capture: true })
    window.addEventListener("popstate", handlePopState)

    return () => {
      clearAllTimers()
      document.removeEventListener("click", handleClick, { capture: true })
      window.removeEventListener("popstate", handlePopState)
    }
  }, [])

  if (!state.visible && state.progress === 0) return null

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none h-[2.5px] bg-transparent transition-opacity duration-300 ease-out"
      style={{
        opacity: state.completing ? 0 : 1,
      }}
    >
      <div
        className="h-full bg-primary shadow-[0_0_8px_var(--primary)] transition-[width] ease-out"
        style={{
          width: `${state.progress}%`,
          transitionDuration: state.completing ? "200ms" : "250ms",
        }}
      />
    </div>
  )
}
