'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'

interface CVDocument {
  id: string
  original_filename: string
  processing_status: 'pending' | 'processing' | 'completed' | 'failed'
  created_at: string
  extracted_data?: any
}

interface CVListProps {
  userId: string
  onSelectCV: (documentId: string) => void
  selectedCVId?: string
}

export default function CVList({ userId, onSelectCV, selectedCVId }: CVListProps) {
  const [cvDocuments, setCvDocuments] = useState<CVDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const supabase = createClient()

  const fetchCVDocuments = useCallback(async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('cv_documents')
        .select('*')
        .eq('user_id', userId)
        .neq('processing_status', 'failed') // Filter out failed uploads
        .order('created_at', { ascending: false })

      if (error) throw error

      setCvDocuments(data || [])
    } catch (err) {
      console.error('Error fetching CV documents:', err)
      setError('Failed to load CV documents')
    } finally {
      setLoading(false)
    }
  }, [userId, supabase])

  useEffect(() => {
    fetchCVDocuments()
  }, [fetchCVDocuments])

  const handleDeleteCV = async (cvId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setDeleteConfirmId(cvId)
  }

  const confirmDelete = async () => {
    if (!deleteConfirmId) return

    try {
      const response = await fetch('/api/cv/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ documentId: deleteConfirmId }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete CV')
      }

      // Remove from local state
      setCvDocuments(prev => prev.filter(cv => cv.id !== deleteConfirmId))
      
      // If this was the selected CV, clear the selection
      if (selectedCVId === deleteConfirmId) {
        onSelectCV('')
      }
      
      // Show success message
      toast.success('CV deleted successfully')
    } catch (err) {
      console.error('Error deleting CV:', err)
      toast.error('Failed to delete CV. Please try again.')
    } finally {
      setDeleteConfirmId(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50'
      case 'processing':
        return 'text-blue-600 bg-blue-50'
      case 'failed':
        return 'text-red-600 bg-red-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Ready to use'
      case 'processing':
        return 'Processing...'
      case 'failed':
        return 'Failed'
      default:
        return 'Pending'
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Previously Uploaded CVs</h3>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-100 h-16 rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Previously Uploaded CVs</h3>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      </div>
    )
  }

  if (cvDocuments.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Previously Uploaded CVs</h3>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
          <p className="text-gray-600">No CVs uploaded yet. Upload your first CV to get started!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Previously Uploaded CVs</h3>
      
      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete CV</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this CV? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="space-y-3">
        {cvDocuments.map((cv) => (
          <div
            key={cv.id}
            className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
              selectedCVId === cv.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => cv.processing_status === 'completed' && onSelectCV(cv.id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 text-sm">📄</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 truncate">
                      {cv.original_filename}
                    </h4>
                    <p className="text-sm text-gray-500">
                      Uploaded {formatDistanceToNow(new Date(cv.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(cv.processing_status)}`}>
                  {getStatusText(cv.processing_status)}
                </span>
                <div className="flex items-center space-x-2">
                  {cv.processing_status === 'completed' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onSelectCV(cv.id)
                      }}
                      className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                        selectedCVId === cv.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {selectedCVId === cv.id ? 'Selected' : 'Use This CV'}
                    </button>
                  )}
                  <button
                    onClick={(e) => handleDeleteCV(cv.id, e)}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete CV"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 