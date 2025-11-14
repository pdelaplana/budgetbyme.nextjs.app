# GitHub Actions Deployment to Vercel

This guide explains how to set up automatic deployments to Vercel using GitHub Actions.

## Overview

The workflow automatically:
- **Production Deployments**: Deploys to production when code is pushed to `main` branch
- **Preview Deployments**: Creates preview deployments for pull requests
- **CI Checks**: Runs linting, type checking, and builds before deployment
- **PR Comments**: Adds deployment status comments to pull requests

## Setup Instructions

### Step 1: Get Vercel Credentials

#### 1.1 Get Vercel Token

1. Go to [Vercel Account Settings](https://vercel.com/account/tokens)
2. Click **"Create Token"**
3. Name it: `GitHub Actions`
4. Set scope: **Full Account**
5. Click **"Create"** and copy the token

#### 1.2 Get Vercel Project ID and Org ID

**Option A: From Vercel Dashboard**
1. Go to your project in Vercel
2. Navigate to **Settings** → **General**
3. Scroll down to find:
   - **Project ID**
   - **Organization ID** (in the URL: `vercel.com/[org-id]/[project-name]`)

**Option B: Using Vercel CLI**
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Link your project (run in project directory)
vercel link

# This creates .vercel/project.json with your IDs
cat .vercel/project.json
```

The `.vercel/project.json` file contains:
```json
{
  "orgId": "your-org-id",
  "projectId": "your-project-id"
}
```

**Important**: Add `.vercel` to your `.gitignore` file:
```bash
echo ".vercel" >> .gitignore
```

### Step 2: Add GitHub Secrets

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"**
4. Add the following secrets:

#### Required Vercel Secrets:

| Secret Name | Description | Where to Find |
|------------|-------------|---------------|
| `VERCEL_TOKEN` | Vercel API token | [Vercel Account Tokens](https://vercel.com/account/tokens) |
| `VERCEL_ORG_ID` | Vercel organization ID | `.vercel/project.json` or Vercel dashboard |
| `VERCEL_PROJECT_ID` | Vercel project ID | `.vercel/project.json` or Vercel dashboard |

#### Required Application Secrets (Firebase):

| Secret Name | Description | Where to Find |
|------------|-------------|---------------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase API key | [Firebase Console](https://console.firebase.google.com/) → Project Settings → General |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase Auth domain | Firebase Console → Project Settings → General |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID | Firebase Console → Project Settings → General |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase Storage bucket | Firebase Console → Project Settings → General |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID | Firebase Console → Project Settings → General → Cloud Messaging |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase app ID | Firebase Console → Project Settings → General |
| `NEXT_PUBLIC_FIREBASE_CLOUD_FUNCTIONS_URL` | Firebase Cloud Functions URL | Firebase Console → Functions (your deployed function URL) |

#### Optional Secrets (if you use them):

| Secret Name | Description |
|------------|-------------|
| `SENTRY_AUTH_TOKEN` | Sentry authentication token for source map uploads |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry DSN for runtime error tracking |

### Step 3: Configure Vercel Project

Before the GitHub Action can deploy, you need to create the project in Vercel:

**Option A: Via Vercel Dashboard**
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New"** → **"Project"**
3. Import your GitHub repository
4. Configure settings but **DO NOT** enable automatic deployments from Vercel
   - Go to **Settings** → **Git** → Disable **"Production Branch"** auto-deploy
   - This prevents duplicate deployments (one from Vercel, one from GitHub Actions)

**Option B: Via Vercel CLI**
```bash
vercel link
```

### Step 4: Commit and Push

```bash
git add .github/workflows/vercel-deploy.yml
git commit -m "Add GitHub Actions workflow for Vercel deployment"
git push origin main
```

## Workflow Details

### What Happens on Push to Main

1. **Quality Checks Job:**
   - Checkout code
   - Setup Node.js 20.x
   - Install dependencies
   - Run ESLint (`npm run lint`)
   - Run TypeScript type checking (`npx tsc --noEmit`)
   - Run Biome checks (`npm run biome:check`)
   - Run Vitest tests (`npm test`)

2. **Deploy Job** (runs only if quality checks pass):
   - Checkout code
   - Setup Node.js 20.x
   - Install dependencies
   - Install Vercel CLI
   - Pull Vercel environment configuration (production)
   - Build production artifacts with Vercel
   - Deploy to production

### What Happens on Push to Dev Branch

1. Same quality checks as main branch
2. Deploy to preview environment (not production)

### What Happens on Pull Requests

1. Same quality checks as above
2. Build preview artifacts
3. Deploy to unique PR preview environment
4. Add comment to PR with deployment URL and status

## Monitoring Deployments

### View GitHub Actions

1. Go to your GitHub repository
2. Click **"Actions"** tab
3. View workflow runs and logs

### View Vercel Deployments

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. View all deployments (production and preview)

## Troubleshooting

### Build Fails with "Missing Secrets"

**Problem**: GitHub Actions can't access environment variables.

**Solution**:
- Verify all secrets are added in GitHub Settings → Secrets
- Check secret names match exactly (they're case-sensitive)
- Ensure secrets don't have trailing spaces

### "Project not found" Error

**Problem**: Vercel CLI can't find the project.

**Solution**:
- Verify `VERCEL_PROJECT_ID` and `VERCEL_ORG_ID` are correct
- Create the project in Vercel first (via dashboard or CLI)
- Re-run `vercel link` locally to get correct IDs

### Deployment Succeeds but App Doesn't Work

**Problem**: Environment variables not set in Vercel.

**Solution**:
1. Go to Vercel Dashboard → Your Project → **Settings** → **Environment Variables**
2. Add the same environment variables as GitHub secrets
3. Set them for: **Production**, **Preview**, and **Development**
4. Redeploy

### Duplicate Deployments

**Problem**: Both Vercel and GitHub Actions are deploying.

**Solution**:
1. Go to Vercel Dashboard → **Settings** → **Git**
2. Disable automatic deployments from Vercel
3. Only use GitHub Actions for deployments

### Firebase Authentication Issues

**Problem**: Firebase auth fails on deployed app.

**Solution**:
1. Go to Firebase Console → **Authentication** → **Settings** → **Authorized domains**
2. Add your Vercel deployment URLs:
   - `your-project.vercel.app`
   - `your-project-preview.vercel.app` (for preview deployments)
   - Any custom domains
3. Redeploy or wait for Firebase to propagate changes (usually instant)

### Missing Firebase Environment Variables

**Problem**: Firebase features don't work on deployment.

**Solution**:
1. Verify all 7 Firebase environment variables are set in GitHub Secrets
2. Double-check variable names match exactly (case-sensitive)
3. Ensure no trailing spaces in values
4. Also add them in Vercel Dashboard → **Settings** → **Environment Variables**
5. Set for all environments: **Production**, **Preview**, **Development**

## Advanced Configuration

### Deploy Only on Specific Paths

Modify `.github/workflows/vercel-deploy.yml`:

```yaml
on:
  push:
    branches:
      - main
    paths:
      - 'app/**'
      - 'components/**'
      - 'lib/**'
      - 'package.json'
```

### Add Slack Notifications

Add this step to the workflow:

```yaml
- name: Notify Slack
  if: always()
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    text: 'Deployment ${{ job.status }}'
  env:
    SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

### Run Tests Before Deploy

Add this step after "Install dependencies":

```yaml
- name: Run tests
  run: npm test
```

## Security Notes

- Never commit `.vercel/project.json` to Git
- Store all sensitive values in GitHub Secrets
- Use environment-specific secrets (dev, staging, prod)
- Rotate Vercel tokens periodically
- Use service accounts for production deployments

## Next Steps

1. ✅ Set up GitHub secrets (see Step 2 above)
2. ✅ Create Vercel project (see Step 3 above)
3. ✅ Push workflow to main branch
4. ✅ Monitor first deployment in GitHub Actions
5. ✅ Test preview deployments with a PR
6. ✅ Configure custom domain in Vercel (optional)
7. ✅ Update Firebase authorized domains with your Vercel URLs

## References

- [Vercel CLI Documentation](https://vercel.com/docs/cli)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
