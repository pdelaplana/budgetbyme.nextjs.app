# Delete Account Feature Implementation Plan

## Overview
Implement a secure delete account feature with pre-authentication. User must re-authenticate with their password before accessing the deletion confirmation modal. The existing server action and Firebase Functions remain unchanged.

## User Flow
1. User clicks "Delete Account" button in Profile page
2. Re-authentication modal appears requiring password
3. After successful re-auth, delete account confirmation modal opens
4. User confirms by typing "DELETE MY ACCOUNT" 
5. Account deletion is initiated, user receives confirmation and is signed out
6. User receives email notification (handled by existing Firebase Functions)

---

## Implementation Phases

### Phase 1: Create Re-Authentication Modal (1.5 hours)

#### Task 1.1: Create ReAuthModal Component
**File:** `src/components/modals/ReAuthModal.tsx` (New File)

Create a new modal component that handles user re-authentication:

**Key Requirements:**
- Uses Headless UI (Dialog, Transition) to match existing modal patterns
- Accepts props: `isOpen`, `onClose`, `onSuccess`, `onError`, `title`, `description`
- Uses Firebase Auth `signInWithEmailAndPassword` for re-authentication
- Shows user's email (disabled field) and password input
- Handles authentication errors with user-friendly messages
- Shows loading state during authentication
- Includes proper TypeScript interfaces

**Dependencies:**
- `@headlessui/react` (already installed)
- `@heroicons/react/24/outline` (already installed)
- `firebase/auth` (already installed)
- `@/contexts/AuthContext` (existing)
- `@/lib/firebase` (existing)

**Error Handling:**
- `auth/wrong-password` → "Incorrect password. Please try again."
- `auth/too-many-requests` → "Too many failed attempts. Please wait and try again."
- Default → "Authentication failed. Please check your password."

**Component Structure:**
```typescript
interface ReAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onError: (error: string) => void;
  title: string;
  description: string;
}

export default function ReAuthModal({ ... }: ReAuthModalProps) {
  // State management for password, loading, errors
  // Firebase re-authentication logic
  // Form handling and validation
  // Modal UI with proper styling
}
```

**Acceptance Criteria:**
- [ ] Modal opens and closes correctly
- [ ] Password validation works
- [ ] Firebase re-authentication succeeds/fails appropriately
- [ ] Error messages display correctly
- [ ] Loading states work during authentication
- [ ] TypeScript types are properly defined

---

### Phase 2: Update Profile Page Integration (30 minutes)

#### Task 2.1: Add Re-Auth Modal State Management
**File:** `src/app/profile/page.tsx`

**Changes Required:**

1. **Add State Variables** (after line 48):
```typescript
const [showReAuthModal, setShowReAuthModal] = useState(false);
const [reAuthError, setReAuthError] = useState<string | null>(null);
```

2. **Add Import**:
```typescript
import ReAuthModal from '@/components/modals/ReAuthModal';
```

3. **Update Delete Account Button Handler** (line 333):
```typescript
onClick={() => setShowReAuthModal(true)}
```

4. **Add Error Display** (update lines 326-328):
```typescript
<p className='text-xs sm:text-sm text-red-600'>
  Permanently delete your account and all associated data. 
  You will receive an email confirmation and be signed out immediately.
</p>
{reAuthError && (
  <p className='text-xs text-red-700 mt-1 font-medium'>
    Authentication failed: {reAuthError}
  </p>
)}
```

5. **Add Re-Auth Modal Component** (before closing `</AccountLayout>` around line 358):
```typescript
{/* Re-Authentication Modal for Delete Account */}
<ReAuthModal
  isOpen={showReAuthModal}
  onClose={() => {
    setShowReAuthModal(false);
    setReAuthError(null);
  }}
  onSuccess={() => {
    setShowReAuthModal(false);
    setShowDeleteAccount(true);
    setReAuthError(null);
  }}
  onError={(error) => setReAuthError(error)}
  title="Confirm Your Identity"
  description="Please enter your password to proceed with account deletion."
/>
```

**Acceptance Criteria:**
- [ ] Delete Account button triggers re-auth modal
- [ ] Successful re-auth opens delete account modal
- [ ] Failed re-auth shows error message
- [ ] Modal state management works correctly

---

### Phase 3: Simplify Delete Account Modal (1 hour)

#### Task 3.1: Update DeleteAccountModal Component
**File:** `src/components/modals/DeleteAccountModal.tsx`

**Changes Required:**

1. **Add Import**:
```typescript
import { deleteAccount } from '@/server/actions/jobs/deleteAccount';
```

2. **Remove Password State and Field**:
   - Remove `password` from state (line 25)
   - Remove password input field from `renderConfirmStep()` function (lines 255-271)
   - Keep only the confirmation text input field

3. **Update handleConfirmDelete Function** (replace lines 44-89):
```typescript
const handleConfirmDelete = async () => {
  const newErrors: Record<string, string> = {};

  if (confirmationText !== requiredText) {
    newErrors.confirmation = `Please type "${requiredText}" exactly as shown`;
  }

  setErrors(newErrors);
  if (Object.keys(newErrors).length > 0) return;

  setIsDeleting(true);
  setStep('deleting');

  try {
    // User is already authenticated, just call server action
    await deleteAccount(user?.uid || '');
    
    setStep('completed');
    
    // Sign out user after showing confirmation
    setTimeout(async () => {
      const { signOut } = await import('firebase/auth');
      const { auth } = await import('@/lib/firebase');
      await signOut(auth);
      window.location.href = '/';
    }, 3000);
  } catch (error) {
    setErrors({
      submit: 'Failed to delete account. Please try again.',
    });
    setStep('confirm');
    setIsDeleting(false);
  }
};
```

