"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import {
  Heading2,
  Heading3,
  Bold,
  Italic,
  Quote,
  List,
  Link2,
  Unlink,
  Minus,
  Undo2,
  Redo2,
  X,
} from "lucide-react"

interface RichStoryEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

/**
 * Convert legacy plain-text or markdown string to semantic HTML for the editor.
 */
function markdownOrPlainToHtml(input: string): string {
  if (!input || !input.trim()) return ""

  // If already looks like structured HTML with paragraph or heading tags, return as-is
  if (/<(p|h2|h3|blockquote|ul|ol)[^>]*>/i.test(input)) {
    return input
  }

  // 1. Process headings
  let text = input
    .replace(/^###\s+(.+)$/gm, "<h3>$1</h3>")
    .replace(/^##\s+(.+)$/gm, "<h2>$1</h2>")
    .replace(/^#\s+(.+)$/gm, "<h2>$1</h2>")

  // 2. Blockquotes
  text = text.replace(/^>\s+(.+)$/gm, "<blockquote>$1</blockquote>")

  // 3. Bold & Italic (handles user's "** Kishan Singh**" as well as "**Kishan Singh**")
  text = text.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
  text = text.replace(/\*([^*\n]+)\*/g, "<em>$1</em>")

  // 4. Markdown links: [title](url)
  text = text.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
  )

  // 5. Wrap paragraph blocks separated by 2+ newlines
  const blocks = text.split(/\n{2,}/)
  const htmlBlocks = blocks
    .map((block) => {
      const trimmed = block.trim()
      if (!trimmed) return ""
      // If block is already a tag like <h2>, <h3>, <blockquote>, don't wrap in <p>
      if (/^<(h2|h3|blockquote|ul|ol)/i.test(trimmed)) {
        return trimmed
      }
      // Single newlines inside a paragraph become <br>
      const withBr = trimmed.replace(/\n/g, "<br>")
      return `<p>${withBr}</p>`
    })
    .filter(Boolean)

  return htmlBlocks.join("")
}

/**
 * Clean up HTML on export / input:
 * Removes empty spans, scripts, javascript: links, and keeps clean semantic tags.
 */
function cleanSemanticHtml(html: string): string {
  if (!html || !html.trim()) return ""

  // Remove empty container tags or trailing <br>s that contenteditable inserts
  let cleaned = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/on\w+="[^"]*"/gi, "")
    .replace(/href="javascript:[^"]*"/gi, 'href="#"')

  // Treat empty <p><br></p> or just <br> as empty string
  const textOnly = cleaned.replace(/<[^>]*>/g, "").trim()
  if (!textOnly) return ""

  return cleaned
}

export function RichStoryEditor({
  value,
  onChange,
  placeholder = "Write their life story here...",
}: RichStoryEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const isTypingRef = useRef(false)
  const lastEmittedValueRef = useRef(value || "")

  // Active formats state for toolbar highlights
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    h2: false,
    h3: false,
    quote: false,
    list: false,
    link: false,
  })

  // Link dialog state
  const [linkModalOpen, setLinkModalOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState("")
  const [savedRange, setSavedRange] = useState<Range | null>(null)

  // Word counter
  const [stats, setStats] = useState({ words: 0, characters: 0, readTimeMinutes: 1 })

  // Initialize and sync editor content
  useEffect(() => {
    if (!editorRef.current) return

    // Only update DOM if the external value changed outside our own onInput
    if (value !== lastEmittedValueRef.current) {
      const htmlContent = markdownOrPlainToHtml(value || "")
      editorRef.current.innerHTML = htmlContent
      lastEmittedValueRef.current = value || ""
      updateStats(editorRef.current.innerText || "")
    }
  }, [value])

  const updateStats = (text: string) => {
    const trimmed = text.trim()
    const words = trimmed ? trimmed.split(/\s+/).filter(Boolean).length : 0
    const characters = trimmed.length
    const readTimeMinutes = Math.max(1, Math.ceil(words / 180))
    setStats({ words, characters, readTimeMinutes })
  }

  // Update active format state based on current cursor position
  const checkActiveFormats = useCallback(() => {
    if (typeof document === "undefined") return

    try {
      const isBold = document.queryCommandState("bold")
      const isItalic = document.queryCommandState("italic")
      const isList = document.queryCommandState("insertUnorderedList")

      // Check current block format (h2, h3, blockquote, a)
      let isH2 = false
      let isH3 = false
      let isQuote = false
      let isLink = false

      const selection = window.getSelection()
      if (selection && selection.rangeCount > 0) {
        let node: Node | null = selection.anchorNode
        while (node && node !== editorRef.current && node.parentNode) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const el = node as HTMLElement
            const tagName = el.tagName.toLowerCase()
            if (tagName === "h2") isH2 = true
            if (tagName === "h3") isH3 = true
            if (tagName === "blockquote") isQuote = true
            if (tagName === "a") isLink = true
          }
          node = node.parentNode
        }
      }

      setActiveFormats({
        bold: isBold,
        italic: isItalic,
        h2: isH2,
        h3: isH3,
        quote: isQuote,
        list: isList,
        link: isLink,
      })
    } catch {
      // Ignored if selection not in document
    }
  }, [])

  useEffect(() => {
    const handleSelectionChange = () => {
      if (editorRef.current && document.activeElement === editorRef.current) {
        checkActiveFormats()
      }
    }

    document.addEventListener("selectionchange", handleSelectionChange)
    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange)
    }
  }, [checkActiveFormats])

  const handleInput = () => {
    if (!editorRef.current) return
    isTypingRef.current = true

    const currentHtml = editorRef.current.innerHTML
    const cleaned = cleanSemanticHtml(currentHtml)
    lastEmittedValueRef.current = cleaned
    onChange(cleaned)

    updateStats(editorRef.current.innerText || "")
    checkActiveFormats()

    setTimeout(() => {
      isTypingRef.current = false
    }, 50)
  }

  // Toolbar action helpers using document.execCommand
  const executeCommand = (command: string, arg?: string) => {
    if (!editorRef.current) return
    editorRef.current.focus()
    document.execCommand(command, false, arg)
    handleInput()
    checkActiveFormats()
  }

  const toggleHeading = (tag: "h2" | "h3") => {
    if (!editorRef.current) return
    editorRef.current.focus()

    // If already active, toggle back to paragraph
    const isActive = tag === "h2" ? activeFormats.h2 : activeFormats.h3
    if (isActive) {
      document.execCommand("formatBlock", false, "<p>")
    } else {
      document.execCommand("formatBlock", false, `<${tag}>`)
    }
    handleInput()
    checkActiveFormats()
  }

  const toggleQuote = () => {
    if (!editorRef.current) return
    editorRef.current.focus()

    if (activeFormats.quote) {
      document.execCommand("formatBlock", false, "<p>")
    } else {
      document.execCommand("formatBlock", false, "<blockquote>")
    }
    handleInput()
    checkActiveFormats()
  }

  const handleOpenLinkModal = () => {
    if (typeof window === "undefined") return
    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0) {
      setSavedRange(selection.getRangeAt(0).cloneRange())

      // Find if cursor is already on an existing link
      let node: Node | null = selection.anchorNode
      let existingHref = ""
      while (node && node !== editorRef.current && node.parentNode) {
        if (node.nodeType === Node.ELEMENT_NODE && (node as HTMLElement).tagName === "A") {
          existingHref = (node as HTMLElement).getAttribute("href") || ""
          break
        }
        node = node.parentNode
      }
      setLinkUrl(existingHref)
      setLinkModalOpen(true)
    }
  }

  const handleApplyLink = () => {
    if (!editorRef.current) return
    editorRef.current.focus()

    // Restore saved range
    if (savedRange && window.getSelection) {
      const s = window.getSelection()
      if (s) {
        s.removeAllRanges()
        s.addRange(savedRange)
      }
    }

    let url = linkUrl.trim()
    if (!url) {
      document.execCommand("unlink", false)
    } else {
      if (!/^https?:\/\//i.test(url) && !url.startsWith("mailto:")) {
        url = "https://" + url
      }
      document.execCommand("createLink", false, url)

      // Ensure target="_blank" and rel="noopener noreferrer" on newly created link
      const links = editorRef.current.querySelectorAll(`a[href="${url}"]`)
      links.forEach((a) => {
        a.setAttribute("target", "_blank")
        a.setAttribute("rel", "noopener noreferrer")
      })
    }

    setLinkModalOpen(false)
    setLinkUrl("")
    setSavedRange(null)
    handleInput()
    checkActiveFormats()
  }

  const handleRemoveLink = () => {
    if (!editorRef.current) return
    editorRef.current.focus()
    if (savedRange && window.getSelection) {
      const s = window.getSelection()
      if (s) {
        s.removeAllRanges()
        s.addRange(savedRange)
      }
    }
    document.execCommand("unlink", false)
    setLinkModalOpen(false)
    setLinkUrl("")
    setSavedRange(null)
    handleInput()
    checkActiveFormats()
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault()
    // Paste as clean plain text or formatted text without messy Word style attributes
    const text = e.clipboardData.getData("text/plain")
    document.execCommand("insertText", false, text)
    handleInput()
  }

  return (
    <div className="flex flex-col rounded-3xl bg-white border border-black/[0.08] shadow-xs overflow-hidden transition-colors focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10">
      {/* 1. DISTRACTION-FREE EDITORIAL TOOLBAR */}
      <div className="flex items-center flex-wrap gap-1 px-3 py-2 bg-[#fafafb] border-b border-black/[0.06] select-none">
        {/* Headings */}
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault()
            toggleHeading("h2")
          }}
          className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
            activeFormats.h2
              ? "bg-primary text-white shadow-xs"
              : "text-[#555] hover:text-[#181925] hover:bg-black/[0.05]"
          }`}
          title="Section Heading (H2)"
        >
          <Heading2 className="size-3.5" />
          <span className="text-[11px]">Heading</span>
        </button>

        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault()
            toggleHeading("h3")
          }}
          className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
            activeFormats.h3
              ? "bg-primary text-white shadow-xs"
              : "text-[#555] hover:text-[#181925] hover:bg-black/[0.05]"
          }`}
          title="Subheading (H3)"
        >
          <Heading3 className="size-3.5" />
          <span className="text-[11px]">Subhead</span>
        </button>

        <div className="w-px h-4 bg-black/[0.08] mx-1 shrink-0" />

        {/* Bold & Italic */}
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault()
            executeCommand("bold")
          }}
          className={`size-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
            activeFormats.bold
              ? "bg-primary text-white shadow-xs"
              : "text-[#555] hover:text-[#181925] hover:bg-black/[0.05]"
          }`}
          title="Bold (Ctrl+B)"
        >
          <Bold className="size-3.5" />
        </button>

        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault()
            executeCommand("italic")
          }}
          className={`size-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
            activeFormats.italic
              ? "bg-primary text-white shadow-xs"
              : "text-[#555] hover:text-[#181925] hover:bg-black/[0.05]"
          }`}
          title="Italic (Ctrl+I)"
        >
          <Italic className="size-3.5" />
        </button>

        <div className="w-px h-4 bg-black/[0.08] mx-1 shrink-0" />

        {/* Quote & List */}
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault()
            toggleQuote()
          }}
          className={`size-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
            activeFormats.quote
              ? "bg-primary text-white shadow-xs"
              : "text-[#555] hover:text-[#181925] hover:bg-black/[0.05]"
          }`}
          title="Pull Quote / Favorite Saying"
        >
          <Quote className="size-3.5" />
        </button>

        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault()
            executeCommand("insertUnorderedList")
          }}
          className={`size-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
            activeFormats.list
              ? "bg-primary text-white shadow-xs"
              : "text-[#555] hover:text-[#181925] hover:bg-black/[0.05]"
          }`}
          title="Bullet List"
        >
          <List className="size-3.5" />
        </button>

        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault()
            handleOpenLinkModal()
          }}
          className={`size-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
            activeFormats.link
              ? "bg-primary text-white shadow-xs"
              : "text-[#555] hover:text-[#181925] hover:bg-black/[0.05]"
          }`}
          title="Insert Link"
        >
          <Link2 className="size-3.5" />
        </button>

        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault()
            executeCommand("insertHorizontalRule")
          }}
          className="size-7 rounded-lg flex items-center justify-center text-[#555] hover:text-[#181925] hover:bg-black/[0.05] transition-colors cursor-pointer"
          title="Chapter Break Divider Line"
        >
          <Minus className="size-3.5" />
        </button>

        <div className="w-px h-4 bg-black/[0.08] mx-1 shrink-0" />

        {/* Undo / Redo */}
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault()
            executeCommand("undo")
          }}
          className="size-7 rounded-lg flex items-center justify-center text-[#666] hover:text-[#181925] hover:bg-black/[0.05] transition-colors cursor-pointer"
          title="Undo (Ctrl+Z)"
        >
          <Undo2 className="size-3.5" />
        </button>

        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault()
            executeCommand("redo")
          }}
          className="size-7 rounded-lg flex items-center justify-center text-[#666] hover:text-[#181925] hover:bg-black/[0.05] transition-colors cursor-pointer"
          title="Redo (Ctrl+Y)"
        >
          <Redo2 className="size-3.5" />
        </button>
      </div>

      {/* 2. WRITING CANVAS */}
      <div className="relative min-h-[320px] sm:min-h-[380px] p-5 sm:p-7">
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onPaste={handlePaste}
          onBlur={handleInput}
          onKeyUp={checkActiveFormats}
          onMouseUp={checkActiveFormats}
          data-placeholder={placeholder}
          className="story-content-editable outline-none min-h-[280px] text-base sm:text-[17px] text-[#222] leading-relaxed font-sans empty:before:content-[attr(data-placeholder)] empty:before:text-[#aaa] empty:before:pointer-events-none"
        />
      </div>

      {/* 3. BOTTOM STATS BAR */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#fafafb] border-t border-black/[0.05] text-[11px] text-[#71717a]">
        <span>Formatted automatically with editorial leading on the public memorial.</span>
        <div className="flex items-center gap-3 font-mono">
          <span>{stats.words} words</span>
          <span>·</span>
          <span>~{stats.readTimeMinutes} min read</span>
        </div>
      </div>

      {/* 4. CLEAN LINK INSERTION MODAL */}
      {linkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl border border-black/[0.08] flex flex-col gap-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Link2 className="size-4 text-primary" />
                <h4 className="text-sm font-medium text-[#181925]">Insert or Edit Link</h4>
              </div>
              <button
                type="button"
                onClick={() => setLinkModalOpen(false)}
                className="text-[#888] hover:text-[#181925] cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-[#555] font-medium">Destination URL</label>
              <input
                type="text"
                autoFocus
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleApplyLink()
                  } else if (e.key === "Escape") {
                    setLinkModalOpen(false)
                  }
                }}
                placeholder="https://example.com or tribute page..."
                className="w-full px-3 py-2 rounded-xl bg-[#fafafb] border border-black/[0.08] text-xs text-[#181925] outline-none focus:border-primary/50"
              />
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-black/[0.05]">
              {activeFormats.link ? (
                <button
                  type="button"
                  onClick={handleRemoveLink}
                  className="inline-flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 cursor-pointer font-medium"
                >
                  <Unlink className="size-3" />
                  <span>Remove Link</span>
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setLinkModalOpen(false)}
                  className="px-3 py-1.5 rounded-full text-xs text-[#666] hover:bg-neutral-100 cursor-pointer font-medium"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApplyLink}
                  className="px-4 py-1.5 rounded-full bg-primary hover:bg-primary/90 text-white text-xs font-medium cursor-pointer shadow-xs"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .story-content-editable h2 {
          font-family: var(--font-serif, Georgia, serif);
          font-size: 1.35rem;
          font-weight: 500;
          color: #181925;
          margin-top: 1.25rem;
          margin-bottom: 0.5rem;
          letter-spacing: -0.015em;
        }
        .story-content-editable h3 {
          font-family: var(--font-serif, Georgia, serif);
          font-size: 1.15rem;
          font-weight: 500;
          color: #181925;
          margin-top: 1rem;
          margin-bottom: 0.35rem;
        }
        .story-content-editable p {
          margin-bottom: 0.85rem;
          color: #2b2b30;
        }
        .story-content-editable blockquote {
          margin: 1rem 0;
          padding: 0.75rem 1.25rem;
          border-left: 3px solid #7c3aed;
          background: #fafafb;
          border-radius: 0.75rem;
          font-style: italic;
          color: #181925;
        }
        .story-content-editable ul {
          list-style-type: disc;
          padding-left: 1.5rem;
          margin-bottom: 0.85rem;
        }
        .story-content-editable li {
          margin-bottom: 0.25rem;
        }
        .story-content-editable a {
          color: #7c3aed;
          text-decoration: underline;
          text-underline-offset: 3px;
        }
        .story-content-editable hr {
          margin: 1.5rem 0;
          border: none;
          border-top: 1px solid rgba(0, 0, 0, 0.08);
        }
      `}</style>
    </div>
  )
}
