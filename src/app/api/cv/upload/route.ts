import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { uploadRateLimiter } from '@/lib/rate-limiter'
import { csrfMiddleware, setCSRFToken } from '@/lib/csrf-protection'
import { handleError, authErrorResponse, validationErrorResponse } from '@/lib/error-handler'
import { validateFileUpload, validateFileSignature } from '@/lib/security-config'
import { logFileUploadViolation } from '@/lib/security-monitoring'

// Ensure Node.js runtime for proper multipart handling
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Handle CORS/preflight or accidental GETs with a consistent JSON response
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin') || '*'
  const res = new NextResponse(null, { status: 204 })
  res.headers.set('Access-Control-Allow-Origin', origin)
  res.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token')
  res.headers.set('Access-Control-Allow-Credentials', 'true')
  res.headers.set('Allow', 'POST, OPTIONS')
  return res
}

export async function GET() {
  return NextResponse.json({ success: false, error: 'Method not allowed' }, { status: 405 })
}

export async function POST(request: NextRequest) {
  try {
    console.log('=== CV UPLOAD ROUTE CALLED ===')
    console.log('Environment:', process.env.NODE_ENV)
    console.log('Request method:', request.method)
    console.log('Request URL:', request.url)
    
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
    const endpoint = request.nextUrl.pathname
    const method = request.method

    console.log('Upload endpoint called in production-safe mode')

    // Validate environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('Missing Supabase environment variables')
      return NextResponse.json({
        success: false,
        error: 'Server configuration error. Please contact support.'
      }, { status: 500 })
    }

    // CSRF protection temporarily disabled for testing
    // const csrfResult = csrfMiddleware(request)
    // if (csrfResult) {
    //   return csrfResult
    // }

    // Apply rate limiting
    const rateLimitResult = uploadRateLimiter(request)
    if (rateLimitResult) {
      return rateLimitResult
    }
    
    let supabase
    try {
      console.log('Creating Supabase client...')
      supabase = createServerSupabaseClient()
      console.log('Supabase client created successfully')
    } catch (error) {
      console.error('Failed to create Supabase client:', error)
      return NextResponse.json({
        success: false,
        error: 'Database connection failed. Please try again.',
        details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : 'Unknown error') : undefined
      }, { status: 500 })
    }
    
    // Get the current user
    let user
    try {
      const { data, error: authError } = await supabase.auth.getUser()
      if (authError) {
        console.error('Authentication error:', authError)
        return NextResponse.json({
          success: false,
          error: 'Authentication failed. Please log in again.'
        }, { status: 401 })
      }
      if (!data.user) {
        return NextResponse.json({
          success: false,
          error: 'User not authenticated. Please log in.'
        }, { status: 401 })
      }
      user = data.user
    } catch (error) {
      console.error('Authentication failed:', error)
      return NextResponse.json({
        success: false,
        error: 'Authentication service unavailable. Please try again.'
      }, { status: 500 })
    }

    // Safely parse multipart form-data
    let file: File | null = null
    try {
      const contentType = request.headers.get('content-type') || ''
      if (!contentType.toLowerCase().includes('multipart/form-data')) {
        return validationErrorResponse('Invalid content type. Expected multipart/form-data')
      }

      const formData = await request.formData()
      const maybeFile = formData.get('file')
      file = (maybeFile instanceof File) ? maybeFile : null
    } catch (parseError) {
      console.error('Failed to parse form-data:', parseError)
      return NextResponse.json({ success: false, error: 'Failed to read upload payload' }, { status: 400 })
    }
    
    if (!file) {
      return validationErrorResponse('No file provided')
    }

    // Validate file using security config
    const validation = validateFileUpload(file)
    if (!validation.valid) {
      logFileUploadViolation(ip, endpoint, method, {
        filename: file.name,
        size: file.size,
        type: file.type,
        error: validation.error
      })
      return validationErrorResponse(validation.error || 'Invalid file')
    }

    // Validate file signature (magic numbers)
    const signatureValidation = await validateFileSignature(file)
    if (!signatureValidation.valid) {
      logFileUploadViolation(ip, endpoint, method, {
        filename: file.name,
        size: file.size,
        type: file.type,
        error: signatureValidation.error
      })
      return validationErrorResponse(signatureValidation.error || 'File signature validation failed')
    }

    // Upload file to Supabase Storage (use ArrayBuffer for Node reliability)
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}/${Date.now()}.${fileExt}`

    let contentType = file.type
    if (!contentType) {
      // Fallback content type based on extension
      const ext = (fileExt || '').toLowerCase()
      if (ext === 'doc') contentType = 'application/msword'
      else if (ext === 'docx') contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      else if (ext === 'txt') contentType = 'text/plain'
      else contentType = 'application/octet-stream'
    }

    const arrayBuffer = await file.arrayBuffer()
    const bytes = new Uint8Array(arrayBuffer)

    const { error: uploadError } = await supabase.storage
      .from('cv-documents')
      .upload(fileName, bytes, { contentType, upsert: false })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      return handleError(uploadError, 'CV Upload')
    }

    // Create database record
    const { data: document, error: dbError } = await supabase
      .from('cv_documents')
      .insert({
        user_id: user.id,
        original_filename: file.name,
        file_path: fileName,
        file_size: file.size,
        mime_type: file.type,
        processing_status: 'pending',
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      return handleError(dbError, 'CV Upload Database')
    }

    const response = NextResponse.json({
      success: true,
      documentId: document.id,
      message: 'CV uploaded successfully'
    })

    // CSRF token setting temporarily disabled
    // return setCSRFToken(response)
    return response

  } catch (error) {
    console.error('CV Upload unexpected error:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    console.error('Environment:', process.env.NODE_ENV)
    console.error('Request method:', request.method)
    console.error('Request URL:', request.url)
    
    // Ensure we always return a proper JSON response
    return NextResponse.json({
      success: false,
      error: 'Upload failed due to an unexpected error. Please try again.',
      details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : 'Unknown error') : undefined
    }, { status: 500 })
  }
} 