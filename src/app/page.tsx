'use client';

import { useEffect } from 'react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
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
    <div className='min-h-screen bg-slate-100'>
      <LoadingSpinner className='min-h-screen flex items-center justify-center' />
    </div>
  );
}
