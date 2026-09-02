import React from "react"

interface SectionHeaderProps {
  badge: string
  title: React.ReactNode
  description: string
  className?: string
}

export function SectionHeader({
  badge,
  title,
  description,
  className = "",
}: SectionHeaderProps) {
  return (
    <div className={`flex flex-col items-center text-center gap-4 sm:gap-5 ${className}`}>
      <span
        data-slot="badge"
        className="flex items-center justify-center border font-medium w-fit whitespace-nowrap border-transparent bg-neutral-100 text-[#666] h-[24px] min-w-[24px] text-xs px-2.5 rounded-md select-none"
      >
        {badge}
      </span>
      <h2 className="text-3xl sm:text-4xl tracking-tighter text-[#181925] leading-tight font-medium text-balance max-w-xl">
        {title}
      </h2>
      <p className="w-full max-w-lg font-medium text-base sm:text-lg/6 text-[#666]">
        {description}
      </p>
    </div>
  )
}
