'use client';

import type React from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { type Event, mockEvents } from '@/lib/mockData/events';

interface EventsContextType {
  events: Event[];
  addEvent: (event: Omit<Event, 'id' | 'createdAt'>) => void;
  updateEvent: (eventId: string, updates: Partial<Event>) => void;
  deleteEvent: (eventId: string) => void;
  isLoading: boolean;
}

const EventsContext = createContext<EventsContextType | undefined>(undefined);

interface EventsProviderProps {
  children: React.ReactNode;
}

export function EventsProvider({ children }: EventsProviderProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize events and load from localStorage
  useEffect(() => {
    const initializeEvents = () => {
      try {
        // Try to load from localStorage first
        const savedEvents = localStorage.getItem('budgetbyme-events');

        let eventsToUse = mockEvents;

        if (savedEvents) {
          const parsedEvents = JSON.parse(savedEvents);
          if (Array.isArray(parsedEvents) && parsedEvents.length > 0) {
            eventsToUse = parsedEvents;
          }
        }

        setEvents(eventsToUse);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading events from localStorage:', error);
        // Fallback to mock data
        setEvents(mockEvents);
        setIsLoading(false);
      }
    };

    initializeEvents();
  }, []);

  // Save events to localStorage whenever they change
  useEffect(() => {
    if (!isLoading && events.length > 0) {
      try {
        localStorage.setItem('budgetbyme-events', JSON.stringify(events));
      } catch (error) {
        console.error('Error saving events to localStorage:', error);
      }
    }
  }, [events, isLoading]);

  const addEvent = (eventData: Omit<Event, 'id' | 'createdAt'>) => {
    const newEvent: Event = {
      ...eventData,
      id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      categories: eventData.categories || [],
    };

    setEvents((prev) => [...prev, newEvent]);

    // Navigate to the new event's dashboard
    window.location.href = `/events/${newEvent.id}/dashboard`;
  };

  const updateEvent = (eventId: string, updates: Partial<Event>) => {
    setEvents((prev) =>
      prev.map((event) =>
        event.id === eventId ? { ...event, ...updates } : event,
      ),
    );
  };

  const deleteEvent = (eventId: string) => {
    setEvents((prev) => {
      const filteredEvents = prev.filter((event) => event.id !== eventId);

      // If we have remaining events, navigate to the first one's dashboard
      if (filteredEvents.length > 0) {
        window.location.href = `/events/${filteredEvents[0].id}/dashboard`;
      } else {
        // If no events left, could navigate to a welcome page or event creation
        window.location.href = '/profile';
      }

      return filteredEvents;
    });
  };

  const contextValue: EventsContextType = {
    events,
    addEvent,
    updateEvent,
    deleteEvent,
    isLoading,
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
