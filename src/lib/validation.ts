import { z } from 'zod'

// CV Upload validation
export const cvUploadSchema = z.object({
  file: z.instanceof(File).refine(
    (file) => file.size <= 10 * 1024 * 1024, // 10MB
    'File size must be less than 10MB'
  ).refine(
    (file) => {
      const allowedTypes = [
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
      ]
      return allowedTypes.includes(file.type)
    },
    'Invalid file type. Only DOC, DOCX, and TXT files are allowed.'
  )
})

// CV Process validation
export const cvProcessSchema = z.object({
  documentId: z.string().uuid('Invalid document ID format')
})

// Website Generation validation
export const websiteGenerationSchema = z.object({
  cvDataId: z.string().uuid('Invalid CV data ID format'),
  config: z.object({
    template: z.enum(['modern', 'classic', 'minimal', 'creative']).optional(),
    color_scheme: z.enum(['blue', 'green', 'purple', 'orange', 'custom']).optional(),
    font_family: z.enum(['inter', 'roboto', 'open-sans', 'poppins']).optional(),
    layout: z.enum(['single_page', 'multi_page']).optional(),
    features: z.object({
      contact_form: z.boolean().optional(),
      social_links: z.boolean().optional(),
      analytics: z.boolean().optional(),
      blog: z.boolean().optional()
    }).optional(),
    style_config: z.any().optional() // Accept the full style config object
  }).optional()
})

// Website Deployment validation
export const websiteDeploymentSchema = z.object({
  websiteId: z.string().uuid('Invalid website ID format')
})

// Deployment Status validation
export const deploymentStatusSchema = z.object({
  deploymentId: z.string().min(1, 'Deployment ID is required')
})

// Helper function to validate request data
export async function validateRequest<T>(
  request: Request,
  schema: z.ZodSchema<T>
): Promise<{ success: true; data: T } | { success: false; error: string }> {
  try {
    const contentType = request.headers.get('content-type')
    
    if (contentType?.includes('application/json')) {
      const body = await request.json()
      const validatedData = schema.parse(body)
      return { success: true, data: validatedData }
    } else if (contentType?.includes('multipart/form-data')) {
      const formData = await request.formData()
      const body = Object.fromEntries(formData.entries())
      const validatedData = schema.parse(body)
      return { success: true, data: validatedData }
    } else {
      return { success: false, error: 'Invalid content type' }
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    return { success: false, error: 'Validation failed' }
  }
} 