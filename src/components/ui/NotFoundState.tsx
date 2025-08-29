'use client';

import React from 'react';

interface NotFoundStateProps {
  title: string;
  message: string;
  buttonText: string;
  onButtonClick: () => void;
  icon?: string;
  className?: string;
}

export default function NotFoundState({
  title,
  message,
  buttonText,
  onButtonClick,
  icon = '🔍',
  className = '',
}: NotFoundStateProps) {
  return (
    <div className={`text-center py-12 ${className}`}>
      <div className='text-6xl mb-4'>{icon}</div>
      <h1 className='text-2xl font-semibold text-gray-900 mb-2'>{title}</h1>
      <p className='text-gray-600 mb-6'>{message}</p>
      <button type='button' onClick={onButtonClick} className='btn-primary'>
        {buttonText}
      </button>
    </div>
  );
}
