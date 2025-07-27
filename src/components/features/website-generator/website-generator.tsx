'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { WebsiteStyle } from '../style-selector/style-selector'

interface WebsiteGeneratorProps {
  cvDocumentId?: string
  selectedStyle?: WebsiteStyle
}

interface GeneratedWebsite {
  id: string
  name: string
  url: string
  status: 'generating' | 'completed' | 'failed'
  preview?: string
}

export default function WebsiteGenerator({ cvDocumentId, selectedStyle }: WebsiteGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedWebsite, setGeneratedWebsite] = useState<GeneratedWebsite | null>(null)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const handleGenerateWebsite = async () => {
    if (!cvDocumentId) {
      setError('Please upload a CV first')
      return
    }

    if (!selectedStyle) {
      setError('Please select a style first')
      return
    }

    setIsGenerating(true)
    setError(null)

    try {
      // First, get the CV data ID from the document ID
      const { data: cvData, error: cvError } = await supabase
        .from('cv_data')
        .select('id')
        .eq('cv_document_id', cvDocumentId)
        .single()

      if (cvError || !cvData) {
        throw new Error('CV data not found')
      }

      // Call the website generation API
      const response = await fetch('/api/websites/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cvDataId: cvData.id,
          config: {
            template: selectedStyle.layout.style,
            color_scheme: selectedStyle.colors.primary,
            font_family: selectedStyle.typography.headingFont.toLowerCase(),
            layout: 'single_page',
            features: {
              contact_form: true,
              social_links: true,
              analytics: false,
              blog: false
            },
            style_config: selectedStyle
          }
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Website generation failed')
      }

      const result = await response.json()

      setGeneratedWebsite({
        id: result.websiteId,
        name: `My Professional Website - ${new Date().toLocaleDateString()}`,
        url: `/api/websites/preview/${result.websiteId}`,
        status: 'completed',
        preview: `/api/websites/preview/${result.websiteId}`
      })

    } catch (err) {
      console.error('Error generating website:', err)
      setError('Failed to generate website. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownloadWebsite = async () => {
    if (!generatedWebsite) return

    try {
      const response = await fetch(`/api/websites/download/${generatedWebsite.id}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${generatedWebsite.name}-files.txt`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Download failed')
      }
    } catch (err) {
      console.error('Error downloading website:', err)
      setError('Failed to download website. Please try again.')
    }
  }

  return (
    <div className="space-y-6">
      {!generatedWebsite ? (
        <div className="text-center">
          <button
            onClick={handleGenerateWebsite}
            disabled={isGenerating || !cvDocumentId || !selectedStyle}
            className={`px-8 py-4 rounded-lg font-medium text-lg transition-all ${
              isGenerating || !cvDocumentId || !selectedStyle
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transform hover:scale-105'
            }`}
          >
            {isGenerating ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Generating your website...</span>
              </div>
            ) : (
              'Generate My Website'
            )}
          </button>
          
          {!cvDocumentId && (
            <p className="text-sm text-gray-600 mt-2">Please upload your CV first</p>
          )}
          
          {!selectedStyle && cvDocumentId && (
            <p className="text-sm text-gray-600 mt-2">Please select your preferred style</p>
          )}
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">✅</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Website Generated Successfully!</h3>
            <p className="text-gray-600 mb-6">
              Your professional website is ready. You can view it online or download the files.
            </p>
            
            <div className="space-y-4">
              <div className="bg-white rounded-lg p-4 border">
                <h4 className="font-semibold text-gray-900 mb-2">{generatedWebsite.name}</h4>
                <p className="text-sm text-gray-600 mb-3">Live URL: {generatedWebsite.url}</p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <a
                    href={generatedWebsite.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    View Live Website
                  </a>
                  <button
                    onClick={handleDownloadWebsite}
                    className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                  >
                    Download Files
                  </button>
                </div>
              </div>
              
              <button
                onClick={() => setGeneratedWebsite(null)}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Generate Another Website
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {/* Generation Progress */}
      {isGenerating && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Generating Your Website</h3>
            <p className="text-gray-600 mb-4">
              Our AI is analyzing your CV and creating a professional website with your selected style.
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
            </div>
            <p className="text-sm text-gray-500 mt-2">This usually takes 2-3 minutes...</p>
          </div>
        </div>
      )}
    </div>
  )
} 