import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function formatDate(date: string | Date): string {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatDateTime(date: string | Date): string {
  const d = new Date(date)
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'completed':
    case 'live':
      return 'text-success-600 bg-success-50 border-success-200'
    case 'processing':
    case 'generating':
    case 'deploying':
      return 'text-warning-600 bg-warning-50 border-warning-200'
    case 'failed':
      return 'text-error-600 bg-error-50 border-error-200'
    case 'pending':
    default:
      return 'text-secondary-600 bg-secondary-50 border-secondary-200'
  }
}

export function getStatusIcon(status: string): string {
  switch (status) {
    case 'completed':
    case 'live':
      return 'check-circle'
    case 'processing':
    case 'generating':
    case 'deploying':
      return 'loader-2'
    case 'failed':
      return 'x-circle'
    case 'pending':
    default:
      return 'clock'
  }
}

export function validateFileType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.indexOf(file.type) !== -1
}

export function validateFileSize(file: File, maxSize: number): boolean {
  return file.size <= maxSize
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

export function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-')
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
} 