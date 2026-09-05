"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

const destinations: Record<string, string> = { timeline: "timeline", gallery: "gallery", memories: "memories", tributes: "tributes" }

export function LegacyHashRedirect({ slug }: { slug: string }) {
  const router = useRouter()
  useEffect(() => {
    const destination = destinations[window.location.hash.slice(1)]
    if (destination) {
      const preview = new URL(window.location.href).searchParams.get("preview") === "visitor" ? "?preview=visitor" : ""
      const [path, hash] = destination.split("#")
      router.replace(`/${slug}/${path}${preview}${hash ? `#${hash}` : ""}`)
    }
  }, [router, slug])
  return null
}
