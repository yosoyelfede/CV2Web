-- CV2W Storage Bucket Policies
-- Run this after creating the cv-documents bucket in Supabase Storage

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can upload their own CV documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own CV documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own CV documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own CV documents" ON storage.objects;

-- Allow users to upload their own CV documents
CREATE POLICY "Users can upload their own CV documents" ON storage.objects
  FOR INSERT WITH CHECK ( 
    bucket_id = 'cv-documents' AND 
    auth.uid()::text = (storage.foldername(name))[1] 
  );

-- Allow users to view their own CV documents
CREATE POLICY "Users can view their own CV documents" ON storage.objects
  FOR SELECT USING ( 
    bucket_id = 'cv-documents' AND 
    auth.uid()::text = (storage.foldername(name))[1] 
  );

-- Allow users to update their own CV documents
CREATE POLICY "Users can update their own CV documents" ON storage.objects
  FOR UPDATE USING ( 
    bucket_id = 'cv-documents' AND 
    auth.uid()::text = (storage.foldername(name))[1] 
  );

-- Allow users to delete their own CV documents
CREATE POLICY "Users can delete their own CV documents" ON storage.objects
  FOR DELETE USING ( 
    bucket_id = 'cv-documents' AND 
    auth.uid()::text = (storage.foldername(name))[1] 
  ); 