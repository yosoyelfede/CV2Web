-- CV2W CV Data Table RLS Policies
-- Run this after creating the cv_data table in Supabase

-- Enable RLS on cv_data table
ALTER TABLE cv_data ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own CV data" ON cv_data;
DROP POLICY IF EXISTS "Users can insert their own CV data" ON cv_data;
DROP POLICY IF EXISTS "Users can update their own CV data" ON cv_data;
DROP POLICY IF EXISTS "Users can delete their own CV data" ON cv_data;

-- Allow users to view their own CV data
CREATE POLICY "Users can view their own CV data" ON cv_data
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM cv_documents 
      WHERE cv_documents.id = cv_data.cv_document_id 
      AND cv_documents.user_id = auth.uid()
    )
  );

-- Allow users to insert their own CV data
CREATE POLICY "Users can insert their own CV data" ON cv_data
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM cv_documents 
      WHERE cv_documents.id = cv_data.cv_document_id 
      AND cv_documents.user_id = auth.uid()
    )
  );

-- Allow users to update their own CV data
CREATE POLICY "Users can update their own CV data" ON cv_data
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM cv_documents 
      WHERE cv_documents.id = cv_data.cv_document_id 
      AND cv_documents.user_id = auth.uid()
    )
  );

-- Allow users to delete their own CV data
CREATE POLICY "Users can delete their own CV data" ON cv_data
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM cv_documents 
      WHERE cv_documents.id = cv_data.cv_document_id 
      AND cv_documents.user_id = auth.uid()
    )
  ); 