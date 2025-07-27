'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'
import { GoogleSignInButton } from '@/components/ui/google-signin-button'
import { LogoutButton } from '@/components/ui/logout-button'

export default function TestAuthPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const supabase = createClient()

  useEffect(() => {
    // Get initial user
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }

    getUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Auth Test Page</h1>
          <p className="text-gray-600">Test your Google Sign-In setup</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {user ? (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">✅</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Successfully Signed In!</h2>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div>
                <span className="text-sm font-medium text-gray-700">Email:</span>
                <span className="text-sm text-gray-900 ml-2">{user.email}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">User ID:</span>
                <span className="text-sm text-gray-900 ml-2">{user.id}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Provider:</span>
                <span className="text-sm text-gray-900 ml-2">
                  {user.app_metadata?.provider || 'email'}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Created:</span>
                <span className="text-sm text-gray-900 ml-2">
                  {new Date(user.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <LogoutButton className="w-full" variant="outline">
                Sign Out
              </LogoutButton>
              <a 
                href="/" 
                className="block w-full text-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Go to Home
              </a>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔒</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Not Signed In</h2>
              <p className="text-gray-600">Try signing in with Google to test the setup</p>
            </div>

            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-3">Test your Google OAuth setup</p>
              </div>
              <GoogleSignInButton
                onError={(error) => setError(error)}
                onSuccess={() => setError('')}
                className="mb-2"
              />
              <a 
                href="/login" 
                className="block w-full text-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                Go to Login Page
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 