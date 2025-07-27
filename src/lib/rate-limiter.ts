import { NextRequest, NextResponse } from 'next/server'

// In-memory store for rate limiting (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

interface RateLimitConfig {
  maxRequests: number
  windowMs: number
}

export function createRateLimiter(config: RateLimitConfig) {
  return function rateLimit(request: NextRequest) {
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
    const now = Date.now()
    const key = `${ip}:${request.nextUrl.pathname}`
    
    const current = rateLimitStore.get(key)
    
    if (!current || now > current.resetTime) {
      // First request or window expired
      rateLimitStore.set(key, {
        count: 1,
        resetTime: now + config.windowMs
      })
      return null // No rate limit hit
    }
    
    if (current.count >= config.maxRequests) {
      // Rate limit exceeded
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': config.maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(current.resetTime).toISOString(),
            'Retry-After': Math.ceil(config.windowMs / 1000).toString()
          }
        }
      )
    }
    
    // Increment count
    current.count++
    rateLimitStore.set(key, current)
    
    return null // No rate limit hit
  }
}

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  rateLimitStore.forEach((value, key) => {
    if (now > value.resetTime) {
      rateLimitStore.delete(key)
    }
  })
}, 5 * 60 * 1000)

// Predefined rate limiters
export const apiRateLimiter = createRateLimiter({
  maxRequests: 100,
  windowMs: 15 * 60 * 1000 // 15 minutes
})

export const uploadRateLimiter = createRateLimiter({
  maxRequests: 10,
  windowMs: 60 * 60 * 1000 // 1 hour
})

export const authRateLimiter = createRateLimiter({
  maxRequests: 5,
  windowMs: 15 * 60 * 1000 // 15 minutes
}) 