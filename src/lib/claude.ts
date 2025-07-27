import Anthropic from '@anthropic-ai/sdk'

if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error('ANTHROPIC_API_KEY environment variable is required')
}

export const claude = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export const CLAUDE_MODEL = 'claude-3-5-sonnet-20241022'

// Helper function to create a system prompt
export function createSystemPrompt(context: string): string {
  return `You are an expert CV parser and website generator. Your task is to ${context}.

Key requirements:
- Always respond with valid JSON
- Be precise and accurate in data extraction
- Follow the exact schema provided
- Handle edge cases gracefully
- Provide clear error messages if data is unclear

Current context: ${context}`
}

// Helper function to create a user prompt
export function createUserPrompt(content: string, instructions: string): string {
  return `${instructions}

CV Content:
${content}

Please process this CV and respond with the requested format.`
}

// Retry configuration
export const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
}

// Helper function for exponential backoff
export function calculateDelay(attempt: number): number {
  const delay = RETRY_CONFIG.baseDelay * Math.pow(2, attempt - 1)
  return Math.min(delay, RETRY_CONFIG.maxDelay)
} 