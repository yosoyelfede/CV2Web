'use client'

import { useState, useEffect } from 'react'

interface DeploymentStatusProps {
  deploymentId: string
  onStatusChange: (status: string, url?: string) => void
}

export default function DeploymentStatus({ deploymentId, onStatusChange }: DeploymentStatusProps) {
  const [status, setStatus] = useState<string>('BUILDING')
  const [url, setUrl] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [isPolling, setIsPolling] = useState(true)

  useEffect(() => {
    if (!deploymentId || !isPolling) return

    const pollStatus = async () => {
      try {
        const response = await fetch(`/api/websites/deploy?deploymentId=${deploymentId}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch deployment status')
        }

        const data = await response.json()
        
        if (data.success) {
          setStatus(data.status)
          if (data.url) {
            setUrl(data.url)
          }
          
          // Stop polling if deployment is complete or failed
          if (data.status === 'READY' || data.status === 'ERROR') {
            setIsPolling(false)
            onStatusChange(data.status, data.url)
          }
        } else {
          setError(data.error || 'Unknown error')
          setIsPolling(false)
        }
      } catch (err) {
        console.error('Error polling deployment status:', err)
        setError('Failed to check deployment status')
        setIsPolling(false)
      }
    }

    // Poll every 3 seconds
    const interval = setInterval(pollStatus, 3000)
    
    // Initial check
    pollStatus()

    return () => clearInterval(interval)
  }, [deploymentId, isPolling, onStatusChange])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'BUILDING':
        return 'text-blue-600'
      case 'READY':
        return 'text-green-600'
      case 'ERROR':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'BUILDING':
        return '🔨'
      case 'READY':
        return '✅'
      case 'ERROR':
        return '❌'
      default:
        return '⏳'
    }
  }

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'BUILDING':
        return 'Building your website...'
      case 'READY':
        return 'Website deployed successfully!'
      case 'ERROR':
        return 'Deployment failed'
      default:
        return 'Checking deployment status...'
    }
  }

  return (
    <div className="bg-white rounded-lg border p-4">
      <div className="flex items-center space-x-3">
        <span className="text-2xl">{getStatusIcon(status)}</span>
        <div className="flex-1">
          <h4 className={`font-medium ${getStatusColor(status)}`}>
            {getStatusMessage(status)}
          </h4>
          {url && status === 'READY' && (
            <p className="text-sm text-gray-600 mt-1">
              Live URL: <span className="font-mono text-blue-600">{url}</span>
            </p>
          )}
          {error && (
            <p className="text-sm text-red-600 mt-1">{error}</p>
          )}
        </div>
        {isPolling && status === 'BUILDING' && (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        )}
      </div>
      
      {status === 'BUILDING' && (
        <div className="mt-3">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '70%' }}></div>
          </div>
          <p className="text-xs text-gray-500 mt-1">This usually takes 1-2 minutes...</p>
        </div>
      )}
    </div>
  )
} 