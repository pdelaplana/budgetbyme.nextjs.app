'use client';

import type React from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { useEvents } from '@/contexts/EventsContext';
import { useAuth } from '@/contexts/AuthContext';
import { useFetchCategories } from '@/hooks/categories';
import type { Event } from '@/types/Event';
import type { BudgetCategory } from '@/types/BudgetCategory';

interface EventDetailsContextType {
  // Core event data
  event: Event | null;
  isEventLoading: boolean;
  eventError: string | null;
  
  // Related data
  expenses: any[]; // Future: will be Expense[]
  categories: BudgetCategory[];
  
  // Loading states
  isExpensesLoading: boolean;
  isCategoriesLoading: boolean;
  categoriesError: string | null;
  
  // Operations
  refreshEvent: () => Promise<void>;
  refreshCategories: () => Promise<void>;
  updateEvent: (updates: Partial<Event>) => Promise<void>;
  
  // Future operations (placeholders for expenses)
  addExpense: (expense: any) => Promise<void>;
  updateExpense: (id: string, updates: any) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
}

const EventDetailsContext = createContext<EventDetailsContextType | undefined>(undefined);

interface EventDetailsProviderProps {
  children: React.ReactNode;
}

export function EventDetailsProvider({ children }: EventDetailsProviderProps) {
  const { selectedEvent, isLoadingSelectedEvent, refetch } = useEvents();
  const { user } = useAuth();
  
  // Local state for event details
  const [event, setEvent] = useState<Event | null>(null);
  const [eventError, setEventError] = useState<string | null>(null);
  
  // Related data (future implementation for expenses)
  const [expenses, setExpenses] = useState<any[]>([]);
  const [isExpensesLoading, setIsExpensesLoading] = useState(false);
  
  // Categories data from React Query
  const {
    data: categories = [],
    isLoading: isCategoriesLoading,
    error: categoriesQueryError,
    refetch: refetchCategories,
  } = useFetchCategories(user?.uid || '', event?.id || '');
  
  const categoriesError = categoriesQueryError?.message || null;
  
  // Sync with EventsContext selectedEvent
  useEffect(() => {
    setEvent(selectedEvent);
    setEventError(null);
    
    // Clear expenses data when event changes (categories are handled by React Query)
    if (selectedEvent?.id !== event?.id) {
      setExpenses([]);
    }
  }, [selectedEvent, event?.id]);
  
  // Categories are automatically loaded by the useFetchCategories hook
  // when user and event IDs change
  
  const refreshEvent = async () => {
    try {
      await refetch();
    } catch (error) {
      setEventError(error instanceof Error ? error.message : 'Failed to refresh event');
    }
  };
  
  const refreshCategories = async () => {
    try {
      await refetchCategories();
    } catch (error) {
      console.error('Failed to refresh categories:', error);
    }
  };
  
  const updateEvent = async (updates: Partial<Event>) => {
    if (!event) return;
    
    try {
      // TODO: Implement update via server action
      // await updateEventAction(event.id, updates);
      
      // Optimistic update
      setEvent(prev => prev ? { ...prev, ...updates } : null);
      
      // Refresh data from server
      await refreshEvent();
    } catch (error) {
      setEventError(error instanceof Error ? error.message : 'Failed to update event');
      // Revert optimistic update on error
      setEvent(selectedEvent);
    }
  };
  
  // Future operation placeholders (expenses only)
  const addExpense = async (expense: any) => {
    // TODO: Implement expense operations when expense system is ready
    console.log('Add expense:', expense);
  };
  
  const updateExpense = async (id: string, updates: any) => {
    // TODO: Implement expense operations when expense system is ready
    console.log('Update expense:', id, updates);
  };
  
  const deleteExpense = async (id: string) => {
    // TODO: Implement expense operations when expense system is ready
    console.log('Delete expense:', id);
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
    
    // Operations
    refreshEvent,
    refreshCategories,
    updateEvent,
    
    // Future operations (expense placeholders)
    addExpense,
    updateExpense,
    deleteExpense,
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
    throw new Error('useEventDetails must be used within an EventDetailsProvider');
  }
  return context;
}