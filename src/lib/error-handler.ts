import { NextResponse } from 'next/server'
import { securityConfig } from './security-config'

// Secure error handler
export function handleError(error: unknown, context: string = 'Unknown'): NextResponse {
  console.error(`Error in ${context}:`, error)

  // In production, don't expose internal errors
  if (!securityConfig.errorHandling.exposeErrors) {
    return NextResponse.json(
      { error: securityConfig.errorHandling.genericErrorMessage },
      { status: 500 }
    )
  }

  // In development, provide more details
  const errorMessage = error instanceof Error ? error.message : 'Unknown error'
  return NextResponse.json(
    { error: errorMessage },
    { status: 500 }
  )
}

// API error response helper
export function apiErrorResponse(message: string, status: number = 400): NextResponse {
  return NextResponse.json(
    { error: message },
    { status }
  )
}

// Validation error response
export function validationErrorResponse(details: string): NextResponse {
  return apiErrorResponse(`Validation failed: ${details}`, 400)
}

// Authentication error response
export function authErrorResponse(): NextResponse {
  return apiErrorResponse('Unauthorized', 401)
}

// Not found error response
export function notFoundErrorResponse(resource: string): NextResponse {
  return apiErrorResponse(`${resource} not found`, 404)
} 