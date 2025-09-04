# Delete Account Test Mode

This document explains how to use the test mode for the delete account feature.

## What is Test Mode?

Test mode allows you to experience the complete delete account workflow without actually deleting your account data. The UI appears exactly as it would in production, but only the server-side deletion is prevented. You will still be signed out as part of the authentic experience.

## How to Enable/Disable Test Mode

### Enable Test Mode
1. Open `.env.local`
2. Set `NEXT_PUBLIC_DELETE_ACCOUNT_TEST_MODE=true`
3. Restart the development server (`npm run dev`)

### Disable Test Mode
1. Open `.env.local` 
2. Set `NEXT_PUBLIC_DELETE_ACCOUNT_TEST_MODE=false` or remove the line
3. Restart the development server

## What Happens in Test Mode

### Visual Indicators
- 🧪 Test mode banner appears only on the Profile page 
- All modals appear exactly as they would in production
- Same button styling and text as production
- No visual differences in the modal workflow

### Workflow Experience
1. **Profile Page**: Shows blue test mode banner explaining safe testing
2. **Re-Auth Modal**: 
   - Accepts any password (authentication simulated)
   - Appears identical to production version
   - Simulates 1.5 second authentication delay
3. **Delete Confirmation Modal**:
   - Identical appearance to production
   - Simulates 2 second deletion process
   - Shows production success messaging
4. **Completion**:
   - Real sign-out occurs (authentic experience)
   - Redirects to home page as in production
   - Account data remains safe (only server deletion prevented)

### Console Logging
Test mode logs simulated actions:
- `🧪 TEST MODE: Authentication simulated successfully`
- `🧪 TEST MODE: Account deletion simulated successfully`
- `🧪 TEST MODE: Account deletion simulated - performing real sign-out`

## Testing the Complete Workflow

1. Make sure test mode is enabled
2. Go to http://localhost:3000/profile
3. Scroll to "Account Actions" section  
4. Look for the blue test mode banner
5. Click "Delete Account" button (same as production)
6. Enter any password in the re-auth modal
7. Type "DELETE MY ACCOUNT" in the confirmation modal
8. Experience the complete authentic workflow (you will be signed out!)

## Security Notes

- Test mode only works in development (uses `NEXT_PUBLIC_` env var)
- Only the server-side account deletion is prevented
- Firebase authentication and sign-out work normally
- Your account data remains completely safe
- Real authentication logic works as in production

## Switching Back to Production Mode

Simply set `NEXT_PUBLIC_DELETE_ACCOUNT_TEST_MODE=false` or remove the environment variable entirely, then restart the server. The feature will work with real deletion logic.