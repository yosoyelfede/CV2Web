// User types
export interface User {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

// CV Document types
export interface CVDocument {
  id: string
  user_id: string
  original_filename: string
  file_path: string
  file_size: number
  mime_type: string
  processing_status: 'pending' | 'processing' | 'completed' | 'failed'
  extracted_data?: any
  processing_errors?: string[]
  created_at: string
  updated_at: string
}

// CV Data types
export interface PersonalInfo {
  name: string
  email: string
  phone?: string
  location?: string
  linkedin?: string
  website?: string
  summary?: string
}

export interface Experience {
  title: string
  company: string
  duration: string
  description: string
  achievements: string[]
  start_date?: string
  end_date?: string
}

export interface Education {
  degree: string
  institution: string
  year: string
  gpa?: string
  description?: string
}

export interface Skills {
  technical: string[]
  soft_skills: string[]
  languages: string[]
  certifications?: string[]
}

export interface CVData {
  id: string
  cv_document_id: string
  personal_info: PersonalInfo
  experience: Experience[]
  education: Education[]
  skills: Skills
  metadata?: any
  created_at: string
  updated_at: string
}

// Website types
export interface Website {
  id: string
  user_id: string
  cv_data_id: string
  name: string
  description?: string
  domain?: string
  deployment_url?: string
  deployment_status: 'pending' | 'generating' | 'deploying' | 'live' | 'failed'
  website_config: WebsiteConfig
  generated_code?: any
  deployment_errors?: string[]
  created_at: string
  updated_at: string
}

export interface WebsiteConfig {
  template: 'modern' | 'classic' | 'minimal' | 'creative'
  color_scheme: 'blue' | 'green' | 'purple' | 'orange' | 'custom'
  font_family: 'inter' | 'roboto' | 'open-sans' | 'poppins'
  layout: 'single_page' | 'multi_page'
  features: {
    contact_form: boolean
    social_links: boolean
    analytics: boolean
    blog: boolean
  }
  custom_colors?: {
    primary: string
    secondary: string
    accent: string
  }
}

// Processing Job types
export interface ProcessingJob {
  id: string
  user_id: string
  job_type: 'cv_processing' | 'website_generation' | 'deployment'
  status: 'pending' | 'processing' | 'completed' | 'failed'
  input_data?: any
  output_data?: any
  error_message?: string
  started_at?: string
  completed_at?: string
  created_at: string
}

// API Response types
export interface APIResponse<T> {
  data?: T
  error?: {
    code: string
    message: string
    details?: any
  }
}

// Form types
export interface CVUploadForm {
  files: File[]
  options: {
    extract_images: boolean
    preserve_formatting: boolean
    language: 'auto' | 'en' | 'es' | 'fr' | 'de'
  }
}

export interface WebsiteGenerationForm {
  cv_data_id: string
  template: WebsiteConfig['template']
  customization: {
    color_scheme: WebsiteConfig['color_scheme']
    font_family: WebsiteConfig['font_family']
    layout: WebsiteConfig['layout']
  }
  features: WebsiteConfig['features']
}

// UI Component types
export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  children: React.ReactNode
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
  className?: string
}

export interface CardProps {
  title?: string
  description?: string
  children: React.ReactNode
  className?: string
  onClick?: () => void
  hover?: boolean
}

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

// Navigation types
export interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string | number
}

// Dashboard stats
export interface DashboardStats {
  total_cvs: number
  processed_cvs: number
  total_websites: number
  live_websites: number
  processing_jobs: number
  recent_activity: {
    type: 'cv_upload' | 'website_generated' | 'deployment'
    message: string
    timestamp: string
  }[]
} 