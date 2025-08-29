'use client';

import type React from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useEvents } from '@/contexts/EventsContext';
import { useFetchCategories } from '@/hooks/categories';
import { useFetchExpenses } from '@/hooks/expenses';
import type { BudgetCategory } from '@/types/BudgetCategory';
import type { Event } from '@/types/Event';
import type { Expense } from '@/types/Expense';

interface EventDetailsContextType {
  // Core event data
  event: Event | null;
  isEventLoading: boolean;
  eventError: string | null;

  // Related data
  expenses: Expense[];
  categories: BudgetCategory[];

  // Loading states
  isExpensesLoading: boolean;
  isCategoriesLoading: boolean;
  categoriesError: string | null;
  expensesError: string | null;

  // Operations
  refreshEvent: () => Promise<void>;
  refreshCategories: () => Promise<void>;
  refreshExpenses: () => Promise<void>;
  updateEvent: (updates: Partial<Event>) => Promise<void>;
}

const EventDetailsContext = createContext<EventDetailsContextType | undefined>(
  undefined,
);

interface EventDetailsProviderProps {
  children: React.ReactNode;
}

export function EventDetailsProvider({ children }: EventDetailsProviderProps) {
  const { selectedEvent, isLoadingSelectedEvent, refetch } = useEvents();
  const { user } = useAuth();

  // Local state for event details
  const [event, setEvent] = useState<Event | null>(null);
  const [eventError, setEventError] = useState<string | null>(null);

  // Categories data from React Query
  const {
    data: categories = [],
    isLoading: isCategoriesLoading,
    error: categoriesQueryError,
    refetch: refetchCategories,
  } = useFetchCategories(user?.uid || '', event?.id || '');

  // Expenses data from React Query
  const {
    data: expenses = [],
    isLoading: isExpensesLoading,
    error: expensesQueryError,
    refetch: refetchExpenses,
  } = useFetchExpenses(user?.uid || '', event?.id || '');

  const categoriesError = categoriesQueryError?.message || null;
  const expensesError = expensesQueryError?.message || null;

  // Sync with EventsContext selectedEvent
  useEffect(() => {
    setEvent(selectedEvent);
    setEventError(null);
  }, [selectedEvent]);

  // Categories are automatically loaded by the useFetchCategories hook
  // when user and event IDs change

  const refreshEvent = async () => {
    try {
      await refetch();
    } catch (error) {
      setEventError(
        error instanceof Error ? error.message : 'Failed to refresh event',
      );
    }
  };

  const refreshCategories = async () => {
    try {
      await refetchCategories();
    } catch (error) {
      console.error('Failed to refresh categories:', error);
    }
  };

  const refreshExpenses = async () => {
    try {
      await refetchExpenses();
    } catch (error) {
      console.error('Failed to refresh expenses:', error);
    }
  };

  const updateEvent = async (updates: Partial<Event>) => {
    if (!event) return;

    try {
      // TODO: Implement update via server action
      // await updateEventAction(event.id, updates);

      // Optimistic update
      setEvent((prev) => (prev ? { ...prev, ...updates } : null));

      // Refresh data from server
      await refreshEvent();
    } catch (error) {
      setEventError(
        error instanceof Error ? error.message : 'Failed to update event',
      );
      // Revert optimistic update on error
      setEvent(selectedEvent);
    }
  };

  const contextValue: EventDetailsContextType = {
    // Core event data
    event,
    isEventLoading: isLoadingSelectedEvent,
    eventError,

    // Related data
    expenses,
    categories,

    // Loading states
    isExpensesLoading,
    isCategoriesLoading,
    categoriesError,
    expensesError,

    // Operations
    refreshEvent,
    refreshCategories,
    refreshExpenses,
    updateEvent,
  };

  return (
    <EventDetailsContext.Provider value={contextValue}>
      {children}
    </EventDetailsContext.Provider>
  );
}

export function useEventDetails() {
  const context = useContext(EventDetailsContext);
  if (context === undefined) {
    throw new Error(
      'useEventDetails must be used within an EventDetailsProvider',
    );
  }
  return context;
}
