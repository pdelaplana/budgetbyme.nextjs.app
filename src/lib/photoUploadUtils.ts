import {
  removePhoto,
  uploadPhoto,
  uploadPhotoBlob,
} from '@/server/actions/photos';

/**
 * Upload photo to Firebase Storage via server action (No CORS issues)
 * Recommended method for reliable uploads
 */
export const uploadPhotoToFirebaseServer = async (
  file: File,
  userId: string,
): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('photo', file);
    formData.append('userId', userId);

    const result = await uploadPhoto(formData);

    if (result.success && result.url) {
      console.log('✅ Photo uploaded successfully via server:', result.url);
      return result.url;
    } else {
      throw new Error(result.error || 'Server upload failed');
    }
  } catch (error) {
    console.error('❌ Error uploading photo via server:', error);
    throw new Error('Failed to upload photo');
  }
};

/**
 * Upload photo blob to Firebase Storage via server action (No CORS issues)
 * Recommended method for reliable blob uploads from camera
 */
export const uploadPhotoBlobToFirebaseServer = async (
  blob: Blob,
  userId: string,
): Promise<string> => {
  try {
    console.log('🔄 Starting photo blob upload via server action...', {
      blobSize: blob.size,
      blobType: blob.type,
      userId,
    });

    const formData = new FormData();
    formData.append('blob', blob);
    formData.append('userId', userId);

    const result = await uploadPhotoBlob(formData);

    console.log('📄 Server action result:', result);

    if (result.success && result.url) {
      console.log(
        '✅ Photo blob uploaded successfully via server:',
        result.url,
      );
      return result.url;
    } else {
      const errorMessage = result.error || 'Server blob upload failed';
      console.error('❌ Server action returned error:', errorMessage);
      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error('❌ Error uploading photo blob via server:', error);

    // Preserve the original error message if it's from the server action
    if (error instanceof Error) {
      throw error;
    }

    throw new Error('Failed to upload photo');
  }
};

/**
 * Remove photo from Firebase Storage via server action (No CORS issues)
 * Recommended method for reliable photo removal
 */
export const removePhotoFromFirebaseServer = async (
  photoUrl: string,
): Promise<void> => {
  try {
    const result = await removePhoto(photoUrl);

    if (result.success) {
      console.log('✅ Photo removed successfully via server');
    } else {
      throw new Error(result.error || 'Server removal failed');
    }
  } catch (error) {
    console.error('❌ Error removing photo via server:', error);
    throw new Error('Failed to remove photo');
  }
};

/**
 * Validates if a file is a valid image for profile upload
 */
export const validateImageFile = (
  file: File,
): { isValid: boolean; error?: string } => {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Please upload a JPEG, PNG, or WebP image',
    };
  }

  if (file.size > maxSize) {
    return {
      isValid: false,
      error: 'Image must be smaller than 5MB',
    };
  }

  return { isValid: true };
};

/**
 * Resizes an image file to fit within specified dimensions
 * This is useful for optimizing upload sizes
 */
export const resizeImage = (
  file: File,
  maxWidth: number = 400,
  maxHeight: number = 400,
): Promise<File> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    if (!ctx) {
      resolve(file);
      return;
    }

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and convert to blob
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const resizedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            resolve(resizedFile);
          } else {
            resolve(file);
          }
        },
        file.type,
        0.9,
      );
    };

    img.src = URL.createObjectURL(file);
  });
};
