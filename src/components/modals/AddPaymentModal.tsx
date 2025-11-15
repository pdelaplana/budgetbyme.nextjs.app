'use client';

import {
  CalendarIcon,
  CreditCardIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useEventDetails } from '@/contexts/EventDetailsContext';
import {
  useAddPaymentMutation,
  useUpdatePaymentMutation,
} from '@/hooks/payments';
import { sanitizeCurrencyInput } from '@/lib/formatters';
import type { PaymentMethod } from '@/types/Payment';

interface AddPaymentFormData {
  name: string;
  description: string;
  amount: string;
  paymentMethod: PaymentMethod | '';
  dueDate: string;
  notes: string;
}

interface AddPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  expenseId: string;
  expenseName: string;
  onAddPayment?: (payment: {
    name: string;
    description: string;
    amount: number;
    paymentMethod: PaymentMethod;
    dueDate: string;
    notes?: string;
  }) => void;
  editingPayment?: {
    id: string;
    name: string;
    description: string;
    amount: number;
    paymentMethod: PaymentMethod;
    dueDate: string;
    notes?: string;
  } | null;
  isEditMode?: boolean;
}

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'credit-card', label: 'Credit Card' },
  { value: 'debit-card', label: 'Debit Card' },
  { value: 'bank-transfer', label: 'Bank Transfer' },
  { value: 'paypal', label: 'PayPal' },
  { value: 'cash', label: 'Cash' },
];

