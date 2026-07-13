# Security Remediation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Secure the BudgetByMe application by implementing server-side session verification, protecting routes with Next.js middleware, securing storage, and removing PII logs.

**Architecture:** Use Firebase Auth client-side token synchronization to a cookie. Protect Next.js routes using middleware verifying the token. Protect server actions by verifying the Firebase ID token in a central utility before executing operations. Add Storage security rules in `storage.rules`.

**Tech Stack:** Firebase Auth, Firebase Admin SDK, Next.js Middleware, Cookies.

---

### Task 1: Auth Cookie Synchronization
Implement client-side ID token synchronization in `AuthContext.tsx` using `onIdTokenChanged` to set and clear a session cookie.

**Files:**
- Modify: `src/contexts/AuthContext.tsx`

**Step 1: Write code modifications to update AuthContext**

Update the `useEffect` block in `src/contexts/AuthContext.tsx` to handle token changes:
```typescript
import { onIdTokenChanged } from 'firebase/auth';

// Inside AuthProvider component:
useEffect(() => {
  const unsubscribe = onIdTokenChanged(auth, async (firebaseUser) => {
    setUser(firebaseUser);
    
    if (firebaseUser) {
      try {
        const token = await firebaseUser.getIdToken();
        // Set the token cookie
        document.cookie = `token=${token}; path=/; max-age=3600; SameSite=Lax; Secure`;
      } catch (error) {
        console.error('Failed to sync auth token to cookie:', error);
      }
    } else {
      // Clear token cookie
      document.cookie = 'token=; path=/; max-age=0; SameSite=Lax; Secure';
    }
    
    setLoading(false);
  });

  return unsubscribe;
}, []);
```

Also, update sign-out handling to clear the cookie immediately:
```typescript
const handleSignOut = async () => {
  try {
    await signOut(auth);
    // Clear token cookie
    document.cookie = 'token=; path=/; max-age=0; SameSite=Lax; Secure';
    window.location.href = '/signin';
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
};
```

**Step 2: Commit**
```bash
git add src/contexts/AuthContext.tsx
git commit -m "security: implement client-side firebase id token sync to cookies"
```

---

### Task 2: Next.js Session Verification Utility
Create a centralized server-side verification utility `verifySession` that retrieves the cookie, verifies the ID token with Firebase Admin, and returns the verified `userId`.

**Files:**
- Create: `src/server/lib/auth-verification.ts`

**Step 1: Write minimal implementation**

```typescript
import { cookies } from 'next/headers';
import { auth } from '@/server/lib/firebase-admin';

/**
 * Verifies the current user session token from cookies
 * Returns the verified Firebase UID
 * Throws an error if unauthorized
 */
export async function verifySession(): Promise<string> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    throw new Error('Unauthorized: No session token found');
  }

  try {
    const decodedToken = await auth.verifyIdToken(token);
    if (!decodedToken.uid) {
      throw new Error('Invalid token payload');
    }
    return decodedToken.uid;
  } catch (error) {
    console.error('Failed to verify ID token:', error);
    throw new Error('Unauthorized: Invalid session token');
  }
}
```

**Step 2: Commit**
```bash
git add src/server/lib/auth-verification.ts
git commit -m "security: add verifySession utility using firebase admin sdk"
```

---

### Task 3: Route Protection Middleware
Add Next.js Middleware to redirect unauthenticated requests attempting to access protected routes.

**Files:**
- Create: `src/middleware.ts`

**Step 1: Write minimal implementation**

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_ROUTES = ['/dashboard', '/events', '/profile'];

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));

  if (isProtected && !token) {
    const url = request.nextUrl.clone();
    url.pathname = '/signin';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/).*)'],
};
```

**Step 2: Commit**
```bash
git add src/middleware.ts
git commit -m "security: add nextjs middleware to protect private routes server-side"
```

---

### Task 4: Server Actions Verification Integration
Integrate `verifySession` check in server actions to verify user identity before performing any DB operations.

**Files:**
- Modify: All server actions under `src/server/actions/` (e.g. `setupUserWorkspace.ts`, `fetchEvents.ts`, `addEvent.ts`, `deleteAccount.ts`, etc.)

**Step 1: Update Server Actions**
For every server action that performs user-scoped operations:
1. Call `const verifiedUserId = await verifySession();`
2. Ensure that the workspace queried matches `verifiedUserId` instead of relying solely on the client-supplied argument.
3. For actions expecting `userId` as parameter, assert:
   ```typescript
   const verifiedUserId = await verifySession();
   if (userId !== verifiedUserId) {
     throw new Error('Unauthorized: User ID mismatch');
   }
   ```

Example update for `src/server/actions/events/fetchEvents.ts`:
```typescript
import { verifySession } from '../../lib/auth-verification';

export const fetchEvents = withSentryServerAction(
  'fetchEvents',
  async (userId: string): Promise<Event[]> => {
    if (!userId) throw new Error('User ID is required');

    const verifiedUserId = await verifySession();
    if (userId !== verifiedUserId) {
      throw new Error('Unauthorized: Access denied');
    }
    // ... rest of execution
```

**Step 2: Commit**
```bash
git add src/server/actions/**/*.ts
git commit -m "security: integrate verifySession authorization inside server actions"
```

---

### Task 5: Firebase Storage Rules Scoping
Write a secure `storage.rules` file to restrict media uploads and reads to the authenticated owner.

**Files:**
- Create: `storage.rules`

**Step 1: Write rules**
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /workspaces/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

**Step 2: Commit**
```bash
git add storage.rules
git commit -m "security: create storage rules limiting user access to their own workspace storage paths"
```

---

### Task 6: PII Log Redaction
Redact user personal identifiable information (PII) before Sentry breadcrumbs or console.log.

**Files:**
- Modify: `src/server/actions/setupUserWorkspace.ts`

**Step 1: Update PII logging**
Modify `setupUserWorkspace.ts` to redact name and email from logging.
```typescript
      // Add debug info to Sentry - Redacting email and name
      Sentry.addBreadcrumb({
        category: 'debug',
        message: 'Starting workspace setup',
        level: 'debug',
        data: {
          userId: addUserWorkspaceDto.userId,
          preferences: addUserWorkspaceDto.preferences
        },
      });
```

**Step 2: Commit**
```bash
git add src/server/actions/setupUserWorkspace.ts
git commit -m "security: redact email and name PII from workspace setup log"
```
