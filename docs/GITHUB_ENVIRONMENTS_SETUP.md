# GitHub Environments Setup Guide

This guide explains how to set up GitHub Environments for managing deployment-specific secrets and protection rules.

## Why GitHub Environments?

GitHub Environments provide a better way to manage deployment secrets compared to repository-level secrets:

✅ **Separation of Concerns**: Production and Preview environments have different Firebase projects
✅ **Protection Rules**: Require approval before deploying to production
✅ **Clear Organization**: See which secrets apply to which environment
✅ **Security**: Limit which branches can deploy to production
✅ **Audit Trail**: Track who approved deployments and when

## Overview

You'll create **2 GitHub Environments**:

1. **Production** - Used for main branch deployments
2. **Preview** - Used for dev branch and PR deployments

Each environment will have its own set of Firebase secrets pointing to different Firebase projects.

---

## Step 1: Create GitHub Environments

### 1.1 Navigate to Environments

1. Go to your GitHub repository
2. Click **"Settings"** (repository settings)
3. In the left sidebar, click **"Environments"**
4. You should see an empty list or existing environments

### 1.2 Create Production Environment

1. Click **"New environment"**
2. Name: `Production` (exact name, case-sensitive)
3. Click **"Configure environment"**

**Configure Protection Rules:**

1. ✅ Check **"Required reviewers"**
   - Add yourself or team members who should approve production deployments
   - Minimum 1 reviewer recommended

2. ✅ Check **"Deployment branches and tags"**
   - Select **"Protected branches only"**
   - This ensures only the `main` branch can deploy to production

3. Click **"Save protection rules"** at the bottom

### 1.3 Create Preview Environment

1. Go back to Environments page
2. Click **"New environment"**
3. Name: `Preview` (exact name, case-sensitive)
4. Click **"Configure environment"**

**Configure Protection Rules:**

1. ❌ Do NOT require reviewers (we want automatic deployments for dev/PRs)
2. ✅ Check **"Deployment branches and tags"**
   - Select **"All branches"**
   - This allows dev branch and PR branches to deploy

3. Click **"Save protection rules"**

---

## Step 2: Add Secrets to Production Environment

### 2.1 Navigate to Production Secrets

1. In **Environments** page, click **"Production"**
2. Scroll down to **"Environment secrets"**
3. Click **"Add secret"**

### 2.2 Add Vercel Secrets (3 secrets)

Add these secrets to **Production** environment:

