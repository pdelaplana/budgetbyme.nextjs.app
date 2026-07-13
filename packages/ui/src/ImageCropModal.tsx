'use client';

import { XMarkIcon } from '@heroicons/react/24/outline';
import { useCallback, useState } from 'react';
import Cropper from 'react-easy-crop';

interface CropPoint {
  x: number;
  y: number;
}

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ImageCropModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  onCropComplete: (croppedImage: Blob) => void;
  title?: string;
}

/**
 * Create a cropped image blob from the crop area
 */
const createCroppedImage = async (
  imageSrc: string,
  cropArea: CropArea,
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Failed to get canvas context'));
      return;
    }

    image.onload = () => {
      // Set canvas size to the crop area
      canvas.width = cropArea.width;
      canvas.height = cropArea.height;

      // Draw the cropped portion
      ctx.drawImage(
        image,
        cropArea.x,
        cropArea.y,
        cropArea.width,
        cropArea.height,
        0,
        0,
        cropArea.width,
        cropArea.height,
      );

      // Convert to blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob'));
          }
        },
        'image/jpeg',
        0.9,
      );
    };

    image.onerror = () => reject(new Error('Failed to load image'));
    image.src = imageSrc;
  });
};

export default function ImageCropModal({
  isOpen,
  onClose,
  imageSrc,
  onCropComplete,
  title = 'Crop Image',
}: ImageCropModalProps) {
  const [crop, setCrop] = useState<CropPoint>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CropArea | null>(
    null,
  );
  const [isProcessing, setIsProcessing] = useState(false);

  const onCropCompleteHandler = useCallback(
    (_croppedArea: CropArea, croppedAreaPixels: CropArea) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    [],
  );

  const handleSave = async () => {
    if (!croppedAreaPixels) return;

    setIsProcessing(true);
    try {
      const croppedImage = await createCroppedImage(
        imageSrc,
        croppedAreaPixels,
      );
      onCropComplete(croppedImage);
      onClose();
    } catch (error) {
      console.error('Error cropping image:', error);
      alert('Failed to crop image. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 overflow-y-auto'>
      {/* Backdrop */}
      <button
        type='button'
        className='fixed inset-0 bg-black bg-opacity-75 cursor-default'
        onClick={onClose}
        aria-label='Close modal'
      />

      {/* Modal */}
      <div className='flex min-h-full items-center justify-center p-4'>
        <div className='relative w-full max-w-4xl bg-white rounded-lg shadow-xl'>
          {/* Header */}
          <div className='flex items-center justify-between p-4 border-b'>
            <h2 className='text-lg font-semibold text-gray-900'>{title}</h2>
            <button
              type='button'
              onClick={onClose}
              className='p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100'
              aria-label='Close crop modal'
            >
              <XMarkIcon className='h-6 w-6' />
            </button>
          </div>

          {/* Crop Area */}
          <div className='relative h-96 sm:h-[500px] bg-gray-100'>
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1} // Square crop for profile photo
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropCompleteHandler}
              cropShape='round'
              showGrid={false}
              style={{
                containerStyle: {
                  width: '100%',
                  height: '100%',
                  backgroundColor: '#f3f4f6',
                },
              }}
            />
          </div>

          {/* Controls */}
          <div className='p-4 space-y-4'>
            {/* Zoom Slider */}
            <div className='space-y-2'>
              <label
                htmlFor='zoom-slider'
                className='block text-sm font-medium text-gray-700'
              >
                Zoom
              </label>
              <input
                id='zoom-slider'
                type='range'
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className='w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider'
                aria-label='Zoom level'
              />
            </div>

            {/* Action Buttons */}
            <div className='flex flex-col sm:flex-row gap-3 sm:justify-end'>
              <button
                type='button'
                onClick={onClose}
                disabled={isProcessing}
                className='px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50'
              >
                Cancel
              </button>
              <button
                type='button'
                onClick={handleSave}
                disabled={isProcessing || !croppedAreaPixels}
                className='px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {isProcessing ? 'Processing...' : 'Save Cropped Image'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
