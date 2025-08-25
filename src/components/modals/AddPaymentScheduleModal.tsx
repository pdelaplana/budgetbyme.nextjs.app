'use client';

import {
  CalendarDaysIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  PlusIcon,
  TrashIcon,
  XMarkIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useEventDetails } from '@/contexts/EventDetailsContext';
import { useCreatePaymentScheduleMutation, useUpdatePaymentScheduleMutation } from '@/hooks/payments';
import type { PaymentMethod, Payment } from '@/types/Payment';
import { formatCurrency } from '@/lib/formatters';

interface PaymentScheduleItem {
  id: string;
  name: string;
  description: string;
  amount: string;
  paymentMethod: PaymentMethod | '';
  dueDate: string;
  notes: string;
}

interface PaymentScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  expenseId: string;
  expenseName: string;
  totalAmount: number;
  existingPayments?: Payment[]; // For editing existing schedule
  mode?: 'create' | 'edit';
  onCreateSchedule?: (
    payments: Array<{
      name: string;
      description: string;
      amount: number;
      paymentMethod: PaymentMethod;
      dueDate: string;
      notes?: string;
    }>,
  ) => void;
  onUpdateSchedule?: (
    payments: Array<{
      name: string;
      description: string;
      amount: number;
      paymentMethod: PaymentMethod;
      dueDate: string;
      notes?: string;
    }>,
  ) => void;
}

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'credit-card', label: 'Credit Card' },
  { value: 'debit-card', label: 'Debit Card' },
  { value: 'bank-transfer', label: 'Bank Transfer' },
  { value: 'paypal', label: 'PayPal' },
  { value: 'cash', label: 'Cash' },
];

