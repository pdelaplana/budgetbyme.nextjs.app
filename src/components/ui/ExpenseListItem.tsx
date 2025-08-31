'use client';

import {
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import type React from 'react';
import { memo } from 'react';
import { formatCurrency, formatDate } from '@/lib/formatters';
import {
  calculatePaymentStatus,
  type ExpenseWithPayments,
  getPaymentStatusText,
} from '@/lib/paymentCalculations';

export interface ExpenseListItemProps {
  expense: ExpenseWithPayments & {
    id: string;
    name: string;
    description?: string;
    date: string | Date;
  };
  onClick: (expense: ExpenseListItemProps['expense']) => void;
  className?: string;
}

function ExpenseListItem({
  expense,
  onClick,
  className = '',
}: ExpenseListItemProps) {
  // Use centralized payment calculation utility
  const paymentStatus = calculatePaymentStatus(expense);
  const statusText = getPaymentStatusText(paymentStatus);

  const handleClick = () => {
    onClick(expense);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <button
      type='button'
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={`group p-3 sm:p-4 rounded-lg border border-gray-200 hover:border-primary-300 hover:shadow-md hover:bg-gray-50/50 transition-all duration-200 cursor-pointer w-full text-left ${className}`}
    >
      <div className='flex flex-col space-y-3'>
        {/* Header with name and amount */}
        <div className='flex items-start justify-between'>
          <h3 className='text-sm sm:text-base font-semibold text-gray-900 leading-tight flex-1 min-w-0 pr-3 group-hover:text-primary-700 transition-colors duration-200'>
            {expense.name}
          </h3>
          <span className='text-base sm:text-lg font-bold text-gray-900 flex-shrink-0'>
            {formatCurrency(expense.amount)}
          </span>
        </div>

        {/* Description and date */}
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-1 sm:space-y-0'>
          <p className='text-xs sm:text-sm text-gray-600 line-clamp-2 sm:line-clamp-1 flex-1 min-w-0 sm:pr-4'>
            {expense.description}
          </p>
          <span className='text-xs sm:text-sm text-gray-500 flex-shrink-0'>
            {formatDate(expense.date)}
          </span>
        </div>

        {/* Payment Status and Progress */}
        <div className='space-y-2'>
          {/* Payment Status */}
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-2'>
              {paymentStatus.isFullyPaid ? (
                <>
                  <CheckCircleIcon className='h-4 w-4 text-success-600' />
                  <span className='text-xs font-medium text-success-700'>
                    {statusText.text}
                  </span>
                </>
              ) : paymentStatus.overduePayments.length > 0 ? (
                <>
                  <ExclamationTriangleIcon className='h-4 w-4 text-red-600' />
                  <span className='text-xs font-medium text-red-700'>
                    {statusText.text}
                  </span>
                </>
              ) : paymentStatus.nextDuePayment ? (
                <>
                  <ClockIcon className='h-4 w-4 text-warning-600' />
                  <span className='text-xs font-medium text-warning-700'>
                    {statusText.text}
                  </span>
                </>
              ) : (
                <>
                  <ExclamationTriangleIcon className='h-4 w-4 text-gray-500' />
                  <span className='text-xs font-medium text-gray-600'>
                    {statusText.text}
                  </span>
                </>
              )}
            </div>

            {!paymentStatus.isFullyPaid && (
              <span className='text-xs font-medium text-gray-700'>
                {formatCurrency(paymentStatus.remainingBalance)} remaining
              </span>
            )}
          </div>

          {/* Progress Bar (only show if has payments) */}
          {paymentStatus.hasPayments && (
            <div className='space-y-1'>
              <div className='flex justify-between items-center'>
                <span className='text-xs text-gray-500'>Payment Progress</span>
                <span className='text-xs font-medium text-gray-700'>
                  {Math.round(paymentStatus.progressPercentage)}%
                </span>
              </div>
              <div className='w-full bg-gray-200 rounded-full h-1.5'>
                <div
                  className='bg-primary-600 h-1.5 rounded-full transition-all duration-300'
                  style={{ width: `${paymentStatus.progressPercentage}%` }}
                />
              </div>
              <div className='text-xs text-gray-500'>
                {formatCurrency(paymentStatus.totalPaid)} of{' '}
                {formatCurrency(paymentStatus.totalScheduled)} paid
              </div>
            </div>
          )}
        </div>
      </div>
    </button>
  );
}

export default memo(ExpenseListItem);