export default function AddPaymentModal({
  isOpen,
  onClose,
  expenseId,
  expenseName,
  onAddPayment,
  editingPayment,
  isEditMode = false,
}: AddPaymentModalProps) {
  // Hooks
  const { user } = useAuth();
  const { event } = useEventDetails();

  const [formData, setFormData] = useState<AddPaymentFormData>({
    name: '',
    description: '',
    amount: '',
    paymentMethod: '',
    dueDate: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Mutations
  const addPaymentMutation = useAddPaymentMutation({
    onSuccess: () => {
      toast.success(
        isEditMode
          ? 'Payment updated successfully!'
          : 'Payment added successfully!',
      );
      resetForm();
      onClose();
    },
    onError: (error) => {
      toast.error(
        error.message || `Failed to ${isEditMode ? 'update' : 'add'} payment`,
      );
    },
  });

  const updatePaymentMutation = useUpdatePaymentMutation({
    onSuccess: () => {
      toast.success('Payment updated successfully!');
      resetForm();
      onClose();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update payment');
    },
  });

  const isSubmitting =
    addPaymentMutation.isPending || updatePaymentMutation.isPending;

  const resetForm = React.useCallback(() => {
    setFormData({
      name: '',
      description: '',
      amount: '',
      paymentMethod: '',
      dueDate: '',
      notes: '',
    });
    setErrors({});
  }, []);

  // Pre-populate form when editing
  React.useEffect(() => {
    if (editingPayment && isEditMode) {
      setFormData({
        name: editingPayment.name,
        description: editingPayment.description,
        amount: editingPayment.amount.toString(),
        paymentMethod: editingPayment.paymentMethod,
        dueDate: editingPayment.dueDate,
        notes: editingPayment.notes || '',
      });
    } else if (!isOpen) {
      resetForm();
    }
  }, [editingPayment, isEditMode, isOpen, resetForm]);

  const handleInputChange = (
    field: keyof AddPaymentFormData,
    value: string,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Payment name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Payment description is required';
    }

    if (!formData.amount.trim()) {
      newErrors.amount = 'Amount is required';
    } else if (
      Number.isNaN(Number(formData.amount)) ||
      Number(formData.amount) <= 0
    ) {
      newErrors.amount = 'Please enter a valid amount';
    }

    if (!formData.paymentMethod) {
      newErrors.paymentMethod = 'Payment method is required';
    }

    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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

    if (!formData.paymentMethod) {
      toast.error('Payment method is required');
      return;
    }

    try {
      if (isEditMode && editingPayment) {
        // Update existing payment
        await updatePaymentMutation.mutateAsync({
          userId: user.uid,
          eventId: event.id,
          expenseId,
          paymentId: editingPayment.id,
          updateData: {
            name: formData.name.trim(),
            description: formData.description.trim(),
            amount: Number(formData.amount),
            paymentMethod: formData.paymentMethod as PaymentMethod,
            dueDate: new Date(formData.dueDate),
            notes: formData.notes.trim() || undefined,
          },
        });
      } else {
        // Add new payment
        await addPaymentMutation.mutateAsync({
          userId: user.uid,
          eventId: event.id,
          expenseId,
          name: formData.name.trim(),
          description: formData.description.trim(),
          amount: Number(formData.amount),
          paymentMethod: formData.paymentMethod as PaymentMethod,
          dueDate: new Date(formData.dueDate),
          notes: formData.notes.trim() || undefined,
        });
      }

      // Call callback if provided
      if (onAddPayment) {
        onAddPayment({
          name: formData.name.trim(),
          description: formData.description.trim(),
          amount: Number(formData.amount),
          paymentMethod: formData.paymentMethod as PaymentMethod,
          dueDate: formData.dueDate,
          notes: formData.notes.trim() || undefined,
        });
      }
    } catch (error) {
      // Error handling is done in mutation callbacks
      console.error('Error with payment:', error);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      resetForm();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-white z-50 flex flex-col'>
      {/* Fixed Header */}
      <div className='flex-shrink-0 bg-white border-b border-gray-200 shadow-sm'>
        <div className='max-w-2xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex items-center justify-between py-4'>
            <div className='flex items-center space-x-3 flex-1 min-w-0'>
              <CreditCardIcon className='h-6 w-6 text-primary-600 flex-shrink-0' />
              <div className='flex-1 min-w-0'>
                <h2 className='text-lg sm:text-xl font-semibold text-gray-900'>
                  <span className='hidden sm:inline'>
                    {isEditMode
                      ? 'Edit Scheduled Payment'
                      : 'Add Scheduled Payment'}
                  </span>
                  <span className='sm:hidden'>
                    {isEditMode ? 'Edit Payment' : 'Add Payment'}
                  </span>
                </h2>
                <p className='text-sm text-gray-600 truncate'>{expenseName}</p>
              </div>
            </div>
            <button
              type='button'
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
        <div className='max-w-2xl mx-auto p-4 sm:p-6 lg:p-8'>
          <form onSubmit={handleSubmit} className='space-y-6 sm:space-y-8'>
            {/* Payment Name */}
            <div>
              <label htmlFor='payment-name' className='form-label'>
                <DocumentTextIcon className='h-4 w-4 inline mr-2' />
                Payment Name
              </label>
              <input
                id='payment-name'
                type='text'
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder='e.g., Venue deposit, Final payment'
                className={`form-input ${errors.name ? 'border-red-300 focus:border-red-500' : ''}`}
                disabled={isSubmitting}
                maxLength={100}
              />
              {errors.name && (
                <p className='mt-1 text-sm text-red-600'>{errors.name}</p>
              )}
            </div>

            {/* Payment Description */}
            <div>
              <label htmlFor='payment-description' className='form-label'>
                <DocumentTextIcon className='h-4 w-4 inline mr-2' />
                Payment Description
              </label>
              <input
                id='payment-description'
                type='text'
                value={formData.description}
                onChange={(e) =>
                  handleInputChange('description', e.target.value)
                }
                placeholder='e.g., Second installment for venue booking'
                className={`form-input ${errors.description ? 'border-red-300 focus:border-red-500' : ''}`}
                disabled={isSubmitting}
                maxLength={200}
              />
              {errors.description && (
                <p className='mt-1 text-sm text-red-600'>
                  {errors.description}
                </p>
              )}
            </div>

            {/* Amount, Payment Method, and Due Date */}
            <div className='grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6'>
              {/* Amount */}
              <div>
                <label htmlFor='payment-amount' className='form-label'>
                  <CurrencyDollarIcon className='h-4 w-4 inline mr-2' />
                  Amount
                </label>
                <div className='relative'>
                  <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                    <span className='text-gray-500 sm:text-sm'>$</span>
                  </div>
                  <input
                    id='payment-amount'
                    type='text'
                    value={formData.amount}
                    onChange={(e) =>
                      handleInputChange(
                        'amount',
                        sanitizeCurrencyInput(e.target.value).toString(),
                      )
                    }
                    placeholder='0.00'
                    className={`form-input pl-7 ${errors.amount ? 'border-red-300 focus:border-red-500' : ''}`}
                    disabled={isSubmitting}
                  />
                </div>
                {errors.amount && (
                  <p className='mt-1 text-sm text-red-600'>{errors.amount}</p>
                )}
              </div>

              {/* Payment Method */}
              <div>
                <label htmlFor='payment-method' className='form-label'>
                  <CreditCardIcon className='h-4 w-4 inline mr-2' />
                  Payment Method
                </label>
                <select
                  id='payment-method'
                  value={formData.paymentMethod}
                  onChange={(e) =>
                    handleInputChange('paymentMethod', e.target.value)
                  }
                  className={`form-input ${errors.paymentMethod ? 'border-red-300 focus:border-red-500' : ''}`}
                  disabled={isSubmitting}
                >
                  <option value=''>Select method</option>
                  {PAYMENT_METHODS.map((method) => (
                    <option key={method.value} value={method.value}>
                      {method.label}
                    </option>
                  ))}
                </select>
                {errors.paymentMethod && (
                  <p className='mt-1 text-sm text-red-600'>
                    {errors.paymentMethod}
                  </p>
                )}
              </div>

              {/* Due Date */}
              <div>
                <label htmlFor='payment-due-date' className='form-label'>
                  <CalendarIcon className='h-4 w-4 inline mr-2' />
                  Due Date
                </label>
                <input
                  id='payment-due-date'
                  type='date'
                  value={formData.dueDate}
                  onChange={(e) => handleInputChange('dueDate', e.target.value)}
                  className={`form-input ${errors.dueDate ? 'border-red-300 focus:border-red-500' : ''}`}
                  disabled={isSubmitting}
                />
                {errors.dueDate && (
                  <p className='mt-1 text-sm text-red-600'>{errors.dueDate}</p>
                )}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label htmlFor='payment-notes' className='form-label'>
                Notes (Optional)
              </label>
              <textarea
                id='payment-notes'
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Additional notes about this payment (e.g., '30 days before event', 'Upon completion')..."
                rows={3}
                className='form-input resize-none'
                disabled={isSubmitting}
              />
            </div>

            {/* Payment Guidelines */}
            <div className='bg-primary-50 border border-primary-200 rounded-lg p-4'>
              <h4 className='text-sm font-medium text-primary-800 mb-2'>
                Payment Guidelines
              </h4>
              <ul className='text-sm text-primary-700 space-y-1'>
                <li>
                  • Choose a clear description that identifies this payment
                </li>
                <li>
                  • Set realistic due dates based on your planning timeline
                </li>
                <li>• Use notes to add context or special instructions</li>
                <li>• You can always edit payment details later</li>
              </ul>
            </div>
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
              className='btn-primary flex-1 order-1 sm:order-2'
              disabled={isSubmitting}
            >
              <span className='hidden sm:inline'>
                {isSubmitting
                  ? isEditMode
                    ? 'Updating Scheduled Payment...'
                    : 'Adding Scheduled Payment...'
                  : isEditMode
                    ? 'Update Scheduled Payment'
                    : 'Add Scheduled Payment'}
              </span>
              <span className='sm:hidden'>
                {isSubmitting
                  ? isEditMode
                    ? 'Updating...'
                    : 'Adding...'
                  : isEditMode
                    ? 'Update'
                    : 'Add'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
