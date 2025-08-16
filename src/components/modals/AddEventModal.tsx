'use client';

import {
  CalendarIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  TagIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import React, { useState } from 'react';
import {
  type Event,
  getEventIcon,
  getEventTypeLabel,
} from '@/lib/mockData/events';

interface EventFormData {
  name: string;
  type: Event['type'];
  description: string;
  eventDate: string;
  totalBudget: string;
}

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddEvent: (
    eventData: Omit<Event, 'id' | 'createdAt' | 'categories'>,
  ) => void;
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

export default function AddEventModal({
  isOpen,
  onClose,
  onAddEvent,
}: AddEventModalProps) {
  const [formData, setFormData] = useState<EventFormData>({
    name: '',
    type: 'other',
    description: '',
    eventDate: '',
    totalBudget: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // Reset form when modal closes
  React.useEffect(() => {
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

  const formatCurrency = (value: string) => {
    const numericValue = value.replace(/[^\\d.]/g, '');
    return numericValue;
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
      isNaN(Number(formData.totalBudget)) ||
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

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const eventData = {
        name: formData.name.trim(),
        type: formData.type,
        description: formData.description.trim(),
        eventDate: formData.eventDate,
        totalBudget: Number(formData.totalBudget),
        totalSpent: 0,
        spentPercentage: 0,
        status: 'on-track' as const,
      };

      onAddEvent(eventData);

      // Reset form and close modal
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
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
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
                  <span className='hidden sm:inline'>Create New Event</span>
                  <span className='sm:hidden'>New Event</span>
                </h2>
                <p className='text-sm text-gray-600'>
                  Set up a new event to track your budget and expenses
                </p>
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
                disabled={isSubmitting}
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
                disabled={isSubmitting}
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
                  disabled={isSubmitting}
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
                        formatCurrency(e.target.value),
                      )
                    }
                    placeholder='0.00'
                    className={`form-input pl-7 ${errors.totalBudget ? 'border-red-300 focus:border-red-500' : ''}`}
                    disabled={isSubmitting}
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
                disabled={isSubmitting}
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
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type='submit'
              form='event-form'
              className='btn-primary flex-1 order-1 sm:order-2'
              disabled={isSubmitting}
            >
              <span className='hidden sm:inline'>
                {isSubmitting ? 'Creating Event...' : 'Create Event'}
              </span>
              <span className='sm:hidden'>
                {isSubmitting ? 'Creating...' : 'Create'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
