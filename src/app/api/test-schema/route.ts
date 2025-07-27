import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    
    // Force schema cache refresh by running a simple query
    const { data: websites, error: websitesError } = await supabase
      .from('websites')
      .select('id, cv_data_id')
      .limit(1)
    
    if (websitesError) {
      console.error('Websites table error:', websitesError)
    }
    
    // Test cv_data table
    const { data: cvData, error: cvDataError } = await supabase
      .from('cv_data')
      .select('id')
      .limit(1)
    
    if (cvDataError) {
      console.error('CV data table error:', cvDataError)
    }
    
    // Test processing_jobs table
    const { data: jobs, error: jobsError } = await supabase
      .from('processing_jobs')
      .select('id')
      .limit(1)
    
    if (jobsError) {
      console.error('Processing jobs table error:', jobsError)
    }
    
    return NextResponse.json({
      success: true,
      websites: websites || [],
      cvData: cvData || [],
      jobs: jobs || [],
      errors: {
        websites: websitesError?.message,
        cvData: cvDataError?.message,
        jobs: jobsError?.message
      }
    })

  } catch (error) {
    console.error('Schema test error:', error)
    return NextResponse.json(
      { error: `Schema test failed: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
} 