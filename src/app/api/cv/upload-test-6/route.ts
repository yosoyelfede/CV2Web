import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { uploadRateLimiter } from '@/lib/rate-limiter'
import { csrfMiddleware, setCSRFToken } from '@/lib/csrf-protection'
import { handleError, authErrorResponse, validationErrorResponse } from '@/lib/error-handler'
import { validateFileUpload, validateFileSignature } from '@/lib/security-config'
import { logFileUploadViolation } from '@/lib/security-monitoring'

export async function GET() {
  return NextResponse.json({ success: false, error: 'Method not allowed' }, { status: 405 })
}

export async function POST(request: NextRequest) {
  try {
    console.log('=== UPLOAD TEST 6: ALL IMPORTS - Final Test ===')
    
    const contentType = request.headers.get('content-type') || ''
    if (!contentType.includes('multipart/form-data')) {
      return validationErrorResponse('Invalid content type. Expected multipart/form-data')
    }

    // Test if Supabase client can be created
    const supabase = createServerSupabaseClient()
    
    // Test if rate limiter can be created
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
    const rateLimitResult = uploadRateLimiter(request)
    
    if (rateLimitResult) {
      return rateLimitResult // This is already a NextResponse with 429
    }
    
    // Test if CSRF middleware can be created
    const csrfResult = await csrfMiddleware(request)
    if (csrfResult) {
      return csrfResult // This is already a NextResponse with error
    }
    
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return validationErrorResponse('No file provided')
    }

    // Test if security config functions can be called
    const fileValidation = validateFileUpload(file)
    const signatureValidation = validateFileSignature(file)
    
    // Test if security monitoring can be called
    logFileUploadViolation(ip, 'test-violation', { fileName: file.name })

    return NextResponse.json({
      success: true,
      message: 'Upload test 6: ALL IMPORTS WORK - This should be identical to main route',
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      supabaseConnected: !!supabase,
      rateLimitSuccess: true,
      csrfSuccess: true,
      errorHandlerSuccess: true,
      securityConfigSuccess: true,
      securityMonitoringSuccess: true,
      fileValidation: fileValidation,
      signatureValidation: signatureValidation
    })

  } catch (error) {
    return handleError(error, 'Upload test 6 error')
  }
}
