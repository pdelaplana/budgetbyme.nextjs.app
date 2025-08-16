'use client';

/**
 * ProfilePhotoEditor Component
 *
 * Provides camera integration and photo management for user profiles.
 * Uses Firebase Admin SDK server actions for secure, CORS-free photo uploads.
 *
 * Features:
 * - Camera integration via Capacitor Camera
 * - Server-side photo uploads (no CORS issues)
 * - Automatic file validation
 * - Enhanced error handling
 * - Loading states and user feedback
 */

import { CameraIcon } from '@heroicons/react/24/outline';
import type { User } from 'firebase/auth';
import Image from 'next/image';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCamera } from '@/hooks/useCamera';
import {
  removePhotoFromFirebaseServer,
  uploadPhotoBlobToFirebaseServer,
  validateImageFile,
} from '@/lib/photoUploadUtils';

interface ProfilePhotoEditorProps {
  user: User | null;
  onPhotoRemove?: () => Promise<void>;
  onPhotoUpdate?: (photoUrl: string) => Promise<void>;
  hasPhoto?: boolean;
}

export default function ProfilePhotoEditor({
  user,
  onPhotoRemove,
  onPhotoUpdate,
  hasPhoto = false,
}: ProfilePhotoEditorProps) {
  const { updateUserProfile } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const { takePhoto } = useCamera();

  // Generate initials if no image is provided
  const getInitials = (name: string) => {
    if (!name) return '';
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleTakePhoto = async () => {
    if (!user?.uid) return;

    setIsUploading(true);
    try {
      const photo = await takePhoto();
      if (photo?.blob) {
        // Validate the blob as an image
        const file = new File([photo.blob], 'camera-photo.jpg', {
          type: 'image/jpeg',
        });
        const validation = validateImageFile(file);
        if (!validation.isValid) {
          alert(validation.error);
          return;
        }

        // Upload blob to Firebase Storage using server action
        const photoUrl = await uploadPhotoBlobToFirebaseServer(
          photo.blob,
          user.uid,
        );

        // Update Firebase Auth profile
        await updateUserProfile({ photoURL: photoUrl });

        // Call custom update handler if provided
        if (onPhotoUpdate) {
          await onPhotoUpdate(photoUrl);
        }

        console.log('✅ Photo uploaded successfully via server action');
      }
    } catch (error) {
      console.error('Failed to take photo:', error);

      // Enhanced error handling with more specific messages
      let errorMessage = 'Failed to take photo. Please try again.';
      if (error instanceof Error) {
        if (error.message.includes('upload')) {
          errorMessage =
            'Failed to upload photo. Please check your connection and try again.';
        } else if (error.message.includes('permission')) {
          errorMessage =
            'Camera permission denied. Please allow camera access and try again.';
        } else if (error.message.includes('size')) {
          errorMessage =
            'Photo is too large. Please try again with a smaller image.';
        }
      }

      alert(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handlePhotoRemove = async () => {
    if (!hasPhoto && !user?.photoURL) return;

    try {
      if (onPhotoRemove) {
        await onPhotoRemove();
      } else {
        // Default behavior - remove from Firebase using server action
        if (user?.photoURL) {
          await removePhotoFromFirebaseServer(user.photoURL);

          // Update Firebase Auth profile to clear photoURL
          await updateUserProfile({ photoURL: '' });

          // Call custom update handler if provided
          if (onPhotoUpdate) {
            await onPhotoUpdate('');
          }

          console.log('✅ Photo removed successfully via server action');
        }
      }
    } catch (error) {
      console.error('Failed to remove photo:', error);

      // Enhanced error handling
      let errorMessage = 'Failed to remove photo. Please try again.';
      if (error instanceof Error) {
        if (error.message.includes('permission')) {
          errorMessage = 'Permission denied. Unable to remove photo.';
        } else if (error.message.includes('not found')) {
          errorMessage = 'Photo not found. It may have already been removed.';
        }
      }

      alert(errorMessage);
    }
  };

  const handleUploadButtonClick = () => {
    // Default to opening camera directly
    handleTakePhoto();
  };

  return (
    <div className='flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6'>
      <div className='flex-shrink-0'>
        <div className='relative'>
          <div className='h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden'>
            {user?.photoURL ? (
              <Image
                src={user.photoURL}
                alt='Profile'
                fill
                className='object-cover'
              />
            ) : (
              <div className='bg-blue-100 text-blue-600 text-xs font-medium w-full h-full flex items-center justify-center sm:text-sm lg:text-base'>
                {getInitials(user?.displayName || '')}
              </div>
            )}
          </div>
          {isUploading && (
            <div className='absolute inset-0 rounded-full bg-black bg-opacity-50 flex items-center justify-center'>
              <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-white' />
            </div>
          )}
        </div>
      </div>
      <div className='flex-1'>
        <h3 className='text-sm font-medium text-gray-900 mb-2'>
          Profile Photo
        </h3>
        <p className='text-xs sm:text-sm text-gray-500 mb-3'>
          Upload a photo to personalize your account
        </p>
        <div className='flex flex-col xs:flex-row gap-2'>
          <button
            type='button'
            onClick={handleUploadButtonClick}
            disabled={isUploading}
            className='btn-secondary cursor-pointer flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed'
          >
            <CameraIcon className='h-4 w-4 mr-2' />
            {isUploading ? 'Uploading...' : 'Add Photo'}
          </button>
          {(hasPhoto || user?.photoURL) && (
            <button
              type='button'
              onClick={handlePhotoRemove}
              className='btn-secondary text-red-600 hover:text-red-700'
              disabled={isUploading}
            >
              Remove Photo
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
