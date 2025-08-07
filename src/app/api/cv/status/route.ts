import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const documentId = searchParams.get('documentId')
    const jobId = searchParams.get('jobId')

    if (!documentId && !jobId) {
      return NextResponse.json(
        { error: 'Document ID or Job ID is required' },
        { status: 400 }
      )
    }

    let status = {}

    if (documentId) {
      // Get document status
      const { data: document, error: docError } = await supabase
        .from('cv_documents')
        .select(`
          id,
          original_filename,
          processing_status,
          processing_errors,
          created_at,
          updated_at,
          cv_data (
            id,
            personal_info,
            experience,
            education,
            skills
          )
        `)
        .eq('id', documentId)
        .eq('user_id', user.id)
        .single()

      if (docError) {
        return NextResponse.json(
          { error: 'Document not found' },
          { status: 404 }
        )
      }

      status = {
        documentId: document.id,
        filename: document.original_filename,
        status: document.processing_status,
        errors: document.processing_errors,
        createdAt: document.created_at,
        updatedAt: document.updated_at,
        cvData: document.cv_data
      }
    }

    if (jobId) {
      // Get job status
      const { data: job, error: jobError } = await supabase
        .from('processing_jobs')
        .select('*')
        .eq('id', jobId)
        .eq('user_id', user.id)
        .single()

      if (jobError) {
        return NextResponse.json(
          { error: 'Job not found' },
          { status: 404 }
        )
      }

      status = {
        ...status,
        jobId: job.id,
        jobType: job.job_type,
        jobStatus: job.status,
        jobError: job.error_message,
        jobStartedAt: job.started_at,
        jobCompletedAt: job.completed_at,
        jobCreatedAt: job.created_at
      }
    }

    return NextResponse.json({
      success: true,
      status
    })

  } catch (error) {
    console.error('CV status error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 