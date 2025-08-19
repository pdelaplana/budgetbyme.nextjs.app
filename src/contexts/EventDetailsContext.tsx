'use client';

import type React from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { useEvents } from '@/contexts/EventsContext';
import type { Event } from '@/types/Event';

interface EventDetailsContextType {
  // Core event data
  event: Event | null;
  isEventLoading: boolean;
  eventError: string | null;
  
  // Related data (future expansion)
  expenses: any[];
  categories: any[];
  
  // Loading states
  isExpensesLoading: boolean;
  isCategoriesLoading: boolean;
  
  // Operations
  refreshEvent: () => Promise<void>;
  updateEvent: (updates: Partial<Event>) => Promise<void>;
  
  // Future operations (placeholders)
  addExpense: (expense: any) => Promise<void>;
  updateExpense: (id: string, updates: any) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  
  addCategory: (category: any) => Promise<void>;
  updateCategory: (id: string, updates: any) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
}

const EventDetailsContext = createContext<EventDetailsContextType | undefined>(undefined);

interface EventDetailsProviderProps {
  children: React.ReactNode;
}

export function EventDetailsProvider({ children }: EventDetailsProviderProps) {
  const { selectedEvent, isLoadingSelectedEvent, refetch } = useEvents();
  
  // Local state for event details
  const [event, setEvent] = useState<Event | null>(null);
  const [eventError, setEventError] = useState<string | null>(null);
  
  // Related data (future implementation)
  const [expenses, setExpenses] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  
  // Loading states
  const [isExpensesLoading, setIsExpensesLoading] = useState(false);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(false);
  
  // Sync with EventsContext selectedEvent
  useEffect(() => {
    setEvent(selectedEvent);
    setEventError(null);
    
    // Clear related data when event changes
    if (selectedEvent?.id !== event?.id) {
      setExpenses([]);
      setCategories([]);
    }
  }, [selectedEvent, event?.id]);
  
  // Future: Load related data when event changes
  useEffect(() => {
    if (event?.id) {
      // TODO: Load expenses and categories for this event
      // loadEventRelatedData(event.id);
    }
  }, [event?.id]);
  
  const refreshEvent = async () => {
    try {
      await refetch();
    } catch (error) {
      setEventError(error instanceof Error ? error.message : 'Failed to refresh event');
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
  
  // Future operation placeholders
  const addExpense = async (expense: any) => {
    // TODO: Implement expense operations
    console.log('Add expense:', expense);
  };
  
  const updateExpense = async (id: string, updates: any) => {
    // TODO: Implement expense operations
    console.log('Update expense:', id, updates);
  };
  
  const deleteExpense = async (id: string) => {
    // TODO: Implement expense operations
    console.log('Delete expense:', id);
  };
  
  const addCategory = async (category: any) => {
    // TODO: Implement category operations
    console.log('Add category:', category);
  };
  
  const updateCategory = async (id: string, updates: any) => {
    // TODO: Implement category operations
    console.log('Update category:', id, updates);
  };
  
  const deleteCategory = async (id: string) => {
    // TODO: Implement category operations
    console.log('Delete category:', id);
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
    
    // Operations
    refreshEvent,
    updateEvent,
    
    // Future operations
    addExpense,
    updateExpense,
    deleteExpense,
    addCategory,
    updateCategory,
    deleteCategory,
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