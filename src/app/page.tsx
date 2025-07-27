import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Workflow from '@/components/features/workflow/workflow'

export default async function HomePage() {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <div className="container">
          <div className="flex justify-between items-center py-6">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-semibold text-lg">CV</span>
              </div>
              <span className="text-xl font-semibold text-gray-900">CV2W</span>
            </div>

            {/* Navigation */}
            {user ? (
              <div className="flex items-center space-x-6">
                <span className="text-sm text-gray-600">Welcome, {user.email}</span>
                <form action="/auth/signout" method="post">
                  <button type="submit" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                    Sign out
                  </button>
                </form>
              </div>
            ) : (
              <div className="flex items-center space-x-6">
                <a href="/login" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  Sign in
                </a>
                <a href="/register" className="btn btn-primary">
                  Get Started
                </a>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {/* Hero Section */}
        <section className="section-lg">
          <div className="container">
            <div className="max-w-4xl mx-auto text-center">
              <div className="mb-16 animate-fade-in">
                <h1 className="text-display-1 mb-8 text-gray-900">
                  Transform your CV into a
                  <span className="block text-gradient">professional website</span>
                </h1>
                <p className="text-body-1 text-gray-600 max-w-2xl mx-auto text-balance">
                  Upload your CV, choose your style, and get a professional website in minutes. 
                  <span className="text-gray-900 font-medium"> No coding required.</span>
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-up">
                <a href="/register" className="btn btn-primary text-lg px-8 py-4">
                  Start Creating
                </a>
                <a href="#features" className="btn btn-outline text-lg px-8 py-4">
                  Learn More
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="section bg-gray-50">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-headline-1 mb-6 text-gray-900">How it works</h2>
              <p className="text-body-1 text-gray-600 max-w-2xl mx-auto text-balance">
                Three simple steps to transform your CV into a professional website
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="card card-elevated p-8 text-center group animate-fade-in animate-stagger-1">
                <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mb-6 mx-auto group-hover:scale-105 transition-transform duration-200">
                  <span className="text-2xl">📄</span>
                </div>
                <h3 className="text-headline-3 mb-4 text-gray-900">Upload CV</h3>
                <p className="text-body-2 text-gray-600">Simply drag and drop your CV file. We support PDF, DOC, and DOCX formats with AI-powered content extraction.</p>
              </div>

              {/* Feature 2 */}
              <div className="card card-elevated p-8 text-center group animate-fade-in animate-stagger-2">
                <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mb-6 mx-auto group-hover:scale-105 transition-transform duration-200">
                  <span className="text-2xl">🎨</span>
                </div>
                <h3 className="text-headline-3 mb-4 text-gray-900">Choose Style</h3>
                <p className="text-body-2 text-gray-600">Select from our curated collection of professional website templates designed for modern portfolios.</p>
              </div>

              {/* Feature 3 */}
              <div className="card card-elevated p-8 text-center group animate-fade-in animate-stagger-3">
                <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mb-6 mx-auto group-hover:scale-105 transition-transform duration-200">
                  <span className="text-2xl">🚀</span>
                </div>
                <h3 className="text-headline-3 mb-4 text-gray-900">Generate & Deploy</h3>
                <p className="text-body-2 text-gray-600">Get your professional website instantly with AI-powered content generation and automatic deployment.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Main Workflow */}
        {user ? (
          <section className="section">
            <div className="container">
              <div className="text-center mb-16">
                <h2 className="text-headline-1 mb-6 text-gray-900">Create Your Website</h2>
                <p className="text-body-1 text-gray-600 max-w-2xl mx-auto text-balance">
                  Ready to transform your CV into a stunning professional website?
                </p>
              </div>
              <div className="card card-elevated p-8 max-w-4xl mx-auto">
                <Workflow userId={user.id} />
              </div>
            </div>
          </section>
        ) : (
          <section className="section">
            <div className="container">
              <div className="text-center">
                <div className="card card-elevated p-16 max-w-2xl mx-auto">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-8">
                    <span className="text-2xl">🔒</span>
                  </div>
                  <h2 className="text-headline-1 mb-6 text-gray-900">Ready to create your website?</h2>
                  <p className="text-body-1 text-gray-600 mb-12 max-w-xl mx-auto text-balance">
                    Sign up or sign in to start building your professional website from your CV.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <a href="/register" className="btn btn-primary text-lg px-8 py-4">
                      Get Started Free
                    </a>
                    <a href="/login" className="btn btn-outline text-lg px-8 py-4">
                      Sign In
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Stats Section */}
        <section className="section bg-gray-50">
          <div className="container">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div className="card card-elevated p-8 animate-fade-in animate-stagger-1">
                <div className="text-4xl font-semibold text-blue-600 mb-4">1000+</div>
                <h3 className="text-headline-3 mb-2 text-gray-900">Websites Created</h3>
                <p className="text-body-2 text-gray-600">Professional websites generated from CVs</p>
              </div>
              <div className="card card-elevated p-8 animate-fade-in animate-stagger-2">
                <div className="text-4xl font-semibold text-blue-600 mb-4">50+</div>
                <h3 className="text-headline-3 mb-2 text-gray-900">Templates</h3>
                <p className="text-body-2 text-gray-600">Curated professional website templates</p>
              </div>
              <div className="card card-elevated p-8 animate-fade-in animate-stagger-3">
                <div className="text-4xl font-semibold text-blue-600 mb-4">5min</div>
                <h3 className="text-headline-3 mb-2 text-gray-900">Average Time</h3>
                <p className="text-body-2 text-gray-600">From CV upload to live website</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="container py-12">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-8">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-semibold text-sm">CV</span>
              </div>
              <span className="text-lg font-semibold text-gray-900">
                CV2W
              </span>
            </div>
            <p className="text-body-1 text-gray-600 mb-4">
              Transform your CV into a stunning website with AI-powered technology.
            </p>
            <p className="text-caption text-gray-500">© 2024 CV2W. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
} 