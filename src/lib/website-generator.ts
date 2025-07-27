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
    console.log('Generating website with improved Claude prompts...')
    
    // Create a focused, practical prompt
    const systemPrompt = `You are an expert web developer creating professional portfolio websites. Generate a complete, modern website based on CV data and style preferences.

CRITICAL: Respond with ONLY valid JSON in this exact structure:
{
  "html": "complete HTML document with all content",
  "css": "modern CSS styles",
  "javascript": "JavaScript for interactivity",
  "metadata": {
    "title": "page title",
    "description": "page description",
    "keywords": ["keyword1", "keyword2"]
  }
}

IMPORTANT RULES:
1. Start with { and end with }
2. Escape quotes with \\"
3. Use \\n for line breaks
4. Generate a complete, standalone HTML website
5. Include responsive design
6. Apply the exact colors and fonts specified
7. Create professional, modern design
8. Include all sections: hero, about, experience, skills, contact
9. Make it visually appealing and well-structured`

    const userPrompt = `Create a professional portfolio website for this person:

CV DATA:
${JSON.stringify(cvData, null, 2)}

STYLE CONFIGURATION:
${JSON.stringify(config.style_config, null, 2)}

REQUIREMENTS:
- Layout Style: ${config.style_config?.layout?.style || 'modern'}
- Primary Color: ${config.style_config?.colors?.primary || '#2563eb'}
- Secondary Color: ${config.style_config?.colors?.secondary || '#1e40af'}
- Heading Font: ${config.style_config?.typography?.headingFont || 'Inter'}
- Body Font: ${config.style_config?.typography?.bodyFont || 'Inter'}
- Illustrations: ${config.style_config?.visuals?.illustrations || 'minimal'}
- Icons: ${config.style_config?.visuals?.icons || 'outlined'}
- Shadows: ${config.style_config?.visuals?.shadows || 'subtle'}

CREATE A WEBSITE WITH:
1. Hero section with name, title, and call-to-action
2. About section with professional summary
3. Experience section with job history
4. Skills section with technical and soft skills
5. Contact section with contact information
6. Modern, responsive design
7. Smooth animations and hover effects
8. Professional color scheme
9. Clean typography
10. Mobile-friendly layout

Make it look professional and modern, similar to high-quality portfolio websites you'd see on sites like Dribbble or Behance.`

    const response = await claude.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 8000,
      messages: [
        {
          role: 'user',
          content: `${systemPrompt}\n\n${userPrompt}`
        }
      ]
    })

    // Parse the JSON response
    const content = response.content[0]
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude')
    }
    
    console.log('Claude response length:', content.text.length)
    console.log('Claude response preview:', content.text.substring(0, 200))
    
    let parsedData: any
    try {
      // Try to parse the response as JSON
      parsedData = JSON.parse(content.text)
      console.log('✅ JSON parsing successful')
    } catch (parseError) {
      console.error('❌ JSON parsing error:', parseError)
      console.error('Raw response (first 1000 chars):', content.text.substring(0, 1000))
      
      // Try to extract JSON from the response if it's wrapped in markdown
      const jsonMatch = content.text.match(/```json\s*([\s\S]*?)\s*```/) || 
                       content.text.match(/```\s*([\s\S]*?)\s*```/) ||
                       content.text.match(/\{[\s\S]*\}/)
      
      if (jsonMatch) {
        console.log('🔍 Found JSON in markdown or code blocks')
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
          console.log('✅ JSON parsing successful after extraction')
        } catch (secondParseError) {
          console.error('❌ Second JSON parsing attempt failed:', secondParseError)
          
          // Create a fallback website if JSON parsing fails
          console.log('🔄 Creating fallback website due to JSON parsing failure')
          parsedData = createFallbackWebsite(cvData, config)
        }
      } else {
        console.log('❌ No JSON found in response, creating fallback website')
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
  const primaryColor = config.style_config?.colors?.primary || '#2563eb'
  const secondaryColor = config.style_config?.colors?.secondary || '#1e40af'
  const headingFont = config.style_config?.typography?.headingFont || 'Inter'
  const bodyFont = config.style_config?.typography?.bodyFont || 'Inter'
  
  return {
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <meta name="description" content="Professional portfolio of ${name} - ${cvData.personal_info?.summary || 'Experienced professional'}">
    <meta name="keywords" content="portfolio, professional, ${name}, ${cvData.skills?.technical?.slice(0, 5).join(', ') || ''}">
    <link href="https://fonts.googleapis.com/css2?family=${headingFont.replace(' ', '+')}:wght@400;600;700&family=${bodyFont.replace(' ', '+')}:wght@400;500&display=swap" rel="stylesheet">
    <style>
        ${getFallbackCSS(config)}
    </style>
</head>
<body>
    <nav class="navbar">
        <div class="nav-container">
            <div class="nav-logo">${name}</div>
            <ul class="nav-menu">
                <li><a href="#home">Home</a></li>
                <li><a href="#about">About</a></li>
                <li><a href="#experience">Experience</a></li>
                <li><a href="#skills">Skills</a></li>
                <li><a href="#contact">Contact</a></li>
            </ul>
        </div>
    </nav>

    <section id="home" class="hero">
        <div class="hero-container">
            <div class="hero-content">
                <h1 class="hero-title">${name}</h1>
                <p class="hero-subtitle">${cvData.personal_info?.summary || 'Experienced professional with a strong track record of success'}</p>
                <div class="hero-buttons">
                    <a href="#contact" class="btn btn-primary">Get In Touch</a>
                    <a href="#experience" class="btn btn-secondary">View Experience</a>
                </div>
            </div>
        </div>
    </section>

    <section id="about" class="about">
        <div class="container">
            <h2 class="section-title">About Me</h2>
            <div class="about-content">
                <p class="about-text">${cvData.personal_info?.summary || 'I am a dedicated professional with extensive experience in my field. I am passionate about delivering high-quality results and continuously improving my skills.'}</p>
                <div class="about-details">
                    <div class="detail-item">
                        <strong>Email:</strong> ${cvData.personal_info?.email || 'contact@example.com'}
                    </div>
                    <div class="detail-item">
                        <strong>Location:</strong> ${cvData.personal_info?.location || 'Available worldwide'}
                    </div>
                    ${cvData.personal_info?.phone ? `<div class="detail-item"><strong>Phone:</strong> ${cvData.personal_info.phone}</div>` : ''}
                    ${cvData.personal_info?.linkedin ? `<div class="detail-item"><strong>LinkedIn:</strong> <a href="${cvData.personal_info.linkedin}" target="_blank">${cvData.personal_info.linkedin}</a></div>` : ''}
                </div>
            </div>
        </div>
    </section>

    <section id="experience" class="experience">
        <div class="container">
            <h2 class="section-title">Professional Experience</h2>
            <div class="experience-grid">
                ${cvData.experience?.map(exp => `
                    <div class="experience-card">
                        <div class="experience-header">
                            <h3 class="experience-title">${exp.title}</h3>
                            <span class="experience-company">${exp.company}</span>
                        </div>
                        <div class="experience-duration">${exp.duration}</div>
                        <p class="experience-description">${exp.description}</p>
                        ${exp.achievements && exp.achievements.length > 0 ? `
                            <ul class="experience-achievements">
                                ${exp.achievements.map(achievement => `<li>${achievement}</li>`).join('')}
                            </ul>
                        ` : ''}
                    </div>
                `).join('') || '<p class="no-data">Experience data not available</p>'}
            </div>
        </div>
    </section>

    <section id="skills" class="skills">
        <div class="container">
            <h2 class="section-title">Skills & Expertise</h2>
            <div class="skills-grid">
                ${cvData.skills?.technical && cvData.skills.technical.length > 0 ? `
                    <div class="skills-category">
                        <h3>Technical Skills</h3>
                        <div class="skills-list">
                            ${cvData.skills.technical.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                        </div>
                    </div>
                ` : ''}
                ${cvData.skills?.soft_skills && cvData.skills.soft_skills.length > 0 ? `
                    <div class="skills-category">
                        <h3>Soft Skills</h3>
                        <div class="skills-list">
                            ${cvData.skills.soft_skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                        </div>
                    </div>
                ` : ''}
                ${cvData.skills?.languages && cvData.skills.languages.length > 0 ? `
                    <div class="skills-category">
                        <h3>Languages</h3>
                        <div class="skills-list">
                            ${cvData.skills.languages.map(lang => `<span class="skill-tag">${lang}</span>`).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        </div>
    </section>

    <section id="contact" class="contact">
        <div class="container">
            <h2 class="section-title">Get In Touch</h2>
            <div class="contact-content">
                <div class="contact-info">
                    <div class="contact-item">
                        <strong>Email:</strong> <a href="mailto:${cvData.personal_info?.email || 'contact@example.com'}">${cvData.personal_info?.email || 'contact@example.com'}</a>
                    </div>
                    ${cvData.personal_info?.phone ? `<div class="contact-item"><strong>Phone:</strong> <a href="tel:${cvData.personal_info.phone}">${cvData.personal_info.phone}</a></div>` : ''}
                    ${cvData.personal_info?.linkedin ? `<div class="contact-item"><strong>LinkedIn:</strong> <a href="${cvData.personal_info.linkedin}" target="_blank">Connect on LinkedIn</a></div>` : ''}
                </div>
            </div>
        </div>
    </section>

    <footer class="footer">
        <div class="container">
            <p>&copy; 2024 ${name}. All rights reserved.</p>
        </div>
    </footer>

    <script>
        // Smooth scrolling for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // Add scroll effect to navbar
        window.addEventListener('scroll', function() {
            const navbar = document.querySelector('.navbar');
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    </script>
</body>
</html>`,
    css: getFallbackCSS(config),
    javascript: `
        // Smooth scrolling for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // Add scroll effect to navbar
        window.addEventListener('scroll', function() {
            const navbar = document.querySelector('.navbar');
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    `,
    metadata: {
      title: title,
      description: `Professional portfolio of ${name} - ${cvData.personal_info?.summary || 'Experienced professional'}`,
      keywords: ['portfolio', 'professional', name, ...(cvData.skills?.technical?.slice(0, 5) || [])]
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
  // Check if the generated HTML already contains a complete HTML document
  if (website.html.trim().startsWith('<!DOCTYPE html>') || website.html.trim().startsWith('<html')) {
    // If it's already a complete HTML document, just add the CSS and JS to it
    const htmlWithStyles = website.html.replace(
      '</head>',
      `<style>${website.css}</style></head>`
    )
    
    const htmlWithScripts = htmlWithStyles.replace(
      '</body>',
      `<script>${website.javascript}</script></body>`
    )
    
    return htmlWithScripts
  } else {
    // If it's just body content, wrap it in a complete HTML document
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
} 