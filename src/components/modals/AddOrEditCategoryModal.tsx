/** biome-ignore-all lint/a11y/noLabelWithoutControl: <explanation> */
'use client';

import {
  CurrencyDollarIcon,
  DocumentTextIcon,
  SwatchIcon,
  TagIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { toast } from 'sonner';
import IconSelector from '@/components/ui/IconSelector';
import { useAuth } from '@/contexts/AuthContext';
import { useEventDetails } from '@/contexts/EventDetailsContext';
import {
  useAddCategoryMutation,
  useUpdateCategoryMutation,
} from '@/hooks/categories';
import { sanitizeCurrencyInput } from '@/lib/formatters';

interface CategoryFormData {
  name: string;
  budget: string;
  description: string;
  color: string;
  icon: string;
}

interface AddOrEditCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingCategory?: {
    id: string;
    name: string;
    budgetedAmount: number;
    description?: string;
    color: string;
    icon: string;
  } | null;
  isEditMode?: boolean;
}

const PRESET_COLORS = [
  '#059669', // emerald-600
  '#10b981', // emerald-500
  '#7C3AED', // violet-600
  '#EC4899', // pink-500
  '#34d399', // emerald-400
  '#EA580C', // orange-600
  '#DC2626', // red-600
  '#2563EB', // blue-600
  '#9333EA', // purple-600
  '#059212', // green-600
  '#DB2777', // pink-600
  '#7C2D12', // amber-800
];

