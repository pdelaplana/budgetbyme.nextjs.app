'use client';

import {
  CalendarDaysIcon,
  CheckCircleIcon,
  ClockIcon,
  CreditCardIcon,
  ExclamationTriangleIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import React from 'react';
import { formatCurrency, formatDate } from '@/lib/formatters';
import {
  calculatePaymentStatus,
  type ExpenseWithPayments,
  type Payment as CalculatedPayment,
} from '@/lib/paymentCalculations';
import PaymentSummaryCard from './PaymentSummaryCard';

interface PaymentScheduleSectionProps {
  expense: ExpenseWithPayments;
  onMarkPaymentAsPaid: (payment: CalculatedPayment) => void;
  onDeleteAllPayments: () => void;
  onEditSchedule: () => void;
  onCreateSchedule: () => void;
  onMarkAsPaid: () => void;
}

const PaymentScheduleSection = React.memo<PaymentScheduleSectionProps>(
  ({
    expense,
    onMarkPaymentAsPaid,
    onDeleteAllPayments,
    onEditSchedule,
    onCreateSchedule,
    onMarkAsPaid,
  }) => {
    // Calculate payment status using centralized utility
    const paymentStatus = calculatePaymentStatus(expense);
    const { hasPayments, allPayments } = paymentStatus;

    const getPaymentStatus = (payment: CalculatedPayment) => {
      if (payment.isPaid) {
        return {
          icon: CheckCircleIcon,
          text: 'Paid',
          className: 'text-success-600',
          bgClassName: 'bg-success-50',
          borderClassName: 'border-success-200',
        };
      } else {
        const today = new Date();
        const dueDate = new Date(payment.dueDate);
        const daysUntilDue = Math.ceil(
          (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
        );

        if (daysUntilDue < 0) {
          return {
            icon: ExclamationTriangleIcon,
            text: `${Math.abs(daysUntilDue)} days overdue`,
            className: 'text-red-600',
            bgClassName: 'bg-red-50',
            borderClassName: 'border-red-200',
          };
        } else if (daysUntilDue <= 7) {
          return {
            icon: ClockIcon,
            text: `Due in ${daysUntilDue} days`,
            className: 'text-warning-600',
            bgClassName: 'bg-warning-50',
            borderClassName: 'border-warning-200',
          };
        } else {
          return {
            icon: ClockIcon,
            text: `Due ${formatDate(dueDate)}`,
            className: 'text-gray-600',
            bgClassName: 'bg-gray-50',
            borderClassName: 'border-gray-200',
          };
        }
      }
    };

    return (
      <div className='card'>
        <h3 className='text-lg font-semibold text-gray-900 mb-4 flex items-center'>
          <CreditCardIcon className='h-5 w-5 mr-2' />
          Payment Information
        </h3>

        {hasPayments && allPayments.length > 0 ? (
          <div className='space-y-4'>
            {/* Payment Schedule Summary */}
            <PaymentSummaryCard
              paymentStatus={paymentStatus}
              showProgressBar={true}
            />

            {/* Individual Payments */}
            <div>
              <div className='flex items-center mb-3'>
                <h4 className='text-base font-semibold text-gray-900'>
                  Payment Schedule
                </h4>
                <div className='flex items-center space-x-2 ml-2'>
                  {/* Only show edit button for actual payment schedules, not one-off payments */}
                  {expense.hasPaymentSchedule &&
                    expense.paymentSchedule &&
                    expense.paymentSchedule.length > 0 && (
                      <button
                        type='button'
                        onClick={onEditSchedule}
                        className='p-1 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors duration-200'
                        title='Edit payment schedule'
                      >
                        <PencilIcon className='h-4 w-4' />
                      </button>
                    )}
                  <button
                    type='button'
                    onClick={onDeleteAllPayments}
                    className='p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors duration-200'
                    title='Remove all payments'
                  >
                    <TrashIcon className='h-4 w-4' />
                  </button>
                </div>
              </div>

              <div className='space-y-3'>
                {allPayments.map((payment) => {
                  const status = getPaymentStatus(payment);
                  const StatusIcon = status.icon;

                  return (
                    <div
                      key={payment.id}
                      className={`p-4 rounded-lg border ${status.borderClassName} ${status.bgClassName}`}
                    >
                      <div className='flex items-start justify-between'>
                        <div className='flex items-start space-x-3'>
                          <StatusIcon
                            className={`h-5 w-5 mt-0.5 flex-shrink-0 ${status.className}`}
                          />
                          <div className='flex-1'>
                            <h5 className='font-semibold text-gray-900'>
                              {payment.description || 'Payment'}
                            </h5>
                            <p
                              className={`text-sm ${status.className} font-medium mt-1`}
                            >
                              {status.text}
                            </p>
                          </div>
                        </div>
                        <div className='text-right'>
                          <span className='text-lg font-bold text-gray-900'>
                            {formatCurrency(payment.amount)}
                          </span>
                          {!payment.isPaid && (
                            <div className='mt-2'>
                              <button
                                type='button'
                                onClick={() => onMarkPaymentAsPaid(payment)}
                                className='btn-primary text-xs px-3 py-1.5'
                              >
                                Mark as Paid
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* No Payment Schedule - Show Payment Options */
          <div className='space-y-4'>
            <div className='p-4 bg-gray-50 rounded-lg border border-gray-200'>
              <div className='flex items-start space-x-4 mb-4'>
                <ClockIcon className='h-6 w-6 text-gray-500 flex-shrink-0 mt-0.5' />
                <div className='flex-1'>
                  <span className='font-semibold text-gray-700'>
                    No Payment Schedule
                  </span>
                  <p className='text-sm text-gray-600 mt-1'>
                    This expense doesn't have any payment schedule yet. You can
                    create one to break down the payment into multiple
                    installments.
                  </p>
                </div>
              </div>
              <div className='text-center'>
                <button
                  type='button'
                  onClick={onCreateSchedule}
                  className='btn-secondary flex items-center justify-center mx-auto px-6 py-3 w-full sm:w-auto sm:min-w-[280px]'
                >
                  <CalendarDaysIcon className='h-4 w-4 mr-2 flex-shrink-0' />
                  <span className='text-center'>
                    <span className='hidden sm:inline'>
                      Create Payment Schedule
                    </span>
                    <span className='sm:hidden'>Create Schedule</span>
                  </span>
                </button>
              </div>
            </div>

            <div className='bg-primary-50 border border-primary-200 rounded-lg p-4'>
              <div className='flex items-start space-x-4 mb-4'>
                <CheckCircleIcon className='h-6 w-6 text-primary-500 flex-shrink-0 mt-0.5' />
                <div className='flex-1'>
                  <h4 className='text-sm font-medium text-primary-800 mb-3'>
                    Mark as Paid
                  </h4>
                  <p className='text-sm text-primary-700'>
                    If you've already paid the full amount for this expense, you
                    can mark it as paid to track your payment.
                  </p>
                </div>
              </div>
              <div className='text-center'>
                <button
                  type='button'
                  onClick={onMarkAsPaid}
                  className='btn-primary mx-auto px-6 py-3 w-full sm:w-auto sm:min-w-[280px]'
                >
                  Mark as Paid
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  },
);

PaymentScheduleSection.displayName = 'PaymentScheduleSection';

export default PaymentScheduleSection;
