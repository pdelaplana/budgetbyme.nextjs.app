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
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useEventDetails } from '@/contexts/EventDetailsContext';
import {
  useAddExpenseMutation,
  useUpdateExpenseMutation,
} from '@/hooks/expenses';
import type { BudgetCategory } from '@/types/BudgetCategory';
import { sanitizeCurrencyInput } from '@/lib/formatters';

interface ExpenseFormData {
  name: string;
  amount: string;
  currency: string;
  categoryId: string;
  date: string;
  description: string;
  notes: string;
  tags: string[];
  vendorName: string;
  vendorAddress: string;
  vendorWebsite: string;
  vendorEmail: string;
  receipt?: File | null;
}

interface AddOrEditExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories?: BudgetCategory[];
  editingExpense?: {
    id: string;
    name: string;
    amount: number;
    currency: string;
    category: {
      id: string;
      name: string;
      color: string;
      icon: string;
    };
    date: Date;
    description: string;
    notes: string;
    tags: string[];
    vendor: {
      name: string;
      address: string;
      website: string;
      email: string;
    };
  } | null;
  isEditMode?: boolean;
}

export default function AddOrEditExpenseModal({
  isOpen,
  onClose,
  categories,
  editingExpense,
  isEditMode = false,
}: AddOrEditExpenseModalProps) {
  // Hooks
  const { user } = useAuth();
  const { event, categories: contextCategories } = useEventDetails();

  // Use categories from props or context
  const availableCategories = categories || contextCategories || [];

  const addExpenseMutation = useAddExpenseMutation({
    onSuccess: (expenseId) => {
      // Close modal immediately for better UX
      handleClose(true);

      // Show success toast
      toast.success('Expense created successfully!');
    },
    onError: (error) => {
      console.error('Failed to add expense:', error);
      toast.error(
        error.message || 'Failed to create expense. Please try again.',
      );
    },
  });

  const updateExpenseMutation = useUpdateExpenseMutation({
    onSuccess: (expenseId) => {
      // Show success toast
      toast.success('Expense updated successfully!');

      // Close modal immediately for better UX
      handleClose(true);
    },
    onError: (error) => {
      console.error('Failed to update expense:', error);
      toast.error(
        error.message || 'Failed to update expense. Please try again.',
      );
    },
  });

  // Form state
  const [formData, setFormData] = useState<ExpenseFormData>({
    name: '',
    amount: '',
    currency: 'USD',
    categoryId: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    notes: '',
    tags: [],
    vendorName: '',
    vendorAddress: '',
    vendorWebsite: '',
    vendorEmail: '',
    receipt: null,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [tagInput, setTagInput] = useState('');

  // Loading state from mutations
  const isSubmitting =
    addExpenseMutation.isPending || updateExpenseMutation.isPending;

  // Pre-populate form when editing
  React.useEffect(() => {
    if (editingExpense && isEditMode) {
      setFormData({
        name: editingExpense.name,
        amount: editingExpense.amount.toString(),
        currency: editingExpense.currency,
        categoryId: editingExpense.category.id,
        date: editingExpense.date.toISOString().split('T')[0],
        description: editingExpense.description || '',
        notes: editingExpense.notes || '',
        tags: editingExpense.tags || [],
        vendorName: editingExpense.vendor?.name || '',
        vendorAddress: editingExpense.vendor?.address || '',
        vendorWebsite: editingExpense.vendor?.website || '',
        vendorEmail: editingExpense.vendor?.email || '',
        receipt: null, // Don't pre-populate receipt
      });
    } else if (!isOpen) {
      // Reset form when modal closes
      setFormData({
        name: '',
        amount: '',
        currency: 'USD',
        categoryId: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
        notes: '',
        tags: [],
        vendorName: '',
        vendorAddress: '',
        vendorWebsite: '',
        vendorEmail: '',
        receipt: null,
      });
      setErrors({});
      setTagInput('');
    }
  }, [editingExpense, isEditMode, isOpen]);

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

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Expense name is required';
    }

    if (!formData.amount.trim()) {
      newErrors.amount = 'Amount is required';
    } else if (
      Number.isNaN(Number(formData.amount)) ||
      Number(formData.amount) <= 0
    ) {
      newErrors.amount = 'Please enter a valid amount greater than 0';
    }

    if (!formData.categoryId) {
      newErrors.categoryId = 'Category is required';
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

    // Validate required context
    if (!user?.uid) {
      toast.error('User not authenticated');
      return;
    }

    if (!event?.id) {
      toast.error('No event selected');
      return;
    }

    // Find selected category
    const selectedCategory = availableCategories.find(
      (cat) => cat.id === formData.categoryId,
    );
    if (!selectedCategory) {
      toast.error('Selected category not found');
      return;
    }

    try {
      if (isEditMode && editingExpense) {
        // Update existing expense
        await updateExpenseMutation.mutateAsync({
          userId: user.uid,
          eventId: event.id,
          expenseId: editingExpense.id,
          name: formData.name.trim(),
          description: formData.description.trim(),
          amount: Number(formData.amount),
          currency: formData.currency,
          categoryId: formData.categoryId,
          categoryName: selectedCategory.name,
          categoryColor: selectedCategory.color,
          categoryIcon: selectedCategory.icon,
          vendor: {
            name: formData.vendorName.trim(),
            address: formData.vendorAddress.trim(),
            website: formData.vendorWebsite.trim(),
            email: formData.vendorEmail.trim(),
          },
          date: new Date(formData.date),
          notes: formData.notes.trim(),
          tags: formData.tags,
          // TODO: Handle file uploads later
          attachments: [],
        });
      } else {
        // Add new expense
        await addExpenseMutation.mutateAsync({
          userId: user.uid,
          eventId: event.id,
          addExpenseDto: {
            userId: user.uid,
            eventId: event.id,
            name: formData.name.trim(),
            description: formData.description.trim(),
            amount: Number(formData.amount),
            currency: formData.currency,
            categoryId: formData.categoryId,
            categoryName: selectedCategory.name,
            categoryColor: selectedCategory.color,
            categoryIcon: selectedCategory.icon,
            vendor: {
              name: formData.vendorName.trim(),
              address: formData.vendorAddress.trim(),
              website: formData.vendorWebsite.trim(),
              email: formData.vendorEmail.trim(),
            },
            date: new Date(formData.date),
            notes: formData.notes.trim(),
            tags: formData.tags,
            // TODO: Handle file uploads later
            attachments: [],
          },
        });
      }

      // Success handling is done in mutation callbacks
    } catch (error) {
      // Error handling is done in mutation callbacks
      console.error('Error submitting expense:', error);
    }
  };

  const handleClose = (forceOrEvent?: boolean | React.MouseEvent) => {
    const force = typeof forceOrEvent === 'boolean' ? forceOrEvent : false;
    if (!isSubmitting || force) {
      setFormData({
        name: '',
        amount: '',
        currency: 'USD',
        categoryId: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
        notes: '',
        tags: [],
        vendorName: '',
        vendorAddress: '',
        vendorWebsite: '',
        vendorEmail: '',
        receipt: null,
      });
      setErrors({});
      setTagInput('');
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
              <DocumentTextIcon className='h-6 w-6 text-primary-600 flex-shrink-0' />
              <div className='flex-1 min-w-0'>
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
          <form
            id='expense-form'
            onSubmit={handleSubmit}
            className={`space-y-6 sm:space-y-8 transition-opacity duration-200 ${
              isSubmitting ? 'opacity-50 pointer-events-none' : 'opacity-100'
            }`}
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
                disabled={isSubmitting}
                maxLength={100}
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

              {/* Category */}
              <div>
                <label htmlFor='expense-category' className='form-label'>
                  <TagIcon className='h-4 w-4 inline mr-2' />
                  Category
                </label>
                <select
                  id='expense-category'
                  value={formData.categoryId}
                  onChange={(e) =>
                    handleInputChange('categoryId', e.target.value)
                  }
                  className={`form-input ${errors.categoryId ? 'border-red-300 focus:border-red-500' : ''}`}
                  disabled={isSubmitting}
                >
                  <option value=''>Select a category</option>
                  {availableCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.icon} {category.name}
                    </option>
                  ))}
                </select>
                {errors.categoryId && (
                  <p className='mt-1 text-sm text-red-600'>
                    {errors.categoryId}
                  </p>
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
                disabled={isSubmitting}
              />
              {errors.date && (
                <p className='mt-1 text-sm text-red-600'>{errors.date}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label htmlFor='expense-description' className='form-label'>
                <DocumentTextIcon className='h-4 w-4 inline mr-2' />
                Description (Optional)
              </label>
              <textarea
                id='expense-description'
                value={formData.description}
                onChange={(e) =>
                  handleInputChange('description', e.target.value)
                }
                placeholder='Add details about this expense...'
                rows={3}
                className='form-input resize-none'
                disabled={isSubmitting}
                maxLength={500}
              />
              <div className='flex justify-between text-xs text-gray-500 mt-1'>
                <span>Optional details about this expense</span>
                <span>{formData.description.length}/500</span>
              </div>
            </div>

            {/* Vendor Information */}
            <div>
              <h3 className='text-base font-medium text-gray-900 mb-4'>
                <BuildingOfficeIcon className='h-4 w-4 inline mr-2' />
                Vendor Information (Optional)
              </h3>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label htmlFor='vendor-name' className='form-label'>
                    Vendor Name
                  </label>
                  <input
                    id='vendor-name'
                    type='text'
                    value={formData.vendorName}
                    onChange={(e) =>
                      handleInputChange('vendorName', e.target.value)
                    }
                    placeholder='e.g., ABC Catering'
                    className='form-input'
                    disabled={isSubmitting}
                    maxLength={100}
                  />
                </div>
                <div>
                  <label htmlFor='vendor-email' className='form-label'>
                    Vendor Email
                  </label>
                  <input
                    id='vendor-email'
                    type='email'
                    value={formData.vendorEmail}
                    onChange={(e) =>
                      handleInputChange('vendorEmail', e.target.value)
                    }
                    placeholder='vendor@example.com'
                    className='form-input'
                    disabled={isSubmitting}
                    maxLength={100}
                  />
                </div>
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
                    placeholder='https://vendor.com'
                    className='form-input'
                    disabled={isSubmitting}
                    maxLength={200}
                  />
                </div>
                <div>
                  <label htmlFor='vendor-address' className='form-label'>
                    <MapPinIcon className='h-4 w-4 inline mr-2' />
                    Address
                  </label>
                  <input
                    id='vendor-address'
                    type='text'
                    value={formData.vendorAddress}
                    onChange={(e) =>
                      handleInputChange('vendorAddress', e.target.value)
                    }
                    placeholder='123 Main St, City, State'
                    className='form-input'
                    disabled={isSubmitting}
                    maxLength={200}
                  />
                </div>
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className='form-label'>
                <TagIcon className='h-4 w-4 inline mr-2' />
                Tags (Optional)
              </label>
              <div className='space-y-3'>
                <div className='flex gap-2'>
                  <input
                    type='text'
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                    placeholder='Add a tag and press Enter'
                    className='form-input flex-1'
                    disabled={isSubmitting}
                    maxLength={30}
                  />
                  <button
                    type='button'
                    onClick={addTag}
                    disabled={!tagInput.trim() || isSubmitting}
                    className='px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    Add
                  </button>
                </div>
                {formData.tags.length > 0 && (
                  <div className='flex flex-wrap gap-2'>
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className='inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-800 text-sm rounded-full'
                      >
                        {tag}
                        <button
                          type='button'
                          onClick={() => removeTag(tag)}
                          disabled={isSubmitting}
                          className='hover:text-primary-600 disabled:cursor-not-allowed'
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label htmlFor='expense-notes' className='form-label'>
                <DocumentTextIcon className='h-4 w-4 inline mr-2' />
                Notes (Optional)
              </label>
              <textarea
                id='expense-notes'
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder='Additional notes or comments...'
                rows={3}
                className='form-input resize-none'
                disabled={isSubmitting}
                maxLength={500}
              />
              <div className='flex justify-between text-xs text-gray-500 mt-1'>
                <span>Internal notes about this expense</span>
                <span>{formData.notes.length}/500</span>
              </div>
            </div>

            {/* File Upload - TODO: Implement later */}
            <div>
              <label className='form-label'>
                <PhotoIcon className='h-4 w-4 inline mr-2' />
                Receipt/Document (Coming Soon)
              </label>
              <div className='border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-gray-50'>
                <PhotoIcon className='h-8 w-8 text-gray-400 mx-auto mb-2' />
                <p className='text-sm text-gray-500'>
                  File upload functionality will be available soon
                </p>
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
              onClick={handleClose}
              className='btn-secondary flex-1 order-2 sm:order-1'
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type='submit'
              form='expense-form'
              className='btn-primary flex-1 order-1 sm:order-2 flex items-center justify-center'
              disabled={isSubmitting}
            >
              {/* Always reserve space for spinner to prevent layout shift */}
              <div className='w-4 h-4 mr-2 flex items-center justify-center'>
                {isSubmitting && (
                  <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
                )}
              </div>
              <span className='hidden sm:inline'>
                {isEditMode ? 'Update Expense' : 'Add Expense'}
              </span>
              <span className='sm:hidden'>{isEditMode ? 'Update' : 'Add'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
