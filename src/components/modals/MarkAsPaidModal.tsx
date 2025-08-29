'use client';

import {
  CalendarIcon,
  CheckCircleIcon,
  CreditCardIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import React, { useState } from 'react';
import { toast } from 'sonner';
import FileUpload from '@/components/ui/FileUpload';
import { useAuth } from '@/contexts/AuthContext';
import { useEventDetails } from '@/contexts/EventDetailsContext';
import { useFetchExpenses, useUpdateExpenseMutation } from '@/hooks/expenses';
import {
  useCreateSinglePaymentMutation,
  useMarkPaymentAsPaidMutation,
} from '@/hooks/payments';
import { formatCurrency } from '@/lib/formatters';
import { uploadExpenseAttachment } from '@/server/actions/expenses/uploadExpenseAttachment';
import type { PaymentMethod } from '@/types/Payment';

interface MarkAsPaidFormData {
  name: string;
  amount: string;
  datePaid: string;
  paymentMethod: PaymentMethod | '';
  notes: string;
  receipt: File | null;
}

interface MarkAsPaidModalProps {
  isOpen: boolean;
  onClose: () => void;
  expenseId: string;
  expenseName: string;
  expenseAmount: number;
  paymentId?: string; // If marking specific payment as paid
  onMarkAsPaid?: (paymentData: {
    amount: number;
    datePaid: string;
    paymentMethod: PaymentMethod;
    notes?: string;
    receipt?: File;
  }) => void;
}

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'credit-card', label: 'Credit Card' },
  { value: 'debit-card', label: 'Debit Card' },
  { value: 'bank-transfer', label: 'Bank Transfer' },
  { value: 'paypal', label: 'PayPal' },
  { value: 'cash', label: 'Cash' },
];

