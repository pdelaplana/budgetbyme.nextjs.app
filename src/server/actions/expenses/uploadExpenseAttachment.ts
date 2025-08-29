'use server';

/**
 * Expense Attachment File Upload Server Action using Firebase Admin SDK
 *
 * Handles uploading File objects (from file inputs) to Firebase Storage for expense attachments.
 * Uses Firebase Admin SDK for server-side operations without CORS restrictions.
 *
 * Features:
 * - Server-side file uploads to Firebase Storage
 * - Automatic file validation (size, type)
 * - Public URL generation for uploaded files
 * - Comprehensive error handling with Sentry monitoring
 * - Attachment-specific storage paths: /users/{userid}/attachments/
 */

import * as Sentry from '@sentry/nextjs';
import { storage } from '../../lib/firebase-admin';
import { withSentryServerAction } from '../../lib/sentryServerAction';

export interface UploadExpenseAttachmentResponse {
  success: boolean;
  url?: string;
  filename?: string;
  originalName?: string;
  size?: number;
  uploadDate?: string;
  error?: string;
}

/**
 * Server action to upload expense attachment file to Firebase Storage
 * This runs on the server and avoids CORS issues
 * Wrapped with Sentry monitoring
 */
export const uploadExpenseAttachment = withSentryServerAction(
  'uploadExpenseAttachment',
  async (formData: FormData): Promise<UploadExpenseAttachmentResponse> => {
    try {
      // Get the file and metadata from form data
      const attachmentFile = formData.get('attachment') as File;
      const userId = formData.get('userId') as string;
      const expenseId = formData.get('expenseId') as string;
      const attachmentType = (formData.get('type') as string) || 'document'; // document, receipt, invoice, etc.

      if (!attachmentFile || !userId || !expenseId) {
        return {
          success: false,
          error: 'Missing file, user ID, or expense ID',
        };
      }

      // Set user context for Sentry
      Sentry.setUser({ id: userId });

      // Add breadcrumb for attachment upload start
      Sentry.addBreadcrumb({
        category: 'expense_attachment',
        message: 'Starting expense attachment upload',
        level: 'info',
        data: {
          userId,
          expenseId,
          fileName: attachmentFile.name,
          fileSize: attachmentFile.size,
          fileType: attachmentFile.type,
          attachmentType,
        },
      });

      // Validate file
      const maxSize = 5 * 1024 * 1024; // 5MB
      const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/webp',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ];

      if (!allowedTypes.includes(attachmentFile.type)) {
        return {
          success: false,
          error: 'Please upload a JPG, PNG, WebP, PDF, or DOC/DOCX file',
        };
      }

      if (attachmentFile.size > maxSize) {
        return { success: false, error: 'File must be smaller than 5MB' };
      }

      // Convert file to buffer for server-side upload
      const arrayBuffer = await attachmentFile.arrayBuffer();
      const buffer = new Uint8Array(arrayBuffer);

      // Create storage reference using Admin SDK
      const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
      if (!bucketName) {
        throw new Error('Storage bucket name not configured');
      }

      const bucket = storage.bucket(bucketName);

      // Generate unique filename with timestamp and type
      const timestamp = Date.now();
      const fileExtension =
        attachmentFile.name.split('.').pop()?.toLowerCase() || 'bin';

      // Remove extension from original name to avoid duplication
      const nameWithoutExtension = attachmentFile.name
        .replace(/\.[^/.]+$/, '') // Remove extension
        .replace(/[^a-zA-Z0-9.-]/g, '_')
        .substring(0, 50); // Limit filename length

      const fileName = `users/${userId}/attachments/${attachmentType}_${timestamp}_${nameWithoutExtension}.${fileExtension}`;
      const file = bucket.file(fileName);

      // Upload file using Admin SDK
      await file.save(buffer, {
        metadata: {
          contentType: attachmentFile.type,
          customMetadata: {
            originalName: attachmentFile.name,
            attachmentType,
            expenseId,
            uploadedBy: userId,
            uploadDate: new Date().toISOString(),
          },
        },
      });

      // Make file publicly accessible
      await file.makePublic();

      // Get download URL
      const downloadURL = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

      // Add success breadcrumb
      Sentry.addBreadcrumb({
        category: 'expense_attachment',
        message: 'Expense attachment uploaded successfully',
        level: 'info',
        data: {
          userId,
          expenseId,
          downloadURL,
          storagePath: fileName,
          originalName: attachmentFile.name,
        },
      });

      return {
        success: true,
        url: downloadURL,
        filename: fileName,
        originalName: attachmentFile.name,
        size: attachmentFile.size,
        uploadDate: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Server upload error:', error);

      // Log error to Sentry
      Sentry.captureException(error, {
        tags: {
          action: 'uploadExpenseAttachment',
          error_type: 'expense_attachment_upload_error',
        },
        extra: {
          errorMessage:
            error instanceof Error ? error.message : 'Unknown error',
        },
      });

      return { success: false, error: 'Failed to upload attachment' };
    }
  },
);
