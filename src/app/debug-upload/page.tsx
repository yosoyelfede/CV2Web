'use client'

import { useState } from 'react'

export default function DebugUploadPage() {
  const [status, setStatus] = useState('')
  const [response, setResponse] = useState('')

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setStatus('Testing upload...')
    setResponse('')

    try {
      const formData = new FormData()
      formData.append('file', file)

      console.log('Testing upload with file:', file.name, file.size, file.type)

      // Test the debug endpoint first
      const debugResponse = await fetch('/api/debug-upload', {
        method: 'POST',
        body: formData,
      })

      console.log('Debug response status:', debugResponse.status)
      const debugText = await debugResponse.text()
      console.log('Debug response text:', debugText)

      setResponse(`Debug Endpoint Response:\nStatus: ${debugResponse.status}\nBody: ${debugText}`)

      if (debugResponse.ok) {
        setStatus('Debug test successful! Check response below.')
      } else {
        setStatus(`Debug test failed: ${debugResponse.status}`)
      }

    } catch (error) {
      console.error('Debug test error:', error)
      setStatus(`Debug test error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Upload Debug Test</h1>
      
      <div className="mb-4">
        <input
          type="file"
          accept=".doc,.docx,.txt"
          onChange={handleFileUpload}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
        />
      </div>

      {status && (
        <div className={`p-4 rounded-md mb-4 ${
          status.includes('successful') 
            ? 'bg-green-50 text-green-700' 
            : 'bg-red-50 text-red-700'
        }`}>
          {status}
        </div>
      )}

      {response && (
        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="font-semibold mb-2">Response:</h3>
          <pre className="text-sm overflow-auto whitespace-pre-wrap">{response}</pre>
        </div>
      )}
    </div>
  )
}
