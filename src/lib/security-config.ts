// Security configuration for CV2W application
export const securityConfig = {
  // Rate limiting configuration
  rateLimiting: {
    api: {
      maxRequests: 100,
      windowMs: 15 * 60 * 1000 // 15 minutes
    },
    upload: {
      maxRequests: 10,
      windowMs: 60 * 60 * 1000 // 1 hour
    },
    auth: {
      maxRequests: 5,
      windowMs: 15 * 60 * 1000 // 15 minutes
    }
  },

  // File upload security
  fileUpload: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ],
    allowedExtensions: ['.doc', '.docx', '.txt']
  },

  // Content Security Policy
  csp: {
    'default-src': ["'self'"],
    'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://vercel.live"],
    'style-src': ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
    'font-src': ["'self'", "https://fonts.gstatic.com"],
    'img-src': ["'self'", "data:", "https:"],
    'connect-src': [
      "'self'",
      "https://*.supabase.co",
      "https://api.anthropic.com",
      "https://api.vercel.com"
    ],
    'frame-ancestors': ["'none'"]
  },

  // Session security
  session: {
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    secure: true,
    httpOnly: true,
    sameSite: 'strict'
  },

  // API security
  api: {
    maxRequestSize: '10mb',
    timeout: 30000, // 30 seconds
    cors: {
      origin: process.env.NODE_ENV === 'production' 
        ? ['https://cv2w.com', 'https://www.cv2w.com']
        : ['http://localhost:3000'],
      credentials: true
    }
  },

  // Environment variables validation
  requiredEnvVars: [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'ANTHROPIC_API_KEY',
    'VERCEL_TOKEN'
  ],

  // Security headers
  headers: {
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'origin-when-cross-origin',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    'X-XSS-Protection': '1; mode=block',
    'X-Permitted-Cross-Domain-Policies': 'none',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()'
  }
}

// Helper function to build CSP header
export function buildCSPHeader(): string {
  return Object.entries(securityConfig.csp)
    .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
    .join('; ')
}

// Helper function to validate file upload
export function validateFileUpload(file: File): { valid: boolean; error?: string } {
  // Check file size
  if (file.size > securityConfig.fileUpload.maxSize) {
    return {
      valid: false,
      error: `File size must be less than ${securityConfig.fileUpload.maxSize / (1024 * 1024)}MB`
    }
  }

  // Check file type
  if (!securityConfig.fileUpload.allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Only DOC, DOCX, and TXT files are allowed.'
    }
  }

  // Check file extension
  const extension = '.' + file.name.split('.').pop()?.toLowerCase()
  if (!securityConfig.fileUpload.allowedExtensions.includes(extension)) {
    return {
      valid: false,
      error: 'Invalid file extension.'
    }
  }

  return { valid: true }
} 