import type { Metadata } from "next"
import { buildNoIndexMetadata } from "@/lib/seo/metadata"

export const metadata: Metadata = buildNoIndexMetadata(
  "Sign In",
  "Sign in to Theirs to preserve, steward, and curate memorial pages for the people you love."
)

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <section>{children}</section>
}