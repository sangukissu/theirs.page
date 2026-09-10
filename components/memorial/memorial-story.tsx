"use client"

import React from "react"
import { SectionEyebrow } from "./section-eyebrow"

interface MemorialStoryProps {
  fullName: string
  biography?: string | null
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
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/\son\w+\s*=\s*(['"]).*?\1/gi, "")
    .replace(/\son\w+\s*=\s*[^\s>]+/gi, "")
    .replace(/href\s*=\s*(['"])\s*javascript:[^'"]*\1/gi, 'href="#"')
}

export function MemorialStory({ fullName, biography }: MemorialStoryProps) {
  const firstName = fullName.split(" ")[0] || fullName
  const formattedBiography = formatBiographyHtml(biography)

  return (
    <section id="story" className="py-12 px-4 max-w-4xl mx-auto scroll-mt-24">
      <div className="flex flex-col gap-4">

        {/* Section Heading */}
        <div className="flex flex-col gap-0.5 border-b border-[var(--theme-border)] pb-3.5 sm:pb-4">
          <SectionEyebrow kind="story" />
          <h2 className="text-xl sm:text-2xl md:text-3xl font-medium tracking-tight text-[var(--theme-text-primary)] leading-tight">
            The Story of {firstName}
          </h2>
        </div>

        {/* Narrative Body with Generous Editorial Leading */}
        <div className="story-editorial-body text-[16px] sm:text-[18px] leading-8 sm:leading-9 text-[var(--theme-text-body)]">
          {formattedBiography ? (
            <div
              dangerouslySetInnerHTML={{ __html: formattedBiography }}
              className="flex flex-col"
            />
          ) : (
            <div className="p-8 rounded-3xl bg-[var(--theme-bg-surface-subtle)] border border-[var(--theme-border)] text-center text-sm text-[var(--theme-text-muted)]">
              A life story has not been written yet. Stories and memories contributed by family will appear here.
            </div>
          )}
        </div>

      </div>

      <style jsx global>{`
        .story-editorial-body h2 {
          font-family: var(--font-theme-heading, var(--font-serif, Georgia, serif));
          font-size: 1.5rem;
          font-weight: 500;
          color: var(--theme-text-primary);
          margin-top: 1rem;
          margin-bottom: 0.75rem;
          letter-spacing: -0.015em;
          border-bottom: 1px solid var(--theme-border);
          padding-bottom: 0.5rem;
        }
        .story-editorial-body h3 {
          font-family: var(--font-theme-heading, var(--font-serif, Georgia, serif));
          font-size: 1.25rem;
          font-weight: 500;
          color: var(--theme-text-primary);
          margin-top: 1rem;
          margin-bottom: 0.5rem;
        }
        .story-editorial-body p {
          margin-bottom: 1.25rem;
          color: var(--theme-text-body);
          line-height: 1.6;
        }
        .story-editorial-body blockquote {
          position: relative;
          margin: 1rem 0;
          padding: 0.25rem 0 0.25rem 2.5rem;
          border: none;
          background: transparent;
          font-family: var(--font-theme-heading, var(--font-serif, Georgia, serif));
          font-style: italic;
          color: var(--theme-text-primary);
          font-size: 1.15rem;
          line-height: 1.85;
          letter-spacing: -0.01em;
        }
        .story-editorial-body blockquote::before {
          content: "";
          position: absolute;
          left: 0;
          top: 0.35rem;
          width: 1.5rem;
          height: 1.5rem;
          background-color: var(--theme-accent, currentColor);
          opacity: 0.45;
          mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor'%3E%3Cpath d='M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z'/%3E%3C/svg%3E");
          -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor'%3E%3Cpath d='M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z'/%3E%3C/svg%3E");
          mask-size: contain;
          -webkit-mask-size: contain;
          mask-repeat: no-repeat;
          -webkit-mask-repeat: no-repeat;
        }
        .story-editorial-body blockquote p {
          margin-bottom: 0.75rem;
          color: inherit;
          font-family: inherit;
          font-style: inherit;
          line-height: inherit;
        }
        .story-editorial-body blockquote p:last-child {
          margin-bottom: 0;
        }
        .story-editorial-body ul {
          list-style-type: disc;
          padding-left: 1.75rem;
          margin-bottom: 1rem;
        }
        .story-editorial-body li {
          margin-bottom: 0.35rem;
        }
        .story-editorial-body a {
          color: var(--theme-accent);
          text-decoration: underline;
          text-underline-offset: 4px;
          font-weight: 500;
        }
        .story-editorial-body a:hover {
          opacity: 0.85;
        }
        .story-editorial-body hr {
          margin: 1rem 0;
          border: none;
          border-top: 1px solid var(--theme-border);
        }
      `}</style>
    </section>
  )
}