export default function AddOrEditCategoryModal({
  isOpen,
  onClose,
  editingCategory,
  isEditMode = false,
}: AddOrEditCategoryModalProps) {
  // Hooks
  const { user } = useAuth();
  const { event } = useEventDetails();
  const router = useRouter();
  const addCategoryMutation = useAddCategoryMutation({
    onSuccess: (categoryId) => {
      // Close modal immediately for better UX
      handleClose();

      // Show success toast
      toast.success('Category created successfully!');

      // Navigate after a brief delay to allow query invalidation to start
      if (event?.id && categoryId) {
        setTimeout(() => {
          router.push(`/events/${event.id}/category/${categoryId}`);
        }, 100);
      }
    },
    onError: (error) => {
      console.error('Failed to add category:', error);
      toast.error(
        error.message || 'Failed to create category. Please try again.',
      );
    },
  });
  const updateCategoryMutation = useUpdateCategoryMutation({
    onSuccess: () => {
      console.log(
        '✅ Update category success handler called - isSubmitting:',
        updateCategoryMutation.isPending,
      );

      // Show success toast first
      toast.success('Category updated successfully!');

      // Force close the modal immediately without checking isSubmitting
      console.log('🚪 Force closing modal from success handler');
      handleClose(true);

      // No need to navigate - stay on the same category page
    },
    onError: (error) => {
      console.error('❌ Failed to update category:', error);
      toast.error(
        error.message || 'Failed to update category. Please try again.',
      );
    },
  });

  // Form state
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    budget: '',
    description: '',
    color: PRESET_COLORS[0],
    icon: '🎉',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Loading state from mutations
  const isSubmitting =
    addCategoryMutation.isPending || updateCategoryMutation.isPending;

  // Pre-populate form when editing
  React.useEffect(() => {
    if (editingCategory && isEditMode) {
      setFormData({
        name: editingCategory.name || '',
        budget: (editingCategory.budgetedAmount ?? 0).toString(),
        description: editingCategory.description || '',
        color: editingCategory.color || PRESET_COLORS[0],
        icon: editingCategory.icon || '🎉',
      });
    } else if (!isOpen) {
      // Reset form when modal closes
      setFormData({
        name: '',
        budget: '',
        description: '',
        color: PRESET_COLORS[0],
        icon: '🎉',
      });
      setErrors({});
    }
  }, [editingCategory, isEditMode, isOpen]);

  const handleInputChange = (field: keyof CategoryFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Category name is required';
    }

    if (!formData.budget.trim()) {
      newErrors.budget = 'Budget amount is required';
    } else if (
      Number.isNaN(Number(formData.budget)) ||
      Number(formData.budget) < 0
    ) {
      newErrors.budget =
        'Please enter a valid budget amount (zero or positive)';
    }

    if (!formData.color) {
      newErrors.color = 'Please select a color';
    }

    if (!formData.icon) {
      newErrors.icon = 'Please select an icon';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log(
      '🚀 Form submitted - isEditMode:',
      isEditMode,
      'editingCategory:',
      editingCategory?.id,
    );

    if (!validateForm()) {
      console.log('❌ Form validation failed');
      return;
    }

    // Validate required context
    if (!user?.uid) {
      console.error('User not authenticated');
      return;
    }

    if (!event?.id) {
      console.error('No event selected');
      return;
    }

    try {
      if (isEditMode && editingCategory) {
        console.log('🔄 Attempting to update category:', editingCategory.id);
        // Update existing category
        const updateDto = {
          userId: user.uid,
          eventId: event.id,
          categoryId: editingCategory.id,
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          budgetedAmount: Number(formData.budget),
          color: formData.color.trim(),
          icon: formData.icon,
        };

        console.log('📦 Update DTO:', updateDto);
        await updateCategoryMutation.mutateAsync(updateDto);
        console.log('✅ Update mutation completed');
      } else {
        // Add new category
        const addDto = {
          userId: user.uid,
          eventId: event.id,
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          budgetedAmount: Number(formData.budget),
          color: formData.color.trim(),
          icon: formData.icon,
        };

        await addCategoryMutation.mutateAsync({
          userId: user.uid,
          eventId: event.id,
          addCategoryDto: addDto,
        });
      }

      // Success handling is done in mutation callbacks
    } catch (error) {
      // Error handling is done in mutation callbacks
      console.error('Error submitting category:', error);
    }
  };

  const handleClose = (forceOrEvent?: boolean | React.MouseEvent) => {
    const force = typeof forceOrEvent === 'boolean' ? forceOrEvent : false;
    console.log(
      '🚪 handleClose called - isSubmitting:',
      isSubmitting,
      'force:',
      force,
    );
    if (!isSubmitting || force) {
      console.log('✅ Closing modal - clearing form and calling onClose');
      setFormData({
        name: '',
        budget: '',
        description: '',
        color: PRESET_COLORS[0],
        icon: '🎉',
      });
      setErrors({});
      onClose();
    } else {
      console.log('❌ Modal not closing because isSubmitting is true');
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
              <TagIcon className='h-6 w-6 text-primary-600 flex-shrink-0' />
              <div className='flex-1 min-w-0'>
                <h2 className='text-lg sm:text-xl font-semibold text-gray-900'>
                  <span className='hidden sm:inline'>
                    {isEditMode
                      ? 'Edit Budget Category'
                      : 'Add Budget Category'}
                  </span>
                  <span className='sm:hidden'>
                    {isEditMode ? 'Edit Category' : 'Add Category'}
                  </span>
                </h2>
                <p className='text-sm text-gray-600'>
                  {isEditMode
                    ? 'Update your budget category information'
                    : 'Create a new budget category for your event'}
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
            id='category-form'
            onSubmit={handleSubmit}
            className={`space-y-6 sm:space-y-8 transition-opacity duration-200 ${
              isSubmitting ? 'opacity-50 pointer-events-none' : 'opacity-100'
            }`}
          >
            {/* Category Name */}
            <div>
              <label htmlFor='category-name' className='form-label'>
                <TagIcon className='h-4 w-4 inline mr-2' />
                Category Name
              </label>
              <input
                id='category-name'
                type='text'
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder='e.g., Venue & Reception'
                className={`form-input ${errors.name ? 'border-red-300 focus:border-red-500' : ''}`}
                disabled={isSubmitting}
                maxLength={50}
              />
              {errors.name && (
                <p className='mt-1 text-sm text-red-600'>{errors.name}</p>
              )}
            </div>

            {/* Budget Amount */}
            <div>
              <label htmlFor='category-budget' className='form-label'>
                <CurrencyDollarIcon className='h-4 w-4 inline mr-2' />
                Budget Amount
              </label>
              <div className='relative'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <span className='text-gray-500 sm:text-sm'>$</span>
                </div>
                <input
                  id='category-budget'
                  type='text'
                  value={formData.budget}
                  onChange={(e) =>
                    handleInputChange(
                      'budget',
                      sanitizeCurrencyInput(e.target.value).toString(),
                    )
                  }
                  placeholder='0.00'
                  className={`form-input pl-7 ${errors.budget ? 'border-red-300 focus:border-red-500' : ''}`}
                  disabled={isSubmitting}
                />
              </div>
              {errors.budget && (
                <p className='mt-1 text-sm text-red-600'>{errors.budget}</p>
              )}
            </div>

            {/* Icon Selection */}
            <div>
              <label className='form-label'>
                <TagIcon className='h-4 w-4 inline mr-2' />
                Category Icon
              </label>
              <IconSelector
                value={formData.icon}
                onChange={(icon) => handleInputChange('icon', icon)}
                disabled={isSubmitting}
                error={errors.icon}
              />
            </div>

            {/* Color Selection */}
            <div>
              <label className='form-label'>
                <SwatchIcon className='h-4 w-4 inline mr-2' />
                Category Color
              </label>
              <div className='grid grid-cols-6 sm:grid-cols-8 gap-3 mt-2'>
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    type='button'
                    onClick={() => handleInputChange('color', color)}
                    className={`w-12 h-12 rounded-lg border-2 transition-all duration-200 hover:scale-105 ${
                      formData.color === color
                        ? 'border-gray-900 ring-2 ring-gray-900 ring-offset-2'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    style={{ backgroundColor: color }}
                    aria-label={`Select color ${color}`}
                  />
                ))}
              </div>
              {errors.color && (
                <p className='mt-1 text-sm text-red-600'>{errors.color}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label htmlFor='category-description' className='form-label'>
                <DocumentTextIcon className='h-4 w-4 inline mr-2' />
                Description (Optional)
              </label>
              <textarea
                id='category-description'
                value={formData.description}
                onChange={(e) =>
                  handleInputChange('description', e.target.value)
                }
                placeholder='Add details about what expenses belong in this category...'
                rows={3}
                className='form-input resize-none'
                disabled={isSubmitting}
                maxLength={200}
              />
              <div className='flex justify-between text-xs text-gray-500 mt-1'>
                <span>Optional details about this category</span>
                <span>{formData.description.length}/200</span>
              </div>
            </div>

            {/* Category Preview */}
            <div className='bg-gray-50 rounded-lg p-4'>
              <h4 className='text-sm font-medium text-gray-700 mb-3'>
                Preview
              </h4>
              <div className='flex items-center gap-3'>
                <div className='flex items-center gap-2'>
                  <span className='text-lg'>{formData.icon}</span>
                  <div
                    className='w-4 h-4 rounded-full flex-shrink-0'
                    style={{ backgroundColor: formData.color }}
                  />
                </div>
                <div className='flex-1 min-w-0'>
                  <p className='font-medium text-gray-900'>
                    {formData.name || 'Category Name'}
                  </p>
                  <p className='text-sm text-gray-600'>
                    Budget: ${formData.budget || '0.00'}
                  </p>
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
              onClick={handleClose}
              className='btn-secondary flex-1 order-2 sm:order-1'
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type='submit'
              form='category-form'
              className='btn-primary flex-1 order-1 sm:order-2 flex items-center justify-center'
              disabled={isSubmitting}
            >
              {isSubmitting && (
                <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
              )}
              <span className='hidden sm:inline'>
                {isEditMode ? 'Update Category' : 'Add Category'}
              </span>
              <span className='sm:hidden'>{isEditMode ? 'Update' : 'Add'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
