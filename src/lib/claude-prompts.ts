// Claude prompts for website generation
// Based on Project.md and PRD_CV2W_Automation.md requirements

export const CLAUDE_PROMPTS = {
  // Main website generation prompt
  WEBSITE_GENERATION: `
You are an expert web developer and designer specializing in creating professional portfolio websites. Your task is to generate a complete, responsive Next.js 14 website based on the provided CV data and style preferences.

**CV Data Structure:**
\`\`\`json
{
  "personal_info": {
    "name": "string",
    "email": "string", 
    "phone": "string",
    "location": "string",
    "linkedin": "string"
  },
  "experience": [
    {
      "title": "string",
      "company": "string", 
      "duration": "string",
      "description": "string",
      "achievements": ["string"]
    }
  ],
  "education": [
    {
      "degree": "string",
      "institution": "string",
      "year": "string",
      "gpa": "string"
    }
  ],
  "skills": {
    "technical": ["string"],
    "soft_skills": ["string"],
    "languages": ["string"]
  }
}
\`\`\`

**Style Configuration:**
- Layout: [Minimal/Modern/Creative/Professional]
- Color Scheme: [Professional Blue/Creative Purple/Modern Green/Warm Orange]
- Typography: [Inter/Roboto/Open Sans/Poppins/Montserrat]
- Visual Elements: [None/Minimal/Detailed]
- Icons Style: [Outlined/Filled/Duotone]
- Shadows: [None/Subtle/Prominent]

**Technical Requirements:**
1. Next.js 14 with App Router
2. TypeScript for type safety
3. Tailwind CSS for styling
4. Mobile-first responsive design
5. WCAG 2.1 AA accessibility compliance
6. Core Web Vitals optimization (LCP < 2.5s, FID < 100ms, CLS < 0.1)
7. SEO meta tags and structured data
8. Semantic HTML structure
9. Smooth animations and transitions
10. Contact form functionality
11. Social media integration

**Output Format:**
Generate the complete website structure with all necessary files:
- \`app/layout.tsx\` - Root layout with metadata
- \`app/page.tsx\` - Main portfolio page
- \`components/\` - Reusable React components
- \`styles/\` - Custom CSS and Tailwind config
- \`public/\` - Static assets

Focus on creating a unique, professional website that showcases the individual's skills and experience effectively.
`,

  // Style-specific prompts
  STYLE_PROMPTS: {
    MINIMAL: `
Create a clean, minimalist portfolio website with:
- Generous white space and clean typography
- Subtle color accents
- Focus on content hierarchy
- Minimal animations and effects
- Clean, uncluttered layout
- Emphasis on readability and professionalism
- Simple, elegant design elements
- High contrast for accessibility
- Fast loading and performance
`,

    MODERN: `
Create a contemporary portfolio website with:
- Subtle gradients and shadows
- Modern card-based layouts
- Smooth hover effects and transitions
- Contemporary color palettes
- Interactive elements
- Professional yet approachable design
- Modern typography choices
- Responsive grid systems
- Micro-interactions and animations
`,

    CREATIVE: `
Create a bold, creative portfolio website with:
- Unique visual elements and illustrations
- Creative color combinations
- Dynamic layouts and animations
- Artistic typography choices
- Engaging interactive elements
- Memorable and distinctive design
- Creative use of space and layout
- Eye-catching visual effects
- Unique user experience
`,

    PROFESSIONAL: `
Create a corporate, professional portfolio website with:
- Traditional business aesthetics
- Conservative color schemes
- Structured, formal layouts
- Professional typography
- Subtle, refined animations
- Trust-building design elements
- Corporate branding elements
- Formal content presentation
- Business-appropriate styling
`
  },

  // Technical implementation prompt
  TECHNICAL_IMPLEMENTATION: `
Generate a production-ready Next.js 14 website with the following technical specifications:

**Framework Requirements:**
- Next.js 14 with App Router
- TypeScript for type safety
- Tailwind CSS for styling
- React 18+ features

**Performance Requirements:**
- Lighthouse score > 90
- Core Web Vitals optimization
- Image optimization with Next.js Image component
- Code splitting and lazy loading
- Minimal bundle size

**Accessibility Requirements:**
- WCAG 2.1 AA compliance
- Semantic HTML structure
- ARIA labels and roles
- Keyboard navigation support
- Screen reader compatibility
- Color contrast ratios

**SEO Requirements:**
- Meta tags and Open Graph data
- Structured data (JSON-LD)
- Sitemap generation
- Robots.txt configuration
- Optimized page titles and descriptions

**Security Requirements:**
- Content Security Policy
- XSS protection
- Secure form handling
- Input validation and sanitization

Generate clean, well-documented code with proper error handling and loading states.
`,

  // Responsive design prompt
  RESPONSIVE_DESIGN: `
Create a fully responsive website that works perfectly on:
- Mobile devices (320px - 768px)
- Tablets (768px - 1024px)
- Desktop (1024px+)
- Large screens (1440px+)

**Mobile-First Approach:**
- Start with mobile layout
- Progressive enhancement for larger screens
- Touch-friendly interactive elements
- Optimized navigation for mobile
- Fast loading on mobile networks

**Responsive Features:**
- Flexible grid systems
- Responsive typography
- Adaptive images
- Mobile-optimized forms
- Touch-friendly buttons and links
- Proper viewport meta tags
- Responsive breakpoints
`,

  // Content generation prompt
  CONTENT_GENERATION: `
Based on the CV data, generate compelling website content:

**Hero Section:**
- Professional headline
- Brief personal introduction
- Call-to-action buttons

**About Section:**
- Professional summary
- Key achievements
- Personal brand statement

**Experience Section:**
- Detailed job descriptions
- Key achievements and metrics
- Skills demonstrated

**Skills Section:**
- Technical skills with proficiency levels
- Soft skills and competencies
- Tools and technologies

**Contact Section:**
- Professional contact information
- Social media links
- Contact form

**SEO Content:**
- Meta descriptions
- Page titles
- Alt text for images
- Structured data markup

Ensure all content is professional, engaging, and optimized for both human readers and search engines.
`,

  // Animation and interaction prompt
  ANIMATIONS: `
Create smooth, professional animations and interactions:

**Page Transitions:**
- Smooth page loads
- Fade-in effects
- Staggered content animations

**Interactive Elements:**
- Hover effects on buttons and links
- Smooth scrolling navigation
- Form validation feedback
- Loading states and spinners

**Scroll Animations:**
- Reveal animations on scroll
- Parallax effects (subtle)
- Sticky navigation
- Progress indicators

**Micro-interactions:**
- Button click feedback
- Form field focus states
- Success/error animations
- Loading progress bars

**Performance Considerations:**
- Use CSS transforms and opacity
- Avoid layout thrashing
- Optimize for 60fps
- Reduce motion for accessibility
`,

  // Quality assurance prompt
  QUALITY_ASSURANCE: `
Ensure the generated website meets all quality standards:

**Code Quality:**
- Clean, readable code
- Proper TypeScript types
- Consistent naming conventions
- Error handling
- Loading states

**Design Quality:**
- Consistent visual hierarchy
- Proper spacing and alignment
- Color accessibility
- Typography consistency
- Brand alignment

**Performance Quality:**
- Fast loading times
- Optimized images
- Efficient CSS
- Minimal JavaScript
- Good Core Web Vitals

**Accessibility Quality:**
- Keyboard navigation
- Screen reader support
- Color contrast
- Focus indicators
- Semantic HTML

**SEO Quality:**
- Proper meta tags
- Structured data
- Clean URLs
- Fast loading
- Mobile-friendly

**Security Quality:**
- Input validation
- XSS protection
- Secure forms
- HTTPS ready
- Content security
`
} as const

