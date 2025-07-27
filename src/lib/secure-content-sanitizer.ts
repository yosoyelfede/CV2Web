import DOMPurify from 'dompurify'
import { JSDOM } from 'jsdom'

// Create a JSDOM instance for DOMPurify
const window = new JSDOM('').window
const purify = DOMPurify(window as any)

// DOMPurify configuration for maximum security
const purifyConfig = {
  ALLOWED_TAGS: [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'p', 'br', 'hr',
    'strong', 'b', 'em', 'i', 'u', 's',
    'ul', 'ol', 'li',
    'table', 'thead', 'tbody', 'tr', 'td', 'th',
    'div', 'span',
    'a',
    'img'
  ],
  ALLOWED_ATTR: [
    'href', 'src', 'alt', 'title', 'class', 'id',
    'width', 'height', 'target'
  ],
  ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
  FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input', 'textarea', 'select', 'button'],
  FORBID_ATTR: [
    'onload', 'onerror', 'onclick', 'onmouseover', 'onfocus', 'onblur',
    'onchange', 'onsubmit', 'onreset', 'onselect', 'onunload', 'onresize',
    'onabort', 'onbeforeunload', 'onerror', 'onhashchange', 'onmessage',
    'onoffline', 'ononline', 'onpagehide', 'onpageshow', 'onpopstate',
    'onstorage', 'oncontextmenu', 'oninput', 'oninvalid', 'onsearch'
  ],
  KEEP_CONTENT: true,
  RETURN_DOM: false,
  RETURN_DOM_FRAGMENT: false,
  RETURN_DOM_IMPORT: false,
  RETURN_TRUSTED_TYPE: false
}

// Sanitize HTML content using DOMPurify
export function sanitizeHTML(html: string): string {
  if (!html) return ''
  
  try {
    return purify.sanitize(html, purifyConfig)
  } catch (error) {
    console.error('HTML sanitization error:', error)
    // Return empty string if sanitization fails
    return ''
  }
}

// Sanitize CSS to prevent CSS injection attacks
export function sanitizeCSS(css: string): string {
  if (!css) return ''
  
  let sanitized = css
  
  // Remove potentially dangerous CSS properties
  const dangerousProps = [
    'expression', 'javascript:', 'vbscript:', 'behavior', 'binding',
    'filter', 'progid', 'zoom'
  ]
  
  dangerousProps.forEach(prop => {
    const regex = new RegExp(`${prop}\\s*:\\s*[^;]+;?`, 'gi')
    sanitized = sanitized.replace(regex, '')
  })
  
  // Remove @import rules that could load external resources
  sanitized = sanitized.replace(/@import\s+[^;]+;?/gi, '')
  
  // Remove @charset rules
  sanitized = sanitized.replace(/@charset\s+[^;]+;?/gi, '')
  
  // Remove url() with javascript: or data: (except for images)
  sanitized = sanitized.replace(/url\s*\(\s*['"]?javascript:/gi, 'url(#blocked)')
  sanitized = sanitized.replace(/url\s*\(\s*['"]?data:(?!image\/)/gi, 'url(#blocked)')
  
  return sanitized
}

// Sanitize JavaScript to prevent code injection
export function sanitizeJavaScript(js: string): string {
  if (!js) return ''
  
  let sanitized = js
  
  // Remove dangerous JavaScript patterns
  const dangerousPatterns = [
    { pattern: /eval\s*\(/gi, replacement: '/* eval() removed for security */(' },
    { pattern: /new\s+Function\s*\(/gi, replacement: '/* Function() removed for security */(' },
    { pattern: /(setTimeout|setInterval)\s*\(\s*["'][^"']*["']/gi, replacement: '$1(/* string argument removed for security */' },
    { pattern: /document\.write\s*\(/gi, replacement: '/* document.write() removed for security */(' },
    { pattern: /\.innerHTML\s*=\s*["']/gi, replacement: '.textContent = "/* innerHTML assignment removed for security */' },
    { pattern: /\.outerHTML\s*=\s*["']/gi, replacement: '.textContent = "/* outerHTML assignment removed for security */' },
    { pattern: /new\s+ActiveXObject/gi, replacement: '/* ActiveXObject removed for security */' },
    { pattern: /\.execScript/gi, replacement: '/* execScript removed for security */' }
  ]
  
  dangerousPatterns.forEach(({ pattern, replacement }) => {
    sanitized = sanitized.replace(pattern, replacement)
  })
  
  return sanitized
}

// Comprehensive sanitization for generated website content
export function sanitizeWebsiteContent(content: {
  html?: string
  css?: string
  javascript?: string
}): {
  html: string
  css: string
  javascript: string
} {
  return {
    html: content.html ? sanitizeHTML(content.html) : '',
    css: content.css ? sanitizeCSS(content.css) : '',
    javascript: content.javascript ? sanitizeJavaScript(content.javascript) : ''
  }
}

// Validate and sanitize file content
export function validateFileContent(content: string, maxLength: number = 1000000): {
  valid: boolean
  sanitized?: string
  error?: string
} {
  if (!content) {
    return { valid: false, error: 'Empty content' }
  }
  
  if (content.length > maxLength) {
    return { valid: false, error: `Content too large (${content.length} > ${maxLength})` }
  }
  
  // Check for suspicious patterns
  const suspiciousPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /vbscript:/gi,
    /data:text\/html/gi,
    /on\w+\s*=/gi
  ]
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(content)) {
      return { valid: false, error: 'Suspicious content detected' }
    }
  }
  
  // Sanitize the content
  const sanitized = sanitizeHTML(content)
  
  return { valid: true, sanitized }
} 