import { claude, CLAUDE_MODEL, RETRY_CONFIG, calculateDelay } from './claude'
import { CV_PROCESSING_SYSTEM_PROMPT, createCVProcessingPrompt } from './prompts'
import { CVData, PersonalInfo, Experience, Education, Skills } from '@/types'



// PDF text extraction
export async function extractTextFromPDF(file: File): Promise<string> {
  try {
    // Convert file to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()
    
    // Use pdfjs-dist with ES module import for the new version
    const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs')
    
    // Load the PDF document
    const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) })
    const pdf = await loadingTask.promise
    
    let fullText = ''
    
    // Extract text from each page
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum)
      const textContent = await page.getTextContent()
      
      // Combine text items
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ')
      
      fullText += pageText + '\n'
    }
    
    return fullText.trim() || 'No text content found in PDF'
  } catch (error) {
    console.error('PDF parsing error:', error)
    // Return a fallback message instead of throwing
    return 'PDF content could not be extracted. Please try uploading a different file format.'
  }
}

// DOCX text extraction
export async function extractTextFromDOCX(file: File): Promise<string> {
  try {
    // Convert file to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()
    
    // Use mammoth.js to extract text from DOCX
    const mammoth = require('mammoth')
    
    // For Node.js environment, use buffer instead of arrayBuffer
    const buffer = Buffer.from(arrayBuffer)
    const result = await mammoth.extractRawText({ buffer })
    return result.value.trim() || 'No text content found in DOCX'
  } catch (error) {
    console.error('DOCX parsing error:', error)
    // Return a fallback message instead of throwing
    return 'DOCX content could not be extracted. Please try uploading a different file format.'
  }
}

// CV Processing with Claude
export async function processCVWithClaude(cvContent: string): Promise<CVData> {
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= RETRY_CONFIG.maxRetries; attempt++) {
    try {
      const systemPrompt = CV_PROCESSING_SYSTEM_PROMPT
      const userPrompt = createCVProcessingPrompt(cvContent)

      const response = await claude.messages.create({
        model: CLAUDE_MODEL,
        max_tokens: 4000,
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
      
      const parsedData = JSON.parse(content.text)
      
      // Validate the parsed data
      const validatedData = validateCVData(parsedData)
      
      return validatedData

    } catch (error) {
      lastError = error as Error
      console.error(`CV processing attempt ${attempt} failed:`, error)

      if (attempt < RETRY_CONFIG.maxRetries) {
        const delay = calculateDelay(attempt)
        console.log(`Retrying in ${delay}ms...`)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }

  // If all attempts failed, return a basic CV structure with error information
  console.error(`CV processing failed after ${RETRY_CONFIG.maxRetries} attempts. Returning fallback data.`)
  
  return {
    id: '',
    cv_document_id: '',
    personal_info: {
      name: 'CV Processing Failed',
      email: 'N/A',
      phone: undefined,
      location: undefined,
      linkedin: undefined,
      website: undefined,
      summary: 'CV processing failed. Please try uploading a different file format or check if the file is corrupted.',
    },
    experience: [],
    education: [],
    skills: {
      technical: [],
      soft_skills: [],
      languages: [],
      certifications: [],
    },
    metadata: {
      processing_status: 'failed',
      error_message: lastError?.message || 'Unknown error',
      extracted_at: new Date().toISOString(),
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
}

// Data validation
export function validateCVData(data: any): CVData {
  // Validate personal info
  if (!data.personal_info || typeof data.personal_info !== 'object') {
    throw new Error('Invalid personal_info in CV data')
  }

  const personalInfo: PersonalInfo = {
    name: data.personal_info.name || 'N/A',
    email: data.personal_info.email || 'N/A',
    phone: data.personal_info.phone || undefined,
    location: data.personal_info.location || undefined,
    linkedin: data.personal_info.linkedin || undefined,
    website: data.personal_info.website || undefined,
    summary: data.personal_info.summary || undefined,
  }

  // Validate experience
  if (!Array.isArray(data.experience)) {
    throw new Error('Invalid experience array in CV data')
  }

  const experience: Experience[] = data.experience.map((exp: any) => ({
    title: exp.title || 'N/A',
    company: exp.company || 'N/A',
    duration: exp.duration || 'N/A',
    description: exp.description || 'N/A',
    achievements: Array.isArray(exp.achievements) ? exp.achievements : [],
    start_date: exp.start_date || undefined,
    end_date: exp.end_date || undefined,
  }))

  // Validate education
  if (!Array.isArray(data.education)) {
    throw new Error('Invalid education array in CV data')
  }

  const education: Education[] = data.education.map((edu: any) => ({
    degree: edu.degree || 'N/A',
    institution: edu.institution || 'N/A',
    year: edu.year || 'N/A',
    gpa: edu.gpa || undefined,
    description: edu.description || undefined,
  }))

  // Validate skills
  if (!data.skills || typeof data.skills !== 'object') {
    throw new Error('Invalid skills object in CV data')
  }

  const skills: Skills = {
    technical: Array.isArray(data.skills.technical) ? data.skills.technical : [],
    soft_skills: Array.isArray(data.skills.soft_skills) ? data.skills.soft_skills : [],
    languages: Array.isArray(data.skills.languages) ? data.skills.languages : [],
    certifications: Array.isArray(data.skills.certifications) ? data.skills.certifications : [],
  }

  return {
    id: '', // Will be set by database
    cv_document_id: '', // Will be set by database
    personal_info: personalInfo,
    experience,
    education,
    skills,
    metadata: data.metadata || {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
}

 