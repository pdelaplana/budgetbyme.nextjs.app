'use client';

import { ArrowUpTrayIcon, PaperClipIcon, XMarkIcon } from '@heroicons/react/24/outline';
import React, { useState, useRef } from 'react';
import { toast } from 'sonner';

interface FileUploadProps {
  file: File | null;
  onFileChange: (file: File | null) => void;
  onFileRemove: () => void;
  accept?: string;
  maxSize?: number; // in MB
  disabled?: boolean;
  className?: string;
  label?: string;
  description?: string;
  isLoading?: boolean;
  loadingMessage?: string;
}

export default function FileUpload({
  file,
  onFileChange,
  onFileRemove,
  accept = '.jpg,.jpeg,.png,.pdf,.doc,.docx',
  maxSize = 5, // 5MB default
  disabled = false,
  className = '',
  label = 'Upload File',
  description = 'Supported formats: JPG, PNG, PDF, DOC',
  isLoading = false,
  loadingMessage = 'Uploading...',
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = (selectedFile: File): string | null => {
    // Check file size
    if (selectedFile.size > maxSize * 1024 * 1024) {
      return `File size must be less than ${maxSize}MB`;
    }

    // Check file type if accept is specified
    if (accept) {
      const acceptedTypes = accept.split(',').map(type => type.trim());
      const fileExtension = '.' + selectedFile.name.split('.').pop()?.toLowerCase();
      const isAccepted = acceptedTypes.some(type => {
        if (type.startsWith('.')) {
          return type.toLowerCase() === fileExtension;
        }
        return selectedFile.type.includes(type);
      });

      if (!isAccepted) {
        return `File type not supported. Please choose: ${accept}`;
      }
    }

    return null;
  };

  const handleFileSelect = (selectedFile: File) => {
    const error = validateFile(selectedFile);
    if (error) {
      toast.error(error);
      return;
    }
    onFileChange(selectedFile);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled && !isLoading) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (disabled || isLoading) return;

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleClick = () => {
    if (!disabled && !isLoading && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFileRemove();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`relative ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled}
      />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-lg z-10">
          <div className="flex flex-col items-center space-y-3">
            <div className="h-6 w-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
            <div className="text-sm font-medium text-gray-700">
              {loadingMessage}
            </div>
          </div>
        </div>
      )}

      {!file ? (
        <div
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            mt-1 border-2 border-dashed rounded-lg p-6 cursor-pointer transition-all duration-200
            ${isDragOver 
              ? 'border-primary-500 bg-primary-50' 
              : 'border-gray-300 hover:border-gray-400'
            }
            ${disabled || isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}
          `}
        >
          <div className="text-center">
            <ArrowUpTrayIcon className="mx-auto h-8 w-8 text-gray-400" />
            <div className="mt-3">
              <p className="text-sm font-medium text-gray-900">
                {isDragOver ? 'Drop your file here' : label}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {isDragOver ? '' : `or drag and drop`}
              </p>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {description} (max {maxSize}MB)
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-1 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 min-w-0 flex-1">
              <PaperClipIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(file.size)}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleRemove}
              className="ml-3 p-1 text-gray-400 hover:text-red-600 transition-colors duration-200 flex-shrink-0"
              disabled={disabled || isLoading}
              title="Remove file"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}