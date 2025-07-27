import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { generateWebsiteWithClaude, createCompleteHTMLFile } from '@/lib/website-generator'
import { websiteGenerationSchema, validateRequest } from '@/lib/validation'
import { sanitizeWebsiteContent } from '@/lib/content-sanitizer'

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

    // Validate request data
    const validation = await validateRequest(request, websiteGenerationSchema)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }
    
    const { cvDataId, config } = validation.data

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
    const websiteConfig = {
      template: config?.template || 'modern',
      color_scheme: config?.color_scheme || 'blue',
      font_family: config?.font_family || 'inter',
      layout: config?.layout || 'single_page',
      features: {
        contact_form: config?.features?.contact_form ?? true,
        social_links: config?.features?.social_links ?? true,
        analytics: config?.features?.analytics ?? false,
        blog: config?.features?.blog ?? false
      }
    }

    // Generate website using Claude
    console.log('Generating website with Claude...')
    const generatedWebsite = await generateWebsiteWithClaude(cvData, websiteConfig)
    console.log('Website generated successfully')

    // Sanitize generated content
    const sanitizedContent = sanitizeWebsiteContent({
      html: generatedWebsite.html,
      css: generatedWebsite.css,
      javascript: generatedWebsite.javascript
    })

    // Create complete HTML file with sanitized content
    const completeHTML = createCompleteHTMLFile({
      ...generatedWebsite,
      html: sanitizedContent.html,
      css: sanitizedContent.css,
      javascript: sanitizedContent.javascript
    })

    // Create website record
    const { data: website, error: websiteError } = await supabase
      .from('websites')
      .insert({
        user_id: user.id,
        cv_data_id: cvData.id,
        name: `${cvData.personal_info.name}'s Portfolio`,
        description: `Professional portfolio website for ${cvData.personal_info.name}`,
        deployment_status: 'live',
        website_config: websiteConfig,
        generated_code: {
          html: sanitizedContent.html,
          css: sanitizedContent.css,
          javascript: sanitizedContent.javascript,
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
      { error: 'An error occurred while generating the website' },
      { status: 500 }
    )
  }
} 