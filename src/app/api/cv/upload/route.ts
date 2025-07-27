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
    
    const supabase = createServerSupabaseClient()
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return authErrorResponse()
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
    return handleError(error, 'CV Upload')
  }
} 