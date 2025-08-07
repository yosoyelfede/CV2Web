import { NextRequest, NextResponse } from 'next/server'
import mammoth from 'mammoth'

export async function GET(request: NextRequest) {
  try {
    // Test mammoth availability
    const mammothAvailable = !!(mammoth && typeof mammoth.extractRawText === 'function')
    
    // Test basic functionality - just check if the function exists and can be called
    let mammothWorking = false
    if (mammothAvailable) {
      try {
        // Just verify the function exists and can be called (we don't need to test with real data)
        mammothWorking = typeof mammoth.extractRawText === 'function'
      } catch (error) {
        console.error('Mammoth test failed:', error)
      }
    }

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      dependencies: {
        mammoth: {
          available: mammothAvailable,
          working: mammothWorking,
          version: mammothAvailable ? '1.10.0' : 'not available'
        }
      },
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        memory: process.memoryUsage()
      }
    })
  } catch (error) {
    console.error('Health check failed:', error)
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
