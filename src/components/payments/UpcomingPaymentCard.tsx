'use client';

import { CalendarIcon, CreditCardIcon } from '@heroicons/react/24/outline';
import type { UpcomingPayment } from '@/hooks/payments';
import { formatCurrency, formatDate } from '@/lib/formatters';

interface UpcomingPaymentCardProps {
  payment: UpcomingPayment;
  onPaymentClick: (payment: UpcomingPayment) => void;
  onMarkAsPaid?: (payment: UpcomingPayment) => void;
}

export default function UpcomingPaymentCard({
  payment,
  onPaymentClick,
  onMarkAsPaid,
}: UpcomingPaymentCardProps) {
  const getStatusColor = (status: UpcomingPayment['status']) => {
    switch (status) {
      case 'overdue':
        return {
          badge: 'bg-red-100 text-red-800',
          border: 'border-red-200',
          indicator: 'bg-red-500',
        };
      case 'due-soon':
        return {
          badge: 'bg-amber-100 text-amber-800',
          border: 'border-amber-200',
          indicator: 'bg-amber-500',
        };
      case 'upcoming':
        return {
          badge: 'bg-blue-100 text-blue-800',
          border: 'border-blue-200',
          indicator: 'bg-blue-500',
        };
    }
  };

  const getStatusText = (status: UpcomingPayment['status']) => {
    switch (status) {
      case 'overdue':
        return 'Overdue';
      case 'due-soon':
        return 'Due Soon';
      case 'upcoming':
        return 'Upcoming';
    }
  };
  const colors = getStatusColor(payment.status);

  return (
    <div className='relative w-full group'>
      <button
        type='button'
        className={`relative flex w-full items-center justify-between rounded-lg border ${colors.border} p-3 sm:p-4 transition-colors duration-200 text-left hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${onMarkAsPaid ? 'pr-12 sm:pr-14' : ''}`}
        onClick={() => onPaymentClick(payment)}
      >
        {/* Status Indicator */}
        <div
          className={`absolute left-0 top-0 bottom-0 w-1 ${colors.indicator} rounded-l-lg`}
        />

        {/* Payment Info */}
        <div className='flex-1 min-w-0 ml-2'>
          {/* Top Row - Payment Name & Amount */}
          <div className='flex items-start justify-between mb-1'>
            <div className='flex items-center min-w-0 flex-1'>
              <span className='text-lg mr-2 flex-shrink-0'>
                {payment.categoryIcon}
              </span>
              <div className='min-w-0 flex-1'>
                <h3 className='text-sm font-medium text-gray-900 truncate'>
                  {payment.expenseName}
                </h3>
                <p className='text-xs text-gray-500 truncate'>{payment.name}</p>
              </div>
            </div>
            <div className='text-right ml-3'>
              <div className='text-sm font-semibold text-gray-900'>
                {formatCurrency(payment.amount)}
              </div>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colors.badge}`}
              >
                {getStatusText(payment.status)}
              </span>
            </div>
          </div>

          {/* Bottom Row - Due Date & Category */}
          <div className='flex items-center justify-between'>
            <div className='flex items-center text-xs text-gray-500'>
              <CalendarIcon className='h-3 w-3 mr-1' />
              <span>Due {formatDate(payment.dueDate)}</span>
            </div>
            <div className='flex items-center text-xs text-gray-500'>
              <div
                className='w-2 h-2 rounded-full mr-1.5'
                style={{ backgroundColor: payment.categoryColor }}
              />
              <span className='truncate max-w-[80px]'>
                {payment.categoryName}
              </span>
            </div>
          </div>
        </div>
      </button>

      {/* Quick Action Button */}
      {onMarkAsPaid && (
        <button
          type='button'
          onClick={(e) => {
            e.stopPropagation();
            onMarkAsPaid(payment);
          }}
          className='opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity duration-200 p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-full absolute right-3 top-1/2 -translate-y-1/2'
          title='Mark as paid'
        >
          <CreditCardIcon className='h-4 w-4' />
        </button>
      )}
    </div>
  );
}
