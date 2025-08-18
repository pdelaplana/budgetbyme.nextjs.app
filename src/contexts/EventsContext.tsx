'use client';

import type React from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useFetchEvents } from '@/hooks/events';
import type { Event } from '@/types/Event';

interface EventsContextType {
  events: Event[];
  addEvent: (event: Omit<Event, 'id' | 'createdAt'>) => void;
  updateEvent: (eventId: string, updates: Partial<Event>) => void;
  deleteEvent: (eventId: string) => void;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

const EventsContext = createContext<EventsContextType | undefined>(undefined);

interface EventsProviderProps {
  children: React.ReactNode;
}

export function EventsProvider({ children }: EventsProviderProps) {
  const { user } = useAuth();
  
  // Use the real useFetchEvents hook
  const {
    data: events = [],
    isLoading,
    error,
    refetch,
  } = useFetchEvents(user?.uid || '');

  // These functions are now placeholder - actual mutations should be handled
  // by the respective mutation hooks (useAddEventMutation, etc.)
  const addEvent = (eventData: Omit<Event, 'id' | 'createdAt'>) => {
    console.warn('addEvent called on EventsContext - use useAddEventMutation hook instead');
    // The AddEventModal already uses the proper mutation hook
  };

  const updateEvent = (eventId: string, updates: Partial<Event>) => {
    console.warn('updateEvent called on EventsContext - use useUpdateEventMutation hook instead');
    // TODO: Implement useUpdateEventMutation hook when needed
  };

  const deleteEvent = (eventId: string) => {
    console.warn('deleteEvent called on EventsContext - use useDeleteEventMutation hook instead');
    // TODO: Implement useDeleteEventMutation hook when needed
  };

  const contextValue: EventsContextType = {
    events,
    addEvent,
    updateEvent,
    deleteEvent,
    isLoading,
    error: error?.message || null,
    refetch,
  };

  return (
    <EventsContext.Provider value={contextValue}>
      {children}
    </EventsContext.Provider>
  );
}

export function useEvents() {
  const context = useContext(EventsContext);
  if (context === undefined) {
    throw new Error('useEvents must be used within an EventsProvider');
  }
  return context;
}
