import Link from "next/link"

export function TheirsHero() {
  return (
    <section className="pt-20 pb-12 sm:pt-28 sm:pb-16 px-4 text-center">
      <div className="max-w-4xl mx-auto">
        {/* Subtle Badge */}
        <div className="mb-6 flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs text-muted-foreground bg-white">
            <span className="size-1.5 rounded-full bg-primary" />
            <span>Dedicated to a human life</span>
          </div>
        </div>

        {/* Exact Headline Classes from getopen.so */}
        <h1 className="text-balance text-3xl font-medium leading-[1.1] tracking-tight text-[#454545] sm:text-6xl sm:leading-[1.06]">
          A person is more than{" "}
          <span className="text-primary">two dates on a stone.</span>
        </h1>

        {/* Exact Description Classes from getopen.so */}
        <div className="reveal">
          <p className="mx-auto mt-5 max-w-2xl text-pretty text-lg leading-7 text-muted-foreground sm:text-2xl sm:leading-8">
            Reconstruct the texture of who someone was{" "}
            <span className="rounded-md bg-primary/10 box-decoration-clone px-1 py-0.5 text-primary">
              without the complexity
            </span>{" "}
            and gloom of funeral obituaries.
          </p>

          {/* Exact Button Block from getopen.so */}
          <div className="mt-7 flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center">
            {/* Primary Button */}
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-1 whitespace-nowrap !rounded-full font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] cursor-pointer border border-[color-mix(in_srgb,var(--primary)_80%,#3a3480)] bg-[color-mix(in_srgb,var(--primary)_90%,#3a3480)] text-primary-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.22),inset_0_-1px_0_rgba(58,52,128,0.30)] transform-gpu hover:bg-primary hover:border-[color-mix(in_srgb,var(--primary)_70%,#3a3480)] active:translate-y-px active:scale-[0.98] active:bg-[color-mix(in_srgb,var(--primary)_90%,#3a3480)] active:shadow-[inset_0_1px_0_rgba(255,255,255,0.14),inset_0_-1px_0_rgba(58,52,128,0.26)] h-9 px-4 py-1.5 text-sm group"
              data-slot="button"
            >
              Get Started Free
              <span className="relative -mr-1 inline-flex size-4 shrink-0 items-center justify-center overflow-hidden">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  color="currentColor"
                  className="absolute transition-all duration-200 ease-out group-hover:translate-x-3 group-hover:opacity-0"
                >
                  <path
                    d="M9.00005 6C9.00005 6 15 10.4189 15 12C15 13.5812 9 18 9 18"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                  />
                </svg>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  color="currentColor"
                  className="absolute -translate-x-3 opacity-0 transition-all duration-200 ease-out group-hover:translate-x-0 group-hover:opacity-100"
                >
                  <path
                    d="M18.5 12L4.99997 12"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M13 18C13 18 19 13.5811 19 12C19 10.4188 13 6 13 6"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                  />
                </svg>
              </span>
            </Link>

            {/* Micro Caption */}
            <p className="order-1 w-full text-xs text-muted-foreground/80 mt-1">
              No card required. Free to begin.
            </p>

            {/* Secondary Button */}
            <a
              href="#sample"
              className="inline-flex items-center justify-center gap-1 whitespace-nowrap !rounded-full font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] cursor-pointer border border-transparent bg-secondary text-secondary-foreground transform-gpu hover:bg-[color-mix(in_srgb,var(--secondary)_95%,var(--ink))] active:translate-y-px active:scale-[0.98] h-9 px-4 py-1.5 text-sm group"
              data-slot="button"
            >
              See sample
              <span className="relative -mr-1 inline-flex size-4 shrink-0 items-center justify-center overflow-hidden">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  color="currentColor"
                  className="absolute transition-all duration-200 ease-out group-hover:translate-x-3 group-hover:-translate-y-3 group-hover:opacity-0"
                >
                  <path
                    d="M9 6.65032C9 6.65032 15.9383 6.10759 16.9154 7.08463C17.8924 8.06167 17.3496 15 17.3496 15M16.5 7.5L6.5 17.5"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                  />
                </svg>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  color="currentColor"
                  className="absolute -translate-x-3 translate-y-3 opacity-0 transition-all duration-200 ease-out group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100"
                >
                  <path
                    d="M9 6.65032C9 6.65032 15.9383 6.10759 16.9154 7.08463C17.8924 8.06167 17.3496 15 17.3496 15M16.5 7.5L6.5 17.5"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                  />
                </svg>
              </span>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
