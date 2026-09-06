'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { sanitizeAuthDestination } from '@/lib/auth/redirect'

export interface AuthState {
  error?: string
  success?: string
}

export async function signInWithMagicLink(
  _prevState: AuthState | null,
  formData: FormData
): Promise<AuthState> {
  const supabase = await createClient()
  const email = (formData.get('email') as string)?.trim()
  const captchaToken = (formData.get('captchaToken') as string)?.trim() || undefined
  const rawNext = (formData.get('next') as string | null) || '/dashboard'
  const nextPath = sanitizeAuthDestination(rawNext)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const callbackUrl = new URL('/auth/callback', siteUrl)
  callbackUrl.searchParams.set('next', nextPath)

  if (!email) {
    return { error: 'Please enter a valid email address.' }
  }

  // Process magic link request

  try {
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: callbackUrl.toString(),
        captchaToken,
      },
    })

    if (error) {
      if (error.message?.toLowerCase().includes('captcha')) {
        console.warn('Supabase Auth rejected OTP due to captcha verification:', error.message)
        return {
          error:
            'Security check verification failed. Please refresh the page and try again.',
        }
      }
      return { error: error.message }
    }

    return { success: 'Check your email for the magic link!' }
  } catch (err) {
    return { error: 'An unexpected error occurred. Please try again.' }
  }
}

export async function signInWithGoogle(next?: string): Promise<void> {
  const supabase = await createClient()
  const nextPath = sanitizeAuthDestination(next)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const callbackUrl = new URL('/auth/callback', siteUrl)
  callbackUrl.searchParams.set('next', nextPath)

  // Start Google OAuth

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: callbackUrl.toString(),
    },
  })

  if (error) {
    redirect('/error')
  }

  if (data?.url) {
    redirect(data.url)
  }

  redirect('/error')
}
