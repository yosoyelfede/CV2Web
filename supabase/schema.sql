-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (handled by Supabase Auth)
-- We'll reference auth.users for user data

-- CV Documents table
CREATE TABLE cv_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  original_filename VARCHAR(255) NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  processing_status VARCHAR(50) DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
  extracted_data JSONB,
  processing_errors TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CV Data table
CREATE TABLE cv_data (
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

-- Websites table
CREATE TABLE websites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  cv_data_id UUID REFERENCES cv_data(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  domain VARCHAR(255),
  deployment_url TEXT,
  deployment_status VARCHAR(50) DEFAULT 'pending' CHECK (deployment_status IN ('pending', 'generating', 'deploying', 'live', 'failed')),
  website_config JSONB NOT NULL,
  generated_code JSONB,
  deployment_errors TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Processing Jobs table
CREATE TABLE processing_jobs (
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

-- Create indexes for better performance
CREATE INDEX idx_cv_documents_user_id ON cv_documents(user_id);
CREATE INDEX idx_cv_documents_status ON cv_documents(processing_status);
CREATE INDEX idx_cv_data_document_id ON cv_data(cv_document_id);
CREATE INDEX idx_websites_user_id ON websites(user_id);
CREATE INDEX idx_websites_status ON websites(deployment_status);
CREATE INDEX idx_processing_jobs_user_id ON processing_jobs(user_id);
CREATE INDEX idx_processing_jobs_status ON processing_jobs(status);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_cv_documents_updated_at BEFORE UPDATE ON cv_documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cv_data_updated_at BEFORE UPDATE ON cv_data FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_websites_updated_at BEFORE UPDATE ON websites FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE cv_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE cv_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE websites ENABLE ROW LEVEL SECURITY;
ALTER TABLE processing_jobs ENABLE ROW LEVEL SECURITY;

-- CV Documents policies
CREATE POLICY "Users can view their own CV documents" ON cv_documents
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own CV documents" ON cv_documents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own CV documents" ON cv_documents
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own CV documents" ON cv_documents
  FOR DELETE USING (auth.uid() = user_id);

-- CV Data policies
CREATE POLICY "Users can view their own CV data" ON cv_data
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM cv_documents 
      WHERE cv_documents.id = cv_data.cv_document_id 
      AND cv_documents.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert CV data for their documents" ON cv_data
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM cv_documents 
      WHERE cv_documents.id = cv_data.cv_document_id 
      AND cv_documents.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own CV data" ON cv_data
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM cv_documents 
      WHERE cv_documents.id = cv_data.cv_document_id 
      AND cv_documents.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own CV data" ON cv_data
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM cv_documents 
      WHERE cv_documents.id = cv_data.cv_document_id 
      AND cv_documents.user_id = auth.uid()
    )
  );

-- Websites policies
CREATE POLICY "Users can view their own websites" ON websites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own websites" ON websites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own websites" ON websites
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own websites" ON websites
  FOR DELETE USING (auth.uid() = user_id);

-- Processing Jobs policies
CREATE POLICY "Users can view their own processing jobs" ON processing_jobs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own processing jobs" ON processing_jobs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own processing jobs" ON processing_jobs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own processing jobs" ON processing_jobs
  FOR DELETE USING (auth.uid() = user_id); 