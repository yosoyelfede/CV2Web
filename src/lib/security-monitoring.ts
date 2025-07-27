import winston from 'winston'

// Security event types
export enum SecurityEventType {
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  AUTHENTICATION_FAILED = 'AUTHENTICATION_FAILED',
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',
  FILE_UPLOAD_VIOLATION = 'FILE_UPLOAD_VIOLATION',
  CSRF_VIOLATION = 'CSRF_VIOLATION',
  SUSPICIOUS_CONTENT = 'SUSPICIOUS_CONTENT',
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  API_ABUSE = 'API_ABUSE'
}

// Security event interface
export interface SecurityEvent {
  type: SecurityEventType
  timestamp: Date
  ip: string
  userAgent?: string
  userId?: string
  endpoint: string
  method: string
  details: Record<string, any>
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
}

// Configure Winston logger for security events
const securityLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'cv2w-security' },
  transports: [
    // Log to console in development
    ...(process.env.NODE_ENV !== 'production' ? [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        )
      })
    ] : []),
    // Log to file in production
    new winston.transports.File({ 
      filename: 'logs/security-error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: 'logs/security.log' 
    })
  ]
})

// Security monitoring class
export class SecurityMonitor {
  private static instance: SecurityMonitor
  private suspiciousIPs: Map<string, { count: number; firstSeen: Date }> = new Map()
  private readonly SUSPICIOUS_THRESHOLD = 10
  private readonly SUSPICIOUS_WINDOW = 5 * 60 * 1000 // 5 minutes

  static getInstance(): SecurityMonitor {
    if (!SecurityMonitor.instance) {
      SecurityMonitor.instance = new SecurityMonitor()
    }
    return SecurityMonitor.instance
  }

  // Log a security event
  logEvent(event: Omit<SecurityEvent, 'timestamp'>): void {
    const fullEvent: SecurityEvent = {
      ...event,
      timestamp: new Date()
    }

    // Log the event
    securityLogger.log({
      level: this.getLogLevel(event.severity),
      message: `Security Event: ${event.type}`,
      event: fullEvent
    })

    // Track suspicious IPs
    this.trackSuspiciousIP(event.ip, event.type)

    // Alert on critical events
    if (event.severity === 'CRITICAL') {
      this.alertCriticalEvent(fullEvent)
    }
  }

  // Track suspicious IP addresses
  private trackSuspiciousIP(ip: string, eventType: SecurityEventType): void {
    const now = new Date()
    const existing = this.suspiciousIPs.get(ip)

    if (existing) {
      // Check if within time window
      if (now.getTime() - existing.firstSeen.getTime() < this.SUSPICIOUS_WINDOW) {
        existing.count++
        
        // Alert if threshold exceeded
        if (existing.count >= this.SUSPICIOUS_THRESHOLD) {
          this.logEvent({
            type: SecurityEventType.API_ABUSE,
            ip,
            endpoint: 'multiple',
            method: 'multiple',
            details: { 
              eventCount: existing.count,
              timeWindow: this.SUSPICIOUS_WINDOW,
              events: [eventType]
            },
            severity: 'HIGH'
          })
        }
      } else {
        // Reset if outside time window
        this.suspiciousIPs.set(ip, { count: 1, firstSeen: now })
      }
    } else {
      this.suspiciousIPs.set(ip, { count: 1, firstSeen: now })
    }
  }

  // Get log level based on severity
  private getLogLevel(severity: SecurityEvent['severity']): string {
    switch (severity) {
      case 'CRITICAL':
        return 'error'
      case 'HIGH':
        return 'warn'
      case 'MEDIUM':
        return 'info'
      case 'LOW':
        return 'debug'
      default:
        return 'info'
    }
  }

  // Alert on critical events (placeholder for production)
  private alertCriticalEvent(event: SecurityEvent): void {
    // In production, this could send emails, Slack notifications, etc.
    console.error('🚨 CRITICAL SECURITY EVENT:', {
      type: event.type,
      ip: event.ip,
      endpoint: event.endpoint,
      details: event.details
    })
  }

  // Get security statistics
  getStats(): {
    totalEvents: number
    suspiciousIPs: number
    criticalEvents: number
  } {
    return {
      totalEvents: 0, // Would be calculated from logs
      suspiciousIPs: this.suspiciousIPs.size,
      criticalEvents: 0 // Would be calculated from logs
    }
  }
}

// Convenience functions for common security events
export const securityMonitor = SecurityMonitor.getInstance()

export function logRateLimitExceeded(ip: string, endpoint: string, method: string): void {
  securityMonitor.logEvent({
    type: SecurityEventType.RATE_LIMIT_EXCEEDED,
    ip,
    endpoint,
    method,
    details: { endpoint, method },
    severity: 'MEDIUM'
  })
}

export function logAuthenticationFailed(ip: string, endpoint: string, method: string, details?: any): void {
  securityMonitor.logEvent({
    type: SecurityEventType.AUTHENTICATION_FAILED,
    ip,
    endpoint,
    method,
    details: { ...details, endpoint, method },
    severity: 'HIGH'
  })
}

export function logUnauthorizedAccess(ip: string, endpoint: string, method: string, userId?: string): void {
  securityMonitor.logEvent({
    type: SecurityEventType.UNAUTHORIZED_ACCESS,
    ip,
    endpoint,
    method,
    userId,
    details: { endpoint, method, userId },
    severity: 'HIGH'
  })
}

export function logFileUploadViolation(ip: string, endpoint: string, method: string, details: any): void {
  securityMonitor.logEvent({
    type: SecurityEventType.FILE_UPLOAD_VIOLATION,
    ip,
    endpoint,
    method,
    details,
    severity: 'HIGH'
  })
}

export function logCSRFViolation(ip: string, endpoint: string, method: string): void {
  securityMonitor.logEvent({
    type: SecurityEventType.CSRF_VIOLATION,
    ip,
    endpoint,
    method,
    details: { endpoint, method },
    severity: 'CRITICAL'
  })
}

export function logSuspiciousContent(ip: string, endpoint: string, method: string, content: string): void {
  securityMonitor.logEvent({
    type: SecurityEventType.SUSPICIOUS_CONTENT,
    ip,
    endpoint,
    method,
    details: { content: content.substring(0, 100) }, // Only log first 100 chars
    severity: 'HIGH'
  })
} 