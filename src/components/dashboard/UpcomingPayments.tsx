'use client';

import {
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import React from 'react';
import { formatCurrency, formatDate } from '@/lib/formatters';
import type { Payment } from '@/types/Payment';

interface UpcomingPayment extends Pick<Payment, 'id' | 'name' | 'amount' | 'dueDate'> {
  daysUntilDue: number;
  category: string;
  priority: 'low' | 'medium' | 'high';
}

interface UpcomingPaymentsProps {
  payments: UpcomingPayment[];
}

export default function UpcomingPayments({ payments }: UpcomingPaymentsProps) {


  const getPriorityIcon = (priority: string, daysUntilDue: number) => {
    if (daysUntilDue < 0) {
      return <ExclamationTriangleIcon className='h-5 w-5 text-danger-600' />;
    }
    if (daysUntilDue <= 7) {
      return <ClockIcon className='h-5 w-5 text-warning-600' />;
    }
    return <ClockIcon className='h-5 w-5 text-gray-400' />;
  };

  const getPriorityColor = (daysUntilDue: number) => {
    if (daysUntilDue < 0) return 'border-danger-200 bg-danger-50';
    if (daysUntilDue <= 3) return 'border-danger-200 bg-danger-50';
    if (daysUntilDue <= 7) return 'border-warning-200 bg-warning-50';
    return 'border-gray-200 bg-white';
  };

  const getDueDateText = (daysUntilDue: number) => {
    if (daysUntilDue < 0) {
      return `${Math.abs(daysUntilDue)} days overdue`;
    }
    if (daysUntilDue === 0) return 'Due today';
    if (daysUntilDue === 1) return 'Due tomorrow';
    return `Due in ${daysUntilDue} days`;
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      'Venue & Reception': '🏛️',
      'Catering & Beverages': '🍰',
      'Photography & Video': '📸',
      Attire: '👗',
      'Flowers & Decorations': '💐',
      'Music & Entertainment': '🎵',
    };
    return icons[category] || '🎉';
  };

  // Sort payments by urgency (overdue first, then by days until due)
  const sortedPayments = [...payments].sort((a, b) => {
    if (a.daysUntilDue < 0 && b.daysUntilDue >= 0) return -1;
    if (b.daysUntilDue < 0 && a.daysUntilDue >= 0) return 1;
    return a.daysUntilDue - b.daysUntilDue;
  });

  if (payments.length === 0) {
    return (
      <div className='text-center py-8'>
        <CheckCircleIcon className='h-12 w-12 text-success-600 mx-auto mb-3' />
        <p className='text-body text-gray-600 mb-2'>All caught up!</p>
        <p className='text-body-sm text-gray-500'>No upcoming payments due</p>
      </div>
    );
  }

  return (
    <div className='space-y-2'>
      {sortedPayments.map((payment) => (
        <div
          key={payment.id}
          className={`p-3 rounded-lg border transition-all duration-200 hover:shadow-sm ${getPriorityColor(
            payment.daysUntilDue,
          )}`}
        >
          <div className='flex items-center justify-between'>
            <div className='flex items-center flex-1 min-w-0'>
              {/* Category Icon */}
              <span className='text-sm mr-2 flex-shrink-0'>
                {getCategoryIcon(payment.category)}
              </span>

              <div className='flex-1 min-w-0'>
                {/* Payment Name and Amount - Compact Layout */}
                <div className='flex items-center justify-between mb-1'>
                  <h3 className='text-sm font-semibold text-gray-900 truncate'>
                    {payment.name}
                  </h3>
                  <span className='text-sm font-bold text-gray-900 ml-2'>
                    {formatCurrency(payment.amount)}
                  </span>
                </div>

                {/* Due Date and Priority - Compact */}
                <div className='flex items-center justify-between'>
                  <div className='flex items-center'>
                    {getPriorityIcon(payment.priority, payment.daysUntilDue)}
                    <span
                      className={`ml-1 text-xs ${
                        payment.daysUntilDue < 0
                          ? 'text-danger-700 font-medium'
                          : payment.daysUntilDue <= 7
                            ? 'text-warning-700'
                            : 'text-gray-600'
                      }`}
                    >
                      {formatDate(payment.dueDate)}
                    </span>
                  </div>
                  <span
                    className={`text-xs font-medium ${
                      payment.daysUntilDue < 0
                        ? 'text-danger-700'
                        : payment.daysUntilDue <= 7
                          ? 'text-warning-700'
                          : 'text-gray-600'
                    }`}
                  >
                    {getDueDateText(payment.daysUntilDue)}
                  </span>
                </div>
              </div>
            </div>

            {/* Compact Action Buttons */}
            <div className='flex items-center space-x-1 ml-3'>
              <button className='px-2 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors duration-200'>
                Later
              </button>
              <button className='px-2 py-1 text-xs font-medium text-white bg-primary-600 rounded hover:bg-primary-700 transition-colors duration-200'>
                Paid
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* Compact Summary */}
      {payments.some((p) => p.daysUntilDue < 0) && (
        <div className='mt-3 p-2 bg-danger-50 border border-danger-200 rounded-lg'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center'>
              <ExclamationTriangleIcon className='h-4 w-4 text-danger-600 mr-1' />
              <span className='text-xs font-medium text-danger-800'>
                {payments.filter((p) => p.daysUntilDue < 0).length} overdue
              </span>
            </div>
            <button className='text-xs text-danger-700 hover:text-danger-800 font-medium'>
              View →
            </button>
          </div>
        </div>
      )}

      {/* Compact Stats */}
      <div className='mt-3 pt-3 border-t border-gray-200 flex justify-between text-center'>
        <div>
          <div className='text-sm font-bold text-gray-900'>
            {formatCurrency(payments.reduce((sum, p) => sum + p.amount, 0))}
          </div>
          <div className='text-xs text-gray-600'>Total Due</div>
        </div>
        <div>
          <div className='text-sm font-bold text-warning-600'>
            {payments.filter((p) => p.daysUntilDue <= 7).length}
          </div>
          <div className='text-xs text-gray-600'>This Week</div>
        </div>
      </div>
    </div>
  );
}
