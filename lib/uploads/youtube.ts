export interface YouTubeReference {
  provider: "youtube"
  id: string
  url: string
}

const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/

export function parseYouTubeUrl(value: string): YouTubeReference | null {
  const raw = value.trim()
  if (!raw || raw.length > 2_048) return null
  try {
    const url = new URL(raw)
    const host = url.hostname.toLowerCase().replace(/^www\./, "")
    let id = ""
    if (host === "youtu.be") {
      id = url.pathname.split("/").filter(Boolean)[0] || ""
    } else if (host === "youtube.com" || host === "m.youtube.com" || host === "music.youtube.com") {
      if (url.pathname === "/watch") id = url.searchParams.get("v") || ""
      else {
        const match = url.pathname.match(/^\/(?:embed|shorts|live)\/([A-Za-z0-9_-]{11})(?:\/|$)/)
        id = match?.[1] || ""
      }
    } else {
      return null
    }
    if (!YOUTUBE_ID.test(id)) return null
    return { provider: "youtube", id, url: `https://www.youtube.com/watch?v=${id}` }
  } catch {
    return null
  }
}

