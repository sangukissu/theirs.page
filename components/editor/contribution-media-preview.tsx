import { YouTubeEmbed } from "@/components/consent/youtube-embed"
import { ExternalLink } from "lucide-react"

interface ContributionMediaPreviewProps {
  src?: string | null
  mime?: string
  compact?: boolean
  externalVideoId?: string | null
  externalUrl?: string | null
}

export function ContributionMediaPreview({
  src,
  mime,
  compact = false,
  externalVideoId,
  externalUrl,
}: ContributionMediaPreviewProps) {
  if (externalVideoId) {
    return (
      <div className={`flex flex-col gap-1.5 ${compact ? "w-full max-w-xs" : "w-full max-w-sm"}`}>
        <div className="overflow-hidden rounded-xl shadow-xs">
          <YouTubeEmbed videoId={externalVideoId} title="Contributed YouTube video" />
        </div>
        {externalUrl && (
          <a
            href={externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline self-start"
          >
            <ExternalLink className="size-3" />
            <span>Watch on YouTube</span>
          </a>
        )}
      </div>
    )
  }

  if (!src) return null

  if (mime?.startsWith("audio/")) {
    return (
      <audio
        src={src}
        controls
        preload="metadata"
        className={compact ? "h-10 w-full max-w-sm" : "h-11 w-full max-w-md"}
      />
    )
  }

  if (mime?.startsWith("video/")) {
    return (
      <video
        src={src}
        controls
        preload="metadata"
        className={compact
          ? "max-h-44 w-auto max-w-full rounded-xl bg-black object-contain"
          : "max-h-72 w-auto max-w-full rounded-xl bg-black object-contain"}
      />
    )
  }

  return (
    <img
      src={src}
      alt="Contributed photograph"
      className={compact
        ? "h-24 w-auto rounded-xl object-cover border border-black/[0.08]"
        : "h-28 w-auto rounded-xl object-cover border border-black/[0.08]"}
    />
  )
}
