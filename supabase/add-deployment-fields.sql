-- Add deployment fields to websites table
ALTER TABLE websites 
ADD COLUMN deployment_id VARCHAR(255),
ADD COLUMN deployed_at TIMESTAMP WITH TIME ZONE;

-- Create index for deployment_id
CREATE INDEX idx_websites_deployment_id ON websites(deployment_id); 