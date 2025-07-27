import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { generateWebsiteWithClaude, createCompleteHTMLFile } from '@/lib/website-generator'
import { WebsiteConfig } from '@/types'

export async function POST(request: NextRequest) {
  try {
    console.log('Website generation route called')
    
    const supabase = createServerSupabaseClient()
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse the request body
    const body = await request.json()
    const { cvDataId, config }: { cvDataId: string; config: WebsiteConfig } = body

    if (!cvDataId) {
      return NextResponse.json(
        { error: 'CV data ID is required' },
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

    // Create initial website record
    const { data: website, error: websiteError } = await supabase
      .from('websites')
      .insert({
        user_id: user.id,
        cv_data_id: cvData.id,
        name: `${cvData.personal_info?.name || 'User'}'s Portfolio`,
        description: `Professional portfolio website for ${cvData.personal_info?.name || 'User'}`,
        deployment_status: 'generating',
        website_config: config || {}
      })
      .select()
      .single()

    if (websiteError) {
      console.error('Website creation error:', websiteError)
      return NextResponse.json(
        { error: 'Website creation failed' },
        { status: 500 }
      )
    }

    try {
      // Generate the website using Claude AI
      console.log('Generating website with Claude AI...')
      const generatedWebsite = await generateWebsiteWithClaude(cvData, config)
      
      // Create complete HTML file
      const completeHTML = createCompleteHTMLFile(generatedWebsite)
      
      // Update the website with generated content
      const { error: updateError } = await supabase
        .from('websites')
        .update({
          deployment_status: 'live',
          generated_code: {
            html: generatedWebsite.html,
            css: generatedWebsite.css,
            javascript: generatedWebsite.javascript,
            complete_html: completeHTML,
            metadata: generatedWebsite.metadata
          }
        })
        .eq('id', website.id)

      if (updateError) {
        console.error('Website update error:', updateError)
        // Update status to failed
        await supabase
          .from('websites')
          .update({ deployment_status: 'failed' })
          .eq('id', website.id)
        
        return NextResponse.json(
          { error: 'Failed to save generated website' },
          { status: 500 }
        )
      }

      console.log('Website generated successfully')
      return NextResponse.json({
        success: true,
        websiteId: website.id,
        message: 'Website generated successfully'
      })

    } catch (generationError) {
      console.error('Website generation error:', generationError)
      
      // Update status to failed
      await supabase
        .from('websites')
        .update({ 
          deployment_status: 'failed',
          deployment_errors: [generationError instanceof Error ? generationError.message : 'Unknown error']
        })
        .eq('id', website.id)
      
      return NextResponse.json(
        { error: 'Website generation failed' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Website generation error:', error)
    return NextResponse.json(
      { error: 'An error occurred while generating the website' },
      { status: 500 }
    )
  }
} 