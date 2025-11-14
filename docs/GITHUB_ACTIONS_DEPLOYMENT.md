# GitHub Actions Deployment to Vercel

This guide explains how to set up automatic deployments to Vercel using GitHub Actions with GitHub Environments.

## Overview

The workflow automatically:
- **Production Deployments**: Deploys to production when code is pushed to `main` branch (requires approval)
- **Preview Deployments**: Deploys to preview when code is pushed to `dev` branch (automatic)
- **PR Preview Deployments**: Creates preview deployments for pull requests (automatic)
- **CI Checks**: Runs linting, type checking, and tests before deployment
- **Environment Separation**: Production uses production Firebase, Preview uses development Firebase
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

### Step 2: Set Up GitHub Environments and Secrets

**This project uses GitHub Environments to separate production and development deployments.**

**Complete setup instructions:** See [GITHUB_ENVIRONMENTS_SETUP.md](./GITHUB_ENVIRONMENTS_SETUP.md)

**Quick summary:**
1. Create two GitHub Environments: **Production** and **Preview**
2. Configure protection rules (Production requires approval, Preview allows auto-deploy)
3. Add secrets to each environment

#### Required Secrets (add to BOTH environments):

**Vercel Secrets** (same for both environments):

| Secret Name | Description | Where to Find |
|------------|-------------|---------------|
| `VERCEL_TOKEN` | Vercel API token | [Vercel Account Tokens](https://vercel.com/account/tokens) |
| `VERCEL_ORG_ID` | Vercel organization ID | `.vercel/project.json` or Vercel dashboard |
| `VERCEL_PROJECT_ID` | Vercel project ID | `.vercel/project.json` or Vercel dashboard |

**Firebase Secrets** (different for each environment):

**Production Environment** uses production Firebase project:

| Secret Name | Value Source |
|------------|--------------|
| All 7 Firebase secrets | Production Firebase project in [Firebase Console](https://console.firebase.google.com/) |

**Preview Environment** uses development Firebase project:

| Secret Name | Value Source |
|------------|--------------|
| All 7 Firebase secrets | Development Firebase project in [Firebase Console](https://console.firebase.google.com/) |

See [GITHUB_SECRETS_SETUP.md](./GITHUB_SECRETS_SETUP.md) for detailed instructions on obtaining each value.

#### Optional Secrets:

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

2. **Production Deployment Job** (runs only if quality checks pass):
   - Uses **Production** GitHub Environment
   - **Requires approval** from designated reviewers
   - Uses production Firebase secrets
   - Deploys to Vercel production
   - Shows deployment URL in workflow summary

### What Happens on Push to Dev Branch

1. **Quality Checks Job:** Same as above

2. **Preview Deployment Job** (runs only if quality checks pass):
   - Uses **Preview** GitHub Environment
   - **Automatic deployment** (no approval needed)
   - Uses development Firebase secrets
   - Deploys to Vercel preview
   - Shows deployment URL in workflow summary

### What Happens on Pull Requests

1. **Quality Checks Job:** Same as above

2. **PR Preview Deployment Job** (runs only if quality checks pass):
   - Uses **Preview** GitHub Environment
   - **Automatic deployment** (no approval needed)
   - Uses development Firebase secrets
   - Creates unique preview URL for the PR
   - Adds comment to PR with deployment URL and build info
   - Updates automatically with new commits to the PR

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
- Verify all secrets are added to the correct **GitHub Environment** (not repository secrets)
- Check that **Production** environment has production Firebase secrets
- Check that **Preview** environment has development Firebase secrets
- Verify secret names match exactly (they're case-sensitive)
- Ensure secrets don't have trailing spaces
- See [GITHUB_ENVIRONMENTS_SETUP.md](./GITHUB_ENVIRONMENTS_SETUP.md) for verification steps

### "Project not found" Error

**Problem**: Vercel CLI can't find the project.

**Solution**:
- Verify `VERCEL_PROJECT_ID` and `VERCEL_ORG_ID` are correct
- Create the project in Vercel first (via dashboard or CLI)
- Re-run `vercel link` locally to get correct IDs

### Production Deployment Waiting for Approval

**Problem**: Production deployment is stuck on "Waiting for approval".

**Solution**:
1. This is expected behavior for production deployments
2. Go to **Actions** tab in GitHub
3. Click on the waiting workflow run
4. Click **"Review deployments"** button
5. Select **Production** environment
6. Click **"Approve and deploy"**
7. Deployment will proceed automatically

### Deployment Succeeds but App Doesn't Work

**Problem**: Firebase features not working on deployed app.

**Solution**:
1. Verify correct Firebase project secrets are in the right environment:
   - **Production** environment should use production Firebase
   - **Preview** environment should use development Firebase
2. Check Firebase Console → Authentication → Authorized domains
3. Add your Vercel URLs to authorized domains
4. Verify environment variables are pulling from the correct environment in the workflow

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

1. ✅ Set up GitHub Environments (see [GITHUB_ENVIRONMENTS_SETUP.md](./GITHUB_ENVIRONMENTS_SETUP.md))
2. ✅ Add secrets to Production and Preview environments (see [GITHUB_SECRETS_SETUP.md](./GITHUB_SECRETS_SETUP.md))
3. ✅ Create separate Firebase projects for production and development
4. ✅ Create Vercel project (see Step 3 above)
5. ✅ Push workflow to main branch
6. ✅ Approve and monitor first production deployment
7. ✅ Test automatic preview deployments on dev branch
8. ✅ Test PR preview deployments with a pull request
9. ✅ Verify production uses production Firebase data
10. ✅ Verify preview uses development Firebase data
11. ✅ Configure custom domain in Vercel (optional)
12. ✅ Update Firebase authorized domains with your Vercel URLs (both projects)

## References

- [GitHub Environments Setup Guide](./GITHUB_ENVIRONMENTS_SETUP.md) - Complete guide to setting up environments
- [GitHub Secrets Setup Guide](./GITHUB_SECRETS_SETUP.md) - How to obtain all secret values
- [GitHub Environments Documentation](https://docs.github.com/en/actions/deployment/targeting-different-environments/using-environments-for-deployment)
- [Vercel CLI Documentation](https://vercel.com/docs/cli)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [Firebase Console](https://console.firebase.google.com/)
