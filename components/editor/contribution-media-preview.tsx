interface ContributionMediaPreviewProps {
  src: string
  mime?: string
  compact?: boolean
}

export function ContributionMediaPreview({
  src,
  mime,
  compact = false,
}: ContributionMediaPreviewProps) {
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
