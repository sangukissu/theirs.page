import React from "react"
import { cn } from "@/lib/utils"

export interface CustomSpinnerProps {
  className?: string
  barClassName?: string
}

export const CustomSpinner = ({ className, barClassName }: CustomSpinnerProps) => {
  const bars = [
    { height: "8px", delay: "0s" },
    { height: "12px", delay: "0.1s" },
    { height: "16px", delay: "0.2s" },
    { height: "20px", delay: "0.3s" },
    { height: "16px", delay: "0.4s" },
    { height: "12px", delay: "0.5s" },
    { height: "8px", delay: "0.6s" },
  ]

  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn("flex items-end justify-center space-x-1 h-7 select-none", className)}
    >
      {/* Wave bars animation */}
      {bars.map((bar, i) => (
        <div
          key={i}
          className={cn("w-0.5 bg-black rounded-full animate-bounce", barClassName)}
          style={{ height: bar.height, animationDelay: bar.delay }}
        />
      ))}
    </div>
  )
}
