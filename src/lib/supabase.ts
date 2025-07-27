import { createBrowserClient } from '@supabase/ssr'

function createClient() {
  const client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Handle refresh token errors by clearing stale tokens
  client.auth.onAuthStateChange((event, session) => {
    if (event === 'TOKEN_REFRESHED') {
      // Token refreshed successfully
    } else if (event === 'SIGNED_OUT') {
      // Clear any stale tokens from localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('supabase.auth.token')
      }
    }
  })

  return client
}

export { createClient } 