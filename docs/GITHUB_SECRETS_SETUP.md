# GitHub Secrets Setup Guide

This guide provides step-by-step instructions for setting up all required GitHub secrets for Vercel deployment with Firebase.

## ⚠️ IMPORTANT: Using GitHub Environments

**This project uses GitHub Environments to manage deployment secrets.**

Instead of adding secrets at the repository level, you'll add them to **two separate environments**:
- **Production** environment (for main branch deployments)
- **Preview** environment (for dev branch and PR deployments)

**For complete setup instructions, see [GITHUB_ENVIRONMENTS_SETUP.md](./GITHUB_ENVIRONMENTS_SETUP.md)**

This guide explains **how to GET the secret values**. The companion guide explains **where to ADD them**.

## Overview

You need to configure **10 required secrets** (+ 2 optional) for each GitHub Environment to enable automated deployments to Vercel.

**Required Secrets (10):**
- 3 Vercel deployment secrets
- 7 Firebase configuration secrets

**Optional Secrets (2):**
- Sentry error tracking (if using Sentry)

---

## Part 1: Vercel Secrets (3 secrets)

### Secret 1: VERCEL_TOKEN

**What it is:** Authentication token that allows GitHub Actions to deploy to your Vercel account.

**How to get it:**

1. Go to [Vercel Account Settings → Tokens](https://vercel.com/account/tokens)
2. Click **"Create Token"**
3. Configure the token:
   - **Name:** `GitHub Actions` (or any descriptive name)
   - **Scope:** Select **"Full Account"**
   - **Expiration:** Choose based on your security policy (we recommend 1 year)
4. Click **"Create"**
5. **Copy the token immediately** (you won't see it again!)

**Value example:** `v3rC3L_t0k3N_3x4mPl3...` (random string)

---

### Secret 2: VERCEL_ORG_ID

**What it is:** Your Vercel organization/team ID.

**How to get it:**

**Option A: Using Vercel CLI (Recommended)**

```bash
# Install Vercel CLI globally
npm install -g vercel@latest

# Login to Vercel
vercel login

# Navigate to your project directory
cd /path/to/your/project

# Link your project to Vercel
vercel link

# View the generated project configuration
cat .vercel/project.json
```

The `.vercel/project.json` file will contain:
```json
{
  "orgId": "team_abc123xyz",
  "projectId": "prj_def456uvw"
}
```

Copy the `orgId` value.

**Option B: From Vercel Dashboard**

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Look at the URL when viewing your project:
   ```
   https://vercel.com/[THIS-IS-YOUR-ORG-ID]/[project-name]
   ```
3. The org ID is the part after `vercel.com/` and before your project name

**Value example:** `team_abc123xyz` or `your-username`

---

### Secret 3: VERCEL_PROJECT_ID

**What it is:** Unique identifier for your specific Vercel project.

**How to get it:**

**Option A: From .vercel/project.json (Recommended)**

After running `vercel link` (see Secret 2), the `projectId` is in the same file:

```json
{
  "orgId": "team_abc123xyz",
  "projectId": "prj_def456uvw"
}
```

Copy the `projectId` value.

**Option B: From Vercel Dashboard**

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **General**
4. Scroll down to find **Project ID**
5. Click **"Copy"**

**Value example:** `prj_def456uvw`

---

## Part 2: Firebase Secrets (7 secrets)

All Firebase configuration values can be found in the Firebase Console.

### Where to find Firebase config values:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click the ⚙️ **gear icon** → **Project settings**
4. Scroll down to **"Your apps"** section
5. Find your web app (or create one if you haven't)
6. Click **"Config"** to view the configuration object

You'll see something like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC...example",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

---

### Secret 4: NEXT_PUBLIC_FIREBASE_API_KEY

**What it is:** Firebase API key for web client authentication.

**Where to find:** Firebase Console → Project Settings → General → Your apps → Config

**Value:** Copy the `apiKey` value

**Example:** `AIzaSyC_ExampleKey123456789`

**Note:** This is a public key and it's safe to expose in client-side code (it has `NEXT_PUBLIC_` prefix).

---

### Secret 5: NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN

**What it is:** Domain used for Firebase Authentication redirects.

**Where to find:** Same config object as above

**Value:** Copy the `authDomain` value

**Example:** `your-project-id.firebaseapp.com`

---

### Secret 6: NEXT_PUBLIC_FIREBASE_PROJECT_ID

**What it is:** Your Firebase project's unique identifier.

**Where to find:** Same config object as above

**Value:** Copy the `projectId` value

**Example:** `your-project-id`

---

### Secret 7: NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET

**What it is:** Default Cloud Storage bucket for your project.

**Where to find:** Same config object as above

**Value:** Copy the `storageBucket` value

**Example:** `your-project-id.appspot.com`

---

### Secret 8: NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID

**What it is:** Sender ID for Firebase Cloud Messaging (push notifications).

**Where to find:** Same config object as above

**Value:** Copy the `messagingSenderId` value

**Example:** `123456789012`

---

### Secret 9: NEXT_PUBLIC_FIREBASE_APP_ID

**What it is:** Unique identifier for your Firebase web app.

**Where to find:** Same config object as above

**Value:** Copy the `appId` value

**Example:** `1:123456789012:web:abc123def456ghi789`

---

### Secret 10: NEXT_PUBLIC_FIREBASE_CLOUD_FUNCTIONS_URL

**What it is:** Base URL for your Firebase Cloud Functions.

**Where to find:**

**Option A: From Firebase Console**
1. Go to Firebase Console → **Functions**
2. Find a deployed function
3. Copy the URL and remove the function name

**Option B: Construct it manually**

Format: `https://[region]-[project-id].cloudfunctions.net`

Example: `https://us-central1-your-project-id.cloudfunctions.net`

**Value example:** `https://us-central1-your-project-id.cloudfunctions.net`

---

## Part 3: Optional Sentry Secrets (2 secrets)

Only needed if you're using Sentry for error tracking.

### Secret 11: SENTRY_AUTH_TOKEN (Optional)

**What it is:** Authentication token for uploading source maps to Sentry during build.

**How to get it:**

1. Go to [Sentry Settings → Auth Tokens](https://sentry.io/settings/account/api/auth-tokens/)
2. Click **"Create New Token"**
3. Configure:
   - **Name:** `GitHub Actions Deploy`
   - **Scopes:** Select `project:releases` and `project:write`
4. Click **"Create Token"**
5. Copy the token

**Value example:** `sntrys_ExampleToken123...`

---

### Secret 12: NEXT_PUBLIC_SENTRY_DSN (Optional)

**What it is:** Data Source Name that tells Sentry where to send error reports.

**How to get it:**

1. Go to Sentry → Select your project
2. Go to **Settings** → **Client Keys (DSN)**
3. Copy the **DSN** value

**Value example:** `https://abc123def456@o123456.ingest.sentry.io/789012`

---

## How to Add Secrets to GitHub

Once you have all the values, you'll add them to **GitHub Environments**, not repository secrets.

**See [GITHUB_ENVIRONMENTS_SETUP.md](./GITHUB_ENVIRONMENTS_SETUP.md) for complete instructions on:**

1. Creating the Production and Preview environments
2. Adding secrets to each environment
3. Configuring protection rules
4. Setting up separate Firebase projects for production and development

**Key points:**
- **Production environment** gets production Firebase project secrets
- **Preview environment** gets development Firebase project secrets
- Both environments get the same Vercel secrets
- Each environment needs ALL 10 required secrets (or 12 with Sentry)

---

## Quick Checklist

Use this checklist to ensure you've obtained all required secret values:

### Vercel Secrets ✅
- [ ] `VERCEL_TOKEN` - obtained from Vercel
- [ ] `VERCEL_ORG_ID` - obtained from `.vercel/project.json`
- [ ] `VERCEL_PROJECT_ID` - obtained from `.vercel/project.json`

### Production Firebase Secrets ✅
- [ ] `NEXT_PUBLIC_FIREBASE_API_KEY` - from production Firebase project
- [ ] `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` - from production Firebase project
- [ ] `NEXT_PUBLIC_FIREBASE_PROJECT_ID` - from production Firebase project
- [ ] `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` - from production Firebase project
- [ ] `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` - from production Firebase project
- [ ] `NEXT_PUBLIC_FIREBASE_APP_ID` - from production Firebase project
- [ ] `NEXT_PUBLIC_FIREBASE_CLOUD_FUNCTIONS_URL` - from production Firebase project

### Development Firebase Secrets ✅
- [ ] `NEXT_PUBLIC_FIREBASE_API_KEY` - from development Firebase project
- [ ] `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` - from development Firebase project
- [ ] `NEXT_PUBLIC_FIREBASE_PROJECT_ID` - from development Firebase project
- [ ] `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` - from development Firebase project
- [ ] `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` - from development Firebase project
- [ ] `NEXT_PUBLIC_FIREBASE_APP_ID` - from development Firebase project
- [ ] `NEXT_PUBLIC_FIREBASE_CLOUD_FUNCTIONS_URL` - from development Firebase project

### Optional Sentry Secrets ⭕
- [ ] `SENTRY_AUTH_TOKEN` (if using Sentry)
- [ ] `NEXT_PUBLIC_SENTRY_DSN` (if using Sentry)

**Next:** Add these secrets to GitHub Environments following [GITHUB_ENVIRONMENTS_SETUP.md](./GITHUB_ENVIRONMENTS_SETUP.md)

---

## Verifying Your Setup

After obtaining all secret values and adding them to GitHub Environments:

1. **Verify environments are configured:**
   - See [GITHUB_ENVIRONMENTS_SETUP.md](./GITHUB_ENVIRONMENTS_SETUP.md) for verification steps

2. **Test the workflow:**
   - Make a small change to your code
   - Push to the `dev` branch
   - Go to **Actions** tab
   - Watch the workflow run
   - Check for any "Missing environment variable" errors

3. **Check deployments:**
   - **Preview deployment** (dev branch) should deploy automatically
   - **Production deployment** (main branch) requires approval
   - Test Firebase features on both deployed environments
   - Verify production uses production Firebase data
   - Verify preview uses development Firebase data

---

## Common Mistakes to Avoid

❌ **Including quotes in secret values**
- Wrong: `"AIzaSyC_ExampleKey123"`
- Right: `AIzaSyC_ExampleKey123`

❌ **Adding trailing spaces**
- Check there are no spaces before/after the value

❌ **Typos in secret names**
- Secret names are case-sensitive
- `VERCEL_TOKEN` ≠ `VERCEL_token`

❌ **Using development Firebase config in production**
- Make sure you're using production Firebase values

❌ **Adding secrets to wrong environment**
- Production environment should get production Firebase secrets
- Preview environment should get development Firebase secrets
- Don't mix them up!

❌ **Adding secrets at repository level instead of environments**
- This project uses GitHub Environments
- Add secrets to **Production** and **Preview** environments
- Not to repository-level secrets

---

## Security Best Practices

🔒 **Do:**
- Store all sensitive values in GitHub Secrets
- Rotate Vercel tokens every 6-12 months
- Use separate Firebase projects for dev/staging/prod
- Limit Vercel token scope if possible
- Never commit secrets to Git

🔓 **Don't:**
- Share secrets in Slack/Discord/Email
- Commit `.vercel/project.json` to Git
- Use the same Firebase project for dev and prod
- Give tokens unlimited expiration
- Copy secrets from public repositories

---

## Troubleshooting

### "Secret not found" error

**Problem:** GitHub Actions can't find a secret.

**Solution:**
- Check spelling (exact match, case-sensitive)
- Verify secret is added in repository settings (not organization settings)
- Wait 1-2 minutes after adding a new secret

### "Unauthorized" error from Vercel

**Problem:** Vercel token is invalid or expired.

**Solution:**
- Generate a new token
- Update `VERCEL_TOKEN` secret in GitHub
- Ensure token has "Full Account" scope

### Firebase auth fails after deployment

**Problem:** Firebase config is incorrect.

**Solution:**
- Double-check all 7 Firebase secrets
- Ensure values match Firebase Console exactly
- Check for trailing spaces or quotes
- Add Vercel URLs to Firebase authorized domains

---

## Next Steps

After setting up all secrets:

1. ✅ Complete the checklist above
2. ✅ Push a commit to `dev` branch to test
3. ✅ Monitor GitHub Actions workflow
4. ✅ Verify deployment in Vercel
5. ✅ Test the deployed app thoroughly
6. ✅ Create a test PR to verify PR previews

---

## Need Help?

- Review [GitHub Actions Deployment Guide](./GITHUB_ACTIONS_DEPLOYMENT.md)
- Check [Vercel CLI Documentation](https://vercel.com/docs/cli)
- Visit [Firebase Console](https://console.firebase.google.com/)