export default function PaymentScheduleModal({
  isOpen,
  onClose,
  expenseId,
  expenseName,
  totalAmount,
  existingPayments,
  mode = 'create',
  onCreateSchedule,
  onUpdateSchedule,
}: PaymentScheduleModalProps) {
  // Hooks
  const { user } = useAuth();
  const { event } = useEventDetails();
  
  // Initialize payments based on mode
  const getInitialPayments = (): PaymentScheduleItem[] => {
    if (mode === 'edit' && existingPayments && existingPayments.length > 0) {
      return existingPayments.map((payment) => ({
        id: payment.id,
        name: payment.name,
        description: payment.description,
        amount: payment.amount.toString(),
        paymentMethod: payment.paymentMethod,
        dueDate: payment.dueDate.toISOString().split('T')[0],
        notes: payment.notes || '',
      }));
    }
    
    return [
      {
        id: 'payment-1',
        name: 'Initial Deposit',
        description: 'Booking confirmation payment',
        amount: Math.round(totalAmount * 0.5).toString(),
        paymentMethod: 'cash',
        dueDate: '',
        notes: '',
      },
      {
        id: 'payment-2',
        name: 'Final Payment', 
        description: 'Remaining balance payment',
        amount: (totalAmount - Math.round(totalAmount * 0.5)).toString(),
        paymentMethod: 'cash',
        dueDate: '',
        notes: '',
      },
    ];
  };

  const [payments, setPayments] = useState<PaymentScheduleItem[]>(getInitialPayments());

  const [errors, setErrors] = useState<Record<string, Record<string, string>>>(
    {},
  );
  
  // Mutations
  const createPaymentScheduleMutation = useCreatePaymentScheduleMutation({
    onSuccess: () => {
      toast.success(`Payment schedule created with ${payments.length} payments!`);
      resetForm();
      onClose();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create payment schedule');
    },
  });

  const updatePaymentScheduleMutation = useUpdatePaymentScheduleMutation({
    onSuccess: () => {
      toast.success(`Payment schedule updated with ${payments.length} payments!`);
      resetForm();
      onClose();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update payment schedule');
    },
  });
  
  const isSubmitting = createPaymentScheduleMutation.isPending || updatePaymentScheduleMutation.isPending;


  // Reinitialize payments when modal opens or existing payments change
  React.useEffect(() => {
    if (isOpen) {
      setPayments(getInitialPayments());
      setErrors({});
    }
  }, [isOpen, existingPayments, mode, totalAmount]);


  const handlePaymentChange = (
    paymentId: string,
    field: keyof PaymentScheduleItem,
    value: string,
  ) => {
    setPayments((prev) =>
      prev.map((payment) =>
        payment.id === paymentId
          ? {
              ...payment,
              [field]:
                field === 'amount' ? value.replace(/[^\d.]/g, '') : value,
            }
          : payment,
      ),
    );

    // Clear error when user starts typing
    if (errors[paymentId]?.[field]) {
      setErrors((prev) => ({
        ...prev,
        [paymentId]: {
          ...prev[paymentId],
          [field]: '',
        },
      }));
    }
  };

  const addPayment = () => {
    const newPayment: PaymentScheduleItem = {
      id: `payment-${Date.now()}`,
      name: '',
      description: '',
      amount: '',
      paymentMethod: 'cash',
      dueDate: '',
      notes: '',
    };
    setPayments((prev) => [...prev, newPayment]);
  };

  const removePayment = (paymentId: string) => {
    if (payments.length > 1) {
      setPayments((prev) => prev.filter((payment) => payment.id !== paymentId));
      // Remove errors for this payment
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[paymentId];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, Record<string, string>> = {};
    let hasErrors = false;

    payments.forEach((payment) => {
      const paymentErrors: Record<string, string> = {};

      if (!payment.name.trim()) {
        paymentErrors.name = 'Payment name is required';
        hasErrors = true;
      }

      if (!payment.description.trim()) {
        paymentErrors.description = 'Description is required';
        hasErrors = true;
      }

      if (!payment.amount.trim()) {
        paymentErrors.amount = 'Amount is required';
        hasErrors = true;
      } else if (isNaN(Number(payment.amount)) || Number(payment.amount) <= 0) {
        paymentErrors.amount = 'Please enter a valid amount';
        hasErrors = true;
      }

      if (!payment.paymentMethod) {
        paymentErrors.paymentMethod = 'Payment method is required';
        hasErrors = true;
      }

      if (!payment.dueDate) {
        paymentErrors.dueDate = 'Due date is required';
        hasErrors = true;
      }

      if (Object.keys(paymentErrors).length > 0) {
        newErrors[payment.id] = paymentErrors;
      }
    });

    // Check if total matches expense amount
    const totalScheduled = payments.reduce(
      (sum, payment) => sum + (Number(payment.amount) || 0),
      0,
    );
    if (Math.abs(totalScheduled - totalAmount) > 0.01) {
      // Add a general error for total mismatch
      newErrors.total = {
        amount: `Total scheduled payments (${formatCurrency(totalScheduled)}) must equal expense amount (${formatCurrency(totalAmount)})`,
      };
      hasErrors = true;
    }

    setErrors(newErrors);
    return !hasErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Validate required context
    if (!user?.uid) {
      toast.error('User not authenticated');
      return;
    }

    if (!event?.id) {
      toast.error('No event selected');
      return;
    }

    try {
      // Prepare the payment schedule data
      const scheduleData = payments.map((payment) => ({
        name: payment.name.trim(),
        description: payment.description.trim(),
        amount: Number(payment.amount),
        paymentMethod: payment.paymentMethod as PaymentMethod,
        dueDate: new Date(payment.dueDate),
        notes: payment.notes.trim() || undefined,
        attachments: [],
      }));

      if (mode === 'edit') {
        // Update existing payment schedule
        await updatePaymentScheduleMutation.mutateAsync({
          userId: user.uid,
          eventId: event.id,
          expenseId,
          payments: scheduleData,
        });
        
        // Call update callback if provided
        if (onUpdateSchedule) {
          onUpdateSchedule(scheduleData.map(payment => ({
            name: payment.name,
            description: payment.description,
            amount: payment.amount,
            paymentMethod: payment.paymentMethod,
            dueDate: payment.dueDate.toISOString().split('T')[0],
            notes: payment.notes,
          })));
        }
      } else {
        // Create new payment schedule
        await createPaymentScheduleMutation.mutateAsync({
          userId: user.uid,
          eventId: event.id,
          expenseId,
          payments: scheduleData,
        });
        
        // Call create callback if provided
        if (onCreateSchedule) {
          onCreateSchedule(scheduleData.map(payment => ({
            name: payment.name,
            description: payment.description,
            amount: payment.amount,
            paymentMethod: payment.paymentMethod,
            dueDate: payment.dueDate.toISOString().split('T')[0],
            notes: payment.notes,
          })));
        }
      }
    } catch (error) {
      // Error handling is done in mutation callbacks
      console.error(`Error ${mode === 'edit' ? 'updating' : 'creating'} payment schedule:`, error);
    }
  };

  const resetForm = () => {
    setPayments(getInitialPayments());
    setErrors({});
  };

  const handleClose = () => {
    if (!isSubmitting) {
      resetForm();
      onClose();
    }
  };

  const totalScheduled = payments.reduce(
    (sum, payment) => sum + (Number(payment.amount) || 0),
    0,
  );
  const isBalanced = Math.abs(totalScheduled - totalAmount) < 0.01;

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
                <h2 className='text-lg sm:text-xl font-semibold text-gray-900'>
                  {mode === 'edit' ? 'Edit Payment Schedule' : 'Create Payment Schedule'}
                </h2>
                <p className='text-sm text-gray-600 truncate'>{expenseName}</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className='p-1.5 hover:bg-gray-100 rounded-lg transition-colors duration-200 disabled:opacity-50'
              aria-label='Close modal'
            >
              <XMarkIcon className='h-5 w-5 text-gray-400' />
            </button>
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
                  {formatCurrency(totalAmount)}
                </div>
                <div className='text-sm text-primary-700'>Expense Total</div>
              </div>
              <div>
                <div
                  className={`text-2xl font-bold ${isBalanced ? 'text-success-700' : 'text-red-700'}`}
                >
                  {formatCurrency(totalScheduled)}
                </div>
                <div className='text-sm text-gray-600'>Scheduled Total</div>
              </div>
              <div>
                <div
                  className={`text-2xl font-bold ${isBalanced ? 'text-success-700' : 'text-red-700'}`}
                >
                  {formatCurrency(totalAmount - totalScheduled)}
                </div>
                <div className='text-sm text-gray-600'>Difference</div>
              </div>
            </div>

            {!isBalanced && (
              <div className='mt-4 p-3 bg-red-50 border border-red-200 rounded-lg'>
                <p className='text-sm text-red-700 text-center'>
                  ⚠️ Scheduled payments must equal the total expense amount
                </p>
              </div>
            )}
          </div>

          {/* Payment Schedule Form */}
          <form onSubmit={handleSubmit} className='space-y-6'>
            <div className='flex items-center justify-between'>
              <h3 className='text-lg font-semibold text-gray-900'>
                Payment Schedule ({payments.length} payments)
              </h3>
              <button
                type='button'
                onClick={addPayment}
                className='btn-secondary text-sm flex items-center'
                disabled={isSubmitting}
              >
                <PlusIcon className='h-4 w-4 mr-1' />
                Add Payment
              </button>
            </div>

            <div className='space-y-4'>
              {payments.map((payment, index) => (
                <div
                  key={payment.id}
                  className='border border-gray-200 rounded-lg p-4'
                >
                  <div className='flex items-center justify-between mb-4'>
                    <h4 className='text-base font-semibold text-gray-900'>
                      Payment #{index + 1}
                    </h4>
                    {payments.length > 1 && (
                      <button
                        type='button'
                        onClick={() => removePayment(payment.id)}
                        className='p-1 text-red-600 hover:text-red-800 transition-colors duration-200'
                        disabled={isSubmitting}
                        aria-label={`Remove payment ${index + 1}`}
                      >
                        <TrashIcon className='h-4 w-4' />
                      </button>
                    )}
                  </div>

                  <div className='space-y-4 mb-4'>
                    {/* Payment Name */}
                    <div>
                      <label className='form-label'>Payment Name</label>
                      <input
                        type='text'
                        value={payment.name}
                        onChange={(e) =>
                          handlePaymentChange(
                            payment.id,
                            'name',
                            e.target.value,
                          )
                        }
                        placeholder='e.g., Initial deposit, Final payment'
                        className={`form-input ${errors[payment.id]?.name ? 'border-red-300 focus:border-red-500' : ''}`}
                        disabled={isSubmitting}
                        maxLength={100}
                      />
                      {errors[payment.id]?.name && (
                        <p className='mt-1 text-sm text-red-600'>
                          {errors[payment.id].name}
                        </p>
                      )}
                    </div>

                    {/* Description */}
                    <div>
                      <label className='form-label'>Description</label>
                      <input
                        type='text'
                        value={payment.description}
                        onChange={(e) =>
                          handlePaymentChange(
                            payment.id,
                            'description',
                            e.target.value,
                          )
                        }
                        placeholder='e.g., Booking confirmation payment'
                        className={`form-input ${errors[payment.id]?.description ? 'border-red-300 focus:border-red-500' : ''}`}
                        disabled={isSubmitting}
                        maxLength={200}
                      />
                      {errors[payment.id]?.description && (
                        <p className='mt-1 text-sm text-red-600'>
                          {errors[payment.id].description}
                        </p>
                      )}
                    </div>

                    {/* Amount, Payment Method, Due Date Row */}
                    <div className='grid grid-cols-1 lg:grid-cols-3 gap-4'>
                      <div>
                        <label className='form-label'>Amount</label>
                        <div className='relative'>
                          <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                            <span className='text-gray-500 sm:text-sm'>$</span>
                          </div>
                          <input
                            type='text'
                            value={payment.amount}
                            onChange={(e) =>
                              handlePaymentChange(
                                payment.id,
                                'amount',
                                e.target.value,
                              )
                            }
                            placeholder='0.00'
                            className={`form-input pl-7 ${errors[payment.id]?.amount ? 'border-red-300 focus:border-red-500' : ''}`}
                            disabled={isSubmitting}
                          />
                        </div>
                        {errors[payment.id]?.amount && (
                          <p className='mt-1 text-sm text-red-600'>
                            {errors[payment.id].amount}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className='form-label' htmlFor={`payment-method-${payment.id}`}>Payment Method</label>
                        <select
                          id={`payment-method-${payment.id}`}
                          value={payment.paymentMethod}
                          onChange={(e) =>
                            handlePaymentChange(
                              payment.id,
                              'paymentMethod',
                              e.target.value,
                            )
                          }
                          className={`form-input ${errors[payment.id]?.paymentMethod ? 'border-red-300 focus:border-red-500' : ''}`}
                          disabled={isSubmitting}
                        >
                          <option value=''>Select method</option>
                          {PAYMENT_METHODS.map((method) => (
                            <option key={method.value} value={method.value}>
                              {method.label}
                            </option>
                          ))}
                        </select>
                        {errors[payment.id]?.paymentMethod && (
                          <p className='mt-1 text-sm text-red-600'>
                            {errors[payment.id].paymentMethod}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className='form-label' htmlFor={`due-date-${payment.id}`}>Due Date</label>
                        <input
                          id={`due-date-${payment.id}`}
                          type='date'
                          value={payment.dueDate}
                          onChange={(e) =>
                            handlePaymentChange(
                              payment.id,
                              'dueDate',
                              e.target.value,
                            )
                          }
                          className={`form-input ${errors[payment.id]?.dueDate ? 'border-red-300 focus:border-red-500' : ''}`}
                          disabled={isSubmitting}
                        />
                        {errors[payment.id]?.dueDate && (
                          <p className='mt-1 text-sm text-red-600'>
                            {errors[payment.id].dueDate}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className='form-label'>Notes (Optional)</label>
                    <input
                      type='text'
                      value={payment.notes}
                      onChange={(e) =>
                        handlePaymentChange(
                          payment.id,
                          'notes',
                          e.target.value,
                        )
                      }
                      placeholder='e.g., 30 days before event'
                      className='form-input'
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Guidelines */}
            <div className='bg-primary-50 border border-primary-200 rounded-lg p-4'>
              <h4 className='text-sm font-medium text-primary-800 mb-2'>
                Payment Schedule Guidelines
              </h4>
              <ul className='text-sm text-primary-700 space-y-1'>
                <li>
                  • Schedule payments should total exactly{' '}
                  {formatCurrency(totalAmount)}
                </li>
                <li>
                  • Consider your planning timeline when setting due dates
                </li>
                <li>
                  • Typical pattern: deposit → milestone payments → final
                  payment
                </li>
                <li>
                  • You can add or edit payments after creating the schedule
                </li>
              </ul>
            </div>

            {/* Total validation error */}
            {errors.total?.amount && (
              <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
                <p className='text-sm text-red-700'>{errors.total.amount}</p>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Fixed Footer */}
      <div className='flex-shrink-0 bg-white border-t border-gray-200 shadow-lg'>
        <div className='max-w-2xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 py-4'>
            <button
              type='button'
              onClick={handleClose}
              className='btn-secondary flex-1 order-2 sm:order-1'
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type='submit'
              onClick={handleSubmit}
              className='btn-primary flex-1 order-1 sm:order-2 flex items-center justify-center'
              disabled={isSubmitting || !isBalanced}
            >
              {isSubmitting ? (
                <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
              ) : (
                <CheckCircleIcon className='h-4 w-4 mr-2' />
              )}
              {isSubmitting
                ? (mode === 'edit' ? 'Updating Schedule...' : 'Creating Schedule...')
                : (mode === 'edit' ? 'Update Payment Schedule' : 'Create Payment Schedule')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
