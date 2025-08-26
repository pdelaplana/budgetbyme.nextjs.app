'use server';

/**
 * Expense Attachment File Deletion Server Action using Firebase Admin SDK
 *
 * Handles deleting expense attachment files from Firebase Storage.
 * Uses Firebase Admin SDK for server-side operations without CORS restrictions.
 *
 * Features:
 * - Server-side file deletion from Firebase Storage
 * - URL-to-path conversion for file identification
 * - Comprehensive error handling with Sentry monitoring
 * - Safety checks to ensure user owns the file before deletion
 */

import * as Sentry from '@sentry/nextjs';
import { storage } from '../../lib/firebase-admin';
import { withSentryServerAction } from '../../lib/sentryServerAction';

export interface DeleteExpenseAttachmentResponse {
  success: boolean;
  error?: string;
}

/**
 * Server action to delete expense attachment file from Firebase Storage
 * This runs on the server and avoids CORS issues
 * Wrapped with Sentry monitoring
 */
export const deleteExpenseAttachment = withSentryServerAction(
  'deleteExpenseAttachment',
  async (
    userId: string,
    fileUrl: string,
  ): Promise<DeleteExpenseAttachmentResponse> => {
    try {
      if (!userId || !fileUrl) {
        return { success: false, error: 'Missing required parameters' };
      }

      // Set user context for Sentry
      Sentry.setUser({ id: userId });

      // Add breadcrumb for attachment deletion start
      Sentry.addBreadcrumb({
        category: 'expense_attachment',
        message: 'Starting expense attachment deletion',
        level: 'info',
        data: {
          userId,
          fileUrl,
        },
      });

      // Extract file path from URL
      const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
      if (!bucketName) {
        throw new Error('Storage bucket name not configured');
      }

      // Parse file path from URL
      // URL format: https://storage.googleapis.com/{bucket-name}/{file-path}
      const urlPrefix = `https://storage.googleapis.com/${bucketName}/`;
      if (!fileUrl.startsWith(urlPrefix)) {
        return { success: false, error: 'Invalid file URL format' };
      }

      const filePath = fileUrl.substring(urlPrefix.length);

      // Security check: ensure the file path belongs to the correct user
      const expectedPathPrefix = `users/${userId}/attachments/`;
      if (!filePath.startsWith(expectedPathPrefix)) {
        return {
          success: false,
          error: 'Unauthorized: File does not belong to this user',
        };
      }

      const bucket = storage.bucket(bucketName);
      const file = bucket.file(filePath);

      // Check if file exists before attempting deletion
      const [exists] = await file.exists();
      if (!exists) {
        // File doesn't exist, but we'll consider this a success
        // (might have been already deleted or never existed)
        return { success: true };
      }

      // Delete the file
      await file.delete();

      // Add success breadcrumb
      Sentry.addBreadcrumb({
        category: 'expense_attachment',
        message: 'Expense attachment deleted successfully',
        level: 'info',
        data: {
          userId,
          filePath,
        },
      });

      return { success: true };
    } catch (error) {
      console.error('Server delete error:', error);

      // Log error to Sentry
      Sentry.captureException(error, {
        tags: {
          action: 'deleteExpenseAttachment',
          error_type: 'expense_attachment_deletion_error',
        },
        extra: {
          userId,
          fileUrl,
          errorMessage:
            error instanceof Error ? error.message : 'Unknown error',
        },
      });

      return { success: false, error: 'Failed to delete attachment' };
    }
  },
);
