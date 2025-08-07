import { NextRequest, NextResponse } from 'next/server'
import { createClient } from 'redis'

// Redis client singleton
let redisClient: ReturnType<typeof createClient> | null = null

async function getRedisClient() {
  if (!redisClient) {
    redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    })
    
    redisClient.on('error', (err) => {
      console.error('Redis Client Error:', err)
    })
    
    await redisClient.connect()
  }
  return redisClient
}

interface RateLimitConfig {
  maxRequests: number
  windowMs: number
}

export function createRedisRateLimiter(config: RateLimitConfig) {
  return async function rateLimit(request: NextRequest) {
    try {
      const redis = await getRedisClient()
      const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
      const now = Date.now()
      const key = `rate_limit:${ip}:${request.nextUrl.pathname}`
      
      // Get current count
      const currentCount = await redis.get(key)
      const count = currentCount ? parseInt(currentCount) : 0
      
      if (count >= config.maxRequests) {
        // Rate limit exceeded
        const ttl = await redis.ttl(key)
        return NextResponse.json(
          { error: 'Too many requests. Please try again later.' },
          { 
            status: 429,
            headers: {
              'X-RateLimit-Limit': config.maxRequests.toString(),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': new Date(now + (ttl * 1000)).toISOString(),
              'Retry-After': ttl.toString()
            }
          }
        )
      }
      
      // Increment count
      if (count === 0) {
        // First request in window
        await redis.setEx(key, Math.ceil(config.windowMs / 1000), '1')
      } else {
        await redis.incr(key)
      }
      
      // Set response headers
      const remaining = config.maxRequests - count - 1
      const response = NextResponse.next()
      response.headers.set('X-RateLimit-Limit', config.maxRequests.toString())
      response.headers.set('X-RateLimit-Remaining', Math.max(0, remaining).toString())
      
      return null // No rate limit hit
      
    } catch (error) {
      console.error('Redis rate limiting error:', error)
      // Fallback to allowing request if Redis is unavailable
      return null
    }
  }
}

// Predefined rate limiters
export const apiRateLimiter = createRedisRateLimiter({
  maxRequests: 100,
  windowMs: 15 * 60 * 1000 // 15 minutes
})

export const uploadRateLimiter = createRedisRateLimiter({
  maxRequests: 10,
  windowMs: 60 * 60 * 1000 // 1 hour
})

export const authRateLimiter = createRedisRateLimiter({
  maxRequests: 5,
  windowMs: 15 * 60 * 1000 // 15 minutes
})

// Cleanup function
export async function cleanupRedis() {
  if (redisClient) {
    await redisClient.quit()
    redisClient = null
  }
} 