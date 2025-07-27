# CV2W Setup Guide

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Anthropic API Configuration
ANTHROPIC_API_KEY=your_anthropic_api_key

# Optional: Vercel Configuration (for Phase 4)
VERCEL_TOKEN=your_vercel_token
VERCEL_TEAM_ID=your_vercel_team_id
```

## Database Setup

1. Create a Supabase project at https://supabase.com
2. Go to the SQL Editor in your Supabase dashboard
3. Run the SQL commands from `supabase/schema-complete.sql` (this handles existing tables)
4. Create a storage bucket named `cv-documents` with the following settings:
   - Public bucket: false
   - File size limit: 10MB
   - Allowed MIME types: application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document, text/plain
5. Run the storage policies from `supabase/storage-policies.sql`

## Storage Bucket Setup

In your Supabase dashboard:

1. Go to Storage
2. Create a new bucket called `cv-documents`
3. Set it as private (not public)
4. Run the storage policies from `supabase/storage-policies.sql` in the SQL Editor

## API Keys Setup

### Anthropic API Key
1. Go to https://console.anthropic.com
2. Create an account and get your API key
3. Add it to your `.env.local` file

### Supabase Keys
1. In your Supabase project dashboard
2. Go to Settings > API
3. Copy the Project URL and anon public key
4. Add them to your `.env.local` file

## Development

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open http://localhost:3000

## Current Status

✅ **Phase 1 Complete**: Backend Foundation
- Database schema implemented
- API routes created
- Claude integration working
- CV upload and processing pipeline

🔄 **Next**: Phase 2 - CV Processing Pipeline
- Enhanced file processing (PDF/DOCX)
- Real-time status updates
- Processing optimization

## Testing

You can test the application by:
1. Creating an account
2. Uploading a CV file (TXT format for now)
3. Checking the processing status
4. Viewing the extracted data

## Troubleshooting

### Common Issues

1. **Database connection errors**: Check your Supabase URL and keys
2. **File upload errors**: Ensure the storage bucket is created and RLS policies are set
3. **Claude API errors**: Verify your Anthropic API key is valid
4. **Authentication errors**: Check that Supabase Auth is properly configured

### Logs

Check the browser console and server logs for detailed error messages. 