'use client';

import { useCallback } from 'react';
import { addEvent, type AddEventDto } from '@/server/actions/events';
import type { Event } from '@/types/Event';
import {
  type UseServerActionReturn,
  useServerAction,
} from '../common/useServerAction';

export interface UseAddEventReturn
  extends Omit<UseServerActionReturn<[AddEventDto], Event>, 'execute'> {
  addEvent: (eventData: AddEventDto) => Promise<Event | null>;
  reset: () => void;
}

/**
 * Custom hook for adding new events
 *
 * @example
 * ```tsx
 * const { addEvent, isLoading, error, lastResult } = useAddEvent();
 *
 * const handleSubmit = async (formData: AddEventFormData) => {
 *   const eventDto: AddEventDto = {
 *     userId: user.id,
 *     name: formData.name,
 *     type: formData.type,
 *     description: formData.description,
 *     eventDate: formData.eventDate,
 *     totalBudgetedAmount: formData.budget,
 *     currency: formData.currency,
 *     status: 'on-track'
 *   };
 *
 *   const result = await addEvent(eventDto);
 *   if (result) {
 *     // Handle success - redirect or show success message
 *     router.push(`/events/${result.id}`);
 *   }
 * };
 * ```
 */
export function useAddEvent(): UseAddEventReturn {
  const { execute, isLoading, error, clearError, lastResult } = useServerAction(
    addEvent,
    {
      actionName: 'addEvent',
      enableLogging: true,
      enableSentry: true,
      retryCount: 1, // Retry once on failure
      retryDelay: 1000, // Wait 1 second before retry
    },
  );

  const addEventCallback = useCallback(
    async (eventData: AddEventDto): Promise<Event | null> => {
      // Validate required fields before making the call
      if (!eventData.userId?.trim()) {
        const error = 'User ID is required';
        clearError(); // Clear any previous errors
        throw new Error(error);
      }
      if (!eventData.name?.trim()) {
        const error = 'Event name is required';
        clearError();
        throw new Error(error);
      }
      if (!eventData.eventDate) {
        const error = 'Event date is required';
        clearError();
        throw new Error(error);
      }
      if (eventData.totalBudgetedAmount < 0) {
        const error = 'Budget amount cannot be negative';
        clearError();
        throw new Error(error);
      }
      if (!eventData.currency?.trim()) {
        const error = 'Currency is required';
        clearError();
        throw new Error(error);
      }
      if (!eventData.type?.trim()) {
        const error = 'Event type is required';
        clearError();
        throw new Error(error);
      }

      return await execute(eventData);
    },
    [execute, clearError],
  );

  const reset = useCallback(() => {
    clearError();
  }, [clearError]);

  return {
    addEvent: addEventCallback,
    isLoading,
    error,
    clearError,
    lastResult,
    reset,
  };
}

/**
 * Hook variant that includes success callback
 */
export function useAddEventWithCallback(
  onSuccess?: (event: Event) => void,
  onError?: (error: string) => void,
): UseAddEventReturn {
  const hook = useAddEvent();

  const addEventWithCallback = useCallback(
    async (eventData: AddEventDto): Promise<Event | null> => {
      try {
        const result = await hook.addEvent(eventData);

        if (result && onSuccess) {
          onSuccess(result);
        }

        return result;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to add event';

        if (onError) {
          onError(errorMessage);
        }

        throw error;
      }
    },
    [hook.addEvent, onSuccess, onError],
  );

  return {
    ...hook,
    addEvent: addEventWithCallback,
  };
}
