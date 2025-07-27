import { NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { securityConfig } from './security-config'

// Generate a CSRF token
export function generateCSRFToken(): string {
  return randomBytes(securityConfig.csrf.tokenLength).toString('hex')
}

// Validate CSRF token
export function validateCSRFToken(request: NextRequest): boolean {
  if (!securityConfig.csrf.enabled) {
    return true
  }

  const method = request.method.toUpperCase()
  if (securityConfig.csrf.ignoreMethods.includes(method)) {
    return true
  }

  const tokenFromHeader = request.headers.get(securityConfig.csrf.headerName)
  const tokenFromCookie = request.cookies.get(securityConfig.csrf.cookieName)?.value

  if (!tokenFromHeader || !tokenFromCookie) {
    return false
  }

  return tokenFromHeader === tokenFromCookie
}

// CSRF middleware
export function csrfMiddleware(request: NextRequest): NextResponse | null {
  if (!securityConfig.csrf.enabled) {
    return null
  }

  const method = request.method.toUpperCase()
  if (securityConfig.csrf.ignoreMethods.includes(method)) {
    return null
  }

  if (!validateCSRFToken(request)) {
    return NextResponse.json(
      { error: 'CSRF token validation failed' },
      { status: 403 }
    )
  }

  return null
}

// Set CSRF token in response
export function setCSRFToken(response: NextResponse): NextResponse {
  if (!securityConfig.csrf.enabled) {
    return response
  }

  const token = generateCSRFToken()
  response.cookies.set(securityConfig.csrf.cookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 // 24 hours
  })

  return response
} 