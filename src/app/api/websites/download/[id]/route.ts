import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { generateWebsiteFiles } from '@/lib/website-generator'

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

    if (website.deployment_status !== 'completed') {
      return NextResponse.json(
        { error: 'Website generation not completed' },
        { status: 400 }
      )
    }

    // Create website files
    const websiteFiles = generateWebsiteFiles({
      html: website.generated_code?.html || '',
      css: website.generated_code?.css || '',
      javascript: website.generated_code?.javascript || '',
      metadata: website.generated_code?.metadata || {
        title: website.name,
        description: website.description,
        keywords: []
      }
    })

    // Create a simple text-based zip-like structure
    // In a production environment, you'd use a proper zip library
    const zipContent = Object.entries(websiteFiles)
      .map(([filename, content]) => `=== ${filename} ===\n${content}\n`)
      .join('\n')

    // Return the files as a downloadable text file
    return new NextResponse(zipContent, {
      headers: {
        'Content-Type': 'text/plain',
        'Content-Disposition': `attachment; filename="${website.name}-files.txt"`,
      },
    })

  } catch (error) {
    console.error('Website download error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 