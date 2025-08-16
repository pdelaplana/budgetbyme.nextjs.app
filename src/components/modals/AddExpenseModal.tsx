'use client';

import {
  BuildingOfficeIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  GlobeAltIcon,
  MapPinIcon,
  PhotoIcon,
  TagIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import React, { useState } from 'react';

interface ExpenseFormData {
  name: string;
  amount: string;
  category: string;
  date: string;
  description: string;
  receipt?: File | null;
  vendorName: string;
  vendorAddress: string;
  vendorWebsite: string;
}

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Array<{
    id: string;
    name: string;
    color: string;
  }>;
  editingExpense?: {
    id: string;
    name: string;
    amount: number;
    category: string;
    date: string;
    description?: string;
    tags?: string[];
    vendor?: {
      name: string;
      address: string;
      website: string;
    };
  } | null;
  isEditMode?: boolean;
  onUpdateExpense?: (expenseId: string, expenseData: any) => void;
}

export default function AddExpenseModal({
  isOpen,
  onClose,
  categories,
  editingExpense,
  isEditMode = false,
  onUpdateExpense,
}: AddExpenseModalProps) {
  const [formData, setFormData] = useState<ExpenseFormData>({
    name: '',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    receipt: null,
    vendorName: '',
    vendorAddress: '',
    vendorWebsite: '',
  });

  // Pre-populate form when editing
  React.useEffect(() => {
    if (editingExpense && isEditMode) {
      setFormData({
        name: editingExpense.name,
        amount: editingExpense.amount.toString(),
        category: editingExpense.category,
        date: editingExpense.date,
        description: editingExpense.description || '',
        receipt: null, // Don't pre-populate receipt
        vendorName: editingExpense.vendor?.name || '',
        vendorAddress: editingExpense.vendor?.address || '',
        vendorWebsite: editingExpense.vendor?.website || '',
      });
    } else if (!isOpen) {
      // Reset form when modal closes
      setFormData({
        name: '',
        amount: '',
        category: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
        receipt: null,
        vendorName: '',
        vendorAddress: '',
        vendorWebsite: '',
      });
      setErrors({});
    }
  }, [editingExpense, isEditMode, isOpen]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Prevent body scroll when modal is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleInputChange = (field: keyof ExpenseFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, receipt: file }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Expense name is required';
    }

    if (!formData.amount.trim()) {
      newErrors.amount = 'Amount is required';
    } else if (isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const expenseData = {
        ...formData,
        amount: Number(formData.amount),
        receiptName: formData.receipt?.name || null,
        vendor:
          formData.vendorName ||
          formData.vendorAddress ||
          formData.vendorWebsite
            ? {
                name: formData.vendorName,
                address: formData.vendorAddress,
                website: formData.vendorWebsite,
              }
            : null,
      };

      if (isEditMode && editingExpense && onUpdateExpense) {
        console.log('Updating expense:', editingExpense.id, expenseData);
        onUpdateExpense(editingExpense.id, expenseData);
      } else {
        console.log('Adding new expense:', expenseData);
        // In real app, this would call the add expense API
      }

      // Reset form and close modal
      setFormData({
        name: '',
        amount: '',
        category: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
        receipt: null,
        vendorName: '',
        vendorAddress: '',
        vendorWebsite: '',
      });
      onClose();
    } catch (error) {
      console.error('Error submitting expense:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (value: string) => {
    const numericValue = value.replace(/[^\d.]/g, '');
    return numericValue;
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-white z-50 flex flex-col'>
      {/* Fixed Header */}
      <div className='flex-shrink-0 bg-white border-b border-gray-200 shadow-sm'>
        <div className='max-w-2xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex items-center justify-between py-4'>
            <div>
              <h2 className='text-lg sm:text-xl font-semibold text-gray-900'>
                <span className='hidden sm:inline'>
                  {isEditMode ? 'Edit Expense Details' : 'Add New Expense'}
                </span>
                <span className='sm:hidden'>
                  {isEditMode ? 'Edit Expense' : 'Add Expense'}
                </span>
              </h2>
              <p className='text-sm text-gray-600'>
                {isEditMode
                  ? 'Update your expense information'
                  : 'Record a new expense for your event'}
              </p>
            </div>
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

      {/* Scrollable Content */}
      <div className='flex-1 overflow-y-auto'>
        <div className='max-w-2xl mx-auto p-4 sm:p-6 lg:p-8'>
          <form
            id='expense-form'
            onSubmit={handleSubmit}
            className='space-y-6 sm:space-y-8'
          >
            {/* Expense Name */}
            <div>
              <label htmlFor='expense-name' className='form-label'>
                <DocumentTextIcon className='h-4 w-4 inline mr-2' />
                Expense Name
              </label>
              <input
                id='expense-name'
                type='text'
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder='e.g., Wedding venue deposit'
                className={`form-input ${errors.name ? 'border-red-300 focus:border-red-500' : ''}`}
              />
              {errors.name && (
                <p className='mt-1 text-sm text-red-600'>{errors.name}</p>
              )}
            </div>

            {/* Amount and Category Row */}
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6'>
              {/* Amount */}
              <div>
                <label htmlFor='expense-amount' className='form-label'>
                  <CurrencyDollarIcon className='h-4 w-4 inline mr-2' />
                  Amount
                </label>
                <div className='relative'>
                  <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                    <span className='text-gray-500 sm:text-sm'>$</span>
                  </div>
                  <input
                    id='expense-amount'
                    type='text'
                    value={formData.amount}
                    onChange={(e) =>
                      handleInputChange(
                        'amount',
                        formatCurrency(e.target.value),
                      )
                    }
                    placeholder='0.00'
                    className={`form-input pl-7 ${errors.amount ? 'border-red-300 focus:border-red-500' : ''}`}
                  />
                </div>
                {errors.amount && (
                  <p className='mt-1 text-sm text-red-600'>{errors.amount}</p>
                )}
              </div>

              {/* Category */}
              <div>
                <label htmlFor='expense-category' className='form-label'>
                  <TagIcon className='h-4 w-4 inline mr-2' />
                  Category
                </label>
                <select
                  id='expense-category'
                  value={formData.category}
                  onChange={(e) =>
                    handleInputChange('category', e.target.value)
                  }
                  className={`form-input ${errors.category ? 'border-red-300 focus:border-red-500' : ''}`}
                >
                  <option value=''>Select category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className='mt-1 text-sm text-red-600'>{errors.category}</p>
                )}
              </div>
            </div>

            {/* Date */}
            <div>
              <label htmlFor='expense-date' className='form-label'>
                <CalendarIcon className='h-4 w-4 inline mr-2' />
                Date
              </label>
              <input
                id='expense-date'
                type='date'
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                className={`form-input ${errors.date ? 'border-red-300 focus:border-red-500' : ''}`}
              />
              {errors.date && (
                <p className='mt-1 text-sm text-red-600'>{errors.date}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label htmlFor='expense-description' className='form-label'>
                Description (Optional)
              </label>
              <textarea
                id='expense-description'
                value={formData.description}
                onChange={(e) =>
                  handleInputChange('description', e.target.value)
                }
                placeholder='Additional details about this expense...'
                rows={3}
                className='form-input resize-none'
              />
            </div>

            {/* Receipt Upload */}
            <div>
              <label htmlFor='expense-receipt' className='form-label'>
                <PhotoIcon className='h-4 w-4 inline mr-2' />
                Receipt (Optional)
              </label>
              <div className='mt-1 flex justify-center px-6 pt-8 pb-8 sm:pt-12 sm:pb-12 border-2 border-gray-300 border-dashed rounded-lg hover:border-gray-400 transition-colors duration-200'>
                <div className='space-y-2 text-center'>
                  <PhotoIcon className='mx-auto h-12 w-12 sm:h-16 sm:w-16 text-gray-400' />
                  <div className='flex text-sm sm:text-base text-gray-600'>
                    <label
                      htmlFor='expense-receipt'
                      className='relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500'
                    >
                      <span>Upload a file</span>
                      <input
                        id='expense-receipt'
                        type='file'
                        accept='image/*,.pdf'
                        onChange={handleFileChange}
                        className='sr-only'
                      />
                    </label>
                    <p className='pl-1'>or drag and drop</p>
                  </div>
                  <p className='text-xs sm:text-sm text-gray-500'>
                    PNG, JPG, PDF up to 10MB
                  </p>
                  {formData.receipt && (
                    <p className='text-sm sm:text-base text-primary-600 font-medium'>
                      {formData.receipt.name}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Vendor Information (Optional) */}
            <div className='border-t border-gray-200 pt-6 sm:pt-8'>
              <h3 className='text-lg font-semibold text-gray-900 mb-4 flex items-center'>
                <BuildingOfficeIcon className='h-5 w-5 mr-2' />
                Vendor Information (Optional)
              </h3>
              <div className='space-y-4 sm:space-y-6'>
                {/* Vendor Name */}
                <div>
                  <label htmlFor='vendor-name' className='form-label'>
                    <BuildingOfficeIcon className='h-4 w-4 inline mr-2' />
                    Vendor Name
                  </label>
                  <input
                    id='vendor-name'
                    type='text'
                    value={formData.vendorName}
                    onChange={(e) =>
                      handleInputChange('vendorName', e.target.value)
                    }
                    placeholder='e.g., Golden Gate Gardens'
                    className='form-input'
                  />
                </div>

                {/* Vendor Address */}
                <div>
                  <label htmlFor='vendor-address' className='form-label'>
                    <MapPinIcon className='h-4 w-4 inline mr-2' />
                    Address
                  </label>
                  <textarea
                    id='vendor-address'
                    value={formData.vendorAddress}
                    onChange={(e) =>
                      handleInputChange('vendorAddress', e.target.value)
                    }
                    placeholder='e.g., 123 Wedding Lane, San Francisco, CA 94102'
                    rows={2}
                    className='form-input resize-none'
                  />
                </div>

                {/* Vendor Website */}
                <div>
                  <label htmlFor='vendor-website' className='form-label'>
                    <GlobeAltIcon className='h-4 w-4 inline mr-2' />
                    Website
                  </label>
                  <input
                    id='vendor-website'
                    type='url'
                    value={formData.vendorWebsite}
                    onChange={(e) =>
                      handleInputChange('vendorWebsite', e.target.value)
                    }
                    placeholder='e.g., https://goldengategardens.com'
                    className='form-input'
                  />
                  {formData.vendorWebsite && (
                    <p className='text-xs text-gray-500 mt-1'>
                      Make sure to include http:// or https://
                    </p>
                  )}
                </div>
              </div>
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
              onClick={onClose}
              className='btn-secondary flex-1 order-2 sm:order-1'
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type='submit'
              form='expense-form'
              className='btn-primary flex-1 order-1 sm:order-2'
              disabled={isSubmitting}
            >
              <span className='hidden sm:inline'>
                {isSubmitting
                  ? isEditMode
                    ? 'Updating Expense...'
                    : 'Adding Expense...'
                  : isEditMode
                    ? 'Update Expense'
                    : 'Add Expense'}
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
