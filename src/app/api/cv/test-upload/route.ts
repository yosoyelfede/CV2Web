import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ message: 'Test upload route GET works' })
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || ''
    
    // Simple test: just return info about the request
    return NextResponse.json({
      success: true,
      method: request.method,
      contentType,
      hasFormData: contentType.includes('multipart/form-data'),
      message: 'Test upload route POST works'
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
