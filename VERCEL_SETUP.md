# Vercel Setup Guide for CV2W

This guide explains how to obtain and configure Vercel tokens and team IDs for the CV2W project's website deployment feature.

## Do You Need Vercel Token and Team ID?

**Short Answer**: Yes, if you want to use the website deployment feature (Phase 4).

**When You Need Them**:
- ✅ If you want users to be able to deploy their generated websites to Vercel
- ✅ If you want to manage deployments programmatically
- ❌ If you're only using the CV processing and preview features

## How to Get Vercel Token

### Method 1: Using Vercel CLI (Recommended)

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Create a Token**:
   ```bash
   vercel tokens create
   ```

4. **Follow the prompts**:
   - Give your token a name (e.g., "CV2W Deployment Token")
   - Choose the scope (select "Full Account" for full access)
   - Copy the generated token

### Method 2: Using Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on your profile picture → Settings
3. Go to "Tokens" tab
4. Click "Create Token"
5. Give it a name and select scope
6. Copy the generated token

## How to Get Team ID

### For Personal Account
If you're not using a team, you can skip the team ID. The deployment will use your personal account.

### For Team Account

1. **Using Vercel CLI**:
   ```bash
   vercel teams ls
   ```
   This will show your team ID in the format: `team_xxxxxxxxxxxxxxxx`

2. **Using Vercel Dashboard**:
   - Go to your team dashboard
   - The team ID is in the URL: `https://vercel.com/teams/[team-name]/[team-id]`
   - Or go to Team Settings → General → Team ID

3. **Using API**:
   ```bash
   curl -H "Authorization: Bearer YOUR_TOKEN" https://api.vercel.com/v1/teams
   ```

## Environment Variables Setup

Add these to your `.env.local` file:

```bash
# Vercel Configuration
VERCEL_TOKEN=your_vercel_token_here
VERCEL_TEAM_ID=team_xxxxxxxxxxxxxxxx  # Optional: only if using a team
```

## Security Best Practices

1. **Never commit tokens to version control**
2. **Use environment variables** (already configured in the project)
3. **Rotate tokens regularly**
4. **Use minimal required permissions**
5. **Monitor token usage**

## Token Scopes

Choose the appropriate scope for your token:

- **Full Account**: Full access to all resources (use for development)
- **Deployments**: Can only create and manage deployments (recommended for production)
- **Read Only**: Can only read resources (not suitable for deployments)

## Troubleshooting

### Common Issues

1. **"Invalid token" error**:
   - Check if the token is correct
   - Ensure the token hasn't expired
   - Verify the token has the right permissions

2. **"Team not found" error**:
   - Verify the team ID is correct
   - Ensure you're a member of the team
   - Check if the team ID format is correct (`team_xxxxxxxxxxxxxxxx`)

3. **"Permission denied" error**:
   - Check if the token has the right scope
   - Verify team membership and permissions
   - Ensure the project exists in the specified team

### Testing Your Setup

You can test your Vercel configuration by running:

```bash
# Test token validity
curl -H "Authorization: Bearer YOUR_TOKEN" https://api.vercel.com/v1/user

# Test team access (if using team)
curl -H "Authorization: Bearer YOUR_TOKEN" https://api.vercel.com/v1/teams/YOUR_TEAM_ID
```

## Alternative: Using Vercel CLI for Deployments

If you prefer not to use the API tokens, you can also use Vercel CLI directly:

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy a project
vercel --prod
```

However, this approach requires manual intervention and won't work with the automated deployment feature in CV2W.

## Next Steps

Once you have your Vercel token and team ID configured:

1. Add them to your `.env.local` file
2. Restart your development server
3. Test the website deployment feature
4. Monitor deployments in your Vercel dashboard

## Support

If you encounter issues:

1. Check the [Vercel API Documentation](https://vercel.com/docs/rest-api)
2. Review the [Vercel CLI Documentation](https://vercel.com/docs/cli)
3. Check the project's error logs
4. Verify your environment variables are correctly set 