4. **Update Warning Step Message** (lines 156-170):
```typescript
<h4 className='text-sm font-semibold text-blue-800 mb-1'>
  What happens next
</h4>
<p className='text-sm text-blue-700'>
  After confirmation, your account deletion will begin immediately. 
  You'll receive an email confirmation and be signed out of all devices.
</p>
```

5. **Update Completed Step** (replace `renderCompletedStep()` function):
```typescript
const renderCompletedStep = () => (
  <div className='p-8 text-center'>
    <div className='mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4'>
      <CheckCircleIcon className='h-6 w-6 text-green-600' />
    </div>
    <Dialog.Title className='text-lg font-semibold text-gray-900 mb-2'>
      Account Deletion Initiated
    </Dialog.Title>
    <div className='space-y-3 text-sm text-gray-600 mb-6'>
      <p>Your account deletion has begun and cannot be stopped.</p>
      <p>You will receive an email confirmation at <strong>{user?.email}</strong></p>
      <p>You are being signed out of all devices...</p>
    </div>
    <div className='animate-pulse text-sm text-gray-400'>
      Signing out in 3 seconds...
    </div>
  </div>
);
```

**Acceptance Criteria:**
- [ ] Modal no longer shows password field in confirmation step
- [ ] Only confirmation text input is required
- [ ] Server action is called correctly
- [ ] Success flow shows email notification message
- [ ] User is signed out and redirected after 3 seconds
- [ ] Error handling works for failed deletions

---

### Phase 4: Testing and Quality Assurance (1 hour)

#### Task 4.1: Manual Testing
**Test Cases:**

1. **Re-Authentication Flow**
   - [ ] Click "Delete Account" button opens re-auth modal
   - [ ] Entering wrong password shows error message
   - [ ] Entering correct password closes re-auth modal and opens delete modal
   - [ ] Cancel button in re-auth modal works correctly

2. **Delete Account Modal Flow**
   - [ ] Modal shows warning step with updated messaging
   - [ ] Confirmation step only requires typing "DELETE MY ACCOUNT"
   - [ ] Invalid confirmation text shows error
   - [ ] Valid confirmation proceeds to deletion
   - [ ] Deleting step shows appropriate loading state
   - [ ] Completed step shows email notification message
   - [ ] User is signed out after 3 seconds
   - [ ] Redirect to home page works

3. **Error Scenarios**
   - [ ] Network failure during deletion shows error
   - [ ] User can retry after error
   - [ ] Modal prevents closing during deletion process

#### Task 4.2: Code Quality Checks
- [ ] TypeScript compiles without errors
- [ ] Run `npm run check` (Biome linter passes)
- [ ] Run `npm run lint` (ESLint passes)
- [ ] All imports resolve correctly
- [ ] Firebase auth functions imported properly

---

## Technical Implementation Details

### Backend Integration
**No Backend Changes Required:**
- Server action `src/server/actions/jobs/deleteAccount.ts` remains unchanged
- Firebase Functions continue to work as-is
- Existing job queue system handles deletion

### Security Considerations
- User must re-authenticate before accessing deletion flow
- Re-authentication uses Firebase's built-in security
- Server action still validates user ID before processing
- Password is not sent to backend (handled by Firebase Auth)

### User Experience Improvements
- Clear separation between authentication and confirmation
- Email notification messaging sets proper expectations
- Immediate sign-out prevents confusion
- Loading states provide feedback during operations

---

## Dependencies
All required dependencies are already installed in the project:
- Headless UI (`@headlessui/react`)
- Heroicons (`@heroicons/react`)
- Firebase Auth (`firebase/auth`)
- Existing auth context and utilities
- TailwindCSS classes

---

## Files Modified/Created

### New Files
- `src/components/modals/ReAuthModal.tsx` - Re-authentication modal component

### Modified Files
- `src/app/profile/page.tsx` - Add re-auth modal integration
- `src/components/modals/DeleteAccountModal.tsx` - Simplify confirmation flow

---

## Success Criteria

### Functional Requirements
- [x] User can initiate account deletion from profile page
- [x] Re-authentication is required before deletion confirmation
- [x] User receives clear feedback about deletion process
- [x] User is signed out immediately after confirmation
- [x] Email notification messaging is provided
- [x] Error handling works for all failure scenarios

### Technical Requirements
- [x] No backend changes required
- [x] Uses existing Firebase Functions for deletion
- [x] Maintains existing security patterns
- [x] Follows established UI/UX patterns
- [x] TypeScript type safety maintained
- [x] Code quality standards met

---

## Progress Tracking

### Implementation Progress
- [ ] Phase 1: Create Re-Authentication Modal
  - [ ] Task 1.1: Create ReAuthModal Component
- [ ] Phase 2: Update Profile Page Integration
  - [ ] Task 2.1: Add Re-Auth Modal State Management
- [ ] Phase 3: Simplify Delete Account Modal
  - [ ] Task 3.1: Update DeleteAccountModal Component
- [ ] Phase 4: Testing and Quality Assurance
  - [ ] Task 4.1: Manual Testing
  - [ ] Task 4.2: Code Quality Checks

### Completion Date
- **Started:** [Date]
- **Completed:** [Date]
- **Total Time:** 4 hours (estimated)

---

## Notes
- This implementation leverages existing infrastructure without requiring backend changes
- The approach prioritizes security through Firebase's built-in re-authentication
- User experience is streamlined with clear messaging about the deletion process
- All existing patterns and conventions are maintained for consistency