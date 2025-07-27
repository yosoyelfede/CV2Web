import { claude, CLAUDE_MODEL } from './claude'
import { CVData } from '@/types'
import { WebsiteStyle } from '@/components/features/style-selector/style-selector'

export interface GeneratedWebsite {
  html: string
  css: string
  javascript: string
  metadata: {
    title: string
    description: string
    keywords: string[]
  }
}

export interface WebsiteConfig {
  template: string
  color_scheme: string
  font_family: string
  layout: string
  features: {
    contact_form: boolean
    social_links: boolean
    analytics: boolean
    blog: boolean
  }
  style_config?: any // Detailed style configuration from the UI
}

// Website generation with Claude
export async function generateWebsiteWithClaude(
  cvData: CVData,
  config: WebsiteConfig
): Promise<GeneratedWebsite> {
  try {
    const systemPrompt = `You are an expert website generator. Create a modern, responsive, professional website based on CV data and configuration.

CRITICAL: You must respond with ONLY valid JSON. No markdown, no code blocks, no explanations.

Your response must be a JSON object with this exact structure:
{
  "html": "string (complete HTML document)",
  "css": "string (modern CSS)",
  "javascript": "string (JavaScript)",
  "metadata": {
    "title": "string",
    "description": "string", 
    "keywords": ["string"]
  }
}

IMPORTANT RULES:
1. Start your response with { and end with }
2. Escape all quotes inside strings with \\"
3. Use \\n for line breaks in strings
4. Do not use backticks or template literals
5. Ensure all strings are properly quoted
6. Make sure the JSON is valid and parseable

Guidelines:
- Create modern, responsive designs
- Use semantic HTML5 structure
- Implement mobile-first CSS
- Include proper SEO meta tags
- Ensure accessibility (WCAG compliant)
- Use clean, maintainable code
- Optimize for performance
- Use the specified color scheme and font family
- Create a professional design that showcases skills and experience`

    const userPrompt = `Generate a professional website based on the following CV data and configuration.

CV Data:
${JSON.stringify(cvData, null, 2)}

Configuration:
- Template: ${config.template}
- Color Scheme: ${config.color_scheme}
- Font Family: ${config.font_family}
- Layout: ${config.layout}
- Features: ${JSON.stringify(config.features)}
- Style Config: ${JSON.stringify(config.style_config, null, 2)}

Create a modern, responsive website that effectively showcases the professional information. The website should be:
1. Professional and modern in appearance
2. Fully responsive for all devices
3. Fast loading and optimized
4. Accessible and SEO-friendly
5. Interactive with smooth animations
6. Customized with the specified color scheme and fonts

Use the detailed style configuration to create a website that matches the user's preferences exactly:
- Colors: Use the specified primary, secondary, accent, background, and text colors
- Typography: Apply the selected heading and body fonts with appropriate sizing
- Layout: Implement the chosen layout style (minimal, modern, creative, or professional)
- Visuals: Include the specified illustrations, icons, and shadow styles

Focus on creating a portfolio that highlights the person's skills, experience, and achievements in an engaging way.`

    const response = await claude.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 8000,
      messages: [
        {
          role: 'user',
          content: `\n\nHuman: ${systemPrompt}\n\n${userPrompt}`
        }
      ]
    })

    // Parse the JSON response
    const content = response.content[0]
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude')
    }
    
    let parsedData: any
    try {
      // Try to parse the response as JSON
      parsedData = JSON.parse(content.text)
    } catch (parseError) {
      console.error('JSON parsing error:', parseError)
      console.error('Raw response:', content.text)
      
      // Try to extract JSON from the response if it's wrapped in markdown
      const jsonMatch = content.text.match(/```json\s*([\s\S]*?)\s*```/) || 
                       content.text.match(/```\s*([\s\S]*?)\s*```/) ||
                       content.text.match(/\{[\s\S]*\}/)
      
      if (jsonMatch) {
        try {
          let jsonText = jsonMatch[1] || jsonMatch[0]
          
          // Fix common JSON issues
          jsonText = jsonText
            .replace(/`/g, '\\`') // Escape backticks
            .replace(/\n/g, '\\n') // Escape newlines
            .replace(/\r/g, '\\r') // Escape carriage returns
            .replace(/\t/g, '\\t') // Escape tabs
            .replace(/\\/g, '\\\\') // Escape backslashes
            .replace(/"/g, '\\"') // Escape quotes
          
          parsedData = JSON.parse(jsonText)
        } catch (secondParseError) {
          console.error('Second JSON parsing attempt failed:', secondParseError)
          
          // Create a fallback website if JSON parsing fails
          console.log('Creating fallback website due to JSON parsing failure')
          parsedData = createFallbackWebsite(cvData, config)
        }
      } else {
        console.log('No JSON found, creating fallback website')
        parsedData = createFallbackWebsite(cvData, config)
      }
    }
    
    // Validate the parsed data
    const validatedData = validateGeneratedWebsite(parsedData)
    
    return validatedData

  } catch (error) {
    console.error('Website generation error:', error)
    throw new Error(`Website generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// Data validation
export function validateGeneratedWebsite(data: any): GeneratedWebsite {
  // Validate HTML
  if (!data.html || typeof data.html !== 'string') {
    throw new Error('Invalid HTML in generated website')
  }

  // Validate CSS
  if (!data.css || typeof data.css !== 'string') {
    throw new Error('Invalid CSS in generated website')
  }

  // Validate JavaScript (optional)
  const javascript = data.javascript || ''

  // Validate metadata
  if (!data.metadata || typeof data.metadata !== 'object') {
    throw new Error('Invalid metadata in generated website')
  }

  const metadata = {
    title: data.metadata.title || 'Professional Portfolio',
    description: data.metadata.description || 'Professional portfolio website',
    keywords: Array.isArray(data.metadata.keywords) ? data.metadata.keywords : []
  }

  return {
    html: data.html,
    css: data.css,
    javascript,
    metadata
  }
}

// Generate website files for download
export function generateWebsiteFiles(website: GeneratedWebsite): { [key: string]: string } {
  return {
    'index.html': website.html,
    'styles.css': website.css,
    'script.js': website.javascript,
    'README.md': `# Professional Portfolio Website

This website was generated using CV2W (CV to Website) automation.

## Files:
- index.html - Main HTML file
- styles.css - CSS styles
- script.js - JavaScript functionality

## Features:
- Responsive design
- Modern layout
- SEO optimized
- Accessible

Generated on: ${new Date().toISOString()}
`
  }
}

// Create a complete HTML file with embedded CSS and JS
export function createFallbackWebsite(cvData: CVData, config: WebsiteConfig): GeneratedWebsite {
  const name = cvData.personal_info?.name || 'Professional'
  const title = `${name}'s Portfolio`
  
  return {
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <meta name="description" content="Professional portfolio of ${name}">
    <meta name="keywords" content="portfolio, professional, ${name}">
    <style>
        ${getFallbackCSS(config)}
    </style>
</head>
<body>
    <header>
        <h1>${name}</h1>
        <p>Professional Portfolio</p>
    </header>
    
    <main>
        <section>
            <h2>About</h2>
            <p>${cvData.personal_info?.summary || 'Experienced professional with a strong track record.'}</p>
        </section>
        
        <section>
            <h2>Experience</h2>
            ${cvData.experience?.map(exp => `
                <div>
                    <h3>${exp.title}</h3>
                    <p>${exp.company} - ${exp.duration}</p>
                    <p>${exp.description}</p>
                </div>
            `).join('') || '<p>No experience data available</p>'}
        </section>
        
        <section>
            <h2>Skills</h2>
            <p>${cvData.skills?.technical?.join(', ') || 'Skills data not available'}</p>
        </section>
    </main>
    
    <footer>
        <p>&copy; 2024 ${name}. All rights reserved.</p>
    </footer>
</body>
</html>`,
    css: getFallbackCSS(config),
    javascript: '',
    metadata: {
      title: title,
      description: `Professional portfolio of ${name}`,
      keywords: ['portfolio', 'professional', name]
    }
  }
}

function getFallbackCSS(config: WebsiteConfig): string {
  const colors = {
    blue: { primary: '#2563eb', secondary: '#1e40af', accent: '#3b82f6' },
    purple: { primary: '#7c3aed', secondary: '#5b21b6', accent: '#8b5cf6' },
    green: { primary: '#059669', secondary: '#047857', accent: '#10b981' },
    orange: { primary: '#ea580c', secondary: '#c2410c', accent: '#f97316' }
  }
  
  const colorScheme = config.color_scheme || 'blue'
  const color = colors[colorScheme as keyof typeof colors] || colors.blue
  
  return `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', sans-serif; line-height: 1.6; color: #333; }
    header { background: ${color.primary}; color: white; padding: 2rem; text-align: center; }
    main { max-width: 800px; margin: 0 auto; padding: 2rem; }
    section { margin-bottom: 2rem; }
    h1 { font-size: 2.5rem; margin-bottom: 0.5rem; }
    h2 { color: ${color.primary}; margin-bottom: 1rem; }
    h3 { color: ${color.secondary}; margin-bottom: 0.5rem; }
    footer { background: #f3f4f6; text-align: center; padding: 1rem; margin-top: 2rem; }
  `
}

export function createCompleteHTMLFile(website: GeneratedWebsite): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${website.metadata.title}</title>
    <meta name="description" content="${website.metadata.description}">
    <meta name="keywords" content="${website.metadata.keywords.join(', ')}">
    <style>
        ${website.css}
    </style>
</head>
<body>
    ${website.html}
    <script>
        ${website.javascript}
    </script>
</body>
</html>`
} 