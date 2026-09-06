import { UserRound } from "lucide-react"

interface PortraitPlaceholderProps {
  fullName?: string
  prompt?: string
  className?: string
}

export function PortraitPlaceholder({
  fullName,
  prompt,
  className = "",
}: PortraitPlaceholderProps) {
  const initials = (fullName || "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")

  return (
    <div
      className={`flex size-full flex-col items-center justify-center gap-1 bg-gradient-to-br from-stone-100 to-stone-200 text-stone-500 ${className}`}
      role="img"
      aria-label={fullName ? `Portrait placeholder for ${fullName}` : "Portrait placeholder"}
    >
      {initials ? (
        <span className="font-serif text-3xl font-medium tracking-wide text-stone-600">{initials}</span>
      ) : (
        <UserRound className="size-8" strokeWidth={1.25} aria-hidden="true" />
      )}
      {prompt && <span className="px-2 text-center text-[11px] font-medium">{prompt}</span>}
    </div>
  )
}
