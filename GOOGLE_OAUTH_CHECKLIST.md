# Google OAuth Setup Checklist

Use this checklist to verify your Google OAuth configuration is working correctly.

## ✅ Google Cloud Console Setup

- [ ] Created a Google Cloud Project
- [ ] Enabled Google+ API (or Google Identity API)
- [ ] Created OAuth 2.0 Client ID
- [ ] Set application type to "Web application"
- [ ] Added authorized redirect URIs:
  - [ ] `https://your-project.supabase.co/auth/v1/callback`
  - [ ] `http://localhost:3000/auth/callback` (for development)
- [ ] Copied Client ID and Client Secret

## ✅ Supabase Configuration

- [ ] Went to Supabase Dashboard → Authentication → Providers
- [ ] Enabled Google provider
- [ ] Added Google Client ID
- [ ] Added Google Client Secret
- [ ] Saved the configuration

## ✅ Environment Variables

- [ ] Added to `.env.local`:
  ```bash
  NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
  GOOGLE_CLIENT_SECRET=your_google_client_secret
  ```

## ✅ Testing Steps

1. **Start your development server**:
   ```bash
   npm run dev
   ```

2. **Visit the test page**:
   ```
   http://localhost:3000/test-auth
   ```

3. **Try Google Sign-In**:
   - Click "Continue with Google"
   - Should redirect to Google OAuth
   - Should redirect back to your app
   - Should show user information

## 🔍 Troubleshooting

### Common Issues:

1. **"Invalid redirect URI" error**:
   - Check that your redirect URI in Google Cloud Console matches exactly
   - Make sure there are no trailing slashes
   - Verify the protocol (http vs https)

2. **"Client ID not found" error**:
   - Verify the Client ID is correct in Supabase
   - Check that the OAuth client is properly configured

3. **"Provider not enabled" error**:
   - Make sure Google provider is enabled in Supabase
   - Check that you've saved the configuration

4. **Redirect loop**:
   - Check your middleware configuration
   - Verify the callback route is working

### Debug Steps:

1. **Check browser console** for any JavaScript errors
2. **Check network tab** for failed requests
3. **Check Supabase logs** in the dashboard
4. **Verify environment variables** are loaded correctly

## 🧪 Test URLs

- **Test Page**: `http://localhost:3000/test-auth`
- **Login Page**: `http://localhost:3000/login`
- **Register Page**: `http://localhost:3000/register`

## 📝 Expected Behavior

When Google Sign-In is working correctly:

1. Click "Continue with Google" button
2. Redirect to Google OAuth consent screen
3. User authorizes the application
4. Redirect back to your app
5. User is automatically signed in
6. User information is displayed
7. User can sign out successfully

If any of these steps fail, check the troubleshooting section above. 