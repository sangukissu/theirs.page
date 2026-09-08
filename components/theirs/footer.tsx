import Link from "next/link"
import Image from "next/image"

export function TheirsFooter() {
  return (
    <footer className="border-t border-border bg-white py-6 px-4">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-muted-foreground">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <Image src="/theirs-logo.svg" alt="Theirs" width={16} height={16} />
          <span className="font-medium text-[#454545]">Theirs</span>
          <span>· Remember them together.</span>
        </div>

        {/* Links */}
        <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
          <Link href="/login" className="hover:text-[#454545] transition-colors">
            Sign in
          </Link>
          <Link href="/privacy" className="hover:text-[#454545] transition-colors">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-[#454545] transition-colors">
            Terms
          </Link>
          <Link href="/guidelines" className="hover:text-[#454545] transition-colors">
            Guidelines
          </Link>
          <Link href="/refunds" className="hover:text-[#454545] transition-colors">
            Refunds
          </Link>
        </div>

        {/* Copyright */}
        <div>© {new Date().getFullYear()} Theirs</div>
      </div>
    </footer>
  )
}
