import type { Metadata } from "next"
import { buildNoIndexMetadata } from "@/lib/seo/metadata"

export const metadata: Metadata = buildNoIndexMetadata(
  "Error",
  "An error occurred while processing your request."
)

export default function ErrorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
