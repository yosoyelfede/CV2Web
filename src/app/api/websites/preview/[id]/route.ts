import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const websiteId = params.id

    // Get the website data
    const { data: website, error: websiteError } = await supabase
      .from('websites')
      .select('*')
      .eq('id', websiteId)
      .eq('user_id', user.id)
      .single()

    if (websiteError || !website) {
      return NextResponse.json(
        { error: 'Website not found' },
        { status: 404 }
      )
    }

    if (website.deployment_status !== 'live') {
      return NextResponse.json(
        { error: 'Website generation not completed' },
        { status: 400 }
      )
    }

    // Get the complete HTML
    const completeHTML = website.generated_code?.complete_html || website.generated_code?.html

    if (!completeHTML) {
      return NextResponse.json(
        { error: 'Website content not found' },
        { status: 404 }
      )
    }

    // Return the HTML with proper headers
    return new NextResponse(completeHTML, {
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'no-cache',
      },
    })

  } catch (error) {
    console.error('Website preview error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 