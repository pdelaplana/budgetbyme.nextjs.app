'use client';

import {
  CalendarIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  TagIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import type React from 'react';
import { use, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useAddEventMutation, useUpdateEventMutation } from '@/hooks/events';
import { sanitizeCurrencyInput } from '@/lib/formatters';
import { getEventIcon, getEventTypeLabel } from '@/lib/mockData/events';
import type { Event } from '@/types/Event';

interface EventFormData {
  name: string;
  type: Event['type'];
  description: string;
  eventDate: string;
  totalBudget: string;
}

interface AddOrEditEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingEvent?: Event | null;
  isEditMode?: boolean;
}

const eventTypes: Event['type'][] = [
  'wedding',
  'graduation',
  'birthday',
  'anniversary',
  'baby-shower',
  'retirement',
  'other',
];

export default function AddOrEditEventModal({
  isOpen,
  onClose,
  editingEvent,
  isEditMode = false,
}: AddOrEditEventModalProps) {
  const [formData, setFormData] = useState<EventFormData>({
    name: '',
    type: 'other',
    description: '',
    eventDate: '',
    totalBudget: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user } = useAuth();
  const { mutateAsync: addMutateAsync, isPending: isAddPending } =
    useAddEventMutation();
  const { mutateAsync: updateMutateAsync, isPending: isUpdatePending } =
    useUpdateEventMutation();

  const isPending = isAddPending || isUpdatePending;

  // Populate form when editing event
  useEffect(() => {
    if (isOpen && isEditMode && editingEvent) {
      setFormData({
        name: editingEvent.name,
        type: editingEvent.type,
        description: editingEvent.description || '',
        eventDate:
          editingEvent.eventDate instanceof Date
            ? editingEvent.eventDate.toISOString().split('T')[0]
            : new Date(editingEvent.eventDate).toISOString().split('T')[0],
        totalBudget: editingEvent.totalBudgetedAmount.toString(),
      });
    }
  }, [isOpen, isEditMode, editingEvent]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        name: '',
        type: 'other',
        description: '',
        eventDate: '',
        totalBudget: '',
      });
      setErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleInputChange = (field: keyof EventFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Event name is required';
    }

    if (!formData.eventDate) {
      newErrors.eventDate = 'Event date is required';
    } else {
      const selectedDate = new Date(formData.eventDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        newErrors.eventDate = 'Event date cannot be in the past';
      }
    }

    if (!formData.totalBudget.trim()) {
      newErrors.totalBudget = 'Budget amount is required';
    } else if (
      Number.isNaN(Number(formData.totalBudget)) ||
      Number(formData.totalBudget) <= 0
    ) {
      newErrors.totalBudget = 'Please enter a valid budget amount';
    }

    if (!formData.type) {
      newErrors.type = 'Please select an event type';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!user) {
      toast.error(
        'You must be signed in to ' +
          (isEditMode ? 'update' : 'create') +
          ' an event.',
      );
      return;
    }

    setIsSubmitting(true);

    try {
      let eventId: string;

      if (isEditMode && editingEvent) {
        // Update existing event
        const updateEventDTO = {
          userId: user.uid,
          eventId: editingEvent.id,
          name: formData.name.trim(),
          type: formData.type,
          description: formData.description.trim(),
          eventDate: new Date(formData.eventDate),
          totalBudgetedAmount: Number(formData.totalBudget),
          currency: 'AUD',
          status: 'on-track',
        };

        eventId = await updateMutateAsync(updateEventDTO);
      } else {
        // Create new event
        const addEventDTO = {
          userId: user.uid,
          name: formData.name.trim(),
          type: formData.type,
          description: formData.description.trim(),
          eventDate: formData.eventDate, // Keep as string, let server action handle Date conversion
          totalBudgetedAmount: Number(formData.totalBudget),
          currency: 'AUD',
          status: 'on-track',
        };

        eventId = await addMutateAsync({
          userId: user.uid,
          addEventDTO,
        });
      }

      // Show success toast
      toast.success(
        isEditMode
          ? `"${formData.name.trim()}" has been updated successfully!`
          : `"${formData.name.trim()}" has been created successfully! You can now start adding expenses and tracking your budget.`,
      );

      // Reset form and close modal immediately
      setFormData({
        name: '',
        type: 'other',
        description: '',
        eventDate: '',
        totalBudget: '',
      });
      setErrors({});
      onClose();
    } catch (error) {
      console.error('Error adding event:', error);

      // Convert error to user-friendly message and show as toast
      let errorMessage = 'Failed to create event. Please try again.';

      if (error instanceof Error) {
        // Handle specific error messages from the backend
        if (error.message.includes('User ID is required')) {
          errorMessage = 'Authentication error. Please sign in again.';
        } else if (error.message.includes('Event name is required')) {
          errorMessage = 'Event name is required.';
        } else if (error.message.includes('Event date is required')) {
          errorMessage = 'Event date is required.';
        } else if (error.message.includes('Budget amount cannot be negative')) {
          errorMessage = 'Budget amount must be a positive number.';
        } else if (error.message.includes('Currency is required')) {
          errorMessage = 'Currency selection is required.';
        } else if (
          error.message.includes('network') ||
          error.message.includes('fetch')
        ) {
          errorMessage =
            'Network error. Please check your connection and try again.';
        } else if (
          error.message.includes('permission') ||
          error.message.includes('unauthorized')
        ) {
          errorMessage = 'Permission denied. Please sign in again.';
        } else {
          // Use the error message if it's user-friendly, otherwise use default
          errorMessage =
            error.message.length < 100 ? error.message : errorMessage;
        }
      }

      toast.error(errorMessage);
      // Keep form open on error so user can retry
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting && !isPending) {
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
              <CalendarIcon className='h-6 w-6 text-primary-600 flex-shrink-0' />
              <div className='flex-1 min-w-0'>
                <h2 className='text-lg sm:text-xl font-semibold text-gray-900'>
                  <span className='hidden sm:inline'>
                    {isEditMode ? 'Edit Event' : 'Create New Event'}
                  </span>
                  <span className='sm:hidden'>
                    {isEditMode ? 'Edit Event' : 'New Event'}
                  </span>
                </h2>
                <p className='text-sm text-gray-600'>
                  {isEditMode
                    ? 'Update your event details and budget information'
                    : 'Set up a new event to track your budget and expenses'}
                </p>
              </div>
            </div>
            <button
              type='button'
              onClick={handleClose}
              disabled={isSubmitting || isPending}
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
            id='event-form'
            onSubmit={handleSubmit}
            className='space-y-6 sm:space-y-8'
          >
            {/* Event Name */}
            <div>
              <label htmlFor='event-name' className='form-label'>
                <DocumentTextIcon className='h-4 w-4 inline mr-2' />
                Event Name
              </label>
              <input
                id='event-name'
                type='text'
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="e.g., Sarah & John's Wedding"
                className={`form-input ${errors.name ? 'border-red-300 focus:border-red-500' : ''}`}
                disabled={isSubmitting || isPending}
                maxLength={100}
              />
              {errors.name && (
                <p className='mt-1 text-sm text-red-600'>{errors.name}</p>
              )}
            </div>

            {/* Event Type */}
            <div>
              <label htmlFor='event-type' className='form-label'>
                <TagIcon className='h-4 w-4 inline mr-2' />
                Event Type
              </label>
              <select
                id='event-type'
                value={formData.type}
                onChange={(e) =>
                  handleInputChange('type', e.target.value as Event['type'])
                }
                className={`form-input ${errors.type ? 'border-red-300 focus:border-red-500' : ''}`}
                disabled={isSubmitting || isPending}
              >
                {eventTypes.map((type) => (
                  <option key={type} value={type}>
                    {getEventIcon(type)} {getEventTypeLabel(type)}
                  </option>
                ))}
              </select>
              {errors.type && (
                <p className='mt-1 text-sm text-red-600'>{errors.type}</p>
              )}
            </div>

            {/* Event Date and Budget Row */}
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6'>
              {/* Event Date */}
              <div>
                <label htmlFor='event-date' className='form-label'>
                  <CalendarIcon className='h-4 w-4 inline mr-2' />
                  Event Date
                </label>
                <input
                  id='event-date'
                  type='date'
                  value={formData.eventDate}
                  onChange={(e) =>
                    handleInputChange('eventDate', e.target.value)
                  }
                  className={`form-input ${errors.eventDate ? 'border-red-300 focus:border-red-500' : ''}`}
                  disabled={isSubmitting || isPending}
                />
                {errors.eventDate && (
                  <p className='mt-1 text-sm text-red-600'>
                    {errors.eventDate}
                  </p>
                )}
              </div>

              {/* Total Budget */}
              <div>
                <label htmlFor='event-budget' className='form-label'>
                  <CurrencyDollarIcon className='h-4 w-4 inline mr-2' />
                  Total Budget
                </label>
                <div className='relative'>
                  <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                    <span className='text-gray-500 sm:text-sm'>$</span>
                  </div>
                  <input
                    id='event-budget'
                    type='text'
                    value={formData.totalBudget}
                    onChange={(e) =>
                      handleInputChange(
                        'totalBudget',
                        sanitizeCurrencyInput(e.target.value).toString(),
                      )
                    }
                    placeholder='0.00'
                    className={`form-input pl-7 ${errors.totalBudget ? 'border-red-300 focus:border-red-500' : ''}`}
                    disabled={isSubmitting || isPending}
                  />
                </div>
                {errors.totalBudget && (
                  <p className='mt-1 text-sm text-red-600'>
                    {errors.totalBudget}
                  </p>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor='event-description' className='form-label'>
                <DocumentTextIcon className='h-4 w-4 inline mr-2' />
                Description (Optional)
              </label>
              <textarea
                id='event-description'
                value={formData.description}
                onChange={(e) =>
                  handleInputChange('description', e.target.value)
                }
                placeholder='Add details about your event...'
                rows={3}
                className='form-input resize-none'
                disabled={isSubmitting || isPending}
                maxLength={500}
              />
              <div className='flex justify-between text-xs text-gray-500 mt-1'>
                <span>Optional details about your event</span>
                <span>{formData.description.length}/500</span>
              </div>
            </div>

            {/* Event Preview */}
            <div className='bg-gray-50 rounded-lg p-4'>
              <h4 className='text-sm font-medium text-gray-700 mb-3'>
                Preview
              </h4>
              <div className='flex items-start gap-3'>
                <div className='text-2xl'>{getEventIcon(formData.type)}</div>
                <div className='flex-1 min-w-0'>
                  <p className='font-medium text-gray-900'>
                    {formData.name || 'Event Name'}
                  </p>
                  <p className='text-sm text-gray-600'>
                    {getEventTypeLabel(formData.type)} • Budget: $
                    {formData.totalBudget || '0.00'}
                  </p>
                  {formData.eventDate && (
                    <p className='text-sm text-gray-500'>
                      {new Date(formData.eventDate).toLocaleDateString(
                        'en-US',
                        {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        },
                      )}
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
              onClick={handleClose}
              className='btn-secondary flex-1 order-2 sm:order-1'
              disabled={isSubmitting || isPending}
            >
              Cancel
            </button>
            <button
              type='submit'
              form='event-form'
              className='btn-primary flex-1 order-1 sm:order-2 flex items-center justify-center'
              disabled={isSubmitting || isPending}
            >
              {(isSubmitting || isPending) && (
                <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
              )}
              <span className='hidden sm:inline'>
                {isSubmitting || isPending
                  ? isEditMode
                    ? 'Updating Event...'
                    : 'Creating Event...'
                  : isEditMode
                    ? 'Update Event'
                    : 'Create Event'}
              </span>
              <span className='sm:hidden'>
                {isSubmitting || isPending
                  ? isEditMode
                    ? 'Updating...'
                    : 'Creating...'
                  : isEditMode
                    ? 'Update'
                    : 'Create'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
