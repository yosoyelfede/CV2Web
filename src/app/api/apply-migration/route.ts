import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin (you can modify this check as needed)
    // For now, we'll allow any authenticated user to run migrations
    // In production, you should restrict this to admin users only

    // Migration SQL to add cv_data_id column
    const migrationSQL = `
      -- Add cv_data_id column to websites table if it doesn't exist
      DO $$ 
      BEGIN
          IF NOT EXISTS (
              SELECT 1 FROM information_schema.columns 
              WHERE table_name = 'websites' 
              AND column_name = 'cv_data_id'
          ) THEN
              ALTER TABLE websites ADD COLUMN cv_data_id UUID REFERENCES cv_data(id) ON DELETE CASCADE;
          END IF;
      END $$;

      -- Add index for cv_data_id if it doesn't exist
      DO $$
      BEGIN
          IF NOT EXISTS (
              SELECT 1 FROM pg_indexes 
              WHERE tablename = 'websites' 
              AND indexname = 'idx_websites_cv_data_id'
          ) THEN
              CREATE INDEX idx_websites_cv_data_id ON websites(cv_data_id);
          END IF;
      END $$;
    `

    // Execute the migration using rpc (if available) or direct SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql: migrationSQL })
    
    if (error) {
      console.error('Migration error:', error)
      
      // If rpc doesn't work, try a different approach
      // Test if the column exists now
      const { data: testData, error: testError } = await supabase
        .from('websites')
        .select('id, cv_data_id')
        .limit(1)
      
      if (testError && testError.message.includes('cv_data_id does not exist')) {
        return NextResponse.json(
          { error: 'Migration failed. Please apply the schema manually in Supabase dashboard.' },
          { status: 500 }
        )
      }
    }

    // Test the migration
    const { data: testData, error: testError } = await supabase
      .from('websites')
      .select('id, cv_data_id')
      .limit(1)

    if (testError) {
      return NextResponse.json(
        { error: `Migration test failed: ${testError.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Migration applied successfully',
      testResult: testData
    })

  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json(
      { error: `Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}` },
 