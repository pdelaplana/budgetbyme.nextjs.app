'use client';

import { XMarkIcon } from '@heroicons/react/24/outline';
import { useEffect } from 'react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'info',
  isLoading = false,
}: ConfirmDialogProps) {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
  };

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          confirmButton: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
          icon: '🗑️',
          iconBg: 'bg-red-100',
          iconColor: 'text-red-600',
        };
      case 'warning':
        return {
          confirmButton:
            'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
          icon: '⚠️',
          iconBg: 'bg-yellow-100',
          iconColor: 'text-yellow-600',
        };
      default:
        return {
          confirmButton: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
          icon: 'ℹ️',
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-600',
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div className='fixed inset-0 z-50 overflow-y-auto'>
      {/* Backdrop */}
      <div
        className='fixed inset-0 bg-black bg-opacity-50 transition-opacity'
        onClick={onClose}
        aria-hidden='true'
      />

      {/* Dialog */}
      <div className='flex min-h-full items-center justify-center p-4'>
        <div
          className='relative w-full max-w-md transform overflow-hidden rounded-lg bg-white shadow-xl transition-all'
          role='dialog'
          aria-modal='true'
          aria-labelledby='dialog-title'
          aria-describedby='dialog-description'
        >
          {/* Header */}
          <div className='px-6 pt-6'>
            <div className='flex items-start justify-between'>
              <div className='flex items-center'>
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${styles.iconBg} mr-3`}
                >
                  <span className='text-lg'>{styles.icon}</span>
                </div>
                <h3
                  className='text-lg font-medium text-gray-900'
                  id='dialog-title'
                >
                  {title}
                </h3>
              </div>
              <button
                type='button'
                onClick={onClose}
                disabled={isLoading}
                className='rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50'
                aria-label='Close dialog'
              >
                <XMarkIcon className='h-5 w-5' />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className='px-6 py-4'>
            <p
              className='text-sm text-gray-600 leading-relaxed'
              id='dialog-description'
            >
              {message}
            </p>
          </div>

          {/* Actions */}
          <div className='flex justify-end space-x-3 px-6 pb-6'>
            <button
              type='button'
              onClick={onClose}
              disabled={isLoading}
              className='px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50'
            >
              {cancelText}
            </button>
            {onConfirm && confirmText && (
              <button
                type='button'
                onClick={handleConfirm}
                disabled={isLoading}
                className={`inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed min-w-[80px] ${styles.confirmButton}`}
              >
                {isLoading && (
                  <svg
                    className='animate-spin -ml-1 mr-3 h-4 w-4 text-white'
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                  >
                    <title>Loading</title>
                    <circle
                      className='opacity-25'
                      cx='12'
                      cy='12'
                      r='10'
                      stroke='currentColor'
                      strokeWidth='4'
                    ></circle>
                    <path
                      className='opacity-75'
                      fill='currentColor'
                      d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                    ></path>
                  </svg>
                )}
                {confirmText}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
