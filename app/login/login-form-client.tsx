"use client"

import { useActionState, useEffect, useState, Suspense } from "react"
import { useFormStatus } from "react-dom"
import { useSearchParams, useRouter } from "next/navigation"
import { Turnstile } from "@marsidev/react-turnstile"
import { Loader2, ArrowRight, Volume2, ShieldCheck, Sparkles } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { signInWithMagicLink, signInWithGoogle, type AuthState } from "./actions"
import { createClient } from "@/utils/supabase/client"
import { isAuthRetryableFetchError } from "@supabase/supabase-js"
import { DitherGradient } from "@/components/theirs/dither-gradient"
import { normalizeMemorialSlug } from "@/lib/memorial-slug"

function MagicLinkSubmit() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap !rounded-full font-medium transition-all cursor-pointer border border-[color-mix(in_srgb,var(--primary)_80%,#3a3480)] bg-[color-mix(in_srgb,var(--primary)_90%,#3a3480)] text-primary-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.22),inset_0_-1px_0_rgba(58,52,128,0.30)] transform-gpu hover:bg-primary active:scale-[0.98] h-10 w-full text-sm group select-none disabled:opacity-50 disabled:pointer-events-none"
    >
      {pending ? (
        <>
          <Loader2 className="size-4 animate-spin" />
          <span>Sending link...</span>
        </>
      ) : (
        <>
          <span>Continue with Email</span>
          <span className="relative size-3.5 overflow-hidden inline-flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="absolute inset-0 size-3.5 transition-transform duration-200 group-hover:translate-x-3 group-hover:opacity-0"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="absolute inset-0 size-3.5 -translate-x-3 opacity-0 transition-transform duration-200 group-hover:translate-x-0 group-hover:opacity-100"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </span>
        </>
      )}
    </button>
  )
}

function GoogleSignInButton({ nextPath }: { nextPath: string }) {
  const [isLoading, setIsLoading] = useState(false)

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    try {
      document.cookie = "last_auth=google; path=/; max-age=31536000; SameSite=Lax"
      await signInWithGoogle(nextPath)
    } catch (error) {
      setIsLoading(false)
      console.error("Google sign-in error:", error)
    }
  }

  return (
    <button
      type="button"
      disabled={isLoading}
      onClick={handleGoogleSignIn}
      className="w-full rounded-full border border-black/[0.08] hover:bg-neutral-50 active:scale-[0.98] h-10 text-xs sm:text-sm font-medium text-[#181925] flex items-center justify-center gap-2.5 transition-all cursor-pointer bg-white disabled:opacity-50 select-none"
    >
      {isLoading ? (
        <>
          <Loader2 className="size-4 animate-spin text-[#666]" />
          <span>Connecting...</span>
        </>
      ) : (
        <>
          <Image
            src="/google.svg"
            alt="Google logo"
            className="size-4"
            width={16}
            height={16}
          />
          <span>Continue with Google</span>
        </>
      )}
    </button>
  )
}