export default function MarkAsPaidModal({
  isOpen,
  onClose,
  expenseId,
  expenseName,
  expenseAmount,
  paymentId,
  onMarkAsPaid,
}: MarkAsPaidModalProps) {
  // Hooks
  const { user } = useAuth();
  const { event } = useEventDetails();

  // Fetch expenses data to get current attachments
  const { data: expenses } = useFetchExpenses(user?.uid || '', event?.id || '');

  const [formData, setFormData] = useState<MarkAsPaidFormData>({
    name: paymentId ? 'Payment' : `${expenseName} - Full Payment`,
    amount: expenseAmount.toString(),
    datePaid: new Date().toISOString().split('T')[0],
    paymentMethod: 'cash',
    notes: '',
    receipt: null,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isUploading, setIsUploading] = useState(false);

  // Mutations
  const createSinglePaymentMutation = useCreateSinglePaymentMutation({
    onSuccess: () => {
      toast.success('Payment marked as paid successfully!');
      resetForm();
      onClose();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to mark payment as paid');
    },
  });

  const markPaymentAsPaidMutation = useMarkPaymentAsPaidMutation({
    onSuccess: () => {
      toast.success('Payment marked as paid successfully!');
      resetForm();
      onClose();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to mark payment as paid');
    },
  });

  const updateExpenseMutation = useUpdateExpenseMutation({
    onSuccess: () => {
      // This is used to add receipt attachments to the expense
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to save receipt attachment');
    },
  });

  const isSubmitting =
    createSinglePaymentMutation.isPending ||
    markPaymentAsPaidMutation.isPending ||
    updateExpenseMutation.isPending ||
    isUploading;

  // Reinitialize form data when modal opens or props change
  React.useEffect(() => {
    if (isOpen) {
      setFormData({
        name: paymentId ? expenseName : `${expenseName} - Full Payment`,
        amount: expenseAmount.toString(),
        datePaid: new Date().toISOString().split('T')[0],
        paymentMethod: 'cash',
        notes: '',
        receipt: null,
      });
      setErrors({});
    }
  }, [isOpen, paymentId, expenseName, expenseAmount]);

  const handleInputChange = (
    field: keyof MarkAsPaidFormData,
    value: string,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleFileChange = (file: File | null) => {
    setFormData((prev) => ({ ...prev, receipt: file }));
  };

  const removeFile = () => {
    setFormData((prev) => ({ ...prev, receipt: null }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Payment name is required';
    }

    if (!formData.amount.trim()) {
      newErrors.amount = 'Amount is required';
    } else if (
      Number.isNaN(Number(formData.amount)) ||
      Number(formData.amount) <= 0
    ) {
      newErrors.amount = 'Please enter a valid amount';
    } else if (Number(formData.amount) > expenseAmount * 1.1) {
      newErrors.amount = `Amount seems too high for this expense (${formatCurrency(expenseAmount)})`;
    }

    if (!formData.datePaid) {
      newErrors.datePaid = 'Payment date is required';
    } else {
      const paymentDate = new Date(formData.datePaid);
      const today = new Date();
      if (paymentDate > today) {
        newErrors.datePaid = 'Payment date cannot be in the future';
      }
    }

    if (!formData.paymentMethod) {
      newErrors.paymentMethod = 'Payment method is required';
    }

    // File size validation (5MB max)
    if (formData.receipt && formData.receipt.size > 5 * 1024 * 1024) {
      newErrors.receipt = 'File size must be less than 5MB';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const uploadReceiptAttachment = async (
    receiptFile: File,
  ): Promise<string | null> => {
    if (!user?.uid) return null;

    try {
      const formData = new FormData();
      formData.append('attachment', receiptFile);
      formData.append('userId', user.uid);
      formData.append('expenseId', expenseId);
      formData.append('type', 'receipt');

      const result = await uploadExpenseAttachment(formData);

      if (!result.success) {
        throw new Error(result.error || 'Failed to upload receipt');
      }

      return result.url || null;
    } catch (error) {
      console.error('Receipt upload error:', error);
      throw error;
    }
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
      // Upload receipt if provided
      let receiptUrl: string | null = null;
      if (formData.receipt) {
        setIsUploading(true);
        try {
          receiptUrl = await uploadReceiptAttachment(formData.receipt);
        } finally {
          setIsUploading(false);
        }
      }

      if (paymentId) {
        // Mark existing payment as paid
        await markPaymentAsPaidMutation.mutateAsync({
          userId: user.uid,
          eventId: event.id,
          expenseId,
          paymentId,
          markAsPaidData: {
            paidDate: new Date(formData.datePaid),
            paymentMethod: formData.paymentMethod as PaymentMethod,
            notes: formData.notes || undefined,
          },
        });
      } else {
        // Create new single payment that is already paid
        await createSinglePaymentMutation.mutateAsync({
          userId: user.uid,
          eventId: event.id,
          expenseId,
          name: formData.name.trim(),
          description: `Full payment for ${expenseName}`,
          amount: Number(formData.amount),
          paymentMethod: formData.paymentMethod as PaymentMethod,
          paidDate: new Date(formData.datePaid),
          notes: formData.notes || undefined,
        });
      }

      // If we uploaded a receipt, add it to the expense attachments
      if (receiptUrl) {
        try {
          // Get current expense from the expenses data
          const currentExpense = expenses?.find(
            (exp: any) => exp.id === expenseId,
          );
          const existingAttachments = currentExpense?.attachments || [];

          // Append receipt to existing attachments (avoid duplicates)
          const updatedAttachments = [...existingAttachments];
          if (!updatedAttachments.includes(receiptUrl)) {
            updatedAttachments.push(receiptUrl);
          }

          await updateExpenseMutation.mutateAsync({
            userId: user.uid,
            eventId: event.id,
            expenseId,
            attachments: updatedAttachments,
          });
        } catch (error) {
          // Don't fail the payment if attachment update fails, just log it
          console.warn('Failed to add receipt to expense attachments:', error);
          toast.warning(
            'Payment recorded, but receipt attachment may not have been saved to expense',
          );
        }
      }

      // Call callback if provided
      if (onMarkAsPaid) {
        onMarkAsPaid({
          amount: Number(formData.amount),
          datePaid: formData.datePaid,
          paymentMethod: formData.paymentMethod as PaymentMethod,
          notes: formData.notes || undefined,
          receipt: formData.receipt || undefined,
        });
      }
    } catch (error) {
      // Error handling is done in mutation callbacks
      console.error('Error marking as paid:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: paymentId ? expenseName : `${expenseName} - Full Payment`,
      amount: expenseAmount.toString(),
      datePaid: new Date().toISOString().split('T')[0],
      paymentMethod: 'cash',
      notes: '',
      receipt: null,
    });
    setErrors({});
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
              <CheckCircleIcon className='h-6 w-6 text-success-600 flex-shrink-0' />
              <div className='flex-1 min-w-0'>
                <h2 className='text-lg sm:text-xl font-semibold text-gray-900'>
                  Mark as Paid
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
          {/* Expense Summary */}
          <div className='bg-gradient-to-r from-success-50 to-success-100 rounded-xl p-6 mb-6'>
            <div className='text-center'>
              <div className='text-3xl font-bold text-success-900 mb-1'>
                {formatCurrency(expenseAmount)}
              </div>
              <div className='text-sm text-success-700'>Expense Amount</div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className='space-y-6'>
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
                placeholder='e.g., Venue deposit payment'
                className={`form-input ${errors.name ? 'border-red-300 focus:border-red-500' : ''}`}
                disabled={isSubmitting}
                maxLength={100}
              />
              {errors.name && (
                <p className='mt-1 text-sm text-red-600'>{errors.name}</p>
              )}
            </div>

            {/* Amount and Date Row */}
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6'>
              {/* Amount Paid */}
              <div>
                <label htmlFor='amount-paid' className='form-label'>
                  <CurrencyDollarIcon className='h-4 w-4 inline mr-2' />
                  Amount Paid
                </label>
                <div className='relative'>
                  <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                    <span className='text-gray-500 sm:text-sm'>$</span>
                  </div>
                  <input
                    id='amount-paid'
                    type='text'
                    value={formData.amount}
                    onChange={(e) =>
                      handleInputChange(
                        'amount',
                        e.target.value.replace(/[^0-9.]/g, ''),
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
                {Number(formData.amount) !== expenseAmount &&
                  Number(formData.amount) > 0 && (
                    <p className='mt-1 text-sm text-warning-600'>
                      ⚠️ Amount differs from expense total (
                      {formatCurrency(expenseAmount)})
                    </p>
                  )}
              </div>

              {/* Date Paid */}
              <div>
                <label htmlFor='date-paid' className='form-label'>
                  <CalendarIcon className='h-4 w-4 inline mr-2' />
                  Date Paid
                </label>
                <input
                  id='date-paid'
                  type='date'
                  value={formData.datePaid}
                  onChange={(e) =>
                    handleInputChange('datePaid', e.target.value)
                  }
                  className={`form-input ${errors.datePaid ? 'border-red-300 focus:border-red-500' : ''}`}
                  disabled={isSubmitting}
                  max={new Date().toISOString().split('T')[0]}
                />
                {errors.datePaid && (
                  <p className='mt-1 text-sm text-red-600'>{errors.datePaid}</p>
                )}
              </div>
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
                <option value=''>Select payment method</option>
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

            {/* Notes */}
            <div>
              <label htmlFor='payment-notes' className='form-label'>
                <DocumentTextIcon className='h-4 w-4 inline mr-2' />
                Notes (Optional)
              </label>
              <textarea
                id='payment-notes'
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder='Add any additional notes about this payment (confirmation number, partial payment reason, etc.)...'
                rows={3}
                className='form-input resize-none'
                disabled={isSubmitting}
              />
            </div>

            {/* Receipt Upload */}
            <div>
              <label htmlFor='receipt-upload' className='form-label'>
                Receipt/Proof of Payment (Optional)
              </label>
              <FileUpload
                file={formData.receipt}
                onFileChange={handleFileChange}
                onFileRemove={removeFile}
                accept='.jpg,.jpeg,.png,.pdf,.doc,.docx'
                maxSize={5}
                disabled={isSubmitting}
                label='Upload Receipt'
                description='Supported formats: JPG, PNG, PDF, DOC'
              />
              {errors.receipt && (
                <p className='mt-1 text-sm text-red-600'>{errors.receipt}</p>
              )}
            </div>

            {/* Payment Guidelines */}
            <div className='bg-success-50 border border-success-200 rounded-lg p-4'>
              <h4 className='text-sm font-medium text-success-800 mb-2'>
                Payment Recording Tips
              </h4>
              <ul className='text-sm text-success-700 space-y-1'>
                <li>
                  • Record the actual amount paid (may differ from expense
                  total)
                </li>
                <li>• Use the date when payment was processed/cleared</li>
                <li>
                  • Upload receipts or confirmation screenshots for your records
                </li>
                <li>
                  • Add notes for confirmation numbers or special circumstances
                </li>
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
              className='btn-primary flex-1 order-1 sm:order-2 flex items-center justify-center'
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
              ) : (
                <CheckCircleIcon className='h-4 w-4 mr-2' />
              )}
              Mark as Paid
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
