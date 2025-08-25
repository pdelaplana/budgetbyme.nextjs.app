'use client';

import React from 'react';

interface LoadingSpinnerProps {
  title?: string;
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function LoadingSpinner({
  title = 'Loading...',
  message = 'Please wait while we load your data',
  size = 'md',
  className = '',
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
  };

  const titleSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <div className={`text-center py-12 ${className}`}>
      <div className={`animate-spin rounded-full ${sizeClasses[size]} border-b-2 border-primary-600 mx-auto mb-4`}></div>
      <h1 className={`${titleSizeClasses[size]} font-semibold text-gray-900 mb-2`}>
        {title}
      </h1>
      <p className='text-sm text-gray-600'>
        {message}
      </p>
    </div>
  );
}