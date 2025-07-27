// Environment variable validation
export function validateEnvironmentVariables() {
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'ANTHROPIC_API_KEY',
    'VERCEL_TOKEN'
  ]

  const missingVars: string[] = []

  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missingVars.push(varName)
    }
  }

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}`
    )
  }

  // Validate URL formats
  try {
    new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!)
  } catch {
    throw new Error('Invalid NEXT_PUBLIC_SUPABASE_URL format')
  }

  // Validate API key formats (basic checks)
  if (process.env.ANTHROPIC_API_KEY!.length < 20) {
    throw new Error('Invalid ANTHROPIC_API_KEY format')
  }

  if (process.env.VERCEL_TOKEN!.length < 20) {
    throw new Error('Invalid VERCEL_TOKEN format')
  }

  console.log('✅ All environment variables validated successfully')
}

// Run validation on module load
if (typeof window === 'undefined') {
  // Only run on server-side
  try {
    validateEnvironmentVariables()
  } catch (error) {
    console.error('❌ Environment validation failed:', error)
    process.exit(1)
  }
} 