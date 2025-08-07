import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ 
    message: 'GET works!',
    env: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  })
}

export async function POST(request: NextRequest) {
  try {
    console.log('=== MINIMAL TEST ROUTE CALLED ===')
    console.log('Environment:', process.env.NODE_ENV)
    console.log('Request method:', request.method)
    console.log('Request URL:', request.url)
    
    return NextResponse.json({ 
      message: 'POST works!',
      env: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Minimal test error:', error)
    return NextResponse.json({
      error: 'Minimal test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
