'use client';

import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { useState } from 'react';

export interface CameraPhoto {
  webPath: string;
  format: string;
  blob?: Blob;
}

export const useCamera = () => {
  const [isCapturing, setIsCapturing] = useState(false);

  const takePhoto = async (): Promise<CameraPhoto | null> => {
    setIsCapturing(true);

    try {
      console.log('🔍 [Camera] Attempting to access camera...');

      // Use Capacitor Camera with fallback options
      const photo = await Camera.getPhoto({
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera, // This will show Camera/Gallery options
        quality: 90,
        allowEditing: false,
        saveToGallery: false,
      });

      console.log('📸 [Camera] Photo captured successfully:', {
        hasWebPath: !!photo.webPath,
        format: photo.format,
      });

      if (photo.webPath) {
        // Convert to blob for upload
        const response = await fetch(photo.webPath);
        const blob = await response.blob();

        console.log('✅ [Camera] Blob conversion successful:', {
          blobSize: blob.size,
          blobType: blob.type,
        });

        return {
          webPath: photo.webPath,
          format: photo.format || 'jpeg',
          blob,
        };
      }

      console.warn('⚠️ [Camera] No webPath received from camera');
      return null;
    } catch (error) {
      console.error('❌ [Camera] Capacitor camera failed:', error);
      console.log('🔄 [Camera] Falling back to web implementation...');

      // Fallback to web implementation for browsers/PWA
      return await fallbackWebCamera();
    } finally {
      setIsCapturing(false);
    }
  };

  const takeCameraPhoto = async (): Promise<CameraPhoto | null> => {
    setIsCapturing(true);

    try {
      // Force camera only
      const photo = await Camera.getPhoto({
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
        quality: 90,
        allowEditing: false,
        saveToGallery: false,
      });

      if (photo.webPath) {
        const response = await fetch(photo.webPath);
        const blob = await response.blob();

        return {
          webPath: photo.webPath,
          format: photo.format || 'jpeg',
          blob,
        };
      }

      return null;
    } catch (error) {
      console.error('Error taking camera photo:', error);
      return await fallbackWebCamera();
    } finally {
      setIsCapturing(false);
    }
  };

  const selectFromGallery = async (): Promise<CameraPhoto | null> => {
    setIsCapturing(true);

    try {
      // Force gallery/photos only
      const photo = await Camera.getPhoto({
        resultType: CameraResultType.Uri,
        source: CameraSource.Photos,
        quality: 90,
        allowEditing: false,
      });

      if (photo.webPath) {
        const response = await fetch(photo.webPath);
        const blob = await response.blob();

        return {
          webPath: photo.webPath,
          format: photo.format || 'jpeg',
          blob,
        };
      }

      return null;
    } catch (error) {
      console.error('Error selecting from gallery:', error);
      return await fallbackFileInput();
    } finally {
      setIsCapturing(false);
    }
  };

  // Fallback web camera implementation for browsers
  const fallbackWebCamera = async (): Promise<CameraPhoto | null> => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        return await fallbackFileInput();
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      const video = document.createElement('video');
      video.srcObject = stream;
      video.autoplay = true;
      video.playsInline = true;

      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      if (!context) {
        return await fallbackFileInput();
      }

      await new Promise<void>((resolve) => {
        video.onloadedmetadata = () => {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          resolve();
        };
      });

      return new Promise<CameraPhoto | null>((resolve) => {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.9);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 9999;
        `;

        video.style.cssText = `
          max-width: 90vw;
          max-height: 70vh;
          border-radius: 8px;
        `;

        const buttonsContainer = document.createElement('div');
        buttonsContainer.style.cssText = `
          display: flex;
          gap: 1rem;
          margin-top: 1rem;
        `;

        const captureButton = document.createElement('button');
        captureButton.textContent = 'Capture Photo';
        captureButton.style.cssText = `
          padding: 0.75rem 1.5rem;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 1rem;
          font-weight: 500;
        `;

        const selectFileButton = document.createElement('button');
        selectFileButton.textContent = 'Select File';
        selectFileButton.style.cssText = `
          padding: 0.75rem 1.5rem;
          background: #059669;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 1rem;
          font-weight: 500;
        `;

        const cancelButton = document.createElement('button');
        cancelButton.textContent = 'Cancel';
        cancelButton.style.cssText = `
          padding: 0.75rem 1.5rem;
          background: #6b7280;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 1rem;
          font-weight: 500;
        `;

        captureButton.addEventListener('click', () => {
          context.drawImage(video, 0, 0, canvas.width, canvas.height);

          canvas.toBlob(
            (blob) => {
              stream.getTracks().forEach((track) => track.stop());
              document.body.removeChild(overlay);

              if (blob) {
                const webPath = URL.createObjectURL(blob);
                resolve({
                  webPath,
                  format: 'jpeg',
                  blob,
                });
              } else {
                resolve(null);
              }
            },
            'image/jpeg',
            0.9,
          );
        });

        selectFileButton.addEventListener('click', async () => {
          stream.getTracks().forEach((track) => track.stop());
          document.body.removeChild(overlay);

          const fileResult = await fallbackFileInput();
          resolve(fileResult);
        });

        cancelButton.addEventListener('click', () => {
          stream.getTracks().forEach((track) => track.stop());
          document.body.removeChild(overlay);
          resolve(null);
        });

        buttonsContainer.appendChild(captureButton);
        buttonsContainer.appendChild(selectFileButton);
        buttonsContainer.appendChild(cancelButton);
        overlay.appendChild(video);
        overlay.appendChild(buttonsContainer);
        document.body.appendChild(overlay);
      });
    } catch (error) {
      console.error('Fallback camera error:', error);
      return await fallbackFileInput();
    }
  };

  // Fallback file input for unsupported browsers
  const fallbackFileInput = async (): Promise<CameraPhoto | null> => {
    return new Promise<CameraPhoto | null>((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.capture = 'user';

      input.addEventListener('change', (event) => {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (file) {
          const webPath = URL.createObjectURL(file);
          resolve({
            webPath,
            format: file.type.split('/')[1] || 'jpeg',
            blob: file,
          });
        } else {
          resolve(null);
        }
      });

      input.click();
    });
  };

  return {
    takePhoto, // Uses CameraSource.Prompt (shows camera/gallery options)
    takeCameraPhoto, // Forces camera only
    selectFromGallery, // Forces gallery only
    isCapturing,
  };
};
