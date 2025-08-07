'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { GoogleSignInButton } from '@/components/ui/google-signin-button'

function LoginContent() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    const message = searchParams.get('message')
    if (message) {
      setSuccessMessage(message)
    }
  }, [searchParams])

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        // Provide more specific error messages
        if (error.message.includes('Invalid login credentials')) {
          setError('Invalid email or password. If you just registered, please check your email to confirm your account.')
        } else if (error.message.includes('Email not confirmed')) {
          setError('Please check your email and click the confirmation link before signing in.')
        } else if (error.message.includes('Too many requests')) {
          setError('Too many login attempts. Please wait a few minutes before trying again.')
        } else {
          setError(error.message)
        }
      } else {
        router.push('/')
        router.refresh()
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-neutral-50/20" />
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-primary/10 to-primary/5 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-secondary/10 to-secondary/5 rounded-full blur-3xl animate-float-slow" />
        </div>
      </div>

      {/* Header */}
      <header className="relative z-50 border-b border-neutral-200/50 bg-white/80 backdrop-blur-xl">
        <div className="container">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="relative group">
                <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white font-medium text-lg">CV</span>
                </div>
                <div className="absolute -inset-1 bg-primary rounded-lg blur opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
              </div>
              <span className="text-headline-small font-medium text-gradient">
                CV2W
              </span>
            </div>
            <a href="/register" className="btn-secondary-outline">
              Sign Up
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-20 flex items-center justify-center min-h-[calc(100vh-80px)]">
        <div className="w-full max-w-md">
          <div className="card-elevated p-8">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 animate-float">
                <span className="text-2xl text-primary">🔒</span>
              </div>
              <h1 className="text-headline-medium mb-2 text-neutral-900">Welcome Back</h1>
              <p className="text-body-medium text-neutral-600">
                Sign in to your account to continue
              </p>
            </div>

            {successMessage && (
              <div className="p-3 bg-success/10 border border-success/20 rounded-lg mb-6">
                <p className="text-body-small text-success">{successMessage}</p>
              </div>
            )}

            <form onSubmit={handleSignIn} className="space-y-6">
              {error && (
                <div className="p-3 bg-secondary/10 border border-secondary/20 rounded-lg">
                  <p className="text-body-small text-secondary">{error}</p>
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-label-large font-medium text-neutral-900 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="input-field w-full"
                  placeholder="Enter your email"
                  disabled={loading}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-label-large font-medium text-neutral-900 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="input-field w-full"
                  placeholder="Enter your password"
                  disabled={loading}
                />
              </div>

              <Button type="submit" className="w-full btn-primary" disabled={loading}>
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-neutral-200/50" />
                </div>
                <div className="relative flex justify-center text-label-small uppercase">
                  <span className="bg-white px-4 text-neutral-500 font-medium">Or continue with</span>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <div className="text-center mb-4">
                <p className="text-body-small text-neutral-600 mb-2">Quick and secure sign-in</p>
              </div>
              <GoogleSignInButton
                onError={(error) => setError(error)}
                onSuccess={() => {
                  router.push('/')
                  router.refresh()
                }}
                className="mb-4"
              />
              <div className="text-center">
                <p className="text-label-small text-neutral-500">
                  By continuing, you agree to our Terms of Service and Privacy Policy
                </p>
              </div>
            </div>

            <div className="mt-8 text-center">
              <p className="text-body-medium text-neutral-600">
                Don&apos;t have an account?{' '}
                <a href="/register" className="text-primary hover:text-primary/80 font-medium transition-colors">
                  Sign up
                </a>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginContent />
    </Suspense>
  )
} 