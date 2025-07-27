import { NextRequest, NextResponse } from 'next/server'
import { processCVWithClaude } from '@/lib/cv-processor'

export async function POST(request: NextRequest) {
  try {
    const { cvContent } = await request.json()
    
    if (!cvContent) {
      return NextResponse.json(
        { error: 'CV content is required' },
        { status: 400 }
      )
    }

    console.log('Testing CV processing with sample content...')
    console.log('Content length:', cvContent.length)
    
    // Process the CV content
    const cvData = await processCVWithClaude(cvContent)
    
    return NextResponse.json({
      success: true,
      message: 'CV processing test successful',
      data: cvData
    })

  } catch (error) {
    console.error('CV processing test error:', error)
    return NextResponse.json(
      { 
        error: 'CV processing test failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
} 