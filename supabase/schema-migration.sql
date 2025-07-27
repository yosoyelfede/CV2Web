-- CV2W Schema Migration
-- This script updates existing tables to match the new schema

-- First, let's check what columns exist and add missing ones

-- Update cv_documents table
ALTER TABLE cv_documents 
ADD COLUMN IF NOT EXISTS processing_status VARCHAR(50) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS extracted_data JSONB,
ADD COLUMN IF NOT EXISTS processing_errors TEXT[],
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Update the status column to processing_status if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cv_documents' AND column_name = 'status') THEN
        UPDATE cv_documents SET processing_status = status WHERE processing_status = 'pending';
        ALTER TABLE cv_documents DROP COLUMN IF EXISTS status;
    END IF;
END $$;

-- Update file_name to original_filename if needed
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cv_documents' AND column_name = 'file_name') THEN
        ALTER TABLE cv_documents RENAME COLUMN file_name TO original_filename;
    END IF;
END $$;

-- Update file_type to mime_type if needed
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cv_documents' AND column_name = 'file_type') THEN
        ALTER TABLE cv_documents RENAME COLUMN file_type TO mime_type;
    END IF;
END $$;

-- Add constraint for processing_status
ALTER TABLE cv_documents 
DROP CONSTRAINT IF EXISTS cv_documents_processing_status_check;

ALTER TABLE cv_documents 
ADD CONSTRAINT cv_documents_processing_status_check 
CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed'));

-- Update websites table
ALTER TABLE websites 
ADD COLUMN IF NOT EXISTS deployment_status VARCHAR(50) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS website_config JSONB,
ADD COLUMN IF NOT EXISTS generated_code JSONB,
ADD COLUMN IF NOT EXISTS deployment_errors TEXT[],
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Update the status column to deployment_status if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'websites' AND column_name = 'status') THEN
        UPDATE websites SET deployment_status = status WHERE deployment_status = 'pending';
        ALTER TABLE websites DROP COLUMN IF EXISTS status;
    END IF;
END $$;

-- Add constraint for deployment_status
ALTER TABLE websites 
DROP CONSTRAINT IF EXISTS websites_deployment_status_check;

ALTER TABLE websites 
ADD CONSTRAINT websites_deployment_status_check 
CHECK (deployment_status IN ('pending', 'generating', 'deploying', 'live', 'failed'));

-- Create processing_jobs table if it doesn't exist
CREATE TABLE IF NOT EXISTS processing_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  job_type VARCHAR(50) NOT NULL CHECK (job_type IN ('cv_processing', 'website_generation', 'deployment')),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  input_data JSONB,
  output_data JSONB,
  error_message TEXT,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create cv_data table if it doesn't exist
CREATE TABLE IF NOT EXISTS cv_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cv_document_id UUID REFERENCES cv_documents(id) ON DELETE CASCADE,
  personal_info JSONB NOT NULL,
  experience JSONB[] NOT NULL DEFAULT '{}',
  education JSONB[] NOT NULL DEFAULT '{}',
  skills JSONB NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_cv_documents_user_id ON cv_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_cv_documents_status ON cv_documents(processing_status);
CREATE INDEX IF NOT EXISTS idx_cv_data_document_id ON cv_data(cv_document_id);
CREATE INDEX IF NOT EXISTS idx_websites_user_id ON websites(user_id);
CREATE INDEX IF NOT EXISTS idx_websites_status ON websites(deployment_status);
CREATE INDEX IF NOT EXISTS idx_processing_jobs_user_id ON processing_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_processing_jobs_status ON processing_jobs(status);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_cv_documents_updated_at ON cv_documents;
DROP TRIGGER IF EXISTS update_cv_data_updated_at ON cv_data;
DROP TRIGGER IF EXISTS update_websites_updated_at ON websites;

CREATE TRIGGER update_cv_documents_updated_at BEFORE UPDATE ON cv_documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cv_data_updated_at BEFORE UPDATE ON cv_data FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_websites_updated_at BEFORE UPDATE ON websites FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 

-- Migration to add missing columns

-- Add updated_at column to processing_jobs table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'processing_jobs' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE processing_jobs ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Create trigger for processing_jobs updated_at if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'update_processing_jobs_updated_at'
    ) THEN
        CREATE TRIGGER update_processing_jobs_updated_at 
        BEFORE UPDATE ON processing_jobs 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$; 