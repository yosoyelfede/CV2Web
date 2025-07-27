import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Workflow from '@/components/features/workflow/workflow'

export default async function HomePage() {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">CV</span>
              </div>
              <span className="text-xl font-bold text-gray-900">CV2W</span>
            </div>
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">Welcome, {user.email}</span>
                <form action="/auth/signout" method="post">
                  <button type="submit" className="text-sm text-gray-500 hover:text-gray-700">
                    Sign out
                  </button>
                </form>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <a href="/login" className="text-sm text-gray-600 hover:text-gray-900">
                  Sign in
                </a>
                <a href="/register" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">
                  Get Started
                </a>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Transform your CV into a
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> stunning website</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Upload your CV, choose your style, and get a professional website in minutes. 
            No coding required.
          </p>
        </div>

        {/* Main Workflow */}
        {user ? (
          <Workflow userId={user.id} />
        ) : (
          <div className="text-center">
            <div className="bg-white rounded-2xl shadow-lg p-12">
              <div className="w-24 h-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">🔒</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to create your website?</h2>
              <p className="text-gray-600 mb-8">Sign up or sign in to start building your professional website from your CV.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="/register" className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                  Get Started Free
                </a>
                <a href="/login" className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                  Sign In
                </a>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-6 h-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded flex items-center justify-center">
                <span className="text-white font-bold text-xs">CV</span>
              </div>
              <span className="text-lg font-bold text-gray-900">CV2W</span>
            </div>
            <p className="text-gray-600 mb-4">Transform your CV into a stunning website with AI-powered technology.</p>
            <p className="text-sm text-gray-500">© 2024 CV2W. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
} 