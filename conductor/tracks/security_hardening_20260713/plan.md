# Plan: Security Hardening and Session Verification

## Phase 1: Cookie Sync and Verification Setup

- [ ] Task: Implement client-side ID token synchronization in AuthContext
    - [ ] Update `src/contexts/AuthContext.tsx` to set a `token` cookie on `onIdTokenChanged`.
    - [ ] Update sign-out flow to clear the `token` cookie.
- [ ] Task: Create server-side session verification utility
    - [ ] Create `src/server/lib/auth-verification.ts` exporting a `verifySession` function.
    - [ ] Verify that `verifySession` retrieves the cookie and decodes it using Firebase Admin.
- [ ] Task: Create Next.js Route Protection Middleware
    - [ ] Create `src/middleware.ts` to intercept protected routes and verify session token presence.
    - [ ] Configure matcher rules to apply to `/dashboard`, `/events`, and `/profile`.
- [ ] Task: Conductor - User Manual Verification 'Cookie Sync and Verification Setup' (Protocol in workflow.md)

## Phase 2: Actions Integration and Security Rules

- [ ] Task: Integrate verifySession in Server Actions
    - [ ] Update `src/server/actions/events/*.ts` to verify session and assert user boundary matching.
    - [ ] Update `src/server/actions/expenses/*.ts` to verify session.
    - [ ] Update `src/server/actions/payments/*.ts` to verify session.
    - [ ] Update `src/server/actions/categories/*.ts` to verify session.
    - [ ] Update `src/server/actions/jobs/*.ts` and other top-level actions (`setupUserWorkspace.ts`) to verify session.
- [ ] Task: Create explicit Firebase Storage Rules
    - [ ] Create `storage.rules` limiting read/write access to paths matching the user's UID.
- [ ] Task: Redact PII from workspace setup logs
    - [ ] Update `src/server/actions/setupUserWorkspace.ts` to remove email and display name from Sentry breadcrumbs.
- [ ] Task: Conductor - User Manual Verification 'Action Integration and Rules Scoping' (Protocol in workflow.md)
