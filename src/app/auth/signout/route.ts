import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'

export async function POST() {
  const supabase = createServerSupabaseClient()
  
  // Sign out the user
  await supabase.auth.signOut()
  
  // Redirect to home page
  redirect('/')
} 