'use server';

/**
 * Photo Removal Server Action using Firebase Admin SDK
 *
 * Handles removing photos from Firebase Storage.
 * Uses Firebase Admin SDK for server-side operations without CORS restrictions.
 *
 * Features:
 * - Server-side photo deletion from Firebase Storage
 * - Smart URL parsing for different Firebase URL formats
 * - Comprehensive error handling with Sentry monitoring
 * - Detailed logging for debugging
 */

import * as Sentry from '@sentry/nextjs';
import { storage } from '../../lib/firebase-admin';
import { withSentryServerAction } from '../../lib/sentryServerAction';

/**
 * Server action to remove photo from Firebase Storage
 * This runs on the server and avoids CORS issues
 * Wrapped with Sentry monitoring
 */
export const removePhoto = withSentryServerAction(
  'removePhoto',
  async (photoUrl: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Add breadcrumb for photo removal start
      Sentry.addBreadcrumb({
        category: 'photo',
        message: 'Starting photo removal',
        level: 'info',
        data: { photoUrl },
      });

      // Extract the storage path from the URL
      let storagePath: string;

      console.log('🔄 Server: Parsing photo URL for removal:', photoUrl);

      if (photoUrl.includes('storage.googleapis.com')) {
        // Handle Admin SDK public URL format: https://storage.googleapis.com/[bucket]/[path]
        const url = new URL(photoUrl);
        const pathParts = url.pathname.split('/');

        // Remove empty first element and bucket name, keep the rest as file path
        if (pathParts.length >= 3) {
          // pathParts[0] = '', pathParts[1] = bucket, pathParts[2+] = file path
          storagePath = pathParts.slice(2).join('/');
        } else {
          console.error('❌ Server: Invalid storage.googleapis.com URL format');
          return { success: false, error: 'Invalid photo URL format' };
        }
      } else {
        // Handle Firebase Storage URL format (fallback)
        const url = new URL(photoUrl);
        const pathMatch = url.pathname.match(/\/o\/(.+?)\?/);

        if (!pathMatch) {
          console.error('❌ Server: Invalid Firebase Storage URL format');
          return { success: false, error: 'Invalid photo URL format' };
        }

        storagePath = decodeURIComponent(pathMatch[1]);
      }

      console.log('📄 Server: Extracted storage path:', storagePath);

      // Delete the file using Admin SDK
      const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
      if (!bucketName) {
        throw new Error('Storage bucket name not configured');
      }

      console.log('🔄 Server: Initializing bucket for deletion:', bucketName);
      const bucket = storage.bucket(bucketName);
      const file = bucket.file(storagePath);

      console.log('🔄 Server: Attempting to delete file:', storagePath);
      await file.delete();
      console.log('✅ Server: File deleted successfully');

      // Add success breadcrumb
      Sentry.addBreadcrumb({
        category: 'photo',
        message: 'Photo removed successfully',
        level: 'info',
        data: {
          photoUrl,
          storagePath,
        },
      });

      return { success: true };
    } catch (error) {
      console.error('Server removal error:', error);

      // Log error to Sentry
      Sentry.captureException(error, {
        tags: {
          action: 'removePhoto',
          error_type: 'photo_removal_error',
        },
        extra: {
          photoUrl,
          errorMessage:
            error instanceof Error ? error.message : 'Unknown error',
        },
      });

      return { success: false, error: 'Failed to remove photo' };
    }
  },
);
