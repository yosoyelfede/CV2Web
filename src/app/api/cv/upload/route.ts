import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { uploadRateLimiter } from '@/lib/rate-limiter'
import { csrfMiddleware, setCSRFToken } from '@/lib/csrf-protection'
import { handleError, authErrorResponse, validationErrorResponse } from '@/lib/error-handler'
import { validateFileUpload, validateFileSignature } from '@/lib/security-config'
import { logFileUploadViolation } from '@/lib/security-monitoring'

export async function POST(request: NextRequest) {
  try {
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
    const endpoint = request.nextUrl.pathname
    const method = request.method

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
      supabase = createServerSupabaseClient()
    } catch (error) {
      console.error('Failed to create Supabase client:', error)
      return NextResponse.json({
        success: false,
        error: 'Database connection failed. Please try again.'
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

    const formData = await request.formData()
    const file = formData.get('file') as File
    
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

    // Upload file to Supabase Storage
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}/${Date.now()}.${fileExt}`
    
    const { error: uploadError } = await supabase.storage
      .from('cv-documents')
      .upload(fileName, file)

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
    
    // Ensure we always return a proper JSON response
    return NextResponse.json({
      success: false,
      error: 'Upload failed due to an unexpected error. Please try again.',
      details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : 'Unknown error') : undefined
    }, { status: 500 })
  }
} 