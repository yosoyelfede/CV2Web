import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    
    // Test basic connection
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    // Test cv_documents table existence
    const { data: cvDocsTest, error: cvDocsError } = await supabase
      .from('cv_documents')
      .select('count')
      .limit(1)
    
    // Test cv_data table existence
    const { data: cvDataTest, error: cvDataError } = await supabase
      .from('cv_data')
      .select('count')
      .limit(1)
    
    // Test websites table existence
    const { data: websitesTest, error: websitesError } = await supabase
      .from('websites')
      .select('count')
      .limit(1)
    
    return NextResponse.json({
      success: true,
      auth: {
        user: user ? 'authenticated' : 'not authenticated',
        error: authError?.message || null
      },
      database: {
        cv_documents: {
          exists: !cvDocsError,
          error: cvDocsError?.message || null
        },
        cv_data: {
          exists: !cvDataError,
          error: cvDataError?.message || null
        },
        websites: {
          exists: !websitesError,
          error: websitesError?.message || null
        }
      }
    })

  } catch (error) {
    console.error('Test error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: `Test failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
      },
      { status: 500 }
    )
  }
} 