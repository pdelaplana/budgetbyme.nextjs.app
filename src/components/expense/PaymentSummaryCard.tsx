'use client';

import React from 'react';
import { formatCurrency } from '@/lib/formatters';
import type { PaymentStatus } from '@/lib/paymentCalculations';

interface PaymentSummaryCardProps {
  paymentStatus: PaymentStatus;
  showProgressBar?: boolean;
}

const PaymentSummaryCard = React.memo<PaymentSummaryCardProps>(
  ({ paymentStatus, showProgressBar = true }) => {
    const { totalScheduled, totalPaid, remainingBalance } = paymentStatus;
    const progressPercentage =
      totalScheduled > 0 ? (totalPaid / totalScheduled) * 100 : 0;

    return (
      <div className='bg-primary-50 border border-primary-200 rounded-lg p-4'>
        <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 text-center'>
          <div>
            <p className='text-sm text-primary-600 font-medium'>Total Amount</p>
            <p className='text-lg font-bold text-primary-900'>
              {formatCurrency(totalScheduled)}
            </p>
          </div>
          <div>
            <p className='text-sm text-success-600 font-medium'>Paid</p>
            <p className='text-lg font-bold text-success-700'>
              {formatCurrency(totalPaid)}
            </p>
          </div>
          <div>
            <p className='text-sm text-gray-600 font-medium'>Remaining</p>
            <p className='text-lg font-bold text-gray-900'>
              {formatCurrency(remainingBalance)}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        {showProgressBar && (
          <div className='mt-4'>
            <div className='flex justify-between items-center mb-2'>
              <span className='text-sm font-medium text-primary-700'>
                Payment Progress
              </span>
              <span className='text-sm font-bold text-primary-700'>
                {Math.round(progressPercentage)}%
              </span>
            </div>
            <div className='w-full bg-primary-200 rounded-full h-3'>
              <div
                className='bg-primary-600 h-3 rounded-full transition-all duration-500'
                style={{
                  width: `${Math.min(progressPercentage, 100)}%`,
                }}
              />
            </div>
          </div>
        )}
      </div>
    );
  },
);

PaymentSummaryCard.displayName = 'PaymentSummaryCard';

export default PaymentSummaryCard;
