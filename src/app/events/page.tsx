'use client';

import {
  ArrowRightIcon,
  CalendarIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import type React from 'react';
import { useState } from 'react';
import { toast } from 'sonner';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import RootLayout from '@/components/layouts/RootLayout';
import AddOrEditEventModal from '@/components/modals/AddOrEditEventModal';
import ConfirmDialog from '@/components/modals/ConfirmDialog';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/contexts/AuthContext';
import { useEvents } from '@/contexts/EventsContext';
import { useDeleteEventMutation } from '@/hooks/events';
import type { Event } from '@/types/Event';

export default function EventsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { events, isLoading, error, refetch, setSelectedEvent } = useEvents();
  const [showAddEvent, setShowAddEvent] = useState(false);

  // Delete event state management
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null);
  const [isDeletingEvent, setIsDeletingEvent] = useState(false);

  // Delete event mutation
  const deleteEventMutation = useDeleteEventMutation({
    onSuccess: (result) => {
      setIsDeletingEvent(false);
      setShowDeleteConfirm(false);
      setEventToDelete(null);
      toast.success(result.message);
    },
    onError: (error) => {
      setIsDeletingEvent(false);
      console.error('Delete event failed:', error);
      toast.error('Failed to delete event. Please try again.');
    },
  });

  const handleEventClick = (event: Event) => {
    // Set the selected event in context before navigating
    setSelectedEvent(event);
    router.push(`/events/${event.id}/dashboard`);
  };

  const handleDeleteEvent = (e: React.MouseEvent, event: Event) => {
    e.stopPropagation(); // Prevent event click navigation
    setEventToDelete(event);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteEvent = async () => {
    if (!user?.uid || !eventToDelete) return;

    setIsDeletingEvent(true);
    try {
      await deleteEventMutation.mutateAsync({
        userId: user.uid,
        eventId: eventToDelete.id,
      });
    } catch (_error) {
      // Error handling is managed in the mutation callbacks
    }
  };

  if (isLoading) {
    return (
      <RootLayout>
        <div className='min-h-[60vh] flex items-center justify-center'>
          <LoadingSpinner
            title='Loading Events...'
            message='Please wait while we load your events'
            size='md'
          />
        </div>
      </RootLayout>
    );
  }

  if (error) {
    return (
      <RootLayout>
        <div className='flex items-center justify-center min-h-[60vh]'>
          <div className='text-center space-y-4'>
            <div className='text-red-500 text-4xl'>⚠️</div>
            <div>
              <h2 className='text-xl font-semibold text-gray-900 mb-2'>
                Unable to Load Events
              </h2>
              <p className='text-gray-600 mb-4'>
                {error || 'Something went wrong while loading your events.'}
              </p>
              <button
                type='button'
                onClick={() => refetch()}
                className='btn-primary'
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </RootLayout>
    );
  }

  const hasEvents = events.length > 0;

  return (
    <ProtectedRoute>
      <RootLayout>
        <div className='max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8'>
          {hasEvents ? (
            /* User has events - prompt to select one */
            <div className='text-center space-y-8'>
              {/* Header */}
              <div className='space-y-4'>
                <div className='mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary-100'>
                  <CalendarIcon className='h-8 w-8 text-primary-600' />
                </div>
                <div>
                  <h1 className='text-3xl font-bold text-gray-900'>
                    Choose Your Event
                  </h1>
                  <p className='mt-2 text-lg text-gray-600'>
                    Select an event from the sidebar to view your budget
                    dashboard
                  </p>
                </div>
              </div>

              {/* Event List */}
              <div className='space-y-4'>
                <h2 className='text-xl font-semibold text-gray-900'>
                  Your Events
                </h2>
                <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
                  {events.map((event) => (
                    <div
                      key={event.id}
                      onClick={() => handleEventClick(event)}
                      className='group relative bg-white border border-gray-200 rounded-lg p-6 hover:border-primary-300 hover:shadow-md transition-all duration-200 cursor-pointer'
                    >
                      {/* Action Buttons */}
                      <div className='absolute top-2 right-2 flex space-x-1 z-10'>
                        {/* Delete Button */}
                        <button
                          type='button'
                          onClick={(e) => handleDeleteEvent(e, event)}
                          className='opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md shadow-sm'
                          aria-label={`Delete ${event.name}`}
                        >
                          <TrashIcon className='h-4 w-4' />
                        </button>

                        {/* Arrow Icon */}
                        <div className='opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1.5 text-primary-600'>
                          <ArrowRightIcon className='h-4 w-4' />
                        </div>
                      </div>

                      <div className='space-y-3'>
                        {/* Event Info */}
                        <div>
                          <h3 className='text-lg font-semibold text-gray-900 group-hover:text-primary-700 transition-colors duration-200'>
                            {event.name}
                          </h3>
                          {event.description && (
                            <p className='mt-1 text-sm text-gray-600 line-clamp-2'>
                              {event.description}
                            </p>
                          )}
                        </div>

                        {/* Event Date */}
                        {event.eventDate && (
                          <div className='flex items-center justify-center text-sm text-gray-500'>
                            <CalendarIcon className='h-4 w-4 mr-1.5' />
                            {new Date(event.eventDate).toLocaleDateString(
                              'en-US',
                              {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              },
                            )}
                          </div>
                        )}

                        {/* Budget Summary */}
                        <div className='space-y-2'>
                          <div className='flex justify-between items-center text-sm'>
                            <span className='text-gray-600'>Total Budget:</span>
                            <span className='font-semibold text-gray-900'>
                              $
                              {event.totalBudgetedAmount?.toLocaleString() ||
                                '0'}
                            </span>
                          </div>
                          <div className='text-xs text-gray-500'>
                            Spent: $
                            {event.totalSpentAmount?.toLocaleString() || '0'} (
                            {event.spentPercentage || 0}%)
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Create New Event */}
              <div className='pt-8 border-t border-gray-200'>
                <button
                  type='button'
                  onClick={() => setShowAddEvent(true)}
                  className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 transition-colors duration-200'
                >
                  <PlusIcon className='h-4 w-4 mr-2' />
                  Create New Event
                </button>
              </div>

              {/* Helpful Tip */}
              <div className='bg-blue-50 border border-blue-200 rounded-lg p-4 text-left'>
                <div className='flex'>
                  <div className='ml-3'>
                    <h3 className='text-sm font-medium text-blue-800'>
                      💡 Tip
                    </h3>
                    <div className='mt-2 text-sm text-blue-700'>
                      <p>
                        You can also select events from the sidebar on the left.
                        Click on any event name to quickly switch between your
                        different event budgets.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* User has no events - prompt to create one */
            <div className='text-center space-y-8'>
              {/* Header */}
              <div className='space-y-4'>
                <div className='mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary-100'>
                  <CalendarIcon className='h-10 w-10 text-primary-600' />
                </div>
                <div>
                  <h1 className='text-3xl font-bold text-gray-900'>
                    Welcome to BudgetByMe!
                  </h1>
                  <p className='mt-2 text-xl text-gray-600'>
                    Let's create your first event to start budgeting
                  </p>
                </div>
              </div>

              {/* Empty State Illustration */}
              <div className='space-y-6'>
                <div className='text-6xl'>🎉</div>
                <div className='max-w-md mx-auto'>
                  <h2 className='text-xl font-semibold text-gray-900 mb-3'>
                    Ready to plan something amazing?
                  </h2>
                  <p className='text-gray-600'>
                    Whether it's a wedding, graduation, birthday party, or any
                    special celebration, BudgetByMe helps you plan and track
                    your event budget with ease.
                  </p>
                </div>
              </div>

              {/* Create Event Button */}
              <div className='space-y-4'>
                <button
                  type='button'
                  onClick={() => setShowAddEvent(true)}
                  className='inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 transition-colors duration-200 shadow-sm'
                >
                  <PlusIcon className='h-5 w-5 mr-2' />
                  Create Your First Event
                </button>
                <p className='text-sm text-gray-500'>
                  It only takes a minute to get started
                </p>
              </div>

              {/* Features Preview */}
              <div className='pt-12 border-t border-gray-200'>
                <h3 className='text-lg font-semibold text-gray-900 mb-6'>
                  What you can do with BudgetByMe:
                </h3>
                <div className='grid gap-6 sm:grid-cols-3'>
                  <div className='text-center space-y-2'>
                    <div className='text-3xl'>📊</div>
                    <h4 className='font-medium text-gray-900'>
                      Track Expenses
                    </h4>
                    <p className='text-sm text-gray-600'>
                      Organize expenses by categories and monitor your spending
                    </p>
                  </div>
                  <div className='text-center space-y-2'>
                    <div className='text-3xl'>💳</div>
                    <h4 className='font-medium text-gray-900'>
                      Payment Schedules
                    </h4>
                    <p className='text-sm text-gray-600'>
                      Set up payment plans and track due dates for vendors
                    </p>
                  </div>
                  <div className='text-center space-y-2'>
                    <div className='text-3xl'>📈</div>
                    <h4 className='font-medium text-gray-900'>
                      Budget Insights
                    </h4>
                    <p className='text-sm text-gray-600'>
                      Get visual insights and stay within your budget limits
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Add Event Modal */}
        <AddOrEditEventModal
          isOpen={showAddEvent}
          onClose={() => setShowAddEvent(false)}
        />

        {/* Delete Event Confirmation Modal */}
        <ConfirmDialog
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={confirmDeleteEvent}
          title='Delete Event'
          message={`Are you sure you want to delete "${eventToDelete?.name}"? This action cannot be undone. All expenses, categories, payments, and associated data will be permanently removed.`}
          confirmText='Delete Event'
          cancelText='Keep Event'
          type='danger'
          isLoading={isDeletingEvent}
        />
      </RootLayout>
    </ProtectedRoute>
  );
}
