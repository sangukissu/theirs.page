"use client"

interface MemorialStoryProps {
  fullName: string
  biography?: string | null
  isDemo?: boolean
}

function formatBiographyHtml(input?: string | null): string {
  if (!input || !input.trim()) return ""

  let text = input.trim()

  // If not already HTML, convert markdown and plain text to HTML
  if (!/<(p|h2|h3|blockquote|ul|ol)[^>]*>/i.test(text)) {
    text = text
      .replace(/^###\s+(.+)$/gm, "<h3>$1</h3>")
      .replace(/^##\s+(.+)$/gm, "<h2>$1</h2>")
      .replace(/^#\s+(.+)$/gm, "<h2>$1</h2>")
      .replace(/^>\s+(.+)$/gm, "<blockquote>$1</blockquote>")
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/\*([^*\n]+)\*/g, "<em>$1</em>")
      .replace(
        /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
        '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
      )

    const blocks = text.split(/\n{2,}/)
    text = blocks
      .map((block) => {
        const trimmed = block.trim()
        if (!trimmed) return ""
        if (/^<(h2|h3|blockquote|ul|ol)/i.test(trimmed)) return trimmed
        const withBr = trimmed.replace(/\n/g, "<br>")
        return `<p>${withBr}</p>`
      })
      .filter(Boolean)
      .join("")
  }

  // Safe sanitation: strip scripts, iframes, styles, inline event handlers, javascript: links
  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .replace(/on\w+="[^"]*"/gi, "")
    .replace(/href="javascript:[^"]*"/gi, 'href="#"')
}

export function MemorialStory({ fullName, biography, isDemo = false }: MemorialStoryProps) {
  const firstName = fullName.split(" ")[0] || fullName
  const formattedBiography = formatBiographyHtml(biography)

  return (
    <section id="story" className="py-12 sm:py-16 px-4 max-w-4xl mx-auto scroll-mt-24">
      <div className="flex flex-col gap-8">
        
        {/* Section Heading */}
        <div className="flex flex-col gap-2 border-b border-black/[0.06] pb-4">
          <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-[#181925]">
            The Story of {firstName}
          </h2>
        </div>

        {/* Narrative Body with Generous Editorial Leading */}
        <div className="story-editorial-body text-[16px] sm:text-[18px] leading-8 sm:leading-9 text-[#3a3a40]">
          {formattedBiography ? (
            <div
              dangerouslySetInnerHTML={{ __html: formattedBiography }}
              className="flex flex-col"
            />
          ) : isDemo ? (
            <div className="flex flex-col gap-5">
              <p>
                Robert was born in Exeter during the autumn of 1948, the younger of two brothers raised on the edge of the Devon moors. From his earliest years, he showed an almost mechanical curiosity about the inner workings of things. While other boys were playing football in the lane, Robert could reliably be found on his knees behind his father’s shed, methodically dismantling an old bicycle hub or winding the spring of a broken mantel clock.
              </p>

              <p>
                In 1968, he took an apprenticeship in horology in London’s Clerkenwell district. He spent five years learning how to carve balance wheels by hand under master watchmakers who measured patience in tenths of a millimeter. It was during this period, on an uncharacteristically sunny afternoon in Portobello Market, that he met Meena. They married in 1974 at St. Jude’s Church and settled in a small stone cottage near Dartmoor, where they would spend the next fifty years.
              </p>

              {/* Editorial Pull Quote */}
              <div className="my-3 p-6 rounded-2xl bg-[#f7f7f8] border-l-2 border-primary border-y border-r border-black/[0.04]">
                <p className="text-base sm:text-lg font-normal italic text-[#181925] leading-relaxed m-0">
                  “If you give someone an unhurried hour and a proper pot of tea, there isn’t a single disagreement in this world you can’t unravel.”
                </p>
                <span className="block mt-2 text-xs font-mono text-[#888] not-italic">
                  — Robert’s favourite saying in the workshop
                </span>
              </div>

              <p>
                In 1983, he opened Carter Clocks & Woodworking on the high street. For over three decades, his workshop became the unofficial town square for anyone who needed a hinge repaired, a pendulum calibrated, or simply twenty minutes of quiet conversation without judgment. He retired in 2018 to tend his rose garden and teach his granddaughter Anita how to identify every native songbird of Devon.
              </p>
            </div>
          ) : (
            <div className="p-8 rounded-3xl bg-[#fafafb] border border-black/[0.06] text-center text-sm text-[#71717a]">
              A life story has not been written yet. Stories and memories contributed by family will appear here.
            </div>
          )}
        </div>

      </div>

      <style jsx global>{`
        .story-editorial-body h2 {
          font-family: var(--font-serif, Georgia, serif);
          font-size: 1.5rem;
          font-weight: 500;
          color: #181925;
          margin-top: 2rem;
          margin-bottom: 0.75rem;
          letter-spacing: -0.015em;
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
          padding-bottom: 0.5rem;
        }
        .story-editorial-body h3 {
          font-family: var(--font-serif, Georgia, serif);
          font-size: 1.25rem;
          font-weight: 500;
          color: #181925;
          margin-top: 1.5rem;
          margin-bottom: 0.5rem;
        }
        .story-editorial-body p {
          margin-bottom: 1.25rem;
          color: #3a3a40;
        }
        .story-editorial-body blockquote {
          margin: 1.5rem 0;
          padding: 1rem 1.5rem;
          border-left: 3px solid #7c3aed;
          background: #fafafb;
          border-radius: 1rem;
          font-style: italic;
          color: #181925;
          font-size: 1.05rem;
          line-height: 1.75;
        }
        .story-editorial-body ul {
          list-style-type: disc;
          padding-left: 1.75rem;
          margin-bottom: 1.25rem;
        }
        .story-editorial-body li {
          margin-bottom: 0.35rem;
        }
        .story-editorial-body a {
          color: #7c3aed;
          text-decoration: underline;
          text-underline-offset: 4px;
          font-weight: 500;
        }
        .story-editorial-body a:hover {
          opacity: 0.85;
        }
        .story-editorial-body hr {
          margin: 2rem 0;
          border: none;
          border-top: 1px solid rgba(0, 0, 0, 0.08);
        }
      `}</style>
    </section>
  )
}
