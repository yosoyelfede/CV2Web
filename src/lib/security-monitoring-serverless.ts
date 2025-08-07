// Serverless-compatible security monitoring for Vercel deployment
// Replaces Winston file transports with console logging and external service integration

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

// Serverless-compatible logger
class ServerlessLogger {
  private isProduction = process.env.NODE_ENV === 'production'
  private serviceName = 'cv2w-security'

  // Log with structured format for external log aggregators
  log(level: string, message: string, event: SecurityEvent): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level: level.toUpperCase(),
      service: this.serviceName,
      message,
      event,
      // Add metadata for log aggregation services
      tags: {
        environment: this.isProduction ? 'production' : 'development',
        severity: event.severity,
        eventType: event.type,
        ip: event.ip
      }
    }

    // In production, use structured JSON logging for Vercel logs
    if (this.isProduction) {
      const logMethod = this.getConsoleMethod(level)
      logMethod(JSON.stringify(logEntry))
    } else {
      // In development, use readable console output
      console.group(`🔒 ${event.severity} Security Event: ${event.type}`)
      console.log(`🕐 ${event.timestamp.toISOString()}`)
      console.log(`🌐 IP: ${event.ip}`)
      console.log(`📍 ${event.method} ${event.endpoint}`)
      console.log(`📋 Details:`, event.details)
      if (event.userAgent) console.log(`🖥️  User Agent: ${event.userAgent}`)
      if (event.userId) console.log(`👤 User: ${event.userId}`)
      console.groupEnd()
    }

    // Future: Integrate with external logging services
    this.sendToExternalService(logEntry)
  }

  private getConsoleMethod(level: string): typeof console.log {
    switch (level.toLowerCase()) {
      case 'error':
        return console.error
      case 'warn':
        return console.warn
      case 'debug':
        return console.debug
      default:
        return console.log
    }
  }

  // Placeholder for external logging service integration
  private sendToExternalService(logEntry: any): void {
    // Future integration options:
    // - Vercel Log Drains: https://vercel.com/docs/observability/log-drains
    // - DataDog: https://docs.datadoghq.com/
    // - New Relic: https://newrelic.com/
    // - Sentry: https://sentry.io/
    // - LogRocket: https://logrocket.com/
    
    // Example implementation (commented out):
    // if (process.env.DATADOG_API_KEY) {
    //   fetch('https://http-intake.logs.datadoghq.com/v1/input/' + process.env.DATADOG_API_KEY, {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(logEntry)
    //   }).catch(console.error)
    // }
  }
}

// Security monitoring class
export class SecurityMonitor {
  private static instance: SecurityMonitor
  private logger = new ServerlessLogger()
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

    // Log the event using serverless-compatible logger
    this.logger.log(
      this.getLogLevel(event.severity),
      `Security Event: ${event.type}`,
      fullEvent
    )

    // Track suspicious IPs
    this.trackSuspiciousIP(event.ip, event.type)

    // Alert on critical events
    if (event.severity === 'CRITICAL') {
      this.alertCriticalEvent(fullEvent)
    }
  }

  // Track suspicious IP addresses (in-memory for serverless)
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
              triggeringEvent: eventType
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

    // Clean up old entries to prevent memory leaks in long-running functions
    this.cleanupOldEntries()
  }

  // Clean up old suspicious IP entries
  private cleanupOldEntries(): void {
    const now = new Date()
    const cutoff = now.getTime() - this.SUSPICIOUS_WINDOW

    for (const [ip, data] of this.suspiciousIPs.entries()) {
      if (data.firstSeen.getTime() < cutoff) {
        this.suspiciousIPs.delete(ip)
      }
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

  // Alert on critical events with enhanced serverless-friendly notifications
  private alertCriticalEvent(event: SecurityEvent): void {
    // Enhanced critical event logging
    console.error('🚨 CRITICAL SECURITY EVENT DETECTED 🚨')
    console.error('=' * 50)
    console.error(`Event Type: ${event.type}`)
    console.error(`IP Address: ${event.ip}`)
    console.error(`Endpoint: ${event.endpoint}`)
    console.error(`Method: ${event.method}`)
    console.error(`Timestamp: ${event.timestamp.toISOString()}`)
    console.error(`Details:`, JSON.stringify(event.details, null, 2))
    console.error('=' * 50)

    // Future: Integrate with alerting services
    // - Vercel incident notifications
    // - Slack/Discord webhooks
    // - Email alerts via SendGrid/Mailgun
    // - PagerDuty integration
    
    // Example webhook implementation (commented out):
    // if (process.env.SLACK_WEBHOOK_URL) {
    //   fetch(process.env.SLACK_WEBHOOK_URL, {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({
    //       text: `🚨 Critical Security Event: ${event.type}`,
    //       blocks: [
    //         {
    //           type: 'section',
    //           text: { type: 'mrkdwn', text: `*IP:* ${event.ip}\n*Endpoint:* ${event.endpoint}` }
    //         }
    //       ]
    //     })
    //   }).catch(console.error)
    // }
  }

  // Get security statistics
  getStats(): {
    totalEvents: number
    suspiciousIPs: number
    criticalEvents: number
  } {
    return {
      totalEvents: 0, // In serverless, this would need external storage for persistence
      suspiciousIPs: this.suspiciousIPs.size,
      criticalEvents: 0 // Would need external storage for accurate tracking
    }
  }
}

// Singleton instance for serverless environment
export const securityMonitor = SecurityMonitor.getInstance()

// Convenience functions for common security events
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

export function logFileUploadViolation(ip: string, endpoint: string, details: any): void {
  securityMonitor.logEvent({
    type: SecurityEventType.FILE_UPLOAD_VIOLATION,
    ip,
    endpoint,
    method: 'POST', // File uploads are typically POST
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
