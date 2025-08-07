import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ success: false, error: 'Method not allowed' }, { status: 405 })
}

export async function POST(request: NextRequest) {
  try {
    console.log('=== SIMPLE UPLOAD ROUTE CALLED ===')
    
    const contentType = request.headers.get('content-type') || ''
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid content type. Expected multipart/form-data' 
      }, { status: 400 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ 
        success: false, 
        error: 'No file provided' 
      }, { status: 400 })
    }

    // Just return file info without doing anything else
    return NextResponse.json({
      success: true,
      message: 'File received successfully',
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type
    })

  } catch (error) {
    console.error('Simple upload error:', error)
    return NextResponse.json({
      success: false,
      error: 'Upload failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
