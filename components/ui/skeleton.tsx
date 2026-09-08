import Image from "next/image"
import { cn } from "@/lib/utils"
import { CustomSpinner } from "@/components/ui/custom-spinner"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md bg-black/[0.04] dark:bg-white/[0.06] after:pointer-events-none after:absolute after:inset-0 after:-translate-x-full after:animate-silk-shimmer after:bg-gradient-to-r after:from-transparent after:via-white/70 after:to-transparent dark:after:via-white/10",
        className
      )}
      {...props}
    />
  )
}

function DashboardSkeleton() {
  return (
    <div className="w-full flex-1 min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center p-6 bg-[#fafafb] select-none">
      <div className="flex flex-col items-center gap-4 text-center">
        {/* Brand Logo with Ambient Glow */}
        <div className="relative flex items-center justify-center">
          <div
            aria-hidden="true"
            className="absolute -inset-4 rounded-3xl bg-primary/10 blur-xl pointer-events-none"
          />
          <Image
            src="/theirs-logo.svg"
            alt="Theirs"
            width={48}
            height={48}
            className="size-11 rounded-2xl relative z-10 select-none drop-shadow-xs"
            priority
          />
        </div>

        {/* Brand Domain: theirs.page */}
        <div className="flex flex-col items-center gap-1">
          <span className="font-heading font-medium tracking-tight text-[#181925] text-lg sm:text-xl">
            theirs<span className="text-primary font-semibold">.page</span>
          </span>
          <span className="text-[11px] text-[#8e9096] font-mono tracking-wider">
            Dedicated to a human life
          </span>
        </div>

        {/* Wave Bars Custom Spinner */}
        <div className="mt-2">
          <CustomSpinner barClassName="bg-primary/80" />
        </div>
      </div>
    </div>
  )
}

export { Skeleton, DashboardSkeleton, CustomSpinner }