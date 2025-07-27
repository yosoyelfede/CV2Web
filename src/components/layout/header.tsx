import React, { useState } from 'react'
import Link from 'next/link'
import { User } from '@/types'

interface HeaderProps {
  user?: User
  onLogout?: () => void
}

const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="bg-white border-b border-secondary-200 shadow-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <span className="text-xl font-bold text-secondary-900">CV2W</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              href="/dashboard" 
              className="text-secondary-600 hover:text-primary-600 transition-colors"
            >
              Dashboard
            </Link>
            <Link 
              href="/dashboard/cv-upload" 
              className="text-secondary-600 hover:text-primary-600 transition-colors"
            >
              Upload CV
            </Link>
            <Link 
              href="/dashboard/websites" 
              className="text-secondary-600 hover:text-primary-600 transition-colors"
            >
              Websites
            </Link>
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center space-x-2 text-secondary-700 hover:text-secondary-900 transition-colors"
                >
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-600 font-medium text-sm">
                      {user.full_name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="hidden sm:block text-sm font-medium">
                    {user.full_name || user.email}
                  </span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-large border border-secondary-200 py-1 z-50">
                    <Link
                      href="/dashboard/settings"
                      className="block px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Settings
                    </Link>
                    <button
                      onClick={() => {
                        onLogout?.()
                        setIsMenuOpen(false)
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/login"
                  className="text-secondary-600 hover:text-primary-600 transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-secondary-600 hover:text-secondary-900"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-secondary-200">
            <nav className="flex flex-col space-y-2">
              <Link 
                href="/dashboard" 
                className="text-secondary-600 hover:text-primary-600 transition-colors px-4 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link 
                href="/dashboard/cv-upload" 
                className="text-secondary-600 hover:text-primary-600 transition-colors px-4 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Upload CV
              </Link>
              <Link 
                href="/dashboard/websites" 
                className="text-secondary-600 hover:text-primary-600 transition-colors px-4 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Websites
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header 