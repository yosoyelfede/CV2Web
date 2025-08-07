import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { uploadRateLimiter } from '@/lib/rate-limiter'

export async function GET() {
  return NextResponse.json({ success: false, error: 'Method not allowed' }, { status: 405 })
}

export async function POST(request: NextRequest) {
  try {
    console.log('=== UPLOAD TEST 2: Supabase + Rate Limiter ===')
    
    const contentType = request.headers.get('content-type') || ''
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid content type. Expected multipart/form-data' 
      }, { status: 400 })
    }

    // Test if Supabase client can be created
    const supabase = createServerSupabaseClient()
    
    // Test if rate limiter can be created
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
    const rateLimitResult = uploadRateLimiter(request)
    
    if (rateLimitResult) {
      return rateLimitResult // This is already a NextResponse with 429
    }
    
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ 
        success: false, 
        error: 'No file provided' 
      }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: 'Upload test 2: Supabase + Rate limiter works',
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      supabaseConnected: !!supabase,
      rateLimitSuccess: true
    })

  } catch (error) {
    console.error('Upload test 2 error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      test: 'supabase-rate-limiter'
    }, { status: 500 })
  }
}
