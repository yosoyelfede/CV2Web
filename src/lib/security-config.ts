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

  // Redis configuration
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    retryDelayOnFailover: 100,
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    lazyConnect: true
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
    allowedExtensions: ['.doc', '.docx', '.txt'],
    // Add content validation
    validateContent: true,
    maxContentLength: 1000000, // 1MB content limit
    // File signature validation
    validateSignature: true,
    signatures: {
      'application/pdf': [0x25, 0x50, 0x44, 0x46], // %PDF
      'application/msword': [0xD0, 0xCF, 0x11, 0xE0], // DOC
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [0x50, 0x4B, 0x03, 0x04], // DOCX
      'text/plain': [] // No signature for text files
    }
  },

  // CSRF Protection
  csrf: {
    enabled: false, // Temporarily disabled for testing - will be re-enabled with proper frontend implementation
    tokenLength: 32,
    cookieName: 'csrf-token',
    headerName: 'X-CSRF-Token',
    ignoreMethods: ['GET', 'HEAD', 'OPTIONS']
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
    sameSite: 'strict',
    // Add additional security
    rolling: true,
    name: 'cv2w-session'
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
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
    // Add additional headers
    'X-DNS-Prefetch-Control': 'off',
    'X-Download-Options': 'noopen'
  },

  // Error handling
  errorHandling: {
    // Don't expose internal errors in production
    exposeErrors: process.env.NODE_ENV !== 'production',
    genericErrorMessage: 'An error occurred. Please try again later.'
  }
}

// Helper function to build CSP header
export function buildCSPHeader(): string {
  return Object.entries(securityConfig.csp)
    .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
    .join('; ')
}

// Enhanced file upload validation with signature checking
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

// Validate file signature (file magic numbers)
export async function validateFileSignature(file: File): Promise<{ valid: boolean; error?: string }> {
  if (!securityConfig.fileUpload.validateSignature) {
    return { valid: true }
  }

  const expectedSignature = securityConfig.fileUpload.signatures[file.type as keyof typeof securityConfig.fileUpload.signatures]
  if (!expectedSignature || expectedSignature.length === 0) {
    return { valid: true } // No signature to validate
  }

  try {
    const buffer = await file.arrayBuffer()
    const uint8Array = new Uint8Array(buffer)
    
    for (let i = 0; i < expectedSignature.length; i++) {
      if (uint8Array[i] !== expectedSignature[i]) {
        return {
          valid: false,
          error: 'File signature validation failed. File may be corrupted or of wrong type.'
        }
      }
    }
    
    return { valid: true }
  } catch (error) {
    return {
      valid: false,
      error: 'Unable to validate file signature.'
    }
  }
} 