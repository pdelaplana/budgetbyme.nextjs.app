'use server';

/**
 * Photo Blob Upload Server Action using Firebase Admin SDK
 *
 * Handles uploading Blob objects (from camera captures) to Firebase Storage.
 * Uses Firebase Admin SDK for server-side operations without CORS restrictions.
 *
 * Features:
 * - Server-side blob uploads to Firebase Storage
 * - Optimized for camera captures and blob data
 * - Public URL generation for uploaded files
 * - Comprehensive error handling with Sentry monitoring
 * - Detailed logging for debugging
 */

import * as Sentry from '@sentry/nextjs';
import { storage } from '../../lib/firebase-admin';
import { withSentryServerAction } from '../../lib/sentryServerAction';

/**
 * Server action to upload photo blob to Firebase Storage
 * This runs on the server and avoids CORS issues
 * Wrapped with Sentry monitoring
 */
export const uploadPhotoBlob = withSentryServerAction(
  'uploadPhotoBlob',
  async (
    formData: FormData,
  ): Promise<{ success: boolean; url?: string; error?: string }> => {
    try {
      const blob = formData.get('blob') as Blob;
      const userId = formData.get('userId') as string;

      console.log('🔄 Server: Starting blob upload', {
        hasBlob: !!blob,
        blobSize: blob?.size,
        blobType: blob?.type,
        hasUserId: !!userId,
      });

      if (!blob || !userId) {
        const errorMsg = 'Missing blob or user ID';
        console.error('❌ Server: Validation failed:', errorMsg);
        return { success: false, error: errorMsg };
      }

      // Set user context for Sentry
      Sentry.setUser({ id: userId });

      // Add breadcrumb for blob upload start
      Sentry.addBreadcrumb({
        category: 'photo',
        message: 'Starting photo blob upload',
        level: 'info',
        data: {
          userId,
          blobSize: blob.size,
          blobType: blob.type,
        },
      });

      // Convert blob to buffer
      console.log('🔄 Server: Converting blob to buffer...');
      const arrayBuffer = await blob.arrayBuffer();
      const buffer = new Uint8Array(arrayBuffer);

      // Create storage reference using Admin SDK
      console.log('🔄 Server: Initializing Firebase Storage...');
      const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
      if (!bucketName) {
        throw new Error('Storage bucket name not configured');
      }

      const bucket = storage.bucket(bucketName);
      console.log('✅ Server: Storage bucket initialized:', bucket.name);

      const fileName = `users/${userId}/images/profile_${Date.now()}.jpg`;
      const file = bucket.file(fileName);

      // Upload blob using Admin SDK
      console.log('🔄 Server: Uploading file to Firebase Storage...', fileName);
      await file.save(buffer, {
        metadata: {
          contentType: 'image/jpeg',
        },
      });

      console.log('✅ Server: File uploaded successfully');

      // Make file publicly accessible
      console.log('🔄 Server: Making file public...');
      await file.makePublic();

      // Get download URL
      const downloadURL = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
      console.log('✅ Server: Generated download URL:', downloadURL);

      // Add success breadcrumb
      Sentry.addBreadcrumb({
        category: 'photo',
        message: 'Photo blob uploaded successfully',
        level: 'info',
        data: {
          userId,
          downloadURL,
          storagePath: fileName,
        },
      });

      return { success: true, url: downloadURL };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Server blob upload error:', {
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });

      // Log error to Sentry
      Sentry.captureException(error, {
        tags: {
          action: 'uploadPhotoBlob',
          error_type: 'photo_blob_upload_error',
        },
        extra: {
          errorMessage,
        },
      });

      return { success: false, error: `Upload failed: ${errorMessage}` };
    }
  },
);
