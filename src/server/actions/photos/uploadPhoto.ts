'use server';

/**
 * Photo File Upload Server Action using Firebase Admin SDK
 *
 * Handles uploading File objects (from file inputs) to Firebase Storage.
 * Uses Firebase Admin SDK for server-side operations without CORS restrictions.
 *
 * Features:
 * - Server-side file uploads to Firebase Storage
 * - Automatic file validation (size, type)
 * - Public URL generation for uploaded files
 * - Comprehensive error handling with Sentry monitoring
 */

import * as Sentry from '@sentry/nextjs';
import { storage } from '../../lib/firebase-admin';
import { withSentryServerAction } from '../../lib/sentryServerAction';

/**
 * Server action to upload photo file to Firebase Storage
 * This runs on the server and avoids CORS issues
 * Wrapped with Sentry monitoring
 */
export const uploadPhoto = withSentryServerAction(
  'uploadPhoto',
  async (
    formData: FormData,
  ): Promise<{ success: boolean; url?: string; error?: string }> => {
    try {
      // Get the file from form data
      const photoFile = formData.get('photo') as File;
      const userId = formData.get('userId') as string;

      if (!photoFile || !userId) {
        return { success: false, error: 'Missing file or user ID' };
      }

      // Set user context for Sentry
      Sentry.setUser({ id: userId });

      // Add breadcrumb for photo upload start
      Sentry.addBreadcrumb({
        category: 'photo',
        message: 'Starting photo upload',
        level: 'info',
        data: {
          userId,
          fileName: photoFile.name,
          fileSize: photoFile.size,
          fileType: photoFile.type,
        },
      });

      // Validate file
      const maxSize = 5 * 1024 * 1024; // 5MB
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

      if (!allowedTypes.includes(photoFile.type)) {
        return {
          success: false,
          error: 'Please upload a JPEG, PNG, or WebP image',
        };
      }

      if (photoFile.size > maxSize) {
        return { success: false, error: 'Image must be smaller than 5MB' };
      }

      // Convert file to buffer for server-side upload
      const arrayBuffer = await photoFile.arrayBuffer();
      const buffer = new Uint8Array(arrayBuffer);

      // Create storage reference using Admin SDK
      const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
      if (!bucketName) {
        throw new Error('Storage bucket name not configured');
      }

      const bucket = storage.bucket(bucketName);
      const fileName = `users/${userId}/profile_${Date.now()}.jpg`;
      const file = bucket.file(fileName);

      // Upload file using Admin SDK
      await file.save(buffer, {
        metadata: {
          contentType: photoFile.type,
        },
      });

      // Make file publicly accessible
      await file.makePublic();

      // Get download URL
      const downloadURL = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

      // Add success breadcrumb
      Sentry.addBreadcrumb({
        category: 'photo',
        message: 'Photo uploaded successfully',
        level: 'info',
        data: {
          userId,
          downloadURL,
          storagePath: fileName,
        },
      });

      return { success: true, url: downloadURL };
    } catch (error) {
      console.error('Server upload error:', error);

      // Log error to Sentry
      Sentry.captureException(error, {
        tags: {
          action: 'uploadPhoto',
          error_type: 'photo_upload_error',
        },
        extra: {
          errorMessage:
            error instanceof Error ? error.message : 'Unknown error',
        },
      });

      return { success: false, error: 'Failed to upload photo' };
    }
  },
);
