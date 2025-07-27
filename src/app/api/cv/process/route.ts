import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { processCVWithClaude } from '@/lib/cv-processor'
import { cvProcessSchema, validateRequest } from '@/lib/validation'
import { apiRateLimiter } from '@/lib/rate-limiter'
import { csrfMiddleware, setCSRFToken } from '@/lib/csrf-protection'
import { handleError, authErrorResponse, validationErrorResponse, notFoundErrorResponse } from '@/lib/error-handler'
import { validateFileContent } from '@/lib/secure-content-sanitizer'
import { logUnauthorizedAccess, logSuspiciousContent } from '@/lib/security-monitoring'

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
    const rateLimitResult = apiRateLimiter(request)
    if (rateLimitResult) {
      return rateLimitResult
    }
    
    const supabase = createServerSupabaseClient()
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      logUnauthorizedAccess(ip, endpoint, method)
      return authErrorResponse()
    }

    // Validate request data
    const validation = await validateRequest(request, cvProcessSchema)
    if (!validation.success) {
      return validationErrorResponse(validation.error)
    }
    
    const { documentId } = validation.data

    // Get the CV document
    const { data: document, error: docError } = await supabase
      .from('cv_documents')
      .select('*')
      .eq('id', documentId)
      .eq('user_id', user.id)
      .single()

    if (docError || !document) {
      console.error('Document not found:', docError)
      return notFoundErrorResponse('Document')
    }

    try {
      // Update status to processing
      await supabase
        .from('cv_documents')
        .update({
          processing_status: 'processing',
          updated_at: new Date().toISOString()
        })
        .eq('id', document.id)

      // Download file from storage
      const { data: fileData, error: downloadError } = await supabase.storage
        .from('cv-documents')
        .download(document.file_path)

      if (downloadError) {
        console.error('Download error:', downloadError)
        throw downloadError
      }

      // Debug file information
      console.log('File download successful:')
      console.log('- File type:', typeof fileData)
      console.log('- File size:', fileData?.size)
      console.log('- File name:', document.original_filename)
      console.log('- File path:', document.file_path)
      console.log('- MIME type:', document.mime_type)

      // Extract text from file based on file type
      let cvContent: string
      
      if (document.mime_type === 'application/pdf') {
        // PDF files are not supported
        throw new Error('PDF files are not supported. Please upload a DOCX or TXT file instead.')
      } else if (document.mime_type.includes('word') || document.mime_type.includes('docx')) {
        // For DOCX files, use the updated extraction function
        const { extractTextFromDOCX } = require('@/lib/cv-processor')
        // Convert Blob to File for the extraction function
        const file = new File([fileData], document.file_name || 'document.docx', { type: document.mime_type })
        cvContent = await extractTextFromDOCX(file)
      } else {
        // For text files, use the standard text extraction
        cvContent = await fileData.text()
      }
      
      console.log('CV content length:', cvContent.length)
      console.log('CV content preview:', cvContent.substring(0, 200))

      // Validate and sanitize file content
      const contentValidation = validateFileContent(cvContent)
      if (!contentValidation.valid) {
        logSuspiciousContent(ip, endpoint, method, cvContent)
        throw new Error(contentValidation.error || 'Invalid CV content')
      }

      // Use sanitized content
      cvContent = contentValidation.sanitized || cvContent

      // Check if we have valid CV content
      if (cvContent.includes('PDF content could not be extracted') || 
          cvContent.includes('DOCX content could not be extracted') ||
          cvContent.includes('Since no CV content could be extracted') ||
          cvContent.length < 20) {
        throw new Error('Invalid CV content. Please try uploading a different file or format.')
      }

      // Process CV with Claude
      console.log('Processing CV with Claude...')
      const cvData = await processCVWithClaude(cvContent)
      console.log('CV data processed successfully')

      // Save processed data to database
      const { data: savedData, error: saveError } = await supabase
        .from('cv_data')
        .insert({
          cv_document_id: document.id,
          personal_info: cvData.personal_info,
          experience: cvData.experience,
          education: cvData.education,
          skills: cvData.skills,
          metadata: cvData.metadata
        })
        .select()
        .single()

      if (saveError) {
        console.error('Save error:', saveError)
        throw saveError
      }

      // Update document status
      await supabase
        .from('cv_documents')
        .update({
          processing_status: 'completed',
          extracted_data: cvData
        })
        .eq('id', document.id)

      const response = NextResponse.json({
        success: true,
        cvDataId: savedData.id,
        data: cvData,
        message: 'CV processed successfully'
      })

      // CSRF token setting temporarily disabled
      // return setCSRFToken(response)
      return response

    } catch (processingError) {
      console.error('CV processing error:', processingError)
      
      const errorMessage = processingError instanceof Error ? processingError.message : 'Unknown error'
      
      // Update document status to failed
      await supabase
        .from('cv_documents')
        .update({
          processing_status: 'failed',
          processing_errors: [errorMessage]
        })
        .eq('id', document.id)

      return handleError(processingError, 'CV Processing')
    }

  } catch (error) {
    return handleError(error, 'CV Process')
  }
} 