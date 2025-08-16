/**
 * Photo Management Server Actions
 *
 * This module provides a centralized export for all photo-related server actions.
 * All actions use Firebase Admin SDK for secure, server-side operations.
 *
 * Available Actions:
 * - uploadPhoto: Upload File objects to Firebase Storage
 * - uploadPhotoBlob: Upload Blob objects (camera captures) to Firebase Storage
 * - removePhoto: Remove photos from Firebase Storage
 *
 * Features:
 * - Server-side Firebase operations (no CORS issues)
 * - Automatic file validation and processing
 * - Comprehensive error handling with Sentry monitoring
 * - Public URL generation for uploaded files
 */

// Photo management actions
export { removePhoto } from './removePhoto';
// File upload actions
export { uploadPhoto } from './uploadPhoto';
export { uploadPhotoBlob } from './uploadPhotoBlob';

// Type definitions for photo actions
export interface PhotoUploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export interface PhotoRemovalResult {
  success: boolean;
  error?: string;
}
