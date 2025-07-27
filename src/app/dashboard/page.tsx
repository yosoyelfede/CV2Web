import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import DashboardHeader from '@/components/dashboard/dashboard-header'
import DashboardStats from '@/components/dashboard/dashboard-stats'
import CVUploader from '@/components/features/cv-upload/cv-uploader'
import WebsitePreview from '@/components/features/website-preview/website-preview'

export default async function DashboardPage() {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader user={user} />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-2 text-gray-600">
              Welcome back! Manage your CVs and generated websites.
            </p>
          </div>

          <DashboardStats userId={user.id} />

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload CV</h2>
              <CVUploader userId={user.id} />
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Generated Websites</h2>
              <WebsitePreview userId={user.id} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 