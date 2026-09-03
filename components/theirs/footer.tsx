import Link from "next/link"

export function TheirsFooter() {
  return (
    <footer className="border-t border-border bg-white py-6 px-4">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-muted-foreground">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <svg viewBox="0 0 512 512" aria-hidden="true" className="size-4 text-primary shrink-0">
            <clipPath id="theirs-footer-logo">
              <path clipRule="evenodd" d="M256 4a252 252 0 1 0 0 504 252 252 0 1 0 0-504Zm0 109a141 141 0 1 1 0 282 141 141 0 1 1 0-282Z" fillRule="evenodd" />
            </clipPath>
            <g clipPath="url(#theirs-footer-logo)" fill="currentColor">
              <rect height="20" width="512" x="0" y="4" />
              <rect height="20" width="512" x="0" y="36" />
              <rect height="20" width="512" x="0" y="68" />
              <rect height="20" width="512" x="0" y="100" />
              <rect height="20" width="512" x="0" y="132" />
              <rect height="20" width="512" x="0" y="164" />
              <rect height="20" width="512" x="0" y="196" />
              <rect height="20" width="512" x="0" y="228" />
              <rect height="20" width="512" x="0" y="260" />
              <rect height="20" width="512" x="0" y="292" />
              <rect height="188" width="512" x="0" y="324" />
            </g>
          </svg>
          <span className="font-medium text-[#454545]">Theirs</span>
          <span>· Dedicated to a human life.</span>
        </div>

        {/* Links */}
        <div className="flex items-center gap-6">
          <Link href="/login" className="hover:text-[#454545] transition-colors">
            Sign in
          </Link>
          <Link href="/privacy" className="hover:text-[#454545] transition-colors">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-[#454545] transition-colors">
            Terms
          </Link>
        </div>

        {/* Copyright */}
        <div>© {new Date().getFullYear()} Theirs</div>
      </div>
    </footer>
  )
}
