import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    await supabase.auth.signOut()
  } catch (error) {
    console.error('Sign out error:', error)
  }

  const accept = request.headers.get('accept') || ''
  if (accept.includes('application/json') && !accept.includes('text/html')) {
    return NextResponse.json({ success: true })
  }

  const { origin } = new URL(request.url)
  return NextResponse.redirect(`${origin}/`, { status: 303 })
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    await supabase.auth.signOut()
  } catch (error) {
    console.error('Sign out error:', error)
  }

  const { origin } = new URL(request.url)
  return NextResponse.redirect(`${origin}/`, { status: 303 })
}
