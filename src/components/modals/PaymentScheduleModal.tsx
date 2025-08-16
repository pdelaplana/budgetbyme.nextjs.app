'use client';

import {
  CalendarDaysIcon,
  CheckCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  TrashIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import React, { useState } from 'react';
import MarkAsPaidModal from './MarkAsPaidModal';

interface PaymentScheduleItem {
  id: string;
  description: string;
  amount: number;
  dueDate: string;
  isPaid: boolean;
  paidDate?: string;
  paymentMethod?: string;
  notes?: string;
}

interface PaymentScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  expenseId: string;
  expenseName: string;
  totalAmount: number;
  schedule: PaymentScheduleItem[];
  onUpdatePayment?: (
    paymentId: string,
    updates: Partial<PaymentScheduleItem>,
  ) => void;
  onAddPayment?: (payment: Omit<PaymentScheduleItem, 'id'>) => void;
  onDeleteSchedule?: () => void;
}

export default function PaymentScheduleModal({
  isOpen,
  onClose,
  expenseId,
  expenseName,
  totalAmount,
  schedule,
  onUpdatePayment,
  onAddPayment,
  onDeleteSchedule,
}: PaymentScheduleModalProps) {
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [showMarkAsPaid, setShowMarkAsPaid] = useState(false);
  const [selectedPayment, setSelectedPayment] =
    useState<PaymentScheduleItem | null>(null);
  const [newPayment, setNewPayment] = useState({
    description: '',
    amount: '',
    dueDate: '',
    notes: '',
  });

  // Prevent body scroll when modal is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getPaymentStatus = (payment: PaymentScheduleItem) => {
    if (payment.isPaid) {
      return {
        icon: CheckCircleIcon,
        text: `Paid ${formatDate(payment.paidDate!)}`,
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
          text: `Due ${formatDate(payment.dueDate)}`,
          className: 'text-gray-600',
          bgClassName: 'bg-gray-50',
          borderClassName: 'border-gray-200',
        };
      }
    }
  };

  const handleMarkAsPaidClick = (payment: PaymentScheduleItem) => {
    setSelectedPayment(payment);
    setShowMarkAsPaid(true);
  };

  const handleMarkAsPaid = (paymentData: any) => {
    if (onUpdatePayment && selectedPayment) {
      onUpdatePayment(selectedPayment.id, {
        isPaid: true,
        paidDate: paymentData.datePaid,
        paymentMethod: paymentData.paymentMethod,
      });
    }
    setShowMarkAsPaid(false);
    setSelectedPayment(null);
  };

  const handleAddPayment = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPayment.description || !newPayment.amount || !newPayment.dueDate) {
      return;
    }

    if (onAddPayment) {
      onAddPayment({
        description: newPayment.description,
        amount: Number(newPayment.amount),
        dueDate: newPayment.dueDate,
        isPaid: false,
        notes: newPayment.notes,
      });
    }

    // Reset form
    setNewPayment({
      description: '',
      amount: '',
      dueDate: '',
      notes: '',
    });
    setShowAddPayment(false);
  };

  const handleDeleteSchedule = () => {
    if (
      window.confirm(
        'Are you sure you want to delete this payment schedule? This will convert the expense back to a single payment and cannot be undone.',
      )
    ) {
      if (onDeleteSchedule) {
        onDeleteSchedule();
      }
      onClose();
    }
  };

  const totalScheduled = schedule.reduce(
    (sum, payment) => sum + payment.amount,
    0,
  );
  const totalPaid = schedule
    .filter((p) => p.isPaid)
    .reduce((sum, payment) => sum + payment.amount, 0);
  const remainingBalance = totalScheduled - totalPaid;

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-white z-50 flex flex-col'>
      {/* Fixed Header */}
      <div className='flex-shrink-0 bg-white border-b border-gray-200 shadow-sm'>
        <div className='max-w-2xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex items-center justify-between py-4'>
            <div className='flex items-center space-x-3 flex-1 min-w-0'>
              <CalendarDaysIcon className='h-6 w-6 text-primary-600 flex-shrink-0' />
              <div className='flex-1 min-w-0'>
                <h2 className='text-lg sm:text-xl font-semibold text-gray-900 truncate'>
                  Payment Schedule
                </h2>
                <p className='text-sm text-gray-600 truncate'>{expenseName}</p>
              </div>
            </div>
            <div className='flex items-center space-x-2'>
              {onDeleteSchedule && (
                <button
                  onClick={handleDeleteSchedule}
                  className='p-1.5 hover:bg-red-50 rounded-lg transition-colors duration-200 text-red-600 hover:text-red-800'
                  aria-label='Delete schedule'
                  title='Delete payment schedule'
                >
                  <TrashIcon className='h-5 w-5' />
                </button>
              )}
              <button
                onClick={onClose}
                className='p-1.5 hover:bg-gray-100 rounded-lg transition-colors duration-200'
                aria-label='Close modal'
              >
                <XMarkIcon className='h-5 w-5 text-gray-400' />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className='flex-1 overflow-y-auto'>
        <div className='max-w-2xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6'>
          {/* Summary Card */}
          <div className='bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl p-6'>
            <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 text-center'>
              <div>
                <div className='text-2xl font-bold text-primary-900'>
                  {formatCurrency(totalScheduled)}
                </div>
                <div className='text-sm text-primary-700'>Total Scheduled</div>
              </div>
              <div>
                <div className='text-2xl font-bold text-success-700'>
                  {formatCurrency(totalPaid)}
                </div>
                <div className='text-sm text-success-600'>Total Paid</div>
              </div>
              <div>
                <div className='text-2xl font-bold text-gray-700'>
                  {formatCurrency(remainingBalance)}
                </div>
                <div className='text-sm text-gray-600'>Remaining</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className='mt-4'>
              <div className='flex justify-between text-sm text-primary-700 mb-2'>
                <span>Progress</span>
                <span>{Math.round((totalPaid / totalScheduled) * 100)}%</span>
              </div>
              <div className='w-full bg-white rounded-full h-3'>
                <div
                  className='bg-primary-600 h-3 rounded-full transition-all duration-500'
                  style={{
                    width: `${Math.min((totalPaid / totalScheduled) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Payment Schedule List */}
          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <h3 className='text-lg font-semibold text-gray-900'>
                Payment Schedule ({schedule.length} payments)
              </h3>
              <button
                onClick={() => setShowAddPayment(true)}
                className='btn-secondary text-sm flex items-center'
              >
                <PlusIcon className='h-4 w-4 mr-1' />
                Add Payment
              </button>
            </div>

            {schedule.map((payment, index) => {
              const status = getPaymentStatus(payment);
              const StatusIcon = status.icon;

              return (
                <div
                  key={payment.id}
                  className={`border rounded-lg p-4 transition-all duration-200 ${status.borderClassName}`}
                >
                  <div className='flex items-start justify-between mb-3'>
                    <div className='flex-1 min-w-0'>
                      <div className='flex items-center justify-between mb-2'>
                        <h4 className='text-base font-semibold text-gray-900 truncate'>
                          #{index + 1} - {payment.description}
                        </h4>
                        <span className='text-lg font-bold text-gray-900 ml-4'>
                          {formatCurrency(payment.amount)}
                        </span>
                      </div>

                      <div
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${status.className} ${status.bgClassName} ${status.borderClassName}`}
                      >
                        <StatusIcon className='h-4 w-4 mr-2' />
                        {status.text}
                      </div>
                    </div>
                  </div>

                  {payment.notes && (
                    <div className='mb-3'>
                      <p className='text-sm text-gray-600'>{payment.notes}</p>
                    </div>
                  )}

                  {payment.isPaid ? (
                    <div className='bg-success-50 rounded-lg p-3 border border-success-200'>
                      <div className='flex items-center justify-between text-sm'>
                        <span className='text-success-700'>
                          Payment method:{' '}
                          <span className='font-medium'>
                            {payment.paymentMethod}
                          </span>
                        </span>
                        <span className='text-success-600'>
                          Paid on {formatDate(payment.paidDate!)}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className='flex space-x-2'>
                      <button
                        onClick={() => handleMarkAsPaidClick(payment)}
                        className='btn-primary text-sm px-4 py-2'
                      >
                        Mark as Paid
                      </button>
                      <button className='btn-secondary text-sm px-4 py-2'>
                        Edit
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Add Payment Form */}
          {showAddPayment && (
            <div className='bg-white border border-gray-200 rounded-lg p-6'>
              <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                Add New Payment
              </h3>

              <form onSubmit={handleAddPayment} className='space-y-4'>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                  <div>
                    <label className='form-label'>Payment Description</label>
                    <input
                      type='text'
                      value={newPayment.description}
                      onChange={(e) =>
                        setNewPayment((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      placeholder='e.g., Final payment'
                      className='form-input'
                      required
                    />
                  </div>

                  <div>
                    <label className='form-label'>Amount</label>
                    <div className='relative'>
                      <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                        <span className='text-gray-500 sm:text-sm'>$</span>
                      </div>
                      <input
                        type='number'
                        value={newPayment.amount}
                        onChange={(e) =>
                          setNewPayment((prev) => ({
                            ...prev,
                            amount: e.target.value,
                          }))
                        }
                        placeholder='0.00'
                        className='form-input pl-7'
                        min='0'
                        step='0.01'
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className='form-label'>Due Date</label>
                  <input
                    type='date'
                    value={newPayment.dueDate}
                    onChange={(e) =>
                      setNewPayment((prev) => ({
                        ...prev,
                        dueDate: e.target.value,
                      }))
                    }
                    className='form-input'
                    required
                  />
                </div>

                <div>
                  <label className='form-label'>Notes (Optional)</label>
                  <textarea
                    value={newPayment.notes}
                    onChange={(e) =>
                      setNewPayment((prev) => ({
                        ...prev,
                        notes: e.target.value,
                      }))
                    }
                    placeholder='Additional notes for this payment...'
                    rows={2}
                    className='form-input resize-none'
                  />
                </div>

                <div className='flex space-x-3'>
                  <button
                    type='button'
                    onClick={() => setShowAddPayment(false)}
                    className='btn-secondary flex-1'
                  >
                    Cancel
                  </button>
                  <button type='submit' className='btn-primary flex-1'>
                    Add Payment
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Fixed Footer */}
      <div className='flex-shrink-0 bg-white border-t border-gray-200 shadow-lg'>
        <div className='max-w-2xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-center py-4'>
            <button onClick={onClose} className='btn-secondary px-8'>
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Mark as Paid Modal for Individual Payments */}
      {selectedPayment && (
        <MarkAsPaidModal
          isOpen={showMarkAsPaid}
          onClose={() => {
            setShowMarkAsPaid(false);
            setSelectedPayment(null);
          }}
          expenseId={expenseId}
          expenseName={`${selectedPayment.description} - ${expenseName}`}
          expenseAmount={selectedPayment.amount}
          onMarkAsPaid={handleMarkAsPaid}
        />
      )}
    </div>
  );
}
