'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useEvents } from '@/contexts/EventsContext';

export default function HomePage() {
  const { user, loading: authLoading } = useAuth();
  const { events, isLoading: eventsLoading } = useEvents();

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        // User not authenticated, redirect to sign in
        window.location.href = '/signin';
        return;
      }

      if (!eventsLoading) {
        if (events.length > 0) {
          // Navigate to first event's dashboard
          window.location.href = `/events/${events[0].id}/dashboard`;
        } else {
          // Navigate to events page to create first event
          window.location.href = '/events';
        }
      }
    }
  }, [user, authLoading, events, eventsLoading]);

  return (
    <div className='min-h-screen bg-slate-100 flex items-center justify-center'>
      <div className='text-center'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4'></div>
        <p className='text-gray-600'>Loading...</p>
      </div>
    </div>
  );
}
