# Firebase Storage CORS Error Solutions

## Overview
CORS (Cross-Origin Resource Sharing) errors occur when your web application tries to upload files to Firebase Storage from a browser. This document provides multiple solutions to fix these issues.

## 🚨 Common CORS Error Messages
```
Access to fetch at 'https://firebasestorage.googleapis.com/...' from origin 'http://localhost:3000' has been blocked by CORS policy
```

## 🔧 Solution 1: Configure Firebase Storage CORS (Recommended for Production)

### Step 1: Create CORS Configuration File
We've already created `cors.json` in your project root with the following configuration:

```json
[
  {
    "origin": ["http://localhost:3000", "https://your-domain.com"],
    "method": ["GET", "POST", "PUT", "DELETE"],
    "maxAgeSeconds": 3600
  }
]
```

### Step 2: Apply CORS Configuration
1. **Install Google Cloud SDK**: https://cloud.google.com/sdk/docs/install
2. **Authenticate**: `gcloud auth login`
3. **Apply CORS**: `gsutil cors set cors.json gs://YOUR_STORAGE_BUCKET_NAME`
4. **Verify**: `gsutil cors get gs://YOUR_STORAGE_BUCKET_NAME`

### Step 3: Update CORS for Your Domain
Update the `cors.json` file to include your production domain:
```json
[
  {
    "origin": [
      "http://localhost:3000",
      "http://localhost:3001", 
      "https://yourdomain.com",
      "https://www.yourdomain.com"
    ],
    "method": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    "maxAgeSeconds": 3600
  }
]
```

## 🔧 Solution 2: Server-Side Upload with Firebase Admin SDK (Implemented - No CORS Issues)

We've implemented server actions using the Firebase Admin SDK that handle uploads server-side, completely avoiding CORS issues and providing enhanced security.

### Firebase Admin SDK Benefits:
- **No CORS Issues**: Server-side operations bypass browser CORS restrictions
- **Enhanced Security**: Admin SDK has elevated permissions and better security
- **Better Performance**: Direct server-to-server communication
- **Simplified URLs**: Clean public URLs without complex token-based access
- **Automatic Authentication**: Uses service account credentials

### Usage Examples:

#### For File Uploads:
```typescript
import { uploadPhotoToFirebaseServer } from '@/lib/photo-upload-utils';

// Use server upload with Admin SDK (recommended)
const photoUrl = await uploadPhotoToFirebaseServer(file, userId);
```

#### For Camera Blob Uploads:
```typescript
import { uploadPhotoBlobToFirebaseServer } from '@/lib/photo-upload-utils';

// Use server blob upload with Admin SDK (recommended)
const photoUrl = await uploadPhotoBlobToFirebaseServer(blob, userId);
```

#### For Photo Removal:
```typescript
import { removePhotoFromFirebaseServer } from '@/lib/photo-upload-utils';

// Use server removal with Admin SDK (recommended)
await removePhotoFromFirebaseServer(photoUrl);
```

### Server Actions Location
All photo storage server actions are located in:
```
src/server/actions/uploadPhoto.ts
```

Server actions include:
- `uploadPhoto()` - Server-side file upload using Firebase Admin SDK
- `uploadPhotoBlob()` - Server-side blob upload using Firebase Admin SDK  
- `removePhoto()` - Server-side photo removal using Firebase Admin SDK

All server actions are wrapped with Sentry monitoring for comprehensive error tracking and performance monitoring.

### Automatic Fallback
The updated utilities automatically fall back to server upload if CORS errors are detected:

```typescript
// This will try client upload first, then fallback to server if CORS error
const photoUrl = await uploadPhotoToFirebase(file, userId);
```

## 🔧 Solution 3: Firebase Storage Rules (Security)

Ensure your Firebase Storage security rules allow authenticated uploads:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow users to upload to their own folder
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow public read access to user profile images (optional)
    match /users/{userId}/profile_{allPaths=**} {
      allow read;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 🔧 Solution 4: Environment Configuration

### Environment Variables
Ensure all Firebase environment variables are properly set:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### Firebase Configuration Check
Verify your Firebase configuration is correct:

```typescript
// Check if storage bucket is properly configured
console.log('Storage Bucket:', process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET);
```

## 🔧 Solution 5: Development vs Production

### Development (localhost)
- CORS configuration should include `http://localhost:3000`
- Server actions work without CORS configuration
- Use development Firebase project for testing

### Production
- CORS configuration should include your production domain
- Ensure HTTPS is enabled
- Use production Firebase project

## 🔍 Debugging CORS Issues

### Check Browser Console
Look for specific error messages:
```
Access to fetch at 'https://firebasestorage.googleapis.com/...' has been blocked by CORS policy
```

### Network Tab
Check the network tab in browser dev tools:
- Look for OPTIONS preflight requests
- Check if they return 200 status
- Verify response headers include proper CORS headers

### Firebase Console
- Verify your Firebase project is active
- Check Storage bucket exists
- Verify authentication is working

## 📋 Implementation Checklist

### ✅ Quick Fix (Server Actions - Recommended)
- [x] Use `uploadPhotoToFirebaseServer()` for file uploads
- [x] Use `uploadPhotoBlobToFirebaseServer()` for camera uploads  
- [x] Use `removePhotoFromFirebaseServer()` for photo removal
- [x] Server actions are already implemented and ready to use

### ✅ Long-term Solution (CORS Configuration)
- [ ] Install Google Cloud SDK
- [ ] Update `cors.json` with your production domains
- [ ] Apply CORS configuration: `gsutil cors set cors.json gs://YOUR_BUCKET`
- [ ] Test uploads from your domain
- [ ] Update CORS when deploying to new domains

### ✅ Security & Rules
- [ ] Configure Firebase Storage security rules
- [ ] Test authentication requirements
- [ ] Verify file access permissions

## 🚀 Recommended Approach

1. **Immediate**: Use server actions (already implemented) - no CORS issues
2. **Long-term**: Configure CORS for your production domain
3. **Fallback**: Keep both client and server upload methods for reliability

## 📝 Testing

### Test CORS Configuration
```bash
# Test if CORS is properly configured
curl -H "Origin: http://localhost:3000" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: X-Requested-With" \
     -X OPTIONS \
     https://firebasestorage.googleapis.com/v0/b/YOUR_BUCKET/o
```

### Test Server Actions
The server actions can be tested immediately without any CORS configuration.

## 🔗 Useful Links

- [Firebase Storage CORS Documentation](https://firebase.google.com/docs/storage/web/download-files#cors_configuration)
- [Google Cloud Storage CORS](https://cloud.google.com/storage/docs/cross-origin)
- [MDN CORS Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