function LoginFormWithSearchParams({ nextPath: propNextPath }: { nextPath?: string }) {
  const [state, formAction] = useActionState<AuthState, FormData>(signInWithMagicLink, {} as AuthState)
  const searchParams = useSearchParams()
  const router = useRouter()
  const [urlError, setUrlError] = useState<string | null>(null)
  const [captchaToken, setCaptchaToken] = useState<string | undefined>(undefined)
  const [lastUsed, setLastUsed] = useState<"google" | "magic" | null>(null)
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ""

  const queryName = searchParams.get("name")?.trim() || ""
  const querySlug = searchParams.get("slug")?.trim() || ""

  const [persistedData, setPersistedData] = useState<{ name: string; slug: string }>({
    name: queryName,
    slug: querySlug,
  })

  useEffect(() => {
    if (!persistedData.name) {
      // Check cookies
      const nameMatch = document.cookie.match(/(?:^|;\s*)theirs_pending_name=([^;]+)/)
      const slugMatch = document.cookie.match(/(?:^|;\s*)theirs_pending_slug=([^;]+)/)
      if (nameMatch && nameMatch[1]) {
        const decodedName = decodeURIComponent(nameMatch[1]).trim()
        const decodedSlug = slugMatch && slugMatch[1] ? decodeURIComponent(slugMatch[1]).trim() : normalizeMemorialSlug(decodedName)
        setPersistedData({ name: decodedName, slug: decodedSlug })
        return
      }
      // Check localStorage
      try {
        const stored = localStorage.getItem("theirs_pending_memorial")
        if (stored) {
          const parsed = JSON.parse(stored)
          if (parsed?.name) {
            setPersistedData({
              name: parsed.name.trim(),
              slug: parsed.slug?.trim() || normalizeMemorialSlug(parsed.name.trim()),
            })
          }
        }
      } catch {}
    } else {
      // Ensure cookie and localStorage are set
      const slug = persistedData.slug || normalizeMemorialSlug(persistedData.name)
      try {
        localStorage.setItem("theirs_pending_memorial", JSON.stringify({ name: persistedData.name, slug }))
        document.cookie = `theirs_pending_name=${encodeURIComponent(persistedData.name)}; path=/; max-age=86400; SameSite=Lax`
        document.cookie = `theirs_pending_slug=${encodeURIComponent(slug)}; path=/; max-age=86400; SameSite=Lax`
      } catch {}
    }
  }, [persistedData.name, persistedData.slug])

  const memorialName = queryName || persistedData.name
  const memorialSlug = querySlug || persistedData.slug || (memorialName ? normalizeMemorialSlug(memorialName) : "")

  let nextPath = propNextPath || searchParams.get("next") || "/dashboard"
  if (memorialName) {
    try {
      const dummyUrl = new URL(nextPath, "https://theirs.page")
      if (dummyUrl.pathname === "/dashboard") {
        if (!dummyUrl.searchParams.has("name")) {
          dummyUrl.searchParams.set("name", memorialName)
        }
        if (memorialSlug && !dummyUrl.searchParams.has("slug")) {
          dummyUrl.searchParams.set("slug", memorialSlug)
        }
        nextPath = `${dummyUrl.pathname}${dummyUrl.search}${dummyUrl.hash}`
      }
    } catch {
      nextPath = `/dashboard?name=${encodeURIComponent(memorialName)}&slug=${encodeURIComponent(memorialSlug)}`
    }
  }

  useEffect(() => {
    const error = searchParams.get("error")
    if (error) {
      setUrlError(error)
      const url = new URL(window.location.href)
      url.searchParams.delete("error")
      window.history.replaceState({}, "", url.toString())
    }
  }, [searchParams])

  useEffect(() => {
    const match = document.cookie.match(/(?:^|;\s*)last_auth=([^;]+)/)
    if (match) {
      const value = decodeURIComponent(match[1])
      if (value === "google" || value === "magic") {
        setLastUsed(value)
      }
    }
  }, [])

  const displayError = state?.error || urlError

  return (
    <div className="h-screen max-h-screen w-screen overflow-hidden grid grid-cols-1 lg:grid-cols-2 bg-white select-none">
      
      {/* LEFT COLUMN: Pure White Form (Zero Scroll) */}
      <div className="h-full flex flex-col justify-between p-6 sm:p-12 lg:p-16 max-w-lg mx-auto w-full overflow-hidden">
        {/* Top: Logo & Return Link */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="group flex items-center gap-2 font-medium tracking-tight text-[#181925] text-lg hover:opacity-80 transition-opacity"
          >
            <span className="size-2 rounded-full bg-primary" />
            <span>theirs</span>
          </Link>

          <Link
            href="/"
            className="text-xs text-[#888] hover:text-[#181925] transition-colors"
          >
            Back to overview
          </Link>
        </div>

        {/* Center: The High-Converting Auth Form */}
        <div className="w-full flex flex-col gap-6 my-auto">
          {/* Headline & Context */}
          <div className="flex flex-col gap-2">
            {memorialName ? (
              <>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium w-fit">
                  <Sparkles className="size-3" />
                  <span>Reserving theirs.page/{memorialSlug}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-[#181925] leading-tight">
                  Begin {memorialName}&apos;s memorial
                </h1>
                <p className="text-xs sm:text-sm text-[#666] leading-relaxed">
                  Enter your email to preserve this space. It is completely free to draft, and you can invite family immediately.
                </p>
              </>
            ) : (
              <>
                <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-[#181925] leading-tight">
                  Welcome to Theirs
                </h1>
                <p className="text-xs sm:text-sm text-[#666] leading-relaxed">
                  Sign in or create an account to start assembling a living memorial with family and friends.
                </p>
              </>
            )}
          </div>

          {/* Error & Success States */}
          {displayError && (
            <div className="p-3 rounded-xl text-xs bg-rose-50 border border-rose-200/60 text-rose-700 leading-relaxed">
              {displayError}
            </div>
          )}
          {state?.success && (
            <div className="p-3 rounded-xl text-xs bg-emerald-50 border border-emerald-200/60 text-emerald-700 leading-relaxed">
              {state.success}
            </div>
          )}

          {/* Form Actions */}
          <div className="flex flex-col gap-4">
            <form
              action={formAction}
              onSubmit={() => {
                document.cookie = "last_auth=magic; path=/; max-age=31536000; SameSite=Lax"
                if (memorialName) {
                  document.cookie = `theirs_pending_name=${encodeURIComponent(memorialName)}; path=/; max-age=86400; SameSite=Lax`
                  document.cookie = `theirs_pending_slug=${encodeURIComponent(memorialSlug)}; path=/; max-age=86400; SameSite=Lax`
                }
              }}
              className="flex flex-col gap-3"
            >
              <input type="hidden" name="next" value={nextPath} />

              <div className="flex flex-col gap-1.5">
                <label htmlFor="email" className="text-xs font-medium text-[#181925]">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  required
                  className="h-10 px-3.5 rounded-xl bg-[#f7f7f8] border border-black/[0.08] text-sm text-[#181925] outline-none transition-colors focus:border-primary focus:bg-white placeholder:text-[#aaa]"
                />
              </div>

              {siteKey && (
                <div className="flex justify-center scale-90 -my-1">
                  <Turnstile
                    siteKey={siteKey}
                    onSuccess={(token) => setCaptchaToken(token)}
                    onExpire={() => setCaptchaToken(undefined)}
                    onError={() => setCaptchaToken(undefined)}
                  />
                </div>
              )}
              <input type="hidden" name="captchaToken" value={captchaToken ?? ""} />

              <div className="relative pt-1">
                <MagicLinkSubmit />
                {lastUsed === "magic" && (
                  <span className="absolute -top-1.5 right-3 bg-white text-[#181925] text-[10px] px-2 py-0.5 rounded-full border border-black/[0.08] font-medium">
                    Last used
                  </span>
                )}
              </div>
            </form>

            {/* Subtle Divider */}
            <div className="relative my-1">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-black/[0.06]" />
              </div>
              <div className="relative flex justify-center text-[11px]">
                <span className="bg-white px-2 text-[#888]">or</span>
              </div>
            </div>

            {/* Google OAuth Option */}
            <div className="relative">
              <GoogleSignInButton nextPath={nextPath} />
              {lastUsed === "google" && (
                <span className="absolute -top-1.5 right-3 bg-white text-[#181925] text-[10px] px-2 py-0.5 rounded-full border border-black/[0.08] font-medium">
                  Last used
                </span>
              )}
            </div>
          </div>

          <p className="text-[11px] text-[#888] text-center leading-relaxed">
            No passwords to remember. We send a secure magic login link directly to your inbox.
          </p>
        </div>

        {/* Bottom: Terms & Privacy */}
        <div className="text-center text-[11px] text-[#888]">
          <span>By signing in, you agree to our </span>
          <Link href="/terms" className="underline hover:text-[#181925]">
            terms
          </Link>
          <span> and </span>
          <Link href="/privacy" className="underline hover:text-[#181925]">
            privacy policy
          </Link>
          .
        </div>
      </div>

      {/* RIGHT COLUMN: Dither Gradient Canvas + Elevated Archival Artpiece (Zero Scroll, Zero Text Clutter) */}
      <div className="hidden lg:flex flex-col justify-between h-full bg-[#f7f7f8] relative overflow-hidden p-12 border-l border-black/[0.06]">
        {/* Exact Bayer 4x4 Dither Canvas Aura */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(125%_115%_at_100%_0%,#000_0%,#000_30%,transparent_75%)]"
        >
          <DitherGradient from="cyan" bloom="aura" />
        </span>

        {/* Top Header Badge */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-black/[0.06] text-xs font-mono text-[#555]">
            <span className="size-1.5 rounded-full bg-primary" />
            <span>theirs.page · Permanent Life Archive</span>
          </div>

          <span className="font-mono text-[11px] text-[#888]">
            RAW & UNCOMPRESSED
          </span>
        </div>

        {/* Center: Museum-Grade Archival Artifact */}
        <div className="relative z-10 my-auto max-w-sm w-full mx-auto flex flex-col gap-3.5">
          
          {/* Photograph Frame with Film Details */}
          <div className="relative rounded-2xl overflow-hidden bg-white border border-black/[0.08] p-2 flex flex-col">
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-neutral-900">
              <img
                src="/memorial-family-portrait-grandfather.jpg"
                alt="Preserved Memorial Portrait"
                className="size-full object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent pointer-events-none" />

              {/* Monospace EXIF Stamp on Photo */}
              <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-black/50 backdrop-blur-md text-[10px] font-mono text-white/90 border border-white/10">
                4032 × 3024 · RAW PRESERVED
              </div>

              {/* Person Name & Lifespan Pill on Photo Bottom */}
              <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-white">
                <div className="flex flex-col">
                  <span className="text-xs font-medium tracking-tight leading-tight">Robert Edward Carter</span>
                  <span className="text-[10px] text-white/70 font-mono">1948 — 2024 · Devon, UK</span>
                </div>
                <span className="text-[10px] font-mono bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/20">
                  76 Years
                </span>
              </div>
            </div>

            {/* Studio Audio Waveform Dock */}
            <div className="mt-2 p-2 rounded-xl bg-[#f7f7f8] border border-black/[0.04] flex items-center gap-2.5">
              <div className="size-6 rounded-full bg-primary text-white flex items-center justify-center shrink-0">
                <Volume2 className="size-3" />
              </div>

              <div className="flex-1 flex items-center gap-[2px] h-4">
                {[30, 60, 95, 45, 80, 100, 65, 40, 85, 90, 55, 75, 40, 85, 60, 35, 70, 90, 50, 30].map((h, i) => (
                  <span
                    key={i}
                    className={`flex-1 rounded-full ${i < 8 ? "bg-primary" : "bg-neutral-300"}`}
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>

              <span className="text-[10px] font-mono text-[#777] shrink-0">0:14 / 0:48</span>
            </div>
          </div>

          {/* Lifespan Decades Track Ribbon */}
          <div className="p-3 rounded-xl bg-white border border-black/[0.06] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded">
                1948
              </span>
              <div className="flex flex-col">
                <span className="font-medium text-[#181925] text-xs">Exeter, Devon</span>
                <span className="text-[10px] text-[#888]">Childhood & Horology Workshop</span>
              </div>
            </div>

            <span className="text-[10px] font-mono text-[#888]">Chapter I</span>
          </div>

        </div>

        {/* Bottom Editorial Statement */}
        <div className="relative z-10 flex items-center justify-between pt-4 border-t border-black/[0.06] text-xs text-[#666]">
          <p className="font-medium text-[#181925] max-w-xs leading-relaxed">
            “It should feel like visiting someone’s life, not visiting their obituary.”
          </p>

          <span className="font-mono text-[11px] text-[#888]">
            theirs.page
          </span>
        </div>

      </div>

    </div>
  )
}

export default function LoginFormClient({ nextPath }: { nextPath?: string } = {}) {
  return (
    <Suspense
      fallback={
        <div className="h-screen max-h-screen w-screen overflow-hidden flex items-center justify-center bg-white">
          <Loader2 className="size-6 animate-spin text-primary" />
        </div>
      }
    >
      <LoginFormWithSearchParams nextPath={nextPath} />
    </Suspense>
  )
}
