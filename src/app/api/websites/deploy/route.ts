import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { vercelDeployer } from '@/lib/vercel-deployer'
import { websiteDeploymentSchema, validateRequest } from '@/lib/validation'

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
    const validation = await validateRequest(request, websiteDeploymentSchema)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }
    
    const { websiteId } = validation.data

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

    if (!website.generated_code?.complete_html) {
      return NextResponse.json(
        { error: 'Website not generated yet' },
        { status: 400 }
      )
    }

    // Prepare files for deployment
    const files = [
      {
        file: 'index.html',
        data: website.generated_code.complete_html
      }
    ]

    // Deploy to Vercel
    const deploymentResult = await vercelDeployer.deployWebsite({
      name: website.name,
      files,
      target: 'preview'
    })

    if (!deploymentResult.success) {
      return NextResponse.json(
        { error: deploymentResult.error || 'Deployment failed' },
        { status: 500 }
      )
    }

    // Update website with deployment info
    const { error: updateError } = await supabase
      .from('websites')
      .update({
        deployment_url: deploymentResult.url,
        deployment_status: 'deployed',
        deployment_id: deploymentResult.deploymentId,
        deployed_at: new Date().toISOString()
      })
      .eq('id', websiteId)

    if (updateError) {
      console.error('Error updating website deployment info:', updateError)
    }

    return NextResponse.json({
      success: true,
      deploymentId: deploymentResult.deploymentId,
      url: deploymentResult.url,
      message: 'Website deployed successfully'
    })

  } catch (error) {
    console.error('Website deployment error:', error)
    return NextResponse.json(
      { error: 'An error occurred while deploying the website' },
      { status: 500 }
    )
  }
}

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
    const deploymentId = searchParams.get('deploymentId')
    
    if (!deploymentId) {
      return NextResponse.json(
        { error: 'Deployment ID is required' },
        { status: 400 }
      )
    }

    // Get deployment status from Vercel
    const status = await vercelDeployer.getDeploymentStatus(deploymentId)

    return NextResponse.json({
      success: true,
      status: status.status,
      url: status.url,
      error: status.error
    })

  } catch (error) {
    console.error('Deployment status error:', error)
    return NextResponse.json(
      { error: 'An error occurred while checking deployment status' },
      { status: 500 }
    )
  }
} 