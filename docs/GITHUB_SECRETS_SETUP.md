# GitHub Secrets Setup Guide

This guide provides step-by-step instructions for setting up all required GitHub secrets for Vercel deployment with Firebase.

## Overview

You need to configure **10 required secrets** (+ 2 optional) in your GitHub repository to enable automated deployments to Vercel.

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

Once you have all the values, add them to GitHub:

1. Go to your GitHub repository
2. Click **"Settings"** (repository settings, not account settings)
3. In the left sidebar, click **"Secrets and variables"** → **"Actions"**
4. Click **"New repository secret"**
5. Add each secret one by one:
   - **Name:** Exact secret name (case-sensitive)
   - **Value:** The value you copied (no quotes, no extra spaces)
6. Click **"Add secret"**
7. Repeat for all secrets

---

## Quick Checklist

Use this checklist to ensure you've added all required secrets:

### Vercel Secrets ✅
- [ ] `VERCEL_TOKEN`
- [ ] `VERCEL_ORG_ID`
- [ ] `VERCEL_PROJECT_ID`

### Firebase Secrets ✅
- [ ] `NEXT_PUBLIC_FIREBASE_API_KEY`
- [ ] `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- [ ] `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- [ ] `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- [ ] `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- [ ] `NEXT_PUBLIC_FIREBASE_APP_ID`
- [ ] `NEXT_PUBLIC_FIREBASE_CLOUD_FUNCTIONS_URL`

### Optional Sentry Secrets ⭕
- [ ] `SENTRY_AUTH_TOKEN` (if using Sentry)
- [ ] `NEXT_PUBLIC_SENTRY_DSN` (if using Sentry)

---

## Verifying Your Setup

After adding all secrets:

1. **Verify in GitHub:**
   - Go to Settings → Secrets and variables → Actions
   - You should see all secret names listed (values are hidden)

2. **Test the workflow:**
   - Make a small change to your code
   - Push to the `dev` branch
   - Go to **Actions** tab
   - Watch the workflow run
   - Check for any "Missing environment variable" errors

3. **Check deployment:**
   - If workflow succeeds, check the Vercel deployment
   - Open the deployed URL
   - Test Firebase features (sign in, etc.)

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

❌ **Forgetting to also add env vars in Vercel Dashboard**
- GitHub secrets are for CI/CD
- Also add Firebase vars in Vercel → Settings → Environment Variables

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
