'use client';

import {
  ArrowRightIcon,
  CalendarIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import RootLayout from '@/components/layouts/RootLayout';
import AddEventModal from '@/components/modals/AddEventModal';
import { useEvents } from '@/contexts/EventsContext';

export default function EventsPage() {
  const router = useRouter();
  const { events, isLoading } = useEvents();
  const [showAddEvent, setShowAddEvent] = useState(false);

  if (isLoading) {
    return (
      <RootLayout>
        <div className='flex items-center justify-center min-h-[60vh]'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4'></div>
            <p className='text-gray-600'>Loading your events...</p>
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
                      onClick={() =>
                        router.push(`/events/${event.id}/dashboard`)
                      }
                      className='group relative bg-white border border-gray-200 rounded-lg p-6 hover:border-primary-300 hover:shadow-md transition-all duration-200 cursor-pointer'
                    >
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
                          <div className='flex items-center text-sm text-gray-500'>
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
                              ${event.totalBudget?.toLocaleString() || '0'}
                            </span>
                          </div>
                          {event.categories && event.categories.length > 0 && (
                            <div className='text-xs text-gray-500'>
                              {event.categories.length} categor
                              {event.categories.length === 1 ? 'y' : 'ies'}
                            </div>
                          )}
                        </div>

                        {/* Arrow Icon */}
                        <div className='absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200'>
                          <ArrowRightIcon className='h-5 w-5 text-primary-600' />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Create New Event */}
              <div className='pt-8 border-t border-gray-200'>
                <button
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
        <AddEventModal
          isOpen={showAddEvent}
          onClose={() => setShowAddEvent(false)}
          onAddEvent={(eventData) => {
            console.log('Add new event:', eventData);
            setShowAddEvent(false);
          }}
        />
      </RootLayout>
    </ProtectedRoute>
  );
}
