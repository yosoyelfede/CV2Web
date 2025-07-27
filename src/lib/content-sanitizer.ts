// Basic HTML content sanitization to prevent XSS attacks
export function sanitizeHTML(html: string): string {
  // Remove potentially dangerous tags and attributes
  let sanitized = html
  
  // Remove script tags and their content
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
  
  // Remove event handlers
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '')
  
  // Remove javascript: URLs
  sanitized = sanitized.replace(/javascript:/gi, '')
  
  // Remove data: URLs (except for images)
  sanitized = sanitized.replace(/data:(?!image\/)/gi, '')
  
  // Remove iframe tags
  sanitized = sanitized.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
  
  // Remove object and embed tags
  sanitized = sanitized.replace(/<(object|embed)\b[^<]*(?:(?!<\/(object|embed)>)<[^<]*)*<\/(object|embed)>/gi, '')
  
  // Remove form tags to prevent CSRF
  sanitized = sanitized.replace(/<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi, '')
  
  // Remove input tags
  sanitized = sanitized.replace(/<input\b[^>]*>/gi, '')
  
  // Remove textarea tags
  sanitized = sanitized.replace(/<textarea\b[^<]*(?:(?!<\/textarea>)<[^<]*)*<\/textarea>/gi, '')
  
  // Remove select tags
  sanitized = sanitized.replace(/<select\b[^<]*(?:(?!<\/select>)<[^<]*)*<\/select>/gi, '')
  
  // Remove button tags
  sanitized = sanitized.replace(/<button\b[^<]*(?:(?!<\/button>)<[^<]*)*<\/button>/gi, '')
  
  // Remove dangerous attributes from remaining tags
  const dangerousAttrs = [
    'onload', 'onerror', 'onclick', 'onmouseover', 'onfocus', 'onblur',
    'onchange', 'onsubmit', 'onreset', 'onselect', 'onunload', 'onresize',
    'onabort', 'onbeforeunload', 'onerror', 'onhashchange', 'onmessage',
    'onoffline', 'ononline', 'onpagehide', 'onpageshow', 'onpopstate',
    'onstorage', 'oncontextmenu', 'oninput', 'oninvalid', 'onsearch'
  ]
  
  dangerousAttrs.forEach(attr => {
    const regex = new RegExp(`\\s*${attr}\\s*=\\s*["'][^"']*["']`, 'gi')
    sanitized = sanitized.replace(regex, '')
  })
  
  return sanitized
}

// Sanitize CSS to prevent CSS injection attacks
export function sanitizeCSS(css: string): string {
  let sanitized = css
  
  // Remove potentially dangerous CSS properties
  const dangerousProps = [
    'expression', 'javascript:', 'vbscript:', 'behavior', 'binding',
    'filter', 'progid', 'zoom', 'background-image', 'background'
  ]
  
  dangerousProps.forEach(prop => {
    const regex = new RegExp(`${prop}\\s*:\\s*[^;]+;?`, 'gi')
    sanitized = sanitized.replace(regex, '')
  })
  
  // Remove @import rules that could load external resources
  sanitized = sanitized.replace(/@import\s+[^;]+;?/gi, '')
  
  // Remove @charset rules
  sanitized = sanitized.replace(/@charset\s+[^;]+;?/gi, '')
  
  return sanitized
}

// Sanitize JavaScript to prevent code injection
export function sanitizeJavaScript(js: string): string {
  let sanitized = js
  
  // Remove eval() calls
  sanitized = sanitized.replace(/eval\s*\(/gi, '/* eval() removed for security */(')
  
  // Remove Function constructor calls
  sanitized = sanitized.replace(/new\s+Function\s*\(/gi, '/* Function() removed for security */(')
  
  // Remove setTimeout/setInterval with string arguments
  sanitized = sanitized.replace(/(setTimeout|setInterval)\s*\(\s*["'][^"']*["']/gi, '$1(/* string argument removed for security */')
  
  // Remove document.write calls
  sanitized = sanitized.replace(/document\.write\s*\(/gi, '/* document.write() removed for security */(')
  
  // Remove innerHTML assignments
  sanitized = sanitized.replace(/\.innerHTML\s*=\s*["']/gi, '.textContent = "/* innerHTML assignment removed for security */')
  
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