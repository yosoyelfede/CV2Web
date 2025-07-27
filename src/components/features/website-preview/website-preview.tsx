'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'

interface WebsitePreviewProps {
  userId: string
}

interface Website {
  id: string
  name: string
  description: string
  deployment_url: string
  deployment_status: string
  created_at: string
}

export default function WebsitePreview({ userId }: WebsitePreviewProps) {
  const [websites, setWebsites] = useState<Website[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedWebsite, setSelectedWebsite] = useState<Website | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const fetchWebsites = async () => {
      try {
        const { data, error } = await supabase
          .from('websites')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Error fetching websites:', error)
        } else {
          setWebsites(data || [])
        }
      } catch (error) {
        console.error('Error fetching websites:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchWebsites()
  }, [userId, supabase])

  const handleDeploy = async (websiteId: string) => {
    try {
      const { error } = await supabase
        .from('websites')
        .update({ deployment_status: 'deploying' })
        .eq('id', websiteId)

      if (error) {
        console.error('Error updating deployment status:', error)
      } else {
        // Update local state
        setWebsites(prev => prev.map(site => 
          site.id === websiteId 
            ? { ...site, deployment_status: 'deploying' }
            : site
        ))

        // Simulate deployment process
        setTimeout(() => {
          setWebsites(prev => prev.map(site => 
            site.id === websiteId 
              ? { ...site, deployment_status: 'deployed' }
              : site
          ))
        }, 3000)
      }
    } catch (error) {
      console.error('Error deploying website:', error)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (websites.length === 0) {
    return (
      <div className="text-center py-8">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No websites yet</h3>
        <p className="mt-1 text-sm text-gray-500">
          Upload a CV to generate your first website.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        {websites.map((website) => (
          <div
            key={website.id}
            className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900">{website.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{website.description}</p>
                <div className="flex items-center mt-2 space-x-4">
                  <span className="text-xs text-gray-400">
                    Created {new Date(website.created_at).toLocaleDateString()}
                  </span>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      website.deployment_status === 'deployed'
                        ? 'bg-green-100 text-green-800'
                        : website.deployment_status === 'deploying'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {website.deployment_status}
                  </span>
                </div>
              </div>
              <div className="flex space-x-2">
                {website.deployment_status === 'deployed' && website.deployment_url && (
                  <a
                    href={website.deployment_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                  >
                    View Site
                  </a>
                )}
                {website.deployment_status === 'generated' && (
                  <button
                    onClick={() => handleDeploy(website.id)}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Deploy
                  </button>
                )}
                {website.deployment_status === 'deploying' && (
                  <button
                    disabled
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-gray-400 bg-gray-100 cursor-not-allowed"
                  >
                    Deploying...
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 