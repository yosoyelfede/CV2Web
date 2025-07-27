import { PersonalInfo, Experience, Education, Skills } from '@/types'

// CV Processing System Prompt
export const CV_PROCESSING_SYSTEM_PROMPT = `You are an expert CV parser. Extract structured data from CV content and return it as valid JSON.

Your response must be a JSON object with the following structure:
{
  "personal_info": {
    "name": "string",
    "email": "string", 
    "phone": "string (optional)",
    "location": "string (optional)",
    "linkedin": "string (optional)",
    "website": "string (optional)",
    "summary": "string (optional)"
  },
  "experience": [
    {
      "title": "string",
      "company": "string",
      "duration": "string",
      "description": "string",
      "achievements": ["string"],
      "start_date": "string (YYYY-MM format, optional)",
      "end_date": "string (YYYY-MM format, optional)"
    }
  ],
  "education": [
    {
      "degree": "string",
      "institution": "string", 
      "year": "string",
      "gpa": "string (optional)",
      "description": "string (optional)"
    }
  ],
  "skills": {
    "technical": ["string"],
    "soft_skills": ["string"],
    "languages": ["string"],
    "certifications": ["string (optional)"]
  }
}

Guidelines:
- Extract all available information accurately
- Use "N/A" for missing optional fields
- For dates, use YYYY-MM format when possible
- Clean and normalize text (remove extra spaces, etc.)
- Preserve the original meaning and context
- Handle various CV formats and layouts
- Be consistent with data extraction`

// CV Processing User Prompt Template
export function createCVProcessingPrompt(cvContent: string): string {
  return `Please parse the following CV content and extract structured data.

CV Content:
${cvContent}

Extract all available information and return it in the specified JSON format. Ensure all text is properly cleaned and normalized.`
}

// Website Generation System Prompt
export const WEBSITE_GENERATION_SYSTEM_PROMPT = `You are an expert website generator. Create modern, responsive website code based on CV data and configuration.

Your response must be a JSON object with the following structure:
{
  "html": "string (complete HTML document)",
  "css": "string (CSS styles)",
  "javascript": "string (JavaScript code, optional)",
  "metadata": {
    "title": "string",
    "description": "string",
    "keywords": ["string"]
  }
}

Guidelines:
- Create modern, responsive designs
- Use semantic HTML5
- Implement mobile-first CSS
- Include proper SEO meta tags
- Ensure accessibility (WCAG compliant)
- Use clean, maintainable code
- Optimize for performance
- Include proper error handling`

// Website Generation User Prompt Template
export function createWebsiteGenerationPrompt(
  cvData: { personal_info: PersonalInfo; experience: Experience[]; education: Education[]; skills: Skills },
  config: {
    template: string
    color_scheme: string
    font_family: string
    layout: string
    features: any
  }
): string {
  return `Generate a professional website based on the following CV data and configuration.

CV Data:
${JSON.stringify(cvData, null, 2)}

Configuration:
- Template: ${config.template}
- Color Scheme: ${config.color_scheme}
- Font Family: ${config.font_family}
- Layout: ${config.layout}
- Features: ${JSON.stringify(config.features)}

Create a modern, responsive website that showcases the professional information effectively.`
}

// Error Handling Prompts
export const ERROR_HANDLING_PROMPT = `If you encounter any issues or unclear data, respond with:
{
  "error": "string (description of the issue)",
  "partial_data": "object (any data that could be extracted)",
  "suggestions": ["string (suggestions for improvement)"]
}`

// Validation Prompts
export const VALIDATION_PROMPT = `Before responding, validate that:
1. All required fields are present
2. JSON structure is correct
3. Data types are appropriate
4. No sensitive information is exposed
5. Text is properly sanitized

If validation fails, provide a clear error message.` 