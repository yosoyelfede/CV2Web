import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { processCVWithClaude } from '@/lib/cv-processor'

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { documentId } = await request.json()
    
    if (!documentId) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      )
    }

    // Get the CV document
    const { data: document, error: docError } = await supabase
      .from('cv_documents')
      .select('*')
      .eq('id', documentId)
      .eq('user_id', user.id)
      .single()

    if (docError || !document) {
      console.error('Document not found:', docError)
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
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

      // Extract text from file based on file type
      let cvContent: string
      
      if (document.mime_type === 'application/pdf') {
        // For PDF files, use the updated extraction function
        const { extractTextFromPDF } = require('@/lib/cv-processor')
        // Convert Blob to File for the extraction function
        const file = new File([fileData], document.file_name || 'document.pdf', { type: document.mime_type })
        cvContent = await extractTextFromPDF(file)
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

      // Check if we have valid CV content
      if (cvContent.includes('PDF content could not be extracted') || 
          cvContent.includes('DOCX content could not be extracted') ||
          cvContent.includes('Since no CV content could be extracted') ||
          cvContent.length < 50) {
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

      return NextResponse.json({
        success: true,
        cvDataId: savedData.id,
        data: cvData,
        message: 'CV processed successfully'
      })

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

      return NextResponse.json(
        { error: 'CV processing failed', details: errorMessage },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('CV process error:', error)
    return NextResponse.json(
      { error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
} 