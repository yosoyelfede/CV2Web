import { NextRequest, NextResponse } from 'next/server'
import mammoth from 'mammoth'

export async function POST(request: NextRequest) {
  try {
    console.log('Debug upload endpoint called')
    
    // Test mammoth availability
    const mammothAvailable = !!(mammoth && typeof mammoth.extractRawText === 'function')
    console.log('Mammoth available:', mammothAvailable)
    
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    console.log('File received:', { 
      name: file?.name, 
      size: file?.size, 
      type: file?.type,
      exists: !!file 
    })
    
    if (!file) {
      return NextResponse.json({
        success: false,
        error: 'No file provided',
        debug: { mammothAvailable }
      }, { status: 400 })
    }

    // Test file processing
    try {
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      
      console.log('Processing file with mammoth...')
      const result = await mammoth.extractRawText({ buffer })
      
      console.log('Mammoth result:', { 
        hasValue: !!result.value,
        valueLength: result.value?.length,
        messages: result.messages
      })
      
      return NextResponse.json({
        success: true,
        message: 'File processed successfully',
        debug: {
          mammothAvailable,
          fileInfo: {
            name: file.name,
            size: file.size,
            type: file.type
          },
          processing: {
            hasValue: !!result.value,
            valueLength: result.value?.length,
            valuePreview: result.value?.substring(0, 200) + '...',
            messages: result.messages
          }
        }
      })
      
    } catch (processingError) {
      console.error('File processing error:', processingError)
      return NextResponse.json({
        success: false,
        error: 'File processing failed',
        debug: {
          mammothAvailable,
          processingError: processingError instanceof Error ? processingError.message : 'Unknown error',
          fileInfo: {
            name: file.name,
            size: file.size,
            type: file.type
          }
        }
      }, { status: 500 })
    }
    
  } catch (error) {
    console.error('Debug upload error:', error)
    return NextResponse.json({
      success: false,
      error: 'Debug upload failed',
      debug: {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      }
    }, { status: 500 })
  }
}
