'use client';

import { XMarkIcon } from '@heroicons/react/24/outline';
import { useEffect } from 'react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
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
}: ConfirmDialogProps) {
  // Handle escape key and prevent body scroll
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      // Calculate scrollbar width before hiding overflow
      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;

      document.addEventListener('keydown', handleEscape);

      // Prevent background scrolling while preserving scrollbar space
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
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
                className='rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
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
              className='px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            >
              {cancelText}
            </button>
            <button
              type='button'
              onClick={handleConfirm}
              className={`px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${styles.confirmButton}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
