'use client';

import { useCallback, useState } from 'react';
import { useServerAction } from '@/hooks/common';
import { removePhoto, uploadPhotoBlob } from '@/server/actions/photos';

export interface UsePhotoUploadReturn {
  uploadPhotoBlob: (blob: Blob, userId: string) => Promise<string | null>;
  removePhoto: (photoUrl: string) => Promise<boolean>;
  isUploading: boolean;
  uploadProgress: number;
  error: string | null;
  clearError: () => void;
}

/**
 * Custom hook for photo upload operations with state management
 * Provides upload progress, error handling, and loading states
 */
export const usePhotoUpload = (): UsePhotoUploadReturn => {
  const [uploadProgress, setUploadProgress] = useState(0);

  // Server action hooks for blob upload and photo removal only
  const uploadPhotoBlobAction = useServerAction(uploadPhotoBlob, {
    actionName: 'uploadPhotoBlob',
    enableLogging: true,
    enableSentry: true,
  });

  const removePhotoAction = useServerAction(removePhoto, {
    actionName: 'removePhoto',
    enableLogging: true,
    enableSentry: true,
  });

  // Combined loading state from blob upload and removal actions only
  const isUploading =
    uploadPhotoBlobAction.isLoading || removePhotoAction.isLoading;

  // Combined error (prioritize the most recent error)
  const error = uploadPhotoBlobAction.error || removePhotoAction.error;

  const clearError = useCallback(() => {
    uploadPhotoBlobAction.clearError();
    removePhotoAction.clearError();
  }, [uploadPhotoBlobAction, removePhotoAction]);

  /**
   * Upload photo blob (from camera) to Firebase Storage via server action
   */
  const uploadPhotoBlobFile = useCallback(
    async (blob: Blob, userId: string): Promise<string | null> => {
      setUploadProgress(0);

      try {
        console.log('🔄 Starting photo blob upload...', {
          blobSize: blob.size,
          blobType: blob.type,
          userId,
        });

        setUploadProgress(25);

        const formData = new FormData();
        formData.append('blob', blob);
        formData.append('userId', userId);

        setUploadProgress(50);

        const result = await uploadPhotoBlobAction.execute(formData);

        setUploadProgress(75);

        console.log('📄 Server action result:', result);

        if (result?.success && result.url) {
          setUploadProgress(100);
          console.log('✅ Photo blob uploaded successfully:', result.url);
          return result.url;
        } else {
          console.error('❌ Server action returned error:', result?.error);
          return null;
        }
      } catch (err) {
        console.error('❌ Error uploading photo blob:', err);
        return null;
      } finally {
        setUploadProgress(0);
      }
    },
    [uploadPhotoBlobAction],
  );

  /**
   * Remove photo from Firebase Storage via server action
   */
  const removePhotoFile = useCallback(
    async (photoUrl: string): Promise<boolean> => {
      try {
        console.log('🔄 Starting photo removal...', { photoUrl });

        const result = await removePhotoAction.execute(photoUrl);

        if (result?.success) {
          console.log('✅ Photo removed successfully');
          return true;
        } else {
          console.error('❌ Server action returned error:', result?.error);
          return false;
        }
      } catch (err) {
        console.error('❌ Error removing photo:', err);
        return false;
      }
    },
    [removePhotoAction],
  );

  return {
    uploadPhotoBlob: uploadPhotoBlobFile,
    removePhoto: removePhotoFile,
    isUploading,
    uploadProgress,
    error,
    clearError,
  };
};
