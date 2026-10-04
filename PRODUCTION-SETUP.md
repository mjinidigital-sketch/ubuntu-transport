# Production Setup Guide - Fix InvalidSecret Error

## Issue: InvalidSecret Error in Production

This error occurs when Convex authentication secrets are not properly configured in your production environment.

## Required Environment Variables

You need to set these environment variables in your production environment (Vercel, Netlify, or your hosting platform):

### 1. Convex Deployment URL
```
CONVEX_DEPLOYMENT=https://your-project-name.convex.cloud
```
- Get this from your Convex dashboard: https://dashboard.convex.dev
- Replace `your-project-name` with your actual project name

### 2. Convex Auth Secret
```
CONVEX_AUTH_SECRET=your-random-secret-string
```
- Generate a secure random string (at least 32 characters)
- This is used to sign authentication tokens
- Example: `openssl rand -base64 32` (on Mac/Linux) or use a password generator

### 3. Convex Site URL (Optional but Recommended)
```
CONVEX_SITE_URL=https://your-production-domain.com
```
- Your production domain
- Used for OAuth callbacks and email verification links

## How to Set Environment Variables

### Vercel
1. Go to your project dashboard on Vercel
2. Navigate to **Settings → Environment Variables**
3. Add the variables above:
   - Name: `CONVEX_DEPLOYMENT`
   - Value: `https://your-project-name.convex.cloud`
   - Repeat for other variables
4. Redeploy your application

### Netlify
1. Go to **Site Settings → Environment Variables**
2. Add each variable
3. Redeploy

### Docker/Kubernetes
Add to your deployment configuration:
```yaml
env:
  - name: CONVEX_DEPLOYMENT
    value: "https://your-project-name.convex.cloud"
  - name: CONVEX_AUTH_SECRET
    value: "your-random-secret-string"
  - name: CONVEX_SITE_URL
    value: "https://your-production-domain.com"
```

### Next.js (env.local)
For local development, add to `.env.local`:
```env
CONVEX_DEPLOYMENT=https://your-project-name.convex.cloud
CONVEX_AUTH_SECRET=your-random-secret-string
CONVEX_SITE_URL=http://localhost:3000
```

## Step-by-Step Fix

### Step 1: Get Your Convex Deployment URL
1. Go to https://dashboard.convex.dev
2. Select your project
3. Copy the deployment URL from the dashboard
4. It should look like: `https://purple-sloth-123.convex.cloud`

### Step 2: Generate Auth Secret
Run this command to generate a secure secret:
```bash
# On Mac/Linux
openssl rand -base64 32

# On Windows (PowerShell)
[System.Web.Security.Membership]::GeneratePassword(32, 5)

# Or use any random string generator (32+ characters)
```

### Step 3: Add to Production Environment
Add both variables to your hosting platform's environment variables.

### Step 4: Redeploy
Push changes and redeploy your application.

## Verification

After deployment, check:
1. Browser console for errors
2. Network tab for failed Convex requests
3. Environment variables are set correctly in your hosting dashboard

## Common Issues

### Issue: Still getting InvalidSecret after setting variables
**Solution:**
- Ensure variables are set in the correct environment (production, not preview)
- Clear browser cache and hard refresh
- Check for typos in variable names
- Verify the deployment URL is correct

### Issue: Convex connection timeout
**Solution:**
- Check if Convex is accessible from your production server
- Verify network/firewall settings
- Ensure you're using the correct deployment URL

### Issue: Auth not working in production
**Solution:**
- Ensure `CONVEX_AUTH_SECRET` is the same in both Convex and your app
- Check Convex dashboard for auth configuration
- Verify OAuth redirect URLs match your production domain

## Additional Resources

- Convex Environment Variables: https://docs.convex.dev/production/hosting
- Convex Auth Setup: https://docs.convex.dev/auth/overview
- Deployment Guide: https://docs.convex.dev/production/deploying
