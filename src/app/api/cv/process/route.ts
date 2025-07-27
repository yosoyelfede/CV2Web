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
        // For PDF files, we need to use the enhanced extraction
        const { extractTextFromPDF } = await import('@/lib/cv-processor')
        const arrayBuffer = await fileData.arrayBuffer()
        const data = new Uint8Array(arrayBuffer)
        
        // Use pdf-parse directly here since we're in a server environment
        const pdfParse = require('pdf-parse')
        const result = await pdfParse(data)
        cvContent = result.text
      } else if (document.mime_type.includes('word') || document.mime_type.includes('docx')) {
        // For DOCX files, we need to use the enhanced extraction
        const { extractTextFromDOCX } = await import('@/lib/cv-processor')
        const arrayBuffer = await fileData.arrayBuffer()
        
        // Use docx library directly here since we're in a server environment
        const { Document } = require('docx')
        const doc = new Document(arrayBuffer)
        
        // Extract text from all paragraphs
        let text = ''
        for (const section of doc.sections) {
          for (const paragraph of section.children) {
            if (paragraph.children) {
              for (const run of paragraph.children) {
                if (run.text) {
                  text += run.text + ' '
                }
              }
            }
            text += '\n'
          }
        }
        cvContent = text.trim()
      } else {
        // For text files, use the standard text extraction
        cvContent = await fileData.text()
      }
      
      console.log('CV content length:', cvContent.length)

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