// Helper function to generate complete prompt
export function generateWebsitePrompt(
  cvData: any,
  styleConfig: any,
  additionalRequirements?: string
): string {
  const basePrompt = CLAUDE_PROMPTS.WEBSITE_GENERATION
  const layoutStyle = styleConfig.layout?.style || 'MODERN'
  const stylePrompt = CLAUDE_PROMPTS.STYLE_PROMPTS[layoutStyle as keyof typeof CLAUDE_PROMPTS.STYLE_PROMPTS] || CLAUDE_PROMPTS.STYLE_PROMPTS.MODERN
  const technicalPrompt = CLAUDE_PROMPTS.TECHNICAL_IMPLEMENTATION
  const responsivePrompt = CLAUDE_PROMPTS.RESPONSIVE_DESIGN
  const contentPrompt = CLAUDE_PROMPTS.CONTENT_GENERATION
  const animationPrompt = CLAUDE_PROMPTS.ANIMATIONS
  const qualityPrompt = CLAUDE_PROMPTS.QUALITY_ASSURANCE

  return `
${basePrompt}

**CV Data:**
\`\`\`json
${JSON.stringify(cvData, null, 2)}
\`\`\`

**Style Configuration:**
\`\`\`json
${JSON.stringify(styleConfig, null, 2)}
\`\`\`

${stylePrompt}

${technicalPrompt}

${responsivePrompt}

${contentPrompt}

${animationPrompt}

${qualityPrompt}

${additionalRequirements || ''}

Generate the complete website code following all requirements above.
`
} 