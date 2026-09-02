import { Heart, Clock, Lock, Download } from "lucide-react"

export function FeaturesBento() {
  return (
    <section id="features" className="py-16 sm:py-24 px-4 max-w-6xl mx-auto">
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
        <h2 className="text-balance text-3xl font-medium leading-[1.1] tracking-tight text-[#454545] sm:text-4xl">
          Designed for a person, not a database
        </h2>
        <p className="mt-3 text-pretty text-base text-muted-foreground">
          Traditional memorial websites look like funeral brochures with a guestbook. Theirs is an editorial archive built for human connection.
        </p>
      </div>

      {/* Clean Bento Grid (Zero heavy shadows) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6">
        {/* Bento 1: Memories Over Obituaries (Span 7) */}
        <div className="md:col-span-7 rounded-[28px] border border-border bg-[#f6f6f6] p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <div className="size-8 rounded-full bg-white border border-border flex items-center justify-center mb-4 text-[#ff2f00]">
              <Heart className="size-4" />
            </div>
            <h3 className="text-lg sm:text-xl font-medium tracking-tight text-[#454545]">
              Memories over obituaries
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed mt-2 max-w-lg">
              A photograph tells you what someone looked like. A memory tells you who they were. Friends and family contribute the real, imperfect stories that reveal their character.
            </p>
          </div>

          <div className="mt-6 p-3.5 rounded-2xl bg-white border border-border text-xs text-muted-foreground">
            <span className="font-medium text-[#454545]">Uncle David:</span> “He secretly slipped me ₹50 every time Dad wasn&apos;t looking and whispered not to spend it all on ice cream.”
          </div>
        </div>

        {/* Bento 2: Life Timeline (Span 5) */}
        <div className="md:col-span-5 rounded-[28px] border border-border bg-[#f6f6f6] p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <div className="size-8 rounded-full bg-white border border-border flex items-center justify-center mb-4 text-primary">
              <Clock className="size-4" />
            </div>
            <h3 className="text-lg sm:text-xl font-medium tracking-tight text-[#454545]">
              A life unfolding in time
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed mt-2">
              From childhood to their first job, marriage, and grandchildren. Stories and photographs anchor to milestones.
            </p>
          </div>

          <div className="mt-6 space-y-2">
            <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-white border border-border">
              <span className="font-mono text-muted-foreground/80">1952</span>
              <span className="font-medium text-[#454545]">Born in Jaipur</span>
              <span className="text-[11px] text-muted-foreground/60">Photo</span>
            </div>
            <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-white border border-border">
              <span className="font-mono text-muted-foreground/80">1974</span>
              <span className="font-medium text-[#454545]">Married Meena</span>
              <span className="text-[11px] text-muted-foreground/60">Story</span>
            </div>
          </div>
        </div>

        {/* Bento 3: Three Privacy Modes (Span 5) */}
        <div className="md:col-span-5 rounded-[28px] border border-border bg-[#f6f6f6] p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <div className="size-8 rounded-full bg-white border border-border flex items-center justify-center mb-4 text-purple-600">
              <Lock className="size-4" />
            </div>
            <h3 className="text-lg sm:text-xl font-medium tracking-tight text-[#454545]">
              Three simple privacy modes
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed mt-2">
              Public (discoverable on search engines), Unlisted (accessible only via private link), or Private (requires a secure family PIN).
            </p>
          </div>

          <div className="mt-6 flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full border border-border bg-white text-xs text-muted-foreground">Public</span>
            <span className="px-2.5 py-1 rounded-full border border-border bg-white text-xs text-muted-foreground">Unlisted link</span>
            <span className="px-2.5 py-1 rounded-full border border-border bg-white text-xs text-muted-foreground">Private PIN</span>
          </div>
        </div>

        {/* Bento 4: Never Trapped / Family Archive (Span 7) */}
        <div className="md:col-span-7 rounded-[28px] border border-border bg-[#f6f6f6] p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <div className="size-8 rounded-full bg-white border border-border flex items-center justify-center mb-4 text-emerald-600">
              <Download className="size-4" />
            </div>
            <h3 className="text-lg sm:text-xl font-medium tracking-tight text-[#454545]">
              Your family is never trapped
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed mt-2 max-w-lg">
              Download your complete archive anytime — original uncompressed photos, voicemails, timeline JSON, and a self-contained offline web viewer.
            </p>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-2 text-xs font-mono text-muted-foreground">
            <span className="px-2.5 py-1 rounded-lg bg-white border border-border">photos/ (original 4K)</span>
            <span className="px-2.5 py-1 rounded-lg bg-white border border-border">audio/ (voicemails)</span>
            <span className="px-2.5 py-1 rounded-lg bg-white border border-border">memorial.html (offline)</span>
          </div>
        </div>
      </div>
    </section>
  )
}
