import { claude, CLAUDE_MODEL, RETRY_CONFIG, calculateDelay } from './claude'
import { CV_PROCESSING_SYSTEM_PROMPT, createCVProcessingPrompt } from './prompts'
import { CVData, PersonalInfo, Experience, Education, Skills } from '@/types'

// File processing utilities
export async function extractTextFromFile(file: File): Promise<string> {
  const fileType = file.type
  const fileName = file.name.toLowerCase()

  try {
    if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
      return await file.text()
    }

    if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
      return await extractTextFromPDF(file)
    }

    if (fileType.includes('word') || fileName.endsWith('.doc') || fileName.endsWith('.docx')) {
      return await extractTextFromDOCX(file)
    }

    throw new Error(`Unsupported file type: ${fileType}`)
  } catch (error) {
    console.error('Error extracting text from file:', error)
    throw error
  }
}

// PDF text extraction
export async function extractTextFromPDF(file: File): Promise<string> {
  try {
    // Convert file to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()
    
    // Use pdf-parse to extract text
    const pdfParse = require('pdf-parse')
    const data = new Uint8Array(arrayBuffer)
    
    const result = await pdfParse(data)
    return result.text
  } catch (error) {
    console.error('PDF parsing error:', error)
    throw new Error(`Failed to parse PDF: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// DOCX text extraction
export async function extractTextFromDOCX(file: File): Promise<string> {
  try {
    // Convert file to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()
    
    // Use docx library to extract text
    const { Document } = require('docx')
    const doc = new Document(arrayBuffer)
    
    // Extract text from all paragraphs
    let text = ''
    for (const section of doc.sections) {
      for (const paragraph of section.children) {
        if (paragraph.children) {
          for (const run of paragraph.children) {
            if (run.text) {
              text += run.text + ' '
            }
          }
        }
        text += '\n'
      }
    }
    
    return text.trim()
  } catch (error) {
    console.error('DOCX parsing error:', error)
    throw new Error(`Failed to parse DOCX: ${error instanceof Error ? error.message : 'Unknown error'}`)
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

  throw new Error(`CV processing failed after ${RETRY_CONFIG.maxRetries} attempts. Last error: ${lastError?.message}`)
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

// Processing job utilities
export async function createProcessingJob(
  supabase: any,
  userId: string,
  jobType: 'cv_processing' | 'website_generation' | 'deployment',
  inputData?: any
) {
  const { data, error } = await supabase
    .from('processing_jobs')
    .insert({
      user_id: userId,
      job_type: jobType,
      status: 'pending',
      input_data: inputData,
    })
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function updateProcessingJob(
  supabase: any,
  jobId: string,
  status: 'pending' | 'processing' | 'completed' | 'failed',
  outputData?: any,
  errorMessage?: string
) {
  const updateData: any = {
    status,
    updated_at: new Date().toISOString(),
  }

  if (status === 'processing') {
    updateData.started_at = new Date().toISOString()
  } else if (status === 'completed' || status === 'failed') {
    updateData.completed_at = new Date().toISOString()
  }

  if (outputData) {
    updateData.output_data = outputData
  }

  if (errorMessage) {
    updateData.error_message = errorMessage
  }

  const { data, error } = await supabase
    .from('processing_jobs')
    .update(updateData)
    .eq('id', jobId)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
} 