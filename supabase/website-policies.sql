-- CV2W Website Table RLS Policies
-- Run this after creating the websites table in Supabase

-- Enable RLS on websites table
ALTER TABLE websites ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own websites" ON websites;
DROP POLICY IF EXISTS "Users can insert their own websites" ON websites;
DROP POLICY IF EXISTS "Users can update their own websites" ON websites;
DROP POLICY IF EXISTS "Users can delete their own websites" ON websites;

-- Allow users to view their own websites
CREATE POLICY "Users can view their own websites" ON websites
  FOR SELECT USING (
    auth.uid() = user_id
  );

-- Allow users to insert their own websites
CREATE POLICY "Users can insert their own websites" ON websites
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
  );

-- Allow users to update their own websites
CREATE POLICY "Users can update their own websites" ON websites
  FOR UPDATE USING (
    auth.uid() = user_id
  );

-- Allow users to delete their own websites
CREATE POLICY "Users can delete their own websites" ON websites
  FOR DELETE USING (
    auth.uid() = user_id
  ); 