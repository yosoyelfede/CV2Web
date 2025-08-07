'use client'

import { useState, useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { createClient } from '@/lib/supabase'

interface CVUploaderProps {
  userId?: string
  onUploaded?: (documentId: string) => void
}

export default function CVUploader({ userId, onUploaded }: CVUploaderProps) {
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [supabase.auth])

  const currentUserId = userId || user?.id
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState('')

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return

    const file = acceptedFiles[0]
    setUploading(true)
    setUploadProgress(0)
    setUploadStatus('Uploading CV...')

    try {
      // Create form data
      const formData = new FormData()
      formData.append('file', file)

      setUploadProgress(30)
      setUploadStatus('Uploading to server...')

      // Upload file using API
      const uploadResponse = await fetch('/api/cv/upload', {
        method: 'POST',
        body: formData,
      })

      console.log('Upload response status:', uploadResponse.status)
      console.log('Upload response headers:', Object.fromEntries(uploadResponse.headers.entries()))

      if (!uploadResponse.ok) {
        const responseText = await uploadResponse.text()
        console.log('Upload error response text:', responseText)
        
        try {
          const errorData = JSON.parse(responseText)
          throw new Error(errorData.error || 'Upload failed')
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError)
          throw new Error(`Upload failed: ${responseText || 'Empty response'}`)
        }
      }

      const uploadResult = await uploadResponse.json()
      
      setUploadProgress(60)
      setUploadStatus('Processing CV with AI...')

      // Trigger CV processing
      const processResponse = await fetch('/api/cv/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentId: uploadResult.documentId
        }),
      })

      if (!processResponse.ok) {
        const errorData = await processResponse.json()
        throw new Error(errorData.error || 'Processing failed')
      }

      const processResult = await processResponse.json()

      setUploadProgress(100)
      setUploadStatus('CV processed successfully!')
      
      // Call the callback with the document ID
      if (onUploaded) {
        onUploaded(uploadResult.documentId)
      }
      
      // Reset after 3 seconds
      setTimeout(() => {
        setUploading(false)
        setUploadProgress(0)
        setUploadStatus('')
      }, 3000)

    } catch (error) {
      console.error('Upload error:', error)
      setUploadStatus(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setUploading(false)
      setUploadProgress(0)
    }
  }, [onUploaded])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
    },
    maxFiles: 1,
    disabled: uploading,
  })

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-indigo-400 bg-indigo-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />
        <div className="space-y-2">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div className="text-sm text-gray-600">
            {isDragActive ? (
              <p>Drop the CV file here...</p>
            ) : (
              <p>
                <span className="font-medium text-indigo-600 hover:text-indigo-500">
                  Click to upload
                </span>{' '}
                or drag and drop
              </p>
            )}
                            <p className="text-xs text-gray-500">DOC, DOCX, or TXT up to 10MB</p>
          </div>
        </div>
      </div>

      {uploading && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>{uploadStatus}</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      {uploadStatus && !uploading && (
        <div className={`text-sm p-3 rounded-md ${
          uploadStatus.includes('successfully') 
            ? 'bg-green-50 text-green-700' 
            : 'bg-red-50 text-red-700'
        }`}>
          {uploadStatus}
        </div>
      )}
    </div>
  )
} 