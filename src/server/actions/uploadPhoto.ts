'use server';

/**
 * Photo Storage Server Actions using Firebase Admin SDK
 *
 * This file contains server actions for uploading, managing, and removing photos
 * using the Firebase Admin SDK. The Admin SDK allows server-side operations
 * without CORS restrictions and provides better security and performance.
 *
 * Key features:
 * - Server-side file uploads to Firebase Storage
 * - Automatic file validation (size, type)
 * - Public URL generation for uploaded files
 * - Comprehensive error handling with Sentry monitoring
 * - Support for both File objects and Blob data
 */

import * as Sentry from '@sentry/nextjs';
import { storage } from '../lib/firebase-admin';
import { withSentryServerAction } from '../lib/sentryServerAction';

/**
 * Server action to upload photo to Firebase Storage
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

/**
 * Server action to upload blob to Firebase Storage
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

/**
 * Server action to remove photo from Firebase Storage
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
