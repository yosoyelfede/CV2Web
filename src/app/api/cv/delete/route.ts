import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function DELETE(request: NextRequest) {
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

    // Get the CV document to verify ownership and get file path
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

    // Delete the file from storage
    const { error: storageError } = await supabase.storage
      .from('cv-documents')
      .remove([document.file_path])

    if (storageError) {
      console.error('Storage deletion error:', storageError)
      // Continue with database deletion even if storage deletion fails
    }

    // Delete related CV data
    await supabase
      .from('cv_data')
      .delete()
      .eq('cv_document_id', documentId)

    // Delete processing jobs
    await supabase
      .from('processing_jobs')
      .delete()
      .eq('user_id', user.id)
      .eq('job_type', 'cv_processing')

    // Delete the CV document record
    const { error: deleteError } = await supabase
      .from('cv_documents')
      .delete()
      .eq('id', documentId)
      .eq('user_id', user.id)

    if (deleteError) {
      console.error('Database deletion error:', deleteError)
      return NextResponse.json(
        { error: `Failed to delete CV: ${deleteError.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'CV deleted successfully'
    })

  } catch (error) {
    console.error('CV deletion error:', error)
    return NextResponse.json(
      { error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
} 