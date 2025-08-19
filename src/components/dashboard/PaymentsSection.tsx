'use client';

import React from 'react';

interface PaymentsSectionProps {
  onGetStarted: () => void;
}

export default function PaymentsSection({ onGetStarted }: PaymentsSectionProps) {
  return (
    <div className='mb-4 sm:mb-6'>
      <div className='card'>
        <div className='border-b border-gray-200 pb-3 mb-4'>
          <h2 className='text-base sm:text-lg font-semibold text-gray-900'>
            Upcoming Payments
          </h2>
        </div>
        <div className='text-center py-8'>
          <div className='mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 mb-4'>
            <svg className='h-6 w-6 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1' />
            </svg>
          </div>
          <h3 className='text-sm font-medium text-gray-900 mb-2'>
            No Payment Schedules Yet
          </h3>
          <p className='text-sm text-gray-600 max-w-sm mx-auto mb-4'>
            Payment tracking will be available once you add expenses to your event. Start by creating budget categories and adding expenses.
          </p>
          <button
            onClick={onGetStarted}
            className='inline-flex items-center px-3 py-2 border border-transparent text-xs font-medium rounded text-primary-700 bg-primary-100 hover:bg-primary-200 transition-colors duration-200'
          >
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
}