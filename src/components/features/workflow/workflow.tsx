'use client'

import { useState } from 'react'
import CVUploader from '../cv-upload/cv-uploader'
import CVList from '../cv-upload/cv-list'
import StyleSelector, { WebsiteStyle } from '../style-selector/style-selector'
import WebsiteGenerator from '../website-generator/website-generator'

interface WorkflowProps {
  userId: string
}

export default function Workflow({ userId }: WorkflowProps) {
  const [cvDocumentId, setCvDocumentId] = useState<string | null>(null)
  const [selectedStyle, setSelectedStyle] = useState<WebsiteStyle | null>(null)
  const [showCVList, setShowCVList] = useState(false)
  const [refreshCVList, setRefreshCVList] = useState(0)

  const handleCVUploaded = (documentId: string) => {
    setCvDocumentId(documentId)
    setShowCVList(false) // Hide the list when a new CV is uploaded
    setRefreshCVList(prev => prev + 1) // Trigger CV list refresh
  }

  const handleCVSelected = (documentId: string) => {
    setCvDocumentId(documentId)
  }

  const handleStyleChange = (style: WebsiteStyle) => {
    setSelectedStyle(style)
  }

  return (
    <div className="space-y-8">
      {/* Step 1: Upload CV */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📄</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Step 1: Upload Your CV</h2>
          <p className="text-gray-600">Upload your CV in PDF, DOC, DOCX, or TXT format</p>
        </div>
        
        {/* CV Selection Tabs */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setShowCVList(false)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                !showCVList
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Upload New CV
            </button>
            <button
              onClick={() => setShowCVList(true)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                showCVList
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Use Previous CV
            </button>
          </div>
        </div>

        {/* CV Upload or CV List */}
        {showCVList ? (
          <CVList 
            key={refreshCVList} // Force re-render when refresh is triggered
            userId={userId} 
            onSelectCV={handleCVSelected}
            selectedCVId={cvDocumentId || undefined}
          />
        ) : (
          <CVUploader userId={userId} onUploaded={handleCVUploaded} />
        )}

        {/* Selected CV Info */}
        {cvDocumentId && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-sm">✅</span>
              </div>
              <div>
                <p className="text-sm font-medium text-green-900">CV Selected</p>
                <p className="text-xs text-green-700">Ready to proceed to the next step</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Step 2: Choose Style */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🎨</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Step 2: Choose Your Style</h2>
          <p className="text-gray-600">Select colors, typography, layout, and visual elements</p>
        </div>
        <StyleSelector onStyleChange={handleStyleChange} />
      </div>

      {/* Step 3: Generate Website */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🚀</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Step 3: Generate Your Website</h2>
          <p className="text-gray-600">Get your professional website ready in minutes</p>
        </div>
        <WebsiteGenerator cvDocumentId={cvDocumentId || undefined} selectedStyle={selectedStyle || undefined} />
      </div>
    </div>
  )
} 