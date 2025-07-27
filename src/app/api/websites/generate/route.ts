import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { generateWebsiteWithClaude, createCompleteHTMLFile } from '@/lib/website-generator'

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

    const { cvDataId, config } = await request.json()
    
    if (!cvDataId) {
      return NextResponse.json(
        { error: 'CV Data ID is required' },
        { status: 400 }
      )
    }

    // Get the CV data
    const { data: cvData, error: cvError } = await supabase
      .from('cv_data')
      .select('*')
      .eq('id', cvDataId)
      .single()

    if (cvError || !cvData) {
      return NextResponse.json(
        { error: 'CV data not found' },
        { status: 404 }
      )
    }

    // Verify the CV document belongs to the user
    const { data: cvDocument, error: docError } = await supabase
      .from('cv_documents')
      .select('user_id')
      .eq('id', cvData.cv_document_id)
      .single()

    if (docError || !cvDocument || cvDocument.user_id !== user.id) {
      return NextResponse.json(
        { error: 'CV data not found or access denied' },
        { status: 404 }
      )
    }

    // Website generation logic using Claude
    const websiteConfig = config || {
      template: 'modern',
      color_scheme: 'blue',
      font_family: 'inter',
      layout: 'single_page',
      features: {
        contact_form: true,
        social_links: true,
        analytics: false,
        blog: false
      }
    }

    // Generate website using Claude
    console.log('Generating website with Claude...')
    const generatedWebsite = await generateWebsiteWithClaude(cvData, websiteConfig)
    console.log('Website generated successfully')

    // Create complete HTML file
    const completeHTML = createCompleteHTMLFile(generatedWebsite)

    // Create website record
    const { data: website, error: websiteError } = await supabase
      .from('websites')
      .insert({
        user_id: user.id,
        cv_data_id: cvData.id,
        name: `${cvData.personal_info.name}'s Portfolio`,
        description: `Professional portfolio website for ${cvData.personal_info.name}`,
        deployment_status: 'completed',
        website_config: websiteConfig,
        generated_code: {
          html: generatedWebsite.html,
          css: generatedWebsite.css,
          javascript: generatedWebsite.javascript,
          complete_html: completeHTML,
          metadata: generatedWebsite.metadata
        }
      })
      .select()
      .single()

    if (websiteError) {
      console.error('Website creation error:', websiteError)
      return NextResponse.json(
        { error: 'Website creation failed', details: websiteError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      websiteId: website.id,
      message: 'Website generation initiated'
    })

  } catch (error) {
    console.error('Website generation error:', error)
    return NextResponse.json(
      { error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
} 