| Secret Name | Value Source |
|------------|--------------|
| `VERCEL_TOKEN` | From [Vercel Account Tokens](https://vercel.com/account/tokens) |
| `VERCEL_ORG_ID` | From `.vercel/project.json` or Vercel dashboard |
| `VERCEL_PROJECT_ID` | From `.vercel/project.json` or Vercel dashboard |

**Note**: See [GITHUB_SECRETS_SETUP.md](./GITHUB_SECRETS_SETUP.md) for detailed instructions on getting these values.

### 2.3 Add Production Firebase Secrets (7 secrets)

Add these secrets to **Production** environment using your **PRODUCTION Firebase project**:

| Secret Name | Value Source |
|------------|--------------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase Console → Production Project → Settings |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase Console → Production Project → Settings |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase Console → Production Project → Settings |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase Console → Production Project → Settings |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase Console → Production Project → Settings |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase Console → Production Project → Settings |
| `NEXT_PUBLIC_FIREBASE_CLOUD_FUNCTIONS_URL` | Firebase Console → Production Project → Functions |

**Important**: Use your **production** Firebase project values, not development!

### 2.4 Add Optional Sentry Secrets (if using Sentry)

| Secret Name | Value Source |
|------------|--------------|
| `SENTRY_AUTH_TOKEN` | Sentry Settings → Auth Tokens |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry Project Settings → Client Keys |

---

## Step 3: Add Secrets to Preview Environment

### 3.1 Navigate to Preview Secrets

1. In **Environments** page, click **"Preview"**
2. Scroll down to **"Environment secrets"**
3. Click **"Add secret"**

### 3.2 Add Vercel Secrets (3 secrets)

Add **the same Vercel secrets** to Preview environment:

| Secret Name | Value Source |
|------------|--------------|
| `VERCEL_TOKEN` | Same as Production |
| `VERCEL_ORG_ID` | Same as Production |
| `VERCEL_PROJECT_ID` | Same as Production |

**Note**: Vercel secrets are the same because it's the same Vercel project (different environments).

### 3.3 Add Development Firebase Secrets (7 secrets)

Add these secrets to **Preview** environment using your **DEVELOPMENT Firebase project**:

| Secret Name | Value Source |
|------------|--------------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase Console → **Development** Project → Settings |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase Console → **Development** Project → Settings |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase Console → **Development** Project → Settings |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase Console → **Development** Project → Settings |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase Console → **Development** Project → Settings |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase Console → **Development** Project → Settings |
| `NEXT_PUBLIC_FIREBASE_CLOUD_FUNCTIONS_URL` | Firebase Console → **Development** Project → Functions |

**Important**: Use your **development** Firebase project values, not production!

### 3.4 Add Optional Sentry Secrets (if using Sentry)

| Secret Name | Value Source |
|------------|--------------|
| `SENTRY_AUTH_TOKEN` | Same as Production |
| `NEXT_PUBLIC_SENTRY_DSN` | Use development Sentry project DSN (if separate) |

---

## Step 4: Verify Your Setup

### 4.1 Check Environment Configuration

**Production Environment:**
- ✅ Has 10 secrets (or 12 with Sentry)
- ✅ Requires reviewer approval
- ✅ Only allows main branch deployments
- ✅ Uses production Firebase project

**Preview Environment:**
- ✅ Has 10 secrets (or 12 with Sentry)
- ✅ Does NOT require approval (auto-deploy)
- ✅ Allows all branches
- ✅ Uses development Firebase project

### 4.2 Test Production Deployment

1. Make a small change to your code
2. Commit to a feature branch
3. Create a PR to `main`
4. Merge the PR
5. Go to **Actions** tab
6. You should see:
   - Quality checks run
   - Production deployment **waiting for approval**
7. Approve the deployment
8. Verify it deploys successfully

### 4.3 Test Preview Deployment

1. Make a change on `dev` branch
2. Push to `dev`
3. Go to **Actions** tab
4. You should see:
   - Quality checks run
   - Preview deployment **runs automatically** (no approval needed)
5. Verify it deploys successfully

### 4.4 Test PR Preview

1. Create a new branch from `main`
2. Make a change
3. Create a PR
4. Go to **Actions** tab
5. You should see:
   - Quality checks run
   - PR preview deployment **runs automatically**
   - PR comment appears with deployment URL
6. Verify the preview works

---

## How the Workflow Uses Environments

### Production Deployment (main branch)

```yaml
deploy-production:
  environment:
    name: Production  # ← Uses Production environment secrets
  if: github.ref == 'refs/heads/main'
```

- Triggers: Push to `main` branch
- Secrets: Production Firebase project
- Approval: **Required** (you set this up in protection rules)
- Result: Deploys to production Vercel with production Firebase

### Preview Deployment (dev branch)

```yaml
deploy-preview:
  environment:
    name: Preview  # ← Uses Preview environment secrets
  if: github.ref == 'refs/heads/dev'
```

- Triggers: Push to `dev` branch
- Secrets: Development Firebase project
- Approval: **Not required** (automatic)
- Result: Deploys to preview Vercel with development Firebase

### PR Preview Deployment

```yaml
deploy-pr-preview:
  environment:
    name: Preview  # ← Uses Preview environment secrets
  if: github.event_name == 'pull_request'
```

- Triggers: Pull request opened/updated
- Secrets: Development Firebase project
- Approval: **Not required** (automatic)
- Result: Deploys unique PR preview with development Firebase

---

## Firebase Project Setup

You need **2 separate Firebase projects**:

### Production Firebase Project

1. Create a new Firebase project: `budgetbyme-prod` (or your preferred name)
2. Enable Authentication
3. Create Firestore database
4. Deploy Cloud Functions
5. Set up production data
6. Configure authorized domains with your Vercel production URL

### Development Firebase Project

1. Create a new Firebase project: `budgetbyme-dev` (or your preferred name)
2. Enable Authentication
3. Create Firestore database
4. Deploy Cloud Functions
5. Use test data for development
6. Configure authorized domains with Vercel preview URLs

**Why separate projects?**
- ✅ Safe testing without affecting production data
- ✅ Can experiment with database structure changes
- ✅ Test Cloud Functions without breaking prod
- ✅ Development costs are isolated from production

---

## Common Mistakes to Avoid

❌ **Mixing up Firebase projects**
- Production environment should use production Firebase
- Preview environment should use development Firebase

❌ **Wrong environment names**
- Must be exactly `Production` and `Preview` (case-sensitive)
- Workflow references these exact names

❌ **Forgetting to add all secrets**
- Each environment needs ALL 10 secrets (or 12 with Sentry)
- Missing secrets will cause deployment failures

❌ **Not setting protection rules**
- Production should require approval
- Preview should allow auto-deploy

❌ **Using the same Firebase project for both**
- Defeats the purpose of environments
- Production and development should be separate

---

## Troubleshooting

### "Environment not found" error

**Problem**: GitHub Actions can't find the environment.

**Solution**:
- Verify environment name is exactly `Production` or `Preview`
- Check spelling and capitalization
- Environment must be created in repository settings

### "Required reviewers not met"

**Problem**: Production deployment is stuck waiting for approval.

**Solution**:
- Go to **Actions** tab
- Click the waiting deployment
- Click **"Review deployments"**
- Select the environment and click **"Approve and deploy"**

### Firebase auth fails on deployment

**Problem**: Firebase authentication not working on deployed app.

**Solution**:
- Verify correct Firebase project secrets in the environment
- Check Firebase Console → Authentication → Authorized domains
- Add your Vercel URLs:
  - Production: `your-app.vercel.app`
  - Preview: `your-app-*.vercel.app` (wildcard for PR previews)

### "Missing environment variable" error

**Problem**: Deployment fails with missing environment variable.

**Solution**:
- Check that ALL 10 required secrets are added to the environment
- Verify secret names match exactly (case-sensitive)
- Ensure no trailing spaces in secret values

### Secrets not updating

**Problem**: Changed a secret but deployment still uses old value.

**Solution**:
- Secret updates take effect immediately
- Clear Vercel build cache: `vercel --prod --force` (manual deploy)
- Trigger a new deployment to pick up new secrets

---

## Security Best Practices

### Environment Protection

🔒 **Production**:
- Always require reviewer approval
- Limit to protected branches only
- Set up branch protection rules on `main`
- Use long-lived Vercel tokens (but rotate annually)

🔓 **Preview**:
- No approval needed (for development speed)
- Allow all branches
- Can use same Vercel token as production
- Regularly audit preview deployments

### Secret Management

✅ **Do:**
- Use separate Firebase projects for prod/dev
- Rotate Vercel tokens every 6-12 months
- Audit who has access to approve production deployments
- Use environment-specific Sentry projects (if separate monitoring needed)
- Document which Firebase project is which

❌ **Don't:**
- Share production Firebase credentials with development environment
- Commit `.vercel/project.json` to Git
- Use the same database for prod and dev
- Give everyone production approval rights
- Use production API keys in Preview environment

---

## Quick Reference Checklist

### Production Environment Setup
- [ ] Environment created with name `Production`
- [ ] Required reviewers configured
- [ ] Deployment branches: Protected branches only
- [ ] 3 Vercel secrets added
- [ ] 7 Firebase secrets added (production project)
- [ ] Optional Sentry secrets (if using)
- [ ] Test deployment runs and requires approval

### Preview Environment Setup
- [ ] Environment created with name `Preview`
- [ ] No required reviewers (auto-deploy)
- [ ] Deployment branches: All branches
- [ ] 3 Vercel secrets added
- [ ] 7 Firebase secrets added (development project)
- [ ] Optional Sentry secrets (if using)
- [ ] Test dev branch deployment (auto)
- [ ] Test PR preview deployment (auto)

### Firebase Projects Setup
- [ ] Production Firebase project created
- [ ] Development Firebase project created
- [ ] Both projects have Auth enabled
- [ ] Both projects have Firestore database
- [ ] Both projects have Cloud Functions deployed
- [ ] Authorized domains configured on both
- [ ] Production uses real data
- [ ] Development uses test data

---

## Next Steps

After completing this setup:

1. ✅ Push to `dev` branch and verify automatic preview deployment
2. ✅ Create a test PR and verify PR preview deployment
3. ✅ Merge to `main` and verify production approval flow works
4. ✅ Test both deployed environments (production and preview)
5. ✅ Verify production uses production Firebase
6. ✅ Verify preview uses development Firebase
7. ✅ Add custom domain in Vercel (optional)
8. ✅ Update Firebase authorized domains with custom domain

---

## Related Documentation

- [GitHub Actions Deployment Guide](./GITHUB_ACTIONS_DEPLOYMENT.md)
- [GitHub Secrets Setup Guide](./GITHUB_SECRETS_SETUP.md)
- [GitHub Environments Documentation](https://docs.github.com/en/actions/deployment/targeting-different-environments/using-environments-for-deployment)
- [Vercel CLI Documentation](https://vercel.com/docs/cli)
- [Firebase Console](https://console.firebase.google.com/)
