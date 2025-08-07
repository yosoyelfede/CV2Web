import { NextRequest, NextResponse } from 'next/server'
import { securityConfig } from './security-config'
import { csrfMiddleware, setCSRFToken } from './csrf-protection'
import { logUnauthorizedAccess, logCSRFViolation } from './security-monitoring-serverless'

// Comprehensive security middleware for API routes
export async function securityMiddleware(
  request: NextRequest,
  options: {
    requireAuth?: boolean
    requireCSRF?: boolean
    rateLimiter?: (req: NextRequest) => Promise<NextResponse | null>
    allowedMethods?: string[]
  } = {}
) {
  const {
    requireAuth = true,
    requireCSRF = true,
    rateLimiter,
    allowedMethods = ['GET', 'POST', 'PUT', 'DELETE']
  } = options

  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
  const endpoint = request.nextUrl.pathname
  const method = request.method

  // Check allowed methods
  if (!allowedMethods.includes(method)) {
    return NextResponse.json(
      { error: 'Method not allowed' },
      { status: 405 }
    )
  }

  // Apply CSRF protection for state-changing methods
  if (requireCSRF && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    const csrfResult = csrfMiddleware(request)
    if (csrfResult) {
      logCSRFViolation(ip, endpoint, method)
      return csrfResult
    }
  }

  // Apply rate limiting if provided
  if (rateLimiter) {
    const rateLimitResult = await rateLimiter(request)
    if (rateLimitResult) {
      return rateLimitResult
    }
  }

  // Add security headers to response
  const response = NextResponse.next()
  
  // Add security headers
  Object.entries(securityConfig.headers).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  // Add CORS headers if needed
  if (securityConfig.api.cors) {
    const origin = request.headers.get('origin')
    if (origin && securityConfig.api.cors.origin.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin)
      response.headers.set('Access-Control-Allow-Credentials', 'true')
    }
  }

  return response
}

// Helper function to wrap API handlers with security middleware
export function withSecurity<T extends any[]>(
  handler: (request: NextRequest, ...args: T) => Promise<NextResponse>,
  options: {
    requireAuth?: boolean
    requireCSRF?: boolean
    rateLimiter?: (req: NextRequest) => Promise<NextResponse | null>
    allowedMethods?: string[]
  } = {}
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    // Apply security middleware
    const securityResult = await securityMiddleware(request, options)
    if (securityResult instanceof NextResponse && securityResult.status !== 200) {
      return securityResult
    }

    // Call the original handler
    const response = await handler(request, ...args)

    // Add CSRF token if needed
    if (options.requireCSRF && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
      return setCSRFToken(response)
    }

    return response
  }
}

// Pre-configured security wrappers for common use cases
export const withAuth = (handler: any) => withSecurity(handler, { requireAuth: true })
export const withCSRF = (handler: any) => withSecurity(handler, { requireCSRF: true })
export const withRateLimit = (rateLimiter: any) => (handler: any) => 
  withSecurity(handler, { rateLimiter })

// Combined security wrapper
export const withFullSecurity = (rateLimiter: any) => (handler: any) =>
  withSecurity(handler, { 
    requireAuth: true, 
    requireCSRF: true, 
    rateLimiter 
  }) 