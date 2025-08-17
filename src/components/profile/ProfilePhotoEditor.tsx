'use client';

/**
 * ProfilePhotoEditor Component
 *
 * Provides camera-only photo management for user profiles.
 * Uses Firebase Admin SDK server actions for secure, CORS-free photo uploads.
 *
 * Features:
 * - Camera integration via Capacitor Camera (camera-only, no file uploads)
 * - Image cropping with react-easy-crop
 * - Server-side photo uploads (no CORS issues)
 * - Automatic image validation
 * - Enhanced error handling
 * - Loading states and user feedback
 * - Responsive design with external button positioning
 */

import { CameraIcon, TrashIcon } from '@heroicons/react/24/outline';
import type { User } from 'firebase/auth';
import Image from 'next/image';
import { useState } from 'react';
import ConfirmDialog from '@/components/modals/ConfirmDialog';
import ImageCropModal from '@/components/modals/ImageCropModal';
import { useAuth } from '@/contexts/AuthContext';
import { useConfirmDialog } from '@/hooks/common';
import { usePhotoUpload } from '@/hooks/media';
import { useCamera } from '@/hooks/media/useCamera';
import { validateImageFile } from '@/lib/media';

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
  const { uploadPhotoBlob, removePhoto, isUploading, error, clearError } =
    usePhotoUpload();
  const { takePhoto } = useCamera();

  // State for cropping modal
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);

  // Confirm dialog for photo removal
  const confirmDialog = useConfirmDialog({
    title: 'Remove Profile Photo',
    message:
      'Are you sure you want to remove your profile photo? This action cannot be undone.',
    confirmText: 'Remove Photo',
    cancelText: 'Keep Photo',
    type: 'danger',
  });

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

  // Handle cropped image
  const handleCroppedImage = async (croppedBlob: Blob) => {
    if (!user?.uid) return;

    try {
      // Upload the cropped blob
      const photoUrl = await uploadPhotoBlob(croppedBlob, user.uid);

      if (photoUrl) {
        // Update Firebase Auth profile
        await updateUserProfile({ photoURL: photoUrl });

        // Call custom update handler if provided
        if (onPhotoUpdate) {
          await onPhotoUpdate(photoUrl);
        }

        console.log('✅ Cropped photo uploaded successfully');
      }
    } catch (uploadError) {
      console.error('Failed to upload cropped image:', uploadError);
      alert('Failed to upload photo. Please try again.');
    } finally {
      // Clean up the object URL
      if (imageToCrop) {
        URL.revokeObjectURL(imageToCrop);
        setImageToCrop(null);
      }
    }
  };

  // Handle closing crop modal
  const handleCloseCropModal = () => {
    if (imageToCrop) {
      URL.revokeObjectURL(imageToCrop);
      setImageToCrop(null);
    }
    setIsCropModalOpen(false);
  };

  const handleTakePhoto = async () => {
    if (!user?.uid) return;

    clearError(); // Clear any previous errors
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

        // Create object URL for cropping
        const imageUrl = URL.createObjectURL(photo.blob);
        setImageToCrop(imageUrl);
        setIsCropModalOpen(true);
      }
    } catch (cameraError) {
      console.error('Failed to take photo:', cameraError);

      // Enhanced error handling with more specific messages
      let errorMessage = 'Failed to take photo. Please try again.';
      if (cameraError instanceof Error) {
        if (cameraError.message.includes('permission')) {
          errorMessage =
            'Camera permission denied. Please allow camera access and try again.';
        }
      }

      alert(errorMessage);
    }
  };

  const handlePhotoRemove = async () => {
    if (!hasPhoto && !user?.photoURL) return;

    // Show confirmation dialog
    const confirmed = await confirmDialog.showDialog();

    if (!confirmed) {
      console.log('👤 [Photo] User cancelled photo removal');
      return;
    }

    try {
      if (onPhotoRemove) {
        await onPhotoRemove();
      } else {
        // Default behavior - remove from Firebase using the hook
        if (user?.photoURL) {
          const success = await removePhoto(user.photoURL);

          if (success) {
            // Update Firebase Auth profile to clear photoURL
            await updateUserProfile({ photoURL: '' });

            // Call custom update handler if provided
            if (onPhotoUpdate) {
              await onPhotoUpdate('');
            }

            console.log('✅ Photo removed successfully via hook');
          }
        }
      }
    } catch (removeError) {
      console.error('Failed to remove photo:', removeError);

      // Enhanced error handling
      let errorMessage = 'Failed to remove photo. Please try again.';
      if (removeError instanceof Error) {
        if (removeError.message.includes('permission')) {
          errorMessage = 'Permission denied. Unable to remove photo.';
        } else if (removeError.message.includes('not found')) {
          errorMessage = 'Photo not found. It may have already been removed.';
        }
      }

      alert(errorMessage);
    }
  };

  return (
    <>
      {/* Centered Photo with External Buttons */}
      <div className='flex justify-center'>
        <div className='relative'>
          {/* Photo Container */}
          <div className='h-32 w-32 sm:h-36 sm:w-36 md:h-40 md:w-40 lg:h-44 lg:w-44 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-4 border-gray-100 shadow-lg aspect-square'>
            {user?.photoURL ? (
              <Image
                src={user.photoURL}
                alt='Profile'
                fill
                className='object-cover rounded-full'
                sizes='(max-width: 640px) 128px, (max-width: 768px) 144px, (max-width: 1024px) 160px, 176px'
              />
            ) : (
              <div className='bg-blue-100 text-blue-600 text-lg font-medium w-full h-full rounded-full flex items-center justify-center sm:text-xl md:text-2xl lg:text-3xl'>
                {getInitials(user?.displayName || '')}
              </div>
            )}
          </div>

          {/* Loading Overlay */}
          {isUploading && (
            <div className='absolute inset-0 rounded-full bg-black bg-opacity-50 flex items-center justify-center'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-white' />
            </div>
          )}

          {/* Action Buttons - Bottom Right External */}
          <div className='absolute -bottom-2 -right-2 flex space-x-1'>
            {/* Take Photo Button */}
            <button
              type='button'
              onClick={handleTakePhoto}
              disabled={isUploading}
              className='p-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
              aria-label='Take Photo'
            >
              <CameraIcon className='h-4 w-4' />
            </button>

            {/* Remove Photo Button */}
            {(hasPhoto || user?.photoURL) && (
              <button
                type='button'
                onClick={handlePhotoRemove}
                disabled={isUploading}
                className='p-2 bg-red-600 text-white rounded-full shadow-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
                aria-label='Remove Photo'
              >
                <TrashIcon className='h-4 w-4' />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Error Display - Positioned below photo */}
      {error && (
        <div className='flex justify-center mt-4'>
          <div className='p-2 bg-red-50 border border-red-200 rounded-md shadow-sm'>
            <div className='text-xs text-red-600 text-center'>{error}</div>
            <button
              type='button'
              onClick={clearError}
              className='mt-1 text-xs text-red-500 underline hover:text-red-700 block mx-auto'
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog {...confirmDialog.dialogProps} />

      {/* Image Crop Modal */}
      {imageToCrop && (
        <ImageCropModal
          isOpen={isCropModalOpen}
          onClose={handleCloseCropModal}
          imageSrc={imageToCrop}
          onCropComplete={handleCroppedImage}
          title='Crop Your Profile Photo'
        />
      )}
    </>
  );
}
