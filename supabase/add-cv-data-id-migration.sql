-- Migration to add cv_data_id column to websites table
-- This fixes the "column websites.cv_data_id does not exist" error

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

-- Update RLS policies to include cv_data_id relationship
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own websites" ON websites;
DROP POLICY IF EXISTS "Users can insert their own websites" ON websites;
DROP POLICY IF EXISTS "Users can update their own websites" ON websites;
DROP POLICY IF EXISTS "Users can delete their own websites" ON websites;

-- Recreate policies with cv_data_id relationship
CREATE POLICY "Users can view their own websites" ON websites
  FOR SELECT USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM cv_data 
      JOIN cv_documents ON cv_data.cv_document_id = cv_documents.id
      WHERE cv_data.id = websites.cv_data_id 
      AND cv_documents.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own websites" ON websites
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM cv_data 
      JOIN cv_documents ON cv_data.cv_document_id = cv_documents.id
      WHERE cv_data.id = websites.cv_data_id 
      AND cv_documents.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own websites" ON websites
  FOR UPDATE USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM cv_data 
      JOIN cv_documents ON cv_data.cv_document_id = cv_documents.id
      WHERE cv_data.id = websites.cv_data_id 
      AND cv_documents.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own websites" ON websites
  FOR DELETE USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM cv_data 
      JOIN cv_documents ON cv_data.cv_document_id = cv_documents.id
      WHERE cv_data.id = websites.cv_data_id 
      AND cv_documents.user_id = auth.uid()
    )
  ); 