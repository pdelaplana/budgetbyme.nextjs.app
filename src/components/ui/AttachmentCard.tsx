'use client';

import {
  ArrowDownTrayIcon,
  DocumentTextIcon,
  EyeIcon,
  PhotoIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import type React from 'react';

export interface AttachmentCardProps {
  url: string;
  filename: string;
  originalName: string;
  size?: number;
  uploadDate?: Date;
  onDelete: () => void;
  canDelete: boolean;
  onPreview?: () => void;
  disabled?: boolean;
  isDeleting?: boolean;
}

export default function AttachmentCard({
  url,
  filename,
  originalName,
  size,
  uploadDate,
  onDelete,
  canDelete,
  onPreview,
  disabled = false,
  isDeleting = false,
}: AttachmentCardProps) {

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
  };

  const formatUploadDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getFileIcon = (filename: string) => {
    const extension = filename.toLowerCase().split('.').pop();

    switch (extension) {
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'webp':
      case 'gif':
        return <PhotoIcon className='h-8 w-8 text-blue-500' />;
      case 'pdf':
        return <DocumentTextIcon className='h-8 w-8 text-red-500' />;
      case 'doc':
      case 'docx':
        return <DocumentTextIcon className='h-8 w-8 text-blue-600' />;
      default:
        return <DocumentTextIcon className='h-8 w-8 text-gray-500' />;
    }
  };

  const isImage = (filename: string): boolean => {
    const extension = filename.toLowerCase().split('.').pop();
    return ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(extension || '');
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = url;
    link.download = originalName;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePreview = () => {
    if (onPreview) {
      onPreview();
    } else {
      // Default preview behavior - open in new tab
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!canDelete || disabled || isDeleting) return;

    // Just call the onDelete callback - let parent handle confirmation
    onDelete();
  };

  return (
    <div
      className={`
        group relative bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200
        ${disabled || isDeleting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-gray-300'}
      `}
      onClick={!disabled && !isDeleting ? handlePreview : undefined}
      onKeyDown={(e) => {
        if (!disabled && !isDeleting && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          handlePreview();
        }
      }}
      role='button'
      tabIndex={disabled || isDeleting ? -1 : 0}
      aria-label={`Preview attachment ${originalName}`}
    >
      {/* File Icon and Info */}
      <div className='flex items-start space-x-3'>
        <div className='flex-shrink-0'>{getFileIcon(filename)}</div>

        <div className='min-w-0 flex-1 pr-20'>
          <div className='flex items-start justify-between'>
            <div className='min-w-0 flex-1'>
              <p
                className='text-sm font-medium text-gray-900 truncate leading-5'
                title={originalName}
              >
                {originalName}
              </p>

              <div className='flex items-center space-x-2 mt-1'>
                {size && (
                  <span className='text-xs text-gray-500'>
                    {formatFileSize(size)}
                  </span>
                )}
                {uploadDate && (
                  <>
                    {size && <span className='text-xs text-gray-300'>•</span>}
                    <span className='text-xs text-gray-500'>
                      {formatUploadDate(uploadDate)}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div
        className={`
          absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200
          ${disabled ? 'hidden' : ''}
        `}
      >
        {/* Preview/View Button */}
        <button
          type='button'
          onClick={(e) => {
            e.stopPropagation();
            handlePreview();
          }}
          className='p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors duration-200'
          title={isImage(filename) ? 'Preview image' : 'Open file'}
          disabled={disabled || isDeleting}
        >
          <EyeIcon className='h-4 w-4' />
        </button>

        {/* Download Button */}
        <button
          type='button'
          onClick={(e) => {
            e.stopPropagation();
            handleDownload();
          }}
          className='p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors duration-200'
          title='Download file'
          disabled={disabled || isDeleting}
        >
          <ArrowDownTrayIcon className='h-4 w-4' />
        </button>

        {/* Delete Button */}
        {canDelete && (
          <button
            type='button'
            onClick={handleDelete}
            className={`
              p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors duration-200
              ${isDeleting ? 'cursor-not-allowed opacity-50' : ''}
            `}
            title='Delete attachment'
            disabled={disabled || isDeleting}
          >
            {isDeleting ? (
              <div className='h-4 w-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin' />
            ) : (
              <TrashIcon className='h-4 w-4' />
            )}
          </button>
        )}
      </div>

    </div>
  );
}
