# Specification: Security Hardening and Session Verification

## Problem Statement
The current BudgetByMe implementation has several security vulnerabilities:
1. **Server actions trust client-supplied `userId`**: Server actions under `src/server/actions/**` execute database calls using the Firebase Admin SDK, which bypasses security rules. They accept a `userId` argument directly from the client without verification, allowing any authenticated client to query/mutate another user's workspace.
2. **No server-side route protection**: Protection is client-only. Protected routes (`/dashboard`, `/events`, `/profile`) can load on the server before client-side auth redirection kicks in, and server actions can be executed directly without any active session verification.
3. **Missing `storage.rules`**: `firebase.json` references `storage.rules`, but no such file exists in the repository, leaving Storage security configurations unversioned and potentially unsafe.
4. **PII Logging**: Workspace setup logs personal user details (email and display name) directly into Sentry and console output.

## Goals
1. Synchronize Firebase ID tokens client-side to a secure cookie (`token`).
2. Implement server-side verification using Next.js `cookies()` and Firebase Admin `auth.verifyIdToken`.
3. Add a Next.js `middleware.ts` to block unauthenticated access to protected routes.
4. Integrate validation in all server actions to ensure the caller matches the requested resource.
5. Create and commit `storage.rules` restricting user uploads to their own namespace.
6. Redact PII logs in `setupUserWorkspace.ts`.

## Tech Stack
- Firebase Auth (Client & Admin SDK)
- Next.js Middleware (NextResponse, NextRequest)
- React 19 / Next.js 15.4 Server Actions
- Document cookies
