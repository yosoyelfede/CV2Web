'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'

interface LogoutButtonProps {
  className?: string
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline'
  children?: React.ReactNode
}

export function LogoutButton({ 
  className = '', 
  variant = 'ghost',
  children = 'Sign out'
}: LogoutButtonProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    setLoading(true)
    
    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('Logout error:', error)
      }
      
      // Redirect to home page and refresh
      router.push('/')
      router.refresh()
    } catch (err) {
      console.error('Unexpected logout error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      type="button"
      variant={variant}
      onClick={handleLogout}
      disabled={loading}
      className={className}
    >
      {loading ? 'Signing out...' : children}
    </Button>
  )
} 