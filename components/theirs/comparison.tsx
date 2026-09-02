import { Check, X, Minus } from "lucide-react"

export function TheirsComparison() {
  const features = [
    {
      name: "Dedicated life archive (not an obituary)",
      theirs: true,
      funeral: false,
      social: "partial",
      cloud: false,
    },
    {
      name: "Collaborative memories without account creation",
      theirs: true,
      funeral: false,
      social: false,
      cloud: false,
    },
    {
      name: "Clean editorial design (no funeral ads or clip art)",
      theirs: true,
      funeral: false,
      social: false,
      cloud: true,
    },
    {
      name: "Download complete archive anytime (no lock-in)",
      theirs: true,
      funeral: false,
      social: false,
      cloud: true,
    },
    {
      name: "Long-term successor stewardship",
      theirs: true,
      funeral: false,
      social: false,
      cloud: false,
    },
    {
      name: "Pay once — no recurring monthly subscription",
      theirs: true,
      funeral: false,
      social: true,
      cloud: false,
    },
  ]

  return (
    <section className="py-16 sm:py-24 px-4 max-w-5xl mx-auto">
      <div className="text-center max-w-xl mx-auto mb-12">
        <h2 className="text-balance text-3xl font-medium leading-[1.1] tracking-tight text-[#454545] sm:text-4xl">
          How Theirs compares
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Built from the ground up to be the most respectful place for someone&apos;s story.
        </p>
      </div>

      <div className="rounded-md border border-border overflow-x-auto bg-white">
        <table className="w-full text-left border-collapse min-w-[580px]">
          <thead>
            <tr className="border-b border-border bg-[#f6f6f6]">
              <th className="py-3.5 px-5 text-xs font-medium text-muted-foreground">Capability</th>
              <th className="py-3.5 px-4 text-xs font-medium text-primary text-center bg-primary/5">
                Theirs
              </th>
              <th className="py-3.5 px-4 text-xs font-medium text-muted-foreground text-center">
                Funeral Homes
              </th>
              <th className="py-3.5 px-4 text-xs font-medium text-muted-foreground text-center">
                Social Media
              </th>
              <th className="py-3.5 px-4 text-xs font-medium text-muted-foreground text-center">
                Cloud Drives
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-xs sm:text-sm">
            {features.map((item, index) => (
              <tr key={index} className="hover:bg-[#f6f6f6]/50 transition-colors">
                <td className="py-3.5 px-5 font-normal text-[#454545]">{item.name}</td>

                {/* Theirs */}
                <td className="py-3.5 px-4 text-center bg-primary/5">
                  <div className="flex justify-center">
                    <span className="size-3.5 rounded-full bg-primary flex items-center justify-center">
                      <Check className="size-2 text-white stroke-[3]" />
                    </span>
                  </div>
                </td>

                {/* Funeral */}
                <td className="py-3.5 px-4 text-center">
                  <div className="flex justify-center">
                    <span className="size-3.5 rounded-full border border-border flex items-center justify-center">
                      <X className="size-2 text-muted-foreground/60" />
                    </span>
                  </div>
                </td>

                {/* Social */}
                <td className="py-3.5 px-4 text-center">
                  <div className="flex justify-center">
                    {item.social === true ? (
                      <span className="size-3.5 rounded-full bg-neutral-300" />
                    ) : item.social === "partial" ? (
                      <span className="size-3.5 rounded-full border border-amber-400 flex items-center justify-center">
                        <Minus className="size-2 text-amber-500" />
                      </span>
                    ) : (
                      <span className="size-3.5 rounded-full border border-border flex items-center justify-center">
                        <X className="size-2 text-muted-foreground/60" />
                      </span>
                    )}
                  </div>
                </td>

                {/* Cloud */}
                <td className="py-3.5 px-4 text-center">
                  <div className="flex justify-center">
                    {item.cloud ? (
                      <span className="size-3.5 rounded-full bg-neutral-300" />
                    ) : (
                      <span className="size-3.5 rounded-full border border-border flex items-center justify-center">
                        <X className="size-2 text-muted-foreground/60" />
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
