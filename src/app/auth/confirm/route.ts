import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest } from 'next/server'
import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/'

  if (token_hash && type) {
    const supabase = createServerSupabaseClient()

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })
    
    if (!error) {
      // Email confirmed successfully, redirect to dashboard
      redirect(next)
    } else {
      // Error confirming email, redirect to error page
      redirect('/login?error=Email confirmation failed. Please try again.')
    }
  }

  // Invalid or missing parameters, redirect to error page
  redirect('/login?error=Invalid confirmation link.')